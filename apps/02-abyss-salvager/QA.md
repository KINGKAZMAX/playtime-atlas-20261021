# QA · 浏览器实测验收记录

> 项目：**《渊甲拾遗者 / ABYSS-CARAPACE SALVAGER》**（任务 02）
> 验收时间：**2026-10-21**
> 验收方式：**headless Google Chrome + CDP（DevTools Protocol）驱动真实交互**
> 被测地址：`http://127.0.0.1:4312/`（`npm run dev`，`strictPort`）
> 原始记录：[`screenshots/qa-results.json`](./screenshots/qa-results.json)
> 复现命令：`npm run capture && npm run verify:glb && npm run check:d1 && npm run verify:fallback && npm run verify:dist`

---

## 1. 验收环境

| 项 | 值 |
|---|---|
| 浏览器 | Google Chrome（headless=new，`--ignore-gpu-blocklist --enable-gpu-rasterization`） |
| GL 后端 | `ANGLE (Apple, ANGLE Metal Renderer: Apple M5, Unspecified Version)` — **真实 GPU，非 SwiftShader** |
| 视口 | 1680 × 1050，`deviceScaleFactor = 1` |
| 交互输入 | CDP `Input.dispatchMouseEvent`（真实指针按下 / 移动 / 抬起 / 滚轮），非 JS 伪造 |
| Node | v24.13.0 |
| 依赖 | `three@0.180.0`、`vite@7.3.7`（npm） |

---

## 2. 验收结论

```
PASS 24 / FAIL 0
console error        : []   （0 条）
uncaught exception   : []   （0 条）
```

**全部 24 项断言通过，页面无任何控制台错误与未捕获异常。**

另有两组独立验收：

```
D1 文字压盖        : desktop 0 / mobile 0   （同 13 口径，测生产构建 dist/）
WebGL 降级          : 13 / 13 PASS           （真实禁用 WebGL，测生产构建 dist/）
生产包子路径实测     : 13 / 13 PASS
发布链路离线模拟     : 全部通过
```

> v1.1.0 在原 15 项之上新增 **9 项**（构件选中 / 层级开关 / 分步组装 / 声明三处可见 /
> 双语标注 / 四档横向溢出 / 导出元数据声明 / 说明页）；
> v1.1.1 再加 **1 项** `annotation-avoids-visible-text`（3D 标注与任何可见文字零压盖），
> 并新增 D1 文字重叠自查（见 §5.3）与 WebGL 降级自查（见 §5.4）。

---

## 3. 断言明细

| # | 断言 | 结果 | 实测值 | 判定依据 |
|---|---|---|---|---|
| 1 | `api-exposed` | ✅ | — | `window.__abyss` 调试句柄存在，应用正常启动 |
| 2 | `real-3d-geometry-present` | ✅ | 104,468 三角面 / 548 网格 / 248,706 顶点 | 场景内实测遍历；**证明是真实 3D 几何而非 2D 图片** |
| 3 | `drag-orbits-camera` | ✅ | 相机 `(-1.389, 8.986, 19.443)` → `(-8.696, 15.160, -0.014)` | 真实鼠标按下-拖动-抬起，相机位置发生改变 |
| 4 | `wheel-zooms-camera` | ✅ | 距离 24.618 → 19.847 | 真实滚轮事件，视距缩短 |
| 5 | `crown-view-frames-head` | ✅ | NDC `(-0.062, -0.174, 0.965)` | 磨削冠机位下头部投影落在画面中心区（\|x\|<0.75, \|y\|<0.85, z<1） |
| 6 | `explode-moves-parts` | ✅ | 位移量 **0.5829** | 分解后第 9 节甲壳板网格实际发生位移 |
| 7 | `xray-transparents-shell` | ✅ | 外壳不透明度 **0.12** | X 光开启后外壳降到 12% |
| 8 | `section-clipping-enabled` | ✅ | `clippingPlanes = [plane]` | 纵剖模式下材质真实挂上裁剪面 |
| 9 | `crown-section-clipping` | ✅ | `clippingPlanes = [plane]` | 磨削冠横剖模式生效 |
| 10 | `theme-switch-applies` | ✅ | `theme = "sonar"` | 主题切换实际写入并生效 |
| 11 | `segment-count-rebuild` | ✅ | `segments.length = 12` | 结构参数改变后**真实重建**几何（18 → 12） |
| 12 | `reset-restores-defaults` | ✅ | `{seg:18, theme:"abyss", explode:0, length:760}` | 重置回到全部默认值，长度读数恢复 **760 m** |
| 13 | `tool-rail-rendered` | ✅ | 12 个工具按钮 / 6 个机位 | 左侧工具栈实际渲染，无死链 |
| 14 | `glb-export` | ✅ | **约 9.14 MB**，magic `glTF`，文件名 `abyss-salvager-ac-vii-18seg.glb`（精确字节见 `assets.manifest.json`） | 拦截真实 Blob 下载，校验魔数 |
| 15 | `glb-file-written` | ✅ | version 2，declaredLength **== 实际字节数**（本次实测 9,136,072） | 头部声明长度与文件长度严格一致，文件已落盘 `public/models/` |
| 16 | `part-selection-works` | ✅ | 选中 `carapace` → **649 网格 / 132,576 三角面**；面板含「叠压甲壳板 / Overlapping carapace」 | 射线拾取真的选中了构件，选择面板同步显示中英名与规模 |
| 17 | `layer-toggle-works` | ✅ | crown 层可见网格 **2 → 0 → 恢复 2** | 层级开关真实作用于 `partGroup` 显隐 |
| 18 | `assembly-step-works` | ✅ | 阶段 1 = 0 节无尾 · 阶段 2 = **6 节** · 阶段 4 = **18 节 + 尾段** | 分步组装逐阶段改变可见构件集 |
| 19 | `disclaimer-visible-in-model-and-ui` | ✅ | 铭牌在场景内；卡片含「教学示意，非施工/工程模型」；说明页链接存在 | 声明落点 ①（模型内）与 ②（说明页入口）均可见 |
| 20 | `bilingual-annotations-present` | ✅ | 标注 zh **14** / en **14** | 14 枚标注胶囊均含中英双语 |
| 21 | `no-horizontal-overflow` | ✅ | 1440 / 1280 / 768 / 390 四档 `scrollWidth == innerWidth` | 四档视口均无横向溢出 |
| 22 | `glb-export-metadata-disclaimer` | ✅ | `asset.extras.disclaimer_zh = 教学示意，非施工/工程模型`；`isConstructionModel=false`；`isEngineeringModel=false`；`forcesAreQualitativeOnly=true` | 声明落点 ③（导出元数据）写入成功 |
| 23 | `notes-page-disclaimer-and-part-table` | ✅ | 标题「模型说明与声明」；中英声明齐备；**14 行**构件对照表；返回链接存在 | 说明页（落点 ②）内容完整 |
| 24 | `annotation-avoids-visible-text` | ✅ | 标注胶囊 **0** 处与页面其它可见文字压盖 | 用与 D1 同口径的检测逻辑，逐一比对每枚胶囊的**文本行盒**与页面全部可见文字的交叠比（阈值 50%）；这是 3D 场景内「避让逻辑」的回归守卫 |

---

## 4. GLB 产物校验（`npm run verify:glb`）

```
file      : public/models/abyss-salvager-ac-vii.glb
bytes    : 9135924
magic     : glTF
version  : 2
declared : 9135924          ← 与文件长度一致
--- glTF contents ---
nodes        : 693
meshes       : 548
primitives   : 548
triangles    : 104468        ← 与场景内三角面数完全一致
vertices     : 248706        ← 与场景内顶点数完全一致
non-indexed  : 404 primitives
materials    : 9
textures     : 4
images       : 4
accessors    : 1788
bufferViews  : 1792
bin chunk    : BIN present 8.18 MB
---
PASS: valid GLB 2.0 container with real geometry.
```

**要点**：GLB 中的三角面 / 顶点数与浏览器场景内实测值**逐位相同**，
说明导出的就是屏幕上的那个模型，没有「导出的是另一份简化模型」的情况。

> **关于字节数**：程序化几何的顶点浮点末位在每次重新导出时会有细微差异，
> 因此 `bytes` 会在 **±数十字节**内浮动（历史观测值：9,134,260 / 9,135,924 / 9,135,972 / 9,136,072 / 9,136,112）。
> 因此断言只校验三件确定的事 —— `magic = glTF`、`version = 2`、**`declaredLength == 实际字节数`**；
> 权威体积与 sha256 记录在 `public/models/assets.manifest.json`（构建时由 `scripts/sync-model.mjs` 自动刷新）。

> 模型文件在 v1.0.1 已迁至 `public/models/`（唯一真源）。
> `npm run build` 会先跑 `scripts/sync-model.mjs` 校验 GLB 头并刷新
> `public/models/assets.manifest.json`，再交给 Vite 原样复制进 `dist/models/`。

---

## 5. 截图清单（21 张，1680×1050；降级态为 1440×900）

| 文件 | 展示内容 | 验证点 |
|---|---|---|
| `01-survey-abyss.png` | 深渊实景 · 测绘全景 | 主画面、工具栈、遥测条、参数抽屉、测区图、纵剖带、节律表整体布局 |
| `02-after-orbit-drag.png` | 拖拽轨道旋转后 | 真实指针拖拽改变了视角 |
| `03-after-wheel-zoom.png` | 滚轮缩放后 | 视距缩短 |
| `04-profile.png` | 侧视机位 | 全侧向轮廓，叠瓦甲壳板剪影 |
| `05-crown-head-on.png` | 磨削冠机位 | 磨削冠 + 14 处编号标注；右侧磨削冠剖面板含 `Ø 41.7 m` 尺寸标注 |
| `06-hopper-tail.png` | 矿仓机位 | 压力气囊尾、尾扇叶片、腹面矿仓观察窗 |
| `07-exploded.png` | 分解视图（0.85） | 甲壳板径向炸开，内部脊梁 / 减速组 / 液压撑可见 |
| `08-xray.png` | X 光透视 | 外壳 12% 半透，内部构件青碧自发光 |
| `09-section-longitudinal.png` | 纵剖面 | 沿体轴真实裁剪，露出内部驱动链 |
| `10-section-crown.png` | 磨削冠横剖 | 横向裁剪面 |
| `11-sonar-plan.png` | 声呐测绘主题 · 俯视 | 第二套主题（青色测绘网格 + 均光） |
| `12-rebuild-12-segments.png` | 段数改为 12 后重建 | 结构参数真实重建几何 |
| `13-after-reset.png` | 重置后 | 回到 18 节 / 深渊实景 / 无分解 / 760 m |
| `14-after-export.png` | GLB 导出后 | 导出按钮状态与 toast 提示 |
| `15-clean-follow.png` | `H` 隐藏全部界面 | 纯净画面随行机位 |
| `16-part-selected.png` | **构件被选中** | 射线拾取后构件描边高亮，右栏「构件检视」显示中英名 + 网格数 + 三角面数 |
| `17-assembly-step-2.png` | **分步组装阶段 2** | 「+前 6 节」：只有磨削冠与前 6 节可见 |
| `18-layer-crown-hidden.png` | **层级开关：关闭磨削冠层** | 该层构件整体隐去，其余保留 |
| `19-notes-page.png` | **模型说明与声明页** | 教学示意声明正文 + 14 行构件中英对照表 + 参数与产物 + 来源与许可 |
| `20-webgl-fallback.png` | **WebGL 不可用时的 2D 降级页**（1440×900） | 真实禁用 WebGL 后：降级标题与中英文说明、纵剖带（18 节体节）、磨削冠剖面（7 blades）、降级原因 +「教学示意，非施工/工程模型」；**不是白屏** |
| `16-subpath-shipped-model.png` | **发布子路径下的随包模型载入态** | 生产包在 `/playtime-atlas-20261021/works/02-abyss-salvager/` 下启动，随包 GLB 已载入场景 |
| `d1-review/d1-1440x900-hit-*.png` | **D1 复核裁剪（修复前的历史留证）** | 桌面剩余命中的整页目视证据；修复后命中为 0，不再产出裁剪 |
| `d1-review/d1-390x844-hit-*.png` | **D1 复核裁剪（修复前的历史留证）** | 移动剩余命中的整页目视证据；修复后命中为 0，不再产出裁剪 |

---

## 5.1 生产包子路径实测（`npm run verify:dist`，13/13 通过）

在**真实发布挂载点** `/playtime-atlas-20261021/works/02-abyss-salvager/` 下起一个临时静态服务器
（跑完自动关闭，不留常驻进程），用真实 headless 浏览器访问生产构建产物：

| # | 断言 | 结果 | 实测值 |
|---|---|---|---|
| 1 | `subpath-boot` | ✅ | `window.__abyss` 存在，title 正确，760 m / 18 节 |
| 2 | `shipped-glb-200` | ✅ | **status 200**，约 9.14 MB，magic `glTF` v2，declared == 实际字节 |
| 3 | `legacy-alias-absent` | ✅ | 旧名 `mech-sandworm-1312m.glb` → **404**（已废弃，刻意验证「只有一份」） |
| 4 | `model-index-200` | ✅ | `models/assets.manifest.json` → 200，且索引内**只列 1 个文件** |
| 5 | `single-glb-in-build` | ✅ | `dist/models/` 内**恰好 1 个** `.glb`：`abyss-salvager-ac-vii.glb` |
| 6 | `download-link-base-relative` | ✅ | `href="./models/abyss-salvager-ac-vii.glb"` → 解析为子路径下正确 URL |
| 7 | `shipped-model-loads-into-scene` | ✅ | `modelSource = "shipped"`，548 网格 / 104,468 面，程序化模型已隐藏 |
| 8 | `shipped-model-interactive` | ✅ | 载入后真实拖拽，相机 `(-1.389, 8.986, 19.443)` → `(-9.567, 13.617, -2.517)` |
| 9 | `no-404-responses` | ✅ | 无（除第 3 项**故意**的旧名探测） |
| 10 | `no-network-failures` | ✅ | 无（详见 §6 缺陷 15：1 条「已 200 完成后」的 Chrome 回执已单独归类） |
| 11 | `no-console-errors` | ✅ | 无（1 条为旧名 404 探测的浏览器资源回声，已单独归类） |
| 12 | `no-exceptions` | ✅ | 无 |
| 13 | `browser-fetched-glb-200` | ✅ | 页面**自身**对随包 GLB 的请求拿到 **200**（证明浏览器在子路径下正确解析 base 相对 URL） |

> 第 2 项的字节级校验放在 **Node 侧**发起，不在页面里再拉一次 9 MB：
> 否则探针会与应用自身的 GLTFLoader 请求同一 URL 竞争，Chrome 取消被取代的重复请求，
> 反而在页面的网络日志里留下一条假的失败。浏览器侧改用第 13 项来证明同一件事。

### 5.2 发布链路离线模拟（`node scripts/simulate-publish.mjs`，全部通过）

在 `/tmp` 下复刻 `14-publish/release/scripts/sync-apps.mjs` + `build.mjs` 对本作品实际会走的每一步
（**不写入 14-publish**，临时目录结束即删）：

| 断言 | 结果 | 实测值 |
|---|---|---|
| 同步后 `apps/` 内无根 `models/` 残留 | ✅ | 根 `models/` 不存在（sync-apps 会先 `rmrf` ALLOW_DIRS 目录） |
| 同步后模型位于 `public/models/` | ✅ | `public/models/abyss-salvager-ac-vii.glb` |
| 同步后无 `dist/`（DENY） | ✅ | 由发布流水线现场构建 |
| `npm run build` 成功 | ✅ | exit 0 |
| build.mjs 的 `models` 补齐步骤 | ✅ | **自动跳过**（`appDir/models` 不存在，模型已随 `public/` 进 `dist`） |
| `outDir/models` 恰好一份 GLB | ✅ | `abyss-salvager-ac-vii.glb` |
| `outDir` 内无 legacy 旧名 | ✅ | `mech-sandworm-1312m.glb` 不存在 |
| `works.json` 声明的 artifact 命中 | ✅ | `works/02-abyss-salvager/models/abyss-salvager-ac-vii.glb` |
| `outDir` GLB 与源文件字节一致 | ✅ | 同源同字节（sha256 一致） |
| 产物**无根绝对路径** | ✅ | none（Pages 子路径下不会 404） |
| 合并后 `manifest.id` | ✅ | `02-abyss-salvager`（与 `works.json` 一致） |

### 5.3 D1 文字重叠自查（`node scripts/check-d1.mjs`）

与批次检测器**同口径**（字形行盒 + 祖先裁剪 + 父链可见性 + 6s 稳定 + 冻结动画），
并且**直接测生产构建 `dist/`**（临时静态服务器，跑完即关），复现与 13 一致的结果。

| 视口 | 修复前命中 | 修复后命中 |
|---|---|---|
| 桌面 1440×900 | **3** | **0** |
| 移动 390×844 | **2** | **0** |

**修复前的 5 条命中与定性**

| 视口 | 命中 | 定性 |
|---|---|---|
| 桌面 | `span.cn「标注」× h2「纵剖面 · 从头到尾」` 90%（431px²） | 左侧工具条里**被滚出可见区**的按钮文字，与底部剖面板标题几何相交 |
| 桌面 | `span.en「SENSING & GRAPPLING」× span.card-en「LONGITUDINAL SECTION」` 60%（1720px²） | 右栏里被滚出可见区的层级行文字，与底部剖面板英文副标题相交 |
| 桌面 | `span.card-en「CROWN SECTION」× a#footer-source「SOURCE」` 71%（620px²） | 右栏被滚出可见区的卡片标题，与页脚链接相交 |
| 移动 | `p.sel-empty「在模型上单击任一构件…」× a#footer-notes「说明与来源」` 55%（650px²） | 右栏被滚出可见区的卡片正文，与页脚链接相交 |
| 移动 | `p.sel-empty … × a#footer-source「SOURCE」` 73%（637px²） | 同上 |

**根因与修法**

1. **3D 场景内的标注**：`src/ui/annotations.js` 增 `reservedRects` 避让
   （候选侧 × 纵向阶梯搜索，**无位则隐藏**而不是压住 HUD），
   隐藏态用 `visibility: hidden` —— 不可见文字不再以 (0,0) 的盒子留在 DOM 里。
   新增断言 `annotation-avoids-visible-text` 做回归守卫。
2. **滚动面板的越界内容**（上述 5 条的共同根因）：
   CSS `overflow:auto` **只裁剪绘制、不改布局坐标**，被滚走的文字盒依然与
   底部剖面板标题、页脚链接在几何上相交。新增 `src/ui/scrollClip.js`：
   把容器可见盒之外、**完全**在外的文字标记为 `visibility:hidden`
   （不影响布局与滚动高度，滚回即恢复）；面板本身 `tabindex="0"`，
   可用方向键滚动，键盘可达性不降。
3. **顺带**：1440×900 下左栏 12 个按钮排不下（需 730px / 可用 660px），
   「标注 / 纵剖 / 剖面」被推到滚动区外 → `@media (max-height: 1000px)` 压缩内边距，
   整条可见、无需滚动。

**上游审计工具实测**

`node 16-design-system/tools/ds-audit-tokens.mjs`（只读）：

```
02-model   🟢   必备缺0 必备值差0 | 全量: 声明 129 缺0 值差0 暗色组20 额外0 | 顺序问题0
```

首轮报「值差 2」：字体族序与规范不符（`-apple-system` 放在了系统 CJK 族之前），
本轮已改为逐字一致，复测值差 0。

### 5.4 WebGL 不可用时的 2D 降级实测（`npm run verify:fallback`，13/13 通过）

此前该路径只有代码分支审查，没有真实触发证据。本轮补上**真机验证**：

- **禁 WebGL 用双保险**：Chrome 启动参数 `--disable-webgl --disable-webgl2 --disable-3d-apis --disable-gpu`
  ＋ `Page.addScriptToEvaluateOnNewDocument` 拦截 `getContext('webgl'|'webgl2'|'experimental-webgl')` 返回 `null`
  —— 等价于显卡驱动根本不给上下文，`three.js` 的 `WebGLRenderer` 必然抛错；
- 测的是**生产构建 `dist/`**（自带临时静态服务器，跑完即关）。

| # | 断言 | 结果 | 实测值 |
|---|---|---|---|
| 1 | `webgl-actually-blocked` | ✅ | `true`（拦截确实生效） |
| 2 | `fallback-panel-shown` | ✅ | 降级面板铺满 **1440×900** |
| 3 | `fallback-not-blank` | ✅ | 可见文字节点 **66** 个，**不白屏** |
| 4 | `fallback-title-visible` | ✅ | 「当前环境不支持 WebGL，已切换为 2D 技术图」 |
| 5 | `fallback-note-has-reason` | ✅ | 「降级原因：Error creating WebGL context.。技术图参数：全长 760 m · 18 驱动体节 · Ø 41.7 m。」 |
| 6 | `fallback-note-has-disclaimer` | ✅ | 含「教学示意，非施工/工程模型」 |
| 7 | `2d-long-section-drawn` | ✅ | 纵剖技术图墨迹占比 **14.0%**（参数与 3D 同源） |
| 8 | `2d-crown-section-drawn` | ✅ | 冠剖面墨迹占比 **5.5%** |
| 9 | `webgl-stage-canvas-not-created` | ✅ | 3D 舞台 canvas **0** 个（WebGL 画布确未创建） |
| 10 | `fallback-canvases-present` | ✅ | **2** 个 2D 技术图画布就位 |
| 11 | `app-chrome-hidden` | ✅ | `body.ui-hidden`，3D 控件层收起 |
| 12 | `no-horizontal-overflow` | ✅ | `scrollWidth 1440 == innerWidth 1440` |
| 13 | `no-unexpected-console-errors` | ✅ | **0**（仅一条预期内的「WebGL unavailable」回声被显式豁免） |

截图留证：`screenshots/20-webgl-fallback.png`。

---

## 6. 迭代记录：实测发现并修复的缺陷

> 全部由浏览器实测发现，非事后推测。每条都经过**修复后重跑全量断言**复验。

| # | 现象 | 根因 | 修复 | 复验 |
|---|---|---|---|---|
| 1 | 视口竖屏时模型被挤出画面、读数与几何对不上 | 机位距离写死；长度标定散落多处 | 机位按宽高比实时解算 + 窄屏更紧取景；长度标定收敛到 `constants.js` 单一真源 | 断言 5 / 12 ✅ |
| 2 | 调整「驱动体节」后模型不重建 | `applyParam` 未把值写回 `state`，重建读到旧值 | 先写 `state` 再分发 | 断言 11 ✅ |
| 3 | GLB 导出失败：`drawImage` 无法读取 DataTexture | GLTFExporter 通过 `drawImage` 取像素，纯 `DataTexture` 没有可绘制源 | 浏览器端改用 `CanvasTexture`（像素完全相同），Node 端仍用 `DataTexture` | 断言 14 / 15 ✅ |
| 4 | `mergeGeometries` 返回 null，部分零件丢失 | 各几何的 indexed 状态与属性集不一致 | `merge()` 统一转 non-indexed 并规整 `position / normal / uv` | 断言 2 ✅（548 网格 / 104,468 面） |
| 5 | 左侧标注被视口左缘裁切（01–04 号文字缺半） | 标注锚点未考虑自身宽度 | 每帧按 `offsetWidth` 夹紧到视口内 | 截图 05 / 08 目视 ✅ |
| 6 | 磨削冠剖面板的 `Ø 41.7 m` 尺寸标注溢出画布底部 | 画布高度 132 px 不足 | 画布 152 px + 剖面半径系数 0.33 → 0.29 | 截图 05 目视 ✅ |
| 7 | 磨削冠的螺旋刀片完全看不见 | 刀片 x 坐标落在冠体圆盘内部，被包住 | 刀片与合金齿前移至 `x = −0.04`，露出盘面 | 截图 05 目视 ✅ |
| 8 | headless 首帧数十秒，CDP evaluate 通道饿死，验收超时 | SwiftShader 软件渲染 + 5 盏额外点光 + 辉光 + 阴影，主线程被长时间占用 | 点光削减到 2 盏（其余靠自发光 + 辉光）；headless 改用真实 GPU（现为 ANGLE Metal） | 全量 15 项 ✅ |
| 9 | 分解断言误报 FAIL（位移量 0） | 断言测的是组节点（本身不动），而非被拆的网格 | 改为测量组内实际网格的位移 | 断言 6 ✅（0.5829） |
| 10 | GLB 校验少报三角面（27,192 vs 104,468） | 校验脚本只统计带 indices 的图元，404 个非索引图元被跳过 | 校验脚本补上非索引图元分支 | GLB 校验输出 104,468 ✅ |
| 11 | headless 报 `bind() failed: Address already in use`，DevTools 永远连不上 | 固定 `--user-data-dir` 让 Chrome 复用残留实例、占住调试端口；且 Chrome 在 IPv4 失败后会回退到 IPv6，而脚本只轮询 `127.0.0.1` | 每轮用 `mkdtemp` 生成唯一 profile（结束即删）；DevTools 探测改为 **IPv4 + IPv6 双栈轮询** | 验收脚本正常启动 ✅ |
| 12 | headless 首帧 `Error creating WebGL context.`（GL renderer = `none`） | 全新 profile 下未显式指定 GL 后端，Chrome 可能拿不到任何可用后端 | 显式加 `--use-angle=metal`（macOS 真实 GPU），并保留 `--ignore-gpu-blocklist` / `--enable-gpu-rasterization` | GL 后端实测 `ANGLE (Apple, ANGLE Metal Renderer: Apple M5)` ✅ |
| 13 | 机器并发负载高时 `Runtime.evaluate` 120 s 超时，整个验收中断 | CDP evaluate 通道被其他 headless 浏览器抢占 GPU 而饿死 | `sendWithRetry()`：首次 120 s、重试 60 s，最多 4 次，**饿死的通道不算断言失败** | 全量断言跑通 ✅ |
| 14 | 随包模型旧名 `mech-sandworm-1312m.glb` 在 `dist/` 与线上路径留下**同名双份歧义** | 早期为迁就外部 QA harness 写死的探测路径保留了一份字节相同的副本 | 随包模型**迁入** `public/models/`（移动而非复制，sha256 已校验一致），旧名彻底删除；子路径实测断言反转为「旧名必须 404」 | 断言 3 / 5 ✅ |
| 15 | 子路径实测报 `no-network-failures: net::ERR_ABORTED`，疑似部署故障 | 探针在页面内又拉了一次**与应用相同**的 9 MB GLB URL，Chrome 取消被取代的重复请求；且用「首个 requestId 匹配」归因 URL 时会串号 | 字节级校验移到 **Node 侧**；浏览器侧改用「页面自身请求拿到 200」来证明；归因改为 requestId→status 映射（已 200 完成的请求不计为失败） | 断言 10 / 13 ✅ |
| 16 | `verify-dist` 偶发「DevTools endpoint never came up」 | 与 §6 缺陷 11 同源：固定 profile + 只轮询 IPv4 | 同样改为每轮唯一 profile + IPv4/IPv6 双栈轮询 | 验收稳定启动 ✅ |
| 17 | 改版后 3D 模型被左栏 / 右栏 / 底部剖面板**压住**，机器看不全 | 相机只按视口取景，不避让 HUD 面板 | `setSafeArea()`：按各面板实际 DOM 矩形解算安全区，模型必须完整落在其中；观察目标同时沿相机轴偏移到安全区中心 | 截图 01 / 04 / 05 目视 ✅ |
| 18 | 全景机位下机器缩成一条看不清的斜线 | 手调 fit 盒比模型实际投影尺寸大约 35% | `setContentBounds()` + `projectedExtents()`：改用模型 Box3 的真实投影尺寸（margin 1.04） | 截图 01 / 11 目视 ✅ |
| 19 | 标注胶囊压住右侧面板标题与顶栏 | 标注只按自身宽度夹紧视口，不避让 HUD | `reservedRects` 避让：候选侧 × 纵向阶梯搜索；**无空位则隐藏**而非压住 HUD | D1 桌面命中 25 → 3 ✅ |
| 20 | 分步组装步进条与节律表 / 纵剖带**重叠** | 步进条做成底部浮层，占了剖面板的位置 | 移入右栏卡片，按 DS `.ds-indicator` 形态落地 | 截图 17 目视 ✅ |
| 21 | 隐藏的标注胶囊仍在 DOM 的 (0,0) 留有文字盒，被 D1 检测器判为**互相压盖** | 隐藏态只设 `opacity: 0`，文字仍参与布局测量 | 隐藏态改用 `visibility: hidden`，不可见文字真正离开布局与无障碍树 | D1 桌面 25 → 3、移动 113 → 2 ✅ |
| 22 | 移动竖屏顶栏换行后压住工具条，遥测被切成「DEP T / TEM D」 | 顶栏多列 flex 未按窄屏收敛 | 顶栏收敛为单行：隐藏品牌图标、只留「深度」读数、标题与按钮 `nowrap`；工具条固定 `top: 76px` | 移动整页截图目视 ✅ |
| 23 | 移动端标注胶囊压住页脚的声明与来源链接 | 页脚未纳入避让清单 | `SAFE_AREA_PROBE_IDS` 增加 `site-footer` | D1 移动 113 → 2 ✅ |
| 24 | 侧栏内容高于视口时最后一行被切掉半行，像渲染错误 | 无滚动提示 | 侧栏加底缘渐隐遮罩 | 截图目视 ✅ |
| 25 | `dist/models/` 混入 macOS 的 `.DS_Store` | `public/` 下的杂项被 Vite 原样复制 | `copy-docs.mjs` 构建后清理 `dist/` 内 `.DS_Store` | 构建产物复查 ✅ |
| 26 | D1 命中 5 处：被滚出可见区的文字与底部剖面板标题 / 页脚链接几何相交 | `overflow:auto` 只裁剪绘制、不改布局坐标；被滚走的文字盒仍在布局里 | 新增 `src/ui/scrollClip.js`：容器可见盒外、且**完全**在外的文字标记 `visibility:hidden`（不影响布局与滚动高度）；面板 `tabindex="0"` 可键盘滚动 | D1 桌面 3→0、移动 2→0 ✅ |
| 27 | 1440×900 下左栏「标注 / 纵剖 / 剖面」被推到滚动区外 | 12 个按钮需 730px，可用高度只有 660px | `@media (max-height: 1000px)` 压缩工具条内边距，整条可见 | 截图目视 ✅ |
| 28 | 标题带 `white-space: nowrap`（违反 G.3 / §7） | 为压住卡片标题换行而加 | 移除 `.card-head h2` 与窄屏 `.brand-text h1` 的 `nowrap`；英文元信息标签 `.card-en` 保留 `nowrap` 但用省略号截断，不会溢出 | 四档视口无横向溢出 ✅ |
| 29 | 上游 token 审计报「值差 2」 | `--ds-font-display` / `--ds-font-text` 的族序把 `-apple-system` 放在系统 CJK 族之前 | 改为与规范逐字一致 | 上游审计 🟢 值差 0 ✅ |
| 30 | 发布模拟在步骤 3 崩 `ENOENT: scandir .../apps/02-abyss-salvager/dist` | 模拟脚本的白名单只抄了 `index.html`，**漏掉第二入口 `notes.html`** → 模拟出的目录里多页构建缺少入口，`vite build` 失败 | 模拟脚本改为与真实 `sync-apps.mjs` L119 同规则（任何非 index 的 `.html` 都同步），并加两条断言：`apps 内含第二入口 notes.html`、`dist/notes.html 存在（多页构建）` | 模拟全部通过 ✅ |
| 31 | 降级页文案里出现字面量 `**程序化 2D 技术图**` | Markdown 记号被直接写进静态 HTML，浏览器原样显示星号 | 改为 `<strong>程序化 2D 技术图</strong>` | 截图 20 目视 ✅ |
| 32 | WebGL 降级路径无实测证据（此前只做代码分支审查） | 本机有可用 GL 后端，默认跑不到降级分支 | 新增 `scripts/check-webgl-fallback.mjs`：Chrome flag + `getContext` 拦截双保险真实禁用 WebGL，测生产构建 `dist/` | 13/13 断言 ✅ |
| 33 | 降级自查首版断言误报（`canvasCount === 2` 判 FAIL） | 页面本就有 3 个 2D 面板 canvas，断言把「总 canvas 数」当成了「WebGL canvas 数」 | 改为按 `#stage canvas`（WebGL 画布宿主容器）判定：舞台 canvas 必须为 0、fallback 两个 2D 画布必须为 2 | 13/13 断言 ✅ |

---

## 7. 手工复核项（自动化之外）

| 检查项 | 结果 |
|---|---|
| 运行期网络请求 | 仅同源静态资源；**无 CDN、无字体下载、无贴图下载、无 API 调用** |
| 外部字体 | **无**。v1.1.0 起随包 3 套自托管 OFL 拉丁字体（构建后为本地 woff2），汉字走系统栈；页面不发起任何外链请求 |
| 外部素材 | 无外部模型 / 图片 / HDR / 音频 |
| 2D 面板 | 全部 Canvas 矢量绘制，无位图 |
| 界面上不存在 2D 图片冒充 3D 的部分 | 视口内只有 WebGL canvas |
| 快捷键 | `H` / `R` / `X` / `E` 均生效；`Esc` 取消构件选中 |
| 响应式 | 竖屏下工具栈转为横向条、参数抽屉收窄、测区图与纵剖带隐藏、顶栏收敛为单行 |
| 教学示意声明 | 三处可见：模型内铭牌 / 说明页 / 导出元数据；受力箭头明确标注为定性说明 |
| 双语标注 | 14 构件中英对照齐备（标注 / 选择面板 / 层级开关 / 说明页 / 导出元数据） |
| WebGL 降级 | **已实测 13/13**（见 §5.4）：真实禁用 WebGL 后切 2D 技术图 + 说明原因，**不白屏**，2D 技术图与 3D 同源 |

---

## 8. 已知限制（诚实记录）

1. **headless 脚本为 macOS 路径**；Windows / Linux 需改 `scripts/capture.mjs` 的 `CHROME` 常量。
2. **移动端未做触控手势优化**（仅响应式布局 + 竖屏取景）；触屏拖拽依赖浏览器默认行为。
3. 移动端右栏为可滚动抽屉，部分卡片（层级开关、磨削冠剖面）需滚动才能看到——为保住 3D 视口面积的有意取舍。
4. `dist/` 使用相对路径 `base: './'`，适合 GitHub Pages **子路径**；域根部署需把 `base` 改为 `'/'`。
5. 参考案例的转发 / 收藏 / 引用 / 浏览数来自第三方公开镜像，**观测时间为 2026-10-21**，不代表当前值（详见 `SOURCE.md` §5）。
6. 本作品**不主张全网第一**；各平台互动指标口径不同，**不可横向比较或求和**。
7. **未随包** 16 的 `noto-sans-sc-subset.woff2`（部分覆盖子集），汉字走系统栈；理由见 `RESTYLE-MAP.md` §2。
8. **运行时语言切换未实现**（本批按要求只产出 zh/en key 清单），中英对照同时呈现。
9. 批次 D1 检测器**不裁剪 `overflow: auto` 容器**内被滚出视野的文字。本项目没有以「检测器盲区」为由搁置，
   而是新增 `src/ui/scrollClip.js` 让越界文字**不参与渲染与度量**（`visibility:hidden`，不改布局与滚动高度），
   从根上把这类几何相交消掉 —— **桌面 3→0、移动 2→0**，且未使用 z-index 掩盖。
   批次检测器（`13-qa-curation`）为只读参考，**未修改**。
10. **WebGL 2D 降级路径已在本轮于 headless 中真实触发并通过 13/13 断言**
    （Chrome flag `--disable-webgl --disable-3d-apis --disable-gpu` ＋ `getContext` 拦截双保险）。
11. 本任务内的验收脚本均为**本地离线回归**（跑 `dist/` 与本地 dev server，不访问公网）；
    面向上线 URL 的浏览、截图与交互验收不在本任务范围，由 `14-publish` 用 Ego 浏览器完成。
