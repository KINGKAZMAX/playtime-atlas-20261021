# STATUS · 织造车间调度台 · LOOMDECK

**任务**：03｜热门交互界面案例复刻（按 MASTER-UPDATE.md 改为**原创改编**）
**目录**：`flash-showcase-20261021/03-interaction`
**状态**：**已完成，可发布**（`manifest.json.status = completed`，版本 v1.1.1）
**最后更新**：2026-10-21 23:18（**对齐 16 最新规范 v1.0.1：字体栈顺序 / 触摸目标 / 必备令牌**）

---

## 0-A. 本轮回执 —— 对监工 23:0x 三点监督指令

| # | 监工指令 | 回答 |
| --- | --- | --- |
| 1 | 澄清「`STATUS.md` 不存在」的过期前提 | **前提已过期**：`STATUS.md` 实际存在（本文件，初版 22:10 建立，22:31 重写）。另：**13 对 `03-interaction` 的证据文件已于 2026-10-21 22:36 落盘更新**（`13-qa-curation/evidence/03-interaction.json`，`checkedAt=2026-10-21T14:36:41Z`，`verdict: "pass"`，`build.ok=true`，`fileCount=16`，`totalBytes=420353`）。 |
| 2 | 说明 13 早前判定 `error` 的原因 | **是 harness 崩溃，不是产品缺陷。** 报错为 `page.evaluate: Target page, context or browser has been closed` —— Playwright 浏览器实例在并发扫描时被抢占（13 当时与其他目标并行跑同一台机器），页面上下文已被关闭，脚本再执行 `page.evaluate` 就抛这个错。该错误发生在**测量环节**，而非页面运行环节。13 串行重跑的结论为准：**`verdict: pass`**。本目录侧的独立证据：自带冒烟 **19/19**、批次 harness 复跑 **28 项 verdict `pass`**（详见 §6）。 |
| 3 | 按 16 当前规范（`design-tokens.json` 22:29 / `MIGRATION-NOTES.md` 22:33 / `DESIGN-SPEC.md` 22:37，v1.0.1）补齐映射替换 | **已完成**，逐条见 §0-B。改动只落在 `03-interaction/` 内，未触碰任何同级目录。 |

## 0-B. 对齐 16 v1.0.1 的三项硬性修正（本轮实际改动）

| 项 | 16 的现行规定 | 改前 | 改后 | 验证 |
| --- | --- | --- | --- | --- |
| **中文字体栈顺序** | `DESIGN-SPEC §2.5`（硬性）/ `MIGRATION-NOTES §5.3`：**覆盖完整的系统 CJK 族必须排在覆盖有限的子集之前**；`Noto Sans SC` 不得排在任何系统 CJK 族之前 | `"Space Grotesk", "Noto Sans SC", -apple-system, …, "PingFang SC", …`（**违规**） | `"Space Grotesk", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC", "Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif` | `16-design-system/tools/ds-audit-tokens.mjs` → **顺序问题 0**；§9.1 第 ④ 步（`Noto Sans SC` 下标 > 全部系统 CJK 族下标）通过 |
| **触摸目标阈值** | `DESIGN-SPEC §11.4` / `MIGRATION-NOTES §5.1`：主控件 `.ds-btn` **≥44px**（AAA 2.5.5）；唯一豁免类 `.ds-btn--sm` 32px 仍须 ≥24px（AA 2.5.8）；`§7.4` 表单控件最小高 **44px**、radius `--ds-radius-md` | `--ds-target-min: 24px`；`.ds-btn` 40px；`.ds-input`/`.ds-select` 40px + radius-sm | `--ds-target-min: 44px`；`.ds-btn` **44px**；`.ds-input`/`.ds-select` **44px** + `--ds-radius-md`（14px）；`.ds-btn--sm` 维持 32px | 审计器「必备值差 0」；harness D5 焦点态 8/8 可见；390px 无横向溢出、D1 0 对 |
| **必备令牌补齐** | `MIGRATION-NOTES §2.7`「03-interaction 专项映射表」第 ② 条：补 `--ds-canvas-hud-bg` 与 `--ds-canvas-scrim`（必备 17 项中缺此两项） | 两个 HUD 令牌未定义 | 已补齐，并顺带补齐规范全集中其余 14 项（分区 / 画布 / 导航轨 / 入场延迟 / 字体源），使令牌层与 16 **逐名等值**（129 项 / 缺 0 / 值差 0 / 额外 0） | 审计器 → **🟢**：必备缺 0、必备值差 0、全量缺 0、值差 0、顺序问题 0 |

> **说明（不是静默改动）**：本目录此前把「`Noto Sans SC` 排在系统栈之前」当作"更好"的选择，**与 16 v1.0.1 的硬性条款相反**。
> 16 的实测依据是 `05-museum-research` 观测到的**中文基线错位**：CSS 字体回退按**字符**进行，
> 排在前的有限子集一旦缺字，浏览器会逐字回退到系统黑体，同一段文字便混入两套字形与两套基线。
> 本目录已按 §2.5 回退至系统栈优先的顺序；自托管的 Noto Sans SC 子集**保留**（不删），
> 继续随包发布，只在「系统 CJK 栈整体不可用」时兜底 —— 这正是 §5.3 第 ③ 条的要求。
> 代价是跨平台中文字形不统一（各系统自己的黑体），这是 16 已声明**可接受**的代价。

---

## 0. 本轮（改版）回执 —— 对监工四点

| # | 监工问题 | 回答 |
| --- | --- | --- |
| 1 | `manifest.json` 与 `STATUS.md` 是否已补 | **已补**。两者均在 `03-interaction/` 根目录，本文件即 `STATUS.md`；`manifest.json` 已同步到 v1.1.0（含 `restyle` / `i18n` / `assets.fonts` / `qa` 四段新增字段）。两者均为本目录文件，未改动任何同级目录。 |
| 2 | 改版准备清单 | **`RESTYLE-INVENTORY.md`**（第 1 步产物）：27 个旧变量的使用点统计、硬编码色值清单、字体迁移方案、组件类名映射、5 条不改动红线、执行顺序。改版后已在该文件追加「落地结果」一节，逐条标注实际替换情况。 |
| 3 | mobile D1「62 对重叠」复核结论与处理 | **真实缺陷，不是误报**；已修复；**当前 0 对**。根因是窄屏下把面板内容塞进各自的 `max-height:420px` 滚动容器，溢出元素的几何盒子仍延伸到下一面板上方（harness 当时判定 `label「布种」× span.loom__id「L-03」` 重叠 78%）。修复方式：≤860px 改为**整页自然滚动**（**未用 z-index 掩盖重叠**）。改版后复跑 harness：D1 桌面 **0 对**（候选 197）、移动 **0 对**（候选 196）；并对 390×844 整页截图逐段目视复核（标题不竖排、无逐字换行、无跨面板压盖）。详见 `QA.md` §4.1。 |
| 4 | 实际改动文件清单 | 见本文件 **§7 改动清单**（22 个文件：新增 7 / 修改 12 / 删除 3）。 |

## 1. 作品定位与原创命名（未因改版而变动）

| 项 | 内容 |
| --- | --- |
| 作品名 | **织造车间调度台 · LOOMDECK**（K.6：改版不改名） |
| 一句话 | 一间手工织造车间的浏览器端调度台：12 台提花织机接单、换经、织造、断经、完工，订单簿 / 机台矩阵 / 实时遥测 / 事件日志四区联动，刷新后原样恢复 |
| 模型形态 | 参考案例是「25 个模拟 AI 代理」；本作品换成一间车间的 **12 台提花织机**（每台有固有速度、梭速、张力目标、能耗累计） |
| 与参考案例的关系 | **原创改编，不是复刻**。只借鉴机制骨架（多执行体 / 实时日志 / 任务编排 / 实时遥测 / 状态反馈），作品名、文案、术语、内容、字体、配色、布局、模型形态七项全部重写 |
| 参考案例 | Ricker（@0xRicker）「AI agent command center」 — https://x.com/0xRicker/status/2112519745270321496 |
| 核验日期 | 2026-10-21（互动数据为当日快照，见 `SOURCE.md`） |

与兄弟任务的区分：非落地页（`01-web`）、非 3D 查看器（`02-model`）、非 3D 游戏（`04-spaceflight`）。

## 2. 改版进度：RESTYLE-SPEC §4 的第几步

| 步骤 | 状态 | 证据 |
| --- | --- | --- |
| 第 1 步：独立缺陷修复 + 改版准备（待替换清单、中英文案骨架） | ✅ 完成 | `RESTYLE-INVENTORY.md`、`I18N-KEYS.md` + `i18n/keys.json` |
| **第 2 步：16 规范就绪后增量改版** | ✅ **本轮完成** | `src/tokens.css`、`src/ds-components.css`、`src/styles.css`（61 条增量替换）、`public/fonts/`、`index.html` |
| 第 3 步：13 验收 | ✅ **已通过**（13 于 2026-10-21 22:36 更新证据：`verdict: "pass"`） | `13-qa-curation/evidence/03-interaction.json`；本目录侧复跑：harness 28 项 verdict `pass` |
| 第 4 步：14 发布 | ⏳ 由 14-publish 执行 | 本目录只准备可发布本地产物，**未 commit / 未 push** |

**改版原则（守住了的红线）**：只换**视觉语言**，不改作品名 / 文案 / 内容 / 术语 / 模型形态 / 既有功能与键位；
不推倒重写（既有选择器一个没删，靠「旧变量 → 新 token 重定向」+ `.ds-*` 增量类名）；
**未用 z-index 掩盖重叠**；标题已去掉 `white-space:nowrap`；中文无负字距；无 CDN 字体/脚本。

## 3. 已交付内容

| 类别 | 文件 | 说明 |
| --- | --- | --- |
| 任务书 | `TASK.md` | 定位、选型理由、原创改编对照表、键盘表、验收标准 |
| 状态 | `STATUS.md` | 本文件 |
| 来源核验 | `SOURCE.md` | 原帖 URL、模型归属三重证据、可见互动数据、**证据限制**、同批 5 候选横向对比 |
| 差异说明 | `DESIGN-DIFF.md` | 与参考案例的七项逐项对照、机制一对一映射、刻意做出的「不像」 |
| 说明 | `README.md` | 快速开始、目录结构、玩法、键盘表、持久化、技术说明 |
| 变更 | `CHANGELOG.md` | v1.0.0（初版）+ v1.1.0（改版）+ **v1.1.1（对齐 16 v1.0.1 规范）** |
| 验收 | `QA.md` + `qa/report.json` | 实测记录（自带冒烟 19 项 + 批次 harness 28 项 + 字体校验 + 对比度校验） |
| 许可 | `LICENSES.md` | 代码 / 字体 / 图形 / 依赖 / 数据 五类来源与授权（含 OFL 合规说明） |
| **改版清单** | **`RESTYLE-INVENTORY.md`** | 第 1 步的「待替换清单」+ 落地结果逐条对照 |
| **双语键表** | **`I18N-KEYS.md` + `i18n/keys.json`** | 194 个 zh/en 键（HTML 76 + JS 118），含接入说明 |
| 清单 | `manifest.json` | 交付元数据（id / title / description / entry / buildCommand / outputDir / status + 功能、控件、来源、QA 摘要、改版、双语） |
| 源码 | `index.html`、`src/{tokens.css,ds-components.css,styles.css,workshop.js,storage.js,ui.js,main.js}` | 令牌层 / 组件层 / 作品样式 / 仿真核心 / 持久化 / 渲染层 / 主控制器 |
| 构建 | `scripts/{build-fonts.mjs,check-fonts.mjs,check-contrast.mjs,clean-dist.mjs,restyle-apply.mjs,fetch-sources.sh,serve.mjs,verify-build.mjs,qa-smoke.mjs}`、`vite.config.js` | 字体子集化 / 字体校验 / 对比度校验 / 产物清理 / 改版替换脚本 / 本地服务器 / 产物自检 / 冒烟测试 |
| 字体 | `public/fonts/`（5 个 woff2 + 5 份 OFL 全文 + `fonts.css` + `fonts.manifest.json`） | 自托管，族名与 16 清单一致 |
| 截图 | `screenshots/01-desktop.png`、`02-desktop-drawer.png`、`03-mobile.png` | 桌面整机台 / 详情抽屉 / 移动端（**改版后重出**） |

## 4. 本地运行与构建

```bash
npm install        # 安装构建期依赖（无运行时依赖）
npm run build      # 字体子集化 + vite 打包 → dist/（退出码 0，postbuild 清理 .DS_Store）
npm run verify     # 产物自检：无外部引用 / 字体已本地化 / 无敏感文件
npm run check:fonts# 字体资产校验：族名 / 许可 / 汉字覆盖 / 无外链字体
node scripts/check-contrast.mjs   # 对比度校验：正文 ≥4.5:1、图形与控件边界 ≥3:1
npm run serve      # 本地预览 http://127.0.0.1:4313（仅本地，不发布）
npm run qa         # 真实浏览器冒烟测试 → qa/report.json + screenshots/
```

- **端口**：`4313`，只绑 `127.0.0.1`，不对外暴露；本次交付**未发布、未推送、未使用任何凭据**。
- **构建命令与输出目录**：`buildCommand = npm run build`（内部为 `npm run fonts && vite build`），`outputDir = dist`，
  与 `package.json` / `vite.config.js` 实际一致。
- **产物**：16 个文件 / **411.1 KB**（HTML 14.5 KB、JS 38.6 KB、CSS 37.0 KB、字体 303.9 KB、OFL 全文 21.9 KB、favicon、字体清单）。
- **发布形态**：纯静态 `dist/`，`base: './'`，可直接部署在任意子路径
  （harness D8 实测：`/playtime-atlas-20261021/exhibits/03-interaction/` 下所有资源解析成功）。
- **交给 14-publish 的内容**：`dist/` 静态包 + `manifest.json`；本任务不碰 `14-publish/` 目录。

## 5. 来源与许可要点

- 完整说明见 [`LICENSES.md`](./LICENSES.md)；来源核验见 [`SOURCE.md`](./SOURCE.md)。
- **代码**：本任务原创，MIT。
- **字体**（改版后）：Space Grotesk / Inter / Space Mono / **Noto Sans SC**，
  全部 SIL OFL 1.1，自托管并随产物发布，运行时不请求任何字体 CDN；
  五份 OFL 全文随包；族名与 `16-design-system/fonts/FONT-MANIFEST.json` 一致。
  Noto Sans SC 子集由本目录按自身用字重新生成（**覆盖 565/565 汉字**），
  并把 `name` 表族名规整为「Noto Sans SC / Regular」——
  该字体的保留字体名仅为 `'Source'`，本次改名**未使用保留名**，符合 OFL 1.1。
  **本轮按 `DESIGN-SPEC §2.5` 调序后**：汉字走系统黑体（苹方 / 雅黑 / 思源），
  该子集**降为离线兜底**（系统栈整体不可用时才生效，已实测可强制加载）。
- **图形**：面板配色、状态色、SVG 折线图、负载条、原创织机纹样 favicon 全部原创 / 运行时生成；
  无第三方图标库、无游戏 ROM、无商业游戏资源、无品牌视觉。
- **参考案例素材**：未复制其视频、截图、代码、字体或图标；作者署名与原帖 URL 已如实保留。
- **数据**：只写本机 `localStorage`（`loomdeck.workshop.v1`），不上传、不出网。

## 6. 实测结论（非预期）

| 验收 | 结果 |
| --- | --- |
| `npm run build` | 退出码 0，产出 `dist/index.html` 等 16 个文件 / **411.1 KB**（本轮字体子集重建结果与前次**逐字节一致**，构建可复现） |
| `npm run verify` | ✓ 无外部资源引用 / 字体已本地化 / 无敏感文件 |
| `npm run check:fonts` | ✓ 5/5 通过（族名一致 / 许可齐备 / **汉字 565/565** / ASCII 全覆盖 / 无 CDN） |
| `node scripts/check-contrast.mjs` | ✓ **30 组配色对全部达标** |
| **`16-design-system/tools/ds-audit-tokens.mjs`** | ✓ **🟢**：声明 129 / **必备缺 0 / 必备值差 0** / 全量缺 0 / 值差 0 / 额外 0 / **字体栈顺序问题 0**（与 16 的 `src/tokens.css` 逐名等值） |
| `npm run qa`（自带冒烟） | **19 / 19 通过** |
| 批次 QA harness（13-qa-curation 当前版） | **28 项：pass 24 / warn 0 / fail 0 / skip 1 → verdict `pass`**（本轮复跑：D1 桌面 0 对 / 移动 0 对，候选 197 / 202） |
| **移动端文字遮挡（原唯一 fail）** | **已修复并复核**：390×844 下 62 对 → **0 对**（改版后复测仍为 0 对，见 `QA.md` §4.1） |
| 中文字体加载 | ✓ 拉丁族（Space Grotesk / Inter / Space Mono×2）全部 `loaded`；**CJK 按 §2.5 走系统黑体**，自托管子集未被触发，`document.fonts.load()` **强制加载实测 `Noto Sans SC:loaded`** —— 证明「系统栈不可用」时兜底仍然可用 |
| 控制台 | 两个视口 + 探针页均无 error、无未捕获异常 |
| 跨域请求 | 0（运行期零外部请求） |
| 子路径部署 | harness D8 实测通过 |
| 目视复核 | 桌面 1440×900 / 抽屉态 / 移动 390×844 逐张看图（本轮改字体栈顺序与控件尺寸后**重拍重看**），无错位、无竖排、无缺字、无横向溢出 |

本轮修复的 10 个真实缺陷（均由浏览器实测发现，详见 `QA.md` §4）里，
三个是**只有在真实点击下才暴露**的问题：DOM 整表重建导致点击丢失、页眉重排把点击吞掉、
toast 的 `pointer-events` 导致「撤销」按钮点不到。

## 7. 本轮实际改动文件清单

**新增（7）**

| 文件 | 作用 |
| --- | --- |
| `src/tokens.css` | `--ds-*` 令牌层（取值抄 `design-tokens.json`）+ 旧变量语义别名层 + 中文排版修正 |
| `src/ds-components.css` | `.ds-skip` / `.ds-topbar` / `.ds-btn` 系列 / `.ds-tag` / `.ds-chip` / `.ds-field` / `.ds-input` |
| `scripts/check-fonts.mjs` | 字体资产校验（族名 / 许可 / 汉字覆盖 / 无外链） |
| `scripts/check-contrast.mjs` | 对比度校验（WCAG 2.2） |
| `scripts/clean-dist.mjs` | 清理产物中的 `.DS_Store`（`postbuild`） |
| `I18N-KEYS.md` + `i18n/keys.json` | 双语键表（190 键）与接入说明 |
| `scripts/restyle-apply.mjs` | 改版增量替换脚本（61 条精确替换，逐条断言命中） |

**修改（12）**：`index.html`、`src/styles.css`、`src/ui.js`、`src/main.js`、
`package.json`、`package-lock.json`、`vite.config.js`（未改）、`public/fonts/fonts.css`、
`CHANGELOG.md`、`QA.md`、`LICENSES.md`、`README.md`、`manifest.json`、`STATUS.md`、
`RESTYLE-INVENTORY.md`（追加落地结果）、`.gitignore`（新增，忽略 `.DS_Store` / `node_modules/`）

**删除（3）**：`public/fonts/noto-serif-sc-loomdeck.woff2`、`public/fonts/jetbrains-mono-loomdeck.woff2`、
`public/fonts/LICENSES.txt`（旧自研字体资产，改版后不再使用；经回收站删除，可恢复）

### 7-A. 对齐 16 v1.0.1 那一轮的文件改动

| 文件 | 改动 |
| --- | --- |
| `src/tokens.css` | ①`--ds-font-display` / `--ds-font-text` 按 §2.5 调序（系统 CJK 栈在前）；②`--ds-target-min` 24px → **44px**；③补 `--ds-canvas-hud-bg` / `--ds-canvas-hud-ink` / `--ds-canvas-hud-line` / `--ds-canvas-scrim` / `--ds-section-*` / `--ds-tone-fade` / `--ds-glow` / `--ds-in-delay` / `--ds-rail-scale` / `--ds-rail-blur` / `--ds-work-dim` / `--ds-font-display-src`；④`--mono` 别名的 CJK 兜底顺序同样按 §2.5 调正 |
| `src/ds-components.css` | `.ds-btn` 最小高 40px → **44px**；`.ds-input` / `.ds-select` 40px → **44px**、radius `--ds-radius-sm` → **`--ds-radius-md`** |
| `src/styles.css` | 旧 `.btn` 最小高 40px → **44px**；`.field input` / `.field select` 40px → **44px**、radius → **`--ds-radius-md`**（该选择器特异性高于 `.ds-input`，不改会压掉组件层的值）；触控端 `.btn--tiny` / `.seg__btn` 点按目标 40px → **44px** |
| `scripts/qa-smoke.mjs` | 字体断言改为两层：拉丁族必须 `loaded`；CJK 兜底子集必须**已注册且可强制加载成功**（`document.fonts.load()` 实测 `Noto Sans SC:loaded`）。原断言要求 5 个族全部 `loaded`，在 §2.5 调序后**必然失败** —— 因为系统栈优先时浏览器根本不需要下载子集，这是正确行为而非缺陷 |
| `STATUS.md` / `CHANGELOG.md` / `QA.md` / `README.md` / `LICENSES.md` / `RESTYLE-INVENTORY.md` / `manifest.json` | 同步本轮结论与版本号 v1.1.1 |
| `screenshots/01-desktop.png` / `02-desktop-drawer.png` / `03-mobile.png` | 字体栈顺序与控件尺寸变更后**重拍**，并逐张目视复核 |

> 本轮**未**触碰 `13-qa-curation/`、`14-publish/`、`15-supervisor/`、`16-design-system/` 等同级目录；
> 读取 16 的审计工具与规范为**只读**；复用 13 的 harness 仍是只读复制到 `/tmp` 并改写输出路径。
> 本轮**未**启动第二个构建/预览实例占用 4313，临时静态服务器（qa / harness 自带）验完即关。

## 8. 改版决策与偏离说明（如实记录）

| # | 决策 | 理由 |
| --- | --- | --- |
| 1 | **不引入 `.ds-cover` 英雄区** | 本作品是**网格 + 标签密集**的工具型调度台。加封面会把调度控件与工单标签推到首屏之外，直接违反「不得让调度控件与工单标签的可读性/可点性变差」与 K.5。封面是内容型页面的英雄区，不是仪表盘的上半屏。**这是本目录的自定判断**，非 DS 强制项。 |
| 2 | 同屏只保留 **1 个 `.ds-btn--primary`** | DS §3 要求「主按钮每屏至多 1 个」。顶栏「开工并派工」为唯一主按钮；订单表单的「加入订单簿」降为 `--secondary`（仍是该面板最显眼的按钮，且拉伸填满行宽）。 |
| 3 | `.ds-field` / `.ds-input` 取 **44px** + radius `--ds-radius-md` | **本轮已按 §7.4 回退**：改版时取 40px 的理由是「6 个字段若全用 44px，900px 视口里订单列表会被挤出首屏」。复核后确认该顾虑不成立 —— 44px 使订单面板增高 24px（6 行 × 4px），桌面 1440×900 下订单簿仍完整可见、移动 390×844 无横向溢出、D1 仍 0 对。**规范优先于主观密度偏好**，现取 §7.4 的 44px。 |
| 4 | 表单控件描边用 `--ds-ink-faint`（5.51:1） | DS 的 `--ds-line` 对底色仅 **1.29:1**，低于 WCAG 非文字控件边界 3:1。仍在 DS 色板内、不另立色板，只是换用同色板中更达标的 token。 |
| 5 | 状态文字用派生墨色 `--ok-ink` / `--warn-ink` / `--err-ink` | DS 的 `--ds-warning` 对底色仅 **3.59:1**，作为正文不达 4.5:1。三色由 `color-mix()` 从状态色与墨色推导（不新增色板），实测 5.70–6.73:1。`--ds-warning` 本身只用于图形与描边。 |
| 6 | `--mono` 别名在 generic 之前插入 **系统 CJK 栈**，`Noto Sans SC` 置于其后 | DS 的 `--ds-font-mono` 不含 CJK 兜底，等宽语境里的中文会回退到系统宋体，与正文混排。故在语义别名层给 `--mono` 补 CJK 族（`--ds-font-mono` 令牌本身保持与 `design-tokens.json` 逐字一致）。**本轮已按 §2.5 把顺序调正**：覆盖完整的系统 CJK 族在前、Noto 子集在后，与正文字族栈同口径。 |
| 7 | 只落地**浅色**主题 | DS 另有深色主题；本作品未验算深色下的对比度与图表可读性，故 `color-scheme: light` 固定浅色，避免系统深色偏好下出现未验算状态。 |
| 8 | Noto Sans SC 子集**按本作品用字重做** | 16 随包的子集实测缺本作品 **168 个汉字**，直接引用会中英混排。重做后覆盖 565/565，且体积比 16 的子集小 46%（106.6 KB vs 197.6 KB）。 |
| 9 | `.ds-topbar` 只提供「表面」属性 | 组件层的 `display:flex` 会覆盖调度台的三列栅格，390px 下标题被挤成竖排。改为组件层只给层级/底色/描边/内距，列结构交回作品自身的 `.masthead`。 |
| 10 | **中文字体走系统栈，自托管子集降为离线兜底**（本轮） | 按 `DESIGN-SPEC §2.5`（硬性）执行：系统 CJK 栈在前、`Noto Sans SC` 子集在后。代价是跨平台中文字形不统一（各系统自己的黑体）；收益是不缺字、不混排、不错位。子集**保留不删**（§5.3 第 ③ 条），仅在系统栈整体不可用时兜底。 |
| 11 | **令牌层补齐规范全集 129 项**（本轮） | 除 `MIGRATION-NOTES §2.7` 点名要求的 `--ds-canvas-hud-bg` / `--ds-canvas-scrim` 外，顺带补齐分区 / 导航轨 / 入场延迟等其余 14 项，使本目录令牌层与 16 的 `src/tokens.css` **逐名等值**（审计器：缺 0 / 值差 0 / 额外 0）。本作品**不消费**其中画布 / 分区 / 导航轨类令牌（无 canvas、无英雄分区、无导航轨），已在 `src/tokens.css` 内逐组注释说明，**不产生任何视觉影响**。 |
| 12 | **本轮不做深色主题**（与第 7 条同源，此处只记增量） | 深色接入的前置条件是验算深色下的对比度与图表可读性；本轮令牌层已补齐深色所需的全部命名（含 `--ds-canvas-hud-*` 暗色档），切换成本低，但**未验算即不发布**，避免出现未验证状态。 |

## 9. 已知限制（限制节）

1. **双语键表就绪，切换器未实现**：194 个中英键位在 `i18n/keys.json`，HTML 侧已打 `data-i18n` 钩子；
   但本轮**未**提供运行时切换、JS 侧也**未**打点。原因是派单第 1 步只要求「准备文案骨架」，
   且本作品刚完成改版 —— 语言切换会改变按钮宽度 → 触发重排 → 触及本轮刚修掉的「点击被吞」类缺陷。
   接入方式见 `I18N-KEYS.md` §4，由 19/14 统一接入。
2. **移动端无 Tab 环**：390×844 为触屏视口，harness 记为 skip（桌面 8/8 通过）。
3. **快捷键需先点一下界面**：刻意的设计 —— 展品会被嵌进主站 iframe，无条件劫持按键会干扰宿主；
   界面右上角有「⌨ 点按界面启用快捷键」提示。
4. **仿真是本地确定性模型**：不连接真实设备 / MES；断经为概率事件。
5. **字体子集只含实际用到的字符**：新增生僻字文案后需重新 `npm run fonts`
   （构建脚本会自动重新收集；`npm run check:fonts` 会实测覆盖情况）。
   源字型未收录的符号目前只有 `⌨` 一个，由系统符号字体回退，不缺字。
6. **未发布、未提交**：本次只准备可发布本地产物；推送与部署由同级 `14-publish` 统一执行。
7. **英文文案未经母语审校**：译文由本任务作者给出，用于打通结构与占位符；接入方可直接改 `i18n/keys.json` 的 `en` 值。
8. **中文字形随操作系统而异（本轮引入的取舍）**：按 `DESIGN-SPEC §2.5` 的硬性顺序，汉字恒走**系统黑体**
   （macOS 苹方 / Windows 微软雅黑 / Linux 思源或文泉驿），跨平台中文字形**不完全一致**。
   这是 16 明确声明**可接受**的代价 —— 换来的是「不缺字、不混排、不错位」。
   自托管的 Noto Sans SC 子集仍随包发布（565/565 汉字全覆盖），只在系统栈整体不可用时兜底，
   已实测强制加载成功。若将来要改回「子集优先」，必须先按 §2.5 的方案 B 完成
   ①重新子集化并 100% 覆盖 ②改 `FONT-MANIFEST.json` 的 `systemFallbacks.cjk` 顺序与 note
   ③改 `DESIGN-SPEC §2.5` 与 `MIGRATION-NOTES §5.3` ④重跑校验并逐页做混排目视检查 —— **在此之前不得擅自改序**。
9. **令牌层含未消费项**：为与 16 逐名等值，令牌层含分区 / 画布 HUD / 导航轨 / 入场延迟等
   本作品**用不到**的令牌。它们不参与任何渲染（纯 CSS 自定义属性，零字节开销），
   已在 `src/tokens.css` 内逐组注释；深色主题接入时会直接派上用场。

## 10. 后续可做（不在本次范围）

- 把「当班」概念接到真实工单系统（当前为纯本地仿真）。
- 导出班次报表（CSV / JSON）。
- 多机台视口（当前固定 12 台，可在 `workshop.js` 的 `LOOM_COUNT` 调整）。
- 接入 19/14 的双语运行时并补 JS 侧 118 个键的打点。
