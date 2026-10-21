#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_manifest.py — 生成 17 号任务的 manifest.json。

记录本目录每一个交付文件的路径、角色、字节数与 sha256，便于 14-publish 核对
「发布时带上了哪些东西」，也便于 13-qa 确认没有夹带未授权素材。

用法：python3 scripts/build_manifest.py
"""
from __future__ import annotations

import hashlib
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 相对路径 → (角色, 消费方)
ROLES = {
    "PROMPT.md": ("任务书（只读输入）", ["—"]),
    "TASK.md": ("任务定义、字段规格与验收标准", ["18", "19", "16", "13", "14"]),
    "STATUS.md": ("阶段状态、决策与限制记录", ["15-supervisor", "13", "14"]),
    "README.md": ("本目录导览与使用说明", ["18", "19", "16", "13", "14"]),
    "LICENSES.md": ("来源许可与素材使用边界", ["16", "19", "13", "14"]),
    "QA.md": ("验收结果与测试证据", ["13", "14"]),
    "REFERENCES.md": ("交互可视化项目台账（18 个，含许可结论）", ["18", "19", "16"]),
    "REFERENCE-NOTES.md": ("olek.si 实测观察记录", ["16", "19"]),
    "INTERACTION-BRIEF.md": ("交互机制规格书", ["18", "19", "16", "13"]),
    "SOURCES.md": ("逐条来源台账", ["19", "13", "14"]),
    "catalog.json": ("建筑案例主目录（42 条）", ["19", "18", "13"]),
    "catalog.meta.json": ("词表、统计、字段说明与限制", ["19", "18", "16", "13"]),
    "glossary.json": ("术语表（74 条）", ["19", "18", "16"]),
    "manifest.json": ("本清单", ["14", "13"]),
    "handoff/first-18.json": ("给 19 号的首批 18 例", ["19"]),
    "handoff/first-18-ids.json": ("首批 18 例的 id 列表", ["19"]),
    "handoff/structure-groups.json": ("给 18 号的构造分组（21 组）", ["18"]),
    "handoff/VERIFIED-VS-ASSUMED.md": ("逐条「已核验 / 有分歧 / 假设」对照表", ["18", "19", "13"]),
    "handoff/verification-status.json": ("机器可读的核验状态表", ["18", "19", "13"]),
    "handoff/FIELD-MAPPING.md": ("字段映射说明（cases[] 语义 + 19 适配指引）", ["19", "18", "16", "13"]),
    "handoff/field-mapping.json": ("机器可读字段映射表", ["19", "18", "13"]),
    "src/catalog-page/build-catalog-page.mjs": ("成果页构建脚本（产出 dist/catalog.html）", ["14"]),
    "src/catalog-page/catalog.css": ("成果页样式（全部走 var(--ds-*)，无硬编码色值字体）", ["16", "14"]),
    "src/catalog-page/assets/ds/tokens.css": ("16 设计系统令牌（vendored，OFL 字体自托管）", ["16", "14"]),
    "src/catalog-page/assets/ds/components.css": ("16 设计系统组件样式（vendored）", ["16", "14"]),
    "src/catalog-page/assets/ds/fonts/fonts.css": ("自托管字体声明（vendored）", ["16", "14"]),
    "src/catalog-page/assets/ds/fonts/FONT-MANIFEST.json": ("字体清单（vendored）", ["16", "14"]),
    "src/catalog-page/assets/ds/ASSET-SOURCE.json": ("vendored 资源的来源与许可登记", ["13", "14"]),
    "dist/catalog.html": ("研究成果页（中英双语，42 案例 / 74 术语 / 21 构造）", ["14", "19", "13"]),
    "dist/catalog.css": ("研究成果页样式表", ["14", "13"]),
    "scripts/build_catalog.py": ("目录生成脚本（唯一数据源）", ["—"]),
    "scripts/build_glossary.py": ("术语表生成脚本", ["—"]),
    "scripts/build_manifest.py": ("本清单生成脚本", ["—"]),
    "scripts/validate_catalog.py": ("交付物校验脚本", ["13", "14"]),
    "scripts/capture.sh": ("headless Chrome 截图脚本（内置重试退避）", ["—"]),
    "scripts/extract_tokens.js": ("从生产 bundle 提取设计令牌", ["16"]),
    "scripts/verify_unesco.js": ("UNESCO 编号批量校验（本机网络不通，实测未生效）", ["—"]),
    "scripts/repair_quotes.py": ("中文引号修复工具（历史遗留）", ["—"]),
    "scripts/fix_tuple_quotes.py": ("中文引号修复工具（历史遗留）", ["—"]),
    "scripts/normalize_quotes.py": ("中文引号修复工具（历史遗留）", ["—"]),
    "scripts/final_quotes.py": ("中文引号修复工具（历史遗留）", ["—"]),
    "data/olek-index.js": ("olek.si 生产 bundle 快照（取证用）", ["16"]),
    "data/olek-tokens.json": ("从 bundle 提取的设计令牌", ["16"]),
    "data/olek-css-blocks.txt": ("bundle 内 CSS 块", ["16"]),
    "data/olek-index.html": ("olek.si 站点 head 快照", ["16"]),
    "data/unesco-cn.html": ("UNESCO 中国缔约国页面快照", ["13"]),
    "data/unesco-verified.tsv": ("UNESCO 编号核验记录", ["13"]),
    "data/unesco-cn-verified.tsv": ("UNESCO 批量校验输出（本机网络不通，留空）", ["13"]),
    "data/validate-report.json": ("校验脚本输出的机器可读报告", ["13"]),
    "screenshots/INDEX.tsv": ("截图索引", ["16"]),
    "PUBLISH-EXCLUDE.txt": ("发布前必须排除的路径清单（供 14-publish 机械拦截）", ["14"]),
    "scripts/build_unesco_verified.py": ("UNESCO 官方编号映射生成脚本", ["—"]),
    "research-ref/README.md": ("隔离区说明：参考站观察证据，非本项目产物", ["13"]),
    "research-ref/olek-index.js": ("参考站生产 bundle 快照（**不发布**）", ["16"]),
    "research-ref/olek-css-blocks.txt": ("参考站 CSS 块快照（**不发布**）", ["16"]),
    "research-ref/olek-tokens.json": ("参考站设计令牌记录（**不发布**，机制参考用）", ["16"]),
    "research-ref/unesco-cn.html": ("UNESCO 页面快照（**不发布**）", ["13"]),
    "research-ref/unesco-verified.tsv": ("UNESCO 批量校验失败日志（**不发布**）", ["13"]),
    "data/unesco-cn-verified.tsv": ("UNESCO 官方编号映射（本项目自产）", ["13", "19"]),
    "data/validate-report.json": ("校验报告（本项目自产）", ["13"]),
}

# 目录级说明
DIR_ROLES = {
    "research-ref/": "参考站观察证据隔离区（**不进入交付物、不进入公开仓库**）",
    "screenshots/": "olek.si 实拍截图（内部观察证据，不随站点再分发）",
    "evidence/": "本任务自产实测证据（浏览器测试报告 + 成果页截图，不随站点发布）",
    "scripts/": "可复现脚本",
    "data/": "取证原始材料与派生数据",
    "handoff/": "下游交接切片",
    "src/": "成果页源码（构建用；产物在 dist/）",
    "dist/": "成果页构建产物（**应发布**，由 14-publish 以 page 类型接入）",
}

SKIP_NAMES = {".DS_Store"}  # 另见 collect() 中的点文件过滤
SKIP_EXTS = {".pyc", ".pyo"}

# 前缀兜底规则：显式 ROLES 未覆盖时按路径前缀推断角色
PREFIX_ROLES = [
    ("src/catalog-page/assets/ds/fonts/", ("自托管字体文件 / 许可文本（vendored，OFL）", ["16", "14"])),
    ("src/catalog-page/assets/ds/", ("16 设计系统 vendored 资源", ["16", "14"])),
    ("dist/assets/ds/fonts/", ("自托管字体文件 / 许可文本（构建产物，OFL）", ["16", "14"])),
    ("dist/assets/ds/", ("16 设计系统资源（构建产物）", ["16", "14"])),
    ("dist/", ("研究成果页构建产物（应发布）", ["14", "13"])),
    ("src/", ("成果页源码（构建用，不进站点产物树）", ["14"])),
    ("screenshots/", ("olek.si 实拍截图（内部观察证据，不发布）", ["16"])),
    ("evidence/", ("本任务自产实测证据（浏览器测试报告 + 成果页截图）", ["13"])),
    ("scripts/", ("可复现脚本", ["—"])),
    ("research-ref/", ("参考站观察证据隔离区（**不发布**）", ["13"])),
    ("handoff/", ("下游交接切片", ["18", "19"])),
]


def role_of(rel: str) -> tuple[str, list[str]]:
    if rel in ROLES:
        return ROLES[rel]
    for prefix, role in PREFIX_ROLES:
        if rel.startswith(prefix):
            return role
    return ("本目录产物", ["14"])


def sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def collect() -> list[str]:
    out = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if not d.startswith(".") and d != "__pycache__"]
        for fn in sorted(filenames):
            if fn in SKIP_NAMES or fn.startswith("."):
                continue
            if os.path.splitext(fn)[1].lower() in SKIP_EXTS:
                continue
            rel = os.path.relpath(os.path.join(dirpath, fn), ROOT)
            out.append(rel)
    return sorted(out)


def main() -> int:
    files = []
    for rel in collect():
        p = os.path.join(ROOT, rel)
        role, consumers = role_of(rel)
        if rel == "manifest.json":
            # 自身大小自指不可行，先按不存在处理，写入前再补
            files.append({
                "path": rel, "role": role, "consumers": consumers,
                "bytes": None, "sha256": None,
            })
            continue
        files.append({
            "path": rel,
            "role": role,
            "consumers": consumers,
            "bytes": os.path.getsize(p),
            "sha256": sha256(p),
        })

    catalog = json.load(open(os.path.join(ROOT, "catalog.json"), encoding="utf-8"))
    meta = json.load(open(os.path.join(ROOT, "catalog.meta.json"), encoding="utf-8"))
    glossary = json.load(open(os.path.join(ROOT, "glossary.json"), encoding="utf-8"))
    sgroups = json.load(open(os.path.join(ROOT, "handoff", "structure-groups.json"), encoding="utf-8"))
    first18 = json.load(open(os.path.join(ROOT, "handoff", "first-18.json"), encoding="utf-8"))

    # 发布排除清单：直接读 PUBLISH-EXCLUDE.txt，保证与文本清单同源
    exclude_dirs, exclude_files = [], []
    excl_path = os.path.join(ROOT, "PUBLISH-EXCLUDE.txt")
    if os.path.exists(excl_path):
        with open(excl_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("EXCLUDE_DIR "):
                    exclude_dirs.append(line.split(None, 1)[1].strip())
                elif line.startswith("EXCLUDE_FILE "):
                    exclude_files.append(line.split(None, 1)[1].strip())

    manifest = {
        "schemaVersion": "1.0",
        "id": "17-architecture-research",
        "task": "17-architecture-research",
        "kind": "research-package",
        "title": "中国经典建筑与传统结构联网研究",
        "titleEn": "Web Research on Chinese Traditional Architecture and Structures",
        "description": (
            "为「构筑华夏 / Built in China」主站与 3D 教学模型提供可核验的研究底稿："
            "42 条中国经典建筑案例（8 大区 / 7 时代 / 10 民族 / 19 省域 / 21 类构造），"
            "每条含中英名称、地域、年代与不确定性、建筑类型、结构原理、文化背景、"
            "逐条来源链接与「教学示意、非施工/工程模型」声明；"
            "74 条术语表（构件 / 连接 / 屋面 / 结构体系 / 形制礼制 / 材料做法 / 桥与基础 / 民族与地方类型）；"
            "18 个真实既有交互可视化项目台账（含网址、作者、交互方式、模型格式与许可），"
            "并从中选出 3 个机制优秀案例供改编；"
            "另交付中英双语研究成果页（dist/catalog.html）。"
        ),
        "status": "complete",
        "entry": "dist/catalog.html",
        "buildCommand": "node src/catalog-page/build-catalog-page.mjs",
        "outputDir": "dist",
        "dataEntry": "catalog.json",
        "entryFiles": [
            "dist/catalog.html",
            "dist/catalog.css",
            "src/catalog-page/build-catalog-page.mjs",
            "src/catalog-page/catalog.css",
            "src/catalog-page/assets/ds/tokens.css",
            "src/catalog-page/assets/ds/components.css",
            "src/catalog-page/assets/ds/fonts/fonts.css",
            "catalog.json",
            "catalog.meta.json",
            "glossary.json",
            "INTERACTION-BRIEF.md",
            "REFERENCES.md",
            "SOURCES.md",
            "LICENSES.md",
            "QA.md",
        ],
        "rebuildCommands": {
            "catalog": "python3 scripts/build_catalog.py",
            "glossary": "python3 scripts/build_glossary.py",
            "unesco": "python3 scripts/build_unesco_verified.py",
            "verification": "python3 scripts/build_verification_status.py",
            "manifest": "python3 scripts/build_manifest.py",
            "qa": "python3 scripts/build_qa.py",
            "validate": "python3 scripts/validate_catalog.py",
            "catalogPage": "node src/catalog-page/build-catalog-page.mjs",
        },
        "generatedAt": "2026-10-21T22:10:00+08:00",
        "generator": "scripts/build_manifest.py",
        "scope": "本目录只包含研究底稿与可复现脚本；不含任何第三方图片素材，不做发布动作。",
        "publishOwner": "14-publish（本任务不建仓、不 push、不部署）",
        "dataset": {
            "cases": len(catalog["cases"]),
            "structureTypes": meta["counts"]["structureTypes"],
            "structureGroups": len(sgroups["groups"]),
            "glossaryTerms": glossary["termCount"],
            "regions": meta["counts"]["regions"],
            "eras": meta["counts"]["eras"],
            "ethnicGroups": meta["counts"]["ethnicGroups"],
            "provinces": meta["counts"]["provinces"],
            "independentSources": meta["counts"]["sources"],
            "firstBatchForAtlas": len(first18["cases"]),
        },
        "consumers": {
            "18-architecture-models": ["catalog.json", "glossary.json", "handoff/structure-groups.json", "INTERACTION-BRIEF.md", "REFERENCES.md"],
            "19-architecture-atlas": ["catalog.json", "catalog.meta.json", "glossary.json", "handoff/first-18.json", "handoff/first-18-ids.json", "INTERACTION-BRIEF.md", "SOURCES.md"],
            "16-design-system": ["catalog.meta.json", "glossary.json", "REFERENCE-NOTES.md", "INTERACTION-BRIEF.md", "LICENSES.md"],
            "13-qa-curation": ["QA.md", "catalog.json", "SOURCES.md", "INTERACTION-BRIEF.md", "manifest.json"],
            "14-publish": ["manifest.json", "LICENSES.md", "QA.md", "catalog.json", "catalog.meta.json", "glossary.json"],
        },
        "publish": {
            "owner": "14-publish（唯一 git 写入者与发布者）",
            "buildType": "page（14 侧应以 buildCommand 构建本目录的 dist/，而非 static 直拷）",
            "standaloneSite": False,
            "notStandaloneSiteNote": (
                "17 不部署独立站点：面向读者的主站是 19-architecture-atlas「构筑华夏 / Built in China」。"
                "本任务的 dist/catalog.html 是研究成果页（研究目录 / 案例总览），"
                "由 14-publish 按 page 类型构建并挂到站点的 research 路径；"
                "主站正文仍由 19 消费 catalog.json / catalog.meta.json / glossary.json 自行渲染。"
            ),
            "conflict": "14-publish/release/scripts/build.mjs 的静态分支 keepDirs 含 'data'，与本目录 LICENSES.md 的「data/ 不随站点发布」直接冲突。",
            "resolution": "发布方须在 work.build.exclude 中显式加入 'data'，或对 dist/ 做断言校验。",
            "excludeListFile": "PUBLISH-EXCLUDE.txt",
            "excludeDirs": exclude_dirs,
            "excludeFiles": exclude_files,
            "includeDirs": ["dist"],
            "includeDirsNote": "dist/ 是应发布的构建产物，不得排除；src/ 是构建源码，不进站点产物树。",
            "notForPublishNote": "research-ref/ 与 screenshots/ 内的文件是他人站点内容的抓取快照，著作权归原站作者，不得进入公开仓库。",
        },
        "directoryRoles": DIR_ROLES,
        "fileCount": len(files),
        "totalBytes": sum(f["bytes"] or 0 for f in files),
        "files": files,
    }

    out = os.path.join(ROOT, "manifest.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    # 补齐自身条目
    manifest["files"] = [
        {**e, "bytes": os.path.getsize(out), "sha256": sha256(out)} if e["path"] == "manifest.json" else e
        for e in manifest["files"]
    ]
    manifest["totalBytes"] = sum(e["bytes"] or 0 for e in manifest["files"])
    with open(out, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"manifest.json     : {manifest['fileCount']} 个文件 / {manifest['totalBytes']} 字节")
    print(f"dataset           : {manifest['dataset']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
