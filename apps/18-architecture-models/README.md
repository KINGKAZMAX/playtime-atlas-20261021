# 榫构华夏 · Timber Craft Lab

> 中国传统建筑结构 · 可拆解 3D 教学模型
> Explorable 3D structural models of Chinese traditional architecture

六件中国传统建筑结构的三维教学模型：可以**旋转、缩放、点选构件、爆炸拆解、分步组装、剖切、
按层开关、显示定性受力箭头**，并把任意一件模型的真实几何导出为 `.glb`。

全部几何由代码**程序化生成** —— 仓库内没有任何图片、模型或音频文件，
字体为自托管 OFL，运行时不发出任何外部网络请求，可直接静态部署到 GitHub Pages 子路径。

> ⚠️ **示意模型声明**
> 本目录六件模型**全部是程序化生成的示意模型**，**非测绘级复原**；
> **材质与比例为教学表达，非考古数据**，也不得用作施工或工程依据。
> 受力箭头为**定性说明，非工程计算**。
> 该声明同时出现在 **① 3D 场景内标牌、② 模型说明页、③ 导出物（GLB）元数据** 三处，
> 并写入机器可读清单 `models/index.json`。

---

## 六件模型

| # | id | 中文名 | English | 构件数 | 层级 | 受力箭头 | 教学点 |
|---|----|--------|----------|-------|------|---------|--------|
| 1 | `dougong` | 斗栱组 | Dougong Bracket Set | 16 | 5 | 7 | 清式单翘单昂五踩柱头科：层叠出跳、荷载分级传递 |
| 2 | `mortise` | 榫卯连接 | Mortise & Tenon Joints | 9 | 4 | 5 | 燕尾榫 / 透榫 / 半榫 / 馒头榫：无钉可拆可逆 |
| 3 | `taoliang` | 抬梁木架 | Post-and-Beam Frame | 18 | 5 | 6 | 梁架层层抬升：柱承梁、梁承檩 |
| 4 | `chuandou` | 穿斗木架 | Column-and-Tie Frame | 15 | 4 | 6 | 密柱承檩、穿枋拉结：柱承檩 |
| 5 | `stone-arch` | 敞肩石拱桥 | Open-Shoulder Stone Arch Bridge | 17 | 6 | 7 | 单孔坦弧、28 道并列券、敞肩减重泄洪 |
| 6 | `tulou` | 土楼 · 院落结构 | Tulou & Courtyard Section | 19 | 6 | 6 | 夯土承重墙渐收、楼中有楼、环形防御 |

每件模型的构件名、作用说明与构造表述均**引用自 17-architecture-research 的史料目录**
（`catalog.json`），条目 id 与出处写在界面「史实参照」与 GLB 导出元数据中。

---

## 模型清单（机器可读）

**`models/index.json`** —— 供 `19-architecture-atlas` 与 `13-qa-curation` 直接消费。
由 `node scripts/build-model-index.mjs` 生成（直接 import 六个模型描述符，与源码**同源**，不会漂移）。

每条含：`id` / `title` / `pinyin` / `subtitle` / `summary` / `era` / `region` / `scaleNote` /
`source`（源文件路径）/ `counts`（部件数·层级数·箭头数·构件族数）/ `families` /
`layers`（层级 id·标签·默认可见性）/ `bbox` / `scale`（单位约定）/
`export`（格式 `glb`·运行时生成·实测字节数·元数据落点）/ `catalogRefs`（史实参照）。

顶层另含：`conventions`（坐标系与枚举）、`contract`（契约与接口文档路径）、
`usage`（消费方式）、`disclaimer` / `forceArrowsNote`（中英双语声明）。

| id | 部件 | 层级 | 箭头 | GLB 实测 |
|---|---|---|---|---|
| `dougong` | 16 | 5 | 7 | 269.9 KB |
| `mortise` | 9 | 4 | 5 | 52.0 KB |
| `taoliang` | 18 | 5 | 6 | 209.7 KB |
| `chuandou` | 15 | 4 | 6 | 223.2 KB |
| `stone-arch` | 17 | 6 | 7 | 1282.2 KB |
| `tulou` | 19 | 6 | 6 | 850.3 KB |

> GLB 由浏览器内实时生成，**仓库内不预生成 `.glb` 文件**；上表体积为 Chromium / three r169 实测值，
> `qa/qa.mjs` 每次验收会重新实测比对，偏差即判失败。

---

## 坐标系与单位约定

| 项 | 约定 |
|---|---|
| 坐标系统 | three.js 右手系，**Y 轴向上** |
| X | **面阔**方向（栱 / 檩 / 椽沿此向） |
| Z | **进深**方向（翘 / 昂 / 枋沿此向，**+Z 为檐外**） |
| Y | 竖直向上 |
| 构件族 `family` | `wood` · `stone` · `earth` · `tile` · `water` · `other` |
| 受力类型 `kind` | `load` 竖向压力 · `thrust` 水平推力 · `reaction` 地基反力 · `tension` 拉结 · `seismic` 地震动 · `flow` 水流 |
| 装配次序 `order` | 0 起升序，先下后上、先柱后梁 |
| 单位 | 斗栱 / 榫卯 / 木架：**1 单位 = 1 示意单位**（斗栱以斗口 d = 0.2 为基本模数）；石拱桥 / 土楼：**1 单位 = 4 m**（按真实尺寸建模后统一缩放） |

---

## 渲染与拾取方式

| 环节 | 做法 |
|---|---|
| 渲染 | `THREE.WebGLRenderer`（WebGL2，`antialias` + `preserveDrawingBuffer`）+ `OrbitControls`（阻尼 0.075，极角 ≤ 0.52π） |
| 光照 | 半球光 + 主平行光（2048² 软阴影）+ 冷补光 + 轮廓光；地面为 `ShadowMaterial` 承接阴影 |
| 拾取 | 指针事件 → `Raycaster` 命中 `userData.partId`；`pointermove` 悬停切换光标 |
| 高亮 | 选中构件换用克隆材质（强调色自发光）+ `Box3Helper` 包围框（`depthTest: false`） |
| 剖切 | 材质级裁剪（`localClippingEnabled` + 单个 `THREE.Plane`），沿 X / Z / Y 滑动 |
| 爆炸 / 组装 | 统一在 `applyTransforms()` 内按 `explode` 方向向量 × 包围球半径 × 0.85 计算位移 |
| 取景 | `setViewOffset` 按容器与面板 / 侧栏的**实际矩形**计算可见区中心，模型不被面板遮挡 |
| 降级 | 无 WebGL 时由 `renderFallbackSVG()` 用**同一套真实几何**生成 SVG 示意图 |

---

## 快速开始

```bash
npm install
npm run build     # 产出 dist/（可直接静态部署）
npm run preview   # 本地预览 http://127.0.0.1:4318
npm run dev       # 开发模式
npm run qa        # 自动化验收（需先起 preview）
```

部署：`dist/` 为纯静态产物，`base: './'` 使用相对路径，
放在 GitHub Pages 的任意子路径（如 `/repo/18-architecture-models/`）均可直接打开。

---

## 交互

| 操作 | 说明 |
|---|---|
| 拖拽 / 滚轮 / 右键拖拽 | 旋转 · 缩放 · 平移 |
| 点击构件 | 高亮 + 包围框 + 双语说明卡（中文名 / 拼音 / 英文名 / 一句作用） |
| **爆炸拆解** 滑杆 | 沿各构件的构造轴向连续散开 |
| **分步组装** | `‹` `›` 逐步回放构件就位，或按「播放」自动演示 |
| **剖切** | 沿 X / Z / Y 的移动平面切割模型（材质级裁剪） |
| **层级开关** | 按构件族显示 / 隐藏（屋面层在两件木架模型中默认隐藏，便于先看构架） |
| **结构受力示意** | 定性箭头：`load` 竖向压力 · `thrust` 水平推力 · `reaction` 地基反力 · `tension` 拉结 · `flow` 水流 |
| **标注** | 关键构件在模型中直接标出**中英双语**名称；点击标注即选中该构件 |
| **导出 GLB** | 把当前模型的真实网格导出为 `.glb`（每个构件独立 mesh，保留中英文名与教学示意元数据） |
| **复位视角 / 自动旋转** | 回到模型默认机位 / 缓慢环绕 |
| `Esc` | 关闭构件说明卡 |

---

## 统一模型接口

核心只认一份契约，因此 `19-architecture-atlas` 可直接消费本目录的模型。
契约见 [`docs/MODEL-CONTRACT.md`](docs/MODEL-CONTRACT.md)，
**给 19 号的稳定交付说明**见 [`docs/DELIVERY-HANDOFF.md`](docs/DELIVERY-HANDOFF.md)。

```js
// 每个模型文件导出一个对象
export default {
  id: 'dougong',
  title: { zh: '斗栱组', en: 'Dougong Bracket Set' },
  pinyin: 'dou gong zu',
  subtitle: {...}, summary: {...}, loadPath: {...}, era: {...}, region: {...},
  scaleNote: { zh: '教学示意，非施工/工程模型；…', en: 'Teaching diagram — not a construction or engineering model; …' },
  catalogRefs: [{ id: 'c01-nanchan-main-hall', name: { zh: '南禅寺大殿', en: '…' },
                  source: '17-architecture-research/catalog.json · c01-nanchan-main-hall' }],
  camera: { position: [x, y, z], target: [x, y, z] },
  layers: [{ id: 'gong', label: { zh: '栱', en: 'Gong Arms' }, defaultVisible: true }],
  build(materials) {
    return {
      group,                       // THREE.Group，构件为其直接子对象
      parts: [{
        id: 'zuo-dou', name: { zh: '坐斗', en: 'Great Block' }, pinyin: 'zuo dou',
        role: { zh: '…', en: '…' }, layer: 'dou', family: 'wood',
        object, explode: new THREE.Vector3(0, -1, 0), order: 2,
      }],
      forces: [{ id: '…', from: [x,y,z], to: [x,y,z], label: { zh, en }, kind: 'load' }],
    };
  },
};
```

运行时暴露同一套接口（便于主站直接驱动）：

```js
window.TimberCraftLab.models();            // 全部模型的元信息（含 catalogRefs）
window.TimberCraftLab.getModel(id);
window.TimberCraftLab.buildModel(id);      // 返回 { group, parts, forces }
window.TimberCraftLab.loadModel(id);       // 切换到某件模型
window.TimberCraftLab.selectPart(id);      // 选中构件并打开说明卡
window.TimberCraftLab.exportGLBBuffer(id); // 直接取 GLB ArrayBuffer（不触发下载）
window.TimberCraftLab.exportMetadata(id);  // 取导出物元数据（教学示意声明等）
window.TimberCraftLab.exportGLB(id);       // 导出并下载 .glb
window.TimberCraftLab.setLang('zh');
```

---

## 交接形态：19 号如何消费本目录的模型

**明确采用 (a)：19 号直接消费 18 号的 3D 模型。** 本目录是 3D 模型的**唯一来源**。

> ⚠️ 形态差异声明
> 19 号 `src/art/schematic.js` 中的自绘 2D 图形（如 `dougongGlyph` / `taoliang` / `chuandou` /
> `mortise-tenon` 等）**不是**本目录模型的替代实现，而是 19 号为目录浏览 / 卡片封面准备的
> **轻量插画层**，不承载可拆解交互。二者的模型来源与形态差异应在 19 与 18 两侧互相声明，
> 避免读者误以为二者是同一实现。**3D 交互的唯一真源是 18 号。**

### 依赖方式（16—19 为各自独立目录，非 monorepo 单包）

因此**不能**用 npm 互相依赖。可选路径按优先级：

| 方式 | 做法 | 适用 |
|---|---|---|
| **① 构建期拷贝源码（推荐）** | 把 `src/core/`、`src/models/`、`fonts/` 拷入 19 号，`import` 模型描述符并调用 `registerModel()`，再挂 `Viewer` | 19 号要提供完整可拆解交互 |
| **② 取预导出 GLB** | 运行 `scripts/build-model-index.mjs` 后用 `exportGLBBuffer(id)` 逐件导出 GLB，19 号用任意 glTF 查看器加载 | 19 号主站不打算引入 three.js |
| ③ 运行时调用 | 19 号 iframe / 链接本目录的 `dist/`，用 `window.TimberCraftLab` 驱动 | 19 号只做链接跳转 |

> **不采用**「19 号保留自绘 2D 示意、18 号独立展示」这一形态：那样 19 号的「可玩结构模块」
> 与 18 号的模型会长期分叉，验收时无法判定 3D 交互是否达标。

### 19 号接入清单

1. 读 `models/index.json` 取得六件模型的 id / 部件数 / 层级 / 史实参照 / GLB 体积；
2. 按 §「统一模型接口」挂载模型（方式 ①）或取 GLB（方式 ②）；
3. 案例页必须展示 `models/index.json` 中的 `disclaimer` 与 `forceArrowsNote`；
4. 3D 视口的 HUD / 面板 / 标注样式沿用 16 号的 `--ds-*` 令牌（见 `src/ui/tokens.css`），保证全站一致。

详见 [`docs/DELIVERY-HANDOFF.md`](docs/DELIVERY-HANDOFF.md)。

---

```
18-architecture-models/
├── index.html                 入口
├── vite.config.js             base:'./' 适配 Pages 子路径
├── package.json
├── docs/
│   ├── REFERENCE-AUDIT.md     olek.si 实测记录（来源 / 截图 / 观测时间 / 差异）
│   ├── MODEL-CONTRACT.md      统一模型接口契约 v1.1
│   ├── DELIVERY-HANDOFF.md    给 19 号的稳定交付说明（接口 / 入口 / 产物 / 元数据）
│   └── reference/             参考站取证截图（不进入构建产物）
├── models/
│   └── index.json             机器可读模型清单（19 / 13 消费）
├── scripts/
│   ├── build-model-index.mjs  生成 models/index.json
│   └── start.sh               本地预览
├── fonts/                     自托管 OFL 字体（含许可原文）
├── src/
│   ├── main.js                应用编排与公开接口
│   ├── core/
│   │   ├── geo.js             程序化几何工具箱（斗 / 栱 / 昂 / 拱圈 / 夯土墙 …）
│   │   ├── materials.js       色板与材质
│   │   ├── model-api.js       统一模型接口 + 契约校验
│   │   ├── viewer.js          渲染器 / 拾取 / 剖切 / 爆炸 / 组装 / 受力箭头
│   │   ├── annotations.js     场景内双语标注层
│   │   ├── glb.js             GLB 导出 + 教学示意元数据
│   │   ├── fallback.js        2D 降级示意图（由同一套真实几何生成）
│   │   └── i18n.js            中英文案
│   ├── models/                六件模型
│   └── ui/
│       ├── tokens.css         16-design-system 的 --ds-* 令牌落地（含出处标注）
│       ├── styles.css         界面样式
│       ├── shell.js           外壳（索引栏 / 标题 / 圆点 / 封面）
│       ├── panel.js           控制面板
│       └── inspector.js       构件说明卡
├── qa/qa.mjs                  自动化验收脚本
├── screenshots/               实拍截图
├── qa-report.md / .json       验收报告
├── SOURCES-LICENSES.md        来源与许可（合并权威版）
├── SOURCES.md / LICENSES.md   原始分文件（存档）
└── manifest.json
```

---

## 设计系统与视觉语言

- 界面令牌取自 **16-design-system** 的 `design-tokens.json`，在本目录
  `src/ui/tokens.css` 逐组落地并注明依据小节；**不复制 16 的规范文件本身**。
- **与 16 号规范 v1.0.1 逐名逐值零差异**（129 / 129）：令牌齐备、取值一致、命名收敛，
  仅保留 3 项已登记的非静默扩展（`--ds-w-cjk-display`、`--ds-w-cjk-body`、`--ds-z-debug`）。
- **字体栈顺序**（§2.0.1 / §5.3）：系统 CJK 栈在前、`Noto Sans SC` **子集**在后 ——
  覆盖完整的族优先，避免同一段文字混入两套字形与基线；**调序而非删子集**，保留系统栈不可用时的兜底。
- **部署基址**：`--ds-base` 由构建期 `import.meta.env.BASE_URL` 注入（实测 `"./"`），
  适配任意 Pages 子路径，**不写死** `/playtime-atlas-20261021/`。
- **中文排版**：`:lang(zh)` 字距归零、正文行高 1.85、标题 1.22、
  `word-break: normal` + `overflow-wrap: anywhere`。
- **语言标记**：每页提供 `hreflang="zh-CN" / "en" / "x-default"`，指向 `?lang=` 版本；
  `?lang=zh` 直接打开即中文态，界面切换语言时 URL 同步回写。
- 视觉语言取自对 https://olek.si 的**实际浏览取证**（排版层级、留白节奏、
  大圆角浅灰卡片、左侧索引短划线、底部圆点指示器）；
  作品名、文案、配色细节与全部 3D 模型均为**原创**，未使用其字体文件、图片或品牌资产。
- 字体为自托管 OFL（Space Grotesk / Inter / Space Mono / Noto Sans SC 子集），
  随包附许可原文并登记进 [`LICENSES.md`](LICENSES.md)；中文优先走系统字体栈。
- **图解规范**（§9.4）：降级插图用 `.ds-diagram` 容器 + `.ds-diagram__fill` / `__stroke` / `__dim`，
  构件族以单一 jade 色阶区分（不另立色板）。

---

## 无障碍与降级

- **双语**：英文默认，左下角一键切中文；所有文案、构件名、作用说明、场景内标注均双语。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时关闭过渡与自动旋转。
- **键盘**：可聚焦控件 42 个；提供跳转链接；所有按钮具备可访问名称。
- **触摸目标**（WCAG 2.2）：全部可交互元素命中区 **≥24px**（AA，硬性）；
  主控件（封面 CTA、导航轴项、工具钮）**≥44px**（AAA）；面板内次级操作走紧凑变体 `.btn--sm`。
- **2D 降级**：WebGL 不可用时，自动切换到由**同一套真实几何**投影生成的 SVG 示意图，
  构件轮廓与三维模型一致，不是另画的示意图；**标出主要构件名称**（贪心避让 + 引出线）；
  降级路径同样显示教学示意声明。
- **零外部请求**：构建产物中无 CDN 引用，运行时外部请求数为 0（已由验收脚本断言）。

---

## 验收

`npm run qa` → **125 项断言全部通过**（Chromium / Playwright），详见
[`QA.md`](QA.md) 与 [`qa-report.md`](qa-report.md)。

覆盖：启动与外壳、6 件模型逐一装载与渲染、爆炸拆解、分步组装、剖切、层级开关、
受力箭头、构件拾取、场景内双语标注（含互不压叠）、复位视角、自动旋转、双语切换与
`:lang(zh)` 排版六项、教学示意声明三处落点（含 GLB 二进制解析与容器结构校验）、
史实参照与 17 catalog 的交叉核对、GLB 导出与二进制校验、
改版一致性（令牌落地 / 旧色板清零 / 自托管字体 / 零外部域名 / 零绝对根路径）、
**16 号规范 v1.0.1 复核十二项**（令牌逐名逐值 / 字体栈顺序 / `--ds-base` / `hreflang` /
触摸目标两档 / 子路径字体 200 / §9.4 图解类名）、
零外部请求、控制台无报错、reduced-motion、2D 降级、Pages 子路径部署、移动端布局。

目视复核（3D 主视图 / 中文态 / 标注避让）由 **ego-browser** 拍摄，见 `screenshots/ego-*.png`。

---

## 来源与许可

- **合并权威版**：[`SOURCES-LICENSES.md`](SOURCES-LICENSES.md)
  （构造知识来源、17 catalog 交叉引用、视觉参考、设计系统引用、事实不确定度、许可与资产清单）
- 原始分文件（存档）：[`SOURCES.md`](SOURCES.md) · [`LICENSES.md`](LICENSES.md)
- 参考站实测记录：[`docs/REFERENCE-AUDIT.md`](docs/REFERENCE-AUDIT.md)
- 许可：MIT（`three` 与 `vite` 亦为 MIT；字体为 OFL 1.1）
