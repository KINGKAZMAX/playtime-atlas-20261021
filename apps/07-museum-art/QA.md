# QA — 回响电玩馆 / PLAYTIME ATLAS 美术包验收记录

最后更新：2026-10-21 23:55 · 对应版本 `1.1.0`
执行环境：macOS（darwin 25.2.0 arm64）· Node v24.13.0 · npm 11.6.2 · Chromium（Playwright）
全部验收由本会话（MiniMax Code M3.1-Flash / max）自动化执行。

---

## 0. 验收方式

| 脚本 | 作用 | 结果 |
| --- | --- | --- |
| `npm run qa` → `scripts/qa-check.mjs` | 资产完整性：文件存在性、尺寸、GLB 合法性、令牌对齐、外链扫描、品牌词扫描、i18n 结构、DOM 引用完整性 | **158 项全部通过** |
| `node scripts/qa-browser.mjs` | 浏览器验收：结构、网格布局、字体加载、图像加载、3D 查看器、交互、截图、响应式、网络与控制台 | **45 / 45 通过** |
| `node scripts/qa-subpath.mjs` | 线上子路径部署复验：`/playtime-atlas-20261021/exhibits/07-museum-art/` | **40 / 40 通过** |
| `node scripts/qa-ds-conformance.mjs` | 与 16-design-system 的符合性：`MIGRATION-NOTES §9` 的 **V.1–V.10** 清单 | **18 / 18 通过** |

> v1.1.0 的四套验收均在**改版完成后重跑**，不是沿用改版前的数字。
> 其中 V.3 的令牌层是**直接调用 16 的 `tools/validate-tokens.mjs`**（软链沙盒运行，16 的文件未复制未修改）。

---

## 1. 资产完整性（158 项通过）

### 1.1 设计令牌
- `design-tokens.json` 共 **883 个令牌**，分区：`meta` / `designSystem`（16 令牌树，213 个叶子）/ `local`（展品内嵌配色）/ `compat`（1.0.0 旧键名兼容视图）/ `cssVars`（129 个 `--ds-*` + 21 个深色覆盖）
- 与 16 的对齐：129 个 `--ds-*` **逐项一致**；`designSystem` 令牌树与 16 **逐字节一致**
- 跨层差异 **1 项**（`--ds-font-mono`）—— 16 自身的 JSON↔CSS 不一致，已登记 `inherited` + 说明
- 字体栈顺序合规：完整系统 CJK 栈在前、`Noto Sans SC` 子集在后
- 同源产物齐备：`design-tokens.json`（根 + assets）、`tokens.css`、`tokens.js`

### 1.2 字体
| 文件 | 状态 |
| --- | --- |
| `space-grotesk-latin.woff2` | ✓ 34.0 KB |
| `inter-latin.woff2` | ✓ 129.6 KB |
| `space-mono-regular.woff2` | ✓ 14.5 KB |
| `space-mono-bold.woff2` | ✓ 14.6 KB |
| `noto-sans-sc-subset.woff2` | ✓ 193.0 KB（746 个汉字与全角符号子集） |
| `fonts.css` | ✓ 5 组 `@font-face` |
| OFL 授权原文 × 5 | ✓ 全部随包分发 |

### 1.3 图标
- **48 枚**独立 SVG（24×24 网格 / 1.5 描边 / `currentColor`）
- `icons.svg` 雪碧图（48 个 `<symbol>`）、`index.json`、`sheet.svg` 总览表齐备
- 逐枚校验：**全部使用 `currentColor`**，可换色

### 1.4 海报（7 张）
- 每张 SVG（≈486 KB，内嵌字体自包含）+ PNG
- **PNG 尺寸逐张校验 = 1200 × 1800** ✓
- 编号 `dawn` / `golden` / `home8` / `disc16` / `poly3d` / `pocket` / `converge`

### 1.5 封面（8 张）
- 7 张年代封面 + 1 张全馆主视觉
- **PNG 尺寸逐张校验 = 1600 × 900** ✓

### 1.6 展柜（6 组）
- **PNG 尺寸逐张校验 = 1000 × 1250** ✓

### 1.7 硬件 3D 模型（6 件）
| id | GLB | 合法性 | 部件 | 三角面 | 渲染图 | 技术插画 |
| --- | --- | --- | --- | --- | --- | --- |
| `cabinet-01` | 66.4 KB | ✓ GLB v2 | 34 | 1 004 | 1024² ✓ | ✓ |
| `console-02` | 82.5 KB | ✓ GLB v2 | 33 | 1 652 | 1024² ✓ | ✓ |
| `console-03` | 103.1 KB | ✓ GLB v2 | 32 | 2 472 | 1024² ✓ | ✓ |
| `handheld-04` | 42.6 KB | ✓ GLB v2 | 19 | 690 | 1024² ✓ | ✓ |
| `hybrid-05` | 80.5 KB | ✓ GLB v2 | 25 | 1 932 | 1024² ✓ | ✓ |
| `modern-06` | 66.4 KB | ✓ GLB v2 | 36 | 1 044 | 1024² ✓ | ✓ |

GLB 校验方式：magic `glTF`、version = 2、总长一致、JSON chunk 可解析且含 `meshes` 与 `nodes`。

### 1.8 降级与离线图形
`poster-fallback` / `cover-fallback` / `model-fallback` / `no-webgl` / `offline-notice`
—— SVG + PNG 各 5 份，齐全 ✓

### 1.9 交付文档与清单
`TASK.md` `STATUS.md` `README.md` `INTERFACE.md` `LICENSES.md` `manifest.json`
`index.html` `src/main.js` `src/styles.css` `src/data.js` `vite.config.js` `package.json`
全部存在且非空 ✓
`manifest.json` 必需字段（`id` / `title` / `description` / `entry` / `buildCommand` / `outputDir` / `status`）**齐全** ✓

### 1.10 零外部请求扫描
扫描 `dist/` `public/` `src/` 与 `index.html` 中的
`src="http…"` / `href="http…"` / `url(http…)`：**未发现任何外部资源引用** ✓

### 1.11 品牌标识扫描
在海报、封面、模型全部资产中检索 15 个品牌关键词
（nintendo / sega / sony / playstation / xbox / atari / gameboy / n64 / joy-con / dualshock …）：
**未出现任何品牌名称** ✓

---

## 2. 浏览器验收（45 / 45 通过）

验收脚本按**阶段**执行，每个阶段使用**全新的浏览器进程**（见 §6「验收环境资源」）：
A 结构与字体 / B 图片完整性 / C 3D 查看器 / D 交互 / E 区块截图 / F 响应式。

| 类别 | 检查项 | 结果 |
| --- | --- | --- |
| 结构 | 页面标题 | ✓ 回响电玩馆 / PLAYTIME ATLAS — 原创美术与硬件模型包 |
| 结构 | 色板 74 项 / 字体卡 4 张 / 图标 48 枚 / 海报 7 张 / 封面 8 张 / 展柜 6 组 / 展品 6 件 / 展品标签 6 个 / 降级卡 5 张 / 统计 6 项 | ✓ 全部匹配 |
| 结构 | **6 个卡片容器的网格布局**（海报 / 封面 / 展柜 / 展品 / 图标 / 字体） | ✓ 均为 `display: grid` 且首行 ≥2 张（见 §5.6） |
| 字体 | Space Grotesk / Noto Sans SC / Space Mono | ✓ 三个 `document.fonts.check` 均通过 |
| 图像 | 页面内 **33 张**带 `src` 的图片 | ✓ 全部按 HTML 声明尺寸解码成功（hero 1 / 海报 7 / 封面 8 / 展柜 6 / 模型渲染 6 / 降级 5） |
| 3D | 画布尺寸 588×544、WebGL 上下文 | ✓ 可用，GLB 返回 200 且可交互加载 |
| 3D | **回归**：WebGL 可用时降级面板必须隐藏 | ✓ `display: none`，不再压在模型上（见 §5.5） |
| 交互 | 切换展品（点 `子午线光盘机`） | ✓ 侧栏标题同步更新 |
| 交互 | 自动旋转开关 | ✓ 文案在「自动旋转 / 已暂停旋转」间切换 |
| 交互 | 图标分类筛选 | ✓ 12 / 48 可见（导航分类） |
| 交互 | 灯箱打开 | ✓ |
| 交互 | 灯箱键盘操作（→ 翻页 / Esc 关闭） | ✓ |
| 截图 | 灯箱大图实际入画 | ✓ 448×672 @ top=56，截图非平图 |
| 截图 | 9 个区块 + 灯箱 + 2 张响应式 | ✓ 本轮生成 12 张；`screenshots/` 共 15 张（另含整页图与子路径部署图） |
| 响应式 | 390 px（mobile） | ✓ 无横向溢出 |
| 响应式 | 820 px（tablet） | ✓ 无横向溢出 |
| 网络 | 跨域请求 | ✓ **0 个** |
| 网络 | 失败请求 | ✓ **0 个**（拆除浏览器瞬间的 `ERR_ABORTED` 已排除） |
| 控制台 | 错误 | ✓ **0 条** |

### 2.1 截图有效性自检

每张截图落盘后用 ImageMagick 计算灰度标准差：**平图（纯色）判定为失败并自动换新浏览器进程重截**。
本轮 14 张截图的标准差区间为 **0.0758 – 0.2530**，全部为有效画面。
（`lightbox.png` 曾在早期版本中为 4.6 KB 的纯色图——那是并发负载下合成器丢帧导致**截图**没抓到内容，
并非页面缺陷；定点诊断确认灯箱 DOM 完全正常，见 §5.6。）

---

## 3. 线上子路径部署复验（40 / 40 通过）

模拟线上真实路径 `/playtime-atlas-20261021/exhibits/07-museum-art/`（临时静态服务器，验证后立即关闭）：

### 3.1 关键资源请求状态
| 资源 | 状态码 |
| --- | --- |
| `assets/fonts/fonts.css` | **200** |
| `assets/tokens.css` | **200** |
| `assets/tokens.js` | **200**（显式 `fetch` 验证） |
| `assets/icons/icons.svg` | **200** |
| `assets/posters/poster-dawn.png` | **200** |
| `assets/covers/cover-atlas-hero.png` | **200** |
| `assets/cases/case-console-02.png` | **200** |
| `assets/models/model-cabinet-01.glb` | **200** |
| `assets/models/model-cabinet-01.png` | **200** |
| `assets/fallback/model-fallback.png` | **200** |

- **无任何 404**、**无失败请求**、**所有请求均为 200** ✓
- **页面引用的 33 张图片在子路径下全部取回并解码成功** ✓
  （验收脚本在滚动触发懒加载之后，会把 `img[loading="lazy"]` 统一切为 `eager` 并等待解码完成，
  确保「页面引用的每一张图」都真的向子路径发起过请求——不依赖滚动时序）
- 运行期可用性：`window.ATLAS_TOKENS` 可用（`designSystem.color` 4 个色阶分组 + `cssVars` 129 个变量）、
  **设计令牌在运行期生效**（`--ds-bg` / `--ds-accent` 可取到值）、
  色板 74 项、海报 7 张、图标 48 枚、展品 6 件、
  Space Grotesk 与 Noto Sans SC 均正常加载、正文字体栈正确 ✓
- 产物洁净度：bundle 中**无 `/public/` 残留引用**；`index.html` 的样式表与脚本引用均为**相对路径** ✓
- 控制台**无错误** ✓

> v1.1.0 说明：`ATLAS_TOKENS` 的结构从 `color/typography/…` 变为
> `meta / designSystem / local / compat / cssVars`（16 的令牌树在 `designSystem` 下）。
> 复验脚本已同步更新到新结构，并额外断言 `--ds-*` 在运行期确实生效。

### 3.2 关于 `tokens.js` 的说明
设计令牌已**构建期内联进 JS bundle**，因此页面运行期**不会主动请求** `assets/tokens.js`。
但该文件**确实存在于 `dist/assets/tokens.js`**（4.1 KB），显式请求返回 **200**，
供 06-museum-core 等下游任务直接取用。复验脚本对此做了显式 `fetch` 校验。

---

## 4. 构建复验结论（回应 13-qa-curation 的 fail 判定）

### 4.1 结论
**构建通过。** `npm run build` 退出码 **0**，产出 `dist/index.html`（11.7 KB）与完整 `dist/assets/` 资源树。

### 4.2 关于 17:35 那次 fail 的性质
13 的 QA harness 在 17:35 判定 fail，报
`Could not resolve "./data.js" from "src/main.js"`，并据此认为 `build.ok=false`。
经核对，这是**时间竞态**，不是真实缺陷：

- `src/data.js` 由 `scripts/build-manifest.mjs` 生成，写入时间 **17:35:51**，
  **晚于** 13 执行构建的时点；
- 该次构建时文件尚未生成，因此 Vite 无法解析 `./data.js`；
- 本任务的 `npm run qa` 于 **17:41** 报「通过 115 项，失败 0 项」，与此吻合。

复验已通过重新执行 `npm run build` 确认：文件齐备时构建稳定成功（退出码 0）。

### 4.3 关于两条构建期提示
构建日志中的

```
./assets/fonts/fonts.css doesn't exist at build time, it will remain unchanged to be resolved at runtime
./assets/tokens.css doesn't exist at build time, it will remain unchanged to be resolved at runtime
```

属于 **Vite 对 `public/` 目录的正常行为**：`public/` 下的文件被原样拷贝到 `dist/`，
不做打包期解析。`index.html` 中以**相对路径** `./assets/fonts/fonts.css`、`./assets/tokens.css` 引用，
在根路径与子路径下均实测 **200**。这不是错误，也不影响产物。

### 4.4 关于 `import TOKENS from '../public/assets/tokens.js'`
该写法**确为脆弱模式**（从 `public/` 直接 import 依赖 Vite 的特殊处理），本轮已修正：

- `scripts/build-tokens.mjs` 额外生成 `src/tokens.js`；
- `src/main.js` 改为 `import TOKENS from './tokens.js'`（纯 `src/` 内引用，构建期正常解析）；
- `public/assets/tokens.js` **仍然保留**并照常交付给下游任务。

复验结论：令牌已内联进 bundle，运行期无 `/public/` 残留引用，子路径下 `tokens.js` 显式请求 **200**。

---

## 5. 验收过程中发现并修复的缺陷

验收不是走过场。本轮共发现并修复 **5 个真实缺陷**（§5.1 – §5.5），
另修正验收脚本自身的 6 类问题（§5.6），全部由自动化检查或逐件目视核对暴露：

### 5.1 `box()` 面内半长取值错误（几何级，严重）

**现象**：六件展品的渲染图上出现若干"悬空黑板"——本应是薄板的地方（屏幕边框、面板饰条）被撑成了厚方块。
例：掌机的「下屏边框」实际尺寸为 `0.072 × 0.046 × 0.072`，而定义值是 `0.072 × 0.046 × 0.003`。

**根因**：`scripts/lib/geometry.mjs` 的 `box(w, h, d)` 在生成每个面的顶点时，
一律用 `su * x` 与 `sv * y`（X、Y 轴半长）做面内偏移。
但 ±X 面的面内两轴是 **Z、Y**，±Y 面是 **X、Z**——薄板因此被沿错误轴展开。

**修复**：为每个面显式声明面内半长 `su` / `sv`，并按该面实际张开的轴取值。

**影响**：6 个 GLB、6 张渲染图、6 组展柜、6 张技术插画全部重新生成。
修复后六件展品的一次性对照目视核对确认：黑板消失，比例正确，
各展品一眼可辨其年代形态（立式投币机柜 / 八位卡带机 / 光盘主机 / 双屏翻盖掌机 / 平板混合主机 / 立式模块化主机）。

### 5.2 GLB 材质未做 sRGB → 线性转换

**现象**：模型颜色比设计令牌明显发白、发青。

**根因**：glTF 规范的 `baseColorFactor` 定义在**线性空间**，而材质库直接写入了 sRGB 十六进制的归一化值。

**修复**：`scripts/lib/glb.mjs` 增加 `srgbToLinear()`，装配时对 `baseColorFactor` 与 `emissiveFactor` 做转换。

### 5.3 从 `public/` 目录直接 import（构建期脆弱）

**现象**：构建日志出现 `Could not resolve "./data.js" from "src/main.js"`（13 于 17:35 判 fail 的直接原因）。

**根因**：`src/main.js` 中 `import TOKENS from '../public/assets/tokens.js'`。
`public/` 目录在 Vite 中被原样拷贝、不参与打包期解析，属于脆弱写法。
同时 `src/data.js` 由 `scripts/build-manifest.mjs` 生成，13 构建时尚未落盘，构成时间竞态。

**修复**：`scripts/build-tokens.mjs` 额外生成 `src/tokens.js`，
`src/main.js` 改为 `import TOKENS from './tokens.js'`（纯 `src/` 内引用）。
`public/assets/tokens.js` 仍照常交付给下游任务。

### 5.4 验证脚本的端口与视口假设

| 问题 | 修复 |
| --- | --- |
| 渲染脚本用 1400×1000 视口截取 1024×1024 的 WebGL 画布，超出视口部分截图为空 | 视口改为 1280×1280，完整包含画布 |
| 端口 4327 被 06 的临时验证服务器占用时，本包 dev server 直接启动失败 | 改为 `strictPort: false` + 端口上报插件，**自动顺延且不 kill 任何进程** |
| 静态测试服务器未设 `Content-Length`，大文件（GLB）传输被中断（`ERR_ABORTED`） | 补 `Content-Length` 与 `Accept-Ranges` |
| 整页截图在软件光栅化下超过 30 秒默认超时 | 截图超时提升至 120–180 秒 |
| 同批任务并发时导航偶发超时 | 导航超时提升至 120 秒；模型渲染增加一次重试 |

### 5.5 `hidden` 属性被组件样式覆盖（真实产品缺陷，本轮新发现）

**现象**：3D 展品区截图里，**WebGL 模型正常渲染的同时**，
「当前环境未启用 WebGL，已切换到技术插画降级图。」这句降级提示仍压在模型上。

**根因**：`src/styles.css` 里 `.viewer-fallback { display: flex; … }`（具体值 0,1,0）
与浏览器 UA 样式表的 `[hidden] { display: none }`（同为 0,1,0）**优先级相同**；
同优先级下作者样式表在后 → 后写者胜，于是 `display: flex` 盖过了 `display: none`。
结果：`$('#viewer-fallback').hidden = true` 这行 JS 失效，降级面板**永远可见**。
（同页的 `.lightbox` 写有 `.lightbox[hidden] { display: none; }`，所以灯箱没有这个问题。）

**修复**：
1. `src/styles.css` 增加 `.viewer-fallback[hidden] { display: none; }`；
2. 另加全局兜底 `[hidden] { display: none !important; }`，杜绝同类问题复发。

**回归**：浏览器验收新增一项断言——WebGL 可用时降级面板必须为 `display: none` 且高度为 0 ✓。

### 5.6 验收脚本自身暴露的问题（本轮逐项修正）

| # | 问题 | 修复 |
| --- | --- | --- |
| 1 | 灯箱截图截到纯色遮罩（4.6 KB） | 截图前等 `#lightbox-img` 真正解码且进入视口；落盘后用 ImageMagick 算标准差，**平图即判失败并重截** |
| 2 | 图片完整性检查漏掉 hero 主视觉 | hero 区的 DOM 根是 `.hero`（`#top` 是 `<header>`，不含图）；同时把导航片段与查询选择器拆成 `nav` / `sel` 两个字段，避免把类名拼进 URL 造成 404 |
| 3 | 关闭浏览器瞬间的 `ERR_ABORTED` 被计为失败请求 | 增加 `closing` 标志，拆除阶段产生的中断不计入产物缺陷 |
| 4 | 子路径复验 `page.goto` 沿用 30 秒默认超时 | 超时设置提到 `goto` **之前**（此前写在 goto 之后，负载高时直接判失败） |
| 5 | 滚动触发的懒加载图未被请求（3 项「未请求」） | 滚动之后把 `img[loading="lazy"]` 统一切为 `eager` 并等待解码；并新增「33 张图片全部取回并解码成功」断言 |
| 6 | 子路径截图用 1440×1000 合成超时 | 截屏前缩到 1200×820，超时提到 180 秒，允许 3 次重试 |
| 7 | v1.1.0：子路径复验仍按 1.0.0 的令牌结构取 `ATLAS_TOKENS.color` | 令牌结构已变为 `meta/designSystem/local/compat/cssVars`；复验脚本改为读 `designSystem.color` + `cssVars`，并新增「`--ds-*` 在运行期生效」断言 |
| 8 | v1.1.0：浏览器关闭瞬间的 GLB 请求中断被记为「失败请求」 | 中断事件**异步**到达，原先只在关闭前后置一个全局布尔量，晚到一步就被误记。改为**每个页面自带 `torn` 标志**（页面一拆除即不再计入），并让阶段 D 等新展品的 GLB 真正 200 后再收尾 |

### 5.7 改版轮次（v1.1.0）发现并修复的真实缺陷

| # | 缺陷 | 发现方式 | 影响 | 修复 |
| --- | --- | --- | --- | --- |
| B.1 | `applyI18n` 用 `textContent` 覆盖含子元素的 `[data-i18n]` 节点，抹掉 `<strong id="cjk-count">` | **13-qa-curation QA-006**（critical）+ 本包重跑验收复现 | `main.js` 对 null 赋值抛 TypeError，整条渲染链中断，**7 个动态区块全空白** | 拆成 `data-i18n`（纯文本，须无元素子节点）与 `data-i18n-rich`（文案自带内联标记，`innerHTML` 覆盖）；`#cjk-count` 移出翻译节点；DOM 写入全部走安全封装，单个渲染步骤用 `run()` 隔离 |
| B.2 | `.poster-grid` 基础网格规则在样式重写时丢失 | 浏览器验收新增的「网格布局」断言 | 元素数量对、截图非空，但海报**整宽堆叠**，版面是错的 | 补回 `repeat(auto-fill, minmax(238px, 1fr))` |
| B.3 | 字体栈把有限的 `Noto Sans SC` 子集排在完整系统 CJK 栈之前 | 与 16 重新同步时发现 16 已修正该顺序 | 中文混排基线错位 | 随 16 重新同步；QA 新增「字体栈顺序合规」断言 |
| B.4 | 样式重写后没有 768px 主断点 | 16 的 `tools/validate-tokens.mjs` 报「缺少 768px 主断点」 | 与 16 的断点体系不一致 | 补 `@media (min-width: 768px)`：平板带恢复两栏查看器与舒适网格密度 |

### 5.8 为防复发新增的断言

| 脚本 | 断言 | 封堵的缺陷 |
| --- | --- | --- |
| `qa-check.mjs` 9c | `main.js` 引用的 31 个 `#id` 全部存在于 `index.html` | B.1 同类空引用事故 |
| `qa-check.mjs` 9c | 46 个 `data-i18n` 节点均不含元素子节点 | B.1 |
| `qa-check.mjs` 9c | 10 个 `data-i18n-rich` 节点的 zh/en 内联标记与 HTML 一致 | B.1 |
| `qa-check.mjs` 9c | 56 个 i18n key 双侧登记；zh/en 词表 98 条 key 完全一致 | 双语漏译 |
| `qa-check.mjs` 1 | 字体栈顺序合规（完整系统 CJK 栈在前） | B.3 |
| `qa-check.mjs` 9b | drift 每项都带 `inherited` + 说明；`alignmentLayers` 分层来源与指纹 | 跨层差异被静默吞掉 |
| `qa-browser.mjs` A | 6 个卡片容器 `display:grid` 且首行 ≥2 张卡 | B.2 |

---

## 6. 与 16-design-system 的符合性验收（V.1–V.10，18 / 18 通过）

脚本：`node scripts/qa-ds-conformance.mjs` → `evidence/ds-conformance.json` · `evidence/tokens-validate.json`

| 项 | 检查 | 实测 |
| --- | --- | --- |
| V.1 | 水平溢出（1440 / 1280 / 768 / 390 四档） | ✅ 四档均无溢出 |
| V.2 | 对比度（正文 ≥4.5 / 大字 ≥3 / UI ≥3） | ✅ 18 项全部实测达标，最低 **5.56:1** |
| V.3 | 令牌一致性 | ✅ 129 个 `--ds-*` 与 16 逐项一致；`designSystem` 令牌树与 16 逐字节一致；16 的 `validate-tokens.mjs` 无未解释 error |
| V.4 | 命名空间冲突 | ✅ 无同名不同义变量（比对 129 个） |
| V.5 | 焦点可达 | ✅ 焦点环始终可见（抽样 12 个）；12 次 Tab 得到 12 个不同焦点 |
| V.6 | 触摸目标 | ✅ 全部 ≥24px；主按钮与图标按钮 ≥44px |
| V.7 | reduced-motion | ✅ `--ds-dur-base` / `--ds-entry-duration` 均降为 1ms |
| V.8 | 外部请求 | ✅ 运行期 0 个非本地请求 |
| V.9 | 字体 | ✅ 4 个自托管字体族全部加载（5 个 face） |
| V.10 | 子路径 | ✅ 子路径下 18 个关键 URL 全部 200 |

**令牌层直接调用 16 的 `tools/validate-tokens.mjs`**：用**软链沙盒**把本包文件摆成 16 期望的目录结构，
再以 `node --preserve-symlinks-main` 原样运行它 —— 16 的文件一个字节未复制、未修改。
16 校验器报出的唯一 error 属**已登记的不适用机制项**（`.ds-indicator` 的 `clamp(36px, 8vh, 64px)`，
理由见 `RESTYLE-MAP.md` D.6 与 `design-tokens.json → meta.alignment.inapplicableChecks`）。

对比度探针用 1×1 canvas 取实际合成像素，兼容 `color-mix()` 等现代颜色语法
（只认 `rgb()` 的正则会把这 6 个节点误判为「无法计算」）。

---

## 7. 已知限制与未验证项

| 项 | 说明 |
| --- | --- |
| 中文字形覆盖 | 子集仅 **746 字**，覆盖本包全部文案。若 06 引入新汉字，需按 `INTERFACE.md` §6 扩充子集；未覆盖字形会回退到系统字体（不破版，字重有偏差） |
| 真实 GPU 渲染 | 本机无独显，3D 渲染与验收均在 **SwiftShader 软件光栅化**下完成。材质、灯光与构图在真实 GPU 上只会更好，但**未在真实 GPU 上实测** |
| 旧版浏览器 | 未在 Safari / Firefox 上实测（仅 Chromium）。所用特性（ES Module、fetch、CSS 自定义属性、WebGL2）均为现代浏览器基线 |
| 辅助技术 | 已实现无障碍骨架（skip-link、语义标签、`aria-*`、键盘灯箱、`prefers-reduced-motion`），但**未使用真实屏幕阅读器做人工验证** |
| 打印/CMYK | 资产为屏幕 RGB 设计，未提供印刷用 CMYK / 出血版本 |
| 端口 4327 | 当前被 06-museum-core 的临时验证服务器占用，本包 `npm run dev` 自动顺延至 **4329** 并打印实际地址。**不影响资产交付**（06 直接复制 `public/assets/` 即可） |
| 验收环境资源 | 本批多个任务并发执行浏览器验收，机器内存紧张时 Chromium 渲染进程可能被 OOM 杀掉（表现为 `Target page, context or browser has been closed`），导航也可能超时（实测同机 load average 一度冲到 380+）。**验收脚本已加固**：A–F 每个阶段用全新浏览器进程、用完立即关闭；无关大图替换为 1×1 占位图（HTTP 200，不污染控制台与网络统计）；每阶段 4 次重试；页面导航/操作超时放宽到 **300 秒**。这属于**环境限制，非产物缺陷** |
| 软件光栅化 | 本机无独显，所有 3D 渲染与交互验收均在 **SwiftShader** 下完成。真实 GPU 上材质与光照只会更好，但**未在真实 GPU 上实测** |

---

## 8. 复现方式

```bash
cd 07-museum-art
npm install
npm run build          # 退出码应为 0
npm run qa             # 资产完整性：158 项
node scripts/qa-browser.mjs   # 浏览器验收：45 项 + 15 张截图
node scripts/qa-subpath.mjs   # 线上子路径复验：40 项
node scripts/qa-ds-conformance.mjs  # 与 16 的 V.1–V.10 符合性：18 项
```

四个脚本均为**自包含**（自带临时静态服务器），运行结束即关闭，不留常驻进程。

---

## 9. 验收总结

| 维度 | 结论 |
| --- | --- |
| 资产完整性 | ✅ 158 / 158 |
| 浏览器验收 | ✅ 45 / 45 |
| 线上子路径 | ✅ 40 / 40 |
| 与 16 的符合性（V.1–V.10） | ✅ 18 / 18 |
| 构建 | ✅ 退出码 0，产物完整 |
| 令牌对齐 | ✅ 129 个 `--ds-*` 与 16 逐项一致；跨层差异 1 项已登记（源自 16 自身） |
| 字体 | ✅ 与 16 逐字节一致；运行期零外部字体请求 |
| 外部请求 | ✅ 0 |
| 控制台错误 | ✅ 0 |
| 品牌资产 | ✅ 0 |
| 第三方素材 | ✅ 0（仅 4 款 SIL OFL 1.1 开源字体，授权原文随包） |

**本任务可交付。**
