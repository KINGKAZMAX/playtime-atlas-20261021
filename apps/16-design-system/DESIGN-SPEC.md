# DESIGN-SPEC — 余晖设计系统 / Afterglow Design System v1.0

> 事实来源：`REFERENCE-AUDIT.md`（证据等级 A/B/C）。凡本文出现"实测"字样，均可回溯到该档案的 A 或 B 级证据。
> 令牌真值：`design-tokens.json` → 落地 CSS：`src/tokens.css` + `src/components.css`。
> 组件样例：`preview.html`（可直接打开运行）。

---

## 0. 设计系统定位

| 项 | 值 |
| --- | --- |
| 名称 | 余晖设计系统 / Afterglow Design System |
| 代号 | `afterglow-ds` v1.0.0 |
| CSS 变量前缀 | `--ds-` |
| 类名前缀 | `.ds-` |
| 覆盖范围 | 14 作品大厅（14-publish）、06 回响电玩馆、01—12 各作品、17 建筑研究 / 18 结构模型 / 19 双语建筑科普主站 |
| 资源策略 | 全本地化，运行期零外部 CDN 请求；Pages 子路径自适应 |
| 语言 | 中文（主）+ 英文（次），双语同页共存 |

### 0.1 核心主张

1. **一屏一件事。** 作品大厅用网格（信息密度），作品详情用长页（叙事），沉浸作品用整屏分段（体验）。三者共享同一套令牌与控件。
2. **一页一色域。** 每个作品/展项声明自己的底色，页面控件自动反色（**取自参考站的 tone 机制**）。
3. **克制的强调。** 全站只有**一个**强调色，其余为无彩灰阶 + 一个建筑线稿用辅助色（**取自参考站的单强调色机制**）。
4. **动效是空间，不是特效。** 位移 + 透明度 + 微模糊三件套；不做旋转、弹跳、粒子。
5. **可读优先于风格。** 游戏画布、史料正文、年代轴的对比度与行距有硬性下限（§9）。

---

## 1. 色彩

### 1.1 基础色板

| 令牌 | 浅色 | 深色 | 用途 |
| --- | --- | --- | --- |
| `--ds-bg` | `#FCFBF9` | `#100F0E` | 页面底（暖白纸） |
| `--ds-bg-raised` | `#FFFFFF` | `#1A1917` | 卡片/浮层 |
| `--ds-bg-sunken` | `#F2EEE9` | `#0B0A09` | 槽位、输入底 |
| `--ds-ink` | `#14110F` | `#F7F4F0` | 主文字 |
| `--ds-ink-soft` | `#59514B` | `#C0B7B0` | 次级文字（实测 7.48:1 / 9.71:1） |
| `--ds-ink-faint` | `#6E655E` | `#9A918A` | 占位、年代轴、禁用（实测 ≥4.80:1 / ≥5.15:1） |
| `--ds-line` | `#E4DED7` | `#2B2926` | 常规描边/分割线 |
| `--ds-line-strong` | `#CFC6BC` | `#453F39` | 强调描边、hover |
| `--ds-surface` | `#F2EEE9` | `#1E1D1B` | 静置块面 |
| `--ds-accent` | `#B4432B` | `#E0684A` | **唯一强调色**（朱砂） |
| `--ds-accent-hover` | `#97361F` | `#EE8266` | |
| `--ds-accent-soft` | `#F6E9E4` | `#331C15` | 强调标签底 |
| `--ds-jade` | `#2E6A5E` | `#5FA99A` | 辅助色，**仅**建筑线稿/结构图解 |

**规则**
- 强调色**只**用于：主 CTA、当前选中、焦点环、关键数据高亮、选中态标签。**不得**用于大面积背景、装饰块、渐变。
- 辅助色 jade **不得**用于交互控件，只用于建筑图解的线条与填充（`--ds-jade-soft`）。
- 页面背景**不得**使用纯色以外的图案；参考站那种"四周极淡径向柔光"由 `--ds-glow` 实现，**仅在英雄区允许**（§3.2）。
- **三级墨色全部满足正文 4.5:1**：`ink` 18.18:1 → `ink-soft` 7.48:1 → `ink-faint` ≥4.80:1（浅色主题实测值，深色主题分别为 17.46 / 9.71 / ≥5.15）。
- 墨色三级在**所有**底面（`bg` / `bg-raised` / `bg-sunken` / `surface` / `accent-soft`）上均已验算通过，即任何组件把文字放在这些底面上都不会掉到 4.5:1 以下。
- 早期版本的 `ink-faint`（浅色 `#A79E97`，2.54:1）已作废——它无法在任何浅底上达标。**不得**再使用该值或更浅的灰。

> ⚠️ **无障碍驱动的偏离 —— 不得把本值说成"参考站实测值"**
>
> | 版本 | 值 | 在 `--ds-bg` `#FCFBF9` 上的对比度 | 证据 |
> | --- | --- | --- | --- |
> | **参考站实测次级灰** | `#999999` | **2.85:1** | C 级 `--secondary: #999`（站点 CSS 原文）＋ B 级运行时取色一致 |
> | 本系统早期值（仍残留于 01-web 旧快照） | `#A79E97` | **2.54:1** | **参考站源码中出现 0 次**；它是本系统自己的历史取值 |
> | **本系统现值** | `#6E655E` / `#9A918A`（深） | **5.51:1** / **6.19:1** | **本批自定 · 无障碍驱动** |
>
> **参考站的次级灰在任何浅底上都不达标**，本系统主动改深以满足 WCAG AA 正文 4.5:1。
> **使用边界**：`--ds-ink-faint` 只能置于 `--ds-bg` / `--ds-bg-sunken` 上，**不得**置于 `--ds-surface`（`#E4DED7`，该组合仅 4.27:1）。

### 1.2 分区色调机制（tone-aware sections）

每个作品段可声明自己的底色，控件自动反色：

```html
<section class="ds-section" data-ds-bg="#101820" data-ds-tone="dark">
```

| 令牌 | 浅底分区 | 深底分区 |
| --- | --- | --- |
| `--ds-section-ink` | `#14110F` | `#F7F4F0` |
| `--ds-section-soft` | `rgba(20,17,15,.62)` | `rgba(247,244,240,.78)` |
| `--ds-section-faint` | `rgba(20,17,15,.38)` | `rgba(247,244,240,.46)` |

**判定规则**（本系统采用 WCAG 相对亮度，不沿用参考站的字节求和法）：

```
L = 0.2126·R + 0.7152·G + 0.0722·B   (sRGB 线性化后)
tone = (L ≥ 0.18) ? "light" : "dark"
```

> **为什么改**：参考站用 `R+G+B < 384` 判定（C 级源码），对饱和色（如纯红 `#FF0000`，和=510）会判为 light，但相对亮度只有 0.2126，**实际读作深色**，导致文字反色错误。本系统改用 WCAG 相对亮度，同一判定同时驱动文字反色与焦点环取色。
> 另：参考站深色主题在源码中**被注释掉、未启用**（REFERENCE-AUDIT §3.4），本系统的深色主题为自主实现并已验算对比度。
> 工具函数见 `src/components.css` 的 `[data-ds-tone]` 与 §12 差异表。

**分区圆角**：`--ds-section-radius-scale` 默认 1，圆角 = `clamp(16px, 2vw, 28px) ÷ scale`。取自参考站的 `--r` 机制（其 `--r: 1` → `clamp(16px,2vw,24px)`），但本系统上限放宽到 28px 且**不做逐作品相异**（统一比逐件变化更易维护）。

### 1.3 画布与 HUD 色

| 令牌 | 值 | 说明 |
| --- | --- | --- |
| `--ds-canvas-hud-bg` | `rgba(16,15,14,.72)` | HUD 底，8px 背景模糊 |
| `--ds-canvas-hud-ink` | `#F7F4F0` | HUD 文字 |
| `--ds-canvas-hud-line` | `rgba(247,244,240,.24)` | HUD 描边/键位框 |
| `--ds-canvas-scrim` | `rgba(16,15,14,.55)` | 画布上承载正文的最低遮罩 |
| `--ds-danger / success / warning / info` | `#C2452B` / `#3F7A4E` / `#B07A1E` / `#2C5C8F` | 状态语义色，**不与强调色混用** |

---

## 2. 字体

### 2.1 字族

| 角色 | 栈（**顺序即规范，见 §2.5**） | 用途 |
| --- | --- | --- |
| Display | `Space Grotesk` → 系统 CJK 栈 → `Noto Sans SC` → `sans-serif` | 作品名、分区标题、英雄区标题、按钮 |
| Text | `Inter` → 系统 CJK 栈 → `Noto Sans SC` → `sans-serif` | 正文、说明、详情 |
| Mono | `Space Mono` → `ui-monospace` | 年份、编号、键位、坐标、史料编号 |

系统 CJK 栈 = `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC"`。
完整可粘贴值见 `src/tokens.css` 的 `--ds-font-display` / `--ds-font-text`。

全部字体**自托管**，见 `fonts/FONT-MANIFEST.json`。运行期**零外部请求**。

### 2.2 字号与行高

| 角色 | 字号 | 行高 | 字重 | 字距 |
| --- | --- | --- | --- | --- |
| Display | `clamp(40px, 6.6vw, 84px)` | 1.08 | 500 | -0.03em |
| H1 | `clamp(30px, 4.2vw, 52px)` | 1.22 | 500 | -0.03em |
| H2 | `clamp(22px, 2.6vw, 32px)` | 1.22 | 500 | -0.03em |
| H3 | `20px` | 1.35 | 500 | -0.03em |
| Lead | `19px` | 1.6 | 400 | -0.005em |
| Body | `16px` | 1.6 | 400 | -0.005em |
| Sm | `14px` | 1.6 | 400 | -0.005em |
| Xs | `12.5px` | 1.6 | 400 | -0.005em |
| Mono | `13px` | 1.45 | 400 | +0.02em |

**H3 = 20px 是刻意对齐参考站的分区标题字号**（B 级实测 20px / `wght 500`）——这是本系统**唯一**与参考站完全一致的排版数值，因为它承担完全相同的角色（居中分区标题），且不构成"抄袭"。

### 2.3 中文排版（`lang` 驱动）

参考站是纯英文站，**不存在**中文排版先例。下列规则**为本系统原创**：

```css
:lang(zh), :lang(zh-CN), :lang(zh-TW) {
  letter-spacing: 0;          /* 负字距会压垮汉字字面 */
  line-height: 1.75;           /* 正文 */
  word-break: normal;         /* 不按字符断行 */
  overflow-wrap: anywhere;    /* 长英文/URL 仍可断 */
}
:lang(zh) .ds-display, :lang(zh) .ds-h1 { font-weight: 500; line-height: 1.22; }
```

**双语混排规则**
- 中文段落内的拉丁文/数字前后加**半角空格**（中文排版惯例）。
- 中文段落**不**使用 `text-align: justify`（会产生不均匀字距）。
- 同一段落内**不混用**两套中文字体。
- 标题字号：中文标题较同等语义拉丁标题**视觉更大**，故 Display 上限对中文降一档（H1 上限 52px，Display 在 `:lang(zh)` 下 max-width 放宽到 22ch、行高 1.2）。
- 数字与编号（年份、坐标）在中文语境也用 `--ds-font-mono`，与拉丁保持一致。

### 2.4 字体加载

- `font-display: swap`，避免 FOIT 阻塞。
- `<link rel="preload" as="font" type="font/woff2" crossorigin>` 仅用于英雄区上方使用的 **Inter** 与 **Space Grotesk** 两个文件；其余按需。
- 汉字走系统字体栈（0 字节、覆盖完整）；`Noto Sans SC` 子集为渐进增强，**必须排在系统 CJK 栈之后**（见 §2.5）。

### 2.5 字体栈顺序规则（**硬性**，v1.0.1 补入）

> **覆盖完整的 CJK 族必须排在覆盖有限的子集之前。**

CSS 的 `font-family` 是**按字符回退**的：浏览器逐字尝试栈中每个族，第一个**能渲染该字形**的族胜出。因此：

| 写法 | 实际结果 |
| --- | --- |
| `Noto Sans SC` 在系统栈**之前** | 子集覆盖的字走 Noto、**不覆盖的字回落系统黑体** → 同一段文字混入两套字形 + 两套基线，视觉上出现错位与粗细跳变 |
| 系统 CJK 栈在 `Noto Sans SC` **之前** | 汉字恒走系统黑体（覆盖完整），子集**永不生效**，栈内只作兜底 |

**结论**：在本系统中 `Noto Sans SC` 子集排在系统 CJK 栈之后才是正确写法。子集在本系统里的定位是**离线兜底 / 字形差异微调**，不是主力。

#### 子集覆盖率的实测事实（2026-10-21）

| 项 | 实测值 | 来源 |
| --- | --- | --- |
| 子集体积 | 197 600 B | `fonts/noto-sans-sc-subset.woff2` |
| 覆盖范围 | 某页 **1031 个汉字中的 57.5%**（**438 字缺失**） | `05-museum-research` 用 fontTools 读 woff2 的 **cmap 逐字比对** |
| 缺失时的行为 | 浏览器逐字回退到系统黑体 | CSS `font-family` 字符级回退 |

**因此「系统栈优先」是【有意决策】，不是实现疏忽。** 依据是 `fonts/FONT-MANIFEST.json` 的**既定策略**（`systemFallbacks.note`：系统栈 0 字节、离线可用、**覆盖全字形**，任何设备都不会缺字）——子集覆盖率仅 57.5%，把它排在前面会**必然**触发混排。

**后果可量化**：子集排在前 → 同一标题内出现「子集字形 + 系统字形」**混排与基线错位**，且**在任何含未覆盖汉字的页面上都会发生**（对 139 条密集列表是**可见缺陷**）。

> **两个方案的取舍（已决）**
> | 方案 | 代价 | 结论 |
> | --- | --- | --- |
> | **A. 系统栈优先**（本系统采用） | 跨平台中文字形**不统一**（各系统自己的黑体） | ✅ 采用——**不缺字、不混排、不错位**。跨平台字形差异是**可接受的代价** |
> | B. 子集优先 | 字形统一但**每页缺 42.5% 汉字**→ 必然混排 + 基线错位 | ❌ 不采用——除非用 fontTools 按全站文案**重新子集化**并做到 100% 覆盖 |
>
> **若将来要切到方案 B**，必须先完成：① 用 fontTools 按全站最终文案重新子集化并验证 100% 覆盖；② 改 `FONT-MANIFEST.json` 的 `systemFallbacks.cjk` 顺序与 `note`；③ 改本节与 `MIGRATION-NOTES.md` §5.3；④ 重新跑 `tools/verify-preview.mjs` 并对每个接入页做混排目视检查。**在此之前不得擅自改序。**

**规则（落地口径）**

1. `--ds-font-display` / `--ds-font-text` 的顺序**必须**为：拉丁自托管字体 → `PingFang SC` → `Hiragino Sans GB` → `Microsoft YaHei` → `Source Han Sans SC` → `Noto Sans SC` → `-apple-system` → `BlinkMacSystemFont` → `sans-serif`。
2. **禁止**把 `Noto Sans SC` 放在任何系统 CJK 族之前。
3. 若某目录**不随包分发** `noto-sans-sc-subset.woff2`（`@font-face` 被注释或文件不存在），则栈中保留 `"Noto Sans SC"` 亦无害——但**仍应按上述顺序书写**，以免将来放开子集时立刻中招。
4. 验收方式：见 `MIGRATION-NOTES` §9.1 的字体栈顺序检查项。

> **来源**：本条不是理论推演。`05-museum-research` 在其目录实测到中文段落的基线错位，根因即「Noto 子集排在系统栈前」；`16-design-system` 已同步修正 `src/tokens.css`、`design-tokens.json`、`fonts/fonts.css`、`fonts/FONT-MANIFEST.json` 四处，**并已修正本节此前的错误表述**（v1.0.0 曾写作 `Noto Sans SC` → 系统黑体，属规范源头错误，见 `STATUS.md` §7.7）。

---

## 3. 布局

### 3.1 三种页面骨架

| 骨架 | 用于 | 结构 |
| --- | --- | --- |
| **Grid（网格）** | 作品大厅、策展目录、QA 报告 | 顶部栏 + 筛选条 + 响应式卡片网格 |
| **Long（长页）** | 作品详情、建筑科普、来源与许可 | 顶部栏 + 单一长页 + 页脚 |
| **Stage（整屏分段）** | 沉浸式作品、06 展厅、18 结构模型 | 100dvh 分段 + 纵向 scroll-snap |

### 3.2 英雄区 / 封面（Cover）

```
.ds-cover  →  min-height: min(88dvh, 780px)
             flex column / center / gap 24px / text-align center
```

顺序固定为：**眉标 → 标题 → 导语 → 动作组 → 媒体**。

| 元素 | 规则 |
| --- | --- |
| 眉标 | `.ds-caps`，`--ds-ink-faint`，12.5px，字距 +0.08em，大写（中文改用不转写的 `text-transform: none`） |
| 标题 | `.ds-cover__title`，`max-width: 18ch`（中文 22ch），**`overflow-wrap: anywhere`** |
| 导语 | `.ds-cover__lede`，`max-width: 62ch`，19px |
| 动作组 | `.ds-cover__actions`，gap 12px，居中，换行 |
| 媒体 | `.ds-cover__media`，`aspect-ratio 21/9`，圆角 `--ds-radius-media` |
| 滚动提示 | 底部居中的 chevron，44×44 触摸目标，**不抢焦点**（`aria-hidden`） |

**🚫 硬性禁令**
1. **禁止 `white-space: nowrap` 出现在任何标题上。** 参考站在 390px 下标题横向溢出被裁（REFERENCE-AUDIT §3.3），本系统不得复现。
2. **禁止纯色大面积强调背景。** 强调色只用于控件。
3. 标题与正文的最大宽度必须显式给出，避免长行。

### 3.3 容器与栅格

| 令牌 | 值 |
| --- | --- |
| `--ds-max-width` | 1280px |
| `--ds-max-width-wide` | 1600px |
| `--ds-read-width` | 68ch |
| `--ds-space-gutter` | `clamp(16px, 4vw, 48px)` |
| `--ds-grid-gap` | 24px |

**页面水平内边距必须使用 `--ds-space-gutter`**，不得写死 16/24/32px。
`14-publish` 的 Pages 路径为 `/playtime-atlas-20261021/`，所有资源引用必须相对化（§10）。

### 3.4 整屏分段（Stage）

```css
.ds-scroll-snap__viewport {
  height: 100dvh; overflow-y: scroll; overflow-x: hidden;
  scroll-snap-type: y mandatory; scroll-snap-stop: always;
}
.ds-scroll-snap__viewport > * { flex: 0 0 100dvh; scroll-snap-align: start; }
```

**取自参考站的机制**：整屏分段 + 强制吸附 + 离屏 `content-visibility: hidden`（性能）。
**本系统的改动**：
- 不做 `rotateX` 3D 倾斜（实测参考站用了 `rotateX(-5h deg)`，但该效果在低端机与 `prefers-reduced-motion` 下体验差且会干扰文字阅读）。
- 不用 `perspective: 512px`（会产生新的层叠上下文，使 `position: fixed` 的 HUD 定位异常）。
- 分段切换用**淡入 + 8px 上移**（`--ds-ease-out`，`--ds-dur-base`），不用模糊。

### 3.5 响应式断点

| 断点 | 变化 |
| --- | --- |
| `≤ 767px` | 导航轨转横排置顶；标题降档；`.about-text` 降为 17px；详情页单列；灯箱媒体圆角归零 |
| `768–1023px` | 栅格 2 列；大厅行由竖排转横排（`88px / 1.15fr / 1fr`） |
| `≥ 1024px` | 栅格 3+ 列；导航轨竖排固定左侧 |

**主断点 768px 与参考站一致**（B 级实测其媒体查询为 `min-width: 768px`），以便迁移期视觉连续。

---

## 4. 导航

### 4.1 左侧导航轨（`.ds-rail`）— 景深式作品轴

参考站的核心视觉发明是**按距当前分区的距离做衰减**的竖排索引（A 级截图 + C 级 `calculateBlur`）。

**本系统实现（不复制其模糊，且不牺牲对比度）**：

```css
.ds-rail__item {
  color: var(--ds-ink-faint);          /* 远景级 */
  font-size: var(--ds-type-sm);
  transform: scale(var(--ds-rail-scale, 1));
  transform-origin: left center;
  transition: color 200ms var(--ds-ease-veil),
              font-size 320ms var(--ds-ease-veil),
              transform 320ms var(--ds-ease-veil);
}
.ds-rail__item[data-rail-level="1"] { color: var(--ds-ink-soft); }
.ds-rail__item[aria-current="true"] {
  color: var(--ds-ink); font-size: var(--ds-type-body);
  font-weight: var(--ds-w-medium); transform: scale(1);
}
```

景深用**墨色层级 + 字号 + 字重 + 微缩放**表达，由 JS 写入 `data-rail-level` 与 `--ds-rail-scale`：

| 与当前项距离 | 墨色 | 字号 | 字重 | 缩放 | 实测对比度 |
| --- | --- | --- | --- | --- | --- |
| 0（当前） | `--ds-ink` | 16px | 500 | 1.00 | 18.18:1 |
| 1 | `--ds-ink-soft` | 14px | 400 | 1.00 | 7.48:1 |
| ≥ 2 | `--ds-ink-faint` | 14px | 400 | 0.97 | ≥4.80:1 |

> **⚠️ 为什么不用 opacity 衰减**：半透明文字无论基准色多深都**无法**保持 4.5:1——
> 以 5.76:1 的 `--ds-ink-soft` 为基准，即便 82% 不透明度叠加在纸上也只有 3.87:1。
> 参考站用的 `--tone-soft: #999`（对白 2.85:1）更不达标。
> **可访问性优先于风格复刻**，因此景深改由墨色层级 + 字号 + 字重 + 缩放承担；
> 视觉上的"远近"仍然清晰，语义上的"当前位置"由 `aria-current` 明确给出。

**结构**
```html
<nav class="ds-rail" aria-label="作品年代轴">
  <button class="ds-rail__item" data-target="home">HOME</button>
  <span class="ds-rail__sep" aria-hidden="true"></span>
  <button class="ds-rail__item" data-target="w-01" aria-current="true">2026</button>
  ...
</nav>
```
- 分隔线为 `10×1px` 横线（桌面）/ `1×10px` 竖线（移动），`opacity .35`，`aria-hidden`。
- 每项是**真实 `<button>`**，有 `aria-label`（如「2026 年 · 千色仪」），键盘可达。
- 移动端转为顶部横排，`overflow-x: auto`，**不得**靠 hover 才显示。

### 4.2 顶部导航（`.ds-topbar`）

- 粘性顶栏，`background: color-mix(in srgb, var(--ds-bg) 82%, transparent)` + `backdrop-filter: blur(12px)`。
- 左侧品牌（中英并列时中文在前），右侧导航链接。
- 当前页链接 `aria-current="page"` + 2px 强调色下边框。
- 导航项之间 gap 16px；链接 hover 加粗字重。
- 移动端导航项**必须**可横向滚动或折叠为抽屉，**不得**溢出。

### 4.3 语言切换

- 位置：顶栏最右，用 `.ds-chip` 风格，标注「中 / EN」。
- 实现：`html[lang]` 切换 + `localStorage` 持久化；**不做**整页重排动画。
- 每页提供 `<link rel="alternate" hreflang="zh-CN" href="…">` / `hreflang="en"`。
- 切换后**保留滚动位置**（同一 DOM，仅替换文本节点）。

---

## 5. 作品大厅（14-publish）

### 5.1 结构

```
顶栏
└ 标题区（H1 + 导语 + 统计：14 件 / 5 个时代 / N 个可玩）
└ 筛选条（.ds-filters）
└ 作品列表（.ds-hall，行式）
└ 页脚
```

### 5.2 筛选条

- 筛选项用 `.ds-chip`，`aria-pressed="true"` 表示选中（选中态：底 `--ds-ink`、字 `--ds-bg`）。
- 筛选项**必须**是 `<button>`，点击后更新 `aria-live="polite"` 区域的结果计数。
- 筛选状态写入 URL 查询参数（`?era=arcade&lang=zh`），可分享、可回退。
- **移动端筛选条必须可横向滚动**，不换行占满屏。

### 5.3 作品行（`.ds-hall__row`）

桌面三列：`88px 序号 | 1.15fr 标题+简介 | 1fr 封面缩略图`。
- 序号用 `--ds-font-mono`，`--ds-ink-faint`。
- 标题 32px（`--ds-type-h2`），简介 16px `--ds-ink-soft`。
- 状态徽标（ready / 修复中 / 待接入）用 `.ds-tag`，**必须如实反映 `works.json` 的 `status`**，不得一律标 ready（15-supervisor 已在强调这一点）。
- 封面缩略图 16:10，圆角 `--ds-radius-media`，`loading="lazy"`。
- 整行可点击（`<a>` 包裹），但**焦点环只落在链接上**，不得叠加到整行造成重影。

### 5.4 卡片网格（`.ds-grid`）

- `repeat(auto-fill, minmax(min(280px,100%), 1fr))`，gap 24px。
- 卡片悬停：媒体 `scale(1.015)`（`--ds-dur-slow`）+ 灰度遮罩 `--ds-work-dim` 淡入 320ms。
- **禁止**使用 `z-index` 遮挡来"修复"重叠；布局冲突必须在结构层解决（13-qa-curation 的 D1 检测教训）。

---

## 6. 作品详情

### 6.1 结构

```
顶栏
└ 详情头（.ds-detail__header）
│   ├ 面包屑 / 返回
│   ├ H1 作品名（中文主 + 英文副）
│   ├ 元信息行（.ds-detail__meta，mono：年份 · 类型 · 平台 · 状态）
│   └ 动作组（开始游玩 / 查看来源 / 收藏）
└ 封面图（.ds-detail__hero，21:9）
└ 正文（.ds-detail__body，最大 68ch）
│   ├ 简介
│   ├ 分节（玩法 / 操作 / 史实 / 技术）
│   ├ 图注配图（.ds-detail__figure + .ds-detail__caption）
│   └ 来源与许可（可折叠）
└ 上一件 / 下一件
└ 页脚
```

### 6.2 硬性要求

| 项 | 要求 |
| --- | --- |
| 标题 | `overflow-wrap: anywhere`；中文 + 英文双行，英文为次级 |
| 元信息 | 全部 `--ds-font-mono`，**不得**用 body 字体显示年份/坐标 |
| 正文行宽 | ≤ 68ch；中文按 1.85 行高 |
| 图注 | 12.5px `--ds-ink-soft`，编号用 mono 加粗，格式「图 03 · 1983 年的街机厅实拍（来源见来源页）」 |
| 来源与许可 | **必须**在详情页内可见（折叠但可展开），不得只放页脚 |
| 游玩入口 | 「开始游玩」为 `.ds-btn--primary`；**若作品未就绪，按钮禁用并说明原因**，不得放假按钮 |

### 6.3 沉浸式作品详情

沉浸作品（02 / 04 / 09 / 10 / 11 / 12）详情页的"开始游玩"进入 **Stage 骨架**：整屏分段 + 导航轨 + 圆点指示器（§8.4）。作品自身的 canvas 由 `ds-canvas-frame` 包裹（§9）。

### 6.4 参考站文章页的**机制**借用（仅机制，观感无依据）

> 参考站实现了一个独立作品详情页（懒加载 chunk），但**在公开站不可达**（REFERENCE-AUDIT §6.5）。
> 以下仅为**机制层**借鉴（均有 C 级源码依据），**观感层一律标注「本批自定，无参考站实测依据」**。

| 参考站机制（C 级） | 本系统是否采纳 | 本系统落法（**本批自定**） |
|---|---|---|
| 打开详情时**底层页面退后**：`scale:.75 / opacity:.5 / blur(8px)` | ✅ 采纳机制 | 退后量改用 §8.5.2 的 `opacity .12 + blur(6px)`，**不做缩放**（缩放会让底部导航轨与固定 HUD 抖动） |
| 详情头图**超椭圆**圆角 | ✅ 采纳概念 | 用标准圆角矩形（§13 差异表）；跨浏览器与低性能设备表现更稳 |
| 头图入场 `rotateX(-25deg)→0` + `y:64→0` | ⚠️ 只借位移 | 用 `translateY` + 透明度，**弃用 `rotateX`**（大字号中文在旋转中失真） |
| 正文逐段 `mask-image` 揭开 | ✅ 采纳机制 | 作为**渐进增强**；`prefers-reduced-motion` 下降级为直接显示 |
| 元信息「阅读时长 · 日期」 | ✅ 采纳 | 格式改为 `年份 · 类型 · 平台 · 状态`（§6.2），且必须用 `--ds-font-mono` |
| 互动按钮 "Clap"（Lottie + 掌声 + 计数） | ❌ **不采纳** | 本项目是作品大厅，不需要掌声互动；避免引入音频资产与自动播放策略问题 |
| 正文 Markdown 渲染 | ✅ 采纳机制 | 由构建期转 HTML 后静态输出，避免客户端解析开销 |

---

## 7. 按钮与控件

### 7.1 按钮层级

| 类 | 外观 | 用法 | 数量约束 |
| --- | --- | --- | --- |
| `.ds-btn--primary` | 实心强调色 | 每个视图**至多 1 个**主 CTA | ≤ 1 / 屏 |
| `.ds-btn--secondary` | 浅底块 | 次要动作 | 1–3 / 屏 |
| `.ds-btn--ghost` | 透明 + 1px 描边 | 三级动作 | 任意 |
| `.ds-btn--quiet` | 纯文字 | 取消、返回、元信息 | 任意 |
| `.ds-iconbtn` | 44px 圆 | 纯图标 | 任意 |

尺寸：`.ds-btn` 最小高 40px，`.ds-btn--sm` 32px，`.ds-btn--lg` 48px。图标按钮 44×44（WCAG 2.2 AA 触摸目标）。
所有按钮 `border-radius: var(--ds-radius-control)`（胶囊），与参考站的胶囊/圆形控件语言一致。

### 7.2 状态

| 状态 | 表现 |
| --- | --- |
| hover | 背景加深一档；`transform: scale(.985)`（active） |
| focus-visible | `box-shadow: var(--ds-focus-ring)`（2px 背景环 + 2px 强调色环） |
| active | `scale(.985)` / `scale(.94)`（图标钮） |
| disabled | `opacity .45` + `cursor: not-allowed` + **必须**有 `aria-disabled` 或原生 `disabled` + 旁注原因 |
| loading | 保留宽度，文字替换为 `aria-busy="true"` 的进度指示，**禁止**布局跳动 |

### 7.3 社交圆钮

50×50 圆、间距 24px、1px 内描边、`--ds-ring`。每个必须带 `aria-label`（图标本身 `aria-hidden`）。
**移动端**必须允许换行或缩小间距，**不得**溢出（参考站在 390px 下最右一枚被裁切，见 REFERENCE-AUDIT §3.3）。

### 7.4 表单

- 控件最小高 44px，radius `--ds-radius-md`，`--ds-bg-raised` 底。
- focus：边框转 `--ds-accent` + 3px `--ds-accent-soft` 外环。
- 标签常驻可见（**不做**浮动标签），`--ds-type-sm` `--ds-ink-soft`。
- 错误：文字 + `aria-describedby` + 边框转 `--ds-danger`；**不得**只用颜色表达错误。
- 搜索框（06 博物馆）：输入后必须**真正过滤**结果并更新计数（13-qa-curation 已实测 06 存在"输入但不过滤"的真实缺陷）。

---

## 8. 动效

### 8.1 曲线与时长

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--ds-ease-out` | `cubic-bezier(.22,1,.36,1)` | **默认**出场/位移 |
| `--ds-ease-inout` | `cubic-bezier(.65,0,.35,1)` | 双向状态变化 |
| `--ds-ease-veil` | `cubic-bezier(.4,0,.2,1)` | 淡入淡出、遮罩 |
| `--ds-ease-spring` | `cubic-bezier(.34,1.42,.64,1)` | 小控件轻微回弹 |
| `--ds-ease-snap` | `cubic-bezier(.16,1,.3,1)` | 滚动吸附 |
| `--ds-dur-fast` | 200ms | hover / 焦点 |
| `--ds-dur-base` | 320ms | 常规过渡 |
| `--ds-dur-slow` | 520ms | 媒体卡、指示器 |
| `--ds-dur-reveal` | 800ms | 首屏入场 |

> 参考站的标志性曲线是 `cubic-bezier(0.1, 0.1, 0, 1)`（C 级源码）。本系统**改用自有曲线族**：它的前两个控制点几乎为零，起步极快、收尾拖长，做大位移时会显得"弹"。本系统的 `ease-out` 更稳，更适合长距离位移与大字号中文。

### 8.2 入场

- 位移 `translateY(24px)` + `opacity 0→1` + `filter: blur(6px)→0`，640ms。
- 交错：每项延迟 60ms，**最多 6 级**（第 7 项起不再延迟）——长列表不得让用户等。
- 触发：`IntersectionObserver`（`threshold: 0.15`）加 `.is-visible`。
- **禁止**旋转入场。参考站用 `rotateX(-45deg)`（C 级源码），大字号中文在旋转中会明显失真，本系统不取。

### 8.3 悬停

- 媒体卡：`scale(1.015)` + 灰度遮罩淡入，520ms / 320ms。
- 按钮：背景与描边变化 200ms。
- 链接：颜色变化 + 下划线 `text-underline-offset: 3px`。
- **禁止**用 `z-index` 提升层级来"解决"重叠（见 §5.4）。

### 8.4 圆点 ↔ 箭头指示器（`.ds-indicator`）

**取自参考站的机制**：底部居中的圆点组在"可展开"时与一个 chevron 交叉淡入淡出。

```css
.ds-indicator[data-state="chevron"] .ds-indicator__dots { opacity:0; filter: blur(8px); scale:.5 }
.ds-indicator[data-state="chevron"] .ds-indicator__chevron { opacity:.62; filter: blur(0); scale:1 }
```
- 圆点 6px、gap 8px、`border-radius: 999px`；非激活 `opacity .22`，激活 `1`。
- 位置 `bottom: clamp(36px, 8vh, 64px)`，与参考站实测 57.6px 一致（该位置关系是功能性的：避开底部安全区）。
- 交叉淡出 520ms `ease-out`。
- **可访问性**：指示器 `aria-hidden="true"`，同时提供视觉隐藏的「第 2 / 5 件」状态文本。

### 8.5 展开详情（灯箱）

#### 8.5.1 参考站实测（A 级 + B 级，2026-10-21 20:47）

> 证据：`evidence/ref/desktop-lightbox-open.png`、`desktop-lightbox-dismissed.png`、`report-lightbox.json`。
> 详见 REFERENCE-AUDIT §3.5.1。

**A 级（截图中直接可见）**

| 观察项 | 实测观感 |
| --- | --- |
| 退出提示 | 顶部居中一行 **"SCROLL OR CLICK TO EXIT"**，等宽体、大写字距、浅灰；垂直位置约在视口高度 **19.8%** |
| 媒体本体 | 卡片位置 **FLIP 展开**，桌面档中向右溢出并被视口右边界裁切 |
| 指示器 | 视口底部**双圆点**（首点实心、次点空心）；页面中部偏右另有**细线箭头** |
| 背景 | **纯白、无压暗遮罩**——与分区白底同色，靠"内容位移 + 圆角变化"而非明暗差区分层级 |

**B 级（计算样式实测）**

| 元素 | 打开态 | 关闭态 |
| --- | --- | --- |
| `.design.page` | class 含 `lightbox-open` | class 不含 |
| `#lightbox-close` | `opacity:1`、`blur(0px)`、`scale:1`、`pointer-events:all`、`cursor:pointer`、`top:178.416px`（1440×900） | `opacity:0`、`blur(6px)`、`scale:0.75`、`pointer-events:none`、`top:217px` |
| 提示本体 | 196×10 `<img>`，`opacity:.75`，**`alt="Scroll or click to exit"`** | 同 |
| `.dots` | `opacity:.75` | `opacity:.6` |
| `.chevron` | 56×56 `<img>`，`alt="scroll down icon"` | `opacity:0`、`invert(0) blur(6px)`、`scale:.5` |
| 媒体 `cursor` | `auto` | **`zoom-in`** |
| 媒体 `border-radius` | `19.32px`（FLIP 中间态） | `24px` |
| 媒体 `clip-path` | **`path("M 265.224 0 C 279.713 0 …")`** —— 贝塞尔**超椭圆**，非圆角矩形 | 同 |

**C 级（源码行为）**：`.lightbox-layer` 为 `position:fixed; z-index:999999; pointer-events:none; will-change:top,left,width,height,opacity`；
悬停时**克隆**媒体节点作预览并 **rAF 逐帧跟随**；圆角 = `clamp(.02×innerWidth, 16, 24) / 页面--r` 并挂 `squircleObserver(cornerSmoothing:.8)`；
展开走 `border-radius 0.5s cubic-bezier(.1,.1,0,1)` → **FLIP**；
`#lightbox-close` 用 **`top` 过渡 0.5s**（布局动画），其余属性 0.75s。

#### 8.5.2 本系统的展开态规范

**机制借用（A/B 级可支撑）**：单层覆盖 + FLIP 几何过渡 + 媒体圆角渐变 + 指示器圆点↔箭头交叉淡出 + 单一退出提示位。
**以下全部为本批自定，无参考站实测依据**（参考站该页**无遮罩、无焦点管理、无文本标签**）：

| 元素 | 本系统取值 | 依据 / 理由 |
| --- | --- | --- |
| 背景内容 | `opacity .12` + `blur(6px)`（**非** 16px） | **本批自定**：16px 模糊在中低端机上开销大，且会让周围文字产生难读残影 |
| 背景遮罩 | `--ds-overlay` + `backdrop-filter: blur(16px)` | **本批自定**：参考站实测为**纯白无遮罩**，层级仅靠位移区分；本系统另加遮罩以把焦点锁在面板 |
| 面板入场 | `translateY(12px) scale(.985)` → 归位，520ms | **本批自定**：参考站走 FLIP 几何过渡，未见此路径 |
| 退出提示 | **图标圆钮**（44px，`--ds-ring`）+ `aria-label="关闭"` | **本批自定（修正参考站缺陷）**：参考站是 196×10px 纯图形 `<img>`，**无可见文本、无可聚焦标签**，对读屏用户不友好 |
| 焦点管理 | 打开时焦点移到面板首个可聚焦元素；`Esc` 关闭；关闭后焦点**归还触发元素** | **本批自定**：参考站未见焦点管理实现（C 级），本系统必须补上 |
| 提示文案 | "滚动或点击退出"（本系统中文文案） | **本批自定**：参考站为英文 SVG 文案，本系统面向中文用户且需双语切换 |

**必须实现**：`role="dialog"` + `aria-modal="true"` + 焦点陷阱 + `Esc` 关闭 + 滚动锁定（`overflow: hidden` 于 body）。

#### 8.5.3 移动端展开态：**参考站移动端视觉证据未取得**

> 移动端 390×844 下未能稳定复现灯箱展开：分区为绝对定位、滚动容器与桌面不同，
> 合成点击易误中英雄区的「Lustral Studio」外链按钮（该按钮会跳转到 `lustral.studio`）。
> 详见 REFERENCE-AUDIT §6.6。
> **因此本节所有移动端取值均为本批自定，无参考站实测依据。** 参考站的灯箱 CSS 位于共享样式表（`indexStyle`）而非移动端专用表，
> 机制层面推定两端一致，但**观感层面无一手依据**。

移动端硬性要求（本批自定）：展开媒体**必须** `object-fit: contain` 且**不得溢出视口**（参考站桌面档实测出现向右溢出裁切，不予采纳）；
提示置于顶部安全区（`env(safe-area-inset-top)`）之下，与媒体不重叠；关闭控件触摸目标 ≥ 44×44px。

### 8.6 页面转场

- 站内导航**不**做整页覆盖动画。
- 新页面入场：`.ds-in` 交错入场（§8.2）。
- 返回列表：保持滚动位置（`sessionStorage` 记录 `scrollY`，`pageshow` 时恢复）。

---

## 9. 游戏画布与建筑模型的可读性

> 这是本系统**优先于风格**的硬性条款。参考站是作品集，没有游戏画布；以下规则**全部为本系统原创**。

### 9.1 画布容器

```css
.ds-canvas-frame {
  position: relative; overflow: hidden;
  border-radius: var(--ds-radius-media);
  background: var(--ds-bg-sunken);
  border: 1px solid var(--ds-line);
  contain: paint;      /* 画布独立合成层 */
  isolation: isolate;  /* 独立层叠上下文 */
}
```

**规则**
- 画布**不得**被站点的 `filter` / `transform` / `backdrop-filter` 影响。
- 画布**不得**放在 `position: fixed` 祖先下（避免 HUD 错位）。
- 画布不得被站点级入场动效（blur/opacity）包裹到 1s 以上——游戏启动时游戏区必须**立即可用**。
- 画布在移动端 `touch-action: none`（避免页面滚动抢占手势），但**按钮/链接区**必须恢复 `touch-action: auto`。

### 9.2 HUD

- HUD 底：`--ds-canvas-hud-bg`（`rgba(16,15,14,.72)`）+ `backdrop-filter: blur(8px)` + 1px `--ds-canvas-hud-line`。
- HUD 文字：`--ds-canvas-hud-ink`，`--ds-font-mono`，**≥ 12.5px**。
- HUD 与背景画面的对比度须 **≥ 4.5:1**；不达标时改用实色底（不透明 `--ds-bg-sunken` + 高对比文字）。
- 键位提示用 `.ds-key`（22px 方框）。
- HUD 不得遮挡关键游戏区域；默认置于底部（`--ds-space-3` 内缩），顶部 HUD 仅用于计时/分数。

### 9.3 画布上的正文

正文/说明**必须**置于 `--ds-canvas-scrim` 之上，或移出画布区。**禁止**在画面上直接叠浅色正文。

### 9.4 建筑模型（18 结构模型）

- 线稿统一 `--ds-jade` 描边 1.25px，强调构件用 `--ds-accent`。
- 尺寸标注用 `.ds-diagram__dim`（mono 11px，`--ds-ink-faint`）。
- 构件填充 `--ds-jade-soft`。
- 图解容器 `.ds-diagram`：`--ds-bg-raised` 底 + 1px `--ds-line` 描边 + 14px 圆角 + 24px 内距。
- **可读性底线**：模型线稿与底色的对比度 ≥ 3:1；线宽在 1× DPR 屏幕上渲染后 **≥ 1px 实线**（小于则发虚）。

### 9.5 沉浸模式的对比度例外

沉浸式作品（09 霓虹街廊、10 色块远征等）允许高饱和画面，但 **HUD 与操作提示仍须满足 §9.2**。若画面本身亮度极高，HUD 改用实色底（`--ds-bg-sunken` 92% 不透明）而非半透明。

---

## 10. 资源与 Pages 子路径适配

### 10.1 路径规则

线上根路径：`https://kingkazmax.github.io/playtime-atlas-20261021/`

| 场景 | 写法 |
| --- | --- |
| HTML 内资源 | **相对路径**：`./assets/x.png`、`../fonts/y.woff2`（禁止 `/assets/...` 绝对根路径） |
| CSS 内资源 | 相对 `url()`，且**不**以 `/` 开头 |
| JS 内资源 | 统一走 `import.meta.env.BASE_URL`（Vite）或 `document.baseURI`（原生） |
| 字体 | `url("./space-grotesk-latin.woff2")`（相对 `fonts.css` 所在目录） |

**验证要求**：在 `/playtime-atlas-20261021/works/<id>/` 这类**二级子路径**下，字体、样式、脚本、模型、纹理必须全部 200。已知历史缺陷：06 的 `art/assets/fonts/fonts.css` 曾 404（15-supervisor §4b），迁移时必须复查。

### 10.2 令牌注入

每个项目在入口注入基准路径：

```html
<style>:root { --ds-base: "/playtime-atlas-20261021/"; }</style>
```

或在构建期由 `base` 配置注入。`--ds-base` 默认 `""`（本地/子目录预览可用）。

### 10.3 资源策略

- 首屏封面：`loading="eager" fetchpriority="high"`，其余 `loading="lazy" decoding="async"`。
- 图片格式：WebP 优先，PNG 兜底（`<picture>`）。
- 字体：只 preload 首屏用到的 2 个拉丁字体；汉字走系统栈。
- **运行期零外部请求**（无 Google Fonts / no CDN / 无分析脚本）。

---

## 11. 无障碍

### 11.1 硬性指标

| 项 | 要求 |
| --- | --- |
| 正文对比度 | ≥ 4.5:1 |
| 大字对比度 | ≥ 3:1（≥24px 或 ≥19px 且 ≥500 字重） |
| 图形/控件边界对比度 | ≥ 3:1 |
| 触摸目标 | **≥ 24×24 px**（WCAG 2.2 AA · 2.5.8，硬性）；主按钮与图标按钮 **≥ 44×44 px**（AAA · 2.5.5） |
| 焦点环 | 2px 强调色 + 2px 背景偏移，任何状态下**不得**被移除 |
| 键盘 | 全部功能键盘可达；焦点顺序符合视觉顺序 |
| 跳转链接 | 每页首个可聚焦元素是 `.ds-skip` |

### 11.2 语义要求

- 每页一个 `<h1>`；标题层级不跳级。
- 导航用 `<nav>` + `aria-label`；当前项 `aria-current`。
- 筛选用 `aria-pressed`；结果计数用 `aria-live="polite"`。
- 弹层 `role="dialog"` + `aria-modal="true"` + 焦点陷阱 + `Esc`。
- 纯装饰元素 `aria-hidden="true"`。
- 图片有 `alt`；纯装饰图 `alt=""`。
- 状态**不得**只用颜色表达（ready/修复中 必须带文字）。

### 11.3 键盘专项（与 13-qa-curation 已发现缺陷直接相关）

| 缺陷（实测于既有作品） | 本系统条款 |
| --- | --- |
| 04 Tab 键被 `preventDefault` 吞掉，焦点恒为 BODY | **任何游戏输入处理不得拦截 `Tab`**。焦点遍历必须始终可用 |
| 08 未聚焦时仍劫持键盘 | 键盘仅在**容器持有焦点**时驱动游戏玩法；`focus.js` 守卫必须套用到**所有**生效路径（`rally.js` / `gravity.js` 等 window 级监听同样受约束） |
| 10 badge 与标题重叠 66% | 布局冲突在**结构层**解决，禁止用 `z-index` 掩盖；本系统 D1 检测口径由 13 统一复核 |
| 02 模型路径不在 `public/` 导致 404 | 模型/纹理**必须**在 `public/` 或被打进 `dist/`；发布脚本与项目自身 `vite build` 的产物必须一致 |

### 11.4 触摸目标的两档阈值与紧凑变体豁免

| 档 | 阈值 | 依据 | 适用范围 | 硬性 |
| --- | --- | --- | --- | --- |
| **AA** | ≥ **24px** | WCAG 2.2 SC **2.5.8** Target Size (Minimum) | **全部**可交互元素 | ✅ 一票否决 |
| **AAA** | ≥ **44px** | WCAG 2.2 SC **2.5.5** Target Size (Enhanced) | 主控件：`.ds-btn`、`.ds-iconbtn`、导航轴项、社交圆钮 | ✅ 目标值 |

**唯一豁免类**：`.ds-btn--sm`（`height: 32px`）—— 豁免 44px 判定，**仍须 ≥24px**。
**允许场景**：表格/列表行内操作、卡片角标、元信息栏、工具栏。
**禁止场景**：主 CTA、弹层内唯一操作、移动端首屏主操作。
**禁止做法**：❌ 为满足 44px 把紧凑按钮放大而撑破原布局——空间不足时**保留 32px 紧凑变体**。

> 本系统的 `tools/verify-preview.mjs` 已按此口径实现：`isPrimary = (含 ds-btn 或 ds-iconbtn) && !含 ds-btn--sm`。
> 详细迁移口径见 `MIGRATION-NOTES.md` §5.1。

---

## 12. reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  :root { --ds-dur-*: 1ms; --ds-entry-duration: 1ms; }
  *, *::before, *::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
  .ds-in { opacity: 1; transform: none; filter: none; }
}
```

**必须关闭的**：入场位移与模糊、导航轨景深模糊、灯箱面板位移、圆点↔chevron 形变、滚动吸附的平滑行为、任何自动轮播。
**必须保留的**：不产生位移的淡入淡出（≤ 1ms 等效即时切换）、焦点环、hover 的背景色变化。
**禁止**用 JS 强制 `scroll-behavior: smooth`（会覆盖用户的系统偏好）；需要时用 `behavior: 'auto'`。

---

## 13. 与参考站的差异表（诚实说明）

| 维度 | 参考站实测 | 本系统 | 原因 |
| --- | --- | --- | --- |
| 强调色 | 紫 `#6549F2` | 朱砂 `#B4432B` | **不复制配色**（MASTER-UPDATE 要求重新设计配色） |
| 主色出现方式 | 仅选中态 + `::selection` | 同 | 机制一致，取值不同 |
| 正文字体 | `text`（自研/商用可变体） | Inter + 系统黑体栈 | 需可自托管且含中文字重 |
| 展示字体 | Inter Display | Space Grotesk | 需有辨识度且 OFL 可自托管 |
| 全局字距 | `-0.04em`（对汉字有害） | 拉丁 `-0.03em`／汉字 `0` | 中文排版硬性要求 |
| 标题换行 | `white-space: nowrap`（390px 溢出） | `overflow-wrap: anywhere` | 参考站缺陷，不得复现 |
| 导航轨衰减 | `filter: blur()` 最深 3px+ + 半透明 | 墨色三级（18.18/7.48/≥4.80:1）+ 字号 + 字重 + 缩放 0.97 | 参考站的半透明衰减**无法**保持 4.5:1，可访问性优先 |
| 分区圆角 | `clamp(16px,2vw,24px) ÷ --r`，逐作品可异 | `clamp(16px,2vw,28px) ÷ scale`，全站统一 | 可维护性 |
| 色调判定 | RGB 字节求和 `<384` | WCAG 相对亮度 `L ≥ 0.18` | 字节和对饱和色会误判 |
| 3D 倾斜 | `rotateX(-5h deg)` + `perspective: 512px` | **不使用** | 影响文字阅读、破坏 fixed 定位 |
| 入场 | `rotateX(-45deg)` + blur(4px) | `translateY(24px)` + blur(6px) | 大字号中文在旋转中失真 |
| 主曲线 | `cubic-bezier(.1,.1,0,1)` | `cubic-bezier(.22,1,.36,1)` | 自有曲线族 |
| 指示器位置 | `clamp(36px,8vh,64px)` | **相同** | 位置关系是功能性的（避开安全区） |
| 分区标题字号 | 20px / 500 | 20px / 500 | 角色完全相同；全系统唯一完全一致的排版数值 |
| 灯箱关闭控件 | 196×10px 纯图形横条 | 44px 图标圆钮 + `aria-label` | 参考站该控件无文本标签，是无障碍缺陷 |
| 焦点管理 | 未见实现 | 对话框焦点陷阱 + 归还 | 必备 |
| 语言 | 仅英文 | 中英双语 | 本项目需求 |
| 分段吸附 | `y mandatory` + `scroll-snap-stop: always` | 相同 | 机制复用 |
| 离屏优化 | `content-visibility: hidden` | 相同 | 性能机制复用 |
| 媒体悬停 | `scale` + `#8080804B` 遮罩 | `scale(1.015)` + 暖灰遮罩 | 机制复用，色值不同 |
| 社交圆钮 | 50px 圆 + 1px 内描边 + 24px 间距 | 相同尺寸，描边用 `--ds-line-strong` | 尺寸语言复用 |
| **移动端分区切换** | `rotateX` 三维 `matrix3d` 轮播（分区全叠放，靠旋转位移切换） | **竖向分段 + 导航轨，桌面移动同构** | 20:58 布局诊断实测；三维倾斜伤中文可读性、破坏 fixed 定位 |
| **灯箱遮罩** | **纯白无遮罩**，靠内容位移与圆角变化区分层级 | `--ds-overlay` + `backdrop-filter: blur(16px)` | 20:47 实测；本系统需把焦点锁在面板 |
| **媒体圆角** | 贝塞尔**超椭圆**（`clip-path: path(...)`），`cornerSmoothing:.8` | 圆角矩形（`border-radius`） | 20:47 实测 `clip-path: path(...)`；超椭圆在跨浏览器与低性能设备上表现不稳定 |
| 灯箱圆角取值 | `clamp(16px,2vw,24px) ÷ --r` | `clamp(16px,2vw,28px) ÷ scale` | 机制复用，数值微调 |
| 灯箱展开动效 | FLIP（`border-radius` 0.5s 几何过渡） | 遮罩淡入 + 面板 `translateY(12px) scale(.985)` | 本批自定；FLIP 对中文正文容器收益低 |

---

## 14. 各项目落地清单

> 迁移由 **15-supervisor** 派发给各目录原作者执行；**16-design-system 不代改其他目录**。详见 `MIGRATION-NOTES.md`。

### 14.1 14-publish（作品大厅）— 最高优先级
1. 引入 `src/tokens.css` + `src/components.css`（拷贝到 `release/docs/assets/ds/`）。
2. 大厅改用 `.ds-hall` 行式列表 + `.ds-chip` 筛选 + `aria-live` 计数。
3. 状态徽标**如实**取自 `data/works.json` 的 `status`。
4. 详情页套 `.ds-detail__*`，来源与许可必须内嵌可见。
5. 注入 `--ds-base: "/playtime-atlas-20261021/"`，复核二级子路径下字体/模型 200。
6. 加 `.ds-skip` 跳转链接、`aria-current`、焦点可见。

### 14.2 06-museum-core（回响电玩馆）
1. 沿用现有 `art/assets/fonts/`（OFL 字体已就位），改引本系统 `fonts.css`。
2. 搜索框必须**真正过滤**并更新计数（既有真实缺陷）。
3. 移动端 `nav-toggle-text` 不得逐字换行（既有 511px 溢出缺陷）。
4. `fonts.css` 在二级子路径下必须 200（既有线上 404 缺陷）。
5. 展厅分区用 `.ds-section` + `data-ds-tone`。

### 14.3 01—12 各作品
- **统一外壳**：页头 `.ds-topbar`、页脚 `.ds-footer`、跳转链接。
- **沉浸作品（02/04/09/10/11/12）**：画布用 `.ds-canvas-frame`，HUD 用 `.ds-canvas-hud-*`，导航轨用 `.ds-rail`，指示器用 `.ds-indicator`。
- **保留既有功能**，风格迁移**不得**破坏可玩性；键盘与焦点条款见 §11.3。
- **01/03/05/07/08/13**（非游戏）：套 `.ds-cover` + `.ds-work` 卡片 + `.ds-detail` 长页。

### 14.4 17—19 建筑新项目
- 19 双语建筑科普主站：`.ds-cover` + `.ds-detail` 长页 + `.ds-diagram` 图解 + `.ds-jade` 线稿。
- 18 结构模型：`.ds-canvas-frame` 包裹 3D 视口，HUD 用统一画布色。
- 17 建筑研究：来源与许可页沿用 `.ds-detail__body` 版式。
- **双语文案**：中文在前、英文在后，`:lang()` 驱动字距与行高（§2.3）。

---

## 15. 验收清单

| # | 项 | 方法 |
| --- | --- | --- |
| 1 | 令牌 JSON 合法、字段自洽 | `node tools/validate-tokens.mjs` |
| 2 | CSS 变量与 JSON 令牌**一一对应**（无孤立、无缺失） | 同上（`token-usage.json`） |
| 3 | `preview.html` 无网络可渲染全部组件 | `tools/verify-preview.mjs` 截图 |
| 4 | 桌面 1440/1280 + 移动 390 无横向溢出 | 同上 |
| 5 | reduced-motion 下无位移动画 | 同上（注入媒体特性） |
| 6 | 关键元素对比度 ≥ 4.5:1 | `evidence/preview-verification.json`（`a11y` 段） |
| 7 | 字体全部本地、零外部请求 | 网络面板检查（脚本断言） |

---

## 16. 已知限制

1. ~~参考站的灯箱展开态没有视觉证据~~ → **已于 2026-10-21 20:47 补齐**（A 级截图 + B 级计算样式，REFERENCE-AUDIT §3.5.1）。§8.5.2 的差异部分改标为「本批自定」。
2. **参考站的独立作品详情页（article）在公开站不可达**（REFERENCE-AUDIT §6.5）：机制有 C 级源码依据，**观感无一手依据**。本规范中该页的全部视觉取值标注「本批自定，无参考站实测依据」。
3. **参考站移动端灯箱展开态未取得视觉证据**（REFERENCE-AUDIT §6.6）：移动端为三维 `matrix3d` 轮播，合成事件难以可靠复现切换手势。§8.5.3 的移动端取值全部为「本批自定」。
4. **参考站无中文**，全部中文排版规则为本系统原创，无外部先例可依。§2.5 的**字体栈顺序规则**同样不来自参考站——它来自 `05-museum-research` 对中文基线错位的实测（参考站是纯英文站，不会暴露该问题），属于**本系统内部的工程正确性约束**，已按硬性条款落地。
5. **参考站是单作者作品集**，其结构不能直接映射为多作品大厅；大厅的列表/筛选/状态模型由本系统原创。
6. **Noto Sans SC 子集覆盖有限**（沿用 07-museum-art 的子集），全站汉字若超出覆盖需重新子集化；在此之前依赖系统字体栈兜底。**注意**：按 §2.5 调序后，该子集在系统 CJK 栈可用时**不参与渲染**，仅作离线兜底；因此「覆盖率」不再是视觉风险项，但若要恢复子集参与渲染，必须先解决覆盖完整度。
7. 本规范**不**规定各作品内部玩法逻辑、模型形态与美术风格，只规定**外壳与 UI 层**。
8. **取证入口已于 2026-10-22 变更**：本规范的观察依据采集于 2026-10-21（无头 Chrome + 原生 CDP）。按用户长期约定，今后所有**网站访问 / 网页观测 / 截图 / 线上验收**一律走 **Ego 浏览器**（`/Users/mekzenx2/.local/bin/ego-browser`，先跑 `ego-browser skill`），**不得**另起浏览器路径。**已固化的 A/B/C 级证据与由此得出的全部结论不受影响**（详见 `REFERENCE-AUDIT.md` §4 与 `tools/README.md`）。
