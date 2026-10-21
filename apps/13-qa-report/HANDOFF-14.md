# HANDOFF-14 — 给 14-publish 的验收结论与行动清单

> 来自：**13-qa-curation**（全作品试玩验收与差异审计）
> 交付物：`QA-MATRIX.md`（作品 × 维度矩阵）、`issues.json`（逐条可执行修复建议）、`DIFF-AUDIT.md`（原创与许可）、`evidence/`（原始实测数据）、`screenshots/`（截图证据）
> 本任务**不执行**任何 GitHub 写入；部署归 14-publish。

---

## 一、三类名单

### 🟢 可上线（浏览器实测通过，无阻塞项）

| 作品 | 结论 | 备注 |
| --- | --- | --- |
| **00-research** | ✅ pass | 134 条案例逐条带来源与归属证据；8 条正确排除出 M3.1 Flash 归属；23 条指标不可见者明确标注；零编造数字。**但 `references/mia-100-html/` 不得发布**（见下方红线） |
| **01-web** | ✅ pass | 唯一 warning 经复核为 marquee 滚动条的预期设计，非缺陷 |
| **11-era-online** | ✅ pass | 零 console error、零 404、子路径全通、197 个可聚焦元素、8/8 焦点态可见 |

### 🟡 建议修复后上线（有明确修复建议，改动量小）

| 作品 | 问题 | 级别 | 修复要点 |
| --- | --- | --- | --- |
| **02-model** | 随包 `models/*.glb` 未进入构建产物，部署后 404 | major | 移到 `public/models/`，或加复制步骤 |
| **02-model** | 使用《沙丘》专有地名 **Arrakis** | major | 换原创地名（如「赭原 · OCHRE BASIN」），清掉源码注释中的 Dune 表述 |
| **02-model** | 缺 `README.md` / `manifest.json` | major | 补齐（`manifest.json` 字段见下方模板） |
| **02-model** | 移动端 30 处文字被压成逐字换行；注释标签被裁切 | major | 收窄面板时给标签设 `white-space: nowrap`；给注释层加视口内翻转逻辑 |
| **04-spaceflight** | `STATUS.md` 声称 README/QA/截图/实机验证完成，实际全不存在 | critical | 先修 blocker，再据实补齐文件并改回真实状态 |
| **04-spaceflight** | 全局 `preventDefault('Tab')` + Tab 改绑星图 → 键盘不可达 | major | 移除 Tab 拦截，星图只留 `M` |
| **06-museum-core** | 运行时 `fetch('data/catalog.json')` 必定 404 | major | 同步脚本即使 05 未就绪也写一个合法空目录 |
| **06-museum-core** | 移动端 `.topnav` 撑破视口 → 整页横向滚动 121px | major | ≤680px 断点让 `.topnav` 可横向滚动或收紧间距 |

### 🔴 暂不上线

| 作品 | 原因 |
| --- | --- |
| **04-spaceflight** | **Blocker**：`src/gfx/Procedural.js:297` 的 `makeRingTexture()` 漏写 `const data = img.data;`，第 332–335 行直接写 `data[idx]` → `ReferenceError` → `game.init()` 失败，**游戏完全无法启动**（dev 与 build 都失败，已提交的 `dist/` 同样是坏的）。修复只需补一行 |
| **03-interaction** | 施工中，尚未产出 `index.html` |
| **05-museum-research** | 缺 `catalog.json`（条目数与逐条来源未落盘） |
| **07-museum-art** | 缺 `index.html`（资产包已在） |
| **08 / 09 / 10 / 12** | 以实测结果为准，见 `QA-MATRIX.md`（第 2 轮实测中） |

---

## 二、🚫 发布红线（务必遵守）

### 1. `00-research/references/mia-100-html/` 不得发布

该目录是克隆自 `MiaAI-Lab/MiniMax-M3.1-Flash-100-HTML-Files` 的 **100 个单文件 HTML + 完整原始提示词**。
该仓库**没有 LICENSE**，按著作权默认「保留所有权利」处理。
`00-research/manifest.json` 已把它标为 `reference-only`、说明「仅可作结构与提示词参考，禁止复制文件内容」。

> **请在打包时排除此目录。** 它只能留在本地作为研究参考。

### 2. 不要在站点文案里写「按 TOP3 复刻」

`00-research/TOP3.md` 是研究阶段产出的**候选**改编规格（`NIMBUS·7` / `TIDAL DRIFT` / `HELIOS SPECIMEN`），
而实际交付的作品是 `CHROMA S1`（01）/ `MECH-SANDWORM 1312M`（02）/ `深空漫游`（04）。
`MASTER-UPDATE.md` 的硬性要求是「参考机制与质量、重新设计名称/文案/内容/字体/配色/布局/模型形态」，**并非**要求采用 TOP3 名单；
各作品均为原创设计，无逐帧复制。

> 若 `TOP3.md` 随站点发布，请在页面或文档中注明「这是研究阶段的候选规格，实际交付物以各作品 README 为准」，
> 否则会形成新的虚假声明。

### 3. 不要按 `STATUS.md` 的声明判断完成度

`04-spaceflight/STATUS.md` 声称 README/QA/截图/实机验证全部完成，**实际一个都不存在**。
请以 `issues.json` 与磁盘实况为准，不要照抄任何任务的 `STATUS.md`。

### 4. 全部站点必须保持子路径可用

所有作品在实测中均以 `/playtime-atlas-20261021/exhibits/<id>/` 前缀访问。
`04-spaceflight` 的 `index.html` 源码里写的是 `<script src="/src/main.js">`（绝对路径），
**Vite 构建时会重写为相对路径**（`dist/index.html` 实测为 `./assets/index-*.js`）—— 直接部署源码目录会 404，请统一部署 `dist/`。

---

## 三、manifest.json 模板

批次统一要求每个任务提供 `manifest.json`，字段为 `id / title / description / entry / buildCommand / outputDir / status`。
已交付的：`00-research` ✅、`06-museum-core` ✅。**其余 11 个任务均未提供**，请向对应实现者催交，或由 14-publish 统一生成占位（并在站点上明确标注「产物说明待补」）。

```json
{
  "id": "<task-dir>",
  "title": "<作品名>",
  "description": "<一句话说明，含玩法与特色>",
  "entry": "index.html",
  "buildCommand": "npm run build",
  "outputDir": "dist",
  "status": "ready"
}
```

---

## 四、部署后请逐项复验

上线后请在**真实线上 URL** 上复核以下 8 项（harness 已具备该能力，只需把 base URL 换成线上地址）：

1. 页面能打开，控制台零 error
2. 网络面板零 404
3. 桌面 1440×900 无横向滚动
4. 移动 390×844 无横向滚动
5. 刷新后 localStorage 存档仍在
6. Tab 可移动焦点且有可见焦点环
7. 3D 作品的 GLB 导出可下载且文件非空
8. 子路径下 iframe 内嵌的展厅能正常加载

复验命令模板（harness 已就绪）：

```bash
cd 13-qa-curation/qa-harness
# 把 targets.mjs 里的 mount 改成线上路径，或临时加一个 target
node run-qa.mjs --target=02-model
```

---

## 五、数据引用方式

| 需要什么 | 读哪里 |
| --- | --- |
| 某件作品能不能上 | `QA-MATRIX.md` → 对应作品小节的「总览」行 |
| 某个维度为什么没过 | `QA-MATRIX.md` → 该维度行的结论列（含实测数字） |
| 怎么修 | `issues.json` → 对应 issue 的 `fixSuggestion`（含可直接粘贴的代码片段） |
| 复现步骤 | `issues.json` → 对应 issue 的 `repro` |
| 原始证据 | `evidence/<target>.json`（build 日志、逐项 check、console/网络记录） |
| 截图 | `screenshots/<target>-{desktop,mobile,probe}.png` |
| 原创性与许可 | `DIFF-AUDIT.md` |
| 完整问题清单（按严重级排序） | `issues.json` → `counts` 字段 |

`issues.json` 为机器可读 JSON，每条含：
`id / target / dimension / title / severity / status / detail / repro / evidence / fixSuggestion / source / detectedAt`。

---

*本文件在第 2 轮实测完成后已按最新 `evidence/` 更新。*
