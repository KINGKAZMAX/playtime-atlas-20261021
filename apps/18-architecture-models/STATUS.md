# STATUS · 18-architecture-models

> 榫构华夏 · Timber Craft Lab —— 中国传统建筑结构可拆解 3D 教学模型
> 任务：18 ｜ 唯一作者：MiniMax Code（M3.1-Flash / max）｜ 最后更新：2026-10-21（改版轮）

---

## 一句话状态

**已完成并可部署交付。** 6 件可拆解 3D 教学模型、完整交互、场景内双语标注、中英双语、
2D 降级、带教学示意元数据的 GLB 导出、静态构建产物与 **90 项**自动化验收全部通过；
本目录**不含**任何 GitHub 同步与 Pages 上线动作（由 `14-publish` 统一负责）。

本轮（15-supervisor 改版派发）新增：按 **16-design-system** 做增量改版、
按 **17-architecture-research** 做史实交叉引用、
落实「教学示意，非施工/工程模型」的**三处落点**、新增
[`SOURCES-LICENSES.md`](SOURCES-LICENSES.md) 与
[`docs/DELIVERY-HANDOFF.md`](docs/DELIVERY-HANDOFF.md)。

---

## 进度总览

| 交付项 | 状态 | 位置 |
|---|---|---|
| 任务说明 | ✅ | `TASK.md` |
| 统一模型接口契约 | ✅ v1.1 | `docs/MODEL-CONTRACT.md` |
| **给 19 号的稳定交付说明** | ✅ | `docs/DELIVERY-HANDOFF.md` |
| 参考站实测记录 | ✅ | `docs/REFERENCE-AUDIT.md` + `docs/reference/*.png` |
| **设计令牌落地（16 的 `--ds-*`）** | ✅ **与 16 号逐名逐值零差异**（129/129） | `src/ui/tokens.css`（逐组注明依据小节） |
| **自托管 OFL 字体** | ✅ 5 个字体 + 许可原文 | `fonts/`（许可登记见 `LICENSES.md` §3.2） |
| 核心（几何 / 材质 / 接口 / 渲染器 / 标注 / i18n / GLB / 降级） | ✅ | `src/core/` |
| 六件 3D 模型 | ✅ | `src/models/` |
| UI 外壳（索引栏 / 面板 / 构件卡 / 封面） | ✅ | `src/ui/` |
| 静态构建产物 | ✅ | `dist/`（9 个文件，含 5 个 woff2） |
| 自动化验收脚本 | ✅ **125 项断言全通过** | `qa/qa.mjs` |
| 验收报告 | ✅ | `QA.md`、`qa-report.md`、`qa-report.json` |
| 实拍截图 | ✅ | `screenshots/`（18 张脚本实拍 + 4 张 Ego 复核） |
| **来源与许可（合并权威版）** | ✅ | `SOURCES-LICENSES.md`（`SOURCES.md` / `LICENSES.md` 保留存档） |
| **机器可读模型清单** | ✅ | `models/index.json`（生成器 `scripts/build-model-index.mjs`） |
| 交付清单 | ✅ | `manifest.json` |

---

## 六件模型完成度

| id | 模型 | 构件 | 层级 | 受力箭头 | 契约校验 | 史实参照（17 catalog） | 说明文字 |
|---|---|---|---|---|---|---|---|
| `dougong` | 斗栱组 | 16 | 5 | 7 | ✅ 通过 | `c01` / `c02` / `c09` | 清式单翘单昂五踩柱头科；正心瓜栱/万栱、外檐瓜栱/万栱、厢栱、十八斗、翘、昂、耍头、蚂蚱头、正心枋、挑檐枋、檐椽、坐斗、柱、柱础 |
| `mortise` | 榫卯连接 | 9 | 4 | 5 | ✅ 通过 | `c02` / `c25` / `c40` | 燕尾榫（榫头在平面呈梯形）、透榫（露头）、半榫（阶梯咬合）、馒头榫（圆榫入海眼）；卯口用 `Shape.holes` 精确开凿 |
| `taoliang` | 抬梁木架 | 18 | 5 | 6 | ✅ 通过 | `c01` / `c07` / `c23` | 大梁/二梁/三架梁层层抬升、瓜柱与脊瓜柱、叉手、举架抬高的檩、檐枋、椽；屋面层默认隐藏以先见构架 |
| `chuandou` | 穿斗木架 | 15 | 4 | 6 | ✅ 通过 | `c15` / `c16` / `c19` | 沿进深密排立柱、穿枋横向贯穿拉结、每檩下有柱、屋面层默认隐藏 |
| `stone-arch` | 敞肩石拱桥 | 17 | 6 | 7 | ✅ 通过 | `c30` / `c41` | 单孔坦弧（净跨 37.02 m / 拱高 7.25 m，比约 1:5）、28 道并列券的可视表达、两侧各两孔敞肩小拱、拱上填石开洞、桥台与辇道、栏板望柱、水面 |
| `tulou` | 土楼 · 院落结构 | 19 | 6 | 6 | ✅ 通过 | `c17` / `c42` | 圆楼 180° 剖面；夯土外墙自底 1–2 m 向上收至 0.4–0.8 m；石砌墙基、墙骨杉木、木构楼板与柱、环廊、天井、祖堂、大门、枪眼、谷仓 |

> 全部 6 件模型均通过 `validateModel()` 与 `validateBuild()` 的**契约校验**（字段完整性、
> 层级声明一致、`object` 为 `group` 直接子对象、`explode` 非零、受力箭头 kind 合法、
> `catalogRefs` 完整且 id 在 17 catalog 中命中）。

---

## 交互完成度（逐项对照任务书）

| 要求 | 状态 | 实现位置 |
|---|---|---|
| 可旋转缩放 | ✅ | `src/core/viewer.js`（OrbitControls + 阻尼） |
| 构件选择 | ✅ | 射线拾取 → 高亮 + 包围框 + 双语说明卡（中文名 / 拼音 / 英文名 / 一句作用） |
| 爆炸拆解 | ✅ | 滑杆 0–100%，沿各构件声明的构造轴向连续散开 |
| 分步组装 | ✅ | `‹` `›` 逐步 + 「播放」自动演示；`order` 表达真实装配次序 |
| 剖切 | ✅ | X / Z / Y 三向移动平面，材质级裁剪（`localClippingEnabled`） |
| 层级开关 | ✅ | 按构件族显示/隐藏；支持 `defaultVisible`（屋面层在两件木架模型中默认隐藏） |
| **双语标注** | ✅ | 场景内关键构件**中英双语同屏**标注（`src/core/annotations.js`），点击标注即选中；面板说明卡双语；英文默认 |
| 结构受力示意 | ✅ | 定性箭头 5 类（load / thrust / reaction / tension / flow），共 37 支 |
| 真实几何导出 GLB | ✅ | `src/core/glb.js`（GLTFExporter，binary），每个构件独立 mesh 并写入中英文名**与教学示意元数据** |
| 本地 Web 预览 | ✅ | `npm run preview` → http://127.0.0.1:4318 |
| 可用降级插图 | ✅ | `src/core/fallback.js`：WebGL 不可用时，用**同一套真实几何**投影生成 SVG 示意图（含构件族图例） |
| **教学边界标注（三处）** | ✅ | ① 3D 场景内画布 HUD 标牌 ② 模型说明页 `.disclaimer` 块 ③ GLB 元数据 `asset.extras` / 根节点 `extras` / `scenes[0].extras` |
| **受力箭头定性标注** | ✅ | 面板「结构受力示意」说明 + 场景内标牌（受力开启时出现）+ GLB 元数据 `forceArrows`；三处均中英双语 |

---

## 改版轮（15-supervisor 派发）执行记录

### 交接形态：19 号直接消费 18 号的 3D 模型（形态 a）

**已明确采用 (a)。** 18 号是 3D 模型的**唯一来源**。

> ⚠️ **形态差异声明**：19 号 `src/art/schematic.js` 的自绘 2D 图形（`dougongGlyph` / `taoliang` /
> `chuandou` / `mortise-tenon` 等）是 19 号为目录浏览 / 封面准备的**轻量插画层**，
> **不是**本目录模型的替代实现，不承载可拆解交互。**3D 交互的唯一真源是 18 号。**
> 本声明已写入 18 的 README 与 `docs/DELIVERY-HANDOFF.md`；**镜像声明需由 19 号写入自身文档**
> （本目录无权改动 19 号）。

**依赖方式**：16—19 为各自独立目录，**非 monorepo 单包**，因此不能用 npm 互相依赖。
首选**构建期拷贝源码**（`src/core/` + `src/models/` + `fonts/` → `registerModel()` → 挂 `Viewer`）；
备选**取预导出 GLB**（`exportGLBBuffer(id)`）；再次为**运行时 iframe / 链接**本目录 `dist/`。
不采用「19 号保留自绘 2D、18 号独立展示」形态 —— 那会使 19 的可玩模块与 18 的模型长期分叉，
13 号的 3D 交互验收将无法判定是否达标。

### 依据

- `15-supervisor/RESTYLE-SPEC.md`（统一改版口径、硬性要求、职责边界）
- `16-design-system/design-tokens.json` + `DESIGN-SPEC.md` + `src/tokens.css`（样式与组件的**唯一取值来源**）
- `16-design-system/MIGRATION-NOTES.md` §2.4（本目录的逐变量迁移表）
- `17-architecture-research/catalog.json`（史实交叉引用）

### 落地内容

| 项 | 做法 | 位置 |
|---|---|---|
| 设计令牌 | 把 16 的 `--ds-*` 逐组落地，每组注明所依据的 `design-tokens.json` 小节；**未复制 16 的规范文件** | `src/ui/tokens.css` |
| 配色替换 | 旧色板 `#f5f5f2 / #ebebe6 / #e9e9e4 / #f0f0ec / #141414 / #3a3a38 / #8e8e88 / #c0503c` **全部清零** | `src/ui/styles.css`、`src/core/materials.js` |
| 字体 | 自托管 OFL（Space Grotesk / Inter / Space Mono / Noto Sans SC 子集），附许可原文；中文优先走系统字体栈 | `fonts/`、`fonts/fonts.css` |
| 画布容器 | 采用 16 的 `.ds-canvas-frame` 语义：`contain: paint` + `isolation: isolate`，画布不被站点 filter/transform 影响 | `#stage` |
| HUD | 底 `--ds-canvas-hud-bg`、字 `--ds-canvas-hud-ink`、`--ds-font-mono`、≥ 12.5px | `.hud-chip` |
| 线稿 / 图解 | jade 1.25px 描边、accent 强调、`--ds-font-mono` 11px 标注；线宽满足 1× DPR ≥ 1px 实线 | `src/core/fallback.js`、`.ds-diagram__*` |
| 场景内标注 | 新增双语标注层（投影 + 避让），并入 16 的 HUD 视觉语言 | `src/core/annotations.js` |
| 降级插图 | 改用 16 的底色/描边/标注样式，并新增构件族图例 | `src/core/fallback.js` |
| 按钮 / 控件 | 胶囊圆角、`:focus-visible` 用 `--ds-focus-ring`、`active` 微缩放 | `src/ui/styles.css` |
| 动效 | 统一 `--ds-dur-*` / `--ds-ease-*`；`prefers-reduced-motion` 下降级为 1ms | `src/ui/tokens.css`、`styles.css` |
| 史实交叉引用 | 六件模型各声明 2–3 条 `catalogRefs`（条目 id + 中英名 + 出处），界面与导出元数据同步显示 | `src/models/*.js`、`src/ui/panel.js` |
| 教学示意声明 | 补齐第三处（导出物元数据），并把三处统一为中英双语同屏 | `src/core/glb.js`、`src/ui/panel.js`、`src/main.js` |
| 来源与许可 | 新建合并权威版 `SOURCES-LICENSES.md`（四条来源线 + 许可 + 资产清单 + 免责） | `SOURCES-LICENSES.md` |
| 稳定交付说明 | 新建给 19 号的接口 / 入口 / 产物 / 元数据说明 | `docs/DELIVERY-HANDOFF.md` |
| 机器可读清单 | `models/index.json`（id / 名称 / 部件数 / 拆解层级 / 导出格式 / 体积 / 史实参照 / 约定） | `models/index.json`、`scripts/build-model-index.mjs` |

### 改版执行状态：**已完成，无暂缓项**

- `16-design-system/MIGRATION-NOTES.md` 已于本轮落盘（§2.4 即本目录的逐变量迁移表），
  迁移表中列出的旧色板、旧字体、旧圆角、旧栅格值**已全部替换**。
- 15 号要求的「外壳层 + UI 层统一」已完成：导航轨、封面、面板、按钮、过渡、HUD、
  线稿 / 标注样式、双语切换、降级插图全部走 16 号 `--ds-*` 令牌。
- **3D 场景本体按「玩法优先」豁免**（几何、材质与光照为本任务自定，不属于 16 号的界面规范范围）；
  但**面板、检查器（构件卡）、部件层级列表、加载 / 回退提示**已统一。
- **无暂缓项**：不存在「等 16 清单落盘」而未做的映射替换。

### 16 号规范 v1.0.1 复核状态：**已完成，全部条款落地**

| 条款 | 状态 | 落地位置 |
|---|---|---|
| §2.0.1 / §5.3 字体栈顺序 | ✅ | `src/ui/tokens.css`：`--ds-font-display` / `--ds-font-text` 调序，系统 CJK 栈在前、`Noto Sans SC` 子集在后（**不删子集**，保留兜底） |
| §2.0 令牌缺项（17 个） | ✅ | `src/ui/tokens.css` 补齐；与 16 号**逐名齐备**（129/129） |
| §2.0 令牌取值 | ✅ | **逐名逐值零差异**；仅保留 3 项已登记的非静默扩展（`--ds-w-cjk-display`、`--ds-w-cjk-body`、`--ds-z-debug`） |
| §2.0 命名分叉（4 处） | ✅ | `--ds-ease-inout`、`--ds-entry-translate`、`--ds-section-height` 收敛到 16 的命名 |
| §2.0 `--ds-target-min` | ✅ | `44px` |
| §6 部署基址 | ✅ | `--ds-base` 保持 `""`，由 `import.meta.env.BASE_URL` 构建期注入（实测 `"./"`）；产物内**零绝对根路径** |
| §5 语言标记 | ✅ | `index.html` 占位 + `vite.config.js` 构建期注入 `hreflang="zh-CN/en/x-default"` → `?lang=`；`initLang()` 读 URL 参数、`setLang()` 回写 URL |
| §5 中文排版 | ✅ | `src/ui/tokens.css` 的 `:lang(zh)` 块：字距归零、`word-break: normal`、`overflow-wrap: anywhere`、基础 1.75 / 正文 1.85 / 标题 1.22 |
| §5.1 触摸目标两档 | ✅ | 全部可交互元素 ≥24px（AA，硬性）；主控件 ≥44px（AAA）；紧凑变体显式标 `.btn--sm` |
| §4.1 资源在 dist 内 | ✅ | 5 个 woff2 打进 `dist/assets/`；子路径下逐个 `GET` 验 **5/5 → 200** |
| §9.4 图解规范 | ✅ | `.ds-diagram` 容器 + `.ds-diagram__fill` / `__stroke` / `__dim`；构件族为单一 jade 色阶（不另立色板） |
| 许可登记 | ✅ | `LICENSES.md` §3.2 登记 5 个 OFL 字体与许可原文；`SOURCES-LICENSES.md` 为合并权威版 |

---

## 约束核对

| 约束 | 结果 | 证据 |
|---|---|---|
| 只写本目录 | ✅ | 所有产出均在 `18-architecture-models/`；未改动其它任务目录 |
| 不负责 GitHub / Pages | ✅ | 未建仓、未推送、未部署；`manifest.json` 已提供 14-publish 所需的构建与产物信息 |
| 不冒充原作 | ✅ | 仅借用 olek.si 的**视觉语法**；作品名、文案、配色细节、全部 3D 模型均原创；未使用其字体文件与任何资产（详见 `docs/REFERENCE-AUDIT.md` 第 5 节） |
| 按 16 规范改版、只读引用 | ✅ | 令牌逐组落地并注明依据；16 的规范文件**未被复制**进本目录 |
| 资源本地化 | ✅ | 无 CDN、无外链字体、无运行期 API；字体为自托管 OFL；favicon 为内联 SVG data URI |
| 零外部请求 | ✅ | QA 断言「运行期间零外部网络请求」通过（externalRequests = 0） |
| Pages 子路径适配 | ✅ | `base: './'`；QA 在 `/repo/18-architecture-models/` 子路径下实际部署验证通过 |
| 中英文无障碍 | ✅ | 双语全覆盖；全部按钮有可访问名称；提供跳转链接；`aria-live` 提示区；HUD 文字 ≥ 12.5px |
| reduced-motion | ✅ | `--ds-dur-*` 归 1ms + 关闭自动旋转；QA 在 `reducedMotion: 'reduce'` 上下文中验证启动正常 |
| 不下载未授权模型 | ✅ | 全部几何程序化生成；仓库内不存在任何模型资产文件 |
| 标注非施工/工程模型 | ✅ | **三处落点**（场景内 / 说明页 / 导出物元数据），中英双语 |
| 受力箭头标注为定性 | ✅ | 面板说明 + 场景内标牌 + 导出物元数据，三处均写明「非工程计算」 |
| 引用 17 catalog 并注明出处 | ✅ | 每条 `catalogRefs` 带 `id` + 中英名 + `source`；QA 与 `17-architecture-research/catalog.json` 逐条交叉核对 |
| 完工后关闭本地预览 | ✅ | 见下方「遗留与交接」 |

---

## 验收结果

```
断言 125 项 · 通过 125 · 失败 0
```

覆盖：启动与外壳(9) · 六件模型装载与渲染(12) · 交互能力(12) · 场景内标注(6) ·
双语(14) · 教学示意声明三处(12) · 史实参照交叉(5) · **模型清单(7)** · GLB 导出与二进制校验(2) ·
离线与资源(2) · 无障碍(4) · 2D 降级(10) · Pages 子路径(3) · 改版一致性(13) ·
**16 号规范 v1.0.1 复核(12)** · 移动端(2)

明细见 `qa-report.md` / `qa-report.json`；截图见 `screenshots/`（18 张脚本实拍 + 4 张 Ego 复核）。
浏览器侧的目视复核（3D 主视图 / 中文态 / 标注避让）由 **ego-browser** 拍摄，见 `screenshots/ego-*.png`。

---

## 本轮修复记录（供回归参考）

### 第一轮（交付前）

| # | 问题 | 根因 | 修复 |
|---|---|---|---|
| 1 | 首屏三维画面全黑，相机位置为 NaN | `dougong.js` 中十八斗按「排」索引却按「件」取值，`douY[i]` 越界 → `position.y = undefined` → 包围盒 NaN | 改为按排索引；`frameCamera()` 增加 `isFinite` 守卫 |
| 2 | 爆炸拆解滑杆无效果 | `applyTransforms()` 中 `dir.multiplyScalar()` 就地修改了同一个向量 | 两次 `multiplyScalar` 前各自 `clone()` |
| 3 | 组装最后一步仍有构件隐藏 | `partsMax()` 中 `Math.max(1, ...arr + 1)` 运算符优先级错误 → NaN | 改写为 `reduce` 求最大 `order` 再 +1 |
| 4 | 选中构件时抛异常 | three r169 的 `Box3Helper` 没有 `setFromObject` / `update()` | 改为写入其持有的 `Box3` |
| 5 | 切换语言后界面不更新 | `tcl:lang` 事件无监听；模型标题只在 `setModel()` 时写入 | 切换时显式 `applyLang()` 并重刷标题 |
| 6 | 画布像素检查恒为空白 | WebGL 未开 `preserveDrawingBuffer` | 渲染器开启 `preserveDrawingBuffer` |
| 7 | 模型被右侧面板遮挡 | `setViewOffset` 条件误判且偏移公式有误 | 按容器与面板/侧栏实际矩形计算可见区中心 |
| 8 | 木架模型被屋面完全遮挡 | 屋面层默认可见 | 新增 `layers[].defaultVisible` |

### 第二轮（改版轮）

| # | 问题 | 根因 | 修复 |
|---|---|---|---|
| 9 | **装配动画会解除层级隐藏** | `applyTransforms()` 每帧无条件 `p.object.visible = true`，覆盖了层级开关的状态 | viewer 记录 `layerVisible`，组装时以层级状态优先 |
| 10 | GLB 导出后找不到教学示意声明 | GLTFExporter 把根节点放在 `nodes` 数组**末尾**（场景根索引），不在 `nodes[0]` | 导出后二进制层面补写 `asset.extras` 与 `scenes[0].extras`；QA 按场景根索引解析 |
| 11 | 写入 `asset.extras` 时抛 `RangeError: offset is out of bounds` | GLB 的 JSON 块长度按 **JS 字符串长度**计算，而中文 JSON 的 **UTF-8 字节数更大** | 改为按 `TextEncoder` 的字节长度计算并按 4 字节补齐 |
| 12 | 场景内标注中英重复显示同一名称 | 标注的主/副标签都取了当前语言 | 主标签取当前界面语言，副标签固定取另一种语言，两种语言始终同屏 |
| 13 | 场景内标牌与居中标题相互挤压 | 标牌宽度 420px，与标题区重叠 | 标牌收窄至 240px 并左置；受力标牌上移避开底部圆点 |
| 14 | 场景内多个标注互相压叠 | 标注按构件包围盒中心落位，未做避让 | 增加按 y 排序的贪心避让（横向 104px / 纵向 34px 判定重叠） |
| 15 | 面板中的教学示意声明只显示一种语言 | 说明页直接用了当前语言文案 | 改用 `tb()` 双语值，安全类提示中英同屏（面板声明与受力说明同步） |

### 第三轮（16 号规范 v1.0.1 复核轮）

| # | 问题 | 根因 | 修复 |
|---|---|---|---|
| 16 | 中英混排基线错位 | `--ds-font-display` / `--ds-font-text` 把 `Noto Sans SC` **子集**排在系统 CJK 栈之前 → 子集覆盖的字与未覆盖的字来自两套字形 | 按 §2.0.1 / §5.3 **调序**：系统 CJK 栈在前、子集在后（**不删子集**，保留系统栈不可用时的兜底） |
| 17 | 与 16 号令牌差 17 个、命名分叉 4 处 | 令牌层落地早于 16 号 v1.0.1 | 补齐 17 个令牌、收敛 3 处命名；与 16 号**逐名逐值零差异**（129/129） |
| 18 | 触摸目标低于 WCAG 2.2 AA | 圆点指示器 8×8、开关 22px、滑杆 22px、图标钮 ~28px | 命中区全部抬到 ≥24px；主控件（封面 CTA / 导航轴项 / 工具钮）≥44px；紧凑变体显式标 `.btn--sm` |
| 19 | **降级插图一个构件标注都没有** | `toScreen(l.x)` 传的是单个坐标值，而函数签名要 `{x, y}` 点对象 → 屏幕坐标算成 `NaN`，被边界过滤全部丢弃 | 改传点对象；并加**贪心避让 + 引出线**，14 个构件标注零重叠 |
| 20 | 降级线稿呈中性灰，失去统一观感 | 构件族填色与暖灰 `--ds-ink-faint` 混合，冲掉了 `--ds-jade-soft` 的冷调 | 改为与 `--ds-jade` 混合的单一色阶（§9.4「不另立色板」） |
| 21 | 降级模式下徽标行压住示意图卡片 | 徽标换行后侵入卡片区 | 降级模式收起徽标行（卡片顶部说明已含教学示意声明） |
| 22 | 场景内标注仍会压叠 | 避让用固定 104px 估值，而英文副标实际更宽 | 改用**真实包围盒**贪心避让，仅沿竖直方向挪动并配竖向引出线 |
| 23 | 写死 `/playtime-atlas-20261021/` | 直接手写绝对根路径 | `--ds-base` 由 `import.meta.env.BASE_URL` 构建期注入（实测 `"./"`），产物内零绝对根路径 |
| 24 | 缺 `hreflang`，`?lang=` 不生效 | 只有 localStorage 记忆语言 | 补 `hreflang` 与 `?lang=` 读写；`updateURL()` 改为保留查询串 |
| 25 | `LICENSES.md` 仍称「仓库内字体文件：无」 | 字体是改版轮后加的，许可登记未同步 | 按 16 号与 RESTYLE-SPEC §3 要求登记 5 个 OFL 字体与许可原文 |

---

## 遗留与交接

### 交给 `14-publish`

- 构建：`npm install && npm run build` → `dist/`（纯静态，零外部请求）
- 入口：`dist/index.html`；子路径可直接部署（已实测 `/repo/18-architecture-models/`）
- 产物：`dist/assets/*.js|css|woff2`（5 个自托管字体，无图片 / 模型 / 音频）
- 集成信息：`manifest.json`（含 `id / title / description / entry / buildCommand / outputDir / status`）

### 交给 `19-architecture-atlas`

**稳定交付说明：[`docs/DELIVERY-HANDOFF.md`](docs/DELIVERY-HANDOFF.md)**
**机器可读清单：[`models/index.json`](models/index.json)**（生成器 `scripts/build-model-index.mjs`）

要点速览：

- **交接形态：(a) 19 号直接消费 18 号的 3D 模型**（18 号是 3D 交互的唯一真源）。
  19 号 `src/art/schematic.js` 的自绘 2D 图形是其自有的轻量插画层，不是本目录模型的替代实现；
  形态差异须在 19 与 18 两侧互相声明（**镜像声明需 19 号自行写入**，本目录无权改动 19）。
- **依赖方式**：16—19 为独立目录，**非 monorepo 单包**，不能用 npm 互相依赖。
  首选**构建期拷贝源码**（`src/core/` + `src/models/` + `fonts/` → `registerModel()` → 挂 `Viewer`）；
  备选**取预导出 GLB**（`exportGLBBuffer(id)`）；再次为**运行时 iframe / 链接**本目录 `dist/`。
- 统一接口：`window.TimberCraftLab`（`models()` / `getModel(id)` / `buildModel(id)` / `loadModel(id)` /
  `selectPart(id)` / `getState()` / `viewer()` / `annotations()` / `exportMetadata(id)` /
  `exportGLBBuffer(id)` / `exportGLB(id)` / `setLang(lang)`），事件 `tcl:lang`
- 各模型入口路径：`src/models/<id>.js`（`dougong` / `mortise` / `taoliang` / `chuandou` / `stone-arch` / `tulou`）
- GLB 位置：浏览器内实时生成，**仓库内无预生成 .glb**；`exportGLBBuffer(id)` 直接给二进制
- 降级插图位置：`src/core/fallback.js` 的 `renderFallbackSVG()`，容器 `#fallback-mount` / `#fallback-note`
- 示意声明元数据字段：`disclaimer` / `disclaimerLong` / `forceArrows` / `scaleNote` / `catalogRefs`
  （写入 `asset.extras`、根节点 `extras`、`scenes[0].extras`；清单中另见 `disclaimer` / `forceArrowsNote`）
- 契约：`docs/MODEL-CONTRACT.md` v1.1
- 双语词条已按「英文 `en` / 中文 `zh`」成对提供，可直接取用

### 已知限制（如实声明）

0. **示意模型声明**：六件模型**全部是程序化生成的示意模型**，**非测绘级复原**；
   **材质与比例为教学表达，非考古数据**，也不得用作施工或工程依据；
   受力箭头为**定性说明，非工程计算**。该声明位于 ① 3D 场景内标牌 ② 模型说明页
   ③ 导出物（GLB）元数据 ④ `models/index.json` 四处。
1. **模型为教学示意**，与真实测绘比例与构造做法不完全一致；已在**三处**（场景内 / 说明页 / 导出物元数据）标注，但细节简化处无法穷举说明。
2. **受力箭头是定性说明**，非工程计算结果，不可用于设计或安全评估。
3. **Noto Sans SC 子集覆盖有限**（沿用 16 号同一份子集）：超出覆盖的汉字由浏览器自动回退系统黑体，**不会缺字**但字形略有差异；中文优先走系统字体栈（0 字节）。本机无 fonttools，未能重新子集化。
4. **参考站仅观测了桌面 1280 × 720 布局**，其移动端断点行为未验证；本项目的移动端布局为自研。
5. **降级示意图为等轴投影凸包**，不是施工级立面图；已明确标注为示意图。
6. 土楼与石拱桥的构件命名与数量按教学需要组织，非测绘图逐件对照。
7. **史实参照为「对应关系」而非「逐一测绘比对」**：`catalogRefs` 指向 17 catalog 中结构类型相同的条目，用于说明本模型的结构表述依据；本模型的具体比例仍以 `scaleNote` 所述的简化口径为准。
8. 16 号的 `MIGRATION-NOTES.md` 提到 `--ds-space-16/18/20/22/24` 等非标准间距的归一问题；本目录未使用这些非标准值，间距一律取 `--ds-space-1…10` 的标准档。
9. **字体栈顺序**：按 16 号 §2.0.1 / §5.3，系统 CJK 栈在前、`Noto Sans SC` 子集在后。代价是**跨平台中文字形不统一**（各系统自己的黑体）——这是 16 号明确接受的取舍（宁可不混排、不错位，也不要字形统一）。
10. **hreflang 两版共用同一 HTML**：语言切换由 JS 完成，`?lang=zh` / `?lang=en` 返回同一份 HTML；不执行 JS 的爬虫看到的静态文案相同（`<title>` / `<meta description>` 已双语，正文需 JS 渲染）。
11. **触摸目标为几何判定**：断言读取 `getBoundingClientRect()`（WCAG 2.2 SC 2.5.8 口径），未做真实手指触摸实机验证，也未覆盖「目标间距」例外。
12. **降级 / 3D 标注会被省略**：贪心避让放不下的标签直接不画（宁缺毋糊），3D 场景内另有 8 个的数量上限；部分构件因此可能没有名称标注。

#### 逐模型的几何简化（作者自陈，非事后追认）

| 模型 | 无法以几何表达的内容 |
|---|---|
| `dougong` | 清式与宋式术语体系不同，出踩/铺作逐跳对应关系取了常见科普图说法；斗栱各层横栱的具体错位量（斗口数）只表达「逐层外挑、逐层加宽」的关系，不标注具体斗口数；前后对称做法只详列檐外一侧 |
| `mortise` | 实物榫头多有微小斜度以利装配，模型采用通直卯口（已在 `scaleNote` 显式说明）；只做 4 种代表性节点，未覆盖栽榫、走马销、楔钉榫等家具类做法 |
| `taoliang` | 屋面是**举折的阶梯式近似**，每一折为平直板面而非连续曲面，从上方可见折面；只建一侧椽子；椽按折段分为共线的短段而非整根弯曲的椽；未建斗栱（仅在大梁说明文字中提及）；檐柱与金柱同用大梁的组合在实物中随时代而异，比例已简化 |
| `chuandou` | 同上的举折阶梯式屋面近似；只建一侧椽子；立柱沿进深成排、穿枋贯穿全部立柱并含「断柱」骑于穿枋之上，柱距比例已简化 |
| `stone-arch` | 28 道并列拱券**压缩为 5 道**（每道加深以便辨识，已在构件说明与 `scaleNote` 注明）；5 根铁拉杆未建模（实为埋于填石中不可见），只表现外券可见的腰铁；拱上填石为一块带洞挤出板而非分层填筑，拱上与肩部关系为教学近似；桥台简化为 5 层收分石，无束水尖/分水尖；翼墙、辇道车辙、栏板雕刻、水面河床均作示意 |
| `tulou` | 放射状房间单元未细分（房间区为连续环带）；内部约 0.5 m 土坯隔墙未建；祖堂、门楼、谷仓为示意体量；水井、牲畜栏舍与谷仓之外的储粮层未建；枪眼与墙骨表现为剖面上的暗色凸块/木条而非真实孔洞（墙体生成器不支持开洞）；屋面为平滑锥面环带，无瓦垄与屋脊细节；只做圆形土楼，五凤楼未建 |

### 本地预览状态

- 验收用的本地预览（`127.0.0.1:4318`）在验收完成后**已关闭**。
- 需要复现时：`npm run build && npm run preview`。
