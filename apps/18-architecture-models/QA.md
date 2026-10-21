# QA · 榫构华夏 Timber Craft Lab

> 自动化验收报告 · 任务 18-architecture-models
> 运行时间：2026-10-22（16 号规范 v1.0.1 复核轮）｜ 浏览器：Chromium（Playwright，system Chrome channel）
> 命令：`node qa/qa.mjs http://127.0.0.1:4318`
> 结果：**125 项断言全部通过（125 / 125）**，退出码 0

机器可读版本：`qa-report.json` ｜ 逐条表格：`qa-report.md` ｜ 截图：`screenshots/`（18 张脚本实拍 + 4 张 Ego 复核）

---

## 1. 验收范围

| 组 | 断言数 | 覆盖内容 |
|---|---|---|
| 启动 / Boot | 9 | 标题、开场封面、封面斜体主标题、封面关闭、画布创建、左侧索引 6 项、底部圆点 6 个、公开接口暴露 6 件模型、接口提供 `buildModel`/`exportGLB` |
| 模型巡检 | 12 | 6 件模型逐一装载 → 构件数、层级数、受力箭头数非零；6 件模型画布均渲染出非空像素 |
| 交互能力 | 12 | 爆炸拆解位移、组装第 0 步未就位、组装末步全部就位、剖切面生效、层级开关隐藏 / 恢复、**装配动画不解除层级隐藏**、受力箭头显示、构件拾取打开说明卡、说明卡含作用描述、复位视角改变机位、自动旋转 |
| 场景内标注 | 6 | 场景内存在构件标注、标注为中英双语、标注定位在画布内、**标注互不压叠（贪心避让生效）**、点击标注可选中构件、标注开关可隐藏全部标注 |
| 双语 | 14 | 默认英文、切中文后语言状态变更、模型标题 / 面板标题同步更新、中文标题含中文、**场景内标注主语言随之更新**、**场景内声明标牌中英双语同屏**、可切回英文 + `:lang(zh)` 六项（`lang` 切换、字距归零、换行规则、基础行高 1.75、正文 1.85、标题 1.22） |
| 教学示意声明 | 12 | ① 3D 场景内标牌（含中英双语）② 模型说明页 `.disclaimer`（含中英双语）③ GLB 根节点 `extras` / `asset.extras` / `scenes[0].extras` 三处写入；受力箭头定性说明（面板 + 场景内标牌 + 元数据）；**导出物仍为结构合法的 GLB 容器** |
| 史实参照 | 5 | 六件模型均声明参照条目、每条注明条目出处、参照提供中英名称、说明页显示 catalog 出处、**参照 id 均命中 17 的 `catalog.json`** |
| **模型清单** | 7 | `models/index.json` 存在且可解析、**含示意模型声明（中英双语）**、清单条目与运行时模型一致、**部件数 / 层级数 / 箭头数与实况一致**、**史实参照条目与实况一致**、**GLB 体积与浏览器实测一致**、清单无外部依赖域名 |
| 导出 / GLB | 2 | 点击导出触发下载、文件为合法 GLB 二进制 |
| 离线与资源 | 2 | 运行期间零外部网络请求、控制台无报错 |
| 无障碍 | 4 | reduced-motion 下正常启动、reduced-motion 下默认不自动旋转、存在可聚焦控件、按钮均有可访问名称 |
| 2D 降级 | 10 | 无 WebGL 时切换到降级视图、示意图由真实几何生成、**带构件族图例**、**降级路径同样显示教学示意声明** + §9.4 六项（标注用 `.ds-diagram__dim`、构件用 `.ds-diagram__fill`、**标出主要构件名称**、构件族单一 jade 色阶、dim 样式取值、`.ds-diagram` 容器规格） |
| Pages 子路径 | 3 | 子路径部署可正常加载、子路径部署无脚本错误、**子路径下自托管字体全部返回 200** |
| 改版一致性 | 13 | 16 的 `--ds-*` 令牌齐备、**旧色板值全部清零**、字体已自托管、无外链字体、产物内无任何外部域名、**无写死的绝对根路径**、**CSS 内无绝对路径 url()**、底色 / 墨色 / 圆角 / 正文字体 / HUD 等宽字体 / HUD ≥ 12.5px 取自新令牌 |
| **16 号规范 v1.0.1 复核** | 12 | **令牌与 16 号逐名齐备（129 个零缺失）**、**令牌取值逐名逐值零差异**、**额外令牌仅为已登记的 3 项扩展**、**`--ds-target-min` = 44px**、**字体栈顺序（Noto 子集在系统 CJK 栈之后）**、**`--ds-base` 已由构建注入且为相对路径**、**hreflang 齐备且指向 `?lang=` 版本**、**`?lang=zh` 直开即中文态**、**`?lang=` 页无脚本错误**、**触摸目标 ≥24px（AA）**、**主控件 ≥44px（AAA）** |
| 移动端 | 2 | 无横向溢出、控制面板在视口内 |
| **合计** | **125** | **通过 125 · 失败 0** |

---

## 2. 关键断言明细

### 2.1 模型巡检

| 模型 | 构件 | 层级 | 受力箭头 | 画布非空像素（unique 色阶） | 史实参照 |
|---|---|---|---|---|---|
| `dougong` 斗栱组 | 16 | 5 | 7 | 62 | `c01` `c02` `c09` |
| `mortise` 榫卯连接 | 9 | 4 | 5 | 53 | `c02` `c25` `c40` |
| `taoliang` 抬梁木架 | 18 | 5 | 6 | 83 | `c01` `c07` `c23` |
| `chuandou` 穿斗木架 | 15 | 4 | 6 | 78 | `c15` `c16` `c19` |
| `stone-arch` 敞肩石拱桥 | 17 | 6 | 7 | 94 | `c30` `c41` |
| `tulou` 土楼 · 院落结构 | 19 | 6 | 6 | 83 | `c17` `c42` |

> 「unique」为把画布缩绘至 220 × 140 后的量化色阶数量；> 6 即判定为已渲染出实际内容（纯背景为 1）。

### 2.2 契约静态校验（构建前，Node 侧）

六件模型全部通过 `src/core/model-api.js` 的校验：

```
dougong     modelErr=0  parts=16  forces=7  buildErr=0  refs=3
mortise     modelErr=0  parts=9   forces=5  buildErr=0  refs=3
taoliang    modelErr=0  parts=18  forces=6  buildErr=0  refs=3
chuandou    modelErr=0  parts=15  forces=6  buildErr=0  refs=3
stone-arch  modelErr=0  parts=17  forces=7  buildErr=0  refs=2
tulou       modelErr=0  parts=19  forces=6  buildErr=0  refs=2
```

校验内容：`id` 为 kebab-case · 中英文案成对 · `scaleNote` 含「教学示意 / teaching diagram」·
层级 id 无重复且标签双语 · `build` 为函数 · 相机为 3 元数组 ·
每个构件具备 `id/name/pinyin/role/layer/family/object/explode/order` ·
构件 id 不重复 · 构件 `layer` 已在模型中声明 · `object` 为 `group` 直接子对象 ·
`explode` 为非零 `Vector3` · 受力箭头 `kind` 属于合法枚举 ·
**`catalogRefs` 每条具备 `id` / `name.zh` / `name.en` / `source` 且 id 不重复**。

### 2.3 几何数值健康检查

六件模型的包围盒均无 NaN / Infinity：

```
dougong     -1.50,-0.00,-1.25 →  1.50, 3.07, 1.65
mortise     -3.80,-0.10,-1.00 →  3.80, 0.96, 1.00
taoliang    -2.40,-0.00,-2.95 →  2.40, 5.24, 2.95
chuandou    -2.40,-0.00,-3.50 →  2.40, 4.14, 3.50
stone-arch  -8.50,-0.85,-4.50 →  8.50, 2.92, 4.50
tulou       -7.68, 0.00,-8.07 →  7.68, 4.45, 0.71
```

### 2.4 教学示意声明的三处落点

| 落点 | 实现 | 验证方式 |
|---|---|---|
| ① 3D 场景内 | `#hud-disclaimer`（画布内 HUD，中英双语同屏） | 断言元素可见、位于 `#stage` 矩形内、文本同时含「教学示意」与 "Teaching diagram" |
| ② 模型说明页 | `#panel-body .disclaimer[data-role="disclaimer"]` | 断言存在、文本同时含两种语言的声明 |
| ③ 导出物元数据 | GLB 的 `asset.extras` + 根节点 `extras` + `scenes[0].extras` | 在页面内生成 GLB → 解析二进制 JSON chunk → 逐字段断言 |

`asset.extras` 实测字段：

```json
{
  "generator": "Timber Craft Lab (18-architecture-models) v1.0.0",
  "modelId": "dougong",
  "modelTitle": { "zh": "斗栱组", "en": "Dougong Bracket Set" },
  "disclaimer": { "zh": "教学示意，非施工/工程模型。", "en": "Teaching diagram — not a construction or engineering model." },
  "disclaimerLong": { "zh": "构件比例与节点做法均为示意性表达。…", "en": "Member proportions and joint details are schematic. …" },
  "forceArrows": { "zh": "受力箭头为传力路径的定性说明，非结构计算结果。", "en": "Force arrows are a qualitative indication of load paths, not the result of a structural calculation." },
  "scaleNote": { "zh": "教学示意，非施工/工程模型；斗口比例与出跳数已简化。…", "en": "…" },
  "memberCount": 16,
  "catalogRefs": [
    { "id": "c01-nanchan-main-hall", "nameZh": "南禅寺大殿", "nameEn": "Main Hall, Nanchan Temple", "source": "17-architecture-research/catalog.json · c01-nanchan-main-hall" }
  ],
  "licensing": "Models and geometry are original works of this project, …"
}
```

**GLB 容器结构校验**（写入元数据后仍须是合法 GLB）：
`magic=glTF` · `version=2` · 总长度字段 == 实际字节数 · JSON/BIN 两块首尾正好铺满文件 ·
JSON 块类型 `0x4E4F534A` · 两块长度均为 4 的倍数。

### 2.5 GLB 导出（下载路径）

- 触发：控制面板「导出 GLB」按钮（`[data-action="export-glb"]`）
- 文件名：`dougong.glb`；文件头：`glTF`（GLB 二进制魔数正确）
- 导出内容：当前模型装配完成姿态下的真实三角网格，每个构件为独立 mesh，
  mesh 的 `extras` 保留 `partId` 与中英文构件名；材质已还原基础材质、剖切平面已清空。

### 2.6 Pages 子路径部署

验收脚本把 `dist/` 复制到临时目录的 `repo/18-architecture-models/` 子路径，
用本地静态服务器以 `http://127.0.0.1:<port>/repo/18-architecture-models/` 打开：
页面标题正确渲染、公开接口返回 6 件模型、三维画布正常创建、无脚本错误。

### 2.7 2D 降级路径

在页面加载前以 `addInitScript` 屏蔽 WebGL 上下文：

- 降级容器被激活（`#fallback-host.is-active`）
- 渲染出 SVG，包含 **16 个构件多边形** —— 说明降级插图由与 3D 模型
  **同一套真实几何**投影生成（取网格真实顶点做等轴投影并求凸包），而非另画的示意图
- 附 **5 项构件族图例**（木 / 石 / 土 / 瓦 / 水）
- `#fallback-note` 同样包含教学示意声明与受力定性说明
- **§9.4 类名对齐**：容器 `.ds-diagram`、构件 `.ds-diagram__fill` + `.ds-diagram__stroke`、
  标注 `.ds-diagram__dim`（mono `11px` / `--ds-ink-faint` = `rgb(110, 101, 94)`）
- **标出主要构件名称**（14 个构件标注，贪心避让 + 引出线，互不压叠）
- 构件族以**单一 jade 色阶**区分（`--ds-jade-soft` × `--ds-jade` 混合），**不另立色板**

### 2.8 改版一致性（对照 16-design-system）

| 检查 | 结果 |
|---|---|
| `--ds-bg` / `--ds-ink` / `--ds-accent` / `--ds-jade` / `--ds-font-display` / `--ds-font-mono` / `--ds-radius-xl` / `--ds-ease-out` | 8/8 齐备 |
| 旧色板 `#f5f5f2` `#ebebe6` `#e9e9e4` `#f0f0ec` `#c0503c` `#3a3a38` `#8e8e88` `#141414` | 0 残留 |
| 产物内自托管 woff2 | 5 个 |
| 外链字体 / 任何外部域名 | 0 |
| 写死的绝对根路径 `/playtime-atlas-20261021/` | 0 处 |
| CSS 内绝对路径 `url(/…)` | 0 处 |
| 页面底色 | `rgb(252, 251, 249)` = `--ds-bg` |
| 正文墨色 | `rgb(20, 17, 15)` = `--ds-ink` |
| 面板圆角 | `28px` = `--ds-radius-xl` |
| 正文字体 | 含 `Inter` = `--ds-font-text` |
| HUD 字体 | 含 `Space Mono` = `--ds-font-mono` |
| HUD 字号 | `12.5px`（≥ DESIGN-SPEC §9.2 要求的 12.5px） |

### 2.8.1 16 号规范 v1.0.1 复核（本轮新增）

依据 `16-design-system/MIGRATION-NOTES.md` §2.0 / §2.0.1 / §4.1 / §5 / §5.1 / §6 / §9.1
与 `DESIGN-SPEC.md` §2.5 / §9.4。16 号的规范文件**只读引用、未复制**到本目录；
令牌值在本目录重新落地并逐组注明依据小节。

| 条款 | 落地方式 | 验收 |
|---|---|---|
| §2.0 令牌缺项 | 补齐与 16 号**逐名齐备**（16 有 129 个，本目录 132 个） | 缺失 0 |
| §2.0 令牌取值 | 逐名逐值**零差异** | 差异 0 |
| 非静默扩展 | 仅保留 3 项并登记：`--ds-w-cjk-display`、`--ds-w-cjk-body`（`typography.weightCjk`）、`--ds-z-debug`（`zIndex.debug`） | 无未登记项 |
| §2.0 命名分叉 | `--ds-ease-in-out`→`--ds-ease-inout`、`--ds-entry-translate-y`→`--ds-entry-translate`、`--ds-viewport-section`→`--ds-section-height` | 已收敛 |
| §2.0.1 / §5.3 字体栈顺序 | 系统 CJK 栈在前、`Noto Sans SC` 子集在后（**调序而非删子集**） | display Noto@94 / text Noto@86，无越界 |
| §2.0 必备令牌 | `--ds-target-min: 44px` | 44px |
| §6 部署基址 | `--ds-base` 保持 `""`（与 16 一致），由构建期 `import.meta.env.BASE_URL` 注入 | 实测 `"./"`，**相对**、非写死 |
| §5 语言标记 | `<link rel="alternate" hreflang="zh-CN|en|x-default">` 指向 `?lang=`；`initLang()` 优先读 URL 参数，`setLang()` 回写 URL | 三条链接齐备；`?lang=zh` 直开即中文态 |
| §5 中文排版 | `:lang(zh)` 字距归零、`word-break: normal`、`overflow-wrap: anywhere`、基础 1.75 / 正文 1.85 / 标题 1.22 | 六项全过 |
| §5.1 触摸目标 | 全部可交互元素 ≥24px（AA，硬性）；主控件 ≥44px（AAA） | 全部合格 |
| §4.1 资源在 dist 内 | 5 个 woff2 打进 `dist/assets/`，子路径下逐个 `GET` 验 200 | 5/5 → 200 |
| §9.4 图解规范 | `.ds-diagram` 容器 + `.ds-diagram__fill/__stroke/__dim` | 类名与取值全对 |

> 触摸目标的「主控件」判定沿用 16 号 `tools/verify-preview.mjs` 的口径：
> 主控件 = `.btn` / `.rail-item` / `.rail-btn` 且**不带**紧凑变体类 `btn--sm`；
> 紧凑变体（面板工具条内的次级操作）不计入 44px 检查，但仍须 ≥24px。

### 2.9 机器可读模型清单（`models/index.json`）

清单由 `node scripts/build-model-index.mjs` 生成（直接 import 六个模型描述符，与源码同源）。
验收逐项与运行时的真实状态比对：

| 检查 | 方法 |
|---|---|
| 清单可解析、含示意模型声明 | 读文件 + 断言 `disclaimer.zh` 含「示意模型」「非测绘级复原」、`disclaimer.en` 含 "schematic models" |
| 条目与运行时一致 | `window.TimberCraftLab.models()` 的 id 集合与清单比对 |
| 部件数 / 层级数 / 箭头数 | 每件在页面内 `buildModel(id)` 重新构建后与 `counts` 比对 |
| 史实参照条目 | 清单的 `catalogRefs[].id` 与运行时 `model.catalogRefs` 比对 |
| **GLB 体积** | 页面内 `exportGLBBuffer(id)` 逐件导出，与清单 `export.measuredGlbBytes` **逐字节比对**（偏差即失败） |
| 无外部依赖 | 清单全文不含任何外部域名 |

> 体积比对保证「清单不会与产物悄悄脱节」：改了几何或升级 three 而忘了更新清单，验收会立刻失败。

---

## 3. 截图清单

| 文件 | 内容 |
|---|---|
| `01-intro.png` | 开场封面（斜体展示主标题 + 说明） |
| `02-model-01-dougong.png` | 斗栱组（含场景内双语标注与声明标牌） |
| `02-model-02-mortise.png` | 榫卯连接 |
| `02-model-03-taoliang.png` | 抬梁木架（屋面层默认隐藏，露出梁架） |
| `02-model-04-chuandou.png` | 穿斗木架 |
| `02-model-05-stone-arch.png` | 敞肩石拱桥 |
| `02-model-06-tulou.png` | 土楼 · 院落结构 |
| `03-explode.png` | 爆炸拆解状态 |
| `04-assembly-step0.png` | 分步组装第 0 步 |
| `05-section.png` | 剖切状态 |
| `06-forces.png` | 结构受力示意（含场景内定性提示标牌） |
| `07-inspector.png` | 构件说明卡 |
| `08-chinese.png` | 中文界面 |
| `09-reduced-motion.png` | reduced-motion 上下文 |
| `10-fallback-2d.png` | 2D 降级示意图（含构件族图例） |
| `11-subpath-pages.png` | Pages 子路径部署 |
| `12-mobile.png` | 移动端布局（390 × 844） |
| `13-annotations.png` | 场景内双语标注（点击标注选中构件） |
| `ego-01-intro.png` | Ego 复核：开场封面（1600 × 1080 视口） |
| `ego-02-model-en.png` | Ego 复核：3D 主视图（英文态） |
| `ego-03-model-zh.png` | Ego 复核：3D 主视图（中文态，`:lang(zh)` 排版生效） |
| `ego-04-anno-avoid.png` | Ego 复核：场景内标注避让 + 竖向引出线（5 个标注零重叠） |

> `ego-*.png` 由 **ego-browser**（唯一浏览器入口）复核拍摄，用于人工目视确认；
> 自动化断言仍以 `qa/qa.mjs` 为准。

---

## 4. 回归修复记录

### 第一轮（交付前）

| # | 现象 | 根因 | 修复 |
|---|---|---|---|
| 1 | 首屏三维全黑、相机 NaN | `dougong.js` 十八斗按「排」定义却按「件」取值，`douY[i]` 越界 | 改为按排索引；`frameCamera()` 增加有限性守卫 |
| 2 | 爆炸滑杆无效 | `applyTransforms()` 中 `multiplyScalar()` 就地修改同一向量，`off`/`settle` 互相覆盖 | 各自 `clone()` |
| 3 | 组装末步仍有构件隐藏 | `Math.max(1, ...arr + 1)` 优先级错误导致 `partsMax()` 返回 NaN | 改用 `reduce` 求最大 `order` |
| 4 | 选中构件抛异常 | three r169 `Box3Helper` 无 `setFromObject`/`update()` | 写入其持有的 `Box3`，由渲染循环推导 |
| 5 | 切换语言界面不刷新 | `tcl:lang` 事件无监听；模型标题仅在 `setModel()` 写入 | 切换时显式 `applyLang()` 并重刷标题 |
| 6 | 画布像素检查恒空 | WebGL 未开 `preserveDrawingBuffer` | 渲染器开启该选项 |
| 7 | 模型被面板遮挡、居中偏移 | `setViewOffset` 触发条件与偏移公式有误 | 按容器与面板/侧栏实际矩形计算可见区中心 |
| 8 | 木架模型被屋面全遮 | 屋面层默认可见 | 新增 `layers[].defaultVisible`，木架模型屋面默认隐藏 |

### 第二轮（改版轮）

| # | 现象 | 根因 | 修复 |
|---|---|---|---|
| 9 | 装配动画会解除层级隐藏 | `applyTransforms()` 每帧无条件 `visible = true` | viewer 记录 `layerVisible`，组装时以层级状态优先 |
| 10 | GLB 里找不到教学示意声明 | GLTFExporter 把根节点放在 `nodes` **末尾**（场景根索引），不在 `nodes[0]` | 导出后二进制补写 `asset.extras` 与 `scenes[0].extras`；QA 按场景根索引解析 |
| 11 | 写 `asset.extras` 抛 `RangeError` | GLB JSON 块长度按 JS 字符串长度算，中文 UTF-8 字节数更大 | 改按 `TextEncoder` 字节长度计算并按 4 字节补齐 |
| 12 | 场景内标注中英重复 | 主/副标签都取当前语言 | 主标签取当前界面语言，副标签固定取另一种语言 |
| 13 | 声明标牌与居中标题挤压 | 标牌宽 420px | 收窄至 240px 左置；受力标牌上移避开底部圆点 |
| 14 | 多个场景内标注互相压叠 | 未做避让 | 按 y 排序的贪心避让（横向 104px / 纵向 34px） |
| 15 | 面板声明与受力说明只显示一种语言 | 直接用当前语言文案 | 改用 `tb()` 双语值，安全类提示中英同屏 |

### 第三轮（16 号规范 v1.0.1 复核轮）

| # | 现象 | 根因 | 修复 |
|---|---|---|---|
| 16 | 中英混排基线错位 | `--ds-font-display` / `--ds-font-text` 把 `Noto Sans SC` **子集**排在系统 CJK 栈之前，子集覆盖的字与未覆盖的字来自两套字形 | 按 §2.0.1 / §5.3 **调序**：系统 CJK 栈在前、子集在后（**不删子集**，保留系统栈不可用时的兜底） |
| 17 | 与 16 号令牌差 17 个、命名分叉 4 处 | 令牌层落地早于 16 号 v1.0.1 | 补齐 17 个令牌、收敛 3 处命名（另 1 处 `--ds-viewport-section` 同批收敛），逐名逐值零差异 |
| 18 | 触摸目标低于 WCAG 2.2 AA | 圆点指示器 8×8、开关 22px、滑杆 22px、图标钮 ~28px | 命中区全部抬到 ≥24px；主控件（封面 CTA / 导航轴项 / 工具钮）≥44px；紧凑变体显式标 `.btn--sm` |
| 19 | 降级插图**一个构件标注都没有** | `toScreen(l.x)` 传的是单个坐标值，而函数签名要 `{x, y}` 点对象 → 屏幕坐标算成 `NaN`，被边界过滤全部丢弃 | 改传点对象；并加**贪心避让 + 引出线**，14 个构件标注零重叠 |
| 20 | 降级线稿呈中性灰，失去统一观感 | 构件族填色与暖灰 `--ds-ink-faint` 混合，把 `--ds-jade-soft` 的冷调冲掉 | 改为与 `--ds-jade` 混合的单色阶（§9.4「不另立色板」） |
| 21 | 降级模式下徽标行压住示意图卡片 | 徽标换行后侵入卡片区 | 降级模式收起徽标行（卡片顶部说明已含教学示意声明） |
| 22 | 场景内标注仍会压叠 | 避让用固定 104px 估值，而英文副标实际更宽 | 改用**真实包围盒**贪心避让，仅沿竖直方向挪动并配竖向引出线 |
| 23 | 写死 `/playtime-atlas-20261021/` | 直接手写绝对根路径 | `--ds-base` 由 `import.meta.env.BASE_URL` 构建期注入（实测 `"./"`），产物内零绝对根路径 |
| 24 | 缺 `hreflang`，`?lang=` 不生效 | 只有 localStorage 记忆语言 | 补 `hreflang`（构建期注入，见下）与 `?lang=` 读写；`updateURL()` 保留查询串 |
| 25 | `LICENSES.md` 仍称「仓库内字体文件：无」 | 字体是改版轮后加的，许可登记未同步 | 按 16 号与 RESTYLE-SPEC §3 要求登记 5 个 OFL 字体与许可原文 |

> **hreflang 为何由构建期注入**：Vite 会把**所有** `link[href]` 当静态资源解析并重写路径，
> `?lang=zh` 这类 query-only URL 会被解析到目录上导致构建失败（`EISDIR`）。
> 故 `index.html` 留占位注释，由 `vite.config.js` 的插件在 `transformIndexHtml` 的
> `post` 阶段（资源重写之后）注入 —— 产物 HTML 带完整 `hreflang`，且任何路径都不被改写。

---

## 5. 未覆盖 / 已知限制

以下内容**未经自动化验证**，如实列出：

1. **跨浏览器**：仅在 Chromium（system Chrome channel）验证；未测 Safari / Firefox 的 WebGL2 差异。
2. **移动端仅测布局**：验证了无横向溢出与面板在视口内，未做触摸手势（单指旋转 / 双指缩放）的自动化验证。
3. **GLB 导出的几何完整性**：校验了容器结构、元数据字段与文件头，未在第三方 glTF 查看器中逐件比对网格。
4. **降级示意图**：验证了由真实几何生成、多边形数量、图例、构件标注数量与类名，未做像素级视觉比对。
5. **屏幕阅读器实机验证**：提供了可访问名称、`aria-live` 与跳转链接，但未用真实读屏软件做人工验证。
6. **参考站移动端布局**：olek.si 仅观测了桌面 1280 × 720 布局，其移动端行为未验证。
7. **中文字形覆盖**：自托管的 Noto Sans SC 为**子集**，覆盖范围有限；超出覆盖的汉字回退系统黑体，本机无 fonttools 未能重新子集化。
8. **与 17 catalog 的关系**：已逐条核对**条目 id 存在性**，未做条目内容与模型构件的逐句语义比对。
9. **触摸目标为几何判定**：断言读取元素的 `getBoundingClientRect()`，属 WCAG 2.2 SC 2.5.8 的口径，
   未做真实手指触摸实机验证；也未覆盖「目标间距」（SC 2.5.8 的第二档例外）。
10. **hreflang 两版共用同一 HTML**：语言切换由 JS 完成，`?lang=zh` / `?lang=en` 返回同一份 HTML，
    不执行 JS 的爬虫看到的静态文案相同（页面 `<title>` / `<meta description>` 已双语，但正文需 JS 渲染）。
11. **降级标注在极端视角下会被省略**：贪心避让放不下的标签直接不画（宁缺毋糊），
    故某些构件可能没有名称标注；3D 场景内的标注同理有 8 个的数量上限。
12. **`:lang(zh)` 规则未覆盖全部第三方文本**：仅对本目录自有的标题 / 正文类名显式覆写行高与字距；
    面板内由 JS 生成的说明段落若新增了新的类名，需同步在 `src/ui/tokens.css` 的 `:lang(zh)` 块中登记。

---

## 6. 复现方式

```bash
cd 18-architecture-models
npm install
npm run build
npm run preview &          # http://127.0.0.1:4318
node qa/qa.mjs http://127.0.0.1:4318
```

Playwright 不在项目依赖中；脚本会依次尝试 `QA_PLAYWRIGHT` 环境变量、
`playwright`、`/tmp/qa-runner/node_modules/playwright/index.mjs`。
需要指定时：

```bash
QA_PLAYWRIGHT=/path/to/playwright/index.mjs node qa/qa.mjs http://127.0.0.1:4318
```

退出码：`0` = 全部通过；`1` = 存在失败项。

> 验收脚本会读取兄弟目录 `17-architecture-research/catalog.json` 做史实参照的交叉核对；
> 该目录不存在时对应断言会记为失败（不会静默跳过）。
