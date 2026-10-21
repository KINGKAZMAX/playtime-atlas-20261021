# MiniMax 大厅改版闭环（minimax-gallery-loop）

一套**有限轮次**的自动改版控制器：每轮让真实 MiniMax（推理强度 max）审查并修复
`hall/` 与四个相关脚本，然后由控制器刷新主页数据、跑发布检查；
模型明确给出收敛结论**且**检查通过才提前停止。

本脚本**不发布**：不 commit、不 push、不写 cron/launchd/heartbeat。
发布动作由主控另行执行。

---

## 1. 快速开始

`bash
# 默认 3 轮
scripts/minimax-gallery-loop.sh

# 只跑 1 轮
scripts/minimax-gallery-loop.sh --once

# 最多 5 轮
scripts/minimax-gallery-loop.sh --rounds 5

# 只审查不修改（模型以只读沙箱运行，不 refresh，只输出审查状态）
scripts/minimax-gallery-loop.sh --review-only

# 另指定仓库根目录
scripts/minimax-gallery-loop.sh --root /path/to/repo
`

| 选项 | 含义 |
| --- | --- |
| `--rounds N` | 最多跑 N 轮，默认 3，上限 20（超出直接报错退出） |
| `--once` | 等价于 `--rounds 1` |
| `--review-only` | 只读审查：模型以 `-s read-only` 运行，**不修改文件、不 refresh**，只产出审查结论与检查状态 |
| `--root DIR` | 目标仓库根目录，默认是本脚本所在目录的上一级 |
| `-h, --help` | 显示帮助 |

模型 CLI 固定为 `/Users/mekzenx2/.local/bin/codex-minimax`，可用环境变量
`MINIMAX_CODEX_BIN` 覆盖（仅用于离线 fixture 验证）。实际调用形式：

`bash
codex-minimax exec -C <ROOT> -s danger-full-access -c 'model_reasoning_effort="max"' -o <final.txt>
`

`--review-only` 时沙箱换成 `read-only`，提示词里也明确禁止任何写操作。

---

## 2. 前置条件：工作区必须干净

启动前用 NUL 安全的 `git status --porcelain -z --untracked-files=all` 判定，
**有任何未提交或未跟踪改动就直接退出**（退出码 1，状态 `dirty`）：

> 原因：本仓库可能同时有主控或其他作者在改。脏工作区上跑自动改版，
> 容易把别人的成果覆盖掉。自动化执行前，请由主控先提交现有结果再启动本脚本。

脚本**不会**执行 reset / checkout / clean 之类会丢弃用户工作的操作。

---

## 3. 互斥锁与日志

- 状态目录：`git rev-parse --git-path gallery-loop`（位于 git 内部，天然不污染 tracked 文件，
  无需改 .gitignore）。
- 锁：优先 `flock`；本机没有 flock 时用 `mkdir` 原子锁（`<状态目录>/lock.d`）。
  锁覆盖整个运行期，退出时用 trap 清理。已有锁时脚本**可靠退出（退出码 75，状态 locked）**，
  不会踩掉别的运行。
- 每次运行一个批次目录 `run-<时间戳>-<pid>/`，每轮一个子目录 `round-N/`，内含：
  - `prompt.md` —— 本轮给模型的完整提示词；
  - `final.txt` —— 模型最终回复（`-o` 落盘，不从日志里猜）；
  - `log.txt` —— 模型执行日志；
  - `refresh.json` —— 本轮 refresh 输出（review-only 模式没有）；
  - `check.json` —— 本轮 gallery-check 的机器可读结果。
- 批次内另有 `rounds.jsonl`（每轮一行）；汇总状态 `<状态目录>/state.json` 记录最近一次运行的每轮轮次 / 退出码 / 状态 / 起止时间。

---

## 4. 收敛语义（重要）

只有**同时**满足下面两条才算收敛，并提前结束：

1. 模型的**最终回复**里出现**整行**为 `CONVERGED` 的那一行；
2. `node scripts/gallery-check.mjs --root .` 退出码为 0。

判定只读 `final.txt`（`-o` 落盘的最终回复），**不会**去日志里搜提示词的
`CONVERGED`；并且提示词里逐字出现的同一行会被排除，避免把提示词当成模型结论。
未收敛时，模型应输出 `NEEDS_WORK` 并列出遗留问题。

---

## 5. 失败状态与退避

| 状态 | 含义 | 退出码 |
| --- | --- | --- |
| `converged` | 收敛标记 + 检查通过 | 0 |
| `exhausted` | 轮次用完仍未收敛 | 1 |
| `check-failed` | 模型跑完但检查没过（最后一轮） | 1 |
| `refresh-failed` | refresh 失败（数据没刷新成功）；即便旧 docs 的检查通过也不收敛 | 1 |
| `model-failed` | 模型调用本身失败（最后一轮） | 1 |
| `aborted-env-error` | 同一环境错误连续出现两次，停止重试 | 1 |
| `locked` | 已有另一个 loop 在跑 | 75 |
| `dirty` | 起始工作区不干净 | 1 |

轮次之间按 5 秒 / 10 秒 / 20 秒（上限）退避；同一个环境错误连续两次即中止，
不盲目重试。stdout 最后一行是简短 JSON，供外部调度器读取。

---

## 6. 给模型的安全范围

只允许修改：

- `hall/`（主页与其资源）
- `scripts/refresh-gallery.mjs`
- `scripts/gallery-check.mjs`
- `scripts/minimax-gallery-loop.sh`
- `scripts/minimax-gallery-loop.md`

禁止：改 `apps/`、`docs/`（尤其 `docs/works` 快照）、`works.json`、
`package.json`、`.gitignore` 与其他脚本；禁止安装依赖；禁止读取或打印凭据；
禁止 commit / push；禁止调用本脚本自身；禁止自行运行 refresh（`docs` 刷新由控制器执行）。

---

## 7. 发布由主控负责

本版本**不实现** `--publish`：传入该参数会直接报错退出（退出码 2）。
主控负责：先跑 loop → 确认 `state.json` 为 `converged` → 自行提交并推送
（`docs/works` 快照不参与提交）。

---

## 8. 外部自动化调用

由 Codex 官方自动化（或其他调度器）调用本脚本，不要在脚本里另建定时器：

`bash
# 每日一次，最多 5 轮
scripts/minimax-gallery-loop.sh --rounds 5

# 只做一次只读审查
scripts/minimax-gallery-loop.sh --review-only
`

配合主控的提交动作时，顺序是：**先提交现有结果 → 再跑 loop → 检查 state.json →
再由主控提交本轮成果**。loop 自身永远不碰 git 历史。
