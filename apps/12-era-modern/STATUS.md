# STATUS — 《折光纪 · 当代可玩展厅》

最后更新：2026-10-21（第三轮 · 接入 16 号设计系统规范）

| 阶段 | 状态 | 说明 |
| --- | --- | --- |
| 0. 任务立项 | ✅ 完成 | `TASK.md` 需求拆解完成（原创定位 / 三件展项 / 验收标准） |
| 1. 史料研究 | ✅ 完成 | 24 条现代时代条目，来源 URL 全部经 HTTP HEAD 核验（200） |
| 2. 工程脚手架 | ✅ 完成 | Vite 5.4.11 + Three.js 0.169 + 自托管字体，端口 4332 / 127.0.0.1 |
| 3. 设计令牌与视觉 | ✅ 完成 | **已改版**：落地 16 号「余晖设计系统」全量 `--ds-*` 令牌 |
| 4. 核心运行时 | ✅ 完成 | 事件总线 / 设置 / 存档（localStorage）/ 进度存储 / DOM 工具 / 令牌读取 / 可观测状态 |
| 5. 展厅主站 | ✅ 完成 | 落地页、时间轴、关键词导览、设置面板、无障碍 2D 目录 |
| 6. 《脉冲走廊》 | ✅ 完成 | 三曲程序化合成、判定/连击/评级、反应训练、混合模式、视觉节拍静音替代 |
| 7. 《折光阁》 | ✅ 完成 | 光路演算引擎、4 关、撤销/提示/重置、进度与星级存档 |
| 8. 《光环台》 | ✅ 完成 | 程序化全景、拖拽环视、热点展签、WebXR 支持真实检测与诚实声明 |
| 9. 文档与许可 | ✅ 完成 | README / SOURCES / LICENSES / manifest / handoff（06 接入说明 + 14 发布说明） |
| 10. 实机验证 | ✅ 完成 | Chrome 实测 **49/49 断言通过**，0 控制台错误，0 失败请求；子路径部署已验证 |
| 11. 缺陷修复 | ✅ 完成 | 第一轮 3 个功能性缺陷 + 5 项视觉改进；第二轮 4 条 QA 问题；第三轮 3 条（见下） |
| 12. 改版准备（派单第 1 步） | ✅ 完成 | 「待替换清单」`RESTYLE-INVENTORY.md` + zh/en 文案骨架（162 键） |
| 13. 增量改版（派单第 2 步） | ✅ 完成 | 按 16 号规范逐项替换 token；外壳统一为暖白纸 + 朱砂，画布内色板不动 |
| 14. 改版后复验 | ✅ 完成 | 自建 QA 49/49 + 13 号原版探针 8 pass/0 warn/0 fail + 无障碍与降级自检 11/11 |
| 15. **接入 16 号规范（第三轮）** | ✅ 完成 | `assets/ds/` 原样副本落地；`--ds-base` 注入；`.ds-shell` / `.ds-topbar` / `.ds-footer` / `.ds-skip` / `.ds-canvas-frame` 等组件类接入；令牌与 `design-tokens.json` **逐名相等**（实测 121 项零差异） |
| 16. **第三轮复验** | ✅ 完成 | 设计系统机械验收 **14 组检查：13 pass / 1 warn / 0 fail / 0 error（verdict = PASS）**（`scripts/verify-ds.mjs`）+ 自建 QA 49/49 + 13 号探针 8 pass + 无障碍 11/11 + 字体落地 11/11 |

## 当前状态

**可交付。** 产物已构建，位于 `dist/`，并已在模拟 GitHub Pages 子路径
（`http://127.0.0.1:4399/repo/prism-era/`）下通过全部验收。

```bash
cd /Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/12-era-modern
npm install
npm run dev      # http://127.0.0.1:4332
npm run build    # 产物输出到 dist/（base './'，支持子路径托管）
node scripts/test-levels.mjs   # 关卡可解性自检（4/4）
node scripts/check-i18n.mjs    # 文案骨架对等性自检（162 键一致）
# 设计系统机械验收（需先起本地服务；零依赖：Node + 本机 Chrome CDP）
PRISM_BASE="http://127.0.0.1:4399/repo/prism-era" node scripts/verify-ds.mjs
```

## 本轮（改版派单轮）做了什么

### A. 修完 13-qa-curation 指出的 4 条问题

| id | 问题 | 处置 |
| --- | --- | --- |
| QA-036 | 既没有子页链接，也没有找到展品入口控件 | 展厅 hero CTA 与三张展项卡加 `data-exhibit="pulse\|atrium\|halo"` |
| QA-037 | 点击「进入《脉冲走廊》」后未进入可玩状态（state=n/a） | 新增 `src/core/debug-state.js`，页面暴露**唯一** `window.__eraGame`（含字符串 `state`）；`state` 取值语义化（idle/countdown/playing/paused/solved/exploring…） |
| QA-038 | 未暴露可观测游戏状态，无法自动比对运动量 | 同上；三个展项均实时发布 `state` / `score` / `player`（含数值字段） |
| QA-039 | 已聚焦但按键未观测到状态变化 | 三个展项舞台加 `data-game-root` + `tabindex="0"`；**键盘焦点门**：按键只在游戏区持有焦点时被消费；`player.presses` 每次消费必增 |

同时修掉两个在改版过程中暴露的**真实功能缺陷**：

- 顶部工具栏的「暂停 / 重开」按钮**没有绑定事件**（第一轮遗留）——补齐后 D3 暂停流程由 warn 转 pass。
- 遮罩被移除时，被聚焦的按钮随 DOM 一起消失，焦点退回 `body`，**键盘随即失效**
  ——改为遮罩关闭后主动把焦点交还游戏画面。

### B. 改版准备（派单第 1 步）

- `RESTYLE-INVENTORY.md`：本目录字体/色值/圆角/间距/阴影/过渡的**逐项使用点清单**
  （文件 + 选择器 + 旧值 → 16 token 候选路径），并标出「不得触碰」的回归红线。
- `src/core/i18n/`：**162 键**的 zh/en 文案骨架（`zh.js` / `en.js` / `index.js` / `README.md`），
  `scripts/check-i18n.mjs` 强制校验键集合一致、无空文案、占位符对齐。
  **尚未切语言**（界面无语言开关），且只接入了 `src/ui/shell.js`（导航/页脚/设置面板）。

### C. 增量改版（派单第 2 步，16 号规范落地）

依据 `16-design-system` 的四份产物（`design-tokens.json` / `DESIGN-SPEC.md` /
`MIGRATION-NOTES.md` / `preview.html`）：

| 项 | 处置 |
| --- | --- |
| 令牌层 | `src/styles/tokens.css` 落地**全量 `--ds-*`**（浅色主题 + 深色主题 + reduced-motion 块）；既有 `--ink-*` / `--paper-*` / `--r-*` / `--gap` / `--dur` 等保留为**语义别名层**指向 `--ds-*` |
| 字体 | 移除 `@fontsource-variable/*` 依赖；改为自托管 16 号清单的 Space Grotesk / Inter / Space Mono（4 个 woff2 + 4 份 OFL 全文，第二轮落点 `src/fonts/`），产物内以相对路径引用。**第三轮已随设计系统副本迁至 `public/assets/ds/fonts/`**（见下文 E 节） |
| 主题 | 外壳**浅色**（`<html data-ds-theme="light">` 固定）；三个展项的**画布与 HUD** 以 `data-ds-theme="dark"` 单独取深色令牌 |
| 外壳 | 页头 / 页脚 / 封面 / 展项卡 / 按钮 / 标签 / 模态 / 提示条 / 开关 全部改为设计系统取值（唯一强调色 `--ds-accent` 朱砂） |
| 身份色 | 展项与时间轴年代的**身份色**改用设计系统派生色（`#2E6A5E` / `#B4432B` / `#2C5C8F` / `#8A5A00` / `#5B3FA8`），在暖白底上对比度均 ≥ 4.5:1 |
| 画布 | **游戏画面内部一律不动**（16 号红线 K.1）：光束、判定色、接收环色、热点色、3D 灯光与雾色全部保持原值 |
| 程序化绘制 | 新增 `src/core/tokens.js`（`readToken` / `readTokenRgba`），主视觉 Canvas 改为读设计系统令牌着色 |
| 命名空间 | 只在本目录声明一次 `--ds-*`；**不跨目录**引入他人 token 文件（05 / 01 的同名 `--ds-*` 语义不同） |

### C.5 改版收尾时发现并修复的字体问题（重要）

改版卸载 `@fontsource-variable/*` 后，字体链路存在**两处静默降级**——
都不报错、不断言失败，肉眼几乎看不出，但字体栈实际并未生效：

| # | 问题 | 修复 |
| --- | --- | --- |
| 1 | `src/rhythm/pulse.js` 里 9 处 `ctx.font` 仍写死已不存在的族名 `'Space Grotesk Variable'` / `'JetBrains Mono Variable'`，HUD 文本全部落到系统字体 | 新增 `readFontStack()`（`src/core/tokens.js`），Canvas 字体改从 `--ds-font-display` / `--ds-font-mono` 令牌读取；9 处全部替换，旧族名残留 0 |
| 2 | 浏览器只在页面**真正用到**某字重时才取对应文件；正文只用 Space Mono 400，其 700 字面长期 `status: "unloaded"`。Canvas 的 `ctx.font` 同步生效、取不到字体不等待而直接回落系统等宽字体 | 新增 `src/core/fonts.js` 的 `preloadFonts()`，在启动时与《脉冲走廊》开赛前显式 `document.fonts.load()` 四个必需字重；实测粗体字面由 `unloaded` 变为 `loaded` |

补充实测依据：`document.fonts.check('700 12px "Space Mono"')` 在粗体字面仍 `unloaded` 时**也返回 true**，
不能用它判断字重是否就绪，故 `preloadFonts()` 自行记录加载状态。

### D. 改版后复验（玩法画面优先）

| 项 | 结果 |
| --- | --- |
| 自建 QA（49 项断言） | ✅ 49/49，0 控制台错误，0 失败请求 |
| 13 号**原版**探针（`qa-harness/lib/probes-era.mjs` 直接引入） | ✅ pass=8 / warn=0 / fail=0 / skip=1（skip 项为「难度切换」：节奏游戏以曲目等级表达难度，页面上没有独立难度控件） |
| 无障碍与降级自检（11 项） | ✅ 11/11：四档视口零横向溢出、关键文本对比度最低 4.68:1、触摸目标最小 32px、运行期零外部请求、reduced-motion 下动效归 1ms 且节拍提示仍在 |
| 自托管字体落地专项自检（11 项） | ✅ 11/11：两款字体已加载、Space Mono 粗体字面已取回、Canvas 文本测量宽度与「不存在的族名」不同（161.57 vs 158.43）、`ctx.font` 串不再含 `*Variable` |
| 节奏提示仍清晰 | ✅ 画布内下行光带 / 收缩节拍环 / 拍点标尺 / 判定线颜色**未改**，HUD 改用 `--ds-canvas-hud-*` 深色承载面，判定统计照常产生 |
| 解谜线索仍可辨认 | ✅ 图例色样仍为 `rgb(79,227,208) / rgb(255,95,162) / rgb(157,123,255)`，与 3D 光束一一对应；「颜色不符」负反馈为 `#ff6b81` |
| 控件仍可点 | ✅ 折光阁四个 HUD 按钮命中区 51×32 ~ 76×32 px，均 ≥ 24px |

## 第三轮（接入 16 号设计系统规范）

> 派单：15-supervisor 路由 · 改版执行 · 规范已就绪。
> 规范来源：`16-design-system` 的五份产物（`design-tokens.json` / `REFERENCE-AUDIT.md` /
> `DESIGN-SPEC.md` / `preview.html` / `MIGRATION-NOTES.md`）+ `src/tokens.css` + `src/components.css`
> + `fonts/` + `tools/verify-preview.mjs`。
> 本轮在第二轮成果之上**继续增量**，未推倒重写任何页面结构。

### E. 接入四步（MIGRATION-NOTES §1）

| 步骤 | 落点 | 结果 |
| --- | --- | --- |
| ① 令牌层 | `public/assets/ds/tokens.css` = 16 号 `src/tokens.css` 原样副本 | ✅ `--ds-*` 取值**只此一处声明**；本目录自有 `src/styles/tokens.css` 退为**语义别名层 + 玩法语义色** |
| ② 字体 | `public/assets/ds/fonts/`（5 款 woff2 + 5 份 OFL + FONT-MANIFEST） | ✅ 移除本目录重复的 `src/fonts/` 与 `src/styles/fonts.css`；产物内引用为**同目录相对路径** |
| ③ 换外壳 | 既有类名之上**叠加** `.ds-*`（§10 红线：不删除既有 CSS） | ✅ 顶栏 / 页脚 / 封面 / 作品卡 / 标签 / 按钮 / 画布框 / HUD / 详情标题 / 年份轴 / 进度指示器 / 图例 / 搜索框 |
| ④ 注入基准路径 | `index.html` 注入 `<style>:root{--ds-base:"/playtime-atlas-20261021/";}</style>` | ✅ 与 `design-tokens.json → asset.basePathVar` 一致；本厅资源仍全相对路径 |

### F. 本目录按派单逐项落地

| 项 | 内容 | 结果 |
| --- | --- | --- |
| G.1 | 引入 tokens.css + components.css | ✅ |
| G.2 | `.ds-topbar` / `.ds-footer` / `.ds-skip` | ✅（`<body class="ds-shell">`，首个可聚焦元素为跳转链接） |
| G.3 | 标题**禁止** `white-space: nowrap` | ✅ 实测 4 个标题元素均非 nowrap |
| G.4 | 正文 `:lang(zh)` 字距归零、行高 1.85 | ✅ 254 个中文文本元素字距全为 0px；正文行高均 ≥1.85（新增 `src/styles/cjk.css`，**最后加载**） |
| G.5 | 元信息用 `--ds-font-mono` | ✅ 年份 / 编号 / 计数 / 键位 / HUD 标签 |
| G.6 | 保留既有功能、迁移不得破坏可玩性 | ✅ 自建 QA 49/49、13 号探针 8 pass、关卡 4/4，**画布内色板零改动** |
| G.7 | 资源相对化适配子路径 | ✅ `dist/assets/ds/**` 与字体全部相对路径，无绝对根路径；`base: './'` |
| I.1 | 画布用 `.ds-canvas-frame`（`contain:paint` + `isolation:isolate`） | ✅ 三个展项舞台全部接入；HUD 用 `.ds-canvas-frame__hud` + `--ds-canvas-hud-*` |
| reduced-motion | 两条路径归零且**不另写 !important 覆盖组件类** | ✅ 系统偏好走 16 的 `@media` 块；设置开关改用 16 的 `[data-rm="reduce"]` 开关，本目录不再自写降级规则 |
| §7 不要做 | 不改参考站命名/文案、不拷图片字体、不删既有 CSS、不用 z-index 修重叠、不用 `#6549F2`、不加 nowrap、不给中文负字距、不引 CDN | ✅ 全部守住（`z-index` 字面量已改用 `--ds-z-*` 令牌） |

### G. 第三轮复验（新增 `scripts/verify-ds.mjs`，零依赖：Node + 本机 Chrome CDP）

| 组 | 结果 |
| --- | --- |
| 无横向溢出 | ✅ 1440 / 1280 / 768 / 390 × 四路由 |
| 关键组件齐备 | ✅ 14 类 `.ds-*` 全部渲染 |
| 文本对比度 | ✅ 9 个选择器全达标，最低 4.68:1 |
| 触摸目标 | ✅ 全部 ≥24px（AA）；`.ds-btn`/`.ds-iconbtn` 全 ≥44px（AAA） |
| reduced-motion | ✅ 四路由 `--ds-dur-base`/`--ds-entry-duration` = 1ms，最大动效 1ms；回响仍可绘制且 HUD 有判定文本；中庭图例色块齐全 |
| 令牌一致性 | ✅ JSON 213 项 / 可映射 142 项 / 实比 **121 项全部相等**（大小写、空白、rgba 写法、var() 引用已归一） |
| 字体栈顺序（V.11） | ✅ Noto Sans SC 位于所有完整 CJK 族之后 |
| 页面加载 / 零外链 / 字体自托管 / 标题 nowrap / 中文排版 | ✅ 全部通过（270 个请求全同源） |

> ⚠️ 唯一提示项：`--ds-font-mono` 的 CSS 取值比 JSON 多一个 `Consolas` 兜底族——
> 该差异来自 **16 号 `tokens.css` 本身**（本目录为原样副本），非本目录引入（见限制 L-12）。

### H. 第三轮顺带修掉的 3 个问题

| # | 问题 | 修复 |
| --- | --- | --- |
| 1 | 第二轮自写的 `:root[data-reduced-motion='true']` 降级块**重定义了 `--ds-dur-*`**，违反 §0 风险 B | 改用 16 的 `[data-rm="reduce"]` 开关，本目录不再自写 `!important` 降级规则 |
| 2 | 「高对比」开关同样重定义 `--ds-line` / `--ds-ink-soft` 等 `--ds-*` 取值 | 改为 `--hc-*` **间接层**（`--hc-line: var(--ds-line)` …），开关只改本目录自有变量 |
| 3 | 字体栈顺序把覆盖有限的 Noto Sans SC 子集排在了系统 CJK 栈之前（V.11 违规） | 随 16 的 `tokens.css` 原样副本一并修正；由 `verify-ds.mjs` 的「字体栈顺序」断言守护 |

## 交付物清单

| 文件 | 说明 |
| --- | --- |
| `TASK.md` | 需求拆解、验收标准、已知取舍 |
| `STATUS.md` | 阶段状态与变更日志（本文件） |
| `README.md` | 运行方式、三件展品说明、视觉规范、无障碍、限制 |
| `RESTYLE-INVENTORY.md` | 视觉改版「待替换清单」与执行结果 |
| `SOURCES.md` | 史料台账：24 条目 / 26 链接 / 核验时间 / 核验中发现的问题 |
| `LICENSES.md` | 第三方依赖与**自托管字体**许可、原创资产清单、参考与差异说明 |
| `QA.md` | 49 项自动断言 + 11 项无障碍/降级自检 + 11 项字体落地自检 + 14 组设计系统机械验收（13 pass / 1 warn / 0 fail）+ 13 号探针复跑 + 人工检查 + 截图索引 + 未覆盖项 |
| `manifest.json` | 交付元数据（id/title/description/entry/buildCommand/outputDir/status） |
| `public/assets/ds/` | 16 号设计系统**原样副本**（tokens.css / components.css / fonts/），随产物一起发布 |
| `src/` | 全部源码（含 `src/core/i18n/`、`src/styles/cjk.css`） |
| `scripts/verify-ds.mjs` | 设计系统机械验收脚本（零第三方依赖：Node 内置 + 本机 Chrome CDP） |
| `evidence/` | `verify-ds.mjs` 的机读报告 `ds-verification.json` 与 16 张实测截图 |
| `dist/` | 已构建静态产物（可直接复制到 Pages 子路径，含 `assets/ds/**`） |
| `screenshots/` | 21 张实机截图（第三轮重拍） |
| `handoff/INTEGRATION.md` | 给 06 的嵌入说明（iframe、相对路径、声明措辞） |
| `handoff/PUBLISH.md` | 给 14 的发布说明（落位、Pages 要点、逐项确认清单） |
| `handoff/exhibit-manifest.json` | 给 06 的机读展项切片 |

## 关键设计决策

1. **静音视觉替代是与音频并列的一等模式**，不是降级补丁：游戏时钟统一走 `performance.now()`，
   音频只作为可选的呈现层，因此「无声可通关」与「有声」在判定精度上完全一致
   （已实测：静音模式 AudioContext 创建计数 = 0，判定照常）。
2. **谱面即乐谱**：每个音符同时驱动主旋律合成与判定点，视听天然对齐，不会出现音频漂移。
3. **诚实声明优先**：VR 展项只做桌面交互演示，页面显著位置写明不支持 VR 头显，
   并提供真实的 `navigator.xr.isSessionSupported('immersive-vr')` 检测按钮。
4. **提示基于作者解法**：旋转类元件的提示指向关卡作者预设的朝向，UI 已注明这一点。
5. **关卡可解性用脚本保证**：`scripts/test-levels.mjs` 同时校验「作者解法可点亮全部接收环」
   「初始状态不通关」「元件与光点可达」「地形尺寸自洽」，并在每次改动后重跑。
6. **可观测状态只暴露一个 `__` 全局**：13 号的验收脚本会取「第一个满足条件的 `__` 全局」，
   多个会互相干扰；因此统一为 `window.__eraGame`（且该名字在 13 的已知句柄列表内，命中确定）。
7. **键盘焦点门是行为变更，不是测试技巧**：游戏按键只在游戏区持有焦点时被消费，
   避免 iframe 嵌入母站时劫持主站键盘；进入展项即自动聚焦画面。
8. **改版只换视觉语言**：作品名、文案、音乐、关卡、史料、玩法一律未改；
   画布内配色按 16 号红线 K.1 保持原值。

## 变更日志

- 2026-10-21：立项，产出 `TASK.md`，确定原创命名「折光纪 / PRISM ERA」及三件展项命名。
- 2026-10-21：完成史料核验（24 条目 / 26 链接，含 2011–2026），来源清单写入 `SOURCES.md`；
  核验中发现并放弃 3 个失效链接（含 Candy Crush 条目），未以失效链接充数。
- 2026-10-21：完成工程脚手架与设计令牌；依赖本地 npm 安装，运行期零外链。
- 2026-10-21：完成核心运行时、展厅主站、《脉冲走廊》《折光阁》《光环台》全部功能。
- 2026-10-21：完成浏览器实测（49/49），修复「进入游戏后页面未回顶导致 HUD 不可见」
  「实例化地板旋转轴错误导致格子与元件错位」「LV3 浮台形同虚设」三个功能性缺陷，
  以及反光板可读性、折光阁视野、光环台场景、节奏轨道宽度等视觉改进（详见 `QA.md` 第 8 节）。
- 2026-10-21：完成 `dist/` 构建并在 `/repo/prism-era/` 子路径下复测全通过；补齐 README /
  LICENSES / QA / manifest / handoff 全部交付文档。
- **2026-10-21（改版轮）**：修完 13 号指出的 4 条问题（QA-036/037/038/039），
  顺带修掉「顶部暂停/重开按钮未绑定事件」与「遮罩关闭后焦点丢失导致键盘失效」两个真实缺陷。
- **2026-10-21（改版轮）**：产出 `RESTYLE-INVENTORY.md` 与 162 键 zh/en 文案骨架
  （`src/core/i18n/` + `scripts/check-i18n.mjs`），**未切语言**。
- **2026-10-21（改版轮）**：16 号四份产物就绪后执行增量改版——落地全量 `--ds-*` 令牌、
  自托管 16 号字体（4 woff2 + OFL 全文）、外壳改浅色暖白纸 + 朱砂唯一强调色、
  画布内色板保持不变（红线 K.1）。
- **2026-10-21（改版轮）**：改版后复验——自建 QA 49/49、13 号原版探针 8 pass/0 warn/0 fail、
  无障碍与 reduced-motion 自检 11/11；重拍 18 张截图；补齐 README / STATUS / QA /
  LICENSES / manifest。
- **2026-10-21（第三轮 · 接入 16 号规范）**：按 `MIGRATION-NOTES.md` §1 接入四步落地——
  `public/assets/ds/` 落 16 号令牌层 / 组件层 / 字体（**原样副本**，仅加来源说明头），
  本目录自有 `src/styles/tokens.css` 退为语义别名层；入口注入 `--ds-base`，`<body>` 加 `ds-shell`；
  外壳在既有类名之上叠加 `.ds-*`（顶栏 / 页脚 / 跳转链接 / 封面 / 作品卡 / 标签 / 按钮 /
  画布框 / HUD / 详情标题 / 年份轴 / 进度指示器 / 图例 / 搜索框）。
- **2026-10-21（第三轮）**：修掉三处「重定义 `--ds-*` 取值」的合规问题
  （reduced-motion 块、高对比开关），改为 `[data-rm="reduce"]` 与 `--hc-*` 间接层；
  字体栈顺序随 16 的原样副本一并修正（V.11）。
- **2026-10-21（第三轮）**：新增零依赖验收脚本 `scripts/verify-ds.mjs`（14 组检查），
  第三轮复验 **13 pass / 1 warn / 0 fail / 0 error（verdict = PASS）**；
  连同自建 QA 49/49、13 号探针 8 pass、无障碍 11/11、字体 11/11 全绿；
  截图增至 21 张；补齐 README / STATUS / QA / LICENSES / manifest / handoff。

## 限制（L）

- **L-1**：本目录的 `--ds-*` 取值**只在一处声明**：`public/assets/ds/tokens.css`
  （16 号 `src/tokens.css` 的原样副本）。本目录自有层只声明语义别名与玩法语义色，
  **不重新定义任何 `--ds-*` 取值**（MIGRATION-NOTES §0 风险 B），
  因此与 05-museum-research、01-web 的同名 `--ds-*` 不存在互相覆盖的问题。
  若 14 号在站点层再统一分发 16 号的 `tokens.css`，需确认加载顺序与作用域。
- **L-2**：**中文以系统字体栈为主**。16 号交付的 `Noto Sans SC` 子集（197 600 B）已随包引入，
  但只排在**完整覆盖的系统 CJK 族之后**作为最后兜底——该子集按 07-museum-art 自身用字生成，
  覆盖范围有限。**顺序不可颠倒**：若把它排在系统栈之前，会因 CSS 按字符回退导致
  同段文字混入两套字形、基线错位（16 号规范源头已修正此项，本批 8 个目录曾集体出现）。
  代价仍是**跨设备汉字字形不一致**（macOS 苹方 / Windows 雅黑 / Linux Noto）。
- **L-3**：**未切换语言**。文案骨架已就绪（162 键），但界面仍为中文，且内容型文案
  （史料、关卡叙事、热点长文、展项长描述）不在骨架内。
- **L-4**：**「唯一强调色」有一处自觉偏离**——三个展项与时间轴年代保留了各自的**身份色**
  （装饰 / 身份语义，非交互语义），以区分展项并与画布内的玩法色保持一致；
  交互强调（主 CTA / 当前项 / 焦点环）仍只有一个朱砂色。此项**无参考站实测依据，为本批自定**。
- **L-5**：**参考站的视觉语言在本批并非逐像素还原**。16 号的规范本身已声明其颜色、字体、字号、
  圆角、缓动与命名均为自有设计，与参考站取值不同；本目录按 16 号规范执行，
  **不声称与参考站视觉一致**。
- **L-6**：**英文版与 `lang` 切换未接线**：`setLang()` 已实现（含 `<html lang>` 同步与订阅），
  但没有界面入口；`:lang(zh)` 的中文排版规则因此恒定生效。
- **L-7**：**视觉统一度由本目录自评**。改版已完成且红线已守住，但「风格一致性」需由 13 号
  独立验收判定；本目录的结论不替代 13 号的判定。
- **L-8**：**可访问性数值是抽样实测**，非全站穷举：关键文本 30 个选择器、触摸目标 11 个控件、
  溢出 4 档视口；设计系统侧另有 14 项机械验收（`scripts/verify-ds.mjs`，四路由 × 四视口）。
  画布内 HUD 文本（Canvas 像素绘制）不在 CSS 对比度采样范围内，
  靠深色承载面（`--ds-canvas-hud-bg`）与原有配色保证可读。
- **L-9**：**本轮未做的事**：没有新增玩法、没有改文案、没有动关卡与史料、
  没有跨目录改任何文件、没有 git commit / push（14 号为唯一写入者与发布者）。
- **L-10**：**16 号组件层的两处取值冲突在本地就地校正**（未修改 16 号副本）：
  ① `.ds-btn` 默认 `--ds-btn-h: var(--ds-space-10)` = 128px，与 DESIGN-SPEC §7「最小高 40px」相悖，
  本目录覆盖为 44px；② `.ds-input` 的 `appearance:none` 会抹掉 `range` 滑块本体，
  滑杆保留浏览器原生外观。两处均记入 `QA.md` §8。
- **L-11**：**未采用 `.ds-rail` 的「固定导航轨」形态**。该形态 `position:fixed; left:0; width:132px`
  会与本厅 1280px 内容列重叠；本目录改用其 `--horizontal` 变体，把年份跳转轴做成
  时间轴面板内的静态横条。此项**无参考站实测依据，为本批自定**。
- **L-12**：**令牌一致性存在 1 处已知差异**：`--ds-font-mono` 的 CSS 取值比 `design-tokens.json`
  多一个 `Consolas` 兜底族。该差异来自 **16 号 `tokens.css` 本身**（原样副本，未改动），
  不是本目录引入；已在 `scripts/verify-ds.mjs` 中按「提示」而非「失败」处理，并提请 16 号确认。
