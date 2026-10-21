# 18-architecture-models · 榫构华夏 · Timber Craft Lab

> 中国传统建筑结构可拆解 3D 教学模型 / Explorable 3D structural models of Chinese traditional architecture

## 任务定位

本目录是 **18 号任务**，唯一作者为 MiniMax Code（M3.1-Flash / max）。
交付一个可静态部署的 Web 应用，用程序化生成的真实几何 3D 模型，向不懂中国建筑的读者解释
中国传统木构与石构的**构造逻辑**与**受力路径**。

Codex 仅调度，不参与实现；本目录不得改动其它任务目录，也**不负责** GitHub 同步与 Pages 上线
（由 `14-publish` 统一执行）。

## 必须交付的 6 件模型（教学示意，非施工/工程模型）

| # | id | 中文名 | English | 核心教学点 |
|---|----|--------|----------|-----------|
| 1 | `dougong` | 斗栱组 | Dougong Bracket Set | 层叠出跳、荷载分级传递、柱头科/平身科 |
| 2 | `mortise` | 榫卯连接 | Mortise & Tenon Joints | 燕尾榫 / 透榫 / 半榫 / 馒头榫，无钉可拆可逆 |
| 3 | `taoliang` | 抬梁木架 | Post-and-Beam Frame | 梁架层层抬升、柱承梁梁承檩 |
| 4 | `chuandou` | 穿斗木架 | Column-and-Tie Frame | 密柱承檩、穿枋拉结、柱承檩 |
| 5 | `stone-arch` | 敞肩石拱桥 | Open-Shoulder Stone Arch | 单孔坦弧、敞肩减重泄洪、推力传桥台 |
| 6 | `tulou` | 土楼 / 院落结构 | Tulou & Courtyard Section | 夯土承重墙厚、内部木构、环形防御与通风 |

## 每件模型必须具备的交互能力

1. 轨道相机：**旋转 / 缩放 / 平移**
2. **构件选择**：点击构件 → 高亮 + 双语标注卡（中文名 / 拼音 / 英文名 + 一句作用说明）
3. **爆炸拆解**：滑杆连续控制构件沿爆炸方向散开
4. **分步组装**：顺序播放构件就位（assembly steps）
5. **剖切**：平面剖切（clipping plane）+ **层级开关**（按构件族/层显示隐藏）
6. **结构受力示意**：定性受力箭头（`教学示意，非施工/工程模型`；箭头为定性说明非工程计算）
7. **GLB 导出**：真实几何导出 `.glb`
8. **降级插图**：WebGL 不可用时提供 2D SVG 降级插图

## 技术约束

- 依赖优先 npm；**全部资源本地化**，零 CDN、零在线 API、零外部字体请求
- 必须适配 **GitHub Pages 子路径**（相对路径资源，`base: './'`）
- 中英双语可切换（英文默认），全部可交互元素具备无障碍名称
- 支持 `prefers-reduced-motion`
- 仅写本目录；不得下载未授权模型冒充自制 → 所有几何**程序化生成**
- 与真实建筑比例/构造不完全一致处显著标注 **"教学示意，非施工/工程模型"**

## 交付物清单

- `TASK.md`（本文件）、`STATUS.md`
- `package.json` / `vite.config.js` / `src/` / `public/`
- `dist/` 可静态构建产物（供 14-publish 集成）
- `README.md`、`manifest.json`（id,title,description,entry,buildCommand,outputDir,status）
- `SOURCES.md`（来源与许可）、`LICENSES.md`
- `QA.md` + `qa/` 自动化断言 + `screenshots/` 实拍截图
- `RESEARCH-NOTES.md`（构造知识来源与不确定度）

## 验收标准

- `npm run build` 成功产出 `dist/`
- QA 脚本全部断言通过（构件数、交互、双语、GLB 导出、reduced-motion、降级路径）
- 6 件模型均可旋转缩放、选中、爆炸、组装、剖切、切换层级、显示受力箭头
- 截图证据真实反映运行状态
- 无任何外部网络请求（构建产物中 0 个 CDN 引用）
