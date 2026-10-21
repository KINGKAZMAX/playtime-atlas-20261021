# 渊甲拾遗者 · ABYSS-CARAPACE SALVAGER

> **AC-VII** ｜ 深渊热液区甲壳式矿脉采集体
> 一个完全程序化生成的实时 3D 交互模型作品：可旋转缩放、可分解检视、可剖切、可调参数、可导出 GLB。
> **零 CDN、零 API、零外部素材**——所有几何、贴图与 2D 面板均在运行时生成。

---

## 1. 这是什么

一台虚构的深海矿脉采集体，停在一片热液喷口场上，用扁平的螺旋刀片磨削冠啃食玄武岩，
靠 18 节叠瓦甲壳体节的蠕动节律推进，把矿浆收进腹面的矿仓。

| 项 | 值 |
|---|---|
| 全长 | **760 m**（与几何严格一致，由 `constants.js` 单一标定） |
| 体径 | **Ø 41.7 m** |
| 驱动体节 | **18 节**（可调 8–30） |
| 几何量 | **104,468 三角面 · 548 网格对象 · 248,706 顶点 · 9 材质槽 · 4 程序化贴图** |
| 导出 GLB | **9,134,284 bytes**，GLB 2.0（693 nodes / 548 primitives / 8.18 MB BIN） |
| 运行依赖 | `three@0.180.0`、`vite@7.1.5`（均来自 npm） |

### 原创声明

本作品的**交互机制**参考自一个 MiniMax M3.1 Flash 社区 3D 案例（可拖 / 可转 / 可拆的真 3D 机器页），
但**作品名、模型形态、术语文案、字体、配色、布局七项全部重新设计**，属**原创改编**，非复制品。

- 来源与证据链：[`SOURCE.md`](./SOURCE.md)
- 逐项差异对照：[`CHANGELOG.md`](./CHANGELOG.md)
- **不主张「全网第一」**——该结论无法证实，不予声称。

---

## 2. 快速开始

```bash
cd output/flash-showcase-20261021/02-model

npm install --no-audit --no-fund     # 仅 two 个包：three + vite
npm run dev                          # → http://127.0.0.1:4312/
```

> 端口固定 **4312**（`strictPort`）。国内网络建议先设 registry：
> `npm config set registry https://registry.npmmirror.com`

### 构建与预览

```bash
npm run build        # 静态产物 → dist/（base: './'，可直接放 GitHub Pages 子路径）
npm run preview      # 本地预览构建产物，端口 4312
```

### 验收

```bash
npm run capture      # headless Chrome 真实交互验收 → screenshots/*.png + qa-results.json + models/*.glb
npm run verify:glb   # 解析 GLB 容器与 glTF JSON，PASS 才退出 0
node scripts/probe-build.mjs   # 无浏览器几何构建计时探针
```

> `npm run capture` 需要本机 Chrome（macOS 默认路径 `/Applications/Google Chrome.app/...`）；
> 其他系统请改 `scripts/capture.mjs` 顶部的 `CHROME` 常量。

---

## 3. 怎么玩

### 3.1 视角

| 操作 | 效果 |
|---|---|
| 左键拖拽 | 轨道旋转 |
| 滚轮 | 缩放 |
| 右键拖拽 | 平移 |
| 左栏「机位」6 个按钮 | 测绘 / 俯视 / 侧视 / 磨削冠 / 矿仓 / 随行（带缓动过渡） |

机位距离按视口宽高比**实时解算**，竖屏手机与超宽屏都能正确取景。

### 3.2 检视

| 控件 | 说明 |
|---|---|
| **分解** | 0–1 分解滑杆：甲壳板、液压撑、减速组、荧光管、热排口、导流叶、刀片、矿仓沿各自方向炸开 |
| **X 光** | 外壳降到 12% 不透明，内部构件转为青碧自发光 |
| **纵剖 / 冠剖** | 真实裁剪面：沿体轴纵剖 / 磨削冠后横剖 |
| **线框** | 全部材质切线框，验证几何完整性 |
| **标注** | 14 处编号胶囊标注（3D → 屏幕投影，自动避让 + 视口夹紧） |

### 3.3 参数（5 组 21 项，全部实时生效）

| 组 | 参数 |
|---|---|
| 壳体架构 | 驱动体节 8–30 · 体节长度 · 甲壳半径 · 磨削刀片 4–11 · 尾扇叶片 3–8 · 导流叶 2–6 |
| 材质 | 甲壳色 · 荧光色 · 热液色 · 合金粗糙度 · 外壳不透明 · 荧光强度 |
| 节律 | 蠕动节律速率 · 蜿蜒幅度 · 启用节律 |
| 环境 | 主题（深渊实景 / 声呐测绘）· 曝光 · 探照方位角 · 探照高度角 · 海底地形 · 海雪 · 测绘网格 · 辉光 |
| 检视 | 分解 · 剖切位置 · X 光 · 标注 · 线框 |

改节数 / 刀片数 / 尾扇数等结构参数会**实时重建几何**，长度与体径读数随之更新。

### 3.4 快捷键

| 键 | 作用 |
|---|---|
| `H` | 隐藏 / 显示全部界面（纯画面） |
| `R` | 重置所有参数与机位 |
| `X` | 切换 X 光透视 |
| `E` | 切换分解视图 |

### 3.5 导出

点「导出 GLB」→ 浏览器下载 `abyss-salvager-ac-vii-<N>seg.glb`。
导出的是**当前参数下的模型快照**（不含分解位移），可在 Blender / three.js / Babylon.js 中直接打开。

---

## 4. 目录结构

```
02-model/
├─ index.html                  页面骨架
├─ manifest.json               交付清单（id/title/description/entry/buildCommand/outputDir/status）
├─ package.json                仅 three + vite
├─ vite.config.js              端口 4312 / strictPort / base './'
├─ src/
│  ├─ main.js                  装配 · 参数分发 · 剖切 · 导出 · 重置 · 快捷键 · 调试句柄
│  ├─ style.css                深海玻璃拟态 UI（等宽字体主导）
│  ├─ model/
│  │  ├─ constants.js          作品元数据 + 长度标定（唯一真源）
│  │  ├─ params.js             DEFAULTS + SCHEMA（面板由 SCHEMA 自动生成）
│  │  ├─ noise.js              确定性噪声（浏览器与 Node 同源）
│  │  ├─ textures.js           甲壳鳞片 / 拉丝合金 / 玄武岩 / 海雪 / 测绘网格
│  │  ├─ geometry.js           通用构件（merge / 齿轮 / 液压缸 / 导管 / 散热口 / 尾扇 …）
│  │  ├─ abyssal.js            原创构件（螺旋刀片 / 拱形甲壳板 / 气囊 / 矿仓 / 黑烟囱 / 管虫 …）
│  │  └─ harvester.js          机器本体 + 分解 / X 光 / 四拍节律
│  ├─ scene/stage.js           渲染器 · 灯光 · 热液喷口场 · 辉光 · 双主题
│  └─ ui/
│     ├─ cameras.js            6 机位 + 自适应取景
│     ├─ annotations.js        编号胶囊标注
│     ├─ panels2d.js           磨削冠剖面 / 纵剖带 / 等深线测区图
│     └─ controlPanel.js       参数控件
├─ scripts/
│  ├─ capture.mjs              headless Chrome CDP 验收 + 截图 + GLB 落盘
│  ├─ verify-glb.mjs           GLB 2.0 容器校验
│  └─ probe-build.mjs          几何构建计时探针
├─ models/                     abyss-salvager-ac-vii.glb
├─ screenshots/                15 张验收截图 + qa-results.json
└─ dist/                       静态构建产物（交 14-publish 发布）
```

---

## 5. 技术要点

- **全程序化**：没有一张外部图片、没有外部模型、没有外部字体。贴图是逐像素合成的
  `CanvasTexture`（浏览器）/ `DataTexture`（Node，像素完全相同）。
- **真实几何**：全部是 `BufferGeometry`，合并时统一转 non-indexed 并规整
  `position / normal / uv` 属性集。**不存在用 2D 图片冒充 3D 的部分。**
- **剖切是真裁剪**：`renderer.localClippingEnabled` + 逐材质 `clippingPlanes`，不是贴图伪造。
- **导出可用**：GLTFExporter 通过 `drawImage` 读贴图像素，浏览器端必须用 `CanvasTexture`，
  纯 `DataTexture` 会直接导致导出失败——这是踩过的坑，已在代码注释中标注。
- **长度单一真源**：UI 上的「760 m」与几何由 `constants.js` 的
  `MACHINE_UNITS ⇄ MACHINE_METRES` 一处标定，不可能出现数字与模型对不上。

---

## 6. 已知限制

- 移动端做了响应式布局与竖屏取景，但**未做触控手势优化**。
- headless 验收脚本为 macOS 路径，其他系统需改 `CHROME` 常量。
- `dist/` 为相对路径构建，适合 GitHub Pages 子路径；部署到域根需把 `base` 改为 `'/'`。
- 参考案例的转发 / 收藏 / 浏览数来自第三方公开镜像（官方端点不返回这些字段），
  观测时间为 **2026-10-21**，详见 `SOURCE.md` §5。

---

## 7. 文档索引

| 文件 | 内容 |
|---|---|
| [`TASK.md`](./TASK.md) | 任务要求逐条对照 + 技术方案 + 验收标准 |
| [`STATUS.md`](./STATUS.md) | 交付状态、迭代修复记录、质量数据、已知限制 |
| [`SOURCE.md`](./SOURCE.md) | 参考案例一手来源、互动数字与观测时间、归属分层、候选对比、资产许可 |
| [`CHANGELOG.md`](./CHANGELOG.md) | 版本历史 + **七项对照差异说明** + 机制继承表 |
| [`QA.md`](./QA.md) | 浏览器实测记录、15 项断言结果、缺陷修复复验 |
| [`manifest.json`](./manifest.json) | 交付清单 |

---

## 8. 许可

- 本仓库代码与全部程序化资产：随本批交付物提供。
- 依赖：`three`（MIT）、`vite`（MIT）。
- 未使用任何游戏 ROM、商业游戏资源、品牌视觉、第三方模型或贴图。
