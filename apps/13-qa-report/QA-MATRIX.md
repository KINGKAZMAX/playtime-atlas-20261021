# QA-MATRIX — 全作品 × 验收维度矩阵

> 生成时间：2026-10-21 21:04:13（UTC）
> 数据来源：`evidence/*.json`（由 `qa-harness/run-qa.mjs` 真实浏览器采集）+ 静态审计 `manual-findings.json`
> 本矩阵不包含任何推测结论。未测项一律标注原因。

## 状态图例

| 标记 | 含义 |
| --- | --- |
| ✅ | 通过（真实浏览器实测） |
| ❌ | 不通过（实测复现，已记录 issue） |
| ⚠️ | 有瑕疵但不阻塞 |
| ➖ | 不适用（已说明理由） |
| ⬜ | 未测（**不算通过**） |
| ⛔ | 未交付（目录无可运行产物） |
| 🔄 | 施工中（产物未就绪，不计通过也不计失败） |

---

## 一、总览

| 任务 | 作品 | 产物状态 | 浏览器实测 | 结论 | S 风格 | B 双语 | M 3D |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 00-research | MiniMax M3.1 Flash 全球公开案例索引 | ✅ 有可运行页面 | 已测 | **pass-with-warnings** ⚠️源码此后有改动 | ⚠️ | ➖ | ➖ |
| 01-web | 网页案例复刻（色彩光谱台） | ✅ 有可运行页面 | 已测 | **pass** | ⚠️ | ➖ | ➖ |
| 02-model | 渊甲拾遗者 AC-VII · 深海打捞机械检视台 | ✅ 有可运行页面 | 已测 | **pass-with-warnings** ⚠️源码此后有改动 | ⚠️ | ⚠️ | ✅ |
| 03-interaction | 织造车间调度台 · LOOMDECK | ✅ 有可运行页面 | 已测 | **pass** ⚠️源码此后有改动 | ⚠️ | ➖ | ➖ |
| 04-spaceflight | 深空漫游 · Deep Space Drifter | ✅ 有可运行页面 | 已测 | **pass** ⚠️源码此后有改动 | ⚠️ | ⚠️ | ➖ |
| 05-museum-research | 博物馆策展目录 · 1950s—2020s | 📄 文档型交付（按设计无 index.html） | 已测 | **pass** ⚠️源码此后有改动 | ✅ | ➖ | ➖ |
| 06-museum-core | 回响电玩馆 · PLAYTIME ATLAS 主站 | ✅ 有可运行页面 | 已测 | **pass-with-warnings** ⚠️源码此后有改动 | ⚠️ | ⚠️ | ➖ |
| 07-museum-art | 原创美术与硬件模型包 | ✅ 有可运行页面 | 已测 | **pass-with-warnings** ⚠️源码此后有改动 | ⚠️ | ⚠️ | ➖ |
| 08-era-origins | 光点年代 1950—1970s | ✅ 有可运行页面 | 已测 | **pass** ⚠️源码此后有改动 | ⚠️ | ❌ | ➖ |
| 09-era-arcade | 霓虹街廊 1980s | ✅ 有可运行页面 | 已测 | **pass** | ⚠️ | ❌ | ➖ |
| 10-era-console | 色块远征 1990s | ✅ 有可运行页面 | 已测 | **pass-with-warnings** ⚠️源码此后有改动 | ⚠️ | ❌ | ➖ |
| 11-era-online | 联机曙光 2000s | ✅ 有可运行页面 | 已测 | **pass-with-warnings** ⚠️源码此后有改动 | ⚠️ | ➖ | ➖ |
| 12-era-modern | 万象游乐 2010s 至今 | ✅ 有可运行页面 | 已测 | **pass** ⚠️源码此后有改动 | ⚠️ | ❌ | ➖ |
| 16-design-system | 余晖设计系统 · Afterglow Design System | 📄 文档型交付（按设计无 index.html） | 已测 | **fail** | ⚠️ | ➖ | ➖ |
| 17-architecture-research | 中国经典建筑与传统结构联网研究 · 数据集 | 📄 文档型交付（按设计无 index.html） | 已测 | **pass** ⚠️源码此后有改动 | ❌ | ❌ | ➖ |
| 18-architecture-models | 榫构华夏 · 可拆解 3D 建筑结构模型 | ✅ 有可运行页面 | 已测 | **fail** ⚠️源码此后有改动 | ⚠️ | ⚠️ | ✅ |
| 19-architecture-atlas | 构筑华夏 · 双语建筑图集 + 3D 结构实验室 | ✅ 有可运行页面 | 已测 | **fail** ⚠️源码此后有改动 | ⚠️ | ⚠️ | ✅ |

> **S 风格 / B 双语 / M 3D 三列是第 3 步新增验收的独立结论**，与「结论」列**分开记账**，
> 不参与功能 verdict 的推导；逐项明细见 [`AUDIT-MATRIX.md`](./AUDIT-MATRIX.md)。

---

## 二、维度矩阵

### 00-research — MiniMax M3.1 Flash 全球公开案例索引

产物目录：`00-research/` ｜ 文件数：449 ｜ 构建命令：`python3 build_cases.py && python3 build_index.py && python3 gen_ranking.py` ｜ 验收结论：**pass-with-warnings**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ⚠️ | [desktop 布局 (1440×900)] desktop: 1 处文字被压成逐字换行: span.meta「1 条」w=21px<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 2242 个）<br>[文字重叠遮挡] mobile: 未发现文字互相压盖（按实际字形行盒判定，候选 2241 个） |
| D2 移动端 | ⚠️ | [mobile 布局 (390×844)] mobile: 1 处文字被压成逐字换行: span.meta「1 条」w=21px |
| D3 开始/暂停/重置 | ⬜ | — |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 190 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 190 个 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23fcfbf9'/%3E%3Cpath d='M8 23V9l8 9 8-9v14' fill='none' stroke='%23b4432b' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23fcfbf9'/%3E%3Cpath d='M8 23V9l8 9 8-9v14' fill='none' stroke='%23b4432b' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E），请求返回 200 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/00-research/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/00-research/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计（2026-10-21 22:3x 终审）：research 属检索类任务，不产生作品。`DIFF-REFERENCES.md` / `TOP3.md` 写明「参考机制与质量、重新设计名称/文案/内容/字体/配色/布局/模型形态」的改编规格与逐项对照，并明确不声称参考作品为原创 —— 符合 MASTER-UPDATE 的改编要求。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计（已逐条核验 134 条）：`cases.json` 每条均含 url / model_attribution.evidence_quote / observed_at / verification，无缺字段（0）、无非法 URL（0）、无「署名却无原文证据」（0）；8 条被明确排除出 M3.1 Flash 归属（未核实 / 混合模型 / 早期版本 / 端点不可达）；23 条全平台指标不可见者以 `metrics_invisible` 逐项列出；小红书登录墙记为不可见项，未编造数字。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计：manifest.json 字段齐全；`cases.json`、`RANKING.md`、`README.md`、`LICENSE.md`、`DIFF-REFERENCES.md`、`ACCEPTANCE.md`、`CHANGELOG.md` 均存在（此前缺失的 `ACCEPTANCE.md` 已补齐）。**发布红线**：`00-research/references/mia-100-html/`（100 个单文件 HTML + 完整原始提示词）来自无 LICENSE 的仓库，按著作权默认「保留所有权利」处理，该目录不得随站点发布；14-publish 的 `sync-apps.mjs` DENY 列表已包含 `references`，实测 `release/apps/00-research-dossier/` 中确实没有该目录，发布链路当前是安全的 —— 仍请 14-publish 在打包时保留该排除项。 |

### 01-web — 网页案例复刻（色彩光谱台）

产物目录：`01-web/` ｜ 文件数：92 ｜ 构建命令：`tsc --noEmit && vite build` ｜ 验收结论：**pass**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 3062字, canvas 15)<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 238 个）<br>[文字重叠遮挡] mobile: 未发现文字互相压盖（按实际字形行盒判定，候选 215 个）<br>[静态审计] **已关闭（上游修复）**。2026-10-21 21:2x 首轮实测在移动端 390×844 复现过一处真实叠印：`span.readout__k「ΔE00」` × `p#stage-hint.stage__hint「拖动旋转 · 双击复位」` 压盖 85%（559px²），裁剪截图 `screenshots/01-web-mobile-hit-1.png` 中两段文字**互相叠印、均不可读**（属真实缺陷，非假阳性）。上游随后按修复建议改造：`:134` 的 `p.stage__hint` 不再绝对定位覆盖读数区，改为进入文档流（`src/styles/layout.css:565` 起 `margin: var(--ds-space-3) 0 0; text-align: center;`），并在注释中写明「原为画布内绝对定位居中（left:50% + transform），窄屏时与画布 HUD 读数面板相交；移入文档流后两者不再有几何交集」。复测（2026-10-21 22:33 UTC）桌面与移动端均**未发现文字互相压盖**（候选 236 / 214），D1 判定为通过。该项已从问题清单移除，仅保留关闭记录。 |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 2970字, canvas 15) |
| D3 开始/暂停/重置 | ⬜ | — |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 62 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 62 个 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23FCFBF9'/%3E%3Ccircle cx='16' cy='16' r='7' fill='none' stroke='%23B4432B' stroke-width='2.5'/%3E%3C/svg%3E），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23FCFBF9'/%3E%3Ccircle cx='16' cy='16' r='7' fill='none' stroke='%23B4432B' stroke-width='2.5'/%3E%3C/svg%3E），请求返回 200<br>[静态审计] 文案复核（info，非缺陷）：色样表中有一项 `{ id: 'dune', name: '沙丘', latin: 'Dune Sand' }`。该词在本语境中是**通用材质/颜料色名**（与同表中的 Wet Asphalt、Verdigris、Titanium White、Sakura Pink、Amethyst 同类），不涉及任何受版权保护作品的角色、情节、标题或视觉形象，**不构成 IP 引用**。仅提示：若发布方希望彻底避免与同名影视作品的联想，可改名为「Sand / 沙粒」或「Dune Beige / 沙丘米」，成本极低。 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/01-web/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/01-web/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：作品为「CHROMA S1 · 千色仪」——一台光谱测色仪，12 种材质色样、测量读数、色差比对，全部自研设计（`src/content.ts` 的色样表、`src/modules/lists.ts` 的规格表）。`DESIGN-DIFF.md` 记录了与参考网页案例的逐项差异。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计：素材为程序化生成的纹理与 WebAudio 合成音，无外部图片/字体/CDN 请求（浏览器实测跨域请求 0）。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计：`manifest.json` / `STATUS.md` / `README.md` / `QA.md` 均已存在，交付完整。 |

### 02-model — 渊甲拾遗者 AC-VII · 深海打捞机械检视台

产物目录：`02-model/` ｜ 文件数：125 ｜ 构建命令：`node scripts/sync-model.mjs && vite build && node scripts/copy-docs.mjs` ｜ 验收结论：**pass-with-warnings**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 1173字, canvas 6)<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 125 个）<br>[文字重叠遮挡] mobile: 未发现文字互相压盖（按实际字形行盒判定，候选 51 个）<br>[静态审计] 复核结论（2026-10-21 22:3x）：5 处命中经 `elementsFromPoint` 取绘制层级 + 命中区域裁剪截图**逐条复核**，性质与第一轮不同 —— **不是「两段文字互相叠印、均不可读」**。命中对的两端中，被压在下层的一方**完全不出现在命中测试栈里**（`elementsFromPoint` 只返回上层的面板/页脚），即：上层是**不透明或半透明的 UI 面**（右侧剖面卡片 `section#card-long-section.card`、底部固定页脚 `footer#site-footer.ds-footer`），下层文本被它盖住。裁剪截图 `02-model-desktop-hit-1/2/3.png`、`02-model-mobile-hit-1/2.png` 中，上层文字均清晰可读，下层文字要么不可见、要么透过半透明面呈灰影。因此这 5 处应定性为**布局遮挡（内容被覆盖而丢失）**，而非叠印；上层文字的可读性未受损，故整体判定为 major 而非 blocker。 |
| D2 移动端 | ⚠️ | [mobile 布局 (390×844)] mobile: 1 个元素溢出视口: div#cycle-meter(+2626Lpx) |
| D3 开始/暂停/重置 | ✅ | [启动：程序化几何加载完成] loader 消失，场景就绪<br>[启动：技术参数回填] 6 项参数中 6 项已回填：{"spec-length":"760 m","spec-segments":"18 节","spec-tris":"104,468","spec-meshes":"548","spec-mats":"9","spec-fps":"59 fps"}<br>[启动：WebGL 场景画布挂载] renderer=ANGLE (Apple, ANGLE Metal Renderer: Apple M5, Unspecified Version)<br>[交互：机位切换] 机位按钮 6 个（测绘 SURVEY / 俯视 PLAN / 侧视 PROFILE / 磨削冠 CROWN / 矿仓 HOPPER / 随行 FOLLOW），点击后画面或激活态变化<br>[交互：参数滑块重建模型] 滑块 16 个；节数 18 节 → 19 节（重建生效或已按设计钳制）<br>[重置：RESET 生效] 重置后提示「已重置为默认参数与机位」，节数=18 节 |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 60 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 60 个 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='5' fill='%23100f0e'/%3E%3Ccircle cx='9' cy='16' r='5' fill='none' stroke='%235fa99a' stroke-width='2'/%3E%3Cpath d='M14 16h11M18 12v8M23 13v6' stroke='%23e0684a' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='5' fill='%23100f0e'/%3E%3Ccircle cx='9' cy='16' r='5' fill='none' stroke='%235fa99a' stroke-width='2'/%3E%3Cpath d='M14 16h11M18 12v8M23 13v6' stroke='%23e0684a' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/02-model/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/02-model/" 下解析成功 |
| D9 模型导出 | ✅ | [模型导出：GLB 可用] GLB 8922 KB，magic="glTF" v2，header 长度与实际一致，文件名 "abyss-salvager-ac-vii-18seg.glb"，toast="GLB 导出成功 · 8922 KB · 18 节体节 · 含教学示意声明"<br>[模型导出：随包 GLB 资源在构建产物中可用] 发现 2 个候选路径，命中 models/abyss-salvager-ac-vii.glb（9135972 字节，magic="glTF"）；构建产物内 .glb：models/abyss-salvager-ac-vii.glb |
| D10 原创差异 | ⬜ | [静态审计] 静态审计（2026-10-21 22:3x 终审）：作品为「渊甲拾遗者 AC-VII · ABYSS-CARAPACE SALVAGER」。旧版使用的《沙丘》专有地名 Arrakis 已从源码与界面中彻底移除（全仓检索仅 `CHANGELOG.md` 的差异对照表里作为「已移除项」出现）。`CHANGELOG.md` 的《对照差异说明》逐项列出参考案例与本作在名称 / 模型形态 / 术语文案 / 字体 / 配色 / 布局上的差异 —— 差异说明实体已补齐。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计：`SOURCE.md` 给出参考案例的原帖 URL、作者、粉丝数与发布时间，并用 `cdn.syndication.twimg.com` 与 `api.fxtwitter.com` 两个互相独立的公开端点交叉核对互动数字；文中明确写「本作品是原创改编，不是原案例的复制品」，并声明「不主张本作品为『全网第一』」。来源与差异说明达到本批最高水准。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计：`README.md`、`manifest.json`、`CHANGELOG.md`、`SOURCE.md` 均已存在；随包模型 `abyss-salvager-ac-vii.glb` 已移入 `public/models/`，Vite 会把它复制进构建产物，浏览器实测可取用（magic="glTF"）。 |

### 03-interaction — 织造车间调度台 · LOOMDECK

产物目录：`03-interaction/` ｜ 文件数：80 ｜ 构建命令：`npm run fonts && vite build` ｜ 验收结论：**pass**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 1021字, canvas 0)<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 197 个）<br>[文字重叠遮挡] mobile: 未发现文字互相压盖（按实际字形行盒判定，候选 196 个） |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 1008字, canvas 0) |
| D3 开始/暂停/重置 | ✅ | [进入可玩展品] 点击展品入口「开始派工」（[data-exhibit]）<br>[游戏载体存在] 找到游戏面：[data-game-root]（<div> 766×621）<br>[开始流程] 点击「开始派工」（data-control）后 state=running，进入可玩状态<br>[暂停流程] 点击「暂停当班」（data-control）后 state=paused<br>[重开流程] 点击「重置车间」（data-control）后 state=idle，回到可玩初始态<br>[难度切换] 找到难度控件（文案）并切换到「轻松」<br>[静态审计] 浏览器实测（2026-10-21 22:36 UTC 复测）：`state` 状态机完整暴露，D3 全链通过 —— 点击「开始派工」→ `state=running`；「暂停当班」→ `state=paused`；「重置车间」→ `state=idle`；难度控件可切换到「轻松」。D4 实测写入 `localStorage` 键 `loomdeck.workshop.v1`。 |
| D4 存档 | ✅ | [本地存档键] localStorage 写入 1 个键：loomdeck.workshop.v1 |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 38 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 38 个<br>[键盘焦点作用域（未聚焦不响应）] 未获得焦点时（activeElement=BODY，位于游戏区=false，游戏已冻结 state=idle）按键未驱动游戏状态，状态保持一致<br>[键盘焦点作用域（聚焦后响应）] 聚焦（root）后按键正常驱动游戏状态 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（./favicon.svg），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（./favicon.svg），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/03-interaction/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/03-interaction/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：作品为「织造车间调度台 · LOOMDECK」。`DESIGN-DIFF.md` 记录与参考交互案例的逐项差异（命名 / 视觉语言 / 布局 / 交互模型均重新设计）。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计：`LICENSES.md` 记录素材许可；`SOURCE.md` 记录来源。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计（2026-10-21 21:0x 复查）：此前缺失的 `manifest.json` / `STATUS.md` / `README.md` / `QA.md` **已全部补齐**，交付完整度问题已关闭。 |

### 04-spaceflight — 深空漫游 · Deep Space Drifter

产物目录：`04-spaceflight/` ｜ 文件数：93 ｜ 构建命令：`vite build` ｜ 验收结论：**pass**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 177字, canvas 2)<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 10 个）<br>[文字重叠遮挡] mobile: 未发现文字互相压盖（按实际字形行盒判定，候选 10 个） |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 177字, canvas 2) |
| D3 开始/暂停/重置 | ✅ | [启动：加载完成进入主菜单] loading overlay 隐藏，主菜单可见<br>[开始：进入驾驶状态] state=playing，HUD 可见=true，速度读数=0<br>[暂停：Esc 进入暂停菜单] state=paused，暂停面板可见=true<br>[继续：回到驾驶状态] state=playing<br>[重置：重置飞船] RESET 执行后飞船位置状态可读且游戏继续运行<br>[界面：星图/说明/发现记录面板均可打开且有内容] 星图5项 / 说明17项 / 记录0项<br>[静态审计] 浏览器实测（2026-10-21 22:00 UTC 复测）：D3 全链 10 项 0 失败 0 警告 —— 开始 → `state=playing`、暂停 → `state=paused`、重开 → `state=playing`；D4 实测写入 `localStorage` 键 `prismera.v1.progress`；D5 未聚焦时按键不驱动游戏、聚焦后正常驱动。 |
| D4 存档 | ✅ | [存档：设置写入 localStorage] 音量改为 33% 后 {"quality":"medium","masterVolume":0.33,"muted":false,"sensitivity":1,"invertY":false,"fov<br>[存档：发现记录写入并跨刷新存活] 写入 282 字节 / version=1，刷新后仍存在 1 条 |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 31 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 31 个<br>[键盘：焦点在表单控件时不劫持游戏键] 焦点位于 CANVAS，按键未驱动飞船位移<br>[键盘：Tab 可移动焦点且不被劫持] 暂停面板打开时按 Tab：焦点 SELECT#setQuality → INPUT#setVolume，星图未被误开（state=paused）<br>[静态审计] 浏览器实测（21:0x）：此前「Tab 被全局 preventDefault 并改绑为打开星图」的问题**已修复** —— `src/input/Input.js` 的 `_shouldPreventDefault()` 已移除 `'Tab'`，并在 keydown 入口加入焦点作用域判断（焦点位于 input/select/button/a 时把键盘完全交还给浏览器）；`src/game/Game.js` 仍保留 `case 'Tab'` 作为星图的隐藏别名，但只有焦点不在交互控件上时才会命中。 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path d='M4 16 L16 5 L28 16 L16 27 Z' fill='none' stroke='%23E0684A' stroke-width='2'/><circle cx='16' cy='16' r='3' fill='%23E0684A'/></svg>），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path d='M4 16 L16 5 L28 16 L16 27 Z' fill='none' stroke='%23E0684A' stroke-width='2'/><circle cx='16' cy='16' r='3' fill='%23E0684A'/></svg>），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/04-spaceflight/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/04-spaceflight/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：全站无任何第三方品牌 / 知名作品 IP 引用（检索 Star Wars / Star Trek / Mass Effect / Halo / NASA 等，零命中），作品名「深空漫游 / Deep Space Drifter」为原创，命名与设定自洽。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计：全部美术为运行时程序化生成，无外部素材、无 CDN、无授权素材；音频为 WebAudio 程序化合成。无可标注的第三方许可义务。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计（2026-10-21 21:0x 复查）：此前 `STATUS.md` 三处引用 `QA.md` 而实际文件名为 `qa-report.md` 的命名不一致问题**已修复** —— 目录中现在同时存在 `QA.md` 与 `qa-report.md`，引用可解析。 |

### 05-museum-research — 博物馆策展目录 · 1950s—2020s

产物目录：`05-museum-research/` ｜ 文件数：268 ｜ 构建命令：— ｜ 验收结论：**pass**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ➖ | [D1（数据集产物）] 数据集交付物无视觉界面 —— 该维度改在发布页（surface B）上验收<br>[desktop（归档目录页 · 不在线上发布） 布局 (1440×900)] desktop（归档目录页 · 不在线上发布）: 布局正常 (文本 7840字, canvas 0)<br>[文字重叠遮挡] desktop（归档目录页 · 不在线上发布）: 未发现文字互相压盖（按实际字形行盒判定，候选 444 个）<br>[文字重叠遮挡] mobile（归档目录页 · 不在线上发布）: 未发现文字互相压盖（按实际字形行盒判定，候选 444 个） |
| D2 移动端 | ➖ | [D2（数据集产物）] 数据集交付物无视觉界面 —— 该维度改在发布页（surface B）上验收<br>[mobile（归档目录页 · 不在线上发布） 布局 (390×844)] mobile（归档目录页 · 不在线上发布）: 布局正常 (文本 7840字, canvas 0) |
| D3 开始/暂停/重置 | ✅ | [策展目录页搜索可用] 输入不存在的关键词后可见条目归零，计数变为「显示 0 / 139」<br>[策展目录页年代筛选] 点击「1950—1969 早期电子」后可见条目 139 → 15，aria-pressed=true，计数「显示 15 / 139」<br>[策展目录页条目可展开] 展开首条后可见 445 字符正文，6 个字段、3 个来源链接<br>[静态审计] 浏览器实测（2026-10-21 21:55 UTC 归档能力验证，34 项 0 失败）：在临时目录用 14-publish 的 `build-catalog-page.mjs`（`PUBLISH_ARCHIVE_PAGES=1`）+ 05 当前 `catalog.json` 重建归档页后实测 —— 139 条目录全部渲染；搜索「不存在的词」后条目 139 → 0，计数同步更新；年代筛选 139 → 15 条；条目展开正常。**该能力可用，但不作为线上交付物考核**（05 已 `publish:false`）。 |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ➖ | [D5（数据集产物）] 数据集交付物无可聚焦控件 —— 该维度改在发布页（surface B）上验收<br>[键盘焦点可达性与可见性] 430 个可聚焦元素，Tab 可移动焦点，7/8 个焦点态可见<br>[键盘焦点（移动端 · 发布页）] 移动端无 Tab 环，仅统计可聚焦元素 430 个 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[策展目录：catalog.json 可取用] HTTP 200，240400 字节，JSON 可解析，共 139 条 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/05-museum-research/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/" 下解析成功<br>[策展目录页渲染] 标题「博物馆策展目录 · CATALOG | PLAYTIME ATLAS」，可见文本 7840 字符，139 个条目卡片，11 个筛选 chip<br>[策展目录页计数指示器] 计数文案「显示 139 / 139」随筛选联动 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：条目均为真实存在的历史硬件与作品，附创作者与来源 URL；`REFERENCE-DESIGN.md` 说明的是**参考的公开博物馆站点**（含各自的美术/交互/许可分析），与本作的原创设计分离陈述，不混淆。历史条目中出现的 Nintendo / Sega / Atari 等厂商名属**史实陈述**（附 Wikipedia 等来源），非品牌视觉借用。 |
| D11 来源与许可 | ✅ | [策展目录：条目字段完整性] 139 条条目，10 个必需字段缺失数 0；年代 7 个，跨度 1951—2024<br>[策展目录：逐条来源可核验] 无来源条目 0 条，非法来源 URL 0 条<br>[策展目录：图片许可逐条标注] 许可分布：no-image×81, cc-by-sa-4.0×15, public-domain×40, cc-by-4.0×3<br>[策展目录：核验记录齐备] 每条都有 verification 记录<br>[策展目录：条目 ID 唯一] 139 条，重复 ID 0 个<br>[静态审计] 静态审计 + 流水线验证：在**临时副本**中执行 `python3 scripts/build_catalog.py`，成功产出 **139 条**目录，覆盖 7 个时代，年代跨度 1951—2024。逐条核验：任务要求的 10 个字段（id / title / year / era / platform / creator / summary / significance / sourceUrls / imageLicense）**全部非空，缺失数 0**；每条另有 `sourceDetail`、`imageLicenseRaw` / `imageLicenseUrl` / `imageNote`、`verification`。核验分布：ok 132 / ok-article 6 / ok-infobox 1；图片许可分布：public-domain 40 / cc-by-sa-4.0 15 / cc-by-4.0 3 / no-image 81（无图条目明确标注，不假装有图）。**数量要求（≥70 条）与「年代/平台/史实逐项附来源」均已满足。** |
| D12 交付完整性 | ✅ | [策展目录：条目数量达标] 139 条（任务要求 ≥70），年代 7 个<br>[静态审计] 静态审计：`catalog.json`、`manifest.json`、`README.md`、`STATUS.md`、`QA.md`、`SOURCES.md`、`LICENSES.md` 均存在。**发布范围变更**：14-publish 已把「策展目录页」移出线上发布范围（`works.json` 中 05 条目 `publish: false`，生成器默认直接退出，除非显式设置 `PUBLISH_ARCHIVE_PAGES=1`）。因此 05 的线上交付物是**数据集本身**，目录页只作为仓库内资料保留 —— 本次验收据此把目录页降级为「归档能力验证」（临时目录重建 + 渲染 + 交互），不计入线上交付要求。 |

### 06-museum-core — 回响电玩馆 · PLAYTIME ATLAS 主站

产物目录：`06-museum-core/` ｜ 文件数：389 ｜ 构建命令：`vite build` ｜ 验收结论：**pass-with-warnings**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 2852字, canvas 0)<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 178 个）<br>[文字重叠遮挡] mobile: 未发现文字互相压盖（按实际字形行盒判定，候选 138 个） |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 2553字, canvas 0)<br>[2D 无障碍目录可用（3D 为可选增强）] 目录区渲染 1 个子节点 |
| D3 开始/暂停/重置 | ✅ | [主站搜索筛选生效] 目录页搜索「不存在的词」后：条目 211 → 0；计数器「共 211 件展品」→「共 0 件展品（馆藏 211 件），关键词「zzzz-不存在的条目-qqq」」<br>[主站顶部导航检索] 提交后跳转到 #/catalog?q=zzzz-%E4%B8%8D%E5%AD%98%E5%9C%A8%E7%9A%84%E6%9D%A1%E7%9B%AE-qqq，目录计数变为「共 0 件展品（馆藏 211 件），关键词「zzzz-不存在的条目-qqq」」<br>[主站年代筛选控件] 发现 211 个筛选控件：硬件设备
      195 / 游戏作品
      195 / 游戏作品
      195 / 游戏作品
      195<br>[静态审计] 浏览器实测（21:0x 复查）：此前「关键词搜索完全无效」（`readCatalogState` 返回 `q` 而 `filterExhibits` 读 `query`）**已修复** —— `readCatalogState()` 现在同时返回 `q` 与 `query`，`filterExhibits()` 读 `options.q ?? ''`；实测在 2D 无障碍目录（`#/catalog`）的 `#f-q` 输入不存在的关键词后，条目数 211 → 0，计数器同步变为「共 0 件展品（馆藏 211 件），关键词「…」」，恢复后回到 211。顶部导航检索 `#top-q`（提交式，走 `#/catalog?q=` 路由）亦实测生效。 |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 66 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 66 个 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（./art/mark.svg），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（./art/mark.svg），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[静态审计] 浏览器实测（21:0x 复查）：此前 `src/modules/theme.js` 注入的 `art/assets/fonts/fonts.css` 404 **已修复** —— `06-museum-core/public/art/assets/fonts/` 下已补上 `fonts.css`，浏览器实测同源请求 0 失败，自托管字体生效。 |
| D8 页面子路径 | ⚠️ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/06-museum-core/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/06-museum-core/" 下解析成功<br>[主站内嵌展品] 页面中没有 iframe（若为 2D 无障碍目录模式则属正常）<br>[静态审计] 浏览器实测（2026-10-21 21:55 UTC）：本轮唯一的 warn 是「页面中没有 iframe」—— 主站当前以 **2D 无障碍目录模式**呈现展品，展品内容走路由/内嵌视图而非 iframe 嵌入。**这是产品设计选择，不是缺陷**；D8 的子路径资源解析本身全部通过（`/playtime-atlas-20261021/exhibits/06-museum-core/` 下 0 失败请求）。 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：主站为原创设计（时间长廊 / 2D 无障碍目录 / 3D 展厅 / 收藏），展品文案为自撰；`public/exhibits/` 中的展厅为 08—12 任务的原创作品复制件（按 `scripts/sync-exhibits.mjs` 的契约只读复制），无未授权 ROM 或品牌视觉。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计：已建立 `scripts/sync-exhibits.mjs` 同步契约与明确的 `integrated` / `pending` 状态，缺失展厅渲染**明确占位**而非假入口。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计：`README.md` / `manifest.json` / `STATUS.md` / `ACCEPTANCE.md` / `LICENSES.md` / `SOURCES.md` / `SUBPATH-VERIFY.md` 均已存在。`manifest.json` 未声明 `QA.md`，因此不构成「声明但缺失」的不一致（`STATUS.md` 中也已如实记录这一点）。 |

### 07-museum-art — 原创美术与硬件模型包

产物目录：`07-museum-art/` ｜ 文件数：994 ｜ 构建命令：`vite build` ｜ 验收结论：**pass-with-warnings**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 5117字, canvas 1)<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 232 个）<br>[文字重叠遮挡] mobile: 未发现文字互相压盖（按实际字形行盒判定，候选 232 个） |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 5117字, canvas 1) |
| D3 开始/暂停/重置 | ✅ | [美术包七个动态区块均已渲染] 字体卡 / 图标 / 海报 / 封面 / 模型 / 降级 / 案例七个区块子元素数：font-cards=4、icon-grid=48、poster-grid=7、cover-grid=8、model-cards=6、fallback-grid=5、case-grid=6，全部非空。<br>[美术包文案占位符已全部替换] 页面上没有字面量 {count}；#cjk-count 元素存在，文本「746」；行内 <code>/<strong> 标记保留 3 / 11 处；data-i18n-rich 保护已启用。 |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 104 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 104 个 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[静态审计] **本轮实测发现真实缺陷（critical）**，详见问题清单 `D6|控制台错误`。根因在 `src/i18n.js:326-335` 的 `applyI18n()`：它对每个 `[data-i18n]` 节点执行 `node.textContent = text`，这会**清空该节点的全部子元素**。而 `index.html` 中有 11 处 `[data-i18n]` 节点内嵌了子元素（`tokens.lede` / `fonts.lede` / `icons.lede` / `posters.lede` / `models.lede` / `fallback.item1`—`item5`），其中 `fonts.lede` 内嵌了 `<strong id="cjk-count">`。i18n 一旦执行，这些子元素即被抹掉，随后 `src/main.js:176` 的 `$('#cjk-count').textContent = String(cjkCount)` 在 null 上赋值 → 抛 `TypeError`，中断 `renderFonts()`，进而中断整个后续渲染链。 |
| D7 资源 404 | ⚠️ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 页面未声明 <link rel="icon">，浏览器会自行请求 <站点根>/favicon.ico 并得到 404（线上控制台每次加载都会留下错误记录）<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 页面未声明 <link rel="icon">，浏览器会自行请求 <站点根>/favicon.ico 并得到 404（线上控制台每次加载都会留下错误记录）<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[静态审计] 浏览器实测（2026-10-21 22:03 UTC）：页面未声明 `<link rel="icon">`，浏览器自动请求 `/favicon.ico` 得到 404。桌面与移动端各记 1 条 warn —— 线上每次加载都会在控制台留下错误记录。属**低成本可修**项：加一行 `<link rel="icon" href="./mark.svg">` 即可。 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/07-museum-art/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/07-museum-art/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：全部美术资产为自研程序化生成（SVG 图标、程序化贴图、原创几何模型），`LICENSES.md` 逐项记录许可与来源。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计：`LICENSES.md` 声明素材许可（自研 / 开源 / 公有领域分类明确）。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计：`manifest.json` / `README.md` / `STATUS.md` / `QA.md` / `LICENSES.md` 均存在；构建产物含 `index.html`、`assets/`（含 `assets.manifest.json`、`fallback/*.svg`）、`models/*.json`。 |

### 08-era-origins — 光点年代 1950—1970s

产物目录：`08-era-origins/` ｜ 文件数：103 ｜ 构建命令：`vite build` ｜ 验收结论：**pass**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 7742字, canvas 3)<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 308 个）<br>[文字重叠遮挡] mobile: 未发现文字互相压盖（按实际字形行盒判定，候选 286 个） |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 7742字, canvas 3) |
| D3 开始/暂停/重置 | ✅ | [进入可玩展品] 展厅枢纽 → 子页「rally.html」（同目录共 6 个子页：rally.html, gravity.html, rally.html, gravity.html, rally.html, gravity.html）<br>[游戏载体存在] 找到游戏面：[data-game-root]（<div> 892×503）<br>[开始流程] 点击「开始对拉」（text）后 state=playing，进入可玩状态<br>[暂停流程] 点击「暂停」（data-control）后 state=paused<br>[重开流程] 点击「重开」（data-control）后 state=countdown，回到可玩初始态<br>[难度切换] 找到难度控件（data-difficulty）并切换到「初辉
轻松」 |
| D4 存档 | ✅ | [本地存档键] localStorage 写入 1 个键：lumen-era.rally.settings |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 51 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 51 个<br>[键盘焦点作用域（未聚焦不响应）] 未获得焦点时（activeElement=BODY，位于游戏区=false，游戏已冻结 state=paused）按键未驱动游戏状态，状态保持一致<br>[键盘焦点作用域（聚焦后响应）] 聚焦（root）后按键正常驱动游戏状态 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23070b1c'/%3E%3Ccircle cx='16' cy='16' r='7' fill='%2367e8f9'/%3E%3Ccircle cx='16' cy='16' r='2.5' fill='%23ffb45c'/%3E%3C/svg%3E），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23070b1c'/%3E%3Ccircle cx='16' cy='16' r='7' fill='%2367e8f9'/%3E%3Ccircle cx='16' cy='16' r='2.5' fill='%23ffb45c'/%3E%3C/svg%3E），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/08-era-origins/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/08-era-origins/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：展厅与全部展品为原创设计；`SOURCES.md` 17 条来源逐条列出机构、标题、可点击 URL、取证方式与所支撑的史实陈述；`DIFFERENCES.md` 记录逐项差异说明。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计：`README.md` 明确「本展厅是『代表性选样』，不是编年全集」；展品史料附来源，未宣称穷尽 1948—1979 的全部作品。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计（2026-10-21 21:0x 复查）：此前 manifest 声明但缺失的 `QA.md` **已补齐**，交付完整。 |

### 09-era-arcade — 霓虹街廊 1980s

产物目录：`09-era-arcade/` ｜ 文件数：91 ｜ 构建命令：`vite build` ｜ 验收结论：**pass**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 358字, canvas 1)<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 22 个）<br>[文字重叠遮挡] mobile: 未发现文字互相压盖（按实际字形行盒判定，候选 21 个） |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 370字, canvas 1) |
| D3 开始/暂停/重置 | ✅ | [进入可玩展品] 点击展品入口「晶格回廊 LATTICE CORRIDOR」（[data-exhibit]）<br>[游戏载体存在] 找到游戏面：#stage（<div> 928×558）<br>[开始流程] 未找到「开始 / 进入 / 游玩」类按钮<br>[暂停流程] 点击「暂停」（data-control）后 state=paused<br>[重开流程] 点击「重新开始」（text）后 state=playing，回到可玩初始态<br>[难度切换] no difficulty control —— 该能力是否存在本身未被证明<br>[静态审计] 浏览器实测（2026-10-21 21:58 UTC）：本作品**未暴露全局状态句柄**，因此「暂停流程」「重开流程」只做到 DOM 级断言 —— 点击「暂停 (P)」/「重新开始」后**可见面板数不变**，探针无法判定状态机是否真的迁移，两项记为 warn 而非 fail。同理 D5「聚焦后按键未观测到状态变化」也是同一原因（页面没有可观测状态可比对）。这三项属**验收能力边界**，不是作品缺陷；若要自动化判定，需要作品在 `window` 上暴露一个只读状态快照（例：`window.__neonCorridor = { get state() {…} }`）。 |
| D4 存档 | ✅ | [本地存档键] localStorage 写入 1 个键：neon-corridor.lang<br>[静态审计] 说明（**不是缺陷**）：`localStorage` 的写入发生在**游戏结算**时（`saveScore`），自动验收流程不会把游戏玩到结算，因此 D4 记为「未自动验证」而非失败；已另行核验构建产物中确实存在存储 API 调用（产品有持久化路径）。 |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 19 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 19 个<br>[键盘焦点作用域（未聚焦不响应）] 未获得焦点时（activeElement=BODY，位于游戏区=false，游戏已冻结 state=paused）按键未驱动游戏状态，状态保持一致<br>[键盘焦点作用域（聚焦后响应）] 聚焦（root）后按键正常驱动游戏状态 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（./favicon.svg），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（./favicon.svg），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/09-era-arcade/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/09-era-arcade/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：两个完整小游戏（`src/games/lattice.js` 晶格迷宫追逐、`src/games/meteor.js` 流星编队射击），命名、角色、关卡与数值全部自创；`LICENSES.md` 记录机制对照与差异说明。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计：`SOURCES.md` 附时代史料来源；像素美术与 CRT 效果为运行时生成，无外部素材。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计（2026-10-21 21:0x 复查）：此前缺失的 `STATUS.md` / `QA.md` **已补齐**；`src/ui/panels.js` 含暂停面板（「继续」/「重新开始」按钮，键盘 `P` 暂停 / `R` 重开）、设置面板（含 `data-diff` 难度切换）与成绩榜，`src/core/storage.js` 提供 `saveScore` / `loadScores` 本地存档 —— 与 PROMPT 要求的「暂停重开计分难度」一致。 |

### 10-era-console — 色块远征 1990s

产物目录：`10-era-console/` ｜ 文件数：94 ｜ 构建命令：`vite build && node scripts/inline-assets.mjs` ｜ 验收结论：**pass-with-warnings**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 5140字, canvas 40)<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 264 个）<br>[文字重叠遮挡] mobile: 未发现文字互相压盖（按实际字形行盒判定，候选 263 个） |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 5112字, canvas 40) |
| D3 开始/暂停/重置 | ✅ | [进入可玩展品] 点击展品入口「第四世代的第一台 PC Engine / Turbo」（#exhibit-grid button）<br>[游戏载体存在] 找到游戏面：main（<main> 1440×5525）<br>[开始流程] 点击「▶ 进入《棱晶峡谷》」后界面发生可见变化（可见面板 1 → 2，HUD「生命 ◆◆◆
色晶 0/3
检查点 —
第 1/3 关 · 黎明色阶
00:00.00|生命 ◆◆◆
色晶 0/3
检查点 —|生命 ◆◆◆|色晶 0/3|检查点 —|第 1/3 关 · 黎明色阶
00:00.00|第 1/3 关 · 黎明色阶|00:00.00」）—— 该作品未暴露全局状态句柄，状态机迁移只能做 DOM 级断言<br>[暂停流程] 未找到「暂停 / 继续」类按钮 —— 该能力是否存在本身未被证明<br>[重开流程] 未找到「重开 / 重来 / 重置」类按钮 —— 该能力是否存在本身未被证明<br>[难度切换] no difficulty control —— 该能力是否存在本身未被证明 |
| D4 存档 | ➖ | [本地存档键] 自动验收期间 localStorage 未写入（产品确有持久化路径：构建产物中命中 2 处存储 API 调用；写入通常发生在游戏结算/设置保存，自动流程推进不到该时刻）—— 记为「未自动验证」，不是缺陷 |
| D5 键盘焦点 | ⚠️ | [键盘焦点可达性与可见性] 46 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 46 个<br>[键盘焦点作用域（未聚焦不响应）] 页面未暴露可观测的游戏状态（window.__lumenRally 等），无法自动比对运动量；仅验证了 DOM 层面<br>[键盘焦点作用域（聚焦后响应）] HUD 为 canvas 绘制且无可聚焦 DOM 元素，键盘由 document 级监听处理（独立子站 / iframe 内不会影响父页面）—— 不计为缺陷<br>[静态审计] 浏览器实测（2026-10-21 22:03 UTC）：本轮唯一的 warn 是「页面未暴露可观测的游戏状态（window.__lumenRally 等），无法自动比对运动量；仅验证了 DOM 层面」—— 属**验收能力边界**而非缺陷；D3 开始/暂停/重开三步已通过 DOM 级断言确认界面发生可见变化（「▶ 进入《棱晶峡谷》」→ 面板 1 → 2，HUD 生命/分数可见变化）。 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23101018'/%3E%3Crect x='4' y='4' width='11' height='11' fill='%235ee0b8'/%3E%3Crect x='17' y='4' width='11' height='11' fill='%23ffd166'/%3E%3Crect x='4' y='17' width='11' height='11' fill='%23ff7a6b'/%3E%3Crect x='17' y='17' width='11' height='11' fill='%23b48aff'/%3E%3C/svg%3E），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23101018'/%3E%3Crect x='4' y='4' width='11' height='11' fill='%235ee0b8'/%3E%3Crect x='17' y='4' width='11' height='11' fill='%23ffd166'/%3E%3Crect x='4' y='17' width='11' height='11' fill='%23ff7a6b'/%3E%3Crect x='17' y='17' width='11' height='11' fill='%23b48aff'/%3E%3C/svg%3E），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/10-era-console/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/10-era-console/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：展品为原创几何与程序化美术；`LICENSES.md` 记录逐项差异说明。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计：`SOURCES.md` 明确「不宣称穷尽该时期的全部主机、掌机、附件与作品」，史料逐条附来源。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计（2026-10-21 22:0x **复查**）：此前 `manifest.json` 的 artifacts 段声明 `"qa": "QA.md"` 而磁盘上**不存在** `10-era-console/QA.md` 的不一致问题**已关闭** —— 上游已补出 `QA.md`（目录现含 README.md / STATUS.md / TASK.md / QA.md / SOURCES.md / LICENSES.md / RESTYLE-INVENTORY.md / PROMPT.md），manifest 声明与磁盘实际重新对齐。该项已从问题清单移除。 |

### 11-era-online — 联机曙光 2000s

产物目录：`11-era-online/` ｜ 文件数：127 ｜ 构建命令：`tsc --noEmit && vite build` ｜ 验收结论：**pass-with-warnings**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 10863字, canvas 3)<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 697 个）<br>[文字重叠遮挡] mobile: 未发现文字互相压盖（按实际字形行盒判定，候选 697 个） |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 10863字, canvas 3) |
| D3 开始/暂停/重置 | ⚠️ | [进入可玩展品] 点击展品入口「展项 A · 灯塔协议 BEACON PROTOCO」（#exhibits button）<br>[游戏载体存在] 找到游戏面：canvas（<canvas> 340×164）<br>[开始流程] 点击「立即开波 (Space)」后界面发生可见变化（可见面板 5 → 5，HUD「灯塔状态
晶格 Σ
305
能量 Φ
87/120
波次
1/18
灯塔耐久
100%」）—— 该作品未暴露全局状态句柄，状态机迁移只能做 DOM 级断言<br>[暂停流程] 点击「暂停 (P)」后界面无可见变化（该作品未暴露全局状态句柄，无法判定是否真的冻结）<br>[重开流程] 点击「重开」后界面发生可见变化（可见面板 5 → 5，HUD「灯塔状态
晶格 Σ
240
能量 Φ
70/120
波次
0/18
灯塔耐久
100%」）—— 未暴露全局状态句柄，做 DOM 级断言<br>[难度切换] no difficulty control —— 该能力是否存在本身未被证明<br>[静态审计] 浏览器实测（2026-10-21 21:59 UTC）：「暂停流程」记为 warn —— 点击「暂停 (P)」后可见面板数不变，且本作品未暴露全局状态句柄，无法判定是否真的冻结；「开始流程」「重开流程」已通过 DOM 级断言确认界面确实变化（HUD 晶格 Σ / 能量 Φ / 波次 / 耐久 数值改变）。属**验收能力边界**，非缺陷。 |
| D4 存档 | ➖ | [本地存档键] 自动验收期间 localStorage 未写入（产品确有持久化路径：构建产物中命中 8 处存储 API 调用；写入通常发生在游戏结算/设置保存，自动流程推进不到该时刻）—— 记为「未自动验证」，不是缺陷<br>[静态审计] 说明（**不是缺陷**）：自动验收期间 `localStorage` 未写入，但构建产物中命中 **8 处**存储 API 调用 —— 产品确有持久化路径，写入通常发生在游戏结算/设置保存，自动流程推进不到该时刻。 |
| D5 键盘焦点 | ⚠️ | [键盘焦点可达性与可见性] 199 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 199 个<br>[键盘焦点作用域（未聚焦不响应）] 页面未暴露可观测的游戏状态（window.__lumenRally 等），无法自动比对运动量；仅验证了 DOM 层面<br>[键盘焦点作用域（聚焦后响应）] HUD 为 canvas 绘制且无可聚焦 DOM 元素，键盘由 document 级监听处理（独立子站 / iframe 内不会影响父页面）—— 不计为缺陷 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23100f0e'/%3E%3Cpath d='M13 25 L14.5 11 h3 L19 25 z' fill='%23e0684a'/%3E%3Crect x='13' y='7' width='6' height='4' rx='1' fill='%23f7f4f0'/%3E%3Cpath d='M19 9 L29 4 v10 z' fill='%23e0684a' opacity='.45'/%3E%3C/svg%3E），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23100f0e'/%3E%3Cpath d='M13 25 L14.5 11 h3 L19 25 z' fill='%23e0684a'/%3E%3Crect x='13' y='7' width='6' height='4' rx='1' fill='%23f7f4f0'/%3E%3Cpath d='M19 9 L29 4 v10 z' fill='%23e0684a' opacity='.45'/%3E%3C/svg%3E），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/11-era-online/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/11-era-online/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：展项《灯塔协议 / BEACON PROTOCOL》为原创微型策略防守游戏（双资源、4 塔种 × 3 级、18 波），战场布局、数值体系与敌人构成自创；`LICENSES.md` 逐项记录与参考机制的差异。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计：**诚实红线到位** —— `HANDOFF.md` 明确「不伪称多人在线：全站为本地单机」，AI 对手带常驻徽标「本机 AI · 非真人玩家 · 无联网」，史料区另有「多人在线 = 史料描述」的专门澄清；`TASK.md` 写明「不得虚称穷尽」。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计：`manifest.json` / `README.md` / `STATUS.md` / `QA.md` / `HANDOFF.md` / `LICENSES.md` / `SOURCES.md` 均存在。 |

### 12-era-modern — 万象游乐 2010s 至今

产物目录：`12-era-modern/` ｜ 文件数：152 ｜ 构建命令：`vite build` ｜ 验收结论：**pass**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 6600字, canvas 1)<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 379 个）<br>[文字重叠遮挡] mobile: 未发现文字互相压盖（按实际字形行盒判定，候选 372 个） |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 6600字, canvas 1) |
| D3 开始/暂停/重置 | ✅ | [进入可玩展品] 点击展品入口「进入《脉冲走廊》」（[data-exhibit]）<br>[游戏载体存在] 找到游戏面：[data-game-root]（<div> 984×951）<br>[开始流程] 点击「开始」（data-control）后 state=playing，进入可玩状态<br>[暂停流程] 点击「暂停」（data-control）后 state=paused<br>[重开流程] 点击「重开」（data-control）后 state=playing，回到可玩初始态<br>[难度切换] no difficulty control —— 该能力是否存在本身未被证明<br>[静态审计] 浏览器实测（2026-10-21 22:00 UTC，28 项 0 失败 0 警告）：`state` 状态机完整暴露 —— 开始 → `state=playing`、暂停 → `state=paused`、重开 → `state=playing`；D4 实测写入 `localStorage` 键 `prismera.v1.progress`；D5 未聚焦时按键不驱动游戏（游戏保持 `state=paused`），聚焦后按键正常驱动。 |
| D4 存档 | ✅ | [本地存档键] localStorage 写入 1 个键：prismera.v1.progress |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 63 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 63 个<br>[键盘焦点作用域（未聚焦不响应）] 未获得焦点时（activeElement=BODY，位于游戏区=false，游戏已冻结 state=paused）按键未驱动游戏状态，状态保持一致<br>[键盘焦点作用域（聚焦后响应）] 聚焦（root）后按键正常驱动游戏状态 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><polygon points='16,3 28,25 4,25' fill='none' stroke='%23B4432B' stroke-width='2.2'/><polygon points='16,3 28,25 16,25' fill='none' stroke='%232C5C8F' stroke-width='1.6'/></svg>），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><polygon points='16,3 28,25 4,25' fill='none' stroke='%23B4432B' stroke-width='2.2'/><polygon points='16,3 28,25 16,25' fill='none' stroke='%232C5C8F' stroke-width='1.6'/></svg>），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/12-era-modern/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/12-era-modern/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：两个原创小游戏（节奏反应 + 空间解谜），命名、视觉、音乐全部自研；`LICENSES.md` 记录与参考机制的差异。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计：**诚实红线到位** —— 页面显著位置含「桌面端交互演示 / 不支持 VR 头显」声明，设备支持状态表如实标注「展项类型：桌面端交互演示 / VR 头显支持：不支持 / 立体渲染·手柄追踪：未实现」；`SOURCES.md` 明确「不宣称穷尽任何时代或平台」。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计：`manifest.json` / `README.md` / `STATUS.md` / `QA.md` / `LICENSES.md` / `SOURCES.md` / `handoff/PUBLISH.md` 均存在。 |

### 16-design-system — 余晖设计系统 · Afterglow Design System

产物目录：`16-design-system/` ｜ 文件数：80 ｜ 构建命令：— ｜ 验收结论：**fail**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 2815字, canvas 1)<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 198 个）<br>[文字重叠遮挡] mobile: 未发现文字互相压盖（按实际字形行盒判定，候选 201 个） |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 2815字, canvas 1) |
| D3 开始/暂停/重置 | ⬜ | — |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 58 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 58 个 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ⚠️ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 页面未声明 <link rel="icon">，浏览器会自行请求 <站点根>/favicon.ico 并得到 404（线上控制台每次加载都会留下错误记录）<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 页面未声明 <link rel="icon">，浏览器会自行请求 <站点根>/favicon.ico 并得到 404（线上控制台每次加载都会留下错误记录）<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/16-design-system/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/16-design-system/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | — |
| D11 来源与许可 | ❌ | [字体栈顺序：三处来源一致且系统 CJK 栈在前] display/text/mono 三处来源（tokens.css / design-tokens.json / FONT-MANIFEST.json）中，mono 的字体栈不一致。 |
| D12 交付完整性 | ✅ | [上游自校验：validate-tokens] 上游工具 validate-tokens 判定 PASS；断言 0 条，失败 0，警告 1。（含警告，未计入失败）<br>[上游自校验：verify-preview] 上游工具 verify-preview 判定 PASS；断言 35 条，失败 0，警告 0。<br>[设计令牌：数量与 CSS 双向一致] design-tokens.json 解析出叶子 238 个（其中 DTCG 设计令牌 213 个，其余为元数据标量）；tokens.css + components.css 声明 CSS 变量 191 个；被引用但未声明的变量 0 个；声明但取值为空的变量 0 个。<br>[交付完整性：README / manifest / LICENSES / 规范文档] README.md、manifest.json、LICENSES.md、DESIGN-SPEC.md 均存在 |

### 17-architecture-research — 中国经典建筑与传统结构联网研究 · 数据集

产物目录：`17-architecture-research/` ｜ 文件数：101 ｜ 构建命令：— ｜ 验收结论：**pass**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ➖ | [D1（数据集产物）] 数据集交付物无视觉界面 —— 该维度改在发布页（surface B）上验收 |
| D2 移动端 | ➖ | [D2（数据集产物）] 数据集交付物无视觉界面 —— 该维度改在发布页（surface B）上验收 |
| D3 开始/暂停/重置 | ⬜ | — |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ➖ | [D5（数据集产物）] 数据集交付物无可聚焦控件 —— 该维度改在发布页（surface B）上验收 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/17-architecture-research/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | — |
| D11 来源与许可 | ✅ | [数据集规模：条目 / 区域 / 结构类别 / 独立来源] 条目 42 例（要求 ≥40）；地理区域 8 个（华北/东北/华东/华中/华南/西南/西北/青藏 —— 这是**地理分区**，与「可视化项目数」不是一回事）；结构类别 21 个；时代 7 个；省份 19 个；民族 10 个；独立来源 URL 54 条（要求 ≥54）。<br>[数据集自洽性：counts 与 coverage 覆盖表] counts.structureTypes（21）与条目实际类别数（21）、coverage.byStructureType 键数（21）三者一致。<br>[条目完整性：来源 / 核验 / ID 唯一] 重复 ID 0 个；缺来源的条目 0 条；缺 verification 的条目 0 条。 |
| D12 交付完整性 | ✅ | [上游自校验：validate_catalog] 上游工具 validate_catalog 判定 PASS；断言 73 条，失败 0，警告 0。<br>[隔离区：research-ref 不在发布白名单] research-ref/ 目录存在（7 个文件），17 自带的 PUBLISH-EXCLUDE.txt 声明 EXCLUDE_DIR research-ref；14-publish 的 build.mjs 静态白名单 keepDirs = [data, public, assets, exhibits, models, fonts] **不含** research-ref —— 默认即被排除，隔离成立。⚠️ 但同一白名单**含 'data'**，而 17 的 PUBLISH-EXCLUDE.txt 要求排除 data/ —— 发布方必须显式加 exclude，不能依赖默认行为。<br>[交付完整性：README / manifest / LICENSES / QA.md] README.md、manifest.json、LICENSES.md、SOURCES.md、catalog.json、catalog.meta.json 与 QA.md 均存在 |

### 18-architecture-models — 榫构华夏 · 可拆解 3D 建筑结构模型

产物目录：`18-architecture-models/` ｜ 文件数：94 ｜ 构建命令：`vite build` ｜ 验收结论：**fail**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ❌ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 2913字, canvas 1)<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 34 个）<br>[文字重叠遮挡] mobile: 发现 3 对**文字**互相压盖: [span.anno__main「Great Block」× span.badge「Official architecture:」压盖 87% (743px²)] | [span.anno__main「Central Lower Gong」× span.badge「Mature in Tang–Song, d」压盖 96% (1405px²)] | [span.anno__main「Central Tie Beam」× span.badge.warn「Teaching diagram — not」压盖 93% (1172px²)] |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 2659字, canvas 1) |
| D3 开始/暂停/重置 | ✅ | [模型索引：左侧栏列出 6 件模型] 左侧模型索引渲染 6 项（要求 6 件可拆解 3D 教学模型）。<br>[模型详情与控制面板可用] 标题「Dougong Bracket Set」；副标题「Qing-style single-gong single-ang, five-step column-head set」；徽章 3 个；控制面板「Controls」含 21 个可交互控件；场景标注层 5 条；教学示意声明「Teaching diagram — not a construction or engineering model.教学示意，非施工/工程模型。」。<br>[交互：切换模型后视图与标题更新] 点击索引第 2 项后标题由「Dougong Bracket Set」变为「Mortise & Tenon Joints」。<br>[交互：可拆解控制项生效] 操作控制项「Explode」：值 0 → 50；面板读数「9」。 |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 42 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 42 个 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='none' stroke='%2314110f' stroke-width='2'/%3E%3Crect x='10' y='10' width='12' height='12' fill='%2314110f'/%3E%3C/svg%3E），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='none' stroke='%2314110f' stroke-width='2'/%3E%3Crect x='10' y='10' width='12' height='12' fill='%2314110f'/%3E%3C/svg%3E），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/18-architecture-models/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/18-architecture-models/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | — |
| D11 来源与许可 | ⬜ | — |
| D12 交付完整性 | ❌ | [上游自校验：qa-suite] 上游工具 qa-suite 判定 FAIL；断言 122 条，失败 1，警告 0。失败项：§9.4 降级插图标注使用 .ds-diagram__dim |

### 19-architecture-atlas — 构筑华夏 · 双语建筑图集 + 3D 结构实验室

产物目录：`19-architecture-atlas/` ｜ 文件数：148 ｜ 构建命令：`vite build` ｜ 验收结论：**fail**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 8381字, canvas 0)<br>[文字重叠遮挡] desktop: 未发现文字互相压盖（按实际字形行盒判定，候选 426 个）<br>[文字重叠遮挡] mobile: 未发现文字互相压盖（按实际字形行盒判定，候选 415 个） |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 8280字, canvas 0) |
| D3 开始/暂停/重置 | ✅ | [六个 3D 结构实验室] labs-meta.js 声明 6 个实验室模型：chuandou.js、dougong.js、mortise.js、stone-arch.js、taoliang.js、tulou.js（要求 6 个）。<br>[实验室路由 #/labs 可打开] 跳转到 #/labs 后主区内容：「STRUCTURAL LABS Take them apart STRUCTURAL LABS Six models you can orbit, zoom, select, explode, ass」；可交互条目 12 个；canvas 数：0。 |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 216 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 216 个 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23F6F2EA'/%3E%3Crect x='6' y='7' width='20' height='3.4' rx='1.7' fill='%23C0503C'/%3E%3Crect x='6' y='14' width='14' height='3.4' rx='1.7' fill='%2314181B'/%3E%3Crect x='6' y='21' width='17' height='3.4' rx='1.7' fill='%2314181B'/%3E%3C/svg%3E），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[站点图标 favicon] 已声明站点图标（data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23F6F2EA'/%3E%3Crect x='6' y='7' width='20' height='3.4' rx='1.7' fill='%23C0503C'/%3E%3Crect x='6' y='14' width='14' height='3.4' rx='1.7' fill='%2314181B'/%3E%3Crect x='6' y='21' width='17' height='3.4' rx='1.7' fill='%2314181B'/%3E%3C/svg%3E），请求返回 200<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/19-architecture-atlas/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/19-architecture-atlas/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ✅ | [默认语言为英文] document.documentElement.lang = "en"，data-lang = "en"；首屏正文起始：「A SAMPLE CATALOG — NOT AN EXHAUSTIVE LIST Built in China Built in China Structures & Stori…」；导航：Built in ChinaStructures & Stories / Atlas / Labs / Glossary / Quiz / Saved / Sources / Atlas。<br>[语言切换：.lang-switch 中英互切且 lang 同步] 点击「中文」后 documentElement.lang 由 "en" 变为 "zh-Hans"，正文随之变化=true；按钮状态 中文:true EN:false；切回后 lang = "en"。 |
| D11 来源与许可 | ⬜ | — |
| D12 交付完整性 | ❌ | [上游自校验：validate] 上游工具 validate 未产出可解析报告（退出码 1）—— 该项不计入结论。<br>[交付完整性：README / manifest.json / LICENSES.md] 缺少：README.md、manifest.json、LICENSES.md |

---

## 三、统计

| 项 | 数量 |
| --- | --- |
| 任务目录总数 | 17 |
| 有可运行页面（index.html） | 14 |
| 文档型交付（按设计无 index.html） | 3 |
| 浏览器实测完成 | 17 |
| 未交付 | 0 |
| 施工中 | 0 |
| 验收后源码又有改动（结论对应旧快照） | 14 |

> **快照提醒**：上游任务在验收期间持续被并发改写，因此上表每一行结论都只对「该件的验收时刻」成立。
> 「验收后源码又有改动」一栏为 ⚠️ 的作品，表示其产品源码在验收之后又被修改过 —— **发布前请重跑一次**
> `node qa-harness/run-qa.mjs`，并核对 `evidence/summary.json` 的 `counts`。

### 未证明项清单（skip ≠ pass）

下表列出**既非通过也非失败**、而是「本次没有取得证据」的项。它们**不计入通过率**，
但也**不记为产品缺陷**；每一项都写明为什么没测到。

| 任务 | 未证明项 | 原因 | 是否需复测 |
| --- | --- | --- | --- |
| 09-era-arcade | 难度切换 | no difficulty control —— 该能力是否存在本身未被证明 | 需在对应场景复测 |
| 10-era-console | 暂停流程 | 未找到「暂停 / 继续」类按钮 —— 该能力是否存在本身未被证明 | 需在对应场景复测 |
| 10-era-console | 重开流程 | 未找到「重开 / 重来 / 重置」类按钮 —— 该能力是否存在本身未被证明 | 需在对应场景复测 |
| 10-era-console | 难度切换 | no difficulty control —— 该能力是否存在本身未被证明 | 需在对应场景复测 |
| 10-era-console | 本地存档键 | 自动验收期间 localStorage 未写入（产品确有持久化路径：构建产物中命中 2 处存储 API 调用；写入通常发生在游戏结算/设置保存，自动流程推进不到该时刻）—— 记为「未自动验证」，不是缺陷 | 需在对应场景复测 |
| 10-era-console | 键盘焦点作用域（未聚焦不响应） | 页面未暴露可观测的游戏状态（window.__lumenRally 等），无法自动比对运动量；仅验证了 DOM 层面 | 需补齐证据 |
| 10-era-console | 键盘焦点作用域（聚焦后响应） | HUD 为 canvas 绘制且无可聚焦 DOM 元素，键盘由 document 级监听处理（独立子站 / iframe 内不会影响父页面）—— 不计为缺陷 | 需在对应场景复测 |
| 11-era-online | 暂停流程 | 点击「暂停 (P)」后界面无可见变化（该作品未暴露全局状态句柄，无法判定是否真的冻结） | 需补齐证据 |
| 11-era-online | 难度切换 | no difficulty control —— 该能力是否存在本身未被证明 | 需在对应场景复测 |
| 11-era-online | 本地存档键 | 自动验收期间 localStorage 未写入（产品确有持久化路径：构建产物中命中 8 处存储 API 调用；写入通常发生在游戏结算/设置保存，自动流程推进不到该时刻）—— 记为「未自动验证」，不是缺陷 | 需在对应场景复测 |
| 11-era-online | 键盘焦点作用域（未聚焦不响应） | 页面未暴露可观测的游戏状态（window.__lumenRally 等），无法自动比对运动量；仅验证了 DOM 层面 | 需补齐证据 |
| 11-era-online | 键盘焦点作用域（聚焦后响应） | HUD 为 canvas 绘制且无可聚焦 DOM 元素，键盘由 document 级监听处理（独立子站 / iframe 内不会影响父页面）—— 不计为缺陷 | 需在对应场景复测 |
| 12-era-modern | 难度切换 | no difficulty control —— 该能力是否存在本身未被证明 | 需在对应场景复测 |
| 19-architecture-atlas | 上游自校验：validate | 上游工具 validate 未产出可解析报告（退出码 1）—— 该项不计入结论。 | 需在对应场景复测 |

> 合计 **14** 项未证明。

### 快照一致性

下表给出每件作品「验收时刻」与「源码最后修改时刻」的对照。上游任务在验收期间仍在被修改，因此这一栏是判断结论是否需要重跑的依据。

| 任务 | 验收时刻 (UTC) | 源码最后改动 | 最新改动文件 | 状态 |
| --- | --- | --- | --- | --- |
| 00-research | 2026-10-21T16:00:45.629Z | 2026-10-21T20:33:14.446Z | package.json | ⚠️ 已过时 |
| 01-web | 2026-10-21T16:01:41.855Z | 2026-10-21T15:49:07.923Z | package.json | ✅ 一致 |
| 02-model | 2026-10-21T16:02:03.105Z | 2026-10-21T19:24:16.145Z | public/models/assets.manifest.json | ⚠️ 已过时 |
| 03-interaction | 2026-10-21T16:02:45.798Z | 2026-10-21T20:32:49.560Z | scripts/qa-smoke-ego.mjs | ⚠️ 已过时 |
| 04-spaceflight | 2026-10-21T16:03:12.115Z | 2026-10-21T20:28:04.191Z | scripts/ego-verify.mjs | ⚠️ 已过时 |
| 05-museum-research | 2026-10-21T16:03:47.864Z | 2026-10-21T20:14:30.148Z | scripts/__pycache__/ego_probe.cpython-314.pyc | ⚠️ 已过时 |
| 06-museum-core | 2026-10-21T16:04:07.981Z | 2026-10-21T20:31:58.705Z | public/data/exhibits.json | ⚠️ 已过时 |
| 07-museum-art | 2026-10-21T16:30:54.863Z | 2026-10-21T21:03:31.063Z | scripts/ego/qa-page.mjs | ⚠️ 已过时 |
| 08-era-origins | 2026-10-21T16:05:16.070Z | 2026-10-21T20:09:59.360Z | scripts/verify.sh | ⚠️ 已过时 |
| 09-era-arcade | 2026-10-21T16:06:25.850Z | 2026-10-21T15:37:21.924Z | src/core/palette.js | ✅ 一致 |
| 10-era-console | 2026-10-21T16:07:23.089Z | 2026-10-21T18:15:56.083Z | src/styles/.DS_Store | ⚠️ 已过时 |
| 11-era-online | 2026-10-21T16:08:18.091Z | 2026-10-21T20:22:18.457Z | scripts/.DS_Store | ⚠️ 已过时 |
| 12-era-modern | 2026-10-21T16:08:52.353Z | 2026-10-21T21:03:18.215Z | scripts/ds-verify.config.json | ⚠️ 已过时 |
| 16-design-system | 2026-10-21T16:10:56.479Z | 2026-10-21T15:31:35.724Z | src/components.css | ✅ 一致 |
| 17-architecture-research | 2026-10-21T16:11:42.138Z | 2026-10-21T21:00:24.112Z | data/validate-report.json | ⚠️ 已过时 |
| 18-architecture-models | 2026-10-21T16:42:55.188Z | 2026-10-21T20:35:12.743Z | src/data/index.js | ⚠️ 已过时 |
| 19-architecture-atlas | 2026-10-21T16:12:10.020Z | 2026-10-21T20:04:55.202Z | src/styles/tokens.css | ⚠️ 已过时 |

