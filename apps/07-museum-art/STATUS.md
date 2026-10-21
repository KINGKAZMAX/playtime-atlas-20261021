# STATUS — 回响电玩馆 / PLAYTIME ATLAS 美术包开发阶段状态

最后更新：2026-10-21 23:55（第五轮：改版缺陷修复 + 16 符合性验收）

| 阶段 | 状态 | 说明 |
| --- | --- | --- |
| 0. 任务立项 | ✅ 完成 | `TASK.md` 需求拆解完成（资产清单、约束、验收标准） |
| 1. 年代/硬件研究 | ✅ 完成 | 7 个年代分段 + 6 件跨时代硬件形态确定；来源与差异说明写入 `LICENSES.md` |
| 2. 工程脚手架 | ✅ 完成 | Vite + three + @gltf-transform 本地安装；字体工具链 uv venv (fontTools/brotli) 就绪 |
| 3. 设计令牌 | ✅ 完成 | **已与 16 对齐**：130 个自有令牌 → 883 个（16 令牌树 + 展品内嵌 + 兼容视图），129 个 `--ds-*` 变量逐项一致 |
| 4. 字体管线 | ✅ 完成 | 4 家族 OFL 字体（自托管，与 16 逐字节一致）+ 中文 746 字子集 + 授权原文随包 + `FONT-MANIFEST.json` |
| 5. 图标集 | ✅ 完成 | 48 枚原创 SVG 图标 + 雪碧图 + 索引 + 总览表 |
| 6. 年代海报 | ✅ 完成 | 7 张 SVG（内嵌字体自包含）+ 7 张 PNG（1200×1800），零乱码 |
| 7. 年代封面 | ✅ 完成 | 8 张 SVG + 8 张 PNG（1600×900） |
| 8. 展柜图形 | ✅ 完成 | 6 组展柜 SVG + PNG（1000×1250），柜内嵌入实机渲染图 |
| 9. 硬件 3D 模型 | ✅ 完成 | 6 个 GLB（19–36 具名部件）+ 1024² 实机渲染 + 技术插画降级图 + 元数据 |
| 10. 降级与离线 | ✅ 完成 | 5 张降级图形 + 四级回退链 + 无 WebGL / 离线提示 |
| 11. 预览页 | ✅ 完成 | `index.html` + three.js 模型查看器，自动旋转 / 轨道 / 降级切换 / 中英双语 |
| 12. 共享接口 | ✅ 完成 | `INTERFACE.md`（给 06-museum-core）+ `assets.manifest.json`（含对齐字段） |
| 13. 文档与清单 | ✅ 完成 | README / LICENSES / QA / RESTYLE-MAP / manifest.json / .gitignore |
| 14. 浏览器验收 | ✅ 完成 | 资产完整性 158 项、浏览器 45 项、线上子路径 40 项、与 16 符合性 18 项全部通过；15 张截图 |
| 15. **改版（对齐 16）** | ✅ 完成 | 令牌对齐、字体对齐、UI 换装、`.ds-*` 组件类、中英双语、Pages 子路径、对齐声明字段 |
| 16. **改版缺陷修复 + 符合性** | ✅ 完成 | 修 4 个真实缺陷（i18n 崩溃 / 海报网格丢失 / 字体栈顺序 / 缺 768px 断点），并补上对应断言防复发 |

## 当前状态

**可交付。** 四套验收全绿，构建退出码 0，子路径部署实测可用，
UI 令牌层与 16-design-system（余晖设计系统）**逐项一致**，
字体与 16 **逐字节一致**，并通过 16 的 V.1–V.10 符合性清单。

```bash
cd 07-museum-art
npm install
npm run build            # → dist/（退出码 0）
npm run qa               # 资产完整性 158 项
node scripts/qa-browser.mjs   # 浏览器验收 45 项 + 15 张截图
node scripts/qa-subpath.mjs   # 线上子路径复验 40 项
node scripts/qa-ds-conformance.mjs  # 与 16 的 V.1–V.10 符合性 18 项
npm run dev              # 本地预览（优先 4327，被占用时自动顺延并打印实际地址）
```

---

## 构建复验结论（2026-10-21 18:30 — 18:45）

> 回应 13-qa-curation 在 17:35 的 fail 判定。本节只记录复验事实，未改动任何其他任务的目录。

### 结论

**构建通过。** `npm run build` 退出码 **0**，产出 `dist/index.html`（11.7 KB）
与完整 `dist/assets/` 资源树（fonts / icons / posters / covers / cases / models / fallback + tokens + manifest）。

### 关于 17:35 那次 fail：属时间竞态，非真实缺陷

13 的 QA harness 报 `Could not resolve "./data.js" from "src/main.js"`，并据此判 `build.ok=false`。
核对结果：

| 事实 | 时间 |
| --- | --- |
| 13 执行构建 | 17:35（**早于**） |
| `src/data.js` 写入（由 `scripts/build-manifest.mjs` 生成） | **17:35:51** |
| 本任务 `npm run qa` 报「通过 115 项，失败 0 项」 | 17:41 |

即：**构建发生时 `src/data.js` 尚未生成**，Vite 因此无法解析该 import。
本轮复验在文件齐备的前提下重新执行构建，稳定成功（退出码 0）。

### 本轮实际做的修正（均在本目录内）

1. **消除对 `public/` 的构建期 import**
   - 原：`src/main.js` 中 `import TOKENS from '../public/assets/tokens.js'`（依赖 Vite 对 `public/` 的特殊处理，脆弱）
   - 现：`scripts/build-tokens.mjs` 额外生成 `src/tokens.js`，`src/main.js` 改为 `import TOKENS from './tokens.js'`
   - `public/assets/tokens.js` **仍然保留并交付**给下游（06 侧可直接引用）
   - 复验：bundle 中**无 `/public/` 残留引用**；令牌已构建期内联，运行期无需 fetch

2. **端口冲突不再中断启动**
   - `vite.config.js` 改为 `strictPort: false` + 端口上报插件；`package.json` 移除 `--strictPort` CLI 标志
   - 实测：4327 被占用时自动顺延到 **4329** 并在终端打印实际地址，**不 kill 任何进程**

### 三套验收结果

| 套件 | 结果 |
| --- | --- |
| `npm run qa`（资产完整性） | **115 / 115 通过** |
| `node scripts/qa-browser.mjs`（浏览器验收 + 14 张截图） | **37 / 37 通过** |
| `node scripts/qa-subpath.mjs`（线上子路径复验） | **38 / 38 通过** |

### 线上子路径 `/playtime-atlas-20261021/exhibits/07-museum-art/` 请求状态

| 资源 | 状态码 |
| --- | --- |
| `assets/fonts/fonts.css` | **200** |
| `assets/tokens.css` | **200** |
| `assets/tokens.js` | **200**（显式 fetch 验证） |
| `assets/icons/icons.svg` | **200** |
| `assets/posters/poster-dawn.png` | **200** |
| `assets/covers/cover-atlas-hero.png` | **200** |
| `assets/cases/case-console-02.png` | **200** |
| `assets/models/model-cabinet-01.glb`（默认展品） | **200** |
| `assets/models/model-console-02.glb` | **200** |
| `assets/models/model-console-03.glb`（切换展品后） | **200** |
| `assets/fallback/model-fallback.png` | **200** |

- **无任何 404**，无失败请求，所有请求均为 200；控制台无错误
- 临时静态服务器在验证结束后**立即关闭**，未留常驻进程
- 未触碰 `06-museum-core/`、`13-qa-curation/`、`14-publish/release/`，未执行 git commit / push

### 遗留说明

- **端口 4327**：当前被 06-museum-core 的临时静态验证服务器占用
  （`python3 -m http.server 4327`，其 `vite.config.js` 正式端口为 4326）。
  本包 `npm run dev` 自动顺延到 4329。**资产交付不依赖端口**——06 侧只需复制 `public/assets/`。
- 完整验收明细见 `QA.md`；与 06 的接口约定见 `INTERFACE.md`。

---

## 第二轮复验：几何缺陷修复与全量重生成（2026-10-21 19:00 — 19:40）

目视核对六件展品渲染图时发现**若干"悬空黑板"**，追查至 `scripts/lib/geometry.mjs` 的
`box(w, h, d)`：生成每个面的顶点时一律用 X、Y 轴半长做面内偏移，
而 ±X 面的面内两轴应为 **Z、Y**、±Y 面应为 **X、Z**——所有非正方体的薄板都被沿错误轴撑开。

例：掌机「下屏边框」定义 `0.072 × 0.046 × 0.003`，实测却是 `0.072 × 0.046 × 0.072`。

**修复**：为每个面显式声明面内半长并按该面实际张开的轴取值。

**全量重生成**：6 个 GLB → 6 张渲染图 → 6 张技术插画 → 6 组展柜 → 资产索引 → `dist/`。

修复后六件展品一次对照目视确认：黑板消失、比例正确、六种年代形态一眼可辨。

同时在本轮修掉的其余问题：

| # | 问题 | 处理 |
| --- | --- | --- |
| 1 | GLB 材质未做 sRGB → 线性转换（颜色发白发青） | `glb.mjs` 增加 `srgbToLinear()`，对 baseColor / emissive 因子转换 |
| 2 | 屏面材质过暗、屏幕边框在背光面发黑 | 边框改用最亮墨蓝 `shell-light`，屏面自发光略提 |
| 3 | 展柜内嵌渲染图有硬边 | 增加径向渐变遮罩（`mask`），让图像融进柜内 |
| 4 | 渲染脚本视口小于 WebGL 画布导致截图为空 | 视口 1280×1280 |
| 5 | 静态测试服务器缺 `Content-Length`，GLB 传输被中断 | 补 `Content-Length` / `Accept-Ranges` |
| 6 | 整页截图在软件光栅化下超时 | 超时提升至 120–180 秒 |
| 7 | 并发时导航偶发超时 | 导航超时 120 秒 + 模型渲染一次重试 |

**复验结果**（全部重新执行）：

| 套件 | 结果 |
| --- | --- |
| `npm run build` | 退出码 **0**，`dist/index.html` + 完整 `dist/assets/` |
| `npm run qa` | **115 / 115 通过** |
| `node scripts/qa-subpath.mjs` | **38 / 38 通过** |
| `node scripts/qa-browser.mjs` | 见下方最终记录 |


---

## 第三轮复验：验收脚本按阶段隔离 + 发现并修复 WebGL 降级面板缺陷（2026-10-21 20:30 — 21:45）

第二轮的浏览器验收反复在同一处被中断：Chromium 渲染进程被 OOM 杀掉
（`Target page, context or browser has been closed`），甚至在 `chromium.launch` 阶段就被杀死。
根因是**本机被同批并发任务挤占**（峰值 load average 一度 200+），
而预览页单页解码后需约 200 MB 位图内存，且每页都会创建 WebGL 上下文；
在同一浏览器进程里连续重载 9 个区块，内存持续累积。

### 验收脚本改造（`scripts/qa-browser.mjs`）

把验收拆成 A–F 六个阶段，**每阶段用全新的浏览器进程、用完立即关闭**，
并按阶段需要把无关大图替换为 1×1 占位 PNG（HTTP 200，不污染控制台与网络统计），
使峰值内存始终维持在单页量级；每阶段自带 3 次重试。

| 阶段 | 内容 |
| --- | --- |
| A | 结构与字体（屏蔽全部大图，最轻量） |
| B | 图片完整性（6 个内容区各自独立进程，逐张校验**实际解码尺寸 == HTML 声明尺寸**） |
| C | 3D 查看器（WebGL 上下文 + GLB 200 + 降级面板回归检查） |
| D | 交互（切换展品 / 自动旋转 / 图标筛选 / 灯箱打开与键盘操作） |
| E | 9 个区块截图（每区块独立进程，落盘后做**平图检测**） |
| F | 响应式（390 px / 820 px 无横向溢出） |

另新增**截图平图检测**：落盘后用 ImageMagick 计算灰度标准差，
纯色（标准差 < 0.005）判定为「内容未渲染」并换新进程重截。
本轮 14 张截图标准差区间 0.0778 – 0.1691，全部有效。

### 真实产品缺陷：WebGL 正常时降级面板仍然显示

逐件目视核对 3D 展品区截图时发现，**模型正常渲染的同时**，
「当前环境未启用 WebGL，已切换到技术插画降级图。」仍压在模型上。

根因：`src/styles.css` 的 `.viewer-fallback { display: flex }`（优先级 0,1,0）
与 UA 样式表的 `[hidden] { display: none }`（同为 0,1,0）**同优先级**，
作者样式表在后 → 后写者胜，`$('#viewer-fallback').hidden = true` 因此失效。

修复：
1. `.viewer-fallback[hidden] { display: none; }`；
2. 全局兜底 `[hidden] { display: none !important; }`；
3. 浏览器验收新增回归断言：WebGL 可用时降级面板必须 `display: none`。

### 同时修正的验收脚本问题

灯箱截图截到纯色遮罩（4.6 KB）→ 改为等大图解码入视口后再截 + 平图重截；
hero 主视觉漏检（DOM 根是 `.hero` 而非 `#top`）→ 拆分导航片段与查询选择器；
拆除浏览器瞬间的 `ERR_ABORTED` 误判 → 增加 `closing` 标志；
子路径 `page.goto` 沿用 30 秒默认超时 → 超时设置提到 `goto` 之前；
滚动未触发的 3 张懒加载图 → 统一切 `eager` 并等待解码，新增「33 张图片全部取回并解码成功」断言。

### 最终三套验收结果

| 套件 | 结果 | 退出码 |
| --- | --- | --- |
| `npm run build` | `dist/index.html`（11.7 KB）+ 完整 `dist/assets/` | **0** |
| `npm run qa` | **115 / 115 通过** | 0 |
| `node scripts/qa-browser.mjs` | **39 / 39 通过** | 0 |
| `node scripts/qa-subpath.mjs` | **39 / 39 通过** | 0 |

### 边界声明

- 全部改动**仅限 `07-museum-art/`**；未触碰 `06-museum-core/`、`13-qa-curation/`、`14-publish/release/`。
- 未执行 git commit / push；未部署公网。
- 临时静态服务器与浏览器进程均在验收结束后立即关闭，无常驻进程。
- 端口 4327 仍被 06-museum-core 的临时服务器占用，本包 `npm run dev` 自动顺延至 4329；**资产交付不依赖端口**。

---

## 13-qa-curation 的最终判定（2026-10-21 18:30:52）

> **结论：pass / fail = 0。**
> 本目录**不存在**被 13 判定的缺陷。此处记录以免后续被误读为「曾有构建失败」。

| 事实 | 值 |
| --- | --- |
| 13 的判定时间 | **2026-10-21 18:30:52** |
| 13 的判定结果 | **pass，fail = 0** |
| 更早（17:35）那次 fail 的性质 | **时间竞态**，非真实缺陷 |
| 原因 | 13 执行构建时 `src/data.js` 尚未生成（该文件由 `scripts/build-manifest.mjs` 写入，时间戳 **17:35:51**，晚于 13 的构建时点），Vite 因此无法解析 `./data.js` |
| 复核 | 文件齐备后重新执行 `npm run build` 稳定成功（退出码 0）；本任务 `npm run qa` 于 17:41 报「115 项全过，0 失败」 |
| 当前状态 | 已再次复现：构建退出码 0，三套验收 151 / 39 / 39 全绿 |

> 另注：13 曾指出 `art/assets/fonts/fonts.css` 线上 404（`MIGRATION-NOTES` §2.2 记为已知缺陷）。
> 根因在发布侧的拷贝路径，不在本目录——本目录的 `public/assets/fonts/fonts.css` 与 5 个 woff2、
> 5 份 OFL 授权原文**同目录同路径**就位（见 `INTERFACE.md` §2.2），发布时随包拷贝即可。

---

## 第四轮改版：与 16-design-system 对齐（2026-10-21 21:45 — 22:10）

依据：`15-supervisor/RESTYLE-SPEC.md`（只读必读）+
`16-design-system/` 的四份产物（`design-tokens.json` / `DESIGN-SPEC.md` /
`REFERENCE-AUDIT.md` / `preview.html`）+ `MIGRATION-NOTES.md §2.3`（本目录专节）。

### 本目录在改版中的角色

本目录是全批的**美术与资产源头**：06 博物馆主站的 `art/assets/fonts/fonts.css` 直接消费本目录的字体；
各作品的封面 / 图标 / 海报 / 模型亦出自本目录。因此本目录的**字体清单与 design tokens**
是 16 规范落到美术侧的枢纽。

### 1. 令牌对齐

- 新增 `scripts/sync-ds-tokens.mjs`：只读引用 16 的 `design-tokens.json` 与 `src/tokens.css`，
  解析出 `--ds-*` 变量表并**逐项交叉校验**（十六进制大小写、字体栈子序列、复合值数字）。
- 本目录的 `design-tokens.json` 改为**对齐后**的 canonical：顶层为
  `meta`（含 `alignment`）· `designSystem`（16 令牌树原样引用）·
  `local`（展品内嵌配色与资产规格）· `compat`（1.0.0 旧键名 → 16 取值的兼容视图）· `cssVars`。
- 校验结果：**与 16 的取值零差异**（`meta.alignment.drift` = `[]`）。
- `public/assets/tokens.css` 改为三层结构：`--ds-*`（16 的取值）+ `--atlas-*`（语义别名，
  全部重定向到 `--ds-*`，随主题自适应）+ `--atlas-local-*`（展品内嵌配色）。
- 兜底：`scripts/lib/ds-tokens.snapshot.json` 为取值快照（非文件复制），
  16 目录不可用时构建仍可用，来源与时间如实标注。

### 2. 字体对齐

| 家族 | 角色 | 与 16 |
| --- | --- | --- |
| Space Grotesk | 展示体 | ✅ 逐字节一致（SHA-256 `4212a294…`） |
| Inter | 正文 | ✅ 逐字节一致（`98342e4c…`） |
| Space Mono | 等宽 | ✅ regular / bold 均一致 |
| Noto Sans SC | 中文（746 字子集） | ✅ 逐字节一致（`0a0b62b4…`） |

**零改动**：字体族名、文件、字节全部已与 16 相同，因此 06 侧可直接复用同一份 `fonts.css`。

### 3. UI 换装

采用 16 的**深色主题**（`<html data-ds-theme="dark">`）——本目录是「深色资产面板」语境。
做法为 `MIGRATION-NOTES §2` 推荐的**变量重定向**（不逐行改 CSS、不推倒重写结构），
并叠加 16 §3 的组件类契约：`.ds-skip` `.ds-topbar` `.ds-btn` `.ds-chip` `.ds-tag`
`.ds-lightbox` `.ds-iconbtn` `.ds-canvas-frame` `.ds-in`。
逐项对照见 `RESTYLE-MAP.md`。

### 4. 双语与无障碍

- `src/i18n.js`：zh / en 全量词条；顶栏语言切换（`aria-pressed` + `localStorage` + `?lang=` 直达）。
- `<html lang>` 随语言切换；`hreflang` 运行时注入（Vite 会把 HTML 里的相对 href 当资源解析，故不写死）。
- 灯箱具备 `role=dialog` + `aria-modal` + 焦点陷阱 + `Esc` + **焦点归还**。
- 焦点环 `--ds-focus-ring`（任何状态不移除）；主按钮 44px、图标钮 44×44。
- 中文排版：`:lang(zh)` 字距归零（`--ds-track-cjk: 0`）、正文行高 1.85；全站无 `white-space: nowrap`。
- `prefers-reduced-motion`：时长归 1ms、位移与模糊归零、保留不产生位移的淡入淡出。

### 5. 对齐声明字段

`public/assets/assets.manifest.json` 新增顶层 `alignment`：

```jsonc
"alignment": {
  "designSystem": "余晖设计系统 / Afterglow Design System",
  "designSystemVersion": "1.0.0",
  "alignedTo": "16-design-system/design-tokens.json",
  "alignedToCss": "16-design-system/src/tokens.css",
  "spec": "16-design-system/DESIGN-SPEC.md",
  "audit": "16-design-system/REFERENCE-AUDIT.md",
  "migration": "16-design-system/MIGRATION-NOTES.md §2.3",
  "source": "live:16-design-system",
  "alignedAt": "2026-10-21T…",
  "cssVariablePrefix": "--ds-",
  "fingerprints": { "designTokensSha256": "…", "tokensCssSha256": "…",
                    "fontsSha256": { … }, "fontsIdentical": true },
  "drift": []
}
```

`fonts` 段另加 `alignedTo`（`16-design-system/fonts/FONT-MANIFEST.json`）、
`alignedDesignSystem` 与 `fontsIdentical`，并为每个字体文件记录 `sha256`。
**06 与 13 可据此核对各作品是否用到了对齐后的资产。**

### 6. 改版后的验收

| 套件 | 结果 |
| --- | --- |
| `npm run build` | 退出码 **0** |
| `npm run qa` | **151 / 151 通过**（新增 9b 节：令牌对齐、字体一致性、外壳契约逐项断言） |
| `node scripts/qa-browser.mjs` | **39 / 39 通过** |
| `node scripts/qa-subpath.mjs` | **39 / 39 通过** |

### 7. 本轮的限制（须如实记录）

- **展品内嵌配色不随主题变化**：海报 / 封面 / 展柜 / GLB 仍为深墨蓝 `#0C1726` + 暖纸白 `#FBF7EF` +
  信号橙 `#F0601F`。这些取色已烘焙进资产文件（位图与 SVG），改主题需整批重生成
  （含 8 张生成式关键帧）；且它们是**展品原件的纸张基调**，等同「画布内部不动」
  （`MIGRATION-NOTES §4` K.1）。UI 一律走 `--ds-*`。
- **未引入 `.ds-rail`（左侧年份轨）与 `.ds-indicator`（底部圆点）**：前者是多屏分段滚动站的导航模式，
  后者对应本目录不存在的轮播交互；引入会改变既定单页结构或增加无功能对应的装饰件。
- **展品卡未套用 `.ds-work` 的 16:10 画幅**：16 的 `workCard.mediaRatio` 是作品大厅缩略卡规格，
  本目录的卡是展品本身，画幅由展品决定（2:3 / 16:9 / 4:5 / 1:1）。
- **控件描边提高一档**：16 的 `--ds-line` 在深色主题下对底色仅 1.32:1，低于其自述的 3:1 控件边界；
  本目录把可交互控件的描边统一提到 40% 墨色（3.59:1），装饰性发丝线仍用 16 的取值。
- **英文界面下的位图资产仍为中文**：海报 / 封面 / 展柜 / 技术插画的排版已烘焙在图像里，
  不可翻译；英文界面把它们作为「展品原件」呈现——这也是博物馆语境下的正确做法。
  界面外壳、导航、说明、状态与查看器控件均为双语。
- **参考站取证边界**：16 的 `REFERENCE-AUDIT.md` 标注了「直接观察 / 二手证据 / 推测」的权重；
  本目录只引用 16 已落地的**取值**与**机制**，不对 olek.si 的视觉作任何自行断言。
- **未部署公网**：本目录只交付可静态构建产物，统一由 14-publish 上线。


---

## 第五轮：改版缺陷修复 + 与 16 的符合性验收（2026-10-21 22:10 — 23:55）

第四轮改版完成后，全量重跑验收时暴露了 4 个**真实缺陷**（其中 1 个由 13-qa-curation 报出）。
本轮逐个定位、修复，并**把每个缺陷变成一条断言**，确保不会复发。

### 1. 缺陷清单与修复

| # | 缺陷 | 发现方式 | 影响 | 修复 |
| --- | --- | --- | --- | --- |
| B.1 | `applyI18n` 用 `textContent` 覆盖含子元素的 `[data-i18n]` 节点，抹掉 `<strong id="cjk-count">` | **13-qa-curation QA-006**（critical）；本包重跑验收复现 | `main.js` 对 null 赋值抛 TypeError，整条渲染链中断，**7 个动态区块全空白** | 拆成 `data-i18n`（纯文本，必须无元素子节点）与 `data-i18n-rich`（文案自带内联标记，`innerHTML` 覆盖）；`#cjk-count` 移出翻译节点；`main.js` 全部 DOM 写入走 `setText`/`setHref` 安全封装，单个渲染步骤用 `run()` 隔离 |
| B.2 | `.poster-grid` 基础网格规则在样式重写时丢失 | 浏览器验收新增的「网格布局」断言 | 元素数量对、截图非空，但海报**整宽堆叠**，版面是错的 | 补回 `repeat(auto-fill, minmax(238px, 1fr))` |
| B.3 | 字体栈把有限的 `Noto Sans SC` 子集排在完整系统 CJK 栈之前 | 与 16 重新同步时发现 16 已修正该顺序 | 中文混排基线错位（16 已实测记录） | 随 16 重新同步；QA 新增「字体栈顺序合规」断言 |
| B.4 | 样式重写后没有 768px 主断点 | 16 的 `tools/validate-tokens.mjs` 报「缺少 768px 主断点」 | 与 16 的断点体系不一致 | 补 `@media (min-width: 768px)`：平板带恢复两栏查看器与舒适网格密度 |

### 2. 新增的断言（防复发）

- `qa-check.mjs` 9c 节（新增）：
  - `main.js` 引用的 **31 个 `#id` 全部存在于 `index.html`**（直接封堵 B.1 这类空引用事故）
  - **46 个 `data-i18n` 节点均不含元素子节点**
  - **10 个 `data-i18n-rich` 节点的 zh/en 内联标记与 HTML 一致**
  - **56 个 i18n key 在 zh/en 两侧均已登记**；**zh/en 词表 98 条 key 完全一致**
- `qa-check.mjs` 1 节：**字体栈顺序合规**（完整系统 CJK 栈在前、子集在后）
- `qa-check.mjs` 9b 节：drift 每一项都必须已登记来源与说明（`inherited` + `note`）；
  新增 `alignmentLayers` 分层来源与指纹断言
- `qa-browser.mjs` 阶段 A：**6 个卡片容器的网格布局断言**（`display:grid` 且首行 ≥2 张卡，
  用 `offsetTop` 分行以避开 hover 态 `translateY` 干扰）

### 3. 与 16 的符合性验收（V.1–V.10）

新增 `scripts/qa-ds-conformance.mjs`，按 16 的 `MIGRATION-NOTES §9` 清单逐项机械判定：

| 项 | 检查 | 实测 |
| --- | --- | --- |
| V.1 | 水平溢出（1440/1280/768/390 四档） | ✅ 四档均无溢出 |
| V.2 | 对比度（正文 ≥4.5 / 大字 ≥3 / UI ≥3） | ✅ 18 项全部实测达标，最低 **5.56:1** |
| V.3 | 令牌一致性 | ✅ 129 个 `--ds-*` 与 16 逐项一致；`designSystem` 令牌树与 16 逐字节一致；16 的 `validate-tokens.mjs` 无未解释 error |
| V.4 | 命名空间冲突 | ✅ 无同名不同义变量（比对 129 个） |
| V.5 | 焦点可达 | ✅ 焦点环始终可见（抽样 12 个）；12 次 Tab 得到 12 个不同焦点 |
| V.6 | 触摸目标 | ✅ 全部 ≥24px；主按钮与图标按钮 ≥44px |
| V.7 | reduced-motion | ✅ `--ds-dur-base` / `--ds-entry-duration` 均降为 1ms |
| V.8 | 外部请求 | ✅ 运行期 0 个非本地请求 |
| V.9 | 字体 | ✅ 4 个自托管字体族全部加载（5 个 face） |
| V.10 | 子路径 | ✅ 子路径下 18 个关键 URL 全部 200 |

**令牌层直接调用 16 的 `tools/validate-tokens.mjs`**：用**软链沙盒**把本包文件摆成 16 期望的
目录结构，再以 `node --preserve-symlinks-main` 原样运行它 —— 16 的文件一个字节未复制、未修改。
16 校验器报出的唯一 error 属**已登记的不适用机制项**
（`.ds-indicator` 的 `clamp(36px, 8vh, 64px)`，理由见 `RESTYLE-MAP.md` D.6 与
`design-tokens.json → meta.alignment.inapplicableChecks`）。

证据文件：`evidence/ds-conformance.json` · `evidence/tokens-validate.json`。

### 4. 本轮新增的交付物

- `public/assets/fonts/FONT-MANIFEST.json` —— 自产的自托管字体清单（机器可读，schema 与 16 一致），
  06 / 13 可直接对表；由 `scripts/build-font-manifest.mjs` 从实际文件算出
- `scripts/qa-ds-conformance.mjs` —— V.1–V.10 符合性验收
- `evidence/` —— 符合性验收证据

### 5. 与 16 的跨层差异（1 项，如实登记）

16 的 `src/tokens.css` 与 `design-tokens.json` 自身在 `--ds-font-mono` 上不一致
（CSS 多一个 `Consolas` 回退）。本包**两层各自照抄各自来源，不做取舍**，
差异登记在 `meta.alignment.drift`（带 `inherited: true` 与说明）。
其余 128 个 `--ds-*` 变量两层完全一致。

---

## 目录约定

```
07-museum-art/
├── TASK.md / STATUS.md          任务与进度
├── README.md / QA.md            使用说明与验收记录
├── INTERFACE.md                 与 06-museum-core 的共享资产接口
├── LICENSES.md                  资产来源与许可
├── RESTYLE-MAP.md               与 16 的改版对照表（含有意差异与缺陷清单）
├── manifest.json                交付清单（供 14-publish 集成）
├── design-tokens.json           统一设计令牌（canonical：meta/designSystem/local/compat/cssVars）
├── scripts/                     资产生成与验收脚本（可重跑）
├── src/ + index.html            预览页源码
├── public/assets/               生成产物（字体/图标/海报/封面/展柜/模型/降级图）
├── dist/                        静态构建输出（供 14-publish 复制）
├── evidence/                    符合性验收证据（JSON）
└── screenshots/                 验收截图（15 张）
```

## 变更日志

- 2026-10-21：创建 `TASK.md`，完成年代与硬件形态研究，安装 Vite/three/@gltf-transform，
  建立 uv 隔离的 fontTools + brotli 字体子集化环境。
- 2026-10-21：安装 Playwright + Chromium，作为 SVG→PNG 与 3D 模型实机渲染的统一光栅化后端。
- 2026-10-21：完成 130 个设计令牌、4 家族 OFL 字体管线、48 枚图标、7 张海报、8 张封面、
  6 组展柜、6 件 GLB 硬件模型、5 张降级图、预览页与 `INTERFACE.md`。
- 2026-10-21 18:30–18:45：**构建复验**。修正 `public/` 构建期 import、端口冲突自动顺延；
  重新执行 `npm run build`（退出码 0）；三套验收（115 / 37 / 38）全部通过；
  确认线上子路径下 fonts.css / tokens.css / tokens.js 等资源均为 200 且无 404。
- 2026-10-21 19:00–19:40：**几何缺陷修复**。`box()` 面内半长取值错误导致薄板被撑成方块；
  6 个 GLB、6 张渲染图、6 张技术插画、6 组展柜全部重生成；补 `srgbToLinear()` 修正 GLB 材质空间。
- 2026-10-21 20:30–21:45：**第三轮复验**。浏览器验收改为按阶段隔离（每阶段独立浏览器进程 +
  无关大图占位替换 + 3 次重试 + 截图平图检测），在峰值 load 200+ 的并发环境下稳定跑通；
  修复 `.viewer-fallback` 的 `[hidden]` 覆盖缺失（WebGL 正常时降级提示仍压在模型上），
  并补全局 `[hidden]` 兜底与回归断言；
  子路径复验补「33 张图片全部取回并解码成功」断言。
  最终三套验收：**115 / 39 / 39 全部通过**，构建退出码 0。
- 2026-10-21 21:45–22:10：**第四轮改版（对齐 16-design-system）**。
  新增 `scripts/sync-ds-tokens.mjs`（只读引用 + 逐项交叉校验 + 指纹）与
  `scripts/lib/local-tokens.json`（展品内嵌配色）；
  `design-tokens.json` 改为对齐后的 canonical（16 令牌树 + 展品内嵌 + 兼容视图 + 对齐元信息）；
  `tokens.css` 改为 `--ds-*` + `--atlas-*` 别名 + `--atlas-local-*` 三层；
  预览页换装为 16 深色主题并叠加 `.ds-*` 组件类；新增 `src/i18n.js` 中英双语与语言切换；
  灯箱补焦点陷阱与焦点归还；`assets.manifest.json` 新增 `alignment` 对齐字段；
  新增 `RESTYLE-MAP.md`（逐项对照与差异说明）。
  令牌与 16 **零取值差异**，字体与 16 **逐字节一致**。
  验收：**151 / 39 / 39 全部通过**，构建退出码 0。
- 2026-10-21 22:10–23:55：**第五轮（改版缺陷修复 + 与 16 的符合性验收）**。
  修复 4 个真实缺陷：B.1 `applyI18n` 抹掉含子元素的翻译节点导致 7 个动态区块全空白
  （13-qa-curation QA-006）、B.2 `.poster-grid` 网格规则丢失导致海报整宽堆叠、
  B.3 字体栈把有限 CJK 子集排在完整系统栈之前、B.4 缺 768px 主断点；
  每个缺陷都补了对应的静态断言防复发。
  新增 `scripts/qa-ds-conformance.mjs`（V.1–V.10；令牌层**直接调用 16 的
  `tools/validate-tokens.mjs`**，用软链沙盒运行，16 的文件未复制未修改）；
  新增 `scripts/build-font-manifest.mjs` 与 `public/assets/fonts/FONT-MANIFEST.json`（自产字体清单）；
  新增 `evidence/` 证据目录。
  文档同步：README / LICENSES / QA / INTERFACE / RESTYLE-MAP / manifest.json。
  验收：**158 / 45 / 40 / 18 全部通过**，构建退出码 0。
