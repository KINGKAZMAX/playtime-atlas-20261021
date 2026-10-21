# TASK · 任务 02｜热门 3D 建模案例原创改编

> 目录：`output/flash-showcase-20261021/02-model`
> 端口：**4312**（dev / preview 均 `strictPort`）
> 状态：**已完成**（详见 [`STATUS.md`](./STATUS.md) 与 [`QA.md`](./QA.md)）

---

## 1. 任务原文要点

| # | 要求 | 本任务落实 |
|---|---|---|
| T1 | 联网检索 MiniMax M3.1 Flash 的 3D 建模 / Three.js 热门案例 | 已完成，见 [`SOURCE.md`](./SOURCE.md) |
| T2 | 核验原帖 URL、模型归属、点赞收藏转发等可见数字与观测时间 | 已完成，6 项互动数 + 归属强度分层 + 观测时间 |
| T3 | 读取同级 `00-research/TOP3.md`，如尚无则自行研究 | 已读取（20 KB，研究任务产出），并与独立检索交叉核对 |
| T4 | 选 3D 类最好且证据充分的一个 | 选沙虫案例的**机制**（唯一同时满足 5 项证据条件者） |
| T5 | 写 `SOURCE.md`，**不得假称全网第一** | 已写，明确声明不予声称，并给出不可比口径说明 |
| T6 | 完整重建形体、材质、灯光、场景和交互 | 已完成：原创形体 / 材质 / 灯光 / 场景 / 交互 |
| T7 | 提供可旋转缩放、分解查看或参数编辑、重置、导出 GLB 等**真正功能** | 全部实装并经浏览器实测 |
| T8 | 必须有**真实 3D 几何**和可导出模型，不能以 2D 图片冒充 | 104,468 三角面 / 548 网格 / 248,706 顶点；GLB 9.13 MB |
| T9 | 若未找到 M3.1 归属充分案例，诚实标注候选/原创替代 | 不适用（归属充分），但**已做原创改编**，见 `CHANGELOG.md` |
| T10 | 全部本地资源 / npm 依赖，端口 4312，运行无 CDN / API | 已核实：零外部请求，仅 npm `three` + `vite` |
| T11 | 交付源码、模型文件、TASK.md、STATUS.md、README、QA.md、截图 | 全部产出 |
| T12 | 实际运行浏览器验收导出和交互，自己迭代 | headless Chrome CDP 实测 **15/15 通过**，0 错误 0 异常 |
| T13 | 只写指定目录，不动其他项目和凭据 | 仅写 `02-model`；未触碰任何凭据 |

### 追加要求（`MASTER-UPDATE.md` + 用户最新指令）

| # | 要求 | 落实 |
|---|---|---|
| U1 | 立即读取 `MASTER-UPDATE.md` | 已读（4 条约束全部纳入） |
| U2 | 必须改**作品名、文案、内容、字体、配色、布局、模型形态**，做原创改编 | **七项全部重做**，逐项对照表见 [`CHANGELOG.md`](./CHANGELOG.md) |
| U3 | 持续完成当前任务，不只给计划 | 全程实做，无等待设计确认 |
| U4 | 写出 CHANGELOG 与对照差异说明 | 已写 `CHANGELOG.md`（含七项差异表 + 机制继承表） |
| U5 | 写出构建命令 | 见 [`README.md`](./README.md) §4 与 `manifest.json.buildCommand` |
| U6 | 写出 `manifest.json` | 已写（`id` / `title` / `description` / `entry` / `buildCommand` / `outputDir` / `status`） |
| U7 | 只准备可发布本地产物，由 `14-publish` 统一推送部署 | 已产出 `dist/` 静态包；未上传、未建仓、未打印凭据 |
| U8 | 不上传凭据或无关文件 | `dist/` 仅含站点产物；仓库根有 `.gitignore` 排除 `node_modules` |
| U9 | 保留来源与差异说明，不声称原创参考作品 | `SOURCE.md` + `CHANGELOG.md` 双处声明 |

---

## 2. 技术方案

### 2.1 选型结论

参考案例的**机制**（真 3D / 可拖可转可拆 / 多机位 / X 光 / 剖切 / 四拍节律 / 双语标注 / 导出）被保留；
其**表达**（沙虫造型、米白橙配色、工程图纸版式、沙丘场景）被整体替换。

选型依据（完整证据链见 `SOURCE.md`）：

```
AYi 沙虫   : 一手 URL ✔  作者 handle ✔  互动计数 ✔(6项)  归属自述 ✔  机制可核实 ✔   ← 唯一全中
机械蜜蜂    : 一手 URL ✘  handle ✘  互动计数 ✘           归属间接 ✘               ← 排除
未来卡车    : 并非他人案例（智东西自测）→ 无一手帖、无互动数                          ← 排除
WebGPU 海面 : URL ✔ 计数 ✔ 归属 ✔  但主体为着色器水面，可导出几何薄弱               ← 与 T8 契合度低
```

### 2.2 架构

```
02-model/
├─ index.html                页面骨架（顶栏遥测 / 左工具栈 / 右参数抽屉 / 底部纵剖带）
├─ src/
│  ├─ main.js                装配、参数分发、剖切、GLB 导出、重置、快捷键、调试句柄
│  ├─ style.css              深海玻璃拟态 UI（等宽字体主导）
│  ├─ model/
│  │  ├─ constants.js        作品元数据 + 长度标定（760 m ⇄ 22.6 单位，单一真源）
│  │  ├─ params.js           5 组 21 项参数 + SCHEMA（面板由 SCHEMA 自动生成）
│  │  ├─ noise.js            mulberry32 / value noise / fbm（确定性，浏览器与 Node 同源）
│  │  ├─ textures.js         甲壳鳞片 / 拉丝合金 / 玄武岩 / 海雪 / 测绘网格（像素合成）
│  │  ├─ geometry.js         merge / flangeRing / gear / hydraulicRam / conduit / vent / fin
│  │  ├─ abyssal.js          原创构件：螺旋刀片 / 拱形甲壳板 / 导流叶 / 吸盘 / 气囊 / 矿仓 / 海底 / 黑烟囱 / 管虫
│  │  └─ harvester.js        机器本体（头部 + 18 体节 + 尾部）+ 分解 / X 光 / 四拍节律
│  ├─ scene/stage.js         渲染器 / 灯光 / 热液喷口场 / 海雪 / 辉光 / 双主题
│  └─ ui/
│     ├─ cameras.js          6 机位 + 按宽高比自适应解算距离
│     ├─ annotations.js      编号胶囊标注（3D→屏幕投影、自动避让、视口夹紧）
│     ├─ panels2d.js         磨削冠剖面 / 纵剖带 / 等深线测区图（Canvas 矢量）
│     └─ controlPanel.js     由 SCHEMA 自动生成的参数控件
├─ scripts/
│  ├─ capture.mjs            headless Chrome CDP 交互验收 + 15 张截图 + GLB 落盘
│  ├─ verify-glb.mjs         GLB 2.0 容器与 glTF JSON 校验
│  └─ probe-build.mjs        无浏览器几何构建计时探针
├─ models/                   导出的 GLB
├─ screenshots/              验收截图 + qa-results.json
└─ dist/                     静态构建产物（交 14-publish）
```

### 2.3 关键实现决策

| 决策 | 理由 |
|---|---|
| 长度标定只走 `constants.js`（`MACHINE_UNITS=22.6` ⇄ `760 m`） | UI 读数与几何永远一致，不会出现「数字与模型对不上」 |
| 贴图在浏览器用 `CanvasTexture`、Node 用 `DataTexture`，像素完全相同 | GLTFExporter 通过 `drawImage` 读像素，纯 DataTexture 会导致导出失败 |
| `merge()` 统一转 non-indexed 并规整 position/normal/uv | `mergeGeometries` 要求属性集完全一致 |
| 分解视图对**每个 mesh** 单独施加径向 + 轴向位移 | 组节点本身不动，拆的是零件，不是整节 |
| 6 盏点光削减到 2 盏（其余靠自发光 + 辉光） | 每盏点光都是全屏逐片元成本 |
| 剖切用 `renderer.localClippingEnabled` + 逐材质 `clippingPlanes` | 真实裁剪，非贴图伪造 |
| 标注每帧按 `offsetWidth` 夹紧到视口内 | 早期版本左侧标注越界被裁切（已修） |

---

## 3. 验收标准（DoD）

- [x] 一手来源可核验：URL / handle / 互动数 / 归属 / 观测时间齐备，且不假称全网第一
- [x] 原创改编七项（作品名 / 文案 / 内容 / 字体 / 配色 / 布局 / 模型形态）全部重做
- [x] 真实 3D 几何：> 10 万三角面，网格对象 > 500
- [x] 可导出 GLB：容器合法、含真实几何、可被 `verify-glb.mjs` 解析
- [x] 交互全部实装：轨道缩放 / 6 机位 / 分解 / X 光 / 双模式剖切 / 参数编辑 / 重置 / 导出
- [x] 运行期零 CDN、零 API、零外部字体/贴图/模型
- [x] 浏览器实测 15/15 通过，console error 与 exception 均为空
- [x] 交付源码 / 模型 / TASK.md / STATUS.md / README.md / QA.md / CHANGELOG.md / SOURCE.md / manifest.json / 截图
- [x] 可静态构建，产物交由 14-publish 统一发布（未自行上传、未建仓）
