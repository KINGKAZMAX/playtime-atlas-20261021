# STATUS — 《联机曙光 LINK DAWN》2000s 可玩展厅

最后更新：2026-10-21（§9 规范机械复核轮次）

| 阶段 | 状态 | 说明 |
| --- | --- | --- |
| 0. 任务立项 | ✅ 完成 | `TASK.md` 需求拆解完成，诚信红线写入约束 |
| 1. 史料核验 | ✅ 完成 | 65 条来源，89 个候选 URL 逐条实测可达性（见 `SOURCES.md`） |
| 2. 工程脚手架 | ✅ 完成 | Vite 5 + TypeScript 5，端口 4331 / 127.0.0.1，strictPort |
| 3. 共享引擎 | ✅ 完成 | 固定步长循环、键盘+触屏输入、localStorage 封装、WebAudio 程序化音效 |
| 4. 原创点阵字体 | ✅ 完成 | 自写 5×7 字形表（A–Z / 0–9 / 标点 / 方向符），非任何商业字库 |
| 5. 展项 A 策略防守 | ✅ 完成 | 16×10 战场、双航道、4 塔种×3 级、18 波、胜负、暂停、存读档 |
| 6. 展项 A AI 对手 | ✅ 完成 | 「灰烬协议」本机 AI：自适应编队、倒计时预警、意图播报、常驻「非真人」标识 |
| 7. 展项 B 掌机冒险 | ✅ 完成 | 原创掌机外壳、双屏、3 区域、3 碎片、3 NPC、机关、体力、存读档 |
| 8. 展厅壳层 | ✅ 完成 | 导览 / 年表 / 展柜 / 史料台账，全部历史陈述挂来源角标 |
| 9. 样式与响应式 | ✅ 完成 | 设计令牌、1440×900 与 390×844 双视口适配 |
| 10. 类型检查与构建 | ✅ 完成 | `tsc --noEmit` 零错误；`vite build` 退出码 0，产物为相对路径 |
| 11. 浏览器实机验收 | ✅ 完成 | **53/53 断言全部通过** + 定点取证 7/7 + 改版自检 20/20 + §9 规范复核 14/14，15 张截图逐张复核（见 `QA.md`） |
| 12. 交付文档 | ✅ 完成 | README / QA / SOURCES / LICENSES / HANDOFF / RESTYLE-INVENTORY / manifest.json |
| 13. **视觉语言改版** | ✅ 完成 | 按 16-design-system 增量改版：令牌层 + 自托管 OFL 字体 + 外壳统一；画布内部按红线不动（见 `RESTYLE-INVENTORY.md`） |
| 14. **改版接入方式归一（拷贝 `assets/ds/`）** | ✅ 完成 | 改为监工派单口径：从 `16-design-system/` 原样拷贝 `tokens.css` / `components.css` / `fonts/` → `public/assets/ds/`；删除自建令牌层与字体层；外壳改用 16 官方组件类（见下节） |
| 15. **改版自检脚本** | ✅ 完成 | 新增 `scripts/restyle-check.cjs` → `qa-restyle.json`，**20/20 通过** |
| 16. **§9 规范机械复核** | ✅ 完成 | 新增 `scripts/ds-conformance.cjs` → `qa-ds-conformance.json` **14/14 通过**；据此修掉 2 处真实缺陷（掌机 HUD DOM 文字对比度、来源角标触摸目标） |
| 17. 部署 | ⏸ 归 14-publish | 本任务**不部署**，只交付可静态构建的产物包 |

## 当前状态

**可交付**。本地运行方式：

```bash
cd /Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/11-era-online
npm install      # 首次
npm run dev      # 开发模式  http://127.0.0.1:4331
npm run build    # 类型检查 + 静态构建 → dist/
npm run preview  # 预览构建产物 http://127.0.0.1:4331
```

产物状态（最后一次构建）：`dist/index.html` **2.15 kB**（gzip 1.37 kB）· `dist/assets/index-*.js` **99.85 kB**（gzip 40.95 kB）·
`dist/assets/style-*.css` **28.36 kB**（gzip 5.49 kB）；
另含 `dist/assets/ds/`（16 设计系统令牌层 / 组件层 / 自托管字体，共 14 个文件）；
运行时依赖 0 个，运行期外部请求 0 条。

## 复验收轮次：修了什么

上一轮验收虽 52/52 全绿，但复跑时在并发高负载下暴露了 3 个真实缺陷与 3 个验收脚本自身的问题。
本轮按「只修复未通过项、不动已通过项」执行，修完重跑**同一套**验收脚本。

### 本轮新修的产品缺陷（3 项）

| # | 缺陷 | 影响 | 修复 |
| --- | --- | --- | --- |
| 12 | 「准备阶段自动开波」没有任何界面提示 | 准备阶段 22 秒后自动开波，「立即开波」按钮**静默变灰**，玩家会以为按钮坏了 | 控制条常驻状态提示：「Ns 后自动开波」/「第 N 波进行中」/「本局已结束」 |
| 13 | 灰烬编队错用玩家波次时钟 | 准备阶段 `waveClock` 不推进，AI 明明宣布「⚡ 突击已发动」，编队却**始终不出现在场上** | 新增灰烬航道独立时钟 `ashClock`，`stepDefense` 与 AI 编队时间戳均改用它，突击真正落地 |
| 14 | 控制条按钮缺少稳定标识 | 只能靠位置型 CSS 选择器定位按钮，DOM 一变就点错（本轮真实把「存档」点成了「速度」） | 七个控制按钮补 `data-act` 属性（`start/pause/speed/save/load/reset/mute`） |

### 本轮同步加固的验收脚本（不削弱任何断言）

| # | 问题 | 处理 |
| --- | --- | --- |
| 1 | 位置型 CSS 选择器 | 改用 `[data-act=...]` 定位控制条按钮 |
| 2 | 「22 秒自动开波」与慢机器的竞态（波次自行开始 → 灯塔被打穿 → 结算遮罩挡住后续点击） | 测试期用白盒接口固定 `prepTimer` 并维持灯塔耐久（测试侧干预，产品行为不变）；开波断言改为「波次编号必须推进」 |
| 3 | 截图时战场画布可能已滚出视口，产出空白无效证据 | 每次截图前把画布滚入视口，12 张截图全部重新生成并逐张目视复核 |
| 4 | reload 后立即点击页签偶发超时 | 改用 `domcontentloaded` + 显式 `waitForSelector` + 重新注入滚动样式 |
| 5 | 验收环境 | 启动参数不加 `--disable-gpu`（否则动画中的 canvas 无法合成进视口截图） |

### 复验收结论

- **53/53 断言全部通过**（较上一轮 52 项新增 1 项「开波状态提示常驻可见」，
  并把「战斗循环在运行」「AI 突击单位真实生成在灰烬航道」两项从弱断言升级为白盒强断言）。
- `npm run build` 退出码 **0**；`dist/index.html` 存在；产物内无绝对路径引用（全部 `./assets/...`）。
- 12 张截图全部重新生成并目视复核：canvas 均已正确合成进视口截图。
- **无回归**：上一轮已通过的断言在修正后的同一套脚本上依旧全部通过。

## 恢复轮（监工点名 6 项）：修了什么

> 监工工单基于上一实例被限流中断时的快照，给出 6 项未通过与「目标 48/48」。
> 断点核对：`src/games/defense/view.ts` 里 `GRID` 的 import 已于 20:12 落盘（就是被限流那次的最后动作），
> 其后 20:35 的 `ai.ts / sim.ts / types.ts` 改动是本会话的灰烬独立时钟修复；`dist/` 与源码一致，**未重跑重建**。

### 6 项定点取证：`scripts/spotcheck-6.cjs` → `qa-spotcheck.json`，**7/7 通过**

| # | 工单项 | 实测 | 结论 |
| --- | --- | --- | --- |
| ① | 纯键盘建造（`1-4` + 方向键 + `Enter`） | Σ **242 → 184**，场上设施 **0 → 1**，生成 `pulse Lv1 @(0,1)` | ✅ 通过 |
| ② | `U` 键升级（需先选中塔） | 选中前「未选中」→ `Enter` 选中「脉冲塔 Lv1」→ 按 `U` 得「**脉冲塔 Lv2**」，Σ 185 → 131 | ✅ 通过 |
| ③ | 对话显示说话人 | 「**岑 · 守灯人**」 | ✅ 通过 |
| ④ | NPC 对话带来源角标的历史陈述 | 首句即带 1 枚角标 `百科 → https://en.wikipedia.org/wiki/Xbox_network` | ✅ 通过 |
| ⑤ | 含具体年份史实 | 年份 **2002** | ✅ 通过 |
| ⑥ | 角标为可点击外链 | `https://…`（https 前缀） | ✅ 通过 |

### 本轮新修的产品缺陷（在上一轮 14 处之外）

| # | 缺陷 | 影响 | 修复 |
| --- | --- | --- | --- |
| 15 | **NPC 对话首句既无年份也无来源角标** | 史料角标只挂在中段句，玩家读到的第一句是纯氛围叙述 | 三位 NPC 开场白各补一句带具体年份 + 来源角标的史实（岑→Xbox Live 2002 / 岚→Steam 2003 / 薇→WoW 2001），**复用既有 `sourceChipEl` 组件与 65 条台账口径**，不另造格式 |
| 16 | **方向键连发延迟仅 0.24s** | 慢机器上「按下→抬起」间隔一旦超过连发延迟，一次轻点被当成按住，光标连跳多格（实测跳到 (7,1)） | 连发延迟提到 **0.40s**（常规桌面 UI 量级）：轻点只移动 1 格，真正按住才持续移动 |

### 与工单口径的两处差异（已核实，非缺陷）

1. **断言总数是 53，不是 48**：脚本在这几轮里新增了断言——「开波状态提示常驻可见」，
   并把「战斗循环在运行」「AI 突击单位真实生成在灰烬航道」两项弱断言升级为白盒强断言。
   工单的「42 项已通过」对应的是更早的 48 项版本；按**当前同一套脚本**计，
   本轮结论为 **53/53 通过，已通过的断言无回归**。
2. **① 的降幅不是固定 50**：当前塔价（`src/games/defense/config.ts`）为建造 Σ **60 / 85 / 140 / 110**
   （脉冲塔 / 霜凝场 / 磁轨炮 / 谐振塔），升 Lv2 为 Σ **55 / 70 / 120 / 95** 且耗 Φ 18/22/30/26。
   实测「按 1 键建脉冲塔」Σ 242 → 184（-60 再加期间自然回复的晶格），与配置表自洽；
   工单里「241 → 191」的 -50 对应不上任何现行造价，应按塔价口径取值。

### 恢复轮结论

- **53/53 断言全部通过**（同一套 `scripts/acceptance.cjs`）；定点取证 **7/7**；页面 JS 运行时错误 0 条。
- `npm run build` 退出码 **0**；`dist/index.html` 存在（1.23 kB）；
  `dist/assets/index-qa8gm0zt.js` 98.8 kB（gzip 40.6 kB）、`style-*.css` 24.7 kB（gzip 5.9 kB）；
  产物内无绝对路径，运行时依赖 0 个。
- 临时静态服务器（`python3 -m http.server 4331`）**验证后已关闭**，端口已释放，无常驻进程残留。

## 改版轮次（16 规范可用后 · 增量改版）

> 依据：`15-supervisor/RESTYLE-SPEC.md` + `16-design-system/{DESIGN-SPEC.md, design-tokens.json, MIGRATION-NOTES.md, preview.html}`
> 逐项替换台账：**[`RESTYLE-INVENTORY.md`](./RESTYLE-INVENTORY.md)**

### 改版落地内容

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | **令牌层** | ~~新建 `src/styles/tokens.css`~~ → **已被下一节归一**：改为从 16 原样拷贝到 `public/assets/ds/tokens.css`，自建文件已删除 |
| 2 | **深色主题** | `<html data-ds-theme="dark">`（本展厅是夜间场景），生效 `color.dark` 一组 |
| 3 | **自托管字体** | ~~新增 `src/fonts/`~~ → **已被下一节归一**：改为 16 的 `public/assets/ds/fonts/`；**无 CDN、无外链字体、运行期零外部请求**（结论不变） |
| 4 | **外壳统一** | 封面（眉标→标题→导语→媒体）、导航（胶囊 + `aria-current`）、区块、展柜卡片、按钮（胶囊 + 焦点环）、来源角标 chip、弹层、页脚，全部改用 `--ds-*` |
| 5 | **画布容器** | `.defense__board` 升级为等价 `.ds-canvas-frame`（`--ds-radius-media` + `--ds-line` + `contain:paint` + `isolation:isolate`） |
| 6 | **无障碍** | 新增 `.ds-skip` 跳转链接（首个可聚焦元素）；`--ds-focus-ring` 焦点环；`:lang(zh)` 中文排版（字距归零、行高 1.75）；`prefers-reduced-motion` 归 1ms；运行时生成 `hreflang`（不写死线上路径） |
| 7 | **单一强调色** | 旧「数据青 / 回声绿 / 紫 / 橙」并入唯一强调色（朱砂 `#E0684A`）；状态语义色只用于**描边与底纹**，文字用墨色（≥4.5:1） |

### 红线：刻意不改（MIGRATION-NOTES §4）

| # | 不改 | 理由 |
| --- | --- | --- |
| K.1 | 两个展项 **canvas 内部全部配色**（`src/core/palette.ts` 的 `SHELL`/`POCKET` 与 `render.ts`） | 高饱和色板是玩法辨识的一部分，统一会伤害可玩性 |
| K.2 | 画布尺寸比、命中区、反馈 | 影响手感 |
| K.3 | 掌机 HUD 可读性（`--pocket-*` 机身色板、160×144 上屏点阵画面） | HUD 低对比度 = 不可玩 |
| K.4 | 键盘映射、Tab 焦点遍历 | 见 DESIGN-SPEC §11.3 |
| K.5 | 玩法、存档键、史料台账口径、角标组件 | 风格迁移不得破坏功能 |
| K.6 | 作品名与展项名 | 改名会破坏 works.json / URL / 已完成验收 |
| — | **诚实声明**（「本地单机 / AI 非真人 / 无联网」）与史料免责段 | 史实准确性要求，不是设计问题 |

### 改版后验证

- `npm run build` 退出码 **0**；`dist/index.html` 1.78 kB、`style-*.css` 35.1 kB（gzip 7.4 kB）、
  `index-*.js` 99.7 kB（gzip 40.9 kB）、5 款字体打进 `dist/assets/`（带 hash）。
  （以上为**当轮**数值；已被下一节「改版接入归一」覆盖，最新数值见下节与「当前状态」段。）
- 产物内**无绝对路径**（HTML `./assets/…`、CSS `url(./xxx.woff2)`、`base:'./'`）→ 适配任意 Pages 子路径。
- 回归：同一套 `scripts/acceptance.cjs` **53/53 通过**；定点取证 `scripts/spotcheck-6.cjs` **7/7 通过**；页面 JS 运行时错误 0 条。

---

## 改版接入归一轮次（拷贝 `assets/ds/` + 16 官方组件类）

> 监工派单口径：`16-design-system/MIGRATION-NOTES.md` §1「接入四步」——**拷贝** `assets/ds/` 到消费方，
> 而不是各站自建令牌层。本轮据此把上一轮「自建 `src/styles/tokens.css` + `src/fonts/`」的做法**整体归一**。

### 本轮实际改动

| # | 改动 | 说明 |
| --- | --- | --- |
| 1 | **拷贝 16 的产物** | `16-design-system/src/tokens.css` → `public/assets/ds/tokens.css`；`src/components.css` → `public/assets/ds/components.css`；`fonts/`（5 款 woff2 + `fonts.css` + `FONT-MANIFEST.json` + 5 份 OFL 全文）→ `public/assets/ds/fonts/`。**逐文件 sha256 比对一致，未改一字** |
| 2 | **删除自建令牌层与字体层** | 删除 `src/styles/tokens.css`、`src/styles/fonts.css`、`src/fonts/`（可恢复），避免 `--ds-*` 重复声明（MIGRATION-NOTES §0 风险 B）；本目录只保留语义别名层 `src/styles/base.css` |
| 3 | **`index.html` 接入 ds 资源** | 三个 `<link>`（tokens / components / fonts）；`<html lang="zh-CN" data-ds-theme="dark">`；`<body class="ds-shell">`；首个子元素 `.ds-skip`；注入 `:root{--ds-base:"/playtime-atlas-20261021/";}`；预加载两款拉丁字体 |
| 4 | **`src/main.ts` 去掉 ds 的 import** | 改由 `index.html` 的 `<link>` 加载；保留运行时按 `document.baseURI` 生成 `hreflang` |
| 5 | **外壳改用 16 官方组件类** | 新增满宽 sticky `.ds-topbar`（`.ds-topbar__brand` / `.ds-topbar__nav` / `.ds-topbar__link`，滚动同步 `aria-current="page"`，首屏 rAF 初始化）；导航**从封面移出**；页脚改 `.ds-footer`；战场容器加 `.ds-canvas-frame`；来源开关按钮加 `ds-btn ds-btn--sm` |
| 6 | **清理自建组件样式** | `base.css` 删掉自建的 `.ds-skip` 规则，`shell.css` 删掉自建的 `.shell__nav*` 规则——改由 16 组件层提供；**未删除任何其它既有 CSS**，只做增量类名与变量重定向 |
| 7 | **新增改版自检脚本** | `scripts/restyle-check.cjs` → `qa-restyle.json` + `screenshots/10-restyle-desktop.png` |

### 与 16 的同步记录

16 在本目录首次拷贝之后修正了 **CJK 字体回退顺序**：覆盖完整的系统 CJK 族必须排在覆盖有限的
Noto Sans SC 子集之前，否则同一段文字会混入两套度量不同的字形（混排基线错位）。
本目录已**重新拷贝** `tokens.css` / `components.css` / `fonts.css` / `FONT-MANIFEST.json`，
重建并复跑三套验收。本目录自有 CSS 不含任何自造字体栈（全部走 `var(--ds-font-*)`），因此自动获得该修正。

### 本轮验证结果

| 检查 | 结果 |
| --- | --- |
| `npm run build` | ✅ 退出码 **0**；`dist/index.html` 2.15 kB、`style-*.css` 28.31 kB（gzip 5.47 kB）、`index-*.js` 99.85 kB（gzip 40.95 kB）。
  （**当轮**数值，已被下一节「§9 规范机械复核轮次」覆盖；最新为 `style-*.css` 28.36 kB / gzip 5.49 kB） |
| ds 资源 | ✅ `dist/assets/ds/**` 14 个文件全部 200 |
| 与 16 一致性 | ✅ 4 个 CSS/JSON + 5 款 woff2 与 16 源文件 sha256 逐一致 |
| 回归 | ✅ `scripts/acceptance.cjs` **53/53**；`scripts/spotcheck-6.cjs` **7/7**；页面 JS 运行时错误 0 条 |
| 改版自检 | ✅ `scripts/restyle-check.cjs` **20/20**（四档视口 1440/1280/768/390 无溢出、ds 资源可达、组件类到位、`--ds-base` 注入、焦点环可见、Tab 不被吞、三条诚实声明可见、触摸目标 ≥24px、reduced-motion 归零、零外部请求） |
| 红线复核 | ✅ 画布内部配色 / 尺寸比 / 玩法 / 存档键 / 史料口径 / 三条诚实声明**均未动** |

### 改版接入清单（对外可见的结构变化）

- `public/assets/ds/` — **新增**，16 的令牌层 / 组件层 / 字体（含 OFL 全文）
- `src/styles/tokens.css`、`src/styles/fonts.css`、`src/fonts/` — **删除**
- `index.html` — 改：ds `<link>`、`data-ds-theme`、`ds-shell`、`.ds-skip`、`--ds-base`
- `src/main.ts` — 改：去掉 ds 的 import
- `src/shell/shell.ts` — 改：`.ds-topbar` / `.ds-footer` / `aria-current="page"`
- `src/games/defense/view.ts` — 改：`.ds-canvas-frame`
- `src/styles/base.css`、`src/styles/shell.css` — 改：删自建 `.ds-skip` / `.shell__nav*` 规则
- `scripts/restyle-check.cjs` — **新增**

---

## §9 规范机械复核轮次（16 规范就绪告知后）

> 依据：16 的《规范已就绪》告知（`MIGRATION-NOTES.md` §2.0 / §4.2 / §5.1 / §7 / §9）。
> 告知要求两件事：① 确认 reduced-motion 降级写在 `@media` 块内而非把 `--ds-dur-*` 写死 1ms；
> ② 确认 §9 自测（`node tools/validate-tokens.mjs && node tools/verify-preview.mjs`）0 error。

### 两项自查结论

| # | 告知项 | 结论 | 证据 |
| --- | --- | --- | --- |
| 1 | reduced-motion 降级写法 | ✅ **正确** | `public/assets/ds/tokens.css` 的 `:root` 是真实时长（120/200/320/520/800/640ms），`1ms` **只**出现在 `@media (prefers-reduced-motion: reduce)` 块内（345—350 行）；本目录自有 CSS **只消费** `var(--ds-dur-*)`、从不声明（不存在 00/03/05 的踩坑写法） |
| 2 | §9 自测 | ✅ **0 error** | `node tools/validate-tokens.mjs` → `tokens: 213 \| css vars: 130`、`errors: 0`、PASS（仅 1 条允许的 warning：`motion.easing.spring` 的 cubic-bezier y 分量越界）；`node tools/verify-preview.mjs` → 四档视口全绿、`errors: 0 \| warnings: 0`、PASS |

> `verify-preview.mjs` 首次运行在 1280 视口出现一次 `timeout Page.navigate`——本机当时 load average 达 105（其它会话并发跑浏览器），
> 重跑即 0 error。此为宿主资源问题，与产物无关。

### 本轮新增的自查脚本

`scripts/ds-conformance.cjs` → `qa-ds-conformance.json`，**14/14 通过**，把 §9 的机械判据落到本目录：

| # | 检查 | 结果 |
| --- | --- | --- |
| V.3 | 令牌一致性（深色主题 `--ds-*` == `design-tokens.json`） | ✅ 全部一致 |
| V.11 | 字体栈顺序（`Noto Sans SC` 排在系统 CJK 族之后） | ✅ 合规 |
| V.12 | 不自造字体栈（自有 CSS 只引用 `var(--ds-font-*)`） | ✅ 4 个自有 CSS 文件全部合规 |
| V.13 | 无规范漂移（字体族序列逐项相等含顺序） | ✅ display / text / mono 一致 |
| §7 | 降级块写法 + 自有 CSS 不声明 `--ds-dur-*` | ✅ 通过 |
| §4.2 | HUD **DOM** 文字对比度 ≥4.5:1（canvas 内豁免） | ✅ 展项 A 57 个 / 展项 B 21 个文字元素达标 |
| §5.1 | 触摸目标 24px / 44px 两档 | ✅ 全部达标 |

### 本轮修掉的 2 处真实缺陷

| # | 缺陷 | 依据 | 修复 |
| --- | --- | --- | --- |
| 17 | **掌机 HUD 的 DOM 文字不达 4.5:1**：`--pocket-d4` (#9a6a74) 在机身底 `#1a1424` 上仅 **4.01:1**、在 `#0d0912` 上仅 **4.40:1**（7 处 DOM 文字） | §4.2「HUD 文字对比度 ≥4.5:1 —— 这一条**不豁免**」 | 新增 `--pocket-text: #b8848e`（d4 的提亮同色相版本：d1 5.75:1 / d2 4.65:1 / ink 6.32:1 / sysbtn 5.27:1），7 处 DOM 文字改用之；**机身色阶与画布点阵色板（`palette.ts` 的 `d4`）一律不动** |
| 18 | **来源角标触摸目标仅 20px 高**：`.src` 是可点击外链（全站 104 处），`line-height: 18px` + 1px 描边 = 20px < 24px | §5.1「全部可交互元素 ≥24px（硬性，一票否决）」 | `.src` 改 `line-height: 22px` + `min-height: 24px` → 实测 43×24；台账密集列表版面无溢出、无破版 |

### 与 16 的口径对齐（§2.0 的两处更新）

1. **「128 个 `--ds-*` 逐名一致」这一条已被本轮的上游化覆盖**：本目录自建的 `src/styles/tokens.css` 已删除，
   改为**逐字节拷贝** `16-design-system/src/tokens.css` → `public/assets/ds/tokens.css`，
   「取值一致」由「逐名比对相同」升级为「**sha256 逐字节相同**」。
2. **语义别名层按 §2.0 指示保留**：`--danger` / `--data` / `--dawn` / `--deep` 等 23 个别名仍在
   `src/styles/base.css` 的 `:root`，且全部指向 `--ds-*`、无直取值；改版后自有 CSS 已直接使用 `--ds-*`，
   别名层现为零引用的重定向层（`--font-mono` 仍在用 10 处）。

### 本轮验证结果

| 检查 | 结果 |
| --- | --- |
| `npm run build` | ✅ 退出码 **0**；`dist/index.html` 2.15 kB、`style-*.css` 28.36 kB（gzip 5.49 kB）、`index-*.js` 99.85 kB（gzip 40.95 kB） |
| 功能回归 | ✅ `scripts/acceptance.cjs` **53/53**；`scripts/spotcheck-6.cjs` **7/7**；页面 JS 运行时错误 0 条 |
| 改版自检 | ✅ `scripts/restyle-check.cjs` **20/20** |
| §9 规范复核 | ✅ `scripts/ds-conformance.cjs` **14/14** |
| 红线复核 | ✅ 画布内部配色 / 尺寸比 / 玩法 / 存档键 / 史料口径 / 三条诚实声明**均未动**（`palette.ts` 与两个 `render.ts` 未改一字） |

---

## 限制与未覆盖（如实记录）

| # | 项 | 说明 |
| --- | --- | --- |
| 1 | **英文版尚未提供** | 本作品当前只有中文界面；`hreflang` 只声明 `zh-CN` 与 `x-default`，**不冒充存在英文版**。按 RESTYLE-SPEC §4 第 2 步，中文站至少保证 key 结构存在、英文版可由 19/14 统一接入；当前本目录尚未做 zh/en key 抽离 |
| 2 | **深色主题的语义色为本目录自定** | 16 未给深色主题的 `--ds-success/warning/danger/info` 变体，这四个色在深底上作正文不足 4.5:1。本目录用 `color-mix(语义色, --ds-ink)` 派生 `--sem-*`（实测 6.2:1–8.6:1），**属本批自定**，未标为参考站实测 |
| 3 | **头部装饰画未并入统一色板** | `heroCanvas.ts` 的夜色插画在封面里作为**媒体对象**存在（`.ds-cover__media` 语义），保持原样；未按 K.1 红线处理（它不是游戏画布），而是按「媒体即对象」的封面规则处理 |
| 4 | **未做跨浏览器实测** | 验收只用 Chromium；Firefox / Safari 未实测。`color-mix()`、`contain: paint`、`isolation: isolate` 在旧浏览器上会降级但不影响功能 |
| 5 | **未做屏幕阅读器实测** | 提供了 `aria-label` / `aria-pressed` / `aria-current` / 跳转链接 / 焦点环，但未用 NVDA / VoiceOver 实测 |
| 6 | **移动端未在实体机实测** | 以 390×844 模拟视口 + `hasTouch` 验证；未在实体手机上跑 |
| 7 | **展项 A 完整 18 波通关、展项 B 完整三区域通关未录像** | 以白盒方式验证胜负判定；真人全流程未做 |
| 8 | **未安装依赖复核** | 本目录未执行过 `npm ci`（依赖已就位），构建与验收均在现有 `node_modules` 下完成 |
| 9 | **`--ds-base` 基准路径是写死的一处常量** | `index.html` 注入 `:root{--ds-base:"/playtime-atlas-20261021/";}`，对应本批指定的线上仓库路径。**若实际仓库名或部署前缀不同，只需改这一处**；其余资源引用（HTML 的 `<link>`/`<script>`、CSS 的 `url()`）全部为相对路径，`base:'./'`，不受影响 |
| 10 | **ds 资源为人工拷贝，非构建期自动同步** | 按派单口径采用「拷贝 `assets/ds/`」，本目录**未**引入 16 的构建工具做自动同步。16 后续若再更新令牌/组件/字体，需要人工重新拷贝 `public/assets/ds/` 并复跑三套验收（本轮已因 16 的 CJK 顺序修正做过一次） |
| 11 | **官方组件类只做了有限接入** | 已接入 `.ds-shell/.ds-topbar/.ds-footer/.ds-skip/.ds-canvas-frame/.ds-btn/.ds-tag/.ds-chip`；16 组件层中其余组件（灯箱、标签页、数据表等）本目录**未使用**，属于按需接入而非全量照搬 |
| 12 | **掌机 DOM 文字色 `--pocket-text` 属本批自定** | 16 未给掌机色板；`--pocket-text: #b8848e` 是本目录在 `#9a6a74` 基础上的**同色相提亮**，唯一目的是满足 §4.2 的 HUD 文字 ≥4.5:1，**未**标为参考站实测值。机身色阶与画布点阵色板保持原值 |
| 13 | **§9 复核只跑 Chromium** | `scripts/ds-conformance.cjs` 与 16 的两个自测脚本均基于 Chromium/CDP；Firefox / Safari 未实测。16 的 `verify-preview.mjs` 在本机高负载（load average 100+）下出现过一次 `timeout Page.navigate`，重跑即 0 error，属宿主资源问题 |

---

## 阻塞与说明

- **无阻塞。**
- 部署由 `14-publish` 统一执行；本目录只提供 `dist/` 产物与集成说明。
- 本机验收期间系统负载一度达 90+（其它会话并发跑浏览器实例），会出现 Chromium 被系统杀死；
  属宿主资源问题，**与产物无关**，重跑即通过。
- `05-museum-research` 的 `catalog.json` 在本任务进行时尚未交付，因此本任务的史料条目
  **独立核验并自建台账**（`src/data/sources.ts`），未依赖 05 的产物。
- 下游 `06-museum-core` 若要合并条目，可直接读取本目录 `src/data/sources.ts` 与
  `src/data/timeline.ts`（均为 TS 模块，字段已做结构化处理）。

## 变更日志

- 2026-10-21：完成立项与史料核验（65 条来源，89 个候选 URL 实测可达）。
- 2026-10-21：完成 Vite + TS 脚手架与共享引擎。
- 2026-10-21：完成展项 A《灯塔协议》全部玩法与 AI 对手。
- 2026-10-21：完成展项 B《口袋回声》三区域、三碎片、NPC 对话与机关。
- 2026-10-21：完成展厅壳层、样式与响应式。
- 2026-10-21：完成类型检查、静态构建与首次浏览器实机验收，修复 11 处缺陷（52/52 通过）。
- 2026-10-21：复验收轮次——修复 3 处新缺陷（准备阶段提示、灰烬编队独立时钟、控制条稳定标识），
  加固验收脚本 5 处，断言升级为 53 项，**53/53 通过**，12 张截图重新生成并复核。
- 2026-10-21：恢复轮（监工点名 6 项）——定点取证脚本 `scripts/spotcheck-6.cjs` **7/7 通过**；
  修复 2 处新缺陷（NPC 首句补年份与来源角标、方向键连发延迟 0.24s→0.40s）；
  同一套验收脚本 **53/53 通过**，构建退出码 0，临时服务器已关闭。
- 2026-10-21：改版轮（16 规范可用后）——新增 `src/styles/tokens.css` 令牌层 + `src/fonts/` 5 款自托管 OFL 字体
  + `licenses/` 许可全文；外壳（封面/导航/卡片/按钮/弹层/页脚）统一到余晖设计系统，
  **画布内部与掌机机身色板按红线不动**；新增 `RESTYLE-INVENTORY.md` 替换台账；
  回归 **53/53** + 定点 **7/7**，构建退出码 0，产物无绝对路径。
- 2026-10-21：改版接入归一轮——按监工派单改为**拷贝 `16-design-system/assets/ds/`**：
  新增 `public/assets/ds/`（tokens / components / fonts，逐文件 sha256 与 16 一致），
  删除自建 `src/styles/tokens.css` / `src/styles/fonts.css` / `src/fonts/`；
  外壳改用 16 官方组件类（新增满宽 sticky `.ds-topbar`、`.ds-footer`、`.ds-canvas-frame`、`.ds-skip`、`.ds-btn`）；
  新增 `scripts/restyle-check.cjs` **20/20 通过**；
  并因 16 修正 CJK 字体回退顺序而重新同步 ds 产物并重建复跑——
  回归 **53/53** + 定点 **7/7** + 自检 **20/20**，构建退出码 0，产物无绝对路径。
- 2026-10-21：§9 规范机械复核轮（16 规范就绪告知后）——新增 `scripts/ds-conformance.cjs` **14/14 通过**
  （V.3 / V.11 / V.12 / V.13 + §7 降级写法 + §4.2 HUD 对比度 + §5.1 触摸目标）；
  跑通 16 的 `validate-tokens.mjs`（0 error）与 `verify-preview.mjs`（0 error / 0 warning）；
  修复 2 处真实缺陷（掌机 HUD DOM 文字对比度 4.01/4.40 → ≥4.5:1、来源角标触摸目标 20px → 24px）；
  回归 **53/53** + 定点 **7/7** + 自检 **20/20**，构建退出码 0。
