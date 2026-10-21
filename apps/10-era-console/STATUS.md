# STATUS — 《色块远征》1990s 家用机可玩展厅

最后更新：2026-10-21
对应任务：`10-era-console`（批次 `flash-showcase-20261021`，时代节点 `console16`）
目录：`/Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/10-era-console`

---

## 1. 作品定位与原创命名说明

**《色块远征》/ CHROMA VOYAGE** 是回响电玩馆（PLAYTIME ATLAS）为 1990 年代家用机时代
建立的**可玩展厅子站**，由两件可玩作品与一组带来源的科普展品组成。

| 项目 | 命名 | 说明 |
| --- | --- | --- |
| 展厅节点名 | 1990s 家用机展厅 · 色块远征 | 上级时间线中的时代节点标识 `console16` |
| 展项 01 | 《色块远征：棱晶峡谷》/ PRISM GORGE | 16 位风格横版平台冒险，3 关 |
| 展项 02 | 《等距测绘所》/ SURVEY YARD | 2:1 等距投影的可交互探索庭院，30×22，9 处展台 |
| 主角 | 墨豆 INKBEAN | 方形勘探机器人，12×16 手绘像素精灵 |
| 敌人 | 棱刺 CUSP（地面）/ 巡块 WISP（空中） | 14×14 / 12×12 手绘像素精灵 |
| 收集物 | 色晶 SHARD | 每关 3 枚，共 9 枚 |
| 检查点 | 锚信标 ANCHOR | 8×16 手绘像素精灵 |
| 三关 | 黎明色阶 / 晶脉天梯 / 暮光熔炉 | DAWN STEPS / CRYSTAL LADDER / TWILIGHT FORGE |

**原创性**：本作品**不是**任何既有作品的复刻。参考对象仅为公开作品的**机制与品质标准**
（跳跃手感分层、等距深度排序、"用当时的硬件约束解释当年的画面"这一策展思路）；
作品名、角色、关卡、配色、字体、界面布局、展品文案与全部音乐均为本项目重新设计。
详见 `LICENSES.md` §3（差异对照表）与 `README.md`「原创性说明」。

---

## 2. 本次修复了什么

### 2.1 必修 1 —— D1 元素重叠遮挡（badge 与标题重叠）

**问题**：`.route-card__badge`（"16 位风格" / "早期 3D 质感"）使用
`position: absolute; top: 1.2rem; right: 1.3rem`，而 `.route-card h3` 是普通块级标题、
占满整行宽度——两者在 1440×900 与 390×844 两个视口下都发生几何相交。

**修复方式（可解释布局，不靠 z-index / transform 掩盖）**：把 badge 从绝对定位改为
**正常流中的块级元素，独占标题上方一行**：

```css
/* src/styles/main.css */
.route-card__badge {
  display: block;
  width: fit-content;
  margin-bottom: 0.85rem;
  /* 绝对定位已移除 */
}
.route-card h3 { font-size: 1.16rem; margin-top: 0; }
```

badge 与 `h3` 因此在文档流中先后排列，**任何断点下都不可能相交**；
badge 仍以药丸形 chip 呈现，视觉层级不变（位于卡片标题上方、左对齐）。
`.route-card p` / `.route-card__list` 的排版未改动。

**实测结果**（`node tools/qa/overlap-check.mjs`，只读复用
`13-qa-curation/qa-harness/lib/checks.mjs` 的 `checkOverlaps`）：

| 视口 | 全站文字元素重叠数 | badge×标题重叠数（页顶 / 滚到底） |
| --- | --- | --- |
| desktop 1440×900 | **0**（修复前 1 对 badge×标题） | **0 / 0** |
| mobile 390×844 | **0**（修复前 2 对 badge×标题） | **0 / 0** |

复测输出：

```
✔ desktop 1440x900 — 全站文字元素重叠数 0
✔ desktop 1440x900 — badge×标题重叠数 顶部 0 / 底部 0（共 2 张动线卡片）
✔ mobile 390x844 — 全站文字元素重叠数 0
✔ mobile 390x844 — badge×标题重叠数 顶部 0 / 底部 0（共 2 张动线卡片）
```

### 2.2 必修 2 —— 补齐 `STATUS.md`

即本文件。

### 2.3 同批自查中发现并修复的其他缺陷

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| 1 | **单向平台无法承接落地** | 下落检测只扫描"脚底所在的那一行"，脚底越过平台顶面后该行已变空 | 改为扫描本帧脚底扫过的**行区间** `floor(prevBottom/TILE) … floor(newBottom/TILE)`，并以"本帧起始脚底 ≤ 平台顶面"判定承接 |
| 2 | **角色位移被计算两次** | `PlatformGame` 先 `p.x += p.vx` 再调用内部也会位移的 `moveAndCollide` | 改为只调用一次 `moveAndCollide`，由它统一完成位移与解算 |
| 3 | **坑底色浆覆盖了地面** | 关卡构建器里 `const [, x2] = segs[i+1]` 取到的是段的**右端**而非左端，色浆因此铺到了下一段地面上 | 改为 `const [x2] = segs[i+1]`，色浆只落在真正的空隙列 |
| 4 | **R 键重开无响应** | `restart` 动作已在输入层映射，但游戏主循环从未读取 | 在 `_updatePlayer()` 中接入 `justPressed('restart')` |
| 5 | **触屏轻点几乎跳不起来** | 松键截断系数 0.42 且无最小按住时长，轻点只能跳起约 9px | 截断系数调整为 0.55，并要求至少按住 5 帧才截断；轻点约跳 1 格，长按约跳 3.3 格 |
| 6 | **控制台 404（favicon）** | 页面没有 favicon，浏览器自动请求 `/favicon.ico` | 追加内联 SVG data-URI favicon（不产生外部请求） |
| 7 | **`dist/` 无法用 `file://` 直接打开** | 产物是 ES module，Chrome 对 `file://` 下的模块脚本按 CORS 拦截 | 构建改为 `format: 'iife'`，并由 `scripts/inline-assets.mjs` 把 CSS/JS 全部内联；`dist/` 现在只有单个 `dist/index.html`，Pages 子路径与离线双击两种方式都可用 |
| 8 | **展品面板 Esc 无法关闭** | 覆盖层只查找 `data-action="cancel"`，而实际按钮 id 是 `close` | 依次尝试 `cancel` → `close` → 可关闭时直接隐藏 |
| 9 | **展厅面板遮住平台页按钮** | 上一条导致面板残留，固定定位的全屏面板拦截了后续点击 | 修复第 8 条后消除；同时把面板的 z-index 与层级收敛 |

### 2.4 第 3 关「暮光熔炉」的几何公平性修复

自动玩家实机通关时，逐帧回溯发现第 3 关存在**对人类玩家同样无解**的摆放——
不是难度问题，是关卡几何自相矛盾。已逐条修复，并用新增的 3 条单元测试锁死：

| # | 问题 | 为什么无解 | 修复 |
| --- | --- | --- | --- |
| 1 | 色晶 (36,9) 压在尖刺 (35–36,10) 正上方 | 「跳起拾晶」的同一次跳跃必然踩到尖刺 | 色晶移到 (39,9) |
| 2 | 色晶 (108,11) 紧贴尖刺 (106–107,12) 落地区 | 需要帧级精确才能既拾晶又越刺 | 色晶移到 (104,11) |
| 3 | 尖刺 (56,12) 宽 3 格 | 3 格宽需连续 48px 滞空，满跳射程仅 ≈74px，余量 < 10px | 改为 2 格宽 |
| 4 | 尖刺紧贴落脚板落地区 | 从落脚板跳下时落地即踩刺 | 后移 / 移出该段 |
| 5 | 地面敌人巡逻区与尖刺落地区重叠 | 落地瞬间与敌人重叠必死 | 敌人重排到有余裕的段落 |
| 6 | 第 2 关浮游敌人覆盖**强制跳跃弧线** | 跨越深坑的必跳弧线必然撞上浮游敌人 | 浮游敌人上移并缩小巡逻范围 |

新增护栏（`tests/levels.test.js`）：**尖刺宽度 ≤ 2 格**、**色晶不压在尖刺上**、
**地面敌人巡逻范围不与尖刺落地区重叠**。关卡设计约束同时写进
`src/platform/levels.js` 顶部注释（约束 5–7）。

### 2.5 QA 机器人的 9 处缺陷（测试工具侧）

`tools/qa/browser-check.mjs` 里的自动玩家最初**记录的是复活后的检查点坐标而不是死亡点**
（死亡记录写在 `state !== 'playing'` 的提前 `return` 之后），
导致前几轮排障结论完全失真。修正后逐帧回溯，共定位并修复 9 处机器人缺陷，
其中 3 处直接反映了引擎的真实行为（跳跃截断、跳跃缓冲过期、支撑探测范围），
已在上文 2.1–2.3 与 `QA.md` §2.4 中逐条列出。

### 2.6 来源核验脚本的健壮性

`scripts/verify_exhibit_sources.sh` 原来连续高频请求维基百科，会被限流返回 `000`。
现改为逐条限速 0.8s + 单条失败自动重试 3 次并递增退避。

---

## 3. 本地运行与构建方式

环境要求：Node ≥ 18（实测 Node v24.13.0 / npm 11.6.2）。

```bash
cd 10-era-console
npm install          # 仅 vite@5.4.11（构建期依赖）

npm run start        # 自动安装依赖并启动开发服务 http://127.0.0.1:4330/
npm run build        # 产出 dist/index.html（单个自包含文件）
npm run preview      # 以 4330 端口预览已构建产物
npm test             # 33 项逻辑测试（Node 内置 test runner）
npm run verify:sources   # 核验 26 条展品来源链接可达性

# 浏览器实机验收（Playwright 装在独立子包 tools/qa/，不进交付产物）
cd tools/qa && npm install && cd ../..
node tools/qa/browser-check.mjs   # 38 项实机验收，含自动玩家三关通关
node tools/qa/overlap-check.mjs    # D1 元素重叠检查（只读复用 13-qa-curation 的 harness）
```

**端口**：`vite.config.js` 中 `server` 与 `preview` 均固定 `127.0.0.1:4330`，`strictPort: true`。

**产物形态**：`npm run build` 后 `dist/` 内只有一个 `dist/index.html`（约 124 KB，
CSS 与 JS 全部内联）。

- 适配 GitHub Pages 任意子路径：产物内无任何 `/` 绝对路径引用；
- 可直接双击 `dist/index.html` 离线运行（经典脚本，不受 `file://` 模块 CORS 限制）；
- 可被 `<iframe src=".../10-era-console/">` 嵌入：检测到嵌入时显示提示条并隐藏「返回总馆」外链，
  同时对外暴露 `window.PLAYTIME_ATLAS_NODE` 与 `postMessage({type:'playtime:nav', ...})` 协议。

---

## 4. 来源与许可要点

- **来源**：21 条科普展品共引用 **26 条唯一来源链接**，全部为公开可查的史料条目。
  2026-10-21 用 `scripts/verify_exhibit_sources.sh` 逐条实际请求核验，
  **26/26 返回 HTTP 200**（脚本本轮补上限速与重试，见 §2.6）。
  逐条事实与来源的对照见 `SOURCES.md` §2。
  *复测窗口备注*：定稿前再次运行该脚本时，运行环境对所有站点的 HTTPS 出站连接被临时阻断
  （`curl https://example.com` 同样返回 `000`，DNS 与 ICMP 正常），属沙箱网络策略而非链接失效；
  相关低速逐条复测中此前批量失败的条目单独请求均返回 200。
- **许可**：仓库内**零位图、零音频文件**；唯一的二进制资产是界面字体（4 个 OFL 字体家族，自托管，
  随包附许可全文，见 `LICENSES.md` §2）。像素精灵与 5×7 点阵字体为手工逐像素绘制，
  图标 / 地形 / 展台 / 主视觉均为运行时程序化生成，音乐与音效由 WebAudio 实时合成
  （五首原创芯片曲 + 两段过场）。
- 第三方依赖仅 `vite`（MIT，构建期）与 `playwright`（Apache-2.0，仅测试期），
  二者**均不进入 `dist/` 产物**。
- **引用 ≠ 授权**：展品指向公开史料是为了让读者自行复核事实陈述，
  不构成对任何来源站点、厂商或作品作者的授权、背书或从属关系声明。
  完整边界见 `LICENSES.md`。

---

## 5. 已知限制

1. 展品是**代表性选样**，不宣称覆盖 1990 年代全部主机与作品。
2. 展品事实**主要依赖英文维基百科条目**（次级来源），单源条目占比高（20 条展品中 13 条为单源），
   未做多源互证；「位数」等硬件参数在不同来源中口径不一，页面与 `SOURCES.md` 均已标注该限制。
3. **中文**仍依赖使用者操作系统的中文字体（拉丁字体已自托管，见 §6.2），
   不同系统上字形与字距会有差异；这是 16-design-system §8 的 cjkStrategy 同款选择。
4. 音频需用户手势后才能启动（浏览器自动播放策略），页面上提供音效开关。
5. 移动端自动通关由脚本化"自动玩家"代跑，该玩家并非人类操作水平，
   其成绩只能证明**关卡在几何上可通关**，不能替代真人手感评测。
6. 等距测绘所的**触屏双指缩放 / 多指手势未纳入自动化验收**（浏览器自动化对多指手势支持有限），
   该部分以代码走查与人工操作为准。
7. 本任务**不做部署**；上线由 `14-publish` 统一执行，本目录不含任何推送 / 发布动作。
8. **改版批的以下维度无参考站实测依据，属本批自定**（RESTYLE-SPEC §2）：
   ① 默认采用**暗色主题**（16 的暗色主题组取值本身即规范值，但"本作品选暗色"是本批决定）；
   ② 覆盖层锚定在画布框内、**不套用整屏 `.ds-lightbox`**（沉浸式作品的画布边界，见 §6.3）；
   ③ CRT 扫描线覆盖层与封面硬阴影保留本作品原有写法（1990s 身份表达）；
   ④ 画布语义色在 DOM 侧的保留边界（HUD 三个语义 chip、图例色块、热点圆点、关卡语义顶边色）。
   逐条清单见 `RESTYLE-INVENTORY.md` §5。
9. 16 的 `noto-sans-sc-subset.woff2` **已随本作品分发**（15 派单「接入三步」第 ② 步要求整目录拷贝，
   本目录保留与 16 逐字节一致的副本）。该子集按 07-museum-art 自身用字生成，**覆盖有限**：
   本目录已实测其对本作品用字的覆盖率为 **源文本集 596/971（61.4%）、实际渲染文本集 413/585（70.6%）**
   （测量方法、阳性/阴性对照组与结论见 `QA.md` §4.3）。但因它在字体栈中排在全部「覆盖完整的系统 CJK 族」之后，
   **在装有中文字体的系统上不会被启用**，汉字一律由系统黑体绘制，缺字时逐字回退，不会出现缺字方框；
   仅当系统完全没有 CJK 字体时它才会生效，此时未覆盖字形回退到通用 sans-serif。
   另注：该子集的字重为 **Thin（细体）**，即使生效也会与系统黑体的字重观感不同。
10. 自托管字体在构建期被内联为 base64 data URI，因此**无法做文件级 preload**；
    首屏字体随 CSS 同步到达，`font-display: swap`。
11. 改版批只落地了**暗色主题**；`:root` 中的浅色组取值与 16 一致，
    若将来需要浅色模式，移除 `<html data-ds-theme="dark">` 即可（令牌层已备好）。

---

## 5.1 实测结论（本次交付）

| 项目 | 实测结果 |
| --- | --- |
| `npm test` | **33 / 33 通过** |
| `npm run build` | 退出码 0，产出单文件 `dist/index.html`（约 672 KB；含 base64 内联的自托管字体，其中 Noto Sans SC 子集约占 257 KB） |
| `node tools/qa/overlap-check.mjs` | 1440×900 与 390×844 全站文字重叠 **0**、badge×标题重叠 **0 / 0** |
| `node tools/qa/token-check.mjs` | 令牌一致性 **PASS**（拷贝件 sha256 一致；`:root` 129 个 + 暗色组 21 个令牌与 `design-tokens.json` 逐项等价比对 141 项） |
| `node tools/qa/font-coverage.mjs --rendered` | Noto Sans SC 子集覆盖率：**源文本集 61.4%**、**实际渲染集 70.6%**（阳性/阴性对照组均通过） |
| `node tools/qa/browser-check.mjs` | **38 / 38 通过，0 失败**（改版后连续 4 轮复跑一致） |
| 自动玩家实机通关 | **三关全部通关**（黎明色阶 / 晶脉天梯 / 暮光熔炉，每关 3/3 色晶），**全程 0 次死亡**，用时 44s / 2602 帧 |
| `dist/index.html` 离线双击 | 机型 15 条 / 展品 21 条 / Logo 已绘制 / **0 外部请求 / 0 JS 错误** |

完整分组结果、逐条复现命令与已知限制见 **`QA.md`**。

> **浏览器入口边界（2026-10-22 用户长期约定）**：本目录 §5.1 的全部浏览器实测均为
> **本地离线自测**——只加载 `http://127.0.0.1:4330`（本地 `vite preview`）与 `file://`（本地 `dist/`），
> 脚本自身断言「无外部网络请求（零 CDN）」，**不访问任何外部站点**。
> **线上验收（Pages 实际 URL 的核心交互核验）按约定走 Ego 浏览器**，由 14-publish / 13-qa-curation 在发布后执行。
> 详见 `QA.md` §0.1。

---

## 6. 改版批执行记录（15-supervisor `RESTYLE-SPEC.md`）

### 6.1 阶段与依据

| 项 | 内容 |
| --- | --- |
| 当前阶段 | **第 2 步「增量改版」已完成**（含 15 最新派单的接入三步重构，见 §6.7）；第 3 步（13 风格/双语验收）与第 4 步（14 发布）由外部执行 |
| 第 1 步交付 | `RESTYLE-INVENTORY.md` —— 待替换清单（文件 + 选择器 + 旧值 → 16 token 候选路径）+ 10 条豁免清单 |
| 风格依据 | `16-design-system` 的四份产物（`DESIGN-SPEC.md` / `design-tokens.json` / `preview.html` / `REFERENCE-AUDIT.md`）+ **按 15 派单接入三步拷贝 `src/tokens.css`、`src/components.css`、`fonts/`**（逐字节副本，sha256 强制校验） |
| 接入路径 | MIGRATION-NOTES §2.0 为本目录指定的**路径 A**（旧变量重定向）＋ 路径 C 的外壳类名（`.ds-*`）；**文件层面改用 15 派单的 `assets/ds/` 布局** |
| 主题 | **暗色**：`<html data-ds-theme="dark">`，令牌层按 §1.1-A2 用 `[data-ds-theme="dark"]` 选择器给出 |
| 命名空间纪律 | `--ds-*` 只在 `assets/ds/tokens.css` 声明一次，其余样式文件只消费（`tools/qa/token-check.mjs` 强制校验） |

### 6.2 改版产物清单

| 文件 | 作用 |
| --- | --- |
| `RESTYLE-INVENTORY.md` | **第 1 步交付物**：待替换清单 + 豁免清单 + 本批自定项 + 自测清单 |
| `assets/ds/tokens.css` | **16 的逐字节副本**：令牌层，`:root` 129 个 `--ds-*` + 暗色组 21 个，含 `:lang(zh)` 中文排版规则与 `prefers-reduced-motion` 降级 |
| `assets/ds/components.css` | **16 的逐字节副本**：组件层 `.ds-topbar` / `.ds-cover__*` / `.ds-btn` / `.ds-chip` / `.ds-tag` / `.ds-work` / `.ds-canvas-frame` / `.ds-canvas-frame__hud` / `.ds-key` / `.ds-footer` / `.ds-skip` / `.ds-indicator` / `.ds-in` 等 |
| `assets/ds/fonts/` | **16 的逐字节副本**：5 个 woff2（含 Noto Sans SC 子集）+ 5 份 OFL 全文 + `fonts.css` + `FONT-MANIFEST.json` |
| `src/styles/main.css` | 本作品自有样式：外壳层全部消费 `--ds-*`；旧变量保留为**语义别名**指向新 token；另含 5 条对 16 组件层的**本地增量覆盖**（见 §6.7.2） |
| `tools/qa/token-check.mjs` | 令牌与接入自检（拷贝件 sha256 + 与 `design-tokens.json` 逐项等价比对 + 命名空间 + 悬空引用 + 机制保真 + 字体自托管 + 接入三步接线） |
| `tools/qa/font-coverage.mjs` | Noto Sans SC 子集汉字覆盖率实测（逐字字体归属 + 阳性/阴性对照组） |
| `tools/qa/viewport-a11y-check.mjs` | 四档视口（1440 / 1280 / 768 / 390）无障碍自检：横向溢出、正文对比度 ≥4.5、焦点环可见、Tab 序列不被吞、两档触摸目标 |

### 6.3 统一范围与豁免

**已统一**：页头、封面、详情、卡片、按钮、筛选 chip、标签、画布容器与边框、HUD 外框、
键位提示、页脚、跳转链接、焦点环、动效时长与曲线、触摸目标两档、中文字距与行高。

**未统一（10 条豁免，逐条依据见 `RESTYLE-INVENTORY.md` §3）**：
游戏画布内部全部配色（3 关地形/天空/敌人/液体/粒子）、图标 canvas、5×7 点阵字模、
等距庭院地形与展台配色、HUD 三个语义 chip 色（生命/色晶/时间，与画布元素一一对应）、
等距图例色块与热点圆点、覆盖层 4 条关卡语义顶边色。

### 6.4 改版带出的无障碍补强

| 项 | 改前 | 改后 |
| --- | --- | --- |
| 弹层焦点 | Esc + 初始焦点 | 追加**焦点陷阱**（Tab/Shift+Tab 循环）与**焦点归还**（关闭后回到打开前元素） |
| 导航当前项 | 仅 `.is-active` 类 | 追加 `aria-current="page"` |
| 筛选 chip | 仅 `.is-active` 类 | 追加 `aria-pressed` |
| 焦点环 | 无统一样式 | 统一 `--ds-focus-ring`（2px 强调色 + 2px 背景偏移），任何状态不移除 |
| 触摸目标 | 未分级 | 主控件 ≥44px（`.ds-btn`）、紧凑变体 32px（`.ds-btn--sm`，仅工具栏/元信息栏/筛选条） |
| 跳转链接 | 自定义 off-screen 写法 | `.ds-skip`（`top:-100px` → 聚焦归位） |

### 6.5 改版后复验

| 项目 | 结果 |
| --- | --- |
| `npm test` | **33 / 33 通过**（关卡与物理逻辑未改动） |
| `npm run build` | 退出码 0，产出单文件 `dist/index.html`（约 672 KB；5 个 woff2 均 base64 内联） |
| `node tools/qa/overlap-check.mjs` | 1440×900 与 390×844 全站文字重叠 **0**、badge×标题重叠 **0 / 0** |
| `node tools/qa/token-check.mjs` | 令牌一致性 **PASS**（拷贝件 sha256 一致 + 与 `design-tokens.json` 逐项等价比对） |
| `node tools/qa/font-coverage.mjs --rendered` | Noto Sans SC 子集覆盖率：**源文本集 61.4%**、**实际渲染集 70.6%**（对照组通过） |
| `node tools/qa/viewport-a11y-check.mjs` | 四档视口（1440×900 / 1280×800 / 768×1024 / 390×844）：横向溢出 **0**、正文对比度不足 **0** 处、焦点态可见 **8/8**、Tab 可移动焦点、触摸目标不足 **0** 个；展品面板（覆盖层）同样全绿 |
| 16 的 `validate-tokens.mjs` / `verify-preview.mjs`（只读借用，临时目录内以**本目录交付的拷贝件**为输入） | **PASS：0 error / 0 warning**；四档视口无横向溢出、对比度 12 项最低 **4.93**、触摸目标 AA/AAA 全达标、5 个自托管字体（含 Noto Sans SC）全部 `loaded`、reduced-motion 生效、深色主题与 16 逐值一致。详见 `QA.md` §4.5 |
| 16 的 `ds-audit-tokens.mjs`（全库只读审计） | 本目录 **🟢**：必备缺 0 必备值差 0、声明 129 缺 0 值差 0 额外 0、**字体栈顺序问题 0**；令牌文件定位为 `assets/ds/tokens.css`（16 脚本自行定位，非人工指定） |
| `node tools/qa/browser-check.mjs` | **38 / 38 通过，0 失败**；自动玩家三关全通、**0 次死亡** |
| 外部请求 / 控制台错误 | **0 / 0**（含 `file://` 离线打开） |

### 6.6 改版带动的验收工具调整（测试侧，不影响产品）

| 调整 | 原因 |
| --- | --- |
| QA 自动玩家改为**按物理步长决策**（包住游戏的 `update()`），不再按渲染帧决策 | 原实现一帧可能推进多个物理步，机器人会"慢半拍"而撞上敌人，成绩不可复现 |
| QA 自动玩家的落点安全检查增加**敌人巡逻范围**判定 | 原实现只看尖刺与支撑，会落在敌人的巡逻范围内被撞 |
| 浏览器验收脚本增加**环境性崩溃的整轮重试** | 共享机器内存压力下系统会杀掉浏览器进程（本次实测 swap 已用 42.5/44 GB、load 22+），属环境事件而非产品缺陷 |
| 新增 `tools/qa/font-coverage.mjs`（Noto 子集覆盖率实测） | 15 派单要求「随包分发后须实测汉字覆盖率并写入限制节」；环境无 fonttools/brotli，故改用 CDP `CSS.getPlatformFontsForNode` 逐字字体归属法，并配阳性/阴性对照组防止方法本身失真 |

### 6.7 15 派单「接入三步」的重构（本轮最终形态）

15 最新派单把接入方式从「只读引用、不复制文件」改为**拷贝 16 的文件到本目录 `assets/ds/`**，
本节记录重构的最终形态与逐条依据。

#### 6.7.1 接入三步的落地

| 步骤 | 派单要求 | 本目录落地 |
| --- | --- | --- |
| ① | 拷贝 `16-design-system/src/tokens.css` + `src/components.css` → `assets/ds/` | `assets/ds/tokens.css`、`assets/ds/components.css`，**sha256 与 16 逐字节一致**（`token-check` 强制校验） |
| ② | 拷贝 `16-design-system/fonts/` → `assets/ds/fonts/` 并引入其 `fonts.css` | `assets/ds/fonts/`（5 woff2 + 5 OFL 全文 + `fonts.css` + `FONT-MANIFEST.json`），由 `src/main.js` 第 1 个 import 引入 |
| ③ | 入口注入 `<style>:root{--ds-base:"/playtime-atlas-20261021/";}</style>`，并给 `<body>` 加 `class="ds-shell"` | `index.html` 已注入（无 JS 也能用）；`<body class="ds-shell">`；`#app` 上的 `ds-shell` 已移除 |

**样式引入顺序**（`src/main.js`，层叠不可颠倒）：
`assets/ds/fonts/fonts.css` → `assets/ds/tokens.css` → `assets/ds/components.css` → `src/styles/main.css`

**消除双 token 层**：原自建的 `src/styles/tokens.css`、`src/styles/ds.css` 与 `fonts/` 已删除，
`--ds-*` 只在 `assets/ds/tokens.css` 声明一次；本目录自有的语义别名（旧 `--ink/--paper/--radius/--wrap/--font-*`）
保留在 `src/styles/main.css` 的 `:root` 内。**未删除任何既有 CSS 规则**（红线要求），
只做了增量覆盖。

#### 6.7.2 对 16 组件层的 6 条本地增量覆盖（`src/styles/main.css` §A）

| # | 覆盖 | 原因 |
| --- | --- | --- |
| A1 | `.ds-btn { --ds-btn-h: var(--ds-target-min) }` | 16 的 components.css 写 `--ds-btn-h: var(--ds-space-10)`（= **128px**），与 MIGRATION-NOTES §5.1「主控件 44px / 紧凑控件 32px」不符，会让无变体类的 `.ds-btn` 变成 128px 高。`--sm` / `--lg` 变体各自直接声明 `height`，不受影响 |
| A2 | `:where(.ds-btn) { background: transparent }` | 16 的基础 `.ds-btn` 不声明背景，浏览器默认 `buttonface`（白）会漏出，暗色主题下白底 + 浅色文字 = 不可读。用 `:where()` 保持 0 特异度，各变体类仍按各自取值生效 |
| A3 | `:lang(zh).ds-shell, :lang(zh) .ds-btn, :lang(zh) .ds-cover__title { letter-spacing: var(--ds-track-cjk) }` | 15 派单红线「不要给中文加负字距」。16 的 `.ds-btn` 有 `-0.01em`、`.ds-cover__title` 有 `--ds-track-display`（`-0.03em`）、`.ds-shell` 有 `--ds-track-body`（`-0.005em`），三者对中文一律归零 |
| A4 | `html:not(.has-js) .ds-in { opacity: 1; transform: none; filter: none }` | 16 的 `.ds-in` 无条件 `opacity: 0`；本作品要求脚本失效时内容必须可见。`src/main.js` 另加启动异常兜底：捕获错误或未捕获异常时移除 `has-js` |
| A5 | `body.ds-shell { background: <径向渐变> }` | 16 的 `.ds-shell` 带 flat 底色并会盖掉 `body` 的径向渐变；用 `body.ds-shell`（特异性 0,1,1）覆盖，保留本作品的层次感 |
| A6 | `.prose a, .exhibit-panel__sources a, .footer__meta a { display: inline-block; padding-block: 2px; min-height: 24px }` | WCAG 2.2 SC 2.5.8（AA，硬性）：全部可交互元素点击区 ≥24×24px。16 的组件层未覆盖正文/面板内的**行内文本链接**，其点击区高度 = 行高（本目录实测 21px）。用 padding 增高点击区，不改变行盒高度与基线对齐 |

#### 6.7.3 `--ds-base` 的两段式处理

- **静态兜底**：`index.html` 注入 `/playtime-atlas-20261021/`（15 派单要求的生产子路径），脚本未执行时也生效。
- **运行期覆盖**：`src/main.js` 用 `import.meta.env.BASE_URL`（`vite.config.js` 的 `base: './'`）覆盖为相对基准 `./`，
  使同一份产物在 Pages 任意子路径、本地预览与 `file://` 离线打开下都成立。

#### 6.7.4 产物体积的变化

单文件 `dist/index.html` 由 **400 KB 增至 672 KB**，增量全部来自 Noto Sans SC 子集的 base64 内联
（197 600 B → 约 257 KB base64）。16 的 `fonts/` 要求整目录拷贝，故按派单保留该文件；
字体在字体栈中位于全部覆盖完整的系统 CJK 族之后，实际访问不会被启用。

---

## 7. 变更日志

| 日期 | 内容 |
| --- | --- |
| 2026-10-21 | 创建 `TASK.md`，完成策展研究与来源核验（26/26 可达） |
| 2026-10-21 | 搭好 Vite + 4330 端口工程；实现原创像素平台冒险（3 关）、等距测绘所（9 展台）、程序化芯片音乐 |
| 2026-10-21 | 补齐 30 项逻辑测试与浏览器实机验收脚本；修复单向平台承接、位移重复计算、色浆覆盖地面等 5 处引擎缺陷 |
| 2026-10-21 | **修复 D1 badge×标题重叠**（badge 改为正常流独占一行），1440×900 与 390×844 实测重叠数 0 |
| 2026-10-21 | 补齐 `STATUS.md`；补 favicon、构建改为单文件自包含 `dist/index.html` |
| 2026-10-21 | **第 3 关几何公平性修复**（6 处无解摆放）+ 新增 3 条关卡约束单测；逻辑测试 30 → **33 项** |
| 2026-10-21 | **自动玩家实机通关三关**：修正 QA 机器人的 9 处缺陷（死亡记录取错坐标、点按触发跳跃截断、跳跃缓冲过期、尖刺起跳窗口算错、落点安全检查漏判上方落脚板、落点距离估算偏乐观、空中误触跳跃键、尖刺漏检、不会避让浮游敌人） |
| 2026-10-21 | 浏览器实机验收 **38 / 38 通过**，自动玩家三关通关 **0 次死亡**；新增 `QA.md`；来源核验脚本补上限速与重试 |
| 2026-10-21 | **改版批第 1 步**：产出 `RESTYLE-INVENTORY.md`（待替换清单 + 10 条豁免清单 + 本批自定项） |
| 2026-10-21 | **改版批第 2 步**：落地 `src/styles/tokens.css`（130 个 `--ds-*`）、`src/styles/ds.css`（外壳组件层）、自托管 OFL 字体（`fonts/` + `LICENSES.md` 登记）；`src/styles/main.css` 外壳层全部 token 化；补弹层焦点陷阱与焦点归还、`aria-current` / `aria-pressed`、统一焦点环与触摸目标两档 |
| 2026-10-21 | 改版后复验：`npm test` 33/33、`npm run build` 退出码 0（单文件 400 KB）、两断点 badge×标题重叠 **0 / 0**、`token-check` PASS、浏览器验收 **38 / 38** 且自动玩家 **0 死亡**；QA 自动玩家改为按物理步长决策（消除时序敏感） |
| 2026-10-21 | **15 派单接入三步重构**：拷贝 16 的 `tokens.css` / `components.css` / `fonts/` 到 `assets/ds/`（sha256 逐字节一致）；`index.html` 注入 `--ds-base`、`<body class="ds-shell">`；`src/main.js` 样式引入顺序改为 assets/ds 在前；删除自建的 `src/styles/tokens.css`、`src/styles/ds.css` 与 `fonts/`（消除双 token 层）；`src/styles/main.css` 增加 5 条对 16 组件层的本地增量覆盖（A1 `--ds-btn-h` 128px→44px、A2 裸 `.ds-btn` 白底、A3 中文负字距归零、A4 `.ds-in` 失效安全、A5 `body.ds-shell` 背景） |
| 2026-10-21 | 新增 `tools/qa/font-coverage.mjs`：以 CDP 逐字字体归属法实测 Noto Sans SC 子集对本作品用字的覆盖率（**源文本集 61.4%、实际渲染集 70.6%**，阳性/阴性对照组均通过），结论写入 `LICENSES.md` / `README.md` / `STATUS.md` / `QA.md` 的限制节 |
| 2026-10-21 | 接入重构后复验：`npm test` 33/33、`npm run build` 退出码 0（单文件 **672 KB**，含 Noto 子集 base64）、两断点 badge×标题重叠 **0 / 0**、`token-check` PASS、浏览器验收 **38 / 38** 且自动玩家 **0 死亡** |
| 2026-10-21 | 新增 `tools/qa/viewport-a11y-check.mjs`（四档视口无障碍自检）：横向溢出 0、正文对比度不足 0 处、焦点态 8/8 可见、Tab 不被吞；据此修掉 **1 处真实 AA 缺陷**（页脚与展品面板的行内链接点击区仅 21px < 24px，补 A6 覆盖） |
