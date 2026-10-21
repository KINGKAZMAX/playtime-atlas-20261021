#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
validate_catalog.py — 17 号任务的交付物校验。

逐条检查本目录的产物是否满足 TASK.md 的验收标准；任何一项 FAIL 时退出码为 1。

用法：python3 scripts/validate_catalog.py            # 打印结果
      python3 scripts/validate_catalog.py --json     # 机器可读
"""
from __future__ import annotations

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 官方 UNESCO 中国世界遗产编号：单一数据源 = data/unesco-cn-verified.tsv
# （由 scripts/build_unesco_verified.py 从官方 GeoJSON 端点整理，2026-10-21 实测）
def load_unesco_ids() -> set[int]:
    path = os.path.join(ROOT, "data", "unesco-cn-verified.tsv")
    ids: set[int] = set()
    if not os.path.exists(path):
        return ids
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line or line.startswith("#"):
                continue
            head = line.split("\t")[0].strip()
            if head.isdigit():
                ids.add(int(head))
    return ids


UNESCO_CN_IDS = load_unesco_ids()

# 已登记的 http 来源例外（实测 https 变体在本机 TLS 握手失败，http 返回 200）
HTTP_SOURCE_EXCEPTIONS = {
    "http://www.zhongguowenwubao.com/portal/DigitPager/paperDetail/publishdate/2023-01-03/paperId=19603/id/100942":
        "https 变体本机不可用（curl SSL_ERROR_SYSCALL；Ego Chromium net::ERR_CONNECTION_CLOSED），"
        "http 变体 Ego 实测加载成功（标题「中国文物报-2023-01-03-0版-」）；已登记保留，不伪造 https",
    "http://www.zhongguowenwubao.com/portal/DigitPager/paperDetail/publishdate/2025-09-02/paperId=21802/id/109014":
        "https 变体本机不可用（curl SSL_ERROR_SYSCALL；Ego Chromium net::ERR_CONNECTION_CLOSED），"
        "http 变体 Ego 实测加载成功（标题「中国文物报-2025-09-02-0版-」）；已登记保留，不伪造 https",
    "http://www.ncha.gov.cn/art/2010/5/24/art_1027_106086.html":
        "https 变体本机不可用（curl SSL_ERROR_SYSCALL；Ego Chromium net::ERR_CONNECTION_CLOSED），"
        "http 变体 Ego 实测加载成功（标题「燕赵都市报：「河北最具影响力十大文物景观」评选活动启动」）；已登记保留，不伪造 https",
}

# 允许存在于 data/ 的本项目自产文件（其余一律视为第三方抓取件，应已隔离）
DATA_ALLOWED = {"unesco-cn-verified.tsv", "validate-report.json"}

REQUIRED_CASE_FIELDS = [
    "id", "nameZh", "nameEn", "pinyin", "region", "regionZh", "regionEn",
    "province", "locality", "era", "eraZh", "eraEn", "yearText",
    "yearUncertainty", "type", "structureTypes", "ethnicGroup",
    "principleZh", "principleEn", "cultureZh", "cultureEn",
    "culturalKeywords", "sources", "imagePlan", "verification", "caveat",
]

CJK = re.compile(r"[一-鿿]")
LATIN = re.compile(r"[A-Za-z]")

# ---------------------------------------------------------------------------
# 浏览器入口约定（用户长期约定，2026-10-22 起对所有任务生效）
#   网页访问 / 联网检索 / 截图 / 网页调试 / 线上验收 **只走 Ego 浏览器**。
#   禁用：内置 Browser 工具、Playwright / Puppeteer / Chromium.launch()、
#         本机无头 Chrome + 原生 CDP。
# 下面的断言用于**机器校验**该约定在本目录内确实成立。
# ---------------------------------------------------------------------------

# 已按约定停用并移除的浏览器脚本（若再出现即视为违规）
RETIRED_BROWSER_SCRIPTS = [
    "scripts/browser_test.mjs",
    "scripts/capture_cdp.mjs",
    "scripts/capture.sh",
]

# 必须走 Ego 的网页脚本
EGO_SCRIPTS = [
    "scripts/ego_interactions.mjs",
    "scripts/ego_capture.mjs",
    "scripts/ego_ref_metrics.mjs",
]

# 禁用技术的**启动调用**特征（只匹配可执行调用，不会命中文档散文）
BANNED_BROWSER_CALLS = [
    (r"chromium\s*\.\s*launch\s*\(", "chromium.launch()"),
    (r"puppeteer\s*\.\s*launch\s*\(", "puppeteer.launch()"),
    (r"playwright[\w.]*\s*\(", "playwright() 调用"),
    (r"require\s*\(\s*['\"]playwright", "require('playwright')"),
    (r"from\s+['\"]playwright", "import from 'playwright'"),
    (r"npx\s+playwright", "npx playwright"),
    (r"require\s*\(\s*['\"]puppeteer", "require('puppeteer')"),
    (r"--headless", "--headless 启动参数"),
    (r"--remote-debugging-port", "--remote-debugging-port 启动参数"),
    (r"devtools/browser", "原生 CDP devtools 端点"),
    (r"/devtools/page", "原生 CDP devtools 页面端点"),
    (r"chrome-headless-shell", "chrome-headless-shell"),
    (r"Google Chrome\.app/Contents/MacOS", "直接启动本机 Chrome 可执行文件"),
]

# 需要扫描的可执行脚本目录
BROWSER_SCAN_DIRS = ["scripts", "src"]
BROWSER_SCAN_EXTS = {".mjs", ".js", ".cjs", ".py", ".sh", ".bash"}


def strip_comments(text: str) -> str:
    """去掉注释与文档串，只留可执行代码，避免散文里的关键词造成误判。"""
    text = re.sub(r"/\*[\s\S]*?\*/", " ", text)          # /* ... */
    text = re.sub(r"^\s*//.*$", " ", text, flags=re.M)   # // ...
    text = re.sub(r"^\s*#(?!!).*$", " ", text, flags=re.M)  # # ...（保留 #!）
    text = re.sub(r"\"\"\"[\s\S]*?\"\"\"", " ", text)     # Python docstring
    text = re.sub(r"'''[\s\S]*?'''", " ", text)
    return text


def scan_banned_browser_calls() -> list[str]:
    """扫描可执行脚本中的禁用浏览器技术启动调用。

    跳过本文件自身：它必须字面写出这些禁用特征作为匹配模式，
    否则会把自己判为违规（自指误报）。本文件内容由人工审阅。
    """
    self_rel = os.path.relpath(os.path.abspath(__file__), ROOT)
    hits: list[str] = []
    for d in BROWSER_SCAN_DIRS:
        base = os.path.join(ROOT, d)
        if not os.path.isdir(base):
            continue
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [x for x in dirnames if not x.startswith(".") and x != "node_modules"]
            for fn in sorted(filenames):
                if os.path.splitext(fn)[1].lower() not in BROWSER_SCAN_EXTS:
                    continue
                p = os.path.join(dirpath, fn)
                rel = os.path.relpath(p, ROOT)
                if rel == self_rel:
                    continue
                try:
                    code = strip_comments(open(p, encoding="utf-8").read())
                except (OSError, UnicodeDecodeError):
                    continue
                for pat, label in BANNED_BROWSER_CALLS:
                    if re.search(pat, code):
                        hits.append(f"{rel} → {label}")
    return hits


class Result:
    def __init__(self) -> None:
        self.items: list[dict] = []

    def add(self, group: str, name: str, ok: bool, detail: str = "") -> bool:
        self.items.append({
            "group": group, "name": name,
            "status": "PASS" if ok else "FAIL", "detail": detail,
        })
        return ok

    @property
    def failed(self) -> list[dict]:
        return [i for i in self.items if i["status"] == "FAIL"]

    def dump(self) -> None:
        group = None
        for i in self.items:
            if i["group"] != group:
                group = i["group"]
                print(f"\n── {group} " + "─" * max(0, 58 - len(group)))
            mark = "✓" if i["status"] == "PASS" else "✗"
            line = f"  {mark} {i['name']}"
            if i["detail"]:
                line += f"  —  {i['detail']}"
            print(line)
        print(f"\n合计 {len(self.items)} 项：通过 {len(self.items) - len(self.failed)}，失败 {len(self.failed)}")


def load_json(rel: str):
    path = os.path.join(ROOT, rel)
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def check_quotes(res: Result, label: str, text: str) -> None:
    """检查中文引号成对，避免 Python 相邻字符串拼接把引号吃掉。"""
    if text.count("「") != text.count("」"):
        res.add("文本完整性", f"{label} 引号成对", False,
                f"「×{text.count('「')} 」×{text.count('」')}")
        return
    if text.count("“") != text.count("”"):
        res.add("文本完整性", f"{label} 弯引号成对", False,
                f"“×{text.count('“')} ”×{text.count('”')}")
        return
    res.add("文本完整性", f"{label} 引号成对", True)


def meta_teach_ok(catalog: dict) -> bool:
    """teachingNotice 必须带中英标签与 mustNotClaim 清单，供下游透传。"""
    for c in catalog.get("cases", []):
        tn = c.get("teachingNotice", {})
        if not (tn.get("labelZh") and tn.get("labelEn")
                and tn.get("forceNoteZh") and tn.get("forceNoteEn")
                and isinstance(tn.get("mustNotClaim"), list) and tn["mustNotClaim"]):
            return False
    return True


def main() -> int:
    res = Result()
    manifest = load_json("manifest.json")  # 提前载入：隔离检查需要读 publish.exclude*

    # ---------------------------------------------------------- 1. 目录存在性
    required_files = [
        "TASK.md", "STATUS.md", "README.md", "LICENSES.md", "QA.md",
        "REFERENCES.md", "REFERENCE-NOTES.md", "INTERACTION-BRIEF.md",
        "SOURCES.md", "catalog.json", "catalog.meta.json", "glossary.json",
        "manifest.json", "scripts/build_catalog.py", "scripts/build_glossary.py",
        "scripts/validate_catalog.py", "handoff/first-18.json",
        "handoff/first-18-ids.json", "handoff/structure-groups.json",
        "handoff/FIELD-MAPPING.md", "handoff/field-mapping.json",
        "handoff/VERIFIED-VS-ASSUMED.md", "handoff/verification-status.json",
        "src/catalog-page/build-catalog-page.mjs", "src/catalog-page/catalog.css",
        "dist/catalog.html", "dist/catalog.css", "dist/favicon.svg",
        "scripts/build_field_mapping.py",
        "scripts/ego_interactions.mjs", "scripts/ego_capture.mjs",
        "scripts/ego_ref_metrics.mjs",
    ]
    missing = [f for f in required_files if not os.path.exists(os.path.join(ROOT, f))]
    res.add("文件齐备", "必备文件全部存在", not missing,
            "缺失：" + ", ".join(missing) if missing else f"{len(required_files)} 个必备文件")

    # ---------------------------------------------------------- 2. catalog.json
    catalog = load_json("catalog.json")
    if catalog is None:
        res.add("目录数据", "catalog.json 可解析", False, "文件缺失或 JSON 错误")
        res.dump()
        return 1
    res.add("目录数据", "catalog.json 可解析", True, f"schemaVersion={catalog.get('schemaVersion')}")

    cases = catalog.get("cases", [])
    res.add("目录数据", "案例数 ≥ 36", len(cases) >= 36, f"实际 {len(cases)} 条")

    ids = [c["id"] for c in cases]
    res.add("目录数据", "案例 id 唯一", len(ids) == len(set(ids)),
            f"{len(set(ids))} 个唯一 id")

    struct_ids = set()
    for c in cases:
        for s in c.get("structureTypes", []):
            struct_ids.add(s["id"])
    res.add("目录数据", "构造类别 ≥ 12", len(struct_ids) >= 12, f"实际 {len(struct_ids)} 类")

    # ---------------------------------------------------------- 3. 逐条字段
    field_missing: list[str] = []
    empty_zh: list[str] = []
    empty_en: list[str] = []
    no_source: list[str] = []
    for c in cases:
        cid = c.get("id", "?")
        for f in REQUIRED_CASE_FIELDS:
            if f not in c:
                field_missing.append(f"{cid}.{f}")
        for f in ("nameZh", "principleZh", "cultureZh", "yearText", "caveat", "type"):
            if not c.get(f):
                empty_zh.append(f"{cid}.{f}")
        for f in ("nameEn", "principleEn", "cultureEn"):
            if not c.get(f):
                empty_en.append(f"{cid}.{f}")
        if not c.get("sources"):
            no_source.append(cid)
    res.add("字段完整性", "每条含全部必备字段", not field_missing,
            "; ".join(field_missing[:5]) if field_missing else f"{len(cases)} 条 × {len(REQUIRED_CASE_FIELDS)} 字段")
    res.add("字段完整性", "中文字段非空", not empty_zh, "; ".join(empty_zh[:5]) if empty_zh else "无空值")
    res.add("字段完整性", "英文字段非空", not empty_en, "; ".join(empty_en[:5]) if empty_en else "无空值")
    res.add("字段完整性", "每条至少 1 条来源", not no_source, "; ".join(no_source[:5]) if no_source else "全部有来源")

    cjk_bad = [c["id"] for c in cases if not CJK.search(c.get("nameZh", ""))]
    res.add("字段完整性", "中文名含中文字符", not cjk_bad, "; ".join(cjk_bad[:5]) if cjk_bad else "全部通过")
    latin_bad = [c["id"] for c in cases if not LATIN.search(c.get("nameEn", ""))]
    res.add("字段完整性", "英文名含拉丁字母", not latin_bad, "; ".join(latin_bad[:5]) if latin_bad else "全部通过")
    pinyin_bad = [c["id"] for c in cases if not re.search(r"[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]", c.get("pinyin", ""))]
    res.add("字段完整性", "拼音字段有效", not pinyin_bad, "; ".join(pinyin_bad[:5]) if pinyin_bad else "全部通过")

    # ---------------------------------------------------------- 4. 来源与 UNESCO
    all_urls = [s["url"] for c in cases for s in c["sources"]]
    unreg = sorted({u for u in all_urls
                    if not u.startswith("https://") and u not in HTTP_SOURCE_EXCEPTIONS})
    res.add("来源", "来源链接均为 https 或已登记的 http 例外", not unreg,
            "; ".join(unreg[:3]) if unreg else
            f"{len(all_urls)} 条链接 / {len(set(all_urls))} 个独立来源；http 例外 {len(HTTP_SOURCE_EXCEPTIONS)} 条已登记")
    unused_exc = sorted(set(HTTP_SOURCE_EXCEPTIONS) - set(all_urls))
    res.add("来源", "登记的 http 例外均被实际引用", not unused_exc,
            "; ".join(unused_exc[:3]) if unused_exc else "全部在用")

    unesco_used = sorted({int(m.group(1)) for u in all_urls
                          for m in [re.search(r"whc\.unesco\.org/en/list/(\d+)/", u)] if m})
    bad_ids = [i for i in unesco_used if i not in UNESCO_CN_IDS]
    res.add("来源", "UNESCO 编号均在官方中国名录内", not bad_ids,
            f"用到 {len(unesco_used)} 个编号：{unesco_used}" if not bad_ids else f"越界编号 {bad_ids}")

    levels = {s.get("evidenceLevel") for c in cases for s in c["sources"]}
    res.add("来源", "证据级别取值合法",
            levels <= {"primary-verified", "primary-cited", "secondary"}, str(sorted(levels)))

    # ---------------------------------------------------------- 5. 教学示意边界
    bad_caveat = [c["id"] for c in cases if not c.get("caveat")]
    res.add("边界声明", "每条常驻 caveat", not bad_caveat, f"{len(cases)} 条")
    ip_ok = all(c.get("imagePlan", {}).get("status") == "not-included" for c in cases)
    res.add("边界声明", "不携带第三方图片", ip_ok, "imagePlan.status = not-included")

    # ---------------------------------------------------------- 6. glossary.json
    glossary = load_json("glossary.json")
    if glossary is None:
        res.add("术语表", "glossary.json 可解析", False, "文件缺失或 JSON 错误")
    else:
        terms = glossary.get("terms", [])
        res.add("术语表", "glossary.json 可解析", True, f"{len(terms)} 条术语")
        res.add("术语表", "术语数 ≥ 40", len(terms) >= 40, f"实际 {len(terms)} 条")
        tmiss = []
        for t in terms:
            for f in ("id", "termZh", "termEn", "pinyin", "category",
                      "definitionZh", "definitionEn", "relatedCases", "relatedStructures"):
                if f not in t:
                    tmiss.append(f"{t.get('id','?')}.{f}")
        res.add("术语表", "每条含全部必备字段", not tmiss, "; ".join(tmiss[:5]) if tmiss else "全部通过")
        bad_ref = sorted({cid for t in terms for cid in t.get("relatedCases", [])} - set(ids))
        res.add("术语表", "关联案例 id 全部有效", not bad_ref, "; ".join(bad_ref[:5]) if bad_ref else "全部有效")
        bad_sref = sorted({s for t in terms for s in t.get("relatedStructures", [])} - struct_ids)
        res.add("术语表", "关联构造 id 全部有效", not bad_sref, "; ".join(bad_sref[:5]) if bad_sref else "全部有效")
        covered = {cid for t in terms for cid in t.get("relatedCases", [])}
        res.add("术语表", "术语覆盖案例比例 ≥ 70%", len(covered) >= 0.7 * len(cases),
                f"{len(covered)}/{len(cases)} = {len(covered) / len(cases):.0%}")
        dup = [i for i in set(t["id"] for t in terms) if [x["id"] for x in terms].count(i) > 1]
        res.add("术语表", "术语 id 唯一", not dup, "; ".join(dup[:5]) if dup else "全部唯一")

    # ---------------------------------------------------------- 7. handoff
    h18 = load_json("handoff/first-18.json")
    h18ids = load_json("handoff/first-18-ids.json")
    sgroups = load_json("handoff/structure-groups.json")
    res.add("交接", "handoff/first-18.json 存在且 18 条",
            h18 is not None and len(h18.get("cases", [])) == 18,
            f"{len(h18.get('cases', [])) if h18 else 0} 条")
    res.add("交接", "handoff/first-18-ids.json 与 first-18.json 一致",
            h18ids is not None and h18 is not None and h18ids == [c["id"] for c in h18["cases"]],
            f"{len(h18ids) if h18ids else 0} 个 id")
    res.add("交接", "首批切片的 id 存在于 catalog",
            h18 is not None and all(c["id"] in ids for c in h18.get("cases", [])),
            "全部命中" if h18 else "缺失")
    if sgroups is None:
        res.add("交接", "handoff/structure-groups.json 存在", False, "缺失")
    else:
        groups = sgroups.get("groups", {})
        res.add("交接", "构造分组覆盖全部构造类型", set(groups) == struct_ids,
                f"{len(groups)} 组 / 构造类型 {len(struct_ids)} 类"
                + ("" if set(groups) == struct_ids else f"，差集 {sorted(struct_ids - set(groups))}"))
        incomplete = [k for k, g in groups.items()
                      if not g.get("members") or not g.get("membersEn")
                      or not g.get("assemblyOrder") or not g.get("forceNoteZh") or not g.get("forceNoteEn")]
        res.add("交接", "每组含构件中英名 / 组装顺序 / 受力说明", not incomplete,
                "; ".join(incomplete) if incomplete else f"{len(groups)} 组全部完整")
        res.add("交接", "组装顺序声明为教学示意",
                "非施工" in sgroups.get("disclaimer", ""), sgroups.get("disclaimer", "")[:40])

    # ---------------------------------------------------------- 8. 截图
    shot_dir = os.path.join(ROOT, "screenshots")
    shots = sorted(f for f in os.listdir(shot_dir) if f.endswith(".png")) if os.path.isdir(shot_dir) else []
    res.add("截图证据", "至少 3 张截图", len(shots) >= 3, f"{len(shots)} 张")
    zero = []
    for s in shots:
        size = os.path.getsize(os.path.join(shot_dir, s))
        if size <= 0:
            zero.append(s)
    res.add("截图证据", "每张截图字节数 > 0", not zero,
            "; ".join(zero) if zero else ", ".join(f"{s}={os.path.getsize(os.path.join(shot_dir, s))}B" for s in shots))
    idx = os.path.join(shot_dir, "INDEX.tsv")
    res.add("截图证据", "screenshots/INDEX.tsv 存在", os.path.exists(idx), "")

    # ---------------------------------------------------------- 8b. 隔离与教学示意
    data_dir = os.path.join(ROOT, "data")
    data_files = sorted(os.listdir(data_dir)) if os.path.isdir(data_dir) else []
    intruders = [f for f in data_files if f not in DATA_ALLOWED]
    res.add("隔离", "data/ 内无第三方抓取件", not intruders,
            "; ".join(intruders) if intruders else f"仅 {len(data_files)} 个本项目自产文件")
    res.add("隔离", "research-ref/ 隔离区存在且带说明",
            os.path.isdir(os.path.join(ROOT, "research-ref"))
            and os.path.exists(os.path.join(ROOT, "research-ref", "README.md")),
            "research-ref/README.md")
    ref_dir = os.path.join(ROOT, "research-ref")
    ref_files = sorted(f for f in os.listdir(ref_dir)
                       if f != "README.md" and not f.startswith(".")) if os.path.isdir(ref_dir) else []
    res.add("隔离", "research-ref/ 内的抓取件已被 manifest 登记为不发布",
            all(any(e["path"] == f"research-ref/{f}" for e in manifest.get("files", [])) for f in ref_files),
            f"{len(ref_files)} 个抓取件")

    tn_missing = [c["id"] for c in cases if not c.get("teachingNotice", {}).get("isSchematic")]
    res.add("教学示意", "每条 case 带 teachingNotice 标记", not tn_missing,
            "; ".join(tn_missing[:5]) if tn_missing else f"{len(cases)} 条全部带标记")
    tn_ok = (catalog.get("cases") and meta_teach_ok(catalog))
    res.add("教学示意", "teachingNotice 含中英标签与不得声称清单",
            tn_ok, "labelZh / labelEn / forceNote / mustNotClaim 齐备")

    excl_path = os.path.join(ROOT, "PUBLISH-EXCLUDE.txt")
    excl_dirs, excl_files = set(), set()
    if os.path.exists(excl_path):
        with open(excl_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("EXCLUDE_DIR "):
                    excl_dirs.add(line.split(None, 1)[1].strip())
                elif line.startswith("EXCLUDE_FILE "):
                    excl_files.add(line.split(None, 1)[1].strip())
    must_exclude = {"data", "research-ref", "screenshots", "scripts", "handoff"}
    res.add("发布边界", "PUBLISH-EXCLUDE.txt 覆盖全部敏感目录", must_exclude <= excl_dirs,
            f"已排除目录 {sorted(excl_dirs)}")
    res.add("发布边界", "manifest 与 PUBLISH-EXCLUDE.txt 同源",
            set(manifest.get("publish", {}).get("excludeDirs", [])) == excl_dirs
            and set(manifest.get("publish", {}).get("excludeFiles", [])) == excl_files,
            "manifest.publish.excludeDirs / excludeFiles 与文本清单一致")

    # ---------------------------------------------------------- 9. 文档
    refs = os.path.join(ROOT, "REFERENCES.md")
    n_proj = 0
    if os.path.exists(refs):
        with open(refs, encoding="utf-8") as f:
            body = f.read()
        n_proj = len(re.findall(r"^### R\d+", body, re.M))
    res.add("文档", "REFERENCES.md 收录 ≥ 8 个项目", n_proj >= 8, f"{n_proj} 个项目")

    for fn in ("README.md", "LICENSES.md", "QA.md", "INTERACTION-BRIEF.md", "STATUS.md"):
        p = os.path.join(ROOT, fn)
        ok = os.path.exists(p) and os.path.getsize(p) > 500
        res.add("文档", f"{fn} 存在且非空", ok,
                f"{os.path.getsize(p)} B" if os.path.exists(p) else "缺失")

    # ---------------------------------------------------------- 10. 文本完整性
    quote_bad = []
    for c in cases:
        for f in ("principleZh", "cultureZh", "caveat", "yearText"):
            t = c.get(f, "")
            if t.count("「") != t.count("」"):
                quote_bad.append(f"{c['id']}.{f}")
    res.add("文本完整性", "中文引号全部成对", not quote_bad,
            "; ".join(quote_bad[:5]) if quote_bad else f"{len(cases)} 条 × 4 字段")

    # ---------------------------------------------------------- 11. manifest
    if manifest is None:
        res.add("清单", "manifest.json 可解析", False, "缺失")
    else:
        files = manifest.get("files", [])
        res.add("清单", "manifest.json 可解析", True, f"{len(files)} 个条目")
        stale = []
        for e in files:
            p = os.path.join(ROOT, e["path"])
            if e["path"] == "manifest.json":
                # 自引用：清单写自身时大小必然变化，改为只校验「条目存在」
                if not os.path.exists(p):
                    stale.append("manifest.json（缺失）")
                continue
            if e["path"] == "data/validate-report.json":
                # 同类自引用：本脚本在结束时重写该报告，其尺寸无法在清单中稳定登记，
                # 改为只校验「条目存在」（否则报告会因文案在「一致/不一致」间摆动）
                if not os.path.exists(p):
                    stale.append("data/validate-report.json（缺失）")
                continue
            if not os.path.exists(p):
                stale.append(f"{e['path']}（缺失）")
            elif e.get("bytes") is not None and os.path.getsize(p) != e["bytes"]:
                stale.append(f"{e['path']}（大小不符）")
        res.add("清单", "manifest 记录与磁盘一致（manifest.json / validate-report.json 自身除外，自引用不可校验）", not stale,
                "; ".join(stale[:5]) if stale else f"{len(files) - 1} 个条目一致")
        on_disk = set()
        for dirpath, dirnames, filenames in os.walk(ROOT):
            dirnames[:] = [d for d in dirnames if not d.startswith(".") and d != "__pycache__"]
            for fn in filenames:
                if fn == ".DS_Store" or fn.startswith("."):
                    continue
                if os.path.splitext(fn)[1].lower() in {".pyc", ".pyo"}:
                    continue
                on_disk.add(os.path.relpath(os.path.join(dirpath, fn), ROOT))
        untracked = sorted(on_disk - {e["path"] for e in files})
        res.add("清单", "磁盘文件全部登记在 manifest", not untracked,
                "; ".join(untracked[:5]) if untracked else f"{len(on_disk)} 个文件全部登记")

    # ---------------------------------------------------------- 12. meta
    meta = load_json("catalog.meta.json")
    if meta is None:
        res.add("元数据", "catalog.meta.json 可解析", False, "缺失")
    else:
        lim = meta.get("limitations", [])
        res.add("元数据", "声明「代表性样本，非穷尽」",
                any("穷尽" in x for x in lim), f"{len(lim)} 条限制说明")
        res.add("元数据", "记录 UNESCO 编号核验方法",
                bool(meta.get("unescoIdVerification", {}).get("endpoint")),
                meta.get("unescoIdVerification", {}).get("endpoint", ""))

        # --------------------------------------- 13. 词表与案例构造 id 对齐
        vocabs = meta.get("vocabularies", {})
        vocab_structs = set(vocabs.get("structureTypes", {}).keys())
        res.add("词表对齐", "structureTypes 词表与案例使用集合 21:21 全覆盖",
                vocab_structs == struct_ids,
                f"词表 {len(vocab_structs)} 类 / 案例用 {len(struct_ids)} 类"
                + ("" if vocab_structs == struct_ids
                   else f"；词表多 {sorted(vocab_structs - struct_ids)}，案例多 {sorted(struct_ids - vocab_structs)}"))
        res.add("词表对齐", "counts.structureTypes 与词表长度一致",
                meta.get("counts", {}).get("structureTypes") == len(vocab_structs),
                f"counts={meta.get('counts', {}).get('structureTypes')} / 词表={len(vocab_structs)}")
        label_bad = []
        struct_vocab = vocabs.get("structureTypes", {})
        for c in cases:
            for s in c.get("structureTypes", []):
                v = struct_vocab.get(s["id"])
                if v is None:
                    label_bad.append(f"{c['id']}/{s['id']} 不在词表")
                elif v.get("labelZh") != s.get("labelZh"):
                    label_bad.append(f"{c['id']}/{s['id']} labelZh 与词表不一致")
        res.add("词表对齐", "案例内嵌构造标签与词表一致", not label_bad,
                "; ".join(label_bad[:5]) if label_bad else f"{len(struct_ids)} 类全部一致")
        region_bad = []
        for c in cases:
            v = vocabs.get("regions", {}).get(c.get("region"))
            if v is None:
                region_bad.append(f"{c['id']} region 不在词表")
            elif v.get("labelZh") != c.get("regionZh"):
                region_bad.append(f"{c['id']} regionZh 与词表不一致")
        res.add("词表对齐", "案例 region / regionZh 与词表一致", not region_bad,
                "; ".join(region_bad[:5]) if region_bad else "42 条全部一致")

    # ---------------------------------------------------------- 14. 成果页
    page_files = [
        "dist/catalog.html", "dist/catalog.css", "dist/favicon.svg",
        "dist/assets/ds/tokens.css", "dist/assets/ds/components.css",
        "dist/assets/ds/fonts/fonts.css",
        "src/catalog-page/build-catalog-page.mjs", "src/catalog-page/catalog.css",
        "src/catalog-page/assets/ds/ASSET-SOURCE.json",
    ]
    page_missing = [f for f in page_files if not os.path.exists(os.path.join(ROOT, f))]
    res.add("成果页", "成果页源码与构建产物齐备", not page_missing,
            "缺失：" + ", ".join(page_missing) if page_missing else f"{len(page_files)} 个文件")

    html_path = os.path.join(ROOT, "dist", "catalog.html")
    if os.path.exists(html_path):
        html = open(html_path, encoding="utf-8").read()
        n_case = html.count('class="case"')
        n_term = html.count('class="term"')
        n_struct = html.count('class="struct"')
        res.add("成果页", "案例 / 术语 / 构造三类卡片齐全",
                n_case == len(cases) and n_term > 0 and n_struct > 0,
                f"case {n_case}/{len(cases)}，term {n_term}，struct {n_struct}")
        res.add("成果页", "资源路径为相对路径（适配 Pages 子路径）",
                '"/assets/' not in html and "='/assets/" not in html and 'src="/' not in html,
                "未发现根路径写死的资源引用")
        res.add("成果页", "声明 lang 属性与双语切换容器", 'lang="zh-CN"' in html and 'data-lang=' in html, "")
        res.add("成果页", "每条案例渲染 caveat 与教学示意", html.count('class="caveat"') == len(cases),
                f"caveat 节点 {html.count('class=\"caveat\"')} / 案例 {len(cases)}")

    css_path = os.path.join(ROOT, "dist", "catalog.css")
    if os.path.exists(css_path):
        css = open(css_path, encoding="utf-8").read()
        hex_colors = re.findall(r"#[0-9a-fA-F]{3,8}\b", css)
        res.add("成果页", "页面样式不含硬编码色值（全部 var(--ds-*)）", not hex_colors,
                "; ".join(hex_colors[:5]) if hex_colors else f"{len(css)} 字节无 hex 色值")
        font_families = re.findall(r"font-family:\s*([^;]+);", css)
        bad_fonts = [f for f in font_families if "var(--ds-" not in f]
        res.add("成果页", "页面样式不写死字体族（走 var(--ds-font-*)）", not bad_fonts,
                "; ".join(bad_fonts[:3]) if bad_fonts else f"{len(font_families)} 条 font-family 全部走令牌")
        # V.12：自有 CSS 不得出现字面字体族（即使写在 var() 的 fallback 里也不允许）
        # 判据来自 16-design-system/tools/validate-tokens.mjs §6
        SYS_CJK = ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC"]
        SELF_FONTS = ["Space Grotesk", "Inter", "Space Mono"]
        literal_bad = []
        for decl in font_families:
            lits = [x.strip().strip('"').strip("'") for x in decl.split(",")]
            hit = [x for x in lits if x in SYS_CJK or x in SELF_FONTS]
            if hit:
                literal_bad.append(f"{hit[0]}（{decl.strip()[:48]}）")
        res.add("成果页", "V.12 自有 CSS 不写死字体族（含 var() fallback）", not literal_bad,
                "; ".join(literal_bad[:3]) if literal_bad else f"{len(font_families)} 条声明零字面字体族")
        # --ds-base 必须由入口 HTML 注入，不得在自有 CSS 里重复声明（V.4 同名不同义）
        css_no_comment = re.sub(r"/\*[\s\S]*?\*/", "", css)
        res.add("成果页", "--ds-base 由入口注入而非在自有 CSS 声明（V.4）",
                not re.search(r"--ds-base\s*:", css_no_comment),
                "自有 CSS 未声明 --ds-base" if not re.search(r"--ds-base\s*:", css_no_comment)
                else "自有 CSS 重复声明了 --ds-base")
        res.add("成果页", "尊重 prefers-reduced-motion", "prefers-reduced-motion" in css, "")

    # ---------------------------------------------------------- 15. manifest 必需字段
    if manifest is None:
        res.add("manifest 字段", "manifest.json 可解析", False, "缺失")
    else:
        need = ["id", "title", "description", "entry", "buildCommand", "outputDir", "status"]
        lack = [k for k in need if not str(manifest.get(k, "")).strip()]
        res.add("manifest 字段", "必需字段齐备（id/title/description/entry/buildCommand/outputDir/status）",
                not lack, "缺：" + ", ".join(lack) if lack else "7/7")
        res.add("manifest 字段", "id 与任务号一致", manifest.get("id") == "17-architecture-research",
                str(manifest.get("id")))
        res.add("manifest 字段", "entry 指向实际存在的成果页",
                manifest.get("entry") == "dist/catalog.html"
                and os.path.exists(os.path.join(ROOT, manifest.get("entry", ""))),
                str(manifest.get("entry")))
        res.add("manifest 字段", "buildCommand 指向实际存在的构建脚本",
                manifest.get("buildCommand") == "node src/catalog-page/build-catalog-page.mjs"
                and os.path.exists(os.path.join(ROOT, "src", "catalog-page", "build-catalog-page.mjs")),
                str(manifest.get("buildCommand")))
        res.add("manifest 字段", "outputDir 为 dist 且存在",
                manifest.get("outputDir") == "dist" and os.path.isdir(os.path.join(ROOT, "dist")),
                str(manifest.get("outputDir")))
        res.add("manifest 字段", "status 为已交付状态",
                manifest.get("status") in {"complete", "ready", "done"},
                str(manifest.get("status")))
        res.add("manifest 字段", "声明 kind 与非独立站点说明",
                manifest.get("kind") == "research-package"
                and bool(manifest.get("publish", {}).get("standaloneSite")) is False,
                f"kind={manifest.get('kind')}")
        res.add("manifest 字段", "发布排除清单含 src/ 且不含 dist/",
                "src" in manifest.get("publish", {}).get("excludeDirs", [])
                and "dist" not in manifest.get("publish", {}).get("excludeDirs", []),
                f"excludeDirs={manifest.get('publish', {}).get('excludeDirs')}")

    # ------------------------------------------- 16. 浏览器入口约定（Ego-only）
    retired_present = [f for f in RETIRED_BROWSER_SCRIPTS
                       if os.path.exists(os.path.join(ROOT, f))]
    res.add("浏览器入口", "已停用的无头 Chrome / 原生 CDP 脚本确已移除",
            not retired_present,
            "残留：" + ", ".join(retired_present) if retired_present
            else "browser_test.mjs / capture_cdp.mjs / capture.sh 均不存在")

    banned_hits = scan_banned_browser_calls()
    res.add("浏览器入口", "可执行脚本中无禁用浏览器技术启动调用",
            not banned_hits,
            "; ".join(banned_hits[:5]) if banned_hits
            else "无 Playwright / Puppeteer / chromium.launch / --headless / 原生 CDP 端点")

    ego_missing = [f for f in EGO_SCRIPTS if not os.path.exists(os.path.join(ROOT, f))]
    res.add("浏览器入口", "Ego 脚本齐备（交互验收 / 截图 / 参考站测量）",
            not ego_missing,
            "缺失：" + ", ".join(ego_missing) if ego_missing else f"{len(EGO_SCRIPTS)} 个脚本")

    no_ego_ref = []
    for f in EGO_SCRIPTS:
        p = os.path.join(ROOT, f)
        if not os.path.exists(p):
            continue
        code = open(p, encoding="utf-8").read()
        if "ego-browser" not in code:
            no_ego_ref.append(f)
    res.add("浏览器入口", "全部网页脚本均通过 ego-browser 入口",
            not no_ego_ref,
            "未引用：" + ", ".join(no_ego_ref) if no_ego_ref else "3/3 走 ego-browser")

    # ------------------------------------------- 17. Ego 实测证据
    ego_shared = load_json("evidence/ego/17-architecture-catalog.json")
    if ego_shared is None:
        res.add("Ego 证据", "共享工具报告存在且可解析", False, "evidence/ego/17-architecture-catalog.json 缺失")
    else:
        res.add("Ego 证据", "共享工具报告存在且可解析", True,
                f"browser={ego_shared.get('browser')}")
        vps = ego_shared.get("viewports", [])
        bad_vp = [v.get("name") for v in vps
                  if v.get("overflow") or v.get("consoleErrors", 0) > 0
                  or v.get("actualInnerWidth") != v.get("width")]
        res.add("Ego 证据", "共享工具报告 4 档视口全通过（无溢出 / 无控制台错误 / 视口精确）",
                len(vps) >= 4 and not bad_vp,
                "异常视口：" + ", ".join(map(str, bad_vp)) if bad_vp
                else f"{len(vps)} 档视口全部干净")

    ego_int = load_json("evidence/ego-interactions/catalog-interactions.json")
    if ego_int is None:
        res.add("Ego 证据", "交互类报告存在且 verdict = PASS", False,
                "evidence/ego-interactions/catalog-interactions.json 缺失")
    else:
        res.add("Ego 证据", "交互类报告存在且 verdict = PASS",
                ego_int.get("verdict") == "PASS" and ego_int.get("failed") == 0,
                f"verdict={ego_int.get('verdict')} 通过 {ego_int.get('passed')}/"
                f"{ego_int.get('total')} 警告 {ego_int.get('warned')}")

    ego_ref = load_json("evidence/ego-ref/olek-si-viewport-metrics.json")
    if ego_ref is None:
        res.add("Ego 证据", "参考站视口测量证据存在", False,
                "evidence/ego-ref/olek-si-viewport-metrics.json 缺失")
    else:
        s = ego_ref.get("summary", {})
        res.add("Ego 证据", "参考站视口测量证据存在且采样成功率 ≥ 80%",
                s.get("ok", 0) >= 0.8 * s.get("total", 1) and s.get("failed", 1) == 0,
                f"{s.get('ok')}/{s.get('total')} 视口；裁切视口 {s.get('clippedViewports')}"
                f"；横向滚动 {s.get('horizontalScrollAnywhere')}")

    # Ego 截图证据：字节数 > 0
    ego_shots = []
    for sub in ("evidence", "evidence/ego/screenshots", "evidence/ego-interactions/screenshots"):
        d = os.path.join(ROOT, sub)
        if os.path.isdir(d):
            ego_shots += [os.path.join(sub, f) for f in sorted(os.listdir(d))
                          if f.endswith(".png")]
    zero_shots = [p for p in ego_shots if os.path.getsize(os.path.join(ROOT, p)) <= 0]
    res.add("Ego 证据", "Ego 截图证据齐全且字节数 > 0",
            len(ego_shots) >= 8 and not zero_shots,
            "空文件：" + ", ".join(zero_shots) if zero_shots
            else f"{len(ego_shots)} 张 PNG 全部非空")

    res.dump()
    if "--json" in sys.argv:
        out = os.path.join(ROOT, "data", "validate-report.json")
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "w", encoding="utf-8") as f:
            json.dump({
                "checkedAt": "2026-10-21",
                "total": len(res.items),
                "passed": len(res.items) - len(res.failed),
                "failed": len(res.failed),
                "items": res.items,
            }, f, ensure_ascii=False, indent=2)
        print(f"\n报告已写入 data/validate-report.json")

    return 1 if res.failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
