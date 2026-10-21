# QA · 浏览器实测验收记录

> 项目：**《渊甲拾遗者 / ABYSS-CARAPACE SALVAGER》**（任务 02）
> 验收时间：**2026-10-21**
> 验收方式：**headless Google Chrome + CDP（DevTools Protocol）驱动真实交互**
> 被测地址：`http://127.0.0.1:4312/`（`npm run dev`，`strictPort`）
> 原始记录：[`screenshots/qa-results.json`](./screenshots/qa-results.json)
> 复现命令：`npm run capture && npm run verify:glb`

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
PASS 15 / FAIL 0
console error        : []   （0 条）
uncaught exception   : []   （0 条）
```

**全部 15 项断言通过，页面无任何控制台错误与未捕获异常。**

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
| 14 | `glb-export` | ✅ | 9,134,284 bytes，magic `glTF`，文件名 `abyss-salvager-ac-vii-18seg.glb` | 拦截真实 Blob 下载，校验魔数 |
| 15 | `glb-file-written` | ✅ | version 2，declaredLength **= 9,134,284 = 实际字节数** | 头部声明长度与文件长度严格一致，文件已落盘 `models/` |

---

## 4. GLB 产物校验（`npm run verify:glb`）

```
file      : models/abyss-salvager-ac-vii.glb
bytes    : 9134284
magic     : glTF
version  : 2
declared : 9134284          ← 与文件长度一致
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

---

## 5. 截图清单（15 张，1680×1050）

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

---

## 7. 手工复核项（自动化之外）

| 检查项 | 结果 |
|---|---|
| 运行期网络请求 | 仅同源静态资源；**无 CDN、无字体下载、无贴图下载、无 API 调用** |
| 外部字体 | 仅系统字体栈，页面不加载任何字体文件 |
| 外部素材 | 无外部模型 / 图片 / HDR / 音频 |
| 2D 面板 | 全部 Canvas 矢量绘制，无位图 |
| 界面上不存在 2D 图片冒充 3D 的部分 | 视口内只有 WebGL canvas |
| 快捷键 | `H` / `R` / `X` / `E` 均生效 |
| 响应式 | 竖屏下工具栈转为横向条、参数抽屉收窄、测区图与纵剖带隐藏 |

---

## 8. 已知限制（诚实记录）

1. **headless 脚本为 macOS 路径**；Windows / Linux 需改 `scripts/capture.mjs` 的 `CHROME` 常量。
2. **移动端未做触控手势优化**（仅响应式布局 + 竖屏取景）。
3. `dist/` 使用相对路径 `base: './'`，适合 GitHub Pages **子路径**；域根部署需把 `base` 改为 `'/'`。
4. 参考案例的转发 / 收藏 / 引用 / 浏览数来自第三方公开镜像，**观测时间为 2026-10-21**，不代表当前值（详见 `SOURCE.md` §5）。
5. 本作品**不主张全网第一**；各平台互动指标口径不同，**不可横向比较或求和**。
