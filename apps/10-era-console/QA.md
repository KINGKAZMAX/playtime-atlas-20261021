# QA — 《色块远征》1990s 家用机可玩展厅

被测目录：`10-era-console`
测试日期：2026-10-21
执行环境：macOS（darwin 25.2.0 arm64）· Node v24.13.0 · npm 11.6.2 · Chrome（Playwright 1.64.1 驱动）

---

## 0. 一句话结论

| 项目 | 结果 |
| --- | --- |
| 单元 / 逻辑测试 | **33 / 33 通过** |
| 浏览器实机验收 | **38 / 38 通过，0 失败**（改版批复跑一致） |
| 自动玩家实机通关 | **三关全部通关，0 失误**，用时 44s / 2602 帧，每关 3/3 色晶 |
| D1 元素重叠 | 1440×900 与 390×844 均为 **0 处**；badge×标题 **0 / 0** |
| 令牌与接入一致性 | `node tools/qa/token-check.mjs` → **PASS**（拷贝件 sha256 一致 + 与 `design-tokens.json` 逐项比对 141 项全等） |
| 字体覆盖率 | `node tools/qa/font-coverage.mjs --rendered` → 源文本集 **61.4%** / 实际渲染集 **70.6%**（对照组通过） |
| 构建 | `npm run build` 退出码 0，产出单文件 `dist/index.html`（约 672 KB，5 个 woff2 已 base64 内联） |
| 离线性 | `dist/index.html` 可直接双击运行，无外部请求、无 JS 错误 |
| 来源可达性 | 核验时 **26 / 26 返回 HTTP 200**（复测窗口见 §7 的环境限制说明） |

---

## 0.1 浏览器入口边界（2026-10-22 用户长期约定）

用户已把**「Ego 浏览器是唯一网页入口」**定为长期约定。本目录据此明确区分两类浏览器用途：

| 用途 | 使用的浏览器 | 依据 |
| --- | --- | --- |
| **本地离线自测**（本文件 §2—§4 的全部脚本） | **本地无头 Chromium**（Playwright 驱动），只加载 `http://127.0.0.1:4330`（本地 `vite preview`）、`file://`（本地 `dist/index.html`）与 `data:`/`blob:` | 这是**本地零依赖自测，不访问任何外部站点**：`tools/qa/browser-check.mjs` 自身即断言「无外部网络请求（零 CDN）」与「dist 产物无外部请求」；16-design-system 的 `tools/verify-preview.mjs` 头部亦采用同一口径（"不访问任何外部站点 → 不受网页访问一律走 Ego 的约定约束"） |
| **线上验收 / 网页访问 / 联网检索 / 登录态截图** | **Ego 浏览器**（`ego-browser`，先跑 `ego-browser skill`） | 用户长期约定第 1 条。线上交互验收（含 Pages 实际 URL 的核心交互核验）由 **14-publish / 13-qa-curation** 在发布后执行 |

本目录的 QA 脚本全部通过 `BASE_URL` 环境变量支持指向任意地址，默认值恒为本地 `127.0.0.1:4330`；
**若需对线上地址做验收，请改用 Ego 浏览器**，不要直接把这些脚本指向线上 URL。

## 1. 单元 / 逻辑测试（`npm test`）

Node 内置 test runner，30 项 → 本次扩充为 **33 项**，全部通过。

| 测试文件 | 覆盖内容 |
| --- | --- |
| `tests/levels.test.js` | 关卡规模与色晶数、相邻段高差 ≤ 2 格、空隙 ≤ 3 格或已铺落脚板、落脚板与两侧地面各差 ≤ 1 格、出生点 / 检查点 / 敌人在实心地面、尖刺底座为实心、**尖刺宽度 ≤ 2 格**、**色晶不压在尖刺上**、**敌人巡逻范围不与尖刺落地区重叠**、目标闸门位置与实心地面、瓦片字符合法性 |
| `tests/physics.test.js` | 分轴 AABB 解算、下落撞地拦截、单向平台从下往上穿透 / 从上往下承接 / 上升不被托住、尖刺与色浆危险判定、重叠判定、`probeGround`、越界读取、高速下落不穿透 |
| `tests/data.test.js` | 展品与机型档案字段完整性、来源链接格式与去重、`imageLicense` 合法值、总量常量一致 |

```
ℹ tests 33
ℹ pass 33
ℹ fail 0
```

新增的 3 条关卡设计约束测试，是本轮为「关卡几何可通关性」补上的回归护栏
（原先尖刺宽度、色晶压尖刺、敌人堵落地区这三类问题没有任何测试拦截）。

---

## 2. 浏览器实机验收（`node tools/qa/browser-check.mjs`）

**38 项全部通过**。脚本自行拉起 `vite preview --host 127.0.0.1 --port 4330 --strictPort`，
结束后关闭该进程；页面内注入自动玩家，**走真实键盘事件、真实物理、真实碰撞**。

### 2.1 分组结果

| 组 | 通过项 |
| --- | --- |
| 展厅首页（6） | 标题正确、机型 15 条、展品 21 条、像素 Logo 已绘制、主视觉已绘制、节点协议 `PLAYTIME_ATLAS_NODE` 已暴露 |
| 展厅交互（3） | 分类筛选生效、展品面板展开且含 http(s) 来源链接、面板可关闭 |
| 平台冒险 UI（2） | 标题页出现、HUD 显示生命 / 色晶 / 关卡 / 计时 |
| 平台机制单测（6） | 跳跃离地 Δy=49.8、跳跃后落回地面、色晶可收集、闸门在集齐前保持关闭、检查点激活并记录复活点、死亡扣生命并在检查点复活 |
| 平台操作（1） | R 键重开本关回到出生点（x 600 → 50） |
| **自动玩家通关（3）** | 注入成功、**通关全部三关**、**全程 0 次死亡失误**、胜利结算画面出现 |
| 触控（1） | 触控虚拟按键可驱动角色移动（位移 51.6px，松手 vx=0） |
| 等距测绘所（6） | 9 处展台、地形 30×22、展台索引同步、图例 5 项、点击展台展开展品面板（含 2 条来源）、画布坐标拾取命中、缩放与昼夜切换 |
| iframe 嵌入（3） | iframe 内正常加载并暴露节点协议、显示嵌入提示并隐藏外链、无 JS 错误 |
| 运行时卫生（2） | 无控制台报错、无外部网络请求（零 CDN） |
| 离线产物（3） | `dist/index.html` 可直接双击运行、无外部请求、无 JS 错误 |

### 2.2 自动玩家实机通关结果

```
✔ 自动玩家注入成功
✔ 自动玩家通关全部三关 — state=victory 关卡=3 用时=45s 帧=2609
   levels=[{"index":0,"name":"黎明色阶","shards":3,"cleared":true},
            {"index":1,"name":"晶脉天梯","shards":3,"cleared":true},
            {"index":2,"name":"暮光熔炉","shards":3,"cleared":true}]
✔ 胜利结算画面出现 — 远征完成
✔ 自动玩家全程无死亡失误 — 死亡 0 次
```

三关 **每关 3/3 色晶、全部 cleared=true、全程 0 次死亡**，共 2609 帧 / 45 秒。
逐关耗时与帧数见 `tools/qa/report.json`（`botLevels` / `botFrames` / `botDeaths`）。

**稳定性**：同一构建连续复跑 3 次，结果完全一致——

| 轮次 | 结果 | 用时 / 帧数 | 死亡 |
| --- | --- | --- | --- |
| 1 | 38/38 通过 | 45s / 2609 | 0 |
| 2 | 38/38 通过 | 44s / 2618 | 0 |
| 3 | 38/38 通过 | 45s / 2621 | 0 |

（机器人的行为会受敌人巡逻相位影响，因此「三关全过」是稳定结果而非偶然一次。）

> 机器人在页面内运行，读取的是**真实关卡网格与实体状态**，通过派发真实
> `KeyboardEvent` 驱动角色；它不知道任何"通关捷径"，跑的是与人类玩家完全相同的
> 物理、碰撞、敌人与闸门逻辑。因此这条结果是「关卡在几何与手感上确实可通关」的实测证据。

### 2.3 本轮为让自动玩家通关而做的**关卡侧**修复

这些不是"为了让测试通过而放宽难度"，而是**对人类玩家同样不公平**的摆放，已逐条落到
`src/platform/levels.js` 并由 §1 的新测试锁死：

| # | 问题 | 后果（人类玩家同样会遇到） | 修复 |
| --- | --- | --- | --- |
| 1 | 第 3 关色晶 (36,9) 位于尖刺 (35–36,10) 正上方 | 跳起拾晶的同一次跳跃必然踩到尖刺，**无解** | 色晶移到 (39,9) |
| 2 | 第 3 关色晶 (108,11) 紧贴尖刺 (106–107,12) 落地区 | 需要帧级精确的跳跃才能既拾晶又越刺 | 色晶移到 (104,11) |
| 3 | 第 3 关尖刺 (56,12) 宽 3 格 | 3 格宽尖刺要求连续 48px 滞空，而满跳射程仅 ≈74px，余量不足 10px | 改为 2 格宽 |
| 4 | 第 3 关尖刺 (56–58 / 75–77) 紧贴落脚板落地区 | 从落脚板跳下时落地即踩到尖刺 | 分别后移到 (58–59) / 移出该段 |
| 5 | 第 3 关地面敌人巡逻区与尖刺落地区重叠 | 落地瞬间与敌人重叠必死 | 敌人重排到有余裕的段落 |
| 6 | 第 2 关浮游敌人巡逻区覆盖**强制跳跃弧线** | 跨越深坑的必跳弧线必然撞上浮游敌人，**无解** | 浮游敌人上移并缩小巡逻范围 |

新增护栏（`tests/levels.test.js`）：尖刺宽度 ≤ 2 格、色晶不压在尖刺上、
地面敌人巡逻范围不与尖刺落地区重叠。

### 2.4 本轮为让自动玩家通关而做的**测试工具侧**修复

这些是 `tools/qa/browser-check.mjs` 里机器人自身的缺陷，与作品本体无关，
但其中两条**暴露了引擎的真实问题**，已一并修掉：

| # | 机器人缺陷 | 根因 / 影响 |
| --- | --- | --- |
| 1 | 死亡位置记录的是**复活后的检查点坐标**，不是死亡点 | 死亡记录写在 `state !== 'playing'` 的提前 `return` 之后；诊断结论因此完全失真 |
| 2 | 每帧"点按"跳跃键 → 上升期反复触发**松键截断** | 跳跃高度被腰斩（上升 49px → 实际 24px），落点大幅前移、掉进坑里 |
| 3 | 按住跳跃键跨越落地 | 下一次"想跳"不会有新的 `keydown`，7 帧跳跃缓冲过期后再也起不了跳 → 走进尖刺 |
| 4 | 尖刺起跳窗口上限算错（48px） | 正确窗口是 `d ∈ [12.6, 36]`（d = 尖刺左边缘距角色），按 48px 起跳会落在尖刺上 |
| 5 | 落点安全检查未把**高于地面 1 格的落脚板**算作支撑 | 误判为"无处可落"，跳进深坑 |
| 6 | 落点距离估算过于乐观（按 74px） | 实测落点随地形高度差浮动在 74~86px，改为多候选距离全部安全才算安全 |
| 7 | 空中掉进空隙时也按下跳跃键 | 留下"落地即起跳"的缓冲，刚落地就莫名弹起、撞进尖刺 |
| 8 | 尖刺探测只看**当前身体行** | 玩家腾空时脚下的尖刺被漏检 |
| 9 | 不会避让浮游敌人 | 会主动跳进浮游敌人身上 |

其中第 2、3 条在定位过程中暴露了**引擎侧的真实缺陷**：角色在上升期若松开跳跃键，
会被 `jumpCut` 截断成"半截跳"（已在 `PlatformGame` 中保留 `jumpMinHold` 的最小按住帧数约束）；
第 5 条暴露了 `supportBelow` 只从当前脚底行向下扫描、看不到上方 1 格的落脚板。

### 2.5 改版批带来的**测试工具侧**调整（2026-10-21 第二轮）

改版本身不涉及玩法，但把外壳换成 token 化的暗色主题后，暴露出两处**验收工具自身的时序缺陷**，
它们在改版前恰好不发作。已修复并复跑确认：

| # | 工具缺陷 | 根因 | 影响 |
| --- | --- | --- | --- |
| 10 | 自动玩家按**渲染帧**决策，而游戏是 **16.67ms 定步长** | 一个渲染帧可能推进多个物理步 → 机器人"慢半拍"，偶发撞上敌人 | 成绩不可复现（同一份代码 0 死 / 2 死都出现过） |
| 11 | 机器人的落点安全检查**只看尖刺与支撑**，不看敌人 | 会落在地面敌人的巡逻范围内，被敌人走过来撞死 | 第 3 关偶发 1–2 次死亡 |

修复方式：把机器人包在游戏的 `update()` 前面（**每个物理步决策一次**，与真人操作同频），
并在落点判定中补上"敌人巡逻范围"检查。
修复后连续复跑：三关全通、**0 次死亡**、每关 3/3 色晶。

| # | 工具缺陷 | 根因 | 影响 |
| --- | --- | --- | --- |
| 12 | 验收脚本在**元素位移中点击** | 改版引入的入场动画（`translateY(24px)`）作用在整块区块上，筛选条位移期间点击会落到相邻按钮 | 「展品分类筛选生效」偶发失败（实测 6 次里错 1 次） |

修复方式有二（都做了）：
① **产品侧**：入场动画改为只作用于**区块标题**（静态文本），
含交互控件的区块本身不再位移 —— 这同时修掉了一个真实的手感缺陷
（用户在区块滑入的瞬间点筛选 chip 可能点错相邻 chip）；
② **工具侧**：验收脚本在交互前 `settle()`（等 `document.fonts.ready` + 所有 CSS 过渡/动画结束）。

### 2.5.1 接入三步重构带来的**测量工具侧**新增（2026-10-21 第三轮）

15 派单把 16 的 `fonts/` 整目录（含 **Noto Sans SC 中文子集**）接入本目录，
随之产生一个必须回答的问题：**这个子集覆盖本作品多少汉字？**

环境约束（三条路都堵死）：

| 尝试 | 结果 |
| --- | --- |
| `fonttools` + `brotli`（Python） | 本机未安装，且沙箱 HTTPS 出站被阻断，无法 pip 安装 |
| Node 内置 `zlib.brotliDecompressSync` 直接解 woff2 | **解不开**：对 5 个字体全部返回 0 字节且不报错（或 `ERR__ERROR_FORMAT_HUFFMAN_SPACE`） |
| Chromium 的 `DecompressionStream('brotli')` | 该版本**不支持** `'brotli'`（Playwright 的 WebKit / Firefox 未安装） |

最终改用 **CDP 逐字字体归属法**（`CSS.getPlatformFontsForNode`）：把子集注入为 `FontFace`、
字体列表只列它，逐字查询实际绘制字体。过程中还发现并修正了一个**测量方法本身的假阳性**：

| 尝试 | 缺陷 | 修正 |
| --- | --- | --- |
| 朴素像素差（Noto 独渲染 vs 参照字体独渲染） | 不同字体的 `.notdef` 形状不同 → 子集缺字时两者必然不同 → **768 个生僻字样本被全部误判为「覆盖」** | 改用字形归属信号（CDP），并用像素比对**排除 `.notdef`** |
| CDP 归属 + `.notdef` 基准 | CDP 把「子集缺字时画出的 `.notdef`」也算到被测字体头上 → 扩展 B 区字被误判为「覆盖」 | 补 `.notdef` 像素排除后，阴性对照通过 |

最终结果与方法见 **§4.3**（含阳性/阴性对照组，对照组不通过时脚本直接退出码 1）。

### 2.6 键盘 / 触控操作细节

`src/platform/input.js` 把键盘与触控统一抽象为 `left / right / jump / restart / back`
五个动作，物理层不区分来源。跳跃为**可变高度**：轻点约跳 1 格，长按约跳 3.3 格
（重力 0.34、起跳 6.0、跑速 2.1px/帧 → 上升 ≈53px、水平射程 ≈74px）。
跳跃带 6 帧土狼时间与 7 帧输入缓冲；踩敌人可消灭并弹起，侧面接触则判定死亡。

---

## 3. D1 元素重叠检查（`node tools/qa/overlap-check.mjs`）

只读复用 `13-qa-curation/qa-harness/lib/checks.mjs` 的 `checkOverlaps`，
**未修改 harness 任何文件**。判定口径与 `13-qa-curation/qa-harness/run-qa.mjs` 对齐
（页面初始滚动位置），另加 badge×标题专项在页顶与滚到底各测一次。

```
✔ desktop 1440x900 — 全站文字元素重叠数 0
   desktop 1440x900: 未发现文字互相压盖（按实际字形行盒判定，候选 271 个）
✔ desktop 1440x900 — badge×标题重叠数 顶部 0 / 底部 0（共 2 张动线卡片）
✔ mobile 390x844 — 全站文字元素重叠数 0
   mobile 390x844: 未发现文字互相压盖（按实际字形行盒判定，候选 270 个）
✔ mobile 390x844 — badge×标题重叠数 顶部 0 / 底部 0（共 2 张动线卡片）

D1 通过：两个视口下均为 0 处重叠。
```

修复前后对比：

| 视口 | 修复前全站重叠 | 修复前 badge×标题 | 修复后全站重叠 | 修复后 badge×标题 |
| --- | --- | --- | --- | --- |
| desktop 1440×900 | 2 对 | 2 对（66% / 61×16px、67% / 78×16px） | **0** | **0 / 0** |
| mobile 390×844 | 2 对 | 2 对 | **0** | **0 / 0** |

修复方式：`.route-card__badge` 从 `position: absolute` 改为**正常流中独占一行的块级元素**
（`display: block; width: fit-content; margin-bottom: 0.85rem`），`.route-card h3` 补 `margin-top: 0`。
不依赖 z-index / transform 掩盖，任意断点下都不可能相交。

---

## 4. 令牌与设计系统接入检查（`node tools/qa/token-check.mjs`）

改版批新增的自检脚本，把"外壳层已统一到 16 的规范 token"这件事变成**可机械复核**的结论。
接入三步重构后，脚本改为校验**拷贝件 + 规范取值 + 接线**三层：

| 检查项 | 期望 | 实测 |
| --- | --- | --- |
| 拷贝件逐字节一致 | `assets/ds/{tokens,components}.css`、`assets/ds/fonts/*` 的 sha256 与 16 相同 | 全部一致（12 个字体文件逐一核对） |
| `--ds-*` 取值 == `16-design-system/design-tokens.json` | 浅色 `:root` 对浅色组、暗色组对暗色组，逐项等价值相等 | 逐项比对 **141 项全等**（PASS） |
| `--ds-*` 声明位置唯一 | 只允许在 `assets/ds/tokens.css`（本目录自有样式不得重定义） | 通过（组件作用域属性如 `--ds-btn-h` 放行，与 16 的 components.css 同款） |
| 样式中引用的 `--ds-*` 全部有定义 | 无悬空引用 | 通过 |
| 必备令牌 | accent / bg / ink / line / gutter / radius-media / ease-out / dur-base / type-h3 / rail-width / rail-inset / max-width / read-width / canvas-hud-bg / canvas-scrim / focus-ring / target-min | 全部存在 |
| 机制保真 | `--ds-type-h3: 20px`、指示器 `clamp(36px,8vh,64px)`、768px 断点、`prefers-reduced-motion`、44px 触摸目标 | 全部命中 |
| 中文排版 | `--ds-track-cjk: 0` + `:lang(zh)` 规则 + 对 16 三处负字距的归零覆盖 | 命中 |
| 接入三步接线 | `index.html` 注入 `--ds-base`、`<body class="ds-shell">`、`#app` 上不再挂 `ds-shell`、`src/main.js` 四个样式的 import 顺序、5 条本地覆盖齐备、旧 token 层文件已删除 | 全部通过 |
| 字体自托管 | `assets/ds/fonts/fonts.css` 无外部 URL、5 个 woff2 与 5 份 OFL 全文齐全、`font-display: swap`、`FONT-MANIFEST` 声明文件齐全 | 通过 |

```
令牌：:root 129 个 + 暗色组 21 个；与 JSON 核对 141 项
· 拷贝一致：assets/ds/tokens.css ≡ 16/src/tokens.css（sha256 e9595d51336f…）
· 拷贝一致：assets/ds/components.css ≡ 16/src/components.css（sha256 a602f4143823…）
✅ token-check: PASS
```

**关于「等价不逐字」**：16 的 `tokens.css` 与 `design-tokens.json` 之间存在若干**表述差异**，
脚本按等价规则容错（rgba alpha 前导零 `0.10`≡`0.1`、`var()` 间接引用解析、字体栈允许多出通用回退族、引号风格），
不把它们当作不一致：

- 字体栈 3 处（16 的 tokens.css 额外含 `BlinkMacSystemFont` / `Source Han Sans SC`，且字族顺序不同）、
- `--ds-shadow-3` 的 `0.10` / `0.3`、`--ds-work-dim` 的 `0.30` / `0.3`、
- `--ds-grid-gap` / `--ds-grid-gutter` 在 CSS 侧写成 `var(--ds-space-5)` / `var(--ds-space-gutter)` 的间接引用。

### 4.3 Noto Sans SC 子集汉字覆盖率实测（`node tools/qa/font-coverage.mjs --rendered`）

15 派单要求「随包分发后须实测汉字覆盖率并如实写入限制节」。测量方法与结果：

| 项 | 内容 |
| --- | --- |
| 方法 | **逐字字体归属法**：把子集注入为 `FontFace`（`font-family` 列表只列它），每个汉字单独一个 `<span>`，用 CDP 的 `CSS.getPlatformFontsForNode` 逐个查询「该字形实际由哪个字体绘制」；报告为 `Noto Sans SC` = 子集提供该字形，报告为系统字体 = 走系统回退 |
| `.notdef` 排除 | CDP 会把「子集缺字时画出的 .notdef」也算到被测字体头上，故再与扩展 B 区必缺字的基准做像素比对，命中基准者判为未覆盖 |
| 阳性对照 | 常用字「的一是在不人有他」全部命中 → 通过 |
| 阴性对照 | 扩展 B 区 `U+20000` / `U+2A6D6` 全部未命中 → 通过 |
| 源文本集 | **971** 个唯一汉字（`index.html` + `src/**` 18 个文件，保守上界）→ 覆盖 **596（61.4%）**、未覆盖 375 |
| 实际渲染文本集 | **585** 个唯一汉字（Playwright 抽取四个路由 + 面板 + HUD）→ 覆盖 **413（70.6%）**、未覆盖 172 |
| 真实页面字体归属 | 展厅首屏的中文实际由 **PingFang SC** 绘制 → **该子集在装有中文字体的系统上根本不会被启用** |

> **为什么不用「像素差直接判覆盖」**：不同字体的 `.notdef` 形状不同，子集缺字时
> 「Noto 独渲染」与「参照字体独渲染」会因 `.notdef` 不同而被误判为覆盖。
> 实测：仅 768 个生僻字样本上，朴素像素法把**全部 768 个**误判为覆盖。
> 本脚本因此改用 CDP 的字形归属信号，并把对照组写进脚本，结论不成立时直接退出码 1。
>
> **为什么不用 `fonttools` 解 woff2**：本机无 `fonttools` / `brotli`；
> Node 内置 Brotli 也解不开本批 woff2（返回 0 字节且不报错）；
> Chromium 的 `DecompressionStream` 不支持 `'brotli'`（Playwright 的 WebKit / Firefox 未安装）。

**结论（已写入限制节）**：该子集覆盖本作品用字的 61.4%（源文本集）/ 70.6%（实际渲染集），
字重为 Thin（细体）；但因它排在全部「覆盖完整的系统 CJK 族」之后，
**在装有中文字体的系统上不会被启用**，汉字一律由系统黑体绘制、缺字逐字回退，不会出现缺字方框；
仅当系统完全没有 CJK 字体时才会生效，此时未覆盖字形回退到通用 sans-serif。

### 4.4 四档视口无障碍自检（`node tools/qa/viewport-a11y-check.mjs`）

覆盖 15 派单通用硬性要求中与视口/无障碍相关的四项。只读复用 13 的 `qa-harness`
（`checkLayout` 横向溢出 / `checkFocus` 焦点与 Tab），对比度与触摸目标在本脚本内实现。

| 视口 | 横向溢出 | 焦点 / Tab | 正文对比度 | 触摸目标 |
| --- | --- | --- | --- | --- |
| 1440×900 | 无，溢出元素 **0** | 46 个可聚焦元素，Tab 可移动焦点，**8/8** 焦点态可见 | 344 个文本节点，不足 **0** 处 | 不足 **0** 个 |
| 1280×800 | 无，溢出元素 **0** | 同上 | 不足 **0** 处 | 不足 **0** 个 |
| 768×1024 | 无，溢出元素 **0** | 同上 | 不足 **0** 处 | 不足 **0** 个 |
| 390×844 | 无，溢出元素 **0** | 同上 | 不足 **0** 处 | 不足 **0** 个 |
| `#/platform` 1440×900 | 溢出 0 | — | 不足 **0** 处 | — |
| `#/iso` 1440×900 | 溢出 0 | — | 不足 **0** 处 | — |
| 展品面板（覆盖层）1440×900 / 390×844 | — | — | 不足 **0** 处 | 不足 **0** 个 |

**触摸目标按 16 的两档口径**（MIGRATION-NOTES §5.1，与 16 的 `verify-preview.mjs` 同款）：
**AA ≥24px** 对全部可交互元素（硬性），**AAA ≥44px** 只对主控件（`.ds-btn` / `.ds-iconbtn` 且非 `.ds-btn--sm`）。
紧凑变体豁免存在的原因是「为满足 44px 把紧凑按钮放大到 44px 会撑破原布局」（§5.1 明列禁止）。

> **本轮据此查出一处真实 AA 缺陷并修复**：页脚「来源与差异说明」与展品面板内的来源链接，
> 属正文/面板内的**行内文本链接**，16 的组件层未覆盖，其点击区高度 = 行高（实测 **21px < 24px**）。
> 已在 `src/styles/main.css` §A6 用 `display:inline-block; padding-block:2px; min-height:24px`
> 增高点击区（不改变行盒高度与基线对齐），修复后四档视口与覆盖层均归零。

### 4.5 16 的两个自测脚本交叉验证（`validate-tokens.mjs` / `verify-preview.mjs`）

16-design-system 的「规范就绪」告知要求跑 `node tools/validate-tokens.mjs && node tools/verify-preview.mjs`。
这两个脚本会**把自己的 evidence 写进 16 自己的目录**，而本目录的写入边界只到 `10-era-console/`，
故采用**只读借用**的方式执行：把 16 的脚本 + `design-tokens.json` + `preview.html` 复制到临时目录，
并用**本目录实际交付的那份拷贝件**（`assets/ds/tokens.css`、`assets/ds/components.css`、`assets/ds/fonts/`）填充 `src/` 与 `fonts/`，
再在临时目录里运行 —— 既不写入 16 的目录，又验证的正是我发出去的那批文件。

| 脚本 | 结果 |
| --- | --- |
| `tools/validate-tokens.mjs` | **PASS：errors 0 / warnings 1**（213 个 JSON 令牌、130 个 CSS 变量；唯一 warning 是 `motion.easing.spring` 的 y 分量越界 —— 16 自己的规范值） |
| `tools/verify-preview.mjs` | **PASS：errors 0 / warnings 0** |

`verify-preview.mjs` 的逐项结果（以本目录的拷贝件为 CSS/字体来源渲染 16 的 preview.html）：

| 检查项 | 结果 |
| --- | --- |
| 四档视口（1440 / 1280 / 768 / 390） | 封面渲染、**关键组件齐备 12 类**、**无横向溢出**（scrollWidth == viewportWidth）、零外部请求（9 个请求全为本地） |
| 样式表解析 | `fonts.css:5  tokens.css:20  components.css:167  inline:28`，**CSS 规则 220 条已生效** |
| 自托管字体加载 | Space Grotesk / Inter / Space Mono×2 / **Noto Sans SC 均 `loaded`** |
| 文本对比度 | 12 项全达标，**最低 4.93**（≥4.5） |
| 触摸目标 | **全部 ≥24px（AA）**；主控件与图标按钮**全部 ≥44px（AAA）** |
| reduced-motion | `dur-base=1ms`、系统 `prefers-reduced-motion` 生效（`matches:true`）、封面过渡 `0.001s` |
| 深色主题 | `bg=rgb(16,15,14)`、`ink=#f7f4f0`、`accent=#e0684a`（与 16 暗色组逐值一致） |
| 控制台错误 | **0 条** |

> **首跑出现过一次 `desktop-1280` 的 `FATAL timeout Runtime.evaluate`**，原样重跑即通过。
> 该错误形态与本目录 QA.md §8 第 7 条记录的**环境性超时**一致（共享机器 swap 42.5/44 GB、load 22–37），
> 且 16 自己的脚本注释即写明「超时只说明机器负载高，不构成产品缺陷」。

### 4.6 16 的全库 token 审计（`tools/ds-audit-tokens.mjs`）与运行时实测

16-design-system 的「复测确认」通知要求按 V.11–V.13 口径复核字体栈顺序。
本目录的实测结论（该脚本为只读审计，直接指向本目录）：

```
10-era-console   🟢   必备缺0 必备值差0 | 全量: 声明 129 缺0 值差0 暗色组0 额外0 | 顺序问题0
                  10-era-console/assets/ds/tokens.css
```

> 脚本自己定位到的令牌文件路径就是 `10-era-console/assets/ds/tokens.css`——
> 因为本目录已按 15 派单「接入三步」改为**拷贝 16 的文件到 `assets/ds/`**，
> 自建的 `src/styles/tokens.css` 已不存在（见 `STATUS.md` §6.7.1）。

**字体栈顺序（V.11）**：脚本判定 `Noto Sans SC` 的下标必须**晚于**所有系统 CJK 族
（PingFang SC / Hiragino Sans GB / Microsoft YaHei / Source Han Sans SC），否则报「顺序问题」。
本目录实际取值（`assets/ds/tokens.css:57-60`，与 16 源文件逐字节一致）：

```css
--ds-font-display: "Space Grotesk", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "Source Han Sans SC", "Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif;
--ds-font-text: "Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "Source Han Sans SC", "Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif;
```

**子集未被删除**（V.11 的另一半要求）：`assets/ds/fonts/noto-sans-sc-subset.woff2` 随包分发，
`@font-face` 保留，`Noto Sans SC` 族名保留在栈中且位于系统 CJK 族之后 ——
即「系统栈整体不可用」场景的兜底仍在。

**运行时实测**（本目录 `dist/` 产物，Chromium 实测计算值）：

| 项 | 实测值 | 期望 |
| --- | --- | --- |
| `<html data-ds-theme>` | `dark` | 暗色主题 |
| `<body class>` | `ds-shell` | 16 派单接入三步 ③ |
| `--ds-bg` / `--ds-ink` / `--ds-accent` | `#100f0e` / `#f7f4f0` / `#e0684a` | 与 16 暗色组逐值一致 |
| `--ds-font-text` / `--ds-font-display` | Noto Sans SC **晚于** 4 个系统 CJK 族 | V.11 合规 |
| `body` 计算背景 | `rgb(16, 15, 14)` | 16 的 `--ds-bg` |
| `body` 字距 / 行高 | `normal` / `29.6px`（16px × 1.85） | 中文归零 + 行高 1.85 |
| `--ds-base`（运行期） | `./` | 相对基准，适配任意子路径与 `file://` |
| Noto Sans SC 加载状态 | `document.fonts.check(...)` → **true** | 子集可用 |

## 5. 构建与离线性

```
$ npm run build
vite v5.4.11 building for production...
✓ built in 0.6s
dist/index.html   （单文件，约 672 KB，CSS/JS + 5 个 woff2 全内联）
```

- `dist/` 内**只有** `dist/index.html`，无任何外部引用；
- `base: './'` → 适配 GitHub Pages 任意子路径；
- `format: 'iife'` + 内联 → **可直接双击 `file://` 离线运行**（经典脚本不受模块 CORS 限制）；
- 浏览器实测：`file://` 打开后机型 15 条 / 展品 21 条 / Logo 已绘制 / **0 条外部请求 / 0 个 JS 错误**。

---

## 6. 来源可达性核验

```bash
bash scripts/verify_exhibit_sources.sh   # 从 src/data/exhibits.js 抽取唯一来源链接逐条请求
```

核验时结果：**共 26 条唯一来源链接，26 / 26 返回 HTTP 200**（逐条事实对照见 `SOURCES.md` §2）。

脚本本轮加了两处健壮性改进：
1. 逐条请求之间限速（0.8s），避免触发维基百科对高频请求的限流；
2. 单条失败（`000` = 连接失败）自动重试 3 次并递增退避。

> **复测窗口的环境限制**：本文件定稿前再次运行该脚本时，运行环境对**所有**站点的
> HTTPS 出站连接被临时阻断（`curl https://example.com` 同样返回 `000`，
> `SSL_ERROR_SYSCALL`，而 DNS 解析与 ICMP 均正常），属于沙箱网络策略，
> 与链接本身无关。逐条低速复测中，之前批量失败的 Wikipedia 条目单独请求均返回 200。
> 如需在网络正常的环境复核，直接运行上述脚本即可。

---

## 7. 复现方式

```bash
cd 10-era-console
npm install                 # 仅 vite@5.4.11
npm test                    # 33 项逻辑测试
npm run build               # 产出 dist/index.html
bash scripts/verify_exhibit_sources.sh   # 26 条来源可达性

cd tools/qa && npm install  # playwright 1.64.1（独立于交付包，不进 dist）
cd ../.. && node tools/qa/overlap-check.mjs   # D1 重叠检查（两断点）
node tools/qa/token-check.mjs               # 令牌与设计系统接入自检
node tools/qa/font-coverage.mjs --rendered  # Noto Sans SC 子集覆盖率实测
node tools/qa/browser-check.mjs              # 38 项浏览器实机验收
```

`tools/qa/` 是**独立 npm 包**（自带 `package.json`），Playwright 与其浏览器二进制
**不进入交付产物**，也不影响 `dist/` 的体积与依赖树。

截图产物：`screenshots/01-hall.png`（展厅首页）、`01b-exhibit-panel.png`（展品面板）、
`02-platform-title.png`（平台冒险标题页）、`03-platform-victory.png`（通关结算）、
`04-iso-exhibit.png`（等距展品面板）、`05-iso-scene.png`（等距场景全貌）、
`06-iframe.png`（iframe 嵌入）、`07-dist-offline.png`（`file://` 离线产物）。
机器化报告：`tools/qa/report.json`。

---

## 8. 已知限制

1. **自动玩家 ≠ 人类手感**：脚本机器人能通关只能证明**关卡在几何与物理上可通关**，
   不能替代真人评测；它的反应窗口与决策规则是脚本化的，不代表普通玩家水平。
2. 展品事实主要依赖英文维基百科（次级来源），单源条目占比高，未做多源互证；
   「位数」等硬件参数口径不一，页面与 `SOURCES.md` 均已标注。
3. **中文**依赖操作系统中文字体（拉丁字体已自托管为 OFL），不同系统字形与字距会有差异。
4. 音频需用户手势后启动（浏览器自动播放策略），页面提供音效开关。
5. 等距测绘所的热点交互在桌面端实测；**触屏拖拽 / 双指缩放未纳入自动化验收**
   （浏览器自动化对多指手势的支持有限），该部分仍以代码走查与人工操作为准。
6. 本目录**不含**任何部署 / 推送动作；上线由 `14-publish` 统一执行。
7. **共享机器的环境性崩溃**：本轮复跑期间，宿主机内存压力极大
   （实测 swap 已用 42.5 / 44 GB、系统 load average 22–37），
   操作系统会直接杀掉浏览器进程，表现为
   `Target page, context or browser has been closed`（**整页被关闭、浏览器断开**，
   而非渲染进程 crash 事件）。
   这是环境事件而非产品缺陷：同一份代码在压力缓解后稳定通过。
   验收脚本已加入**整轮自动重试**（最多 3 次）并在日志中如实标注该事件。
8. 改版批的以下维度**无参考站实测依据，属本批自定**：
   默认暗色主题、覆盖层锚定在画布框内（不套用整屏灯箱）、
   CRT 扫描线与封面硬阴影保留原写法、画布语义色在 DOM 侧的保留边界。
   逐条清单见 `RESTYLE-INVENTORY.md` §5 与 `STATUS.md` §5。
9. **随包分发的 Noto Sans SC 子集只覆盖本作品用字的 61.4%（源文本集）/ 70.6%（实际渲染集）**，
   且字重为 Thin（细体）。实测方法与对照组见 §4.3。
   由于它在字体栈中排在全部「覆盖完整的系统 CJK 族」之后，
   **在装有中文字体的系统（macOS / Windows / 主流 Linux）上不会被启用**，汉字一律由系统黑体绘制；
   仅当系统完全没有 CJK 字体时才会生效，此时未覆盖字形回退到通用 sans-serif
   （不会缺字，但字重与字形与系统黑体不同）。
10. **16 的 `components.css` 基础 `.ds-btn` 的 `--ds-btn-h` 指向 `--ds-space-10`（128px）**，
    与 MIGRATION-NOTES §5.1 的 44px 主控件口径不符。本目录在 `src/styles/main.css` §A1 做了
    **本地增量覆盖**（改为 `--ds-target-min`），未修改 `assets/ds/` 下的拷贝件（保持 sha256 一致）。
    该覆盖为**本批自定**，未与 16 的维护方回改上游，建议 16 侧同步修正。
11. 覆盖率测量**未使用 `fonttools`**（本机无该工具与 `brotli`；Node 内置 Brotli 解不开本批 woff2；
    Chromium 的 `DecompressionStream` 不支持 `'brotli'`），
    改用 CDP 逐字字体归属法。该方法依赖 Chrome 的字体回退行为，
    在其他引擎（Firefox / Safari）上未做交叉验证。
