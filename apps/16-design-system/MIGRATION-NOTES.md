# MIGRATION-NOTES — 改版逐项替换清单（00—19）

> **本文件是 15-supervisor 向 00—19 派单的依据。**
> 编制方：**16-design-system**（唯一风格规范产出方）
> 编制时间：2026-10-21 20:50 (GMT+8)
> 权威取值来源：`design-tokens.json`（代码侧唯一取值来源）＋ `DESIGN-SPEC.md`（成文规范）＋ `preview.html`（视觉对照物）
>
> **本文件只出规范与对照，不改任何业务代码，也不直接给作者派活。** 改版派单统一由 15-supervisor 发。
> 取用方式遵循 `15-supervisor/RESTYLE-SPEC.md` §1：**只读引用，不复制文件**；各目录在自己的 `src/styles/` 落地 token 层并注明依据。

---

## ⚠️ 第 0 节：三个必须先读的前置风险

### 风险 A —— `--ds-` 命名空间冲突（**最高优先级**）

`--ds-` 前缀已被两个目录**以不同语义**占用。若它们再引入本系统的 `src/tokens.css`，同名变量会按 CSS 加载顺序互相覆盖，**且覆盖后值完全不同**：

| 目录 | 现有 `--ds-` 语义 | 与本系统冲突示例 |
| --- | --- | --- |
| **05-museum-research** | ✅ **已解决**（**22:5x 复测**：自有 `--ds-space-*` / `--ds-radius-*` / `--ds-color-*` 命名空间已清理；**129 个 `--ds-*` 取值与规范逐名一致**；**`:root` 动效时长已是规范值 120/200/320/520/800ms + entry 640ms**，`1ms` 只存在于降级块内；**字体栈顺序已合规**；**自有 CSS 0 个 `--ds-*` 声明**） | 无冲突残留。**本行原写的「需修复被写死的 `--ds-dur-*: 1ms`」已失效**——该项由 05 于 22:25 前完成，并经 15-supervisor 独立核验 |
| **01-web** | 🔴 **仍存在**：已整体引入本系统 tokens 的**旧版快照**（118 处 `--ds-` 定义），其中 `--ds-ink-faint: #a79e97`（**2.54:1，不达 AA**）、`--ds-ink-soft: #6b625c`（偏离规范 `#59514B`） | 本系统已修正为 `#6E655E`（**5.51:1**）；且缺 `--ds-target-min` / `--ds-radius-xs` / `--ds-shadow-1` / `--ds-dur-instant` / `--ds-space-1` 等，残缺 |

**处置（由各原作者执行）**
1. **05-museum-research**（✅ **全部已解决**，22:5x 复测）：命名空间冲突已清理；动效时长**已是规范值**，降级逻辑已在 `prefers-reduced-motion` / `[data-rm="reduce"]` 块内；字体栈顺序已合规；自有 CSS 不声明任何 `--ds-*`。**本条原列的「恢复 `--ds-dur-*: 1ms`」已失效，无需再动。** 详见 §2.0 与 §2.0.1。
2. **01-web**（🔴 **仍待修**，22:5x 复测）：用本系统 `src/tokens.css` **整体替换**其 `src/styles/tokens.css` 中的 `--ds-` 区块（不是追加第二份），把 `--ds-ink-faint` 更新到 `#6E655E`、`--ds-ink-soft` 更新到 `#59514B`，补 `--ds-target-min`；随后校验 §5 的必备令牌全部存在。**注意**：`#A79E97` **不是**参考站的灰（参考站实测为 `#999999`，2.85:1）——它是本系统自己的历史取值，见 §5.2。
   > **本行原列的缺失清单已失效**（22:5x 实测）：01 **不缺** `--ds-radius-xs` / `--ds-shadow-1` / `--ds-dur-instant` / `--ds-space-1`——这些都在位。实测**必备 17 项中仅缺 `--ds-target-min` 1 项**；全量缺 11 项（`--ds-in-delay` `--ds-rail-scale` `--ds-rail-blur` `--ds-work-dim` `--ds-contrast-text` `--ds-contrast-large` `--ds-contrast-ui` `--ds-target-min` `--ds-focus-width` `--ds-focus-offset` `--ds-font-display-src`），均**非必备**。另：**字体栈顺序仍为旧序**（见 §2.0.1）。

> 本系统已收到 01-web 的迁移询问；**它的语义别名层（`--ink-*` / `--paper-*` / `--signal-*` 指向 `--ds-*`）是正确做法，应保留**。

### 风险 B —— `--ds-` 变量重复声明

同时加载「目录自有 token 文件」与「本系统 tokens.css」时，同名变量由**后加载者**胜出。
**规定**：本系统的 token 变量**只在**本系统 token 层声明一次；目录自有层只允许声明**语义别名**（`--ink-900: var(--ds-bg)`），不允许重新定义 `--ds-*` 的取值。

### 风险 C —— 沉浸式作品的画布色板**不在统一范围内**

02 / 04 / 08 / 09 / 10 / 11 / 12 的**游戏画面内部**使用高饱和自有色板（如 `--magenta #ff2e88`、`--cyan #26e6ff`、`--gold #E9A93D`）。这些色板服务于玩法辨识与可玩性，**统一它们会伤害游戏**。

**统一范围仅限"外壳"**：页头、页脚、封面、详情、卡片、HUD 容器、控件、导航轴、指示器、灯箱。
游戏画布内部（`canvas` 绘制、场景色、角色色、粒子、HUD 内自定义色）**一律不动**。详见 §4。

---

## 1. 接入四步（任何目录通用）

```
① 落地 token 层      在自己的 src/styles/ 新建或扩展 tokens.css，
                     变量名用 --ds-*，取值抄自 design-tokens.json，
                     文件头注明「依据 16-design-system/design-tokens.json §<节>」
② 落地字体          自托管，禁止 CDN/外链；许可登记进本目录 LICENSES.md
③ 换外壳            顶栏/页脚/封面/卡片/详情/控件/导航轴/指示器 → §3 的 .ds-* 类
④ 注入基准路径      :root{--ds-base:"/playtime-atlas-20261021/"}   ← 见 §6
```

**不要求**删除既有 CSS。既有类名保留，**在其上叠加** `.ds-*` 或把旧变量重定向到新 token（推荐后者，见 §2）。

### 1.1 三种接入路径（选一条，**可直接复制**）

> 三条路径**互斥或可叠加**，按目录现状与改造量选。**推荐顺序：C > B > A**（先统一 token 层，再换外壳）。

#### 路径 A —— 纯 CSS 变量覆盖

**适用场景**：目录已有完整 CSS 体系，只想换配色/字体/圆角/间距，**不想引入新类名、不想动结构**。

复制下面这段到既有样式表的 **最前面**（或紧跟既有 `:root` 之后）。它就是本系统 token 的**最小可用集**，不依赖任何外部文件：

```css
/* ===== 余晖设计系统 · 最小 token 集 =====
   依据 16-design-system/design-tokens.json（2026-10-21 v1.0.0）
   浅色主题。如需深色主题，另见本文件 §1.1-A2 */
:root{
  /* 颜色 */
  --ds-ink:#14110F;          --ds-ink-soft:#59514B;   --ds-ink-faint:#6E655E;
  --ds-bg:#FCFBF9;            --ds-bg-raised:#FFFFFF;  --ds-bg-sunken:#F2EEE9;
  --ds-accent:#B4432B;       --ds-accent-hover:#97361F; --ds-accent-ink:#FFFFFF;
  --ds-line:#E4DED7;          --ds-line-strong:#CFC6BC;
  /* 间距 */
  --ds-space-1:4px;  --ds-space-2:8px;  --ds-space-3:12px; --ds-space-4:16px;
  --ds-space-5:24px; --ds-space-6:32px; --ds-space-8:48px; --ds-space-10:64px;
  /* 圆角 */
  --ds-radius-xs:6px; --ds-radius-sm:10px; --ds-radius-md:14px;
  --ds-radius-lg:20px; --ds-radius-xl:28px; --ds-radius-pill:999px;
  /* 字体 */
  --ds-font-display:'Space Grotesk','Noto Sans SC',-apple-system,'PingFang SC',sans-serif;
  --ds-font-text:'Inter','Noto Sans SC',-apple-system,'PingFang SC',sans-serif;
  --ds-font-mono:'Space Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
  /* 动效 */
  --ds-dur-instant:120ms; --ds-dur-fast:200ms; --ds-dur-base:320ms;
  --ds-dur-slow:520ms;    --ds-dur-reveal:800ms;
  --ds-ease-out:cubic-bezier(0.22,1,0.36,1);
  /* 尺寸与基准路径 */
  --ds-target-min:44px;
  --ds-base:"/playtime-atlas-20261021/";
}
```

然后把本地变量**重定向**到上面这些（**这是本系统推荐的主要动作**，改一处全站生效）：

| 本地变量（各目录实测命名） | → 规范 token | 本地值 | 规范值 |
| --- | --- | --- | --- |
| `--ink` / `--text` / `--ink-900` | `--ds-ink` | `#0a1020` / `#dfe4ef` / `#070E19` | `#14110F` |
| `--ink-2` / `--text-dim` / `--ink-700` | `--ds-ink-soft` | `#0e1526` / `#97a0b6` | `#59514B` |
| `--ink-3` / `--text-faint` / `--muted` | `--ds-ink-faint` | `#141d33` / `#626c83` / `#8e8e88` | `#6E655E` |
| `--paper` / `--paper-50` / `--atlas-bg-base` | `--ds-bg` | `#f3ede1` / `#FBF7EF` / `#FBF7EF` | `#FCFBF9` |
| `--paper-2` | `--ds-bg-sunken` / `--ds-surface` | `#e4dac7` | `#F2EEE9` |
| `--signal` / `--coral` / `--atlas-color-signal-500` | `--ds-accent` | `#ff6a2b` / `#ff7a6b` / `#F0601F` | `#B4432B` |
| `--signal-dim` | `--ds-accent-hover` | `#b64a1e` | `#97361F` |
| `--line` / `--line-2` | `--ds-line` / `--ds-line-strong` | `rgba(243,237,225,.13)` | `#E4DED7` / `#CFC6BC` |
| `--radius` / `--radius-sm` | `--ds-radius-md` / `--ds-radius-sm` | `3px` / `8px` | `14px` / `10px` |
| `--font-sans` / `--sans` | `--ds-font-text` / `--ds-font-display` | `system-ui,…` | `Inter,…` / `Space Grotesk,…` |
| `--font-mono` / `--mono` | `--ds-font-mono` | `ui-monospace,…` | `Space Mono,…` |
| `--wrap` | `--ds-max-width` | `1180px` | `1280px` |

#### 路径 A2 —— 暗色主题变体（**02 / 04 / 06 / 09 已采用，仅作登记**）

这四个目录把**暗色主题作为默认**。取值与本系统暗色主题**完全一致**，属**合法有意选择**，无需改值：

```css
:root{
  --ds-bg:#100F0E; --ds-bg-raised:#1A1917; --ds-bg-sunken:#0B0A09;
  --ds-ink:#F7F4F0; --ds-ink-soft:#C0B7B0; --ds-ink-faint:#9A918A;
  --ds-line:#2B2926; --ds-line-strong:#453F39; --ds-surface:#1E1D1B;
  --ds-accent:#E0684A; --ds-accent-hover:#EE8266; --ds-accent-soft:#331C15;
}
```
**唯一要求**：若该目录将来要支持浅色切换，请改用选择器 `[data-ds-theme="dark"]` 而非写死在 `:root`，以便与本系统统一。

#### 路径 B —— 引入 `tokens.css`（推荐：愿意统一 token 层）

**适用场景**：目录已有 `:root` 变量层，希望**一次性**接入全部 130 个规范令牌。

```html
<!-- index.html -->
<link rel="stylesheet" href="./styles/tokens.css">
```
或 Vite：
```js
import './styles/tokens.css';
```

**前置条件（必须先做）**：解决 §0 风险 A 的命名空间冲突。
**后续**：本地变量只允许写成**语义别名**（`--ink: var(--ds-ink)`），**不得**重新定义 `--ds-*` 的取值。

#### 路径 C —— 引入 `tokens.css` + `components.css`（推荐：把外壳换成 `.ds-*`）

**适用场景**：愿意把顶栏/页脚/封面/卡片/详情/控件/导航轴/指示器/灯箱换成规范类名。

```html
<link rel="stylesheet" href="./styles/tokens.css">
<link rel="stylesheet" href="./styles/components.css">
```
```html
<header class="ds-topbar">…</header>
<nav   class="ds-rail">…</nav>
<main>
  <section class="ds-section">…</section>
  <article class="ds-work">…</article>
  <div    class="ds-detail">…</div>
</main>
<footer class="ds-footer">…</footer>
```
可用类名（27 类）见 `src/components.css`：`ds-shell` `ds-container` `ds-section` `ds-rail` `ds-topbar` `ds-cover` `ds-work` `ds-grid` `ds-hall` `ds-detail__*` `ds-btn` `ds-iconbtn` `ds-social` `ds-chip` `ds-field` `ds-indicator` `ds-lightbox` `ds-tag` `ds-canvas-frame` `ds-canvas-frame__hud` `ds-key` `ds-diagram` `ds-footer` `ds-in` `ds-scroll-snap` `ds-skip` `ds-visually-hidden`。

> **三条路径共同的硬性前提**：
> 1. 字体**必须自托管**（§8），禁止 CDN；
> 2. 入口注入 `--ds-base`（§6），不得写死绝对根路径；
> 3. 实现 `prefers-reduced-motion` 降级（§7）。

---

### 1.2 覆盖维度清单（本系统实际定义了哪些维度）

> 权威取值见 `design-tokens.json`（213 令牌 / 130 个 `--ds-*` 变量）。下表是**作者最常要查的部分**。

| 维度 | 令牌名（`--ds-`） | 取值 | 用途 |
| --- | --- | --- | --- |
| **颜色 · 底** | `--ds-bg` / `--ds-bg-raised` / `--ds-bg-sunken` | `#FCFBF9` / `#FFFFFF` / `#F2EEE9` | 页面底 / 卡片面 / 凹槽 |
| **颜色 · 墨** | `--ds-ink` / `--ds-ink-soft` / `--ds-ink-faint` | `#14110F` / `#59514B` / `#6E655E` | 主文字 / 次级 / 占位（**三级均 ≥4.5:1**） |
| **颜色 · 强调** | `--ds-accent` / `--ds-accent-hover` / `--ds-accent-ink` / `--ds-accent-soft` | `#B4432B` / `#97361F` / `#FFFFFF` / `#F6E9E4` | 全站**唯一**强调色及其状态 |
| **颜色 · 线** | `--ds-line` / `--ds-line-strong` | `#E4DED7` / `#CFC6BC` | 分隔线 / 控件边界（≥3:1） |
| **颜色 · 语义** | `--ds-success` `--ds-warning` `--ds-danger` `--ds-info` `--ds-jade` | `#3F7A4E` `#B07A1E` `#C2452B` `#2C5C8F` `#2E6A5E` | 状态；**不得**作装饰色滥用 |
| **字体 · 族** | `--ds-font-display` / `--ds-font-text` / `--ds-font-mono` | Space Grotesk / Inter / Space Mono | 展示 / 正文 / 等宽（元信息、编号） |
| **字体 · 字号** | `--ds-type-display` `--ds-type-h1..h3` `--ds-type-body` `--ds-type-sm` `--ds-type-xs` | `clamp(40px,6.6vw,84px)` … `12.5px` | 见 §2.2 字阶表 |
| **字体 · 中文** | `--ds-track-cjk` / `--ds-leading-cjk` | `0` / `1.85` | `:lang(zh)` 生效；**禁止**负字距 |
| **间距** | `--ds-space-1..12` | `4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 / 80 / 96 / 120px` | 4px 基数 |
| **圆角** | `--ds-radius-xs/sm/md/lg/xl/pill` | `6 / 10 / 14 / 20 / 28 / 999px` | 控件 sm / 卡片 md / 面板 lg / 封面 xl / 胶囊 pill |
| **阴影** | `--ds-shadow-1..4` `--ds-ring` `--ds-ring-strong` | 见 `design-tokens.json` | 层级；`--ds-ring` 是 1px 内描边（控件默认态） |
| **动效 · 时长** | `--ds-dur-instant/fast/base/slow/reveal` | `120 / 200 / 320 / 520 / 800ms` | hover 120–200 / 面板 320 / 转场 520 / 入场 800 |
| **动效 · 曲线** | `--ds-ease-out` `--ds-ease-inout` `--ds-ease-spring` `--ds-ease-snap` `--ds-ease-veil` | `cubic-bezier(.22,1,.36,1)` 等 5 条 | 见 §8.1 曲线表 |
| **动效 · 入场** | `--ds-entry-duration` `--ds-entry-translate` `--ds-entry-blur` | `640ms` `24px` `6px` | `.ds-in` 交错入场 |
| **布局** | `--ds-max-width` `--ds-max-width-wide` `--ds-read-width` `--ds-rail-width` `--ds-rail-inset` `--ds-viewport-section` | `1280px` `1600px` `68ch` `132px` `24px` `100dvh` | 正文行宽 ≤68ch；导航轨固定 132px / 24px 内缩 |
| **层级** | `--ds-z-base/raised/sticky/rail/overlay/modal` | `0/10/100/200/300/400` | 固定层顺序，**禁止**随意提高 |
| **尺寸** | `--ds-target-min` | `44px` | 触摸目标基准（见 §5.1 分层） |
| **路径** | `--ds-base` | `"/playtime-atlas-20261021/"` | Pages 子路径基准（§6） |

---

## 2. 逐项替换对照（按接入方）

> 「旧」列取值来自 2026-10-21 20:45 对各目录源码的**只读实测**；「新」列为 `design-tokens.json` 的路径与取值。
> 建议做法：**不逐行改 CSS**，而是把旧变量**重定向**到新 token（`--ink: var(--ds-ink)`），一处改动全站生效。


### 2.0 逐作品迁移清单（00—19，**每件作品一行**）

> **本表为 2026-10-21 23:3x 对各目录 CSS 的只读实测结果**（本轮重测 · **源码级口径**，排除 `dist/` 等构建目录——见 §2.0.1「产物需重建」）。
> **判定口径（与此前已发出的通知保持一致）**：
> - **口径 A · 必备 17 项** —— 与 `tools/validate-tokens.mjs` 的 `mustHave` **同一份**清单。**达标与否以此为准**。
> - **口径 B · 全量差异** —— 与规范 129 个根级令牌的完整差异，**仅作参考**，不作为派单依据（许多目录按 §1.1-A2 把主题色放进 `[data-ds-theme="dark"]` 块，或保留语义别名层，全量差异属正常）。
> **比对已排除** `@media (prefers-reduced-motion: reduce)` / `[data-rm="reduce"]` 块内的声明 —— 那些是降级值（1ms），写在降级块里是**正确**的，不算不一致。
> **可复现**：`node tools/ds-audit-tokens.mjs`（零依赖、只读、支持 `--json`）。

> ⚠️ **时效性警告（15-supervisor 第 3 节指出，已采纳）**
> **本清单会随作者执行而失效。** 快照时间 = **2026-10-21 23:3x**；每位作者改完自己的 token 层，**本表即刻过期**。
> → **请以自测结果为准，不要以本表为准**：
> `node tools/validate-tokens.mjs`（令牌，含 **V.11–V.13** 字体栈三项）+ `node tools/verify-preview.mjs`（页面）。
> → 本表**只用于**：(a) 派单前的初筛；(b) 变更后确认**没有新增**问题。
> → **不要**把本表当验收结论。验收由 13-qa-curation 按 §9.1 **现场实测**做出。
> → 已发生过的失效实例（留档以说明本表为何带时间戳）：
> **10-era-console** 21:50 版记为「尚未接入（0 个 `--ds-*`）」→ 22:5x 实测**已接入 129 个且必备全达标**；
> **09-era-arcade** 21:50 版记为「暗色主题需改由 `[data-ds-theme="dark"]` 给出」→ 22:5x 实测**已整改完成**（暗色组 20 项已在该块内）；
> **01-web / 03-interaction / 08 / 12 / 17** 亦在本轮内完成整改或重构。
> **教训**：本表半衰期为**分钟级**，任何跨轮次引用都必须带时间戳。

| 目录 / 作品 | 本地 token（实测） | → 规范 token | 当前状态（**23:3x 实测**） | 需人工判断 |
| --- | --- | --- | --- | --- |
| **00-research** | 已有完整 `--ds-*`（129 个），**取值与规范逐名一致** | — | 🟢 **完全一致** | 无须改取值。降级块写法已核验正确（`1ms` 只出现在 `prefers-reduced-motion` 内）。**字体栈顺序已合规**。仅需确认 §9 自测通过 |
| **01-web**（千色仪） | 已重构为 `public/assets/ds/tokens.css`（129 个 `--ds-*`），**取值与规范逐名一致** | — | 🟢 **完全一致** | **23:3x 实测：全量缺 0、额外 0、顺序合规、必备 17 项全达标。** 原「2 值 + 1 缺 + 顺序错」**全部已解决**——`--ds-ink-faint` 已为 `#6E655E`、`--ds-ink-soft` 已为 `#59514B`、`--ds-target-min` 已补。语义别名层写法正确，请保留 |
| **02-model**（渊甲拾遗者） | `--ds-*`（129 个）走**暗色主题**；另有 `--accent` `--abyss` `--acc-08/16/28/45` | `--accent`→`--ds-jade`；`--abyss`→`--ds-bg` | 🟢 **取值合法**（20 处差异全是暗色主题组取值，与本系统暗色主题逐值相同） | ① 暗色主题请改由 `[data-ds-theme="dark"]` 选择器给出，勿写死在 `:root`（§1.1-A2）——**实测仍是根级写死暗色值**（`src/styles/tokens.css:21`），浅色覆盖写在 `[data-ds-theme="light"]` 块（`:196`）；② `--acc-08/16/28/45` 用 `color-mix(--ds-accent)` 派生，**保留**；③ 画布内部色板**不动**（§4.2） |
| **03-interaction** | `--ds-*`（113 个）+ `--accent-ink` | `--accent-ink`→`--ds-accent-ink` | 🟢 **完全一致** | **23:3x 实测：必备 17 项全达标、顺序合规。** 原列的「缺 `--ds-canvas-hud-bg` / `--ds-canvas-scrim`」与「`--ds-target-min: 24px` → 44px」**均已解决**。仅需确认自有 CSS 仍不声明任何 `--ds-*`（V.12） |
| **04-spaceflight** | `--ds-*`（130 个）暗色主题；**另有 `--ds-duration-*` 命名分叉** | `--ds-duration-*` → **`--ds-dur-*`** | 🟡 **缺 4 必备 + 命名分叉 + 顺序错** | ① `--ds-duration-instant/fast/base/slow/reveal`（5 个）**改名**为 `--ds-dur-*`（值本身正确，只是名字与本系统分叉，会导致 §7 降级块对不上）；② 补 4 项必备：`--ds-dur-base`、`--ds-rail-width`、`--ds-rail-inset`、`--ds-target-min: 44px`；③ `--ds-button-height-md:40px` `--ds-button-icon-only:40px` 建议提到 **44px**（只改高度，勿动布局）；④ **Tab 焦点红线**：不得 `preventDefault` 吞 Tab（§4.1）；⑤ **字体栈顺序仍为旧序** → 见 §2.0.1 || **05-museum-research**（策展目录） | 原 `--ds-space-7/8/34` `--ds-radius-2/3` `--ds-color-*` 命名空间**已清理**；现有 `--ds-*`（129 个）**取值逐名一致** | — | 🟢 **完全一致**（命名空间冲突已解决 + 取值全对 + **字体栈顺序已合规**） | 无须改取值。仅需确认自有变量已全部改为非 `--ds-` 前缀（避免 §0 风险 A 复发）。**其 `.ds-shell` 作用域内的本地调序可回退**，改为直接消费修正后的上游 token（见 §5.3） |
| **06-museum-core**（回响电玩馆） | `--ds-*`（130 个）**取值逐名一致**；另有 61 个 `--atlas-*` 变量，**已全部改为语义别名层**（`--atlas-semantic-accent: var(--ds-accent)`） | — | 🟢 **已收拢 · 源码已修** | `--atlas-color-signal-500` 等**已无直取值**，双 token 并存与强调色不一致问题**已解决**。`--atlas-*` 保留作**语义别名层**（写法正确）。**23:3x 实测：源码 `src/styles/tokens.css` 字体栈顺序已合规（22:37 修好）**；但 `public/data/tokens.css` 与 `public/exhibits/**` 共 10 个文件仍含旧序——**全部是生成产物**（`build-tokens.mjs` 生成 / `sync-exhibits.mjs` 复制），**不要手改**，跑 `npm run sync` + `npm run build` 即可（详见 §2.0.1「产物需重建」）。另需确认 §4.1 三条既有缺陷（搜索不过滤 / 390px 溢出 511px / 字体 404） |
| **07-museum-art**（美术资产包） | 已有完整 `--ds-*`（129 个）**取值逐名一致**；另有 61 个 `--atlas-*` 别名变量指向 `--ds-*` | — | 🟢 **完全一致** | 无须改取值。字体已与本系统一致（Space Grotesk/Inter/Space Mono），**保留**。仅需确认 §4.1 的构建不因非致命错误 exit null |
| **08-era-origins** | 已有完整 `--ds-*`（129 个）**取值逐名一致** | — | 🟢 **完全一致** | 取值无须改。仅需确认：① §7 降级块写法；② 键盘仅在容器持有焦点时驱动玩法，守卫覆盖**所有**生效路径（§4.1）；③ 画布内部色板不动。**23:3x 实测：字体栈顺序已合规**（原「死代码」口径见 §2.0.1，仍保留） |
| **09-era-arcade** | `--ds-*`（129 个）暗色主题；`--ds-entry-translate-y` | `--ds-entry-translate-y` → `--ds-entry-translate` | 🟢 **取值合法**（20 处差异全是暗色主题组，**已按 §1.1-A2 整改完成**） | ① **已整改**：暗色主题现已写在 `[data-ds-theme="dark"]` 块（`src/styles/tokens.css:180`），**不再写死在 `:root`**，符合 §1.1-A2；② 仍需补一个同名同义的 `--ds-entry-translate: 24px`（或 `--ds-entry-translate-y` 改名二选一），避免与 §8.2 入场规范分叉；③ `--ds-target-min` 仍缺，若要 44px 见 §5.1 |
| **10-era-console** | 已接入 `--ds-*`（129 个，浅色 + 暗色两套） | — | 🟡 **已接入 · 必备全达标 · 顺序待改** | **上版记为「尚未接入（0 个 `--ds-*`）」已失效**（22:5x 实测已接入）。仍需：① **字体栈顺序为旧序**（`Noto Sans SC` 在系统栈前）→ 见 §2.0.1，**这是本专项仅剩的 2 个待改目录之一**；② `--coral`/`--mint`/`--sky`/`--sun`/`--violet` 是**游戏色板**，属画布内部 → **豁免不统一**（§4.2）；③ 已知缺陷：badge 与标题重叠 66% → **结构层解决，禁止用 z-index 掩盖**（§4.1） |
| **11-era-online** | 已有完整 `--ds-*`（128 个）**取值逐名一致** + 语义别名 `--danger` `--data` `--dawn` `--deep` | `--data`/`--dawn`→`--ds-accent`；`--deep`→`--ds-bg-sunken` | 🟢 **完全一致** | 无须改取值。仅需确认 §7 降级块与 §9 自检；语义别名层写法正确，**保留** |
| **12-era-modern** | 已有完整 `--ds-*`（129 个）**取值逐名一致** + 别名 `--bad` `--cyan-soft` `--amber-soft` | `--bad`→`--ds-danger` | 🟢 **完全一致** | 无须改取值。仅需确认 §7 降级块与 §9 自检；**保留自研字体 JetBrains Mono 须自托管 + 登记 `LICENSES.md`**，否则改用本系统等宽族。**23:3x 实测：字体栈顺序已合规**（22:44 修好） |
| **13-qa-curation** | 验收方，非接入方 | — | — | 按 §9.1 复核；脚本见 §9 末 |
| **14-publish**（作品大厅） | `release/docs/assets/hall.css` 的 22 变量（`--ink` `--ink-2` `--ink-3` `--paper` `--paper-2` `--signal` `--signal-dim` `--cyan` `--violet` `--green` `--amber` `--text` `--text-dim` `--text-faint` `--line` `--line-2` `--radius` `--mono` `--sans` `--maxw`） | 逐项见 §2.1 对照表 | 🔴 **尚未接入（0 个 `--ds-*`）** | ① `--violet` **删除**（全站只允许一个强调色）；② `--cyan` → `--ds-jade`/`--ds-info` 二选一；③ `--maxw:1320px` → `--ds-max-width:1280px`；④ 发布时**排除 `16-design-system/evidence/`**（§2.1 末） |
| **17-architecture-research** | 已新建 `src/catalog-page/assets/ds/tokens.css`（129 个 `--ds-*`），**取值与规范逐名一致** | — | 🟢 **已新建并接入** | **23:3x 实测：上版记「待新建（尚无 CSS）」已失效**——目录已建、必备 17 项全达标、顺序合规。仅需确认 §7 降级块与 §9 自检 |
| **18-architecture-models**（结构模型） | 已有 `--ds-*`（118 个）**取值逐名一致** | — | 🟡 **缺 2 令牌** | 补 `--ds-target-min: 44px`（必备 17 项中唯一缺项）与 `--ds-base: "/playtime-atlas-20261021/"`。**23:3x 实测：字体栈顺序已合规**（原「+ 顺序错」已解决） |
| **19-architecture-atlas**（双语建筑科普主站） | `src/styles/tokens.css` 已有 `--ds-*`，但**生成区缺 `:root` 包裹** | — | 🔴 **接入中 · 生成区块无效** | ⚠️ **实测发现真缺陷**：`src/styles/tokens.css` 的 `DS-TOKENS:BEGIN` 生成区**只有裸声明、缺 `:root {` 包裹**（且有一行重复注释）→ **浏览器会忽略这整段浅色令牌**，页面将回落到暗色组或无令牌状态。请用 `node scripts/sync-ds-tokens.mjs` 重新生成并确认 `:root {` 存在（该文件本轮仍在被修改中，状态可能变化，以你自测为准）。其余边界见 **§11**；双语切换需同时满足 §5 的 `:lang(zh)` 与 `hreflang` 规则 |

> **一句话（2026-10-21 23:3x 实测 · 源码级口径）**：本批 13 个作品里，**00 / 01 / 02 / 03 / 05 / 06 / 07 / 08 / 09 / 11 / 12 / 17 已达标**（12 个），
> **10 差 1 处**（字体栈顺序），
> **04 差 4 个必备令牌 + 命名分叉 + 顺序**，
> **18 差 2 个令牌**，
> **19 接入中（生成区缺 `:root` 包裹）**，**14 尚未接入**。
> **字体栈顺序**：真缺陷 **0 个**（8 个全修完），潜在风险 **2 个**（**04 / 10**）待改——见 §2.0.1。
> **所有目录的 `dist/` 产物均可能未随源码刷新** → 各自重跑构建，见 §2.0.1「产物需重建」。

#### 2.0.1 字体栈顺序专项（v1.0.1 新增 · 2026-10-21 · **独立于上表**）

> 上表比的是**令牌取值**。本专项比的是**字体栈里的顺序**——两者是不同维度，且本专项是**独立发现**，上表的 🟢 结论**不覆盖**它。

**缺陷机制**：CSS `font-family` 按**字符**回退。若 `Noto Sans SC` 子集排在系统 CJK 栈**之前**，则子集覆盖的字走 Noto、**不覆盖的字回落系统黑体** → 同一段文字混入两套字形与两套基线，视觉错位。正确顺序是「覆盖完整的族在前」。

**判定口径**（只读实测，`16-design-system` 侧已复核）：**活 `@font-face`** + **woff2 实体文件存在** + **`Noto Sans SC` 下标 < 系统 CJK 族下标** → 真缺陷。

> ⚠️ **不要把「含 Noto Sans SC」一律当成缺陷** —— **08-era-origins** 的 `@font-face` 整段**被注释掉**（「本目录未采用」），且**无 woff2 实体** → 栈内那个族名是**死代码**，子集实际不可用 → **当前无害**。但它仍列在下方「潜在风险」表里，因为**一旦将来放开 `@font-face` 就会立刻中招**。
> **请按下方两档分别处理，不要一律判 ❌**：真缺陷 = ❌ 不通过；潜在风险 = ⚠️ 有条件通过（记为待对齐，当前无渲染影响）。

**🔴 真缺陷（子集真实可用且顺序错误）— **现存 0 个** ✅**

> **2026-10-21 23:3x 复测更新**：本专项发出通知后，**8 个真缺陷目录已全部自行修好**。下表保留为**留档**（说明缺陷如何扩散与收敛），「需改」列已无待办。

| 目录 | 源文件 | 需改 | 状态 |
| --- | --- | --- | --- |
| ~~00-research~~ | `assets/ds/tokens.css` | 同上 | ✅ **已修**（22:47:58，15-supervisor 独立核验） |
| ~~03-interaction~~ | `src/tokens.css` | 同上 | ✅ **已修** |
| ~~05-museum-research~~ | `src/catalog-page/assets/ds/tokens.css` | 同上 | ✅ **已修**（22:25 重新同步上游，三份 SHA 全等 `e9595d51…`） |
| ~~06-museum-core~~ | `src/styles/tokens.css` | 同上 | ✅ **源码已修**（22:37）；**产物待重建**，见下「产物需重建」 |
| ~~07-museum-art~~ | `src/tokens.css` | 同上 | ✅ **已修** |
| ~~09-era-arcade~~ | `src/styles/tokens.css` | 同上 | ✅ **已修** |
| ~~11-era-online~~ | `public/assets/ds/tokens.css` | 同上 | ✅ **已修** |
| ~~18-architecture-models~~ | `src/ui/tokens.css` | 同上 | ✅ **已修** |

**统一改法**（改的是顺序，**不是**加字体）：

```css
/* 改前（错） */
--ds-font-display: "Space Grotesk", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", ...;
/* 改后（对） */
--ds-font-display: "Space Grotesk", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "Source Han Sans SC", "Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif;
--ds-font-text: "Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "Source Han Sans SC", "Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif;
```

> **为什么改完等于「子集不再生效」是好事**：系统栈覆盖完整，汉字恒走系统黑体，子集只在系统栈整体不可用时兜底。子集在本系统里**不是**主力（详见 `DESIGN-SPEC.md` §2.5）。
> **不要**用「把子集删掉」替代调序——那会让「系统栈不可用」的场景失去兜底。

**⚠️ 潜在风险（子集当前不可用，暂无害，但顺序仍需对齐）— 现存 2 个目录**

| 目录 | 源文件 | 说明 | 状态 |
| --- | --- | --- | --- |
| **04-spaceflight** | `src/styles/tokens.css:67` / `:69` | 注释明确「本目录不随包分发该子集」 | ⏳ **待改** |
| **10-era-console** | `src/styles/tokens.css:60` / `:61` | 已接入 `--ds-*`；不随包分发子集 | ⏳ **待改** |
| ~~01-web~~ | `src/styles/tokens.css` | 23:08:40 补进 woff2 后曾升级为真缺陷，随后修好 | ✅ **已修** |
| ~~08-era-origins~~ | `assets/ds/tokens.css:47` / `:49` | `@font-face` 被注释（「本目录未采用」），无 woff2 实体 | ✅ **已修**（顺序仍合规；**死代码口径保留**，见上方说明） |
| ~~12-era-modern~~ | `src/styles/tokens.css:62` / `:64` | 不随包分发子集 | ✅ **已修**（22:44） |

#### ⚠️ 产物需重建（**源码已修 ≠ 产物已修**）

> **判定口径（15-supervisor 第 4 节提出，已采纳）**：扫描必须**排除 `dist/` 等构建目录、单扫源码**——把产物与源码混扫，会把「**源码已修、产物未刷新**」误报成「未修」。

**各目录的 `dist/`（及 `public/` 下的构建副本）尚未随源码刷新。** 需要各自重跑构建，或由 14 的发布流程统一重建。

**典型案例：06-museum-core** —— 源码 `src/styles/tokens.css` 已于 22:37 修好，但仍有 10 个文件含旧序。**只读判定结论：全部是生成产物，不可手改**：

| 残留文件 | 性质 | 正确动作 |
| --- | --- | --- |
| `public/data/tokens.css` | **生成产物** —— 文件头写明「生成：`scripts/build-tokens.mjs` ← `scripts/sync-ds-tokens.mjs`」，且带指纹 | 跑生成脚本，**不要手改** |
| `public/exhibits/{arcade,modern,origins}/**` | **从兄弟目录复制而来** —— `scripts/sync-exhibits.mjs` 把 05 / 07 / 08—12 的产物复制进 `public/` | 跑 `npm run sync` 拉取**已修好的** 08 / 09 / 12 产物 |
| `public/exhibits/console/index.html` | 同上（来自 10） | 10 修好后随 `npm run sync` 更新 |
| `dist/**`（5 个） | `vite build` 输出 | 跑 `npm run build` |

> **为什么不能手改生成文件**：① 会被下次构建**静默覆盖**；② 造成「源码与产物漂移」——正是 §9 **V.13（无规范漂移）**要防的那类问题。

**通用建议**：任何目录改完 `src/` 下的 token 层后，**必须重跑自己的构建**，否则线上仍是旧值。

**为什么仍要改这 5 个**：它们一旦将来放开子集（或从别处复制到子集文件），**立刻**中招且无人记得原因。一次性对齐，全库零隐患。

**`02-model` / `19-architecture-atlas`**：不涉及（前者无子集、后者尚未接入）。

**新增验收项**：见 §9 的 **V.11** 与 §9.1 的**第 ④ 步**。


### 2.1 14-publish 作品大厅

源文件：`14-publish/release/docs/assets/hall.css`（21 632 B，`:root` 22 个变量，当前 **0** 处 `--ds-`）

| 旧变量 | 旧值 | → 新 token | 新值 |
| --- | --- | --- | --- |
| `--ink` | `#0a1020` | `--ds-ink` | `#14110F` |
| `--ink-2` | `#0e1526` | `--ds-ink-soft` | `#59514B` |
| `--ink-3` | `#141d33` | `--ds-ink-faint` | `#6E655E` |
| `--paper` | `#f3ede1` | `--ds-bg` | `#FCFBF9` |
| `--paper-2` | `#e4dac7` | `--ds-bg-sunken` / `--ds-surface` | `#F2EEE9` |
| `--signal` | `#ff6a2b` | `--ds-accent` | `#B4432B` |
| `--signal-dim` | `#b64a1e` | `--ds-accent-hover` | `#97361F` |
| `--cyan` | `#4fd6e8` | `--ds-jade`（辅助）/ `--ds-info`（数据） | `#2E6A5E` / `#2C5C8F` |
| `--violet` | `#7a6cff` | **删除**（全站只允许一个强调色） | — |
| `--green` | `#37c98b` | `--ds-success` | `#3F7A4E` |
| `--amber` | `#ffc14d` | `--ds-warning` | `#B07A1E` |
| `--text` | `#dfe4ef` | `--ds-ink` | `#14110F` |
| `--text-dim` | `#97a0b6` | `--ds-ink-soft` | `#59514B` |
| `--text-faint` | `#626c83` | `--ds-ink-faint` | `#6E655E` |
| `--line` | `rgba(243,237,225,.13)` | `--ds-line` | `#E4DED7` |
| `--line-2` | `rgba(243,237,225,.07)` | `--ds-line` / `--ds-line-strong` | `#E4DED7` / `#CFC6BC` |
| `--radius` | `3px` | `--ds-radius-sm` | `10px` |
| `--mono` | `ui-monospace, …` | `--ds-font-mono` | `'Space Mono', ui-monospace, …` |
| `--sans` | `system-ui, …` | `--ds-font-text` / `--ds-font-display` | `'Inter', …` / `'Space Grotesk', …` |
| `--maxw` | `1320px` | `--ds-max-width` | `1280px`（`--ds-max-width-wide` 1600px） |

**结构改造**
| 现有 | → 新类 | 说明 |
| --- | --- | --- |
| 大厅列表行 | `.ds-hall` / `.ds-hall__row` | 桌面 `88px / 1.15fr / 1fr` 三列 |
| 状态徽标 | `.ds-tag` | **必须如实**取自 `data/works.json` 的 `status`；不得一律 ready |
| 筛选控件 | `.ds-chip`（`aria-pressed`） | 结果计数用 `aria-live="polite"` |
| 作品缩略卡 | `.ds-work` / `.ds-work__media` / `.ds-work__dim` | 悬停 `scale(1.015)` + 去饱和遮罩 |
| 详情区块 | `.ds-detail__*` | 来源与许可**内嵌可见** |
| 顶部导航 | `.ds-topbar` | 移动端导航横向滚动，不得溢出 |
| 焦点可见 | `.ds-skip` + `:focus-visible` | 跳转链接为每页首个可聚焦元素 |

**发布时必须遵守的两条（给 14-publish）**

1. **若发布设计系统样例页（`preview.html`）**，其页脚含**溯源说明**（"风格机制参考公开站点 https://olek.si/ 的实际取证结果，见 REFERENCE-AUDIT.md"）。
   该指向必须可解析 —— 请**随附 `REFERENCE-AUDIT.md`**（纯 Markdown，无脚本、无外部资源），否则页脚指向空。
   这是**署名与反冒充**声明，不是参考站资产引入，请勿删除。
2. **`evidence/` 目录整体排除**（发布清单见 `16-design-system/evidence/README.md` §4）。
   其中 `evidence/ref/` 是参考站的观察证据（13 张 PNG + 7 份测量 JSON），**不是本项目产物**，
   既不得进入发布包，也不得被任何运行时页面引用。按白名单发布时天然不包含该目录。

### 2.2 06-museum-core 回响电玩馆

源文件：`06-museum-core/src/styles/tokens.css`（自有层）+ `06-museum-core/public/data/tokens.css`（`--atlas-*` 层，**两套并存**）
> ⚠️ 该目录有**两套** token 系统且强调色不一致（`--atlas-semantic-accent: #F0601F` vs `--signal-500: #FF6B2C`）。改版时**收敛为一套**（建议保留 `--atlas-*` 作为语义别名层）。

| 旧变量 | 旧值 | → 新 token | 新值 |
| --- | --- | --- | --- |
| `--accent` | `var(--signal-500)` `#FF6B2C` | `--ds-accent` | `#B4432B` |
| `--accent-soft` | `rgba(255,107,44,.14)` | `--ds-accent-soft` | `#F6E9E4` |
| `--accent-line` | `rgba(255,107,44,.42)` | `color-mix(in srgb, var(--ds-accent) 38%, transparent)` | — |
| `--text-strong` | `var(--paper-050)` | `--ds-ink` | `#14110F` |
| `--text-body` | `var(--paper-200)` | `--ds-ink-soft` | `#59514B` |
| `--text-muted` | `#9FB0CC` | `--ds-ink-faint` | `#6E655E` |
| `--text-faint` | `#7286A6` | `--ds-ink-faint` | `#6E655E` |
| `--text-on-paper` | `#1B2434` | `--ds-ink` | `#14110F` |
| `--text-on-paper-muted` | `#56617A` | `--ds-ink-soft` | `#59514B` |
| `--bg-panel` | `var(--ink-850)` | `--ds-surface` | `#F2EEE9` |
| `--bg-raised` | `var(--ink-700)` | `--ds-bg-raised` | `#FFFFFF` |
| `--bg-sunken` | `var(--ink-950)` | `--ds-bg-sunken` | `#F2EEE9` |
| `--line` | `rgba(214,226,245,.12)` | `--ds-line` | `#E4DED7` |
| `--line-strong` | `rgba(214,226,245,.22)` | `--ds-line-strong` | `#CFC6BC` |
| `--font-display` | `'Space Grotesk','Noto Sans SC',…` | `--ds-font-display` | **完全一致** ✅ |
| `--font-text` | `"PingFang SC",…` | `--ds-font-text` | `'Inter','Noto Sans SC',…` |
| `--font-mono` | `"SF Mono","JetBrains Mono",…` | `--ds-font-mono` | `'Space Mono',…` |
| `--fs-display` | `clamp(2rem,1.2rem+3.2vw,3.75rem)` | `--ds-type-display` | `clamp(40px,6.6vw,84px)` |
| `--fs-title` | `clamp(1.35rem,1.05rem+1.1vw,2rem)` | `--ds-type-h1` | `clamp(30px,4.2vw,52px)` |
| `--fs-subtitle` | `clamp(1.05rem,0.95rem+0.5vw,1.3rem)` | `--ds-type-h2` | `clamp(22px,2.6vw,32px)` |
| `--fs-body` | `.975rem` | `--ds-type-body` | `16px` |
| `--fs-sm` | `.85rem` | `--ds-type-sm` | `14px` |
| `--fs-xs` | `.75rem` | `--ds-type-xs` | `12.5px` |
| `--lh-tight` | `1.18` | `--ds-lh-tight` | `1.22` |
| `--lh-body` | `1.72` | `--ds-lh-normal`（中文 1.85） | `1.6` |
| `--sp-2`…`--sp-9` | 8/12/16/24/32/48/64/96 px | `--ds-space-2`…`--ds-space-10` | 8/12/16/24/32/48/64/96/128 px |
| `--r-xs` | `4px` | `--ds-radius-xs` | `6px` |
| `--r-sm` | `8px` | `--ds-radius-sm` | `10px` |
| `--r-md` | `14px` | `--ds-radius-md` | `14px` ✅ |
| `--r-lg` | `22px` | `--ds-radius-lg` | `20px` |
| `--r-pill` | `999px` | `--ds-radius-pill` | `999px` ✅ |
| `--ease-out` | `cubic-bezier(.22,.72,.28,1)` | `--ds-ease-out` | `cubic-bezier(.22,1,.36,1)` |
| `--ease-in-out` | `cubic-bezier(.62,.02,.2,1)` | `--ds-ease-inout` | `cubic-bezier(.65,0,.35,1)` |
| `--dur-1` | `120ms` | `--ds-dur-instant` | `120ms` ✅ |
| `--dur-2` | `220ms` | `--ds-dur-base` | `320ms` |
| `--dur-3` | `420ms` | `--ds-dur-slow` | `520ms` |
| `--z-nav` | `40` | `--ds-z-rail` | `200` |
| `--z-panel` | `60` | `--ds-z-overlay` | `300` |
| `--z-modal` | `80` | `--ds-z-modal` | `400` |
| `--z-toast` | `95` | `--ds-z-toast` | `500` |
| `--rail-w-collapsed` | `68px` | `--ds-rail-width` | `132px` |
| `--content-max` | `1320px` | `--ds-max-width` | `1280px` |

**已知真实缺陷（改版时一并修）**
| 缺陷 | 修法 |
| --- | --- |
| 搜索输入后结果数不变（211→211） | 输入必须真正过滤并更新 `aria-live` 计数 |
| 移动端 `scrollWidth 511 > 390` | `.ds-topbar` 窄屏下导航横向滚动；按钮文字不得逐字换行 |
| `art/assets/fonts/fonts.css` 线上 404 | 字体 CSS 必须与 woff2 同目录同路径，发布时随包拷贝 |

### 2.3 07-museum-art 美术资产包

源文件：`07-museum-art/src/styles.css`

| 旧变量 | 旧值 | → 新 token | 新值 |
| --- | --- | --- | --- |
| `--font-display` | `'Space Grotesk','Noto Sans SC',…` | `--ds-font-display` | **完全一致** ✅ |
| `--font-sans` | `'Inter','Noto Sans SC',…` | `--ds-font-text` | **完全一致** ✅ |
| `--font-mono` | `'Space Mono','Noto Sans Mono',…` | `--ds-font-mono` | **完全一致** ✅ |
| `--radius` | `14px` | `--ds-radius-md` | `14px` ✅ |
| `--wrap` | `1360px` | `--ds-max-width-wide` | `1600px` |
| `--ease` | `cubic-bezier(.16,1,.3,1)` | `--ds-ease-snap` | `cubic-bezier(.16,1,.3,1)` ✅ |
| `--signal-500` | `#F0601F` | `--ds-accent` | `#B4432B` |
| `--signal-600` | `#D94A15` | `--ds-accent-hover` | `#97361F` |
| `--signal-300` | `#FF9A5E` | `--ds-accent-soft` | `#F6E9E4` |
| `--teal-400` | `#4FB3A0` | `--ds-jade` | `#2E6A5E` |
| `--paper-50` | `#FBF7EF` | `--ds-bg-raised` | `#FFFFFF` |
| `--paper-200` | `#E7DCC7` | `--ds-ink-soft` | `#59514B` |
| `--ink-900`…`--ink-300` | `#070E19`…`#7A9BB8` | `--ds-ink` / `--ds-ink-soft` / `--ds-ink-faint` | 浅色主题三档 |

> 该目录是**深色资产面板**语境，建议直接用 `[data-ds-theme="dark"]` 主题块，不必逐个映射深色阶。

### 2.4 18-architecture-models 结构模型

源文件：`18-architecture-models/src/ui/styles.css`

| 旧变量 | 旧值 | → 新 token | 新值 |
| --- | --- | --- | --- |
| `--paper` | `#f5f5f2` | `--ds-bg` | `#FCFBF9` |
| `--paper-deep` | `#ebebe6` | `--ds-bg-sunken` | `#F2EEE9` |
| `--card` | `#e9e9e4` | `--ds-surface` | `#F2EEE9` |
| `--card-raise` | `#f0f0ec` | `--ds-bg-raised` | `#FFFFFF` |
| `--ink` | `#141414` | `--ds-ink` | `#14110F` |
| `--ink-soft` | `#3a3a38` | `--ds-ink-soft` | `#59514B` |
| `--muted` | `#8e8e88` | `--ds-ink-faint` | `#6E655E` |
| `--hairline` | `rgba(20,20,20,.12)` | `--ds-line` | `#E4DED7` |
| `--hairline-soft` | `rgba(20,20,20,.07)` | `--ds-line` | `#E4DED7` |
| `--accent` | `#c0503c` | `--ds-accent` | `#B4432B` |
| `--radius-lg` | `28px` | `--ds-radius-xl` | `28px` ✅ |
| `--radius-md` | `18px` | `--ds-radius-lg` | `20px` |
| `--radius-sm` | `10px` | `--ds-radius-sm` | `10px` ✅ |
| `--ease` | `cubic-bezier(.22,1,.36,1)` | `--ds-ease-out` | **完全一致** ✅ |
| `--rail-w` | `116px`（104/62 断点） | `--ds-rail-width` | `132px` |
| `--font-sans` | `ui-sans-serif, system-ui, …` | `--ds-font-text` / `--ds-font-display` | `'Inter'` / `'Space Grotesk'` |

**结构模型专章**
- 3D 视口用 `.ds-canvas-frame`（`contain: paint` + `isolation: isolate`），HUD 用 `--ds-canvas-hud-*`。
- 线稿：`.ds-diagram__stroke` 用 `--ds-jade`；强调构件加 `.ds-diagram__stroke--accent`（`--ds-accent`）；尺寸标注 `.ds-diagram__dim`（mono 11px）。
- **线宽下限**：1× DPR 屏上线宽渲染后须 ≥1px 实线，否则发虚。

### 2.5 19-architecture-atlas 双语建筑科普主站

源文件：`19-architecture-atlas/src/styles/tokens.css`（已高度接近本系统）

| 旧变量 | 旧值 | → 新 token | 新值 |
| --- | --- | --- | --- |
| `--cinnabar` | `#C0503C` | `--ds-accent` | `#B4432B` |
| `--malachite` | `#3F7A6B` | `--ds-jade` | `#2E6A5E` |
| `--bronze` | `#A8823C` | `--ds-warning` | `#B07A1E` |
| `--tone-fade` | `#EDE7DA` | `--ds-tone-fade` | `#EDEAE5` |
| `--tone-bg` | `var(--paper)` | `--ds-section-bg` | `var(--ds-bg)` |
| `--section-soft` | `rgba(20,24,27,.04)` | `--ds-section-soft` | `rgba(20,17,15,.62)` |
| `--fs-display` | `clamp(2.75rem,7.2vw,5.75rem)` | `--ds-type-display` | `clamp(40px,6.6vw,84px)` |
| `--fs-title` | `clamp(1.75rem,3.4vw,2.75rem)` | `--ds-type-h1` | `clamp(30px,4.2vw,52px)` |
| `--fs-section` | `clamp(1.25rem,2.2vw,1.75rem)` | `--ds-type-h2` | `clamp(22px,2.6vw,32px)` |
| `--fs-lead` | `clamp(1rem,1.35vw,1.125rem)` | `--ds-type-lead` | `19px` |
| `--fs-body` | `.9375rem` | `--ds-type-body` | `16px` |
| `--fs-small` | `.8125rem` | `--ds-type-sm` | `14px` |
| `--fs-micro` | `.6875rem` | `--ds-type-xs` | `12.5px` |
| `--lh-tight` | `1.06` | `--ds-lh-display` | `1.08` |
| `--lh-snug` | `1.28` | `--ds-lh-tight` | `1.22` |
| `--lh-body` | `1.72` | `--ds-lh-normal`（中文 1.85） | `1.6` |
| `--ls-display` | `-.022em` | `--ds-track-display` | `-.03em` |
| `--ls-wide` | `.14em` | `--ds-track-caps` | `.08em` |
| `--ls-label` | `.08em` | `--ds-track-caps` | `.08em` ✅ |
| `--sp-2`…`--sp-9` | .5/.75/1/1.5/2/3/4.5/7 rem | `--ds-space-2`…`--ds-space-10` | 8/12/16/24/32/48/64/96/128 px |
| `--r-xs` | `4px` | `--ds-radius-xs` | `6px` |
| `--r-sm` | `8px` | `--ds-radius-sm` | `10px` |
| `--r-md` | `14px` | `--ds-radius-md` | `14px` ✅ |
| `--r-lg` | `22px` | `--ds-radius-lg` | `20px` |
| `--r-xl` | `30px` | `--ds-radius-xl` | `28px` |
| `--r-pill` | `999px` | `--ds-radius-pill` | `999px` ✅ |
| `--shell` | `1440px` | `--ds-max-width-wide` | `1600px` |
| `--rail-w` | `128px` | `--ds-rail-width` | `132px` |
| `--sh-2` | `0 2px 10px rgba(20,24,27,.06)` | `--ds-shadow-2` | `0 4px 16px rgba(20,17,15,.07)` |
| `--sh-3` | `0 10px 34px rgba(20,24,27,.10)` | `--ds-shadow-3` | `0 12px 40px rgba(20,17,15,.10)` |
| `--ease-soft` | `cubic-bezier(.4,0,0,1)` | `--ds-ease-veil` | `cubic-bezier(.4,0,.2,1)` |
| `--t-fast` | `140ms` | `--ds-dur-fast` | `200ms` |
| `--t-base` | `260ms` | `--ds-dur-base` | `320ms` |
| `--t-slow` | `520ms` | `--ds-dur-slow` | `520ms` ✅ |
| `--z-rail` | `40` | `--ds-z-rail` | `200` |
| `--z-bar` | `60` | `--ds-z-sticky` | `100` |
| `--z-panel` | `80` | `--ds-z-overlay` | `300` |
| `--z-modal` | `100` | `--ds-z-modal` | `400` |
| `--z-toast` | `120` | `--ds-z-toast` | `500` |

> 该目录**已有** `prefers-reduced-motion` 把 `--t-*` 置 `0ms` 的降级块 —— 保留，改为统一引用 `--ds-dur-*` 归 `1ms` 的实现（见 §7）。

### 2.6 01-web 千色仪（**已部分采用**）

源文件：`01-web/src/styles/tokens.css`（118 处 `--ds-` 定义，语义别名层写法正确）

| 项 | 处置 |
| --- | --- |
| `--ds-*` 区块 | **整体替换**为本系统 `src/tokens.css` 的对应区块（不是追加） |
| `--ds-ink-faint: #a79e97` | **必须更新**为 `#6E655E`（旧值 2.54:1，不达 AA） |
| 缺失令牌 | 补 `--ds-radius-xs`、`--ds-shadow-1`、`--ds-dur-instant`、`--ds-space-1`、`--ds-font-display` |
| `--ink-900/850/800/750/700`、`--paper-2/3/4`、`--signal-2`、`--signal-dim`、`--pulse`、`--iris`、`--f-body`、`--f-mono` | **保留**（语义别名层写法正确） |
| `--topbar-h: 64px` | 保留或改用 `.ds-topbar` 内建 padding |
| `--pad-x` | 已指向 `--ds-space-gutter` ✅ |
| `--radius-lg: var(--ds-radius-md)` | 保留 |
| `--ease-io / --t-fast / --t-mid / --t-slow` | 保留（别名层） |
| `--rail-w: 0px` | 窄屏折叠态；桌面应为 `--ds-rail-width` 132px |

### 2.7 02 / 03 / 04（作品级映射 + 特别说明）

**02-model（渊甲拾遗者）** `src/style.css`

| 旧 | 旧值 | → 新 | 备注 |
| --- | --- | --- | --- |
| `--ink` | `#d2ebf4` | `--ds-ink` | 画布外文字 |
| `--ink-2` | `#83a8b6` | `--ds-ink-soft` | |
| `--glass` | `rgba(7,17,25,.74)` | `--ds-canvas-hud-bg` | **画布内**保留原色 |
| `--glass-2/3` | `rgba(9,23,33,.88/.92)` | `--ds-canvas-hud-bg`（不透明度更高档） | 画布内保留 |
| `--accent` | `#38e8d0` | **画布内保留** | 画面强调色是玩法语义 |
| `--warn` | `#ff8a3d` | `--ds-warning` | 画布内保留 |
| `--sans` | `"PingFang SC",…` | `--ds-font-text` | |
| `--mono` | `ui-monospace,…` | `--ds-font-mono` | |
| 圆角 `2px`/`3px` | — | `--ds-radius-xs` / `--ds-radius-sm` | 控件圆角统一 |

**03-interaction（织造车间调度台）** `src/styles.css`

| 旧 | 旧值 | → 新 | 新值 |
| --- | --- | --- | --- |
| `--paper` | `#fbf7ef` | `--ds-bg` | `#FCFBF9` |
| `--rice` | `#f3ece0` | `--ds-bg-sunken` | `#F2EEE9` |
| `--rice-warm` | `#efe5d4` | `--ds-surface` | `#F2EEE9` |
| `--indigo` | `#24415f` | `--ds-ink` | `#14110F` |
| `--indigo-lt` | `#6d90b0` | `--ds-ink-soft` | `#59514B` |
| `--persimmon` | `#c04a24` | `--ds-accent` | `#B4432B` |
| `--moss` | `#4f6b45` | `--ds-success` | `#3F7A4E` |
| `--gold` | `#a67c2e` | `--ds-warning` | `#B07A1E` |
| `--err` | `#b23a20` | `--ds-danger` | `#C2452B` |
| `--line` | `#ded2be` | `--ds-line` | `#E4DED7` |
| `--r-sm / --r-md / --r-lg` | 4/7/12 px | `--ds-radius-xs/sm/md` | 6/10/14 px |
| `--serif` | `'Loomdeck Serif',…` | `--ds-font-text` 或**自托管并登记许可** | 见 §8 |
| `--mono` | `'Loomdeck Mono',…` | `--ds-font-mono` | `'Space Mono'` |
| `.4rem/.6rem/1.2rem` | rem 间距 | `--ds-space-*` px | 统一 px 刻度 |

**04-spaceflight（霜隙远航）** `src/styles.css`

| 旧 | 旧值 | → 新 | 备注 |
| --- | --- | --- | --- |
| `--void` | `#05060B` | `--ds-bg`（深色主题） | `#100F0E` |
| `--ivory` | `#F3E7D2` | `--ds-ink` | 画布外 |
| `--ember` | `#E2573C` | `--ds-danger` | 画布内保留 |
| `--jade` | `#6FCF97` | `--ds-success` | 画布内保留 |
| `--gold` | `#E9A93D` | `--ds-warning` | **画布内保留**（金色是玩法识别色） |
| `--panel` | `rgba(15,12,9,.66)` | `--ds-canvas-hud-bg` | |
| `--serif` | `"Songti SC",…` | `--ds-font-text` 或自托管+许可 | 见 §8 |
| `--mono` | `"SF Mono",…` | `--ds-font-mono` | |
| 圆角 `1px` | — | `--ds-radius-xs` 6px | 控件圆角统一 |

### 2.8 08 / 09 / 10 / 11 / 12（沉浸式，色板**不统一**）

| 目录 | 画布内色板（**保持不变**） | 外壳替换项 |
| --- | --- | --- |
| **08-era-origins** | `--void #04060d` `--deep #080d1c` `--panel #0d1430` `--cyan #5ce1e6` `--amber #ffb45c` `--rose #ff5d8f` `--bone #e9eff8` `--slate #8595b4` `--dim #3f4c72` | 顶栏/页脚/封面/详情/控件/导航轴/指示器 → `.ds-*`；`--sans` → `--ds-font-text`；`--mono` → `--ds-font-mono`；`--radius 3px` → `--ds-radius-xs` 6px；`--maxw 1180px` → `--ds-max-width` 1280px |
| **09-era-arcade** | `--void-deep #07031a` `--void-mid #0d0626` `--wall #1a0f42` `--magenta #ff2e88` `--cyan #26e6ff` `--amber #ffb347` `--crimson #ff4d5e` `--violet #a56bff` `--lime #8bff6b` `--text #e8f4ff` `--text-dim #93a6c8` `--text-faint #6a7a9c` | 同上；`--radius 4px` → `--ds-radius-xs` 6px；`--shell-max 1180px` → `--ds-max-width` 1280px |
| **10-era-console** | `--ink #101018` `--ink-2 #1c1c2a` `--paper #f4efe4` `--mint #5ee0b8` `--coral #ff7a6b` `--sun #ffd166` `--sky #6aa9ff` `--violet #b48aff` | 同上；`--radius 12px` → `--ds-radius-md` 14px；`--radius-sm 8px` → `--ds-radius-sm` 10px；`--wrap 1180px` → `--ds-max-width` 1280px |
| **11-era-online** | `--void #080b16` `--deep #0d1224` `--panel #141b33` `--text #e7ecf7` `--dawn #ff8a3d` `--data #4fd6ff` `--echo #7cf29a` `--warn #ffd166` `--danger #ff5d73` `--violet #a78bfa` `--pocket-d1..d5` | 同上；`--radius 12px` → `--ds-radius-md`；`--maxw 1180px` → `--ds-max-width` |
| **12-era-modern** | `--ink-850..400` `--paper-90..06` `--prism-magenta #ff5fa2` `--prism-amber #ffc46b` `--prism-violet #9d7bff` `--prism-blue #5aa9ff` `--glass` `--glow-cyan` `--glow-magenta` | 同上；`--r-md 12px` → `--ds-radius-md` 14px；`--r-lg 20px` → `--ds-radius-lg` 20px ✅；`--r-xl 28px` → `--ds-radius-xl` 28px ✅；`--maxw 1180px` → `--ds-max-width`；`--gap 20px` → `--ds-space-4` 16px；`--dur 220ms` → `--ds-dur-base` 320ms；`--font-mono 'JetBrains Mono Variable'` → `--ds-font-mono` `'Space Mono'`（**若保留 JetBrains 须自托管并登记许可**） |

### 2.9 05-museum-research 策展目录（⚠️ 先解决命名空间）

| 旧 | 旧值 | → 新 | 说明 |
| --- | --- | --- | --- |
| `--ds-space-7` | `7px` | `--ds-space-2` | ⚠️ **重命名后**再引入本系统 |
| `--ds-space-8` | `8px` | `--ds-space-2` | ⚠️ 同上 |
| `--ds-space-9` | `9px` | `--ds-space-3` | ⚠️ 同上 |
| `--ds-space-10` | `10px` | `--ds-space-3` | ⚠️ 同上 |
| `--ds-space-11/12/13/14` | 11/12/13/14 px | `--ds-space-3` / `--ds-space-4` | ⚠️ 同上 |
| `--ds-space-16/18/20/22/24` | 16/18/20/22/24 px | `--ds-space-4/5/5/6/5` | ⚠️ 同上 |
| `--ds-space-34/40/44` | 34/40/44 px | `--ds-space-6/7/8` | ⚠️ 同上 |
| `--ds-space-gutter` | `clamp(16px,4vw,40px)` | `--ds-space-gutter` | `clamp(16px,4vw,48px)` |
| `--ds-radius-2` | `2px` | `--ds-radius-xs` | 6px |
| `--ds-radius-3` | `3px` | `--ds-radius-sm` | 10px |
| `--ds-radius-pill` | `100px` | `--ds-radius-pill` | 999px |
| `--ds-font-mono` | `ui-monospace,…` | `--ds-font-mono` | `'Space Mono',…` |
| `--ds-line-height-body` | `1.7` | `--ds-lh-normal` | 1.6（中文 1.85） |
| `--ds-line-height-prose` | `1.85` | `--ds-lh-relaxed` | 1.75（中文 1.85） |
| `--ds-line-height-panel` | `1.82` | `--ds-lh-relaxed` | 1.75 |
| `--ds-line-height-card` | `1.6` | `--ds-lh-normal` | 1.6 |
| `--ds-weight-medium/semibold/bold/extrabold` | 500/600/700/800 | `--ds-w-medium/semibold/bold` | 500/600/700（**去掉 800**，中文无真 800） |
| `--ds-color-*`（26 个） | — | `--ds-ink/ink-soft/ink-faint/bg/bg-raised/bg-sunken/surface/line/line-strong/accent/accent-soft/accent-ink/success/warning/danger/info` | 按语义逐个映射 |
| `--ds-font-size-*` | — | `--ds-type-display/h1/h2/h3/lead/body/sm/xs` | 统一字阶 |
| `--ds-container-max` | — | `--ds-max-width` | 1280px |
| `--ds-space-column` | `minmax(190px,1fr)` | 保留（布局专用） | |
| `--ds-space-measure` | `72ch` | `--ds-read-width` | 68ch |
| `--ds-motion-easing` | `ease` | `--ds-ease-out` | `cubic-bezier(.22,1,.36,1)` |

---

## 3. 通用组件替换（所有接入方共用）

| 旧模式 | → 新类 | 关键约束 |
| --- | --- | --- |
| 各自写的顶栏 | `.ds-topbar` | 窄屏导航横向滚动；`aria-current` 标当前页 |
| 各自写的竖排年份轴 | `.ds-rail` | 三级墨色层级（见 §5），**不用半透明衰减** |
| 各自写的大标题区 | `.ds-cover` | **禁止 `white-space:nowrap`** |
| 各自写的作品卡 | `.ds-work` | 悬停 `scale(1.015)` + `--ds-work-dim` 遮罩 |
| 各自写的大厅行 | `.ds-hall` / `.ds-hall__row` | 桌面三列 `88px/1.15fr/1fr` |
| 各自写的主按钮 | `.ds-btn--primary` | **每屏至多 1 个** |
| 各自写的次/三级按钮 | `.ds-btn--secondary` / `--ghost` / `--quiet` | 胶囊 `var(--ds-radius-control)` |
| 各自写的图标钮 | `.ds-iconbtn` | 44×44，带 `aria-label` |
| 各自写的筛选 chip | `.ds-chip` | `aria-pressed` + `aria-live` 计数 |
| 各自写的状态标 | `.ds-tag` | **不得只用颜色**表达状态 |
| 各自写的底部圆点 | `.ds-indicator` | `bottom: clamp(36px,8vh,64px)`（与参考站同位置关系） |
| 各自写的弹层 | `.ds-lightbox` | `role=dialog` + `aria-modal` + 焦点陷阱 + Esc + 焦点归还 |
| 各自写的输入框 | `.ds-field` / `.ds-input` | 最小高 44px；错误需 `aria-describedby` |
| 各自写的画布容器 | `.ds-canvas-frame` | `contain:paint` + `isolation:isolate` |
| 各自写的 HUD | `.ds-canvas-frame__hud` | `--ds-canvas-hud-*`；≥12.5px 且 ≥4.5:1 |
| 各自写的建筑线稿 | `.ds-diagram` | `--ds-jade` 描边 + `--ds-accent` 强调 |
| 各自写的入场动画 | `.ds-in` | `translateY(24px)` + blur(6px)；交错 ≤6 级 |
| 各自写的整屏分段 | `.ds-scroll-snap` | `scroll-snap-type: y mandatory` |
| 无跳转链接 | `.ds-skip` | 每页首个可聚焦元素 |

---

## 4. **必须保持不变**的项（可玩性优先于视觉统一）

> 依据 `DESIGN-SPEC.md` §9、§11.3；这是**改版的红线**，违反即视为回归。

| # | 不得改动 | 理由 | 验收方式 |
| --- | --- | --- | --- |
| K.1 | **游戏画布内部的全部配色**（场景色、角色色、粒子、UI 皮肤、发光、渐变） | 高饱和色板是玩法辨识与可读性的一部分；统一后玩家会读错元素 | 目视 + HUD 对比度测量 |
| K.2 | **画布尺寸比与交互反馈**（命中区、抖动、闪白、粒子） | 改动直接影响手感 | 实玩 |
| K.3 | **HUD 的可读性优先于风格统一** | HUD 压在画面上，低对比度=不可玩 | HUD 文字与背景对比度 ≥4.5:1（13-qa-curation 抽测） |
| K.4 | **键盘映射与 Tab 焦点遍历** | 见下方缺陷表 | Tab 序列全程可用 |
| K.5 | **既有可玩功能与数据**（分数、存档、关卡、史料台账） | 风格迁移不得破坏功能 | 回归自测清单 |
| K.6 | **已定作品名与 works.json 的 id / URL** | 改名会破坏大厅、URL 与已完成验收 | 14-publish 清单比对 |

### 4.1 键盘与焦点红线（对应既有真实缺陷）

| 既有缺陷 | 目录 | 红线 |
| --- | --- | --- |
| `preventDefault` 吞掉 `Tab`，焦点恒为 BODY | 04-spaceflight | 任何输入处理**不得**拦截 `Tab`；`Space` 仅在焦点位于交互元素时不拦 |
| 未聚焦仍劫持键盘 | 08-era-origins | 键盘仅在容器持有焦点时驱动玩法；守卫必须覆盖**所有**生效路径（含 window 级 keydown） |
| badge 与标题重叠 66% | 10-era-console | 布局冲突在**结构层**解决；**禁止**用 `z-index` 掩盖 |
| 模型 404（不在 `public/`） | 02-model | 模型/纹理必须在 `public/` 或打进 `dist/`；`vite build` 产物与发布脚本产物必须一致 |
| 搜索不过滤 | 06-museum-core | 输入必须真正过滤并更新计数 |
| 移动端横向溢出 511px | 06-museum-core | 390px 下 `scrollWidth ≤ innerWidth` |
| 发布脚本报错导致构建中断 | 07-museum-art | 构建不得因非致命错误 exit null；须产出可复现的构建日志 |

### 4.2 游戏玩法画布的豁免：**豁免什么 / 不豁免什么 / 边界在哪**

**原则：玩法画布可读性优先于视觉统一。** 画布内部**不是**本系统的统一对象。

#### ✅ 豁免项（画布内部**不**改）

| 豁免对象 | 范围 | 理由 |
| --- | --- | --- |
| 场景 / 角色 / 粒子 / 特效的**全部配色** | canvas 2D / WebGL 内部绘制的一切颜色 | 高饱和色板是玩法辨识的一部分；统一后玩家读错元素 |
| 画布内的 UI 皮肤 | 画布内自绘的血条、准星、分数、道具图标 | 同上 |
| 画布的**交互反馈** | 命中区、抖动、闪白、粒子、震屏 | 直接影响手感 |
| 画布内的字体 | 画布自绘的数字/文字 | 需与像素级网格对齐 |
| 画布的宽高比与分辨率策略 | — | 影响玩法与性能 |

#### ❌ 不豁免项（画布**周边**必须统一）

| 不豁免对象 | 要求 |
| --- | --- |
| **HUD 容器**（画布外的框、标题栏、说明条） | 用 `.ds-canvas-frame` + `--ds-canvas-hud-bg` / `--ds-canvas-hud-ink` / `--ds-canvas-hud-line` |
| 画布外的**按钮/控件** | `.ds-btn` `.ds-iconbtn` `.ds-chip`，触摸目标按 §5.1 |
| 画布外的**标题与正文** | `--ds-ink` / `--ds-ink-soft`，字号与行高按 §2.2 / §2.3 |
| 画布的**边框、圆角、外阴影** | `--ds-radius-lg` + `--ds-shadow-2`（或 `.ds-canvas-frame` 默认值） |
| 画布的**定位与留白** | `--ds-space-*` + §3.3 栅格 |
| HUD 文字对比度 | **≥4.5:1**（K.3）—— 这一条**不豁免** |

#### 边界判定（三句话）

1. **像素在 canvas 里 → 豁免**；**像素在 DOM 里 → 不豁免**。
2. 同一视觉元素若**同时**存在于画布内外（如同一个血条），以**画布内**为准，不为统一而改画布内那份。
3. 需要在画布上叠加 DOM 层（如浮动说明、成就弹层）时，该 DOM 层**适用**全部规范。

> **不要**为了"看起来统一"给 canvas 套 `filter`、`opacity` 或叠加遮罩——那会直接降低可读性，违反 K.1 / K.3。


---

## 5. 无障碍与双语（所有接入方）

| 项 | 硬性要求 | 令牌 |
| --- | --- | --- |
| 正文对比度 | ≥ **4.5:1** | 三级墨色全部达标：18.18 / 7.48 / ≥4.80（浅色），17.46 / 9.71 / ≥5.15（深色） |
| 大字对比度 | ≥ 3:1 | ≥24px 或 ≥19px 粗体 |
| 图形/控件边界 | ≥ 3:1 | `--ds-line` / `--ds-line-strong` |
| 触摸目标 | ≥ **24px**（AA 2.5.8）；主按钮与图标钮 ≥ **44px**（AAA 2.5.5） | `--ds-target-min` |
| 焦点环 | 2px 强调色 + 2px 背景偏移，**任何状态不得移除** | `--ds-focus-ring` |
| 标题层级 | 每页一个 `h1`，不跳级 | — |
| 状态表达 | **不得只用颜色** | `.ds-tag` 带文字 |
| 弹层 | `role=dialog` + `aria-modal` + 焦点陷阱 + `Esc` + 焦点归还 | `.ds-lightbox` |
| 中文字距 | `:lang(zh)` 归零；**禁止**负字距 | `--ds-track-cjk: 0` |
| 中文行高 | 正文 1.85，标题 1.22 | `:lang(zh)` 覆写 |
| 中文换行 | `word-break: normal` + `overflow-wrap: anywhere`；**禁止** `justify` | — |
| 中英混排 | 中文段内拉丁/数字前后加半角空格 | — |
| **中文字体栈顺序** | 系统 CJK 栈必须排在 `Noto Sans SC` 子集**之前** | `--ds-font-display` / `--ds-font-text`（详见 **§5.3**） |
| 语言标记 | `<html lang>` 随语言切换；每页 `hreflang="zh-CN"` / `hreflang="en"` | — |
| 标题 nowrap | **禁止** `white-space:nowrap`（参考站在 390px 溢出被裁） | — |

### 5.1 触摸目标：**采用两档阈值**，紧凑变体有明确豁免

| 档 | 阈值 | 规范依据 | 适用范围 | 是否硬性 |
| --- | --- | --- | --- | --- |
| **AA** | ≥ **24px** | WCAG 2.2 SC **2.5.8** Target Size (Minimum) | **全部**可交互元素（按钮、链接、输入、chip、图标钮） | ✅ **硬性**，一票否决 |
| **AAA** | ≥ **44px** | WCAG 2.2 SC **2.5.5** Target Size (Enhanced) | **主控件**：`.ds-btn`（含 primary/secondary）、`.ds-iconbtn`、导航轴项、社交圆钮、`--ds-target-min` 承载的一切 | ✅ 目标值，见下方豁免规则 |

**紧凑变体豁免规则（避免为达标而破坏原布局）**

| 项 | 规定 |
| --- | --- |
| 唯一豁免类 | `.ds-btn--sm`（`height: 32px`） |
| 豁免判定 | `.ds-btn--sm` **不计入** 44px 检查，但**仍必须** ≥24px（AA） |
| 允许场景 | 表格/列表行内操作、卡片角标、元信息栏、工具栏、筛选条内次级操作 |
| **禁止**场景 | 主 CTA、弹层内唯一操作、移动端首屏主操作、任何"整页只有一个动作"的页面 |
| **禁止**的做法 | ❌ 为满足 44px 把紧凑按钮放大到 44px，导致原布局被撑破。**若空间不足，正确做法是保留 32px 紧凑变体**，而不是放大 |
| 落地方式 | 紧凑位置用 `<button class="ds-btn ds-btn--sm">`；主位置用 `<button class="ds-btn ds-btn--primary">` |

> 本系统自带校验脚本 `tools/verify-preview.mjs` 已按此口径实现：
> `isPrimary = (含 ds-btn 或 ds-iconbtn) && !含 ds-btn--sm` —— **44px 只对主控件判定**，24px 对全部判定。
> 作者可直接复制该判定逻辑到自己的自测。

### 5.2 ⚠️ 无障碍驱动的偏离：`--ds-ink-faint`（**不是**参考站实测值）
> **这一条必须如实理解**：本系统当前的 `--ds-ink-faint` **不是**对参考站的直接观察，
> 而是**为满足 WCAG AA 正文 4.5:1 所做的规范性调整**。任何文档都不得把它写成"参考站就是这个灰"。

| 版本 | 值 | 在本系统底色 `#FCFBF9` 上的对比度 | 证据等级 |
| --- | --- | --- | --- |
| **参考站实测次级灰** | `#999999` | **2.85:1**（纯白底 2.85 / 本系统底 2.75） | **C 级** `--secondary: #999`（站点 CSS 原文）＋ **B 级** 运行时取色一致（顶部小标、导航轨） |
| 本系统**早期值**（仍在 `01-web` 旧快照里） | `#A79E97` | **2.54:1** | 仅存在于 `01-web/src/styles/tokens.css`；**参考站源码中出现 0 次**——它是本系统自己的历史取值，不是参考站的 |
| **本系统现值**（浅色主题） | `#6E655E` | **5.51:1**（底 `#FCFBF9`）／**4.93:1**（凹槽 `#F2EEE9`） | **本批自定 · 无障碍驱动** |
| **本系统现值**（深色主题） | `#9A918A` | **6.19:1**（底 `#100F0E`）／5.61:1（面 `#1C1A18`） | **本批自定 · 无障碍驱动** |

**结论与要求**
1. 参考站的次级灰在任何浅底上都**不达标**；本系统**主动改深**，属**无障碍优先的规范性偏离**，已在 `DESIGN-SPEC.md` §1.1 与 §13 差异表登记。
2. `#A79E97` 与更浅的灰**一律作废**，任何目录不得继续使用（`01-web` 必须改）。
3. **使用边界**：`--ds-ink-faint` 只能放在 `--ds-bg` / `--ds-bg-sunken` 上；
   **不得**放在 `--ds-surface`（`#E4DED7`）之上（该组合仅 4.27:1，不达标）。

> **顺带一提（本地覆写可回退）**：若你的目录为了绕开**旧版**字体栈顺序而做过**本地覆写**（典型如 `05-museum-research` 在 `.ds-shell` 作用域内把系统 CJK 栈提到子集之前）——
> **现在可以回退了**：上游 `tokens.css` 已修正，直接消费修正后的 token 即可。
> 但**请保留**你在 `README.md` / `LICENSES.md` / `RESTYLE-CHECKLIST.md` 里的「**与 16 令牌顺序的偏差（非静默改动）**」登记——**那是对的范式**，只是结论从「偏差」变为「**已回退至上游修正后的顺序**」。详见 **§5.3**。

### 5.3 中文字体栈顺序：**通用前提**（所有接入方）

> **这是本章唯一的硬性「顺序」条款**——它不涉及取值，只涉及**先后**。所有接入方**不必各自发现**，照此执行即可。

**一句话**：**覆盖完整的 CJK 族必须排在覆盖有限的子集之前。**

```css
/* ✅ 正确：系统 CJK 栈在前，Noto 子集在后（只作离线兜底） */
--ds-font-display: "Space Grotesk", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "Source Han Sans SC", "Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif;
--ds-font-text: "Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "Source Han Sans SC", "Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif;

/* ❌ 错误：Noto 子集在前 —— 会混排 */
--ds-font-display: "Space Grotesk", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", ...;
```

**为什么**（**可量化**，不是理论推演）：

| 事实 | 值 |
| --- | --- |
| `noto-sans-sc-subset.woff2` 体积 | 197 600 B |
| 实测覆盖率 | 某页 **1031 个汉字中的 57.5%**（**438 字缺失**） |
| 实测方式 | `05-museum-research` 用 fontTools 读 woff2 的 **cmap 逐字比对** |
| 子集排前的后果 | 同一标题内「子集字形 + 系统字形」**混排 + 基线错位**，**在任何含未覆盖汉字的页面上都会发生**（对 139 条密集列表为可见缺陷） |

**取舍已决**：本系统采用「**系统栈优先**」。代价是跨平台中文字形不统一（各系统自己的黑体）——**这是可接受的代价**，因为「不缺字、不混排、不错位」更重要。依据是 `fonts/FONT-MANIFEST.json` 的既定策略（`systemFallbacks.note`：系统栈 0 字节、离线可用、**覆盖全字形**）。完整方案对比见 `DESIGN-SPEC.md` §2.5。

**对各位的三条操作**

1. **直接消费上游修正后的 token** 即可（`--ds-font-display` / `--ds-font-text` 已按上表给出）。
2. **若你做过本地覆写**（如 `05` 的 `.ds-shell` 作用域覆写）→ **可回退**，改为直接消费上游；**但保留**你的「非静默改动」登记（见 §5.2 末的提示）。
3. **不要用「删掉子集」替代调序**——那会失去「系统栈整体不可用」场景的兜底。调序后系统栈覆盖完整，汉字恒走系统黑体，子集只在系统栈不可用时兜底。

**验收**：见 §9 的 **V.11** 与 §9.1 的**第 ④ 步**（13-qa-curation 可直接机械判定：取 `Noto Sans SC` 与各系统 CJK 族的下标，前者必须**大于**后者）。

---

## 6. Pages 子路径资源拼接（**硬性**）

线上形态：`https://kingkazmax.github.io/playtime-atlas-20261021/`
作品页：`/playtime-atlas-20261021/works/<id>/`

| 场景 | ❌ 错 | ✅ 对 |
| --- | --- | --- |
| HTML 内资源 | `src="/assets/x.png"` | `src="../../assets/x.png"`（按实际层级数） |
| CSS 内资源 | `url(/assets/x.png)` | `url("../x.png")`（相对 CSS 文件自身） |
| JS 内资源 | `fetch('/data/works.json')` | `fetch(new URL('../../data/works.json', import.meta.url))` 或 `document.baseURI` 拼接 |
| 字体 | `url('/assets/ds/fonts/inter-latin.woff2')` | `url("./inter-latin.woff2")`（与 `fonts.css` 同目录） |
| Vite 构建 | `base: '/'` | `base: './'`（相对路径，天然适配任意子路径） |
| 运行时基准 | 写死 `/playtime-atlas-20261021/` | 由构建注入；本地预览用 `''` |

**统一做法**：每个项目在其入口注入
```html
<style>:root { --ds-base: "/playtime-atlas-20261021/"; }style>
```
本地/子目录预览时把 `--ds-base` 置为 `""`。
`design-tokens.json → asset.basePathVar` 即为此变量。

**发布前必查**（逐条 `curl` 期望 200）
```
/assets/ds/tokens.css
/assets/ds/components.css
/assets/ds/fonts/fonts.css
/assets/ds/fonts/inter-latin.woff2
/works/06-museum-main/art/assets/fonts/fonts.css   ← 历史 404
/works/<id>/models/*.glb
```

---

## 7. `prefers-reduced-motion` 降级（**硬性**）

每个接入方必须实现下面这段（可复制本系统 `src/tokens.css` 的同名块）：

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --ds-dur-instant: 1ms; --ds-dur-fast: 1ms; --ds-dur-base: 1ms;
    --ds-dur-slow: 1ms;  --ds-dur-reveal: 1ms; --ds-entry-duration: 1ms;
  }
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
  .ds-in { opacity: 1; transform: none; filter: none; }
  .ds-rail__item { filter: blur(0) !important; }
}
```

| 必须关闭 | 必须保留 |
| --- | --- |
| 入场位移与模糊 | 不产生位移的淡入淡出（≤1ms） |
| 导航轴景深模糊 | 焦点环 |
| 灯箱面板位移 | hover 的背景色/描边变化 |
| 圆点↔箭头形变 | — |
| 滚动吸附的平滑行为（`scroll-behavior: auto`） | — |
| 任何自动轮播 | — |

**禁止**用 JS 强制 `scroll-behavior: smooth`（会覆盖用户系统偏好）；需要时显式用 `behavior: 'auto'`。

---

## 8. 字体与许可

| 要求 | 说明 |
| --- | --- |
| 自托管 | **禁止** CDN / `fonts.googleapis.com` / `@import url(https://…)` |
| 字体族名一致 | 与本系统 `fonts/FONT-MANIFEST.json` 一致：Space Grotesk（展示）/ Inter（正文）/ Space Mono（等宽） |
| 中文字体 | 优先系统栈（`PingFang SC` / `Microsoft YaHei` / `Noto Sans SC`…）；若自托管中文须登记许可 |
| **中文字体栈顺序（硬性）** | **覆盖完整的 CJK 族必须排在覆盖有限的子集之前**：`PingFang SC` → `Hiragino Sans GB` → `Microsoft YaHei` → `Source Han Sans SC` → `Noto Sans SC`。把 `Noto Sans SC` 提到系统栈之前，会因 CSS 按字符回退导致同段文字混入两套字形、基线错位。详见 `DESIGN-SPEC.md` §2.5 |
| 保留自研字体的目录 | 03（`Loomdeck Serif/Mono`）、04（`Songti SC` 系）、12（`JetBrains Mono`）——**若保留必须自托管 + 登记进本目录 `LICENSES.md`**；否则改用本系统字体族 |
| 许可登记 | 每目录建 `LICENSES.md`，记录：字体名 / 版本 / 文件 / 字节 / 许可类型 / 许可全文位置 / 来源 URL / 版权声明 |
| 预加载 | 只 preload 首屏用到的 2 个拉丁字体；汉字不 preload |
| `font-display` | `swap`（避免 FOIT 阻塞） |

**本系统可复用的字体资产**（OFL 1.1，随包附许可全文，已在本目录 `fonts/`）
`space-grotesk-latin.woff2` 34 788 B ／ `inter-latin.woff2` 132 684 B ／ `space-mono-regular.woff2` 14 884 B ／ `space-mono-bold.woff2` 15 000 B ／ `noto-sans-sc-subset.woff2` 197 600 B（子集，覆盖有限）
→ 需要时从 `16-design-system/fonts/` 取用，**许可全文一并复制**到本目录。

---

## 9. 验收清单（13-qa-curation 可直接实现）

| # | 检查 | 期望 | 方法 |
| --- | --- | --- | --- |
| V.1 | 水平溢出 | 1440/1280/768/390 四档 `scrollWidth ≤ innerWidth` | `document.documentElement.scrollWidth` |
| V.2 | 对比度 | 正文 ≥4.5、大字 ≥3、UI ≥3 | 计算 `color` + 逐级上溯背景色 |
| V.3 | 令牌一致性 | 目录内 `--ds-*` 取值 == `design-tokens.json` | 解析 `:root` 比对 |
| V.4 | 命名空间冲突 | 无与本系统同名不同义的 `--ds-*` | 比对变量名集合 |
| V.5 | 焦点可达 | Tab 序列不被吞，焦点环始终可见 | 现有 D5 扩展 |
| V.6 | 触摸目标 | 全部 ≥24px；主控件 ≥44px | 现有 D1/D2 扩展 |
| V.7 | reduced-motion | 时长归 1ms、位移与模糊归零 | 模拟媒体特性 |
| V.8 | 外部请求 | 运行期 0 个非本地请求 | 网络面板 |
| V.9 | 字体 | 全部本地加载，无 CDN | 网络面板 + `document.fonts` |
| V.10 | 子路径 | §6 的 URL 全部 200 | `curl` |
| V.11 | **字体栈顺序** | `--ds-font-display` / `--ds-font-text` 中，`Noto Sans SC` 不得排在 `PingFang SC` / `Hiragino Sans GB` / `Microsoft YaHei` / `Source Han Sans SC` **之前** | 解析 `:root` 比对下标 |
| V.12 | **不自造字体栈** | 自有 CSS 的 `font-family` **只允许**引用 `var(--ds-font-*)`；**不得**出现字面 CJK 字体族列表（如 `"PingFang SC"`） | 扫描自有 CSS 的 `font-family` 声明 |
| V.13 | **无规范漂移** | `tokens.css` 的 `--ds-font-display` / `--ds-font-text` **字体族序列**必须与 `design-tokens.json → typography.family` **逐项相等（含顺序）** | 解析两处后按序比较数组 |

> **V.12 与 V.13 来自 05-museum-research 的实践**（其自检脚本 `scripts/ds_duration_audit.py` 的 A.11 / A.12 判据）。前者防「各目录各自照抄一份字体栈」（正是本轮字体栈缺陷扩散的根因），后者防「规范与实现分叉」——**值相同但顺序不同**也算漂移。
> **V.11—V.13 三项已由 `16-design-system/tools/validate-tokens.mjs` 实现**，各目录可直接复制该脚本执行，无需自行重写。

**本目录已提供零依赖参考实现**：`tools/validate-tokens.mjs`、`tools/verify-preview.mjs`（只用 Node 内置模块 + 本机 Chrome 的 CDP，可直接复制进 13 的 harness）。

### 9.1 13-qa-curation 的复核方式（作者据此自测）

**13 不做主观审美评判，只做机械判定。** 复核动作分四步：

| 步 | 动作 | 判定 |
| --- | --- | --- |
| ① **令牌一致性** | 解析作者目录的 `:root`，与 `16-design-system/design-tokens.json` 逐名比对 | 值必须**完全相等**（大小写不敏感、去空格）。深色主题目录（02/04/06/09）比对**暗色主题组**取值 |
| ② **页面机械检查** | 用 `tools/verify-preview.mjs` 的同款 CDP 脚本跑作者页面 | 四档视口 1440/1280/768/390：`scrollWidth ≤ innerWidth`；对比度 12 项；触摸目标 24/44 两档；reduced-motion 双路径；控制台 0 错误；外部请求 0 |
| ③ **红线核对** | 人工核对 §4 的 K.1–K.6 与 §4.1 缺陷表 | 画布内部**未被改动**（diff 检查 canvas 相关 CSS）；焦点环未被 `outline:none` 移除 |
| ④ **字体栈三项** | ① **顺序**（V.11）：解析 `:root` 的 `--ds-font-display` / `--ds-font-text`，取 `Noto Sans SC` 与各系统 CJK 族的下标 | `Noto Sans SC` 下标**必须大于**所有系统 CJK 族下标（排在系统栈**之后**）。违反即 ❌ 不通过——这是**规范源头**已修正的硬性项（`DESIGN-SPEC.md` §2.5），曾导致 8 个目录集体出现中文基线错位<br>② **不自造**（V.12）：扫描自有 CSS 的 `font-family` 声明 | 只能引用 `var(--ds-font-*)`；出现字面 CJK 字体族列表即 ❌（说明该目录自己照抄了一份字体栈）<br>③ **无漂移**（V.13）：把 `tokens.css` 的字体族序列与 `design-tokens.json → typography.family` 逐项比较 | 序列必须**逐项相等（含顺序）**；值同序不同也算漂移 |

**判定口径**

| 结果 | 13 的标记 |
| --- | --- |
| 全部检查通过 | ✅ 通过 |
| 有 warning 但作者已书面说明理由 | ⚠️ 有条件通过（记录理由） |
| 任一硬性项不达标（对比度 / 溢出 / 触摸目标 / 外部请求 / 焦点环 / 画布被改） | ❌ 不通过 → 回到 15-supervisor 重新派单 |
| **探针超时 / 探针本身故障** | ⛔ **不计产品失败**（记为 `harness-timeout` / `blockedByHarness`）——见下方「harness 与产品缺陷必须分开记账」 |
| 规范本身缺失该维度 | ⏸️ **待规范**（记在 16 头上，不算作者的错） |

> **13 可直接复用的零依赖脚本**（只用 Node 内置模块 + 本机 Chrome 的 CDP，无 npm 依赖）：
> `16-design-system/tools/validate-tokens.mjs`（令牌一致性 + **V.11/V.12/V.13** 字体栈三项）、
> `16-design-system/tools/verify-preview.mjs`（页面机械检查，含对比度/触摸目标/reduced-motion/无外部请求断言）。
> 复制进 13 的 harness 即可，**不必**自行重写。
> `16-design-system/tools/ds-audit-tokens.mjs`（全库 token 层只读审计，`--json` 可选）、
> `16-design-system/tools/selftest-verify-preview.mjs`（**验证 verify-preview 自身行为**的 6 条断言）。

#### harness 与产品缺陷必须分开记账（2026-10-22 由 05-museum-research 提议，已采纳）

> **验收工具的偶发故障，不得变成下游的错误验收结论。**

| 现象 | 性质 | 记法 |
| --- | --- | --- |
| 探针超时、CDP 调用失败、机器负载导致的样式未就绪 | **harness 问题** | ⛔ 不计产品失败；标记 `harness-timeout` / `blockedByHarness`；**先重跑再判定** |
| 探针重跑后稳定复现同一项失败 | **产品问题** | ❌ 不通过 |
| 探针输出 `timedOut` / `styleWait` 告警 | **harness 风险信号** | ⚠️ 有条件通过 + 记录，先重跑 |

> **线上验收的浏览器入口（2026-10-22 起的长期约定）**：**13 与各作者的【线上验收】一律走 Ego 浏览器**
> （`/Users/mekzenx2/.local/bin/ego-browser`，**先运行 `ego-browser skill`** 并遵循当前版本指南；
> 脚本形态 `ego-browser nodejs <<'EOF' … EOF`；每个目标**复用一个 TaskSpace**，保留用户标签页与登录状态，**不清 cookies**）。
> **禁止**另起 Playwright / Chromium / Chrome 或任何其他浏览器路径；Ego 故障时**诊断并如实报告**，不静默换浏览器。
> 此前用本地无头 Chrome 做的验收**仍然有效**，但**今后**的线上验收应改用 Ego。
> ⚠️ 注意：`16-design-system/tools/verify-preview.mjs` 加载的是**本地 `file://` 样例页**、不访问任何站点，属**本地自测**，**不受**此约定约束。

**为什么必须分开**：本批的 `verify-preview.mjs` 曾因「`Page.navigate` 后固定 `sleep(1500)` 就读 `getComputedStyle`」产生**假失败**——样式表未解析完时读到空值，被误判为「系统 prefers-reduced-motion 生效」失败，且**首跑 FAIL / 复跑 PASS**。若直接采信首跑结果，一个本来通过的目录会被判成 ❌。

> 口径与 13 对 03 / 04 / 12 的判定一致，也与 05 的 `blockedByHarness` / `classification: harness-timeout` 一致。

**作者自测的最短路径**：改完 → 跑 `node tools/validate-tokens.mjs` → 跑 `node tools/verify-preview.mjs` → 两项 0 error 再交。
**若怀疑是假失败**：先跑 `node tools/selftest-verify-preview.mjs`（确认脚本自身无回归），再**原样重跑** `verify-preview.mjs`；两次结果不一致时，以**重跑结果**为准并记录。


---

## 10. 不要做（红线）

| ❌ | 原因 |
| --- | --- |
| 把参考站的作品名/文案/图片搬过来 | 冒充原作，违反 MASTER-UPDATE |
| 拷贝参考站的图片、视频、字体 | 未授权资产 |
| **统一游戏画布内部的色板** | 违反 K.1，伤害可玩性 |
| 删除既有 CSS 以"套用"本系统 | 会破坏可玩性；本系统是**增量**（`.ds-` 类名 + 重定向变量） |
| 用 `z-index` 修重叠 | 结构问题在结构层解决 |
| 复制参考站的 `#6549F2` 紫 | 配色已重新设计为朱砂 `#B4432B` |
| 标题加 `white-space: nowrap` | 390px 必然溢出 |
| 给中文加负字距 | 破坏汉字字面 |
| 引入任何 CDN 字体或脚本 | 违反资源本地化 |
| 在本目录之外写文件 | 每目录唯一作者原则 |
| 引入本系统 tokens.css 而不先解决 §0 风险 A | 同名变量互相覆盖，数值全错 |

## 11. 与 19-architecture-atlas 的边界（以及 16 与全体目录的边界）

| 维度 | 16-design-system | 19-architecture-atlas |
| --- | --- | --- |
| 角色 | **规范产出方**：定义 token、组件类与 UI 规范 | **消费方**：双语建筑科普主站，自己实现 |
| 产出 | `design-tokens.json` `src/tokens.css` `src/components.css` `DESIGN-SPEC.md` | 自有页面与自有三维模型 |
| 是否改对方代码 | ❌ **绝不** | ❌ 不改 16 的任何文件 |
| 接口 | —— | **只经两个入口**：`design-tokens.json`（取值）+ `src/`（类名）。二者都是**只读引用** |
| 落地方式 | 提供规范 | 19 自行在自己的 `src/styles/` 落地 token 层并注明依据（`15-supervisor/RESTYLE-SPEC.md` §1） |

**16 对全体目录（00—19）的同一原则**

1. **只出规范、清单与对照表**，不跨目录改业务代码、不在他人目录写任何文件。
2. **只读引用，不复制文件**：各目录自行落地 token 层并注明依据。
3. **不代作者派活**：改版派单统一由 **15-supervisor** 发；16 只负责"规范说了什么、对应哪个 token"。
4. **不建仓、不 push、不部署**：GitHub / Pages 发布唯一归 **14-publish**。
5. 发生规范与既有实现冲突时（例如某目录的暗色主题、某作品的游戏色板），**以可玩性与既有功能为先**，规范让步并在 `DESIGN-SPEC.md` §13 差异表登记。

> 16 与 19 的**唯一交汇点**就是 `design-tokens.json` 和 `src/` 这两个只读产物。
> 19 不必等待 16 的任何进一步改动即可开始消费；16 后续若增补令牌，19 按 `MIGRATION-NOTES.md` §2.0 的规则增量对齐即可。

---

## 12. 给作者的一句话入口

> **打开 `16-design-system/preview.html` 看成品 → 打开 `design-tokens.json` 取值 → 用「旧变量 → 新 token」重定向表（第 2 节）替换自己的 `:root` → 把外壳换成 `.ds-*` 类 → 动完用 `tools/verify-preview.mjs` 的同款检查自测。游戏画面内部不要动。**
