# 色块远征 · CHROMA VOYAGE

### 1990s 家用机可玩展厅 —— 回响电玩馆 / PLAYTIME ATLAS 时代节点 `console16`

> 一个**完全原创**的 1990 年代家用机展厅子站，包含一件可通关的 16 位风格横版平台冒险、
> 一个等距视角的可交互探索场景，以及 21 条带来源链接的科普展品。
> **全部美术、字体与音乐在运行时程序化生成**——没有一张位图、没有一段音频文件、没有一个 CDN 请求。

| | |
| --- | --- |
| 工作目录 | `/Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/10-era-console` |
| 开发 / 预览端口 | `127.0.0.1:4330`（`strictPort`） |
| 构建 | `npm run build` → `dist/`（`base: './'`，适配 GitHub Pages 任意子路径） |
| 单元测试 | `npm test`（30 项，Node 内置 test runner） |
| 浏览器实机验收 | `node tools/qa/browser-check.mjs`（Chrome headless） |
| 部署 | 由 `14-publish` 统一负责，本目录**不含**任何部署动作 |

---

## 快速开始

```bash
cd 10-era-console
npm install          # 只装 vite（构建期依赖）
npm run start        # 自动装依赖并启动 http://127.0.0.1:4330/
```

其他命令：

```bash
npm run build        # 产出 dist/（可直接双击 dist/index.html 离线打开）
npm run preview      # 用 4330 端口预览已构建产物
npm test             # 30 项逻辑测试
npm run verify:sources   # 核验展品来源链接可达性
```

> **端口说明**：`npm run dev` / `npm run preview` 均固定监听 `127.0.0.1:4330`（`strictPort: true`），
> 与本批次约定一致。

---

## 展厅里有什么

### 展项 01 —— 《色块远征：棱晶峡谷》（16 位风格平台冒险）

主角**墨豆 INKBEAN**是一台被丢在色块地带的方形勘探机器人。它要穿过三段地形，
把散落的 **9 枚色晶**带回跃迁塔。

| 关卡 | 名称 | 特点 |
| --- | --- | --- |
| 1 | 黎明色阶 | 教学：跳跃、单向落脚板、首个敌人、两个检查点 |
| 2 | 晶脉天梯 | 纵向攀爬，升降 / 平移移动色台，紫色晶体地形 |
| 3 | 暮光熔炉 | 尖刺、熔浆色浆、长距离跳跃，橙红熔炉地形 |

已实现的机制：

- **跳跃**——可变跳跃高度（松键截断）、土狼时间 6 帧、跳跃缓冲 7 帧
- **碰撞**——瓦片 AABB 分轴解算；实心块阻挡、单向平台（可从下穿过）、下落限速防穿透
- **检查点**——触碰激活并记录复活点，死亡后在该点复活
- **收集物**——每关 3 枚色晶；**集齐后跃迁塔才会开启**
- **胜负**——生命 3 条；耗尽进入失败结算；三关通关进入总胜利结算并记录最佳用时
- **重开**——`R` 键重开本关；结算面板提供"重玩本关 / 从头开始 / 返回展厅"
- **敌人**——棱刺（地面巡逻，踩扁消灭）、巡块（空中巡逻）；侧面接触扣一条命
- **触控 + 键盘**——方向 / 跳 / 重开；移动端显示虚拟按键（`pointerdown` 事件，禁用选中与滚动）

### 展项 02 —— 《等距测绘所》（等距探索互动场景）

一座 30×22 的等距测绘庭院。2:1 等距投影，按 `gx+gy` 递增做画家算法深度排序，
瓦片按地形类型预烘焙为「顶面 / 左壁 / 右壁」贴图。

- **9 处可点击展台**（街机柜 / 晶盒陈列架 / 光盘塔 / 多边形工位 / 扫描线示波台 / 双筒目镜台 / 掌机展柜 / PC 工程台 / 测绘标尺），
  点击展开对应的技术展品与来源链接
- **昼夜切换**、动态水面波纹、漂移云层、星空、展台悬浮标记与标签
- **操作**：拖拽平移 / 滚轮缩放 / 方向键平移 / `+` `−` 缩放 / 展台索引列表点选 / `Esc` 关闭面板
- 场景地形由**带种子的值噪声**生成，同一种子结果完全一致（已在测试中断言）

### 展厅首页

- 像素风主视觉、机型导览（15 款）、科普展品（21 条，可按类别筛选）
- 每条展品面板含**可点击的来源链接**与「引用 ≠ 授权」提示
- 「来源与差异说明」区块明确写出：参考了什么、重新设计了什么、已知限制

---

## 原创性说明

本项目**不是**任何既有作品的复刻。我们参考的是公开作品的**机制与品质标准**
（跳跃手感分层、等距深度排序、"用当时的硬件约束解释当年的画面"这一策展思路），
并**重新设计**了：

| 维度 | 本项目 |
| --- | --- |
| 作品名 | 《色块远征》/ `CHROMA VOYAGE` |
| 角色 | 墨豆 INKBEAN、棱刺 CUSP、巡块 WISP、色晶 SHARD、锚信标 ANCHOR |
| 关卡 | 三关全部手工编排，配自动落脚板系统保证可达性 |
| 配色 | `--ink #101018` / `--mint #5ee0b8` / `--coral #ff7a6b` / `--sun #ffd166` / `--sky #6aa9ff` / `--violet #b48aff` |
| 字体 | 自制 5×7 点阵字模（`src/ui/pixelFont.js`），**不加载任何字体文件** |
| 美术 | 逐像素手绘精灵 + 运行时 Canvas 程序化图形，**零位图** |
| 音乐 | 五首原创芯片曲 + 两段过场，WebAudio 实时合成，**零音频文件** |

未使用任何商业 ROM、截帧、封面、Logo、商标字体或品牌视觉。详见 [`LICENSES.md`](./LICENSES.md)。

---

## 目录结构

```
10-era-console/
├─ TASK.md              任务拆解与验收标准
├─ STATUS.md            阶段状态与变更日志
├─ README.md            本文件
├─ SOURCES.md           展品逐条来源台账 + 核验方法与结果
├─ LICENSES.md          资产许可与差异说明
├─ QA.md                验收记录（单元测试 + 浏览器实机 + 截图）
├─ manifest.json        交付清单（id/title/description/entry/buildCommand/outputDir/status）
├─ package.json / vite.config.js
├─ index.html           展厅三视图结构
├─ scripts/
│  ├─ start.sh                      一键启动
│  ├─ verify_sources.sh            候选来源批量可达性核验
│  └─ verify_exhibit_sources.sh    从真实数据文件抽取并核验展品来源
├─ src/
│  ├─ main.js             路由 / 展厅渲染 / 视图挂载 / 嵌入协议
│  ├─ styles/main.css     原创视觉系统
│  ├─ data/exhibits.js    科普展品 + 机型档案（含 sourceUrls）
│  ├─ platform/
│  │  ├─ physics.js       瓦片 AABB 碰撞（纯函数）
│  │  ├─ levels.js        3 关坐标 DSL 与构建器
│  │  ├─ spriteData.js    像素精灵数据（纯数据）
│  │  ├─ sprites.js       精灵烘焙 / 瓦片贴图 / 闸门绘制
│  │  ├─ renderer.js      天空 / 视差 / 瓦片 / 实体 / HUD
│  │  ├─ input.js         键盘 + 触控统一输入层
│  │  └─ PlatformGame.js  状态机 + 固定步长物理
│  ├─ iso/
│  │  ├─ terrain.js       高度图生成与等距投影
│  │  ├─ hotspots.js      展台定义与放置
│  │  └─ IsoScene.js      等距渲染 / 相机 / 交互
│  ├─ audio/AudioEngine.js  程序化芯片音乐 + 音效引擎
│  └─ ui/
│     ├─ pixelFont.js     自制 5×7 点阵字体
│     ├─ icons.js         程序化图标
│     └─ Overlay.js       通用覆盖层
├─ tests/               30 项 Node 内置测试
├─ tools/qa/            浏览器实机验收（独立依赖，不进 dist）
└─ screenshots/         实机截图
```

---

## 与 06 主站 / 14 发布的对接

### 嵌入协议

页面暴露：

```js
window.PLAYTIME_ATLAS_NODE = {
  id: '10-era-console',
  title: '色块远征 · 1990s 家用机可玩展厅',
  era: 'console16',
  eraLabel: '1990s 家用机时代',
  year: 1990,
  entry: 'index.html',
  ready: true,
  route: 'hall' | 'platform' | 'iso' | 'sources',
};
```

父页面可发送消息切换展项：

```js
iframe.contentWindow.postMessage(
  { type: 'playtime:nav', node: '10-era-console', section: 'platform' },
  '*'
);
```

被 iframe 嵌入时自动：显示「已嵌入展厅视图」提示条、隐藏「返回总馆」外链。

### 部署约束（已满足）

- `vite.config.js` 使用 `base: './'` → `dist/` 可放在任意子路径
- `dist/index.html` 与产物中**无任何 `/` 绝对路径引用**
- `dist/` 可直接双击 `index.html` 离线运行（已在验收中实测）
- 运行期**零外部请求**（已在验收中监听 `request` 事件实测）
- `manifest.json` 指向 `entry: index.html` / `buildCommand: npm run build` / `outputDir: dist`

---

## 已知限制

1. 展品是**代表性选样**，不宣称覆盖 1990 年代全部主机与作品。
2. 展品事实**主要依赖英文维基百科条目**（次级来源），单源条目占比高，未做多源互证；
   「位数」等参数在不同来源中口径不一，已在页面与 `SOURCES.md` 中标注。
3. 页面依赖使用者操作系统的中文字体（不内嵌字体文件），不同系统字形会有差异。
4. 音频需用户手势后才能启动（浏览器自动播放策略），页面上有音效开关。
5. 本任务**不做部署**；上线由 `14-publish` 统一执行。

---

## 许可

代码与资产由本项目原创创作。
第三方依赖：`vite`（MIT，仅构建期）、`playwright`（Apache-2.0，仅测试期），
二者均不进入 `dist/` 产物。详见 [`LICENSES.md`](./LICENSES.md)。
