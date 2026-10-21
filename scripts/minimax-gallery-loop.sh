#!/usr/bin/env bash
# =============================================================================
# MiniMax 大厅改版闭环控制器
# -----------------------------------------------------------------------------
# 每轮：真实 MiniMax(max) 审查并修复 → refresh → check
# 收敛条件：模型最终回复里出现整行收敛标记，且 gallery-check 通过。
#
# 边界：
#   · 有限轮次（默认 3，最大 20），绝不无限循环；
#   · 起始要求工作区干净（无未提交改动），避免与其他主控互相覆盖；
#   · 互斥锁：优先 flock，否则 mkdir 锁；锁目录在 git 内部，不污染 tracked 文件；
#   · 不 commit、不 push、不写 cron/launchd；发布由主控负责。
#
# 用法：scripts/minimax-gallery-loop.sh [--rounds N] [--once] [--review-only] [--root DIR]
# =============================================================================

set -uo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
ROUNDS=3
MAX_ROUNDS=20
ONCE=0
REVIEW_ONLY=0
ROOT_RAW=
ROUNDS_RAW=
CODEX_BIN=/Users/mekzenx2/.local/bin/codex-minimax
CODEX_BIN=$(printenv MINIMAX_CODEX_BIN)
if [ -z "$CODEX_BIN" ]; then CODEX_BIN=/Users/mekzenx2/.local/bin/codex-minimax; fi

emit() { printf '%s\n' "$1"; }
fail_json() {
  emit "{\"ok\":false,\"status\":\"$1\",\"message\":\"$2\"}"
  exit "$3"
}

usage() {
  cat <<'HELPEOF'
用法：scripts/minimax-gallery-loop.sh [选项]

有限轮次的 MiniMax(max) 大厅改版闭环：每轮 = 审查并修复 → refresh → check。
收敛条件：模型最终回复含整行收敛标记，且 gallery-check 通过。

选项：
  --rounds N       最多跑 N 轮（默认 3，上限 20）
  --once           等价于 --rounds 1
  --review-only    只审查不修改：模型以只读沙箱运行，不 refresh，只输出审查状态
  --root DIR       目标仓库根目录（默认：本脚本所在目录的上一级）
  -h, --help       显示本帮助

前置条件：
  · 必须在 git 仓库内；起始工作区必须干净（git status 无未提交与未跟踪改动），
    否则直接退出——请先由主控提交现有结果再运行本脚本。
  · 需要 node、git；模型调用使用 MINIMAX_CODEX_BIN（默认
    /Users/mekzenx2/.local/bin/codex-minimax），推理强度固定为 max。

日志与状态：<git rev-parse --git-path gallery-loop>/ 下，按轮次分目录存放
prompt.md / final.txt / log.txt / check.json / refresh.json，并有 state.json 汇总。

本脚本不做发布：不 commit、不 push、不改远端。发布由主控另行执行。
HELPEOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --once) ONCE=1 ;;
    --rounds) shift; ROUNDS_RAW=$1 ;;
    --rounds=*) ROUNDS_RAW=$(printf '%s' "$1" | sed 's/^--rounds=//') ;;
    --review-only) REVIEW_ONLY=1 ;;
    --root) shift; ROOT_RAW=$1 ;;
    --root=*) ROOT_RAW=$(printf '%s' "$1" | sed 's/^--root=//') ;;
    --publish) fail_json aborted "--publish 未实现：发布由主控负责，本脚本只做审查与刷新" 2 ;;
    *) fail_json usage "未知参数：$1（用 --help 查看用法）" 2 ;;
  esac
  shift
done

if [ -n "$ROOT_RAW" ]; then ROOT=$(cd "$ROOT_RAW" && pwd) || fail_json usage "--root 不是有效目录" 2; fi
if [ -n "$ROUNDS_RAW" ]; then
  case "$ROUNDS_RAW" in
    ''|*[!0-9]*) fail_json usage "--rounds 必须是正整数" 2 ;;
  esac
  ROUNDS=$ROUNDS_RAW
fi
if [ "$ONCE" = 1 ] && [ -z "$ROUNDS_RAW" ]; then ROUNDS=1; fi
if [ "$ROUNDS" -lt 1 ]; then fail_json usage "--rounds 至少为 1" 2; fi
if [ "$ROUNDS" -gt "$MAX_ROUNDS" ]; then fail_json usage "--rounds 上限为 $MAX_ROUNDS" 2; fi
if [ ! -d "$ROOT" ]; then fail_json usage "目标目录不存在：$ROOT" 2; fi

# ---------------------------------------------------------------- 锁与状态目录
GIT_PATH=$(git -C "$ROOT" rev-parse --git-path gallery-loop 2>/dev/null)
if [ -z "$GIT_PATH" ]; then fail_json usage "目标目录不在 git 仓库内：$ROOT" 2; fi
case "$GIT_PATH" in
  /*) LOCK_DIR=$GIT_PATH ;;
  *) LOCK_DIR=$ROOT/$GIT_PATH ;;
esac
mkdir -p "$LOCK_DIR" 2>/dev/null || fail_json error "无法创建状态目录：$LOCK_DIR" 1

LOCK_MODE=mkdir
if command -v flock >/dev/null 2>&1; then
  exec 9>"$LOCK_DIR/lock"
  if ! flock -n 9; then
    fail_json locked "已有另一个 gallery-loop 在运行（锁：$LOCK_DIR）" 75
  fi
  LOCK_MODE=flock
else
  if ! mkdir "$LOCK_DIR/lock.d" 2>/dev/null; then
    fail_json locked "已有另一个 gallery-loop 在运行（锁：$LOCK_DIR/lock.d）" 75
  fi
fi
cleanup() {
  if [ "$LOCK_MODE" = mkdir ]; then rmdir "$LOCK_DIR/lock.d" 2>/dev/null; fi
}
trap cleanup EXIT INT TERM

# ------------------------------------------------------------ 起始干净门槛
DIRTY=$(git -C "$ROOT" status --porcelain -z --untracked-files=all 2>/dev/null | tr '\0' '\n' | grep -v '^$' | head -20)
if [ -n "$DIRTY" ]; then
  emit "{\"ok\":false,\"status\":\"dirty\",\"message\":\"工作区存在未提交改动，拒绝启动（请先由主控提交）\"}"
  printf '%s\n' "$DIRTY"
  exit 1
fi
BRANCH=$(git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null)
if [ ! -x "$CODEX_BIN" ] && ! command -v "$CODEX_BIN" >/dev/null 2>&1; then
  fail_json usage "找不到模型 CLI：$CODEX_BIN（可用 MINIMAX_CODEX_BIN 覆盖）" 2
fi
if ! command -v node >/dev/null 2>&1; then fail_json usage "找不到 node" 2; fi

STATE=$LOCK_DIR/state.json
RUN_ID=$(date -u +%Y%m%dT%H%M%SZ)-$$
RUN_DIR=$LOCK_DIR/run-$RUN_ID
mkdir -p "$RUN_DIR" 2>/dev/null
ROUNDS_JSON=""
RECORDS=0
LOOP_STATUS=exhausted
LAST_RSTATUS=none
LOOP_OK=true
LAST_SIG=""
SIG_STREAK=0

json_str() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

write_state() {
  printf '{"ok":%s,"status":"%s","root":"%s","branch":"%s","runDir":"%s","maxRounds":%s,"records":%s,"updatedAt":"%s","rounds":[%s]}\n' \
    "$LOOP_OK" "$LOOP_STATUS" "$(json_str "$ROOT")" "$(json_str "$BRANCH")" "$(json_str "$RUN_DIR")" "$ROUNDS" "$RECORDS" \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$ROUNDS_JSON" > "$STATE"
}

# 整行匹配收敛标记；提示词里逐字出现的同一行不算（避免把提示词当成模型结论）
is_converged() {
  [ -f "$1" ] || return 1
  local line trimmed
  while IFS= read -r line || [ -n "$line" ]; do
    trimmed=$(printf '%s' "$line" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')
    [ "$trimmed" = "CONVERGED" ] || continue
    if grep -Fxq "$trimmed" "$2" 2>/dev/null; then continue; fi
    return 0
  done < "$1"
  return 1
}

write_prompt() {
  {
    printf '%s\n' "仓库根目录：$ROOT"
    printf '%s\n' "检查命令：node scripts/gallery-check.mjs --root ."
    printf '%s\n' ""
    if [ "$2" = 1 ]; then
      cat <<'REVIEWEOF'
【本次是只读审查】
禁止创建、修改、删除任何文件，禁止执行任何写操作；只做审查并输出结论。

【可读范围】整个仓库可读。重点看：hall/index.html、hall/assets/**、
scripts/refresh-gallery.mjs、scripts/gallery-check.mjs、scripts/minimax-gallery-loop.sh、
scripts/minimax-gallery-loop.md、docs/index.html、docs/data/**、根清单 works.json。

【审查口径】
1. node scripts/gallery-check.mjs 的每一项检查是否都有意义、是否有漏检或误判。
2. 主页与 hall 资源里是否残留“关于这些作品”“作品与资产”“工程构建面板”
   “BUILD BOARD”“来源许可/来源与许可/授权来源/内部台账”之类的内部文案或工程面板。
3. 公开数据是否仍带内部字段，是否把 fallback 之类的真实状态粉饰成 built。
4. 资源引用是否存在根绝对路径（/assets/ 之类），在 GitHub Pages 子路径下是否会 404。
5. refresh 是否会覆盖 docs/works、docs/data，或清空 docs；符号链接是否可能逃逸。
6. 刷新是否只复制 hall 的合法静态目录（含新的 gallery-covers），且不发布 cover-map.json 之类开发文件。

【输出约定】
- 只输出审查结论：按“必须修复 / 建议修改 / 仅供参考”分级列出，每条给出文件与原因。
- 不要输出任何改动建议之外的执行动作。
- 若审查未发现必须修复的问题，在最终回复的最后一行单独输出收敛标记 CONVERGED（整行只能有这个词）。
REVIEWEOF
    else
      cat <<'EDITEOF'
【只允许修改以下路径】
- hall/**（主页与其资源）
- scripts/refresh-gallery.mjs
- scripts/gallery-check.mjs
- scripts/minimax-gallery-loop.sh
- scripts/minimax-gallery-loop.md

【明确禁止】
- 不得修改 apps/**、docs/**（尤其 docs/works 快照）、works.json、package.json、
  .gitignore、scripts/ 下其他脚本、任何既有项目文件。
- 不得运行 npm install / npm ci / npm build，不得安装任何依赖。
- 不得读取或打印任何凭据（credentials.json、.env 等）。
- 不得 git commit / push / reset / checkout / clean。
- 不得调用 scripts/minimax-gallery-loop.sh 自身。
- 不得运行 scripts/refresh-gallery.mjs：docs 的刷新由控制器统一执行。

【工作方式】
1. 先运行 node scripts/gallery-check.mjs，看清哪些检查失败。
2. 只在允许范围内做最小必要修改：改文案、结构、样式与脚本逻辑；
   禁止为了通过检查而删除业务功能或注释掉检查项。
3. 改完再跑一次 node scripts/gallery-check.mjs 确认。

【检查口径摘要】
- 11 个公开入口与封面文件必须真实存在，路径不得是根绝对路径或含 ../
- 公开数据与主页内嵌 JSON 必须一致，且不含 source / license / build 等内部字段
- 主页与其引用的 hall 脚本、样式不得出现上述禁用文案
- 主页不得保留 id="build" 或 id="overview" 的工程面板
- 不得出现根绝对资源路径
- 发布的 hall JS、两个 mjs 语法必须通过 node --check

【输出约定】
- 若检查全部通过、且你确认没有遗留问题：在最终回复的最后一行单独输出收敛标记 CONVERGED（整行只能有这个词，不能加标点、说明或代码块标记）。
- 否则：输出 NEEDS_WORK，并用要点列出仍未解决的问题。
EDITEOF
    fi
  } > "$1"
}

for tool in refresh-gallery.mjs gallery-check.mjs; do
  if [ ! -f "$ROOT/scripts/$tool" ]; then
    fail_json usage "缺少脚本：$ROOT/scripts/$tool" 2
  fi
done

# ------------------------------------------------------------------- 轮次循环
round=1
while [ "$round" -le "$ROUNDS" ]; do
  RUNDIR=$RUN_DIR/round-$round
  mkdir -p "$RUNDIR" 2>/dev/null
  PROMPT=$RUNDIR/prompt.md
  FINAL=$RUNDIR/final.txt
  LOG=$RUNDIR/log.txt
  write_prompt "$PROMPT" "$REVIEW_ONLY"
  STARTED=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  if [ "$REVIEW_ONLY" = 1 ]; then SANDBOX=read-only; else SANDBOX=danger-full-access; fi

  "$CODEX_BIN" exec -C "$ROOT" -s "$SANDBOX" -c 'model_reasoning_effort="max"' \
    -o "$FINAL" < "$PROMPT" > "$LOG" 2>&1
  MODEL_EXIT=$?

  CONVERGED=false
  if is_converged "$FINAL" "$PROMPT"; then CONVERGED=true; fi

  REFRESH_EXIT=skipped
  if [ "$REVIEW_ONLY" != 1 ]; then
    node "$ROOT/scripts/refresh-gallery.mjs" --root "$ROOT" > "$RUNDIR/refresh.json" 2>&1
    REFRESH_EXIT=$?
  fi
  node "$ROOT/scripts/gallery-check.mjs" --root "$ROOT" > "$RUNDIR/check.json" 2>&1
  CHECK_EXIT=$?

  if [ "$MODEL_EXIT" != 0 ]; then RSTATUS=model-failed
  elif [ "$REVIEW_ONLY" != 1 ] && [ "$REFRESH_EXIT" != 0 ]; then RSTATUS=refresh-failed
  elif [ "$CHECK_EXIT" != 0 ]; then RSTATUS=check-failed
  elif [ "$CONVERGED" = true ]; then RSTATUS=converged
  else RSTATUS=needs-work; fi
  LAST_RSTATUS=$RSTATUS
  FINISHED=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  RECORD="{\"round\":$round,\"modelExit\":$MODEL_EXIT,\"refreshExit\":\"$REFRESH_EXIT\",\"checkExit\":$CHECK_EXIT,\"converged\":$CONVERGED,\"status\":\"$RSTATUS\",\"startedAt\":\"$STARTED\",\"finishedAt\":\"$FINISHED\"}"
  printf '%s\n' "$RECORD" >> "$RUN_DIR/rounds.jsonl"
  if [ "$RECORDS" -gt 0 ]; then ROUNDS_JSON=$ROUNDS_JSON,; fi
  ROUNDS_JSON=$ROUNDS_JSON$RECORD
  RECORDS=$((RECORDS + 1))

  if [ "$RSTATUS" = converged ]; then
    LOOP_STATUS=converged
    LOOP_OK=true
    write_state
    break
  fi

  # 同一环境错误连续出现两次就停，不盲目重试
  if [ "$MODEL_EXIT" != 0 ]; then
    SIG=$(printf 'exit=%s|%s' "$MODEL_EXIT" "$(tail -3 "$LOG" 2>/dev/null | tr '\n' ' ' | cut -c1-160)")
    if [ "$SIG" = "$LAST_SIG" ]; then SIG_STREAK=$((SIG_STREAK + 1)); else SIG_STREAK=1; LAST_SIG=$SIG; fi
    if [ "$SIG_STREAK" -ge 2 ]; then
      LOOP_STATUS=aborted-env-error
      LOOP_OK=false
      write_state
      break
    fi
  else
    LAST_SIG=""
    SIG_STREAK=0
  fi

  LOOP_STATUS=running
  LOOP_OK=false
  write_state

  if [ "$round" -lt "$ROUNDS" ]; then
    case "$round" in
      1) SLEEP=5 ;;
      2) SLEEP=10 ;;
      *) SLEEP=20 ;;
    esac
    sleep "$SLEEP"
  fi
  round=$((round + 1))
done

if [ "$LOOP_STATUS" != converged ]; then
  LOOP_OK=false
  if [ "$LOOP_STATUS" = running ]; then
    case "$LAST_RSTATUS" in
      refresh-failed|check-failed|model-failed) LOOP_STATUS=$LAST_RSTATUS ;;
      *) LOOP_STATUS=exhausted ;;
    esac
  fi
fi
write_state
emit "{\"ok\":$LOOP_OK,\"status\":\"$LOOP_STATUS\",\"rounds\":$RECORDS,\"run\":\"$(json_str "$RUN_DIR")\",\"state\":\"$(json_str "$STATE")\"}"
if [ "$LOOP_OK" = true ]; then exit 0; fi
exit 1
