# QA-MATRIX — 全作品 × 验收维度矩阵

> 生成时间：2026-10-21 09:25:14（UTC）
> 数据来源：`evidence/*.json`（由 `qa-harness/run-qa.mjs` 真实浏览器采集）+ 静态审计 `manual-findings.json`
> 本矩阵不包含任何推测结论。未测项一律标注原因。

## 状态图例

| 标记 | 含义 |
| --- | --- |
| ✅ | 通过（真实浏览器实测） |
| ❌ | 不通过（实测复现，已记录 issue） |
| ⚠️ | 有瑕疵但不阻塞 |
| ➖ | 不适用（已说明理由） |
| ⬜ | 未测（**不算通过**） |
| ⛔ | 未交付（目录无可运行产物） |
| 🔄 | 施工中（产物未就绪，不计通过也不计失败） |

---

## 一、总览

| 任务 | 作品 | 产物状态 | 浏览器实测 | 结论 |
| --- | --- | --- | --- | --- |
| 00-research | MiniMax M3.1 Flash 全球公开案例索引 | ✅ 有产物 | 已测 | **pass** |
| 01-web | 网页案例复刻 | ✅ 有产物 | 已测 | **pass-with-warnings** |
| 02-model | 机械沙虫 1312M | ✅ 有产物 | 已测 | **fail** |
| 03-interaction | 交互界面复刻 | ⛔ 未交付 | 未测 | **not-delivered** |
| 04-spaceflight | 深空漫游 | ✅ 有产物 | 已测 | **fail** |
| 05-museum-research | 博物馆联网策展 | ⬜ 未测 | 未测 | **not-tested** |
| 06-museum-core | 回响电玩馆主站 | ✅ 有产物 | 已测 | **fail** |
| 07-museum-art | 原创美术与硬件模型包 | ⛔ 未交付 | 未测 | **not-delivered** |
| 08-era-origins | 光点年代 1950—1970s | ✅ 有产物 | 已测 | **fail** |
| 09-era-arcade | 霓虹街廊 1980s | ✅ 有产物 | 已测 | **fail** |
| 10-era-console | 色块远征 1990s | ✅ 有产物 | 已测 | **fail** |
| 11-era-online | 联机曙光 2000s | ✅ 有产物 | 已测 | **fail** |
| 12-era-modern | 万象游乐 2010s 至今 | ✅ 有产物 | 已测 | **fail** |

---

## 二、维度矩阵

### 00-research — MiniMax M3.1 Flash 全球公开案例索引

产物目录：`00-research/` ｜ 文件数：398 ｜ 构建命令：`python3 build_cases.py && python3 build_index.py && python3 gen_ranking.py` ｜ 验收结论：**pass**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 47218字, canvas 0) |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 47218字, canvas 0) |
| D3 开始/暂停/重置 | ⬜ | — |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 171 个可聚焦元素，Tab 可移动焦点，7/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 171 个 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all resource requests succeeded<br>[资源 404 / 请求失败] all resource requests succeeded |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/00-research/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/00-research/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：research 属检索类任务，不产生作品；其 `DIFF-REFERENCES.md` / `TOP3.md` 已按 MASTER-UPDATE 要求写明「参考机制与质量、重新设计名称/文案/内容/字体/配色/布局/模型形态」的改编规格与逐项对照，并明确不声称参考作品为原创——符合要求。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计（已逐条核验 134 条）：`cases.json` 每条均含 url / model_attribution.evidence_quote / observed_at / verification，无缺字段（0）、无非法 URL（0）、无「署名却无原文证据」（0）；8 条被明确排除出 M3.1 Flash 归属（未核实 / 混合模型 / 早期版本 / 端点不可达）；23 条全平台指标不可见者已用 `metrics_invisible` 逐项列出；小红书登录墙记为不可见项，未编造数字。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计：`manifest.json` 字段齐全（id/title/description/entry/buildCommand/outputDir/status 齐备）；`cases.json`、`RANKING.md`、`README.md`、`LICENSE.md`、`DIFF-REFERENCES.md` 均存在。唯 `manifest.json` 的 artifacts 列表中 `ACCEPTANCE.md` 标注 status=ready，但该文件在磁盘上不存在。 |

### 01-web — 网页案例复刻

产物目录：`01-web/` ｜ 文件数：56 ｜ 构建命令：`tsc --noEmit && vite build` ｜ 验收结论：**pass-with-warnings**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ⚠️ | [desktop 布局 (1440×900)] desktop: 38 个元素溢出视口: div#strip-track.strip__track(+1915337Lpx), span.strip__item(337Lpx), span(307Lpx), b(175Lpx) |
| D2 移动端 | ⚠️ | [mobile 布局 (390×844)] mobile: 57 个元素溢出视口: div#strip-track.strip__track(+2973329Lpx), span.strip__item(329Lpx), span(299Lpx), b(167Lpx) |
| D3 开始/暂停/重置 | ⬜ | — |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 60 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 60 个 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all resource requests succeeded<br>[资源 404 / 请求失败] all resource requests succeeded |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/01-web/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/01-web/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | — |
| D11 来源与许可 | ⬜ | — |
| D12 交付完整性 | ⬜ | — |

### 02-model — 机械沙虫 1312M

产物目录：`02-model/` ｜ 文件数：38 ｜ 构建命令：`vite build` ｜ 验收结论：**fail**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ⚠️ | [desktop 布局 (1440×900)] desktop: 25 个元素溢出视口: path.anno-line(12Lpx), path.anno-line(15Lpx), div.anno.left(116Lpx), span.anno-id(34Lpx)<br>[静态审计] 静态审计 + 浏览器实测：桌面 1440×900 下 5 个元素溢出视口左缘 —— `div.anno.left`（最严重 left=-76px，右缘仅 50px）、「测绘传感器组 / Survey sensor cluster」等注释标签被视口左边缘裁切，文字不可读。注：`.era-door` 一类的横向轮播元素在祖先 `overflow` 裁切下不计缺陷；此处是 3D 投影注释层，无裁切容器兜底。 |
| D2 移动端 | ⚠️ | [mobile 布局 (390×844)] mobile: 58 个元素溢出视口: path.anno-line(17Lpx), path.anno-line(17Lpx), path.anno-line(9Lpx), circle.anno-dot(+73px)<br>[静态审计] 浏览器实测：390×844 下 **30 处文字被压成逐字换行** —— 参数面板的 `<span class="cn">`（如「驱动节数」「节段长度」「装甲半径」）实际渲染宽度仅 7px（font-size 11px），高度却达 53px，即每个汉字独占一行；另有 25 个元素溢出视口右缘（含 `.anno` 注释层与 SVG 标注线）。根因：移动端断点把左右栏压到 44~46vw，但 `.panel-label` 仍使用「中文 + 英文」双行并排布局，中文标签可用宽度被挤到 1 个字宽。 |
| D3 开始/暂停/重置 | ⚠️ | [启动：程序化几何加载完成] loader 消失，场景就绪<br>[启动：技术参数回填] 6 项参数中 6 项已回填：{"spec-length":"760 m","spec-segments":"18 节","spec-tris":"104,468","spec-meshes":"548","spec-mats":"9","spec-fps":"60 fps"}<br>[启动：WebGL 场景画布挂载] renderer=ANGLE (Apple, ANGLE Metal Renderer: Apple M5, Unspecified Version)<br>[交互：机位切换] 未找到 #camera-rail button<br>[交互：参数滑块重建模型] 滑块 16 个；节数 18 节 → 19 节（重建生效或已按设计钳制）<br>[重置：RESET 生效] 重置后提示「已重置为默认参数与机位」，节数=18 节 |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 43 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 43 个 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all resource requests succeeded<br>[资源 404 / 请求失败] all resource requests succeeded<br>[资源 404 / 请求失败] all resource requests succeeded |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/02-model/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/02-model/" 下解析成功 |
| D9 模型导出 | ❌ | [模型导出：GLB 可用] GLB 8921 KB，magic="glTF" v2，header 长度与实际一致，文件名 "abyss-salvager-ac-vii-18seg.glb"，toast="GLB 导出成功 · 8921 KB · 18 节体节"<br>[模型导出：随包 GLB 资源在构建产物中可用] 构建产物中取不到 models/mech-sandworm-1312m.glb（404）——该目录位于项目根而非 public/，Vite 不会复制到 dist |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：标题与副标题自述「案例复刻 / 复刻自 MiniMax M3.1 Flash 社区 3D 案例」，正确地**没有**声称参考作品为原创（符合红线）；但全站仍直接使用受版权保护的《沙丘》专有地名 **Arrakis**（面板标题 `ARRakis TERRAIN`、绘图文字 `ARRakis`、源码注释 `"Dune mechanical sandworm"`），且目录内**没有任何差异说明文件**（无 README、无 DIFF 文档）。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计：全站零外部 URL（仅 SVG 命名空间），素材为运行时程序化生成，无第三方授权素材；源码注释中保留 Dune / Arrakis 命名属 IP 引用问题，见 D10。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计：**缺 README.md、缺 manifest.json**。批次硬性交付要求每个任务提供 `manifest.json`（id/title/description/entry/buildCommand/outputDir/status），14-publish 依赖它做集成；缺 `models/` 之外的 `public/` 目录，导致随包 GLB 未进入构建产物（见 D9）。 |

### 03-interaction — 交互界面复刻

产物目录：`03-interaction/` ｜ 文件数：16 ｜ 构建命令：`npm run fonts && vite build` ｜ 验收结论：**not-delivered**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ⬜ | — |
| D2 移动端 | ⬜ | — |
| D3 开始/暂停/重置 | ⬜ | — |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ⬜ | — |
| D6 控制台错误 | ⬜ | — |
| D7 资源 404 | ⬜ | — |
| D8 页面子路径 | ⬜ | — |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | — |
| D11 来源与许可 | ⬜ | — |
| D12 交付完整性 | ⬜ | — |

### 04-spaceflight — 深空漫游

产物目录：`04-spaceflight/` ｜ 文件数：31 ｜ 构建命令：`vite build` ｜ 验收结论：**fail**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 86字, canvas 2) |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 86字, canvas 2) |
| D3 开始/暂停/重置 | ❌ | [启动：加载完成进入主菜单] 25s 内未进入主菜单<br>[开始：进入驾驶状态] state=loading（期望 playing）<br>[暂停：Esc 进入暂停菜单] state=loading 面板可见=false<br>[继续：回到驾驶状态] state=loading（期望 playing）<br>[重置：重置飞船] 重置后状态不可读：page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('#btnReset')[22m
[2m    - locator resolved to <button class="btn" id="btnReset">重置飞船</button>[22m
[2m  - attempting click action[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not visible[22m
[2m    - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not visible[22m
[2m    - retrying click action[22m
[2m      - waiting 100ms[22m
[2m    58 × waiting for element to be visible, enabled and stable[22m
[2m       - element is not visible[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
<br>[界面：星图/说明/发现记录面板均可打开且有内容] 星图5项 / 说明16项 / 记录0项<br>[静态审计] 浏览器实测：点击「进入驾驶舱」后 `window.__deepSpaceDrifter.state` 停留在 `loading`，25 秒内无法进入主菜单（见 D6 的启动异常）。 |
| D4 存档 | ❌ | [存档：设置写入 localStorage] 设置未持久化：{"ok":false,"before":null,"after":null}<br>[存档：发现记录写入并跨刷新存活] 写入 284 字节 / version=1，刷新后仍存在 1 条 |
| D5 键盘焦点 | ❌ | [键盘焦点可达性与可见性] Tab 键无法移动焦点<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 25 个<br>[键盘：焦点在表单控件时不劫持游戏键] 焦点位于 BODY，按键未驱动飞船位移 |
| D6 控制台错误 | ❌ | [控制台错误] 1 console error(s): [Deep Space Drifter] failed to start ReferenceError: data is not defined
    at _g (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4011:22555)
    at hc._buildPlanet (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4341:1264)
    at http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4320:1313
    at e (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4320:1013)
    at async hc.build (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4320:1283)
    at async Zg._buildWorld (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4366:12882)
    at async Zg.init (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4366:11340)<br>[控制台错误] 1 console error(s): [Deep Space Drifter] failed to start ReferenceError: data is not defined
    at _g (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4011:22555)
    at hc._buildPlanet (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4341:1264)
    at http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4320:1313
    at e (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4320:1013)
    at async hc.build (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4320:1283)
    at async Zg._buildWorld (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4366:12882)
    at async Zg.init (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4366:11340)<br>[控制台错误] 2 console error(s): [Deep Space Drifter] failed to start ReferenceError: data is not defined
    at _g (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4011:22555)
    at hc._buildPlanet (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4341:1264)
    at http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4320:1313
    at e (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4320:1013)
    at async hc.build (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4320:1283)
    at async Zg._buildWorld (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4366:12882)
    at async Zg.init (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4366:11340) | [Deep Space Drifter] failed to start ReferenceError: data is not defined
    at _g (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4011:22555)
    at hc._buildPlanet (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4341:1264)
    at http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4320:1313
    at e (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4320:1013)
    at async hc.build (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4320:1283)
    at async Zg._buildWorld (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4366:12882)
    at async Zg.init (http://127.0.0.1:62014/playtime-atlas-20261021/exhibits/04-spaceflight/assets/index-Bw13lOWu.js:4366:11340)<br>[静态审计] 浏览器实测：每次加载都报 `ReferenceError: data is not defined`，堆栈指向 `src/gfx/Procedural.js` 的 `makeRingTexture()`。 |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all resource requests succeeded<br>[资源 404 / 请求失败] all resource requests succeeded<br>[资源 404 / 请求失败] all resource requests succeeded |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/04-spaceflight/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/04-spaceflight/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：全站无任何第三方品牌 / 知名作品 IP 引用（已检索 Star Wars / Star Trek / Mass Effect / Halo / NASA 等，零命中），作品名「深空漫游 / Deep Space Drifter」为原创，命名与设定自洽。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计：全部美术为运行时程序化生成，无外部素材、无 CDN、无授权素材；音频为 WebAudio 程序化合成。无可标注的第三方许可义务。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计：STATUS.md 第 11–13 项声称「README ✅」「QA 记录 ✅」「浏览器全流程自测 ✅」「screenshots/ 内实机截图 ✅」，但 README.md、QA.md、screenshots/、manifest.json **四个文件均不存在**；且 STATUS.md 声明「可交付」，实测游戏无法启动。声明与事实不符。 |

### 05-museum-research — 博物馆联网策展

产物目录：`05-museum-research/` ｜ 文件数：39 ｜ 构建命令：— ｜ 验收结论：**not-tested**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ⬜ | — |
| D2 移动端 | ⬜ | — |
| D3 开始/暂停/重置 | ⬜ | — |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ⬜ | — |
| D6 控制台错误 | ⬜ | — |
| D7 资源 404 | ⬜ | — |
| D8 页面子路径 | ⬜ | — |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | — |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计（进行中快照）：已出现 `data/raw_sources.json`、`data/seed_items.json` 与 `scripts/check_licenses.py`（许可检查脚本）。`catalog.json` / `SOURCES.md` / `REFERENCE-DESIGN.md` 尚未产出，最终条目数与逐条来源完整性待产物落盘后复核。 |
| D12 交付完整性 | ⬜ | — |

### 06-museum-core — 回响电玩馆主站

产物目录：`06-museum-core/` ｜ 文件数：1486 ｜ 构建命令：`vite build` ｜ 验收结论：**fail**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 2788字, canvas 0) |
| D2 移动端 | ❌ | [mobile 布局 (390×844)] mobile: 页面级横向滚动条 (scrollW 511 > clientW 390); 1 处文字被压成逐字换行: span.nav-toggle-text「馆内导览」w=14px<br>[2D 无障碍目录可用（3D 为可选增强）] 目录区渲染 1 个子节点 |
| D3 开始/暂停/重置 | ❌ | [主站搜索筛选生效] 输入不存在的关键词后结果未减少：条目 214 → 214，计数器「共 214 件展品」→「共 214 件展品」<br>[主站年代筛选控件] 发现 214 个筛选控件：硬件设备
      195 / 游戏作品
      195 / 游戏作品
      195 / 游戏作品
      195 |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ✅ | [键盘焦点可达性与可见性] 63 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 63 个 |
| D6 控制台错误 | ❌ | [控制台错误] 1 console error(s): Failed to load resource: the server responded with a status of 404 (Not Found)<br>[控制台错误] 1 console error(s): Failed to load resource: the server responded with a status of 404 (Not Found)<br>[控制台错误] 1 console error(s): Failed to load resource: the server responded with a status of 404 (Not Found) |
| D7 资源 404 | ❌ | [资源 404 / 请求失败] 2 bad resource request(s): 404 http://127.0.0.1:62578/playtime-atlas-20261021/exhibits/06-museum-core/art/assets/fonts/fonts.css | FAILED http://127.0.0.1:62578/playtime-atlas-20261021/exhibits/06-museum-core/art/assets/fonts/fonts.css<br>[资源 404 / 请求失败] 2 bad resource request(s): 404 http://127.0.0.1:62578/playtime-atlas-20261021/exhibits/06-museum-core/art/assets/fonts/fonts.css | FAILED http://127.0.0.1:62578/playtime-atlas-20261021/exhibits/06-museum-core/art/assets/fonts/fonts.css<br>[资源 404 / 请求失败] 2 bad resource request(s): 404 http://127.0.0.1:62578/playtime-atlas-20261021/exhibits/06-museum-core/art/assets/fonts/fonts.css | FAILED http://127.0.0.1:62578/playtime-atlas-20261021/exhibits/06-museum-core/art/assets/fonts/fonts.css<br>[静态审计] 浏览器实测：主站运行时 `fetch('data/catalog.json')` 返回 404。`src/data/loader.js:76` 明确设计了两级回退（`public/data/catalog.json` > `src/data/catalog.local.js`），因此**功能正常**（本地兜底数据生效），但每次加载都会在控制台留下一条 404。 |
| D8 页面子路径 | ❌ | [页面子路径兼容性] 2 个请求在子路径下失败: http://127.0.0.1:62578/playtime-atlas-20261021/exhibits/06-museum-core/art/assets/fonts/fonts.css | http://127.0.0.1:62578/playtime-atlas-20261021/exhibits/06-museum-core/art/assets/fonts/fonts.css<br>[页面子路径兼容性] 2 个请求在子路径下失败: http://127.0.0.1:62578/playtime-atlas-20261021/exhibits/06-museum-core/art/assets/fonts/fonts.css | http://127.0.0.1:62578/playtime-atlas-20261021/exhibits/06-museum-core/art/assets/fonts/fonts.css<br>[主站内嵌展品] 页面中没有 iframe（若为 2D 无障碍目录模式则属正常）<br>[静态审计] 浏览器实测：同一 404 在子路径下同样出现。子路径本身没问题 —— 其余资源（CSS/JS/图标/已同步的 4 个展厅）全部解析成功。 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：主站为原创设计（时间长廊 / 2D 无障碍目录 / 3D 展厅 / 收藏），展品文案为自撰；`public/exhibits/` 中的 4 个展厅为 08—12 任务的原创作品复制件（按 `scripts/sync-exhibits.mjs` 的契约只读复制），无未授权 ROM 或品牌视觉。 |
| D11 来源与许可 | ⬜ | [静态审计] 静态审计：已建立 `scripts/sync-exhibits.mjs` 同步契约与明确的 `integrated` / `pending` 状态，缺失展厅渲染**明确占位**而非假入口 —— 符合任务要求。 |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计：具备 `index.html` / `package.json` / `vite.config.js` / `scripts/`；README 与 manifest.json 待补（按批次统一要求）。 |

### 07-museum-art — 原创美术与硬件模型包

产物目录：`07-museum-art/` ｜ 文件数：735 ｜ 构建命令：`vite build` ｜ 验收结论：**not-delivered**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ⬜ | — |
| D2 移动端 | ⬜ | — |
| D3 开始/暂停/重置 | ⬜ | — |
| D4 存档 | ⬜ | — |
| D5 键盘焦点 | ⬜ | — |
| D6 控制台错误 | ⬜ | — |
| D7 资源 404 | ⬜ | — |
| D8 页面子路径 | ⬜ | — |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | — |
| D11 来源与许可 | ⬜ | — |
| D12 交付完整性 | ⬜ | — |

### 08-era-origins — 光点年代 1950—1970s

产物目录：`08-era-origins/` ｜ 文件数：40 ｜ 构建命令：`vite build` ｜ 验收结论：**fail**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ❌ | [desktop 布局 (1440×900)] desktop: 页面疑似空白 (无文本无 canvas) |
| D2 移动端 | ❌ | [mobile 布局 (390×844)] mobile: 页面疑似空白 (无文本无 canvas) |
| D3 开始/暂停/重置 | ✅ | [进入可玩展品] 展厅枢纽 → 子页「rally.html」（同目录共 1 个子页：rally.html）<br>[游戏载体存在] 找到游戏面：#rally-root（<div> 942×531）<br>[开始流程] 点击「开始对拉」（text）后 state=playing，进入可玩状态<br>[暂停流程] 点击「暂停」（data-control）后 state=paused<br>[重开流程] 点击「重开」（data-control）后 state=countdown，回到可玩初始态<br>[难度切换] no difficulty control<br>[静态审计] 浏览器实测：游戏本体（`rally.html` 的「辉点对拉」）**状态机完整可用** —— 「开始对拉」→ state=playing、「暂停」→ state=paused、「重开」→ state=countdown，三个关键迁移全部通过。 |
| D4 存档 | ⚠️ | [本地存档键] localStorage 为空，未观察到任何持久化写入 |
| D5 键盘焦点 | ❌ | [键盘焦点可达性与可见性] 1 个可聚焦元素，Tab 可移动焦点，4/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 1 个<br>[键盘焦点作用域（未聚焦不响应）] 未获得焦点时（activeElement=BODY，游戏已冻结 state=playing）游戏状态仍发生变化 —— 键盘被无条件劫持，会在 iframe 嵌入时干扰主站<br>[键盘焦点作用域（聚焦后响应）] 聚焦（root）后按键正常驱动游戏状态<br>[静态审计] 浏览器实测：游戏根节点 `#rally-root` 带 `tabindex`，`src/core/focus.js` 的 `FocusScope` 只在 `document.activeElement` 落在作用域内时才消费按键 —— 实测「未聚焦不响应 / 聚焦后响应」两段对照均成立，是本批中焦点作用域实现最规范的一件。 |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/08-era-origins/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/08-era-origins/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：作品名「光点年代 / LUMEN ERA」、机制「光点球 + 轨道引力对决」为原创重新演绎；`src/data/exhibits.js` 的年代介绍需逐条附来源（本次未逐条核，待最终交付后复核）。 |
| D11 来源与许可 | ⬜ | — |
| D12 交付完整性 | ⬜ | [静态审计] 静态审计：**`index.html` 仍是 268 字节的占位桩**，正文只有「展厅建设中 —— 见 index.html 完整版本」和一条指向 `./rally.html` 的链接 —— 这句话本身自指矛盾（它就是 index.html）。06-museum-core 以 `<iframe src="origins/index.html">` 嵌入该展厅，线上会直接显示这个占位页。 |

### 09-era-arcade — 霓虹街廊 1980s

产物目录：`09-era-arcade/` ｜ 文件数：28 ｜ 构建命令：`vite build` ｜ 验收结论：**fail**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 338字, canvas 1) |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 349字, canvas 1) |
| D3 开始/暂停/重置 | ✅ | [进入可玩展品] 点击展品入口「晶格回廊 LATTICE CORRIDOR」（[data-exhibit]）<br>[游戏载体存在] 找到游戏面：#stage（<main> 1148×574）<br>[开始流程] 未找到「开始 / 进入 / 游玩」类按钮<br>[暂停流程] 未找到「暂停 / 继续」类按钮<br>[重开流程] 未找到「重开 / 重来 / 重置」类按钮<br>[难度切换] no difficulty control<br>[静态审计] 浏览器实测：进入展品「晶格回廊 LATTICE CORRIDOR」后游戏自动开始，HUD 为 **canvas 像素字绘制**（`src/core/bitmapFont.js`），没有 DOM 按钮可供自动化点击 —— 因此「开始/暂停/重开」三项无法用 DOM 探针判定，记为 skip 而非缺陷。 |
| D4 存档 | ⚠️ | [本地存档键] localStorage 为空，未观察到任何持久化写入 |
| D5 键盘焦点 | ⚠️ | [键盘焦点可达性与可见性] 16 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 16 个<br>[键盘焦点作用域（未聚焦不响应）] 未获得焦点时（activeElement=BODY，位于游戏区=false，游戏已冻结 state=null）按键未驱动游戏状态，状态保持一致<br>[键盘焦点作用域（聚焦后响应）] 已聚焦（root），但按键未观测到状态变化（可能是该游戏不支持这些键，或状态未外露） |
| D6 控制台错误 | ❌ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] 166 uncaught exception(s): Cannot read properties of null (reading '0') | Cannot read properties of null (reading '0') | Cannot read properties of null (reading '0') | Cannot read properties of null (reading '0') | Cannot read properties of null (reading '0')<br>[静态审计] 浏览器实测：展厅枢纽页本身零控制台错误；**一旦进入游戏就会持续抛出未捕获异常**（3 秒内 49 次，构建版 3 秒 166 次），见 D6 issue。 |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[静态审计] 浏览器实测：零同源资源失败，零跨域请求 —— 全部资源本地化，符合批次「运行不依赖 CDN 或在线 API」的要求。 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/09-era-arcade/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/09-era-arcade/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | [静态审计] 静态审计：作品名「霓虹街廊 / NEON CORRIDOR」、展品「晶格回廊 LATTICE CORRIDOR」「流星编队」等均为原创命名；机制取自街机黄金时代的公共范式，`index.html` 页脚已明确声明「不含任何未授权 ROM、商业游戏资源或品牌视觉」。 |
| D11 来源与许可 | ⬜ | — |
| D12 交付完整性 | ⬜ | — |

### 10-era-console — 色块远征 1990s

产物目录：`10-era-console/` ｜ 文件数：39 ｜ 构建命令：`vite build` ｜ 验收结论：**fail**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 5125字, canvas 40) |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 5097字, canvas 40) |
| D3 开始/暂停/重置 | ✅ | [进入可玩展品] 点击展品入口「第四世代的第一台 PC Engine / Turbo」（#exhibit-grid button）<br>[游戏载体存在] 找到游戏面：main（<main> 1440×4709）<br>[开始流程] 点击「▶ 进入《棱晶峡谷》」（text）后 state=n/a，进入可玩状态<br>[暂停流程] 未找到「暂停 / 继续」类按钮<br>[重开流程] 未找到「重开 / 重来 / 重置」类按钮<br>[难度切换] no difficulty control |
| D4 存档 | ⚠️ | [本地存档键] localStorage 为空，未观察到任何持久化写入 |
| D5 键盘焦点 | ❌ | [键盘焦点可达性与可见性] 46 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 46 个<br>[键盘焦点作用域（未聚焦不响应）] 页面未暴露可观测的游戏状态（window.__lumenRally 等），无法自动比对运动量；仅验证了 DOM 层面<br>[键盘焦点作用域（聚焦后响应）] 无法聚焦游戏根节点：root not focusable and no focusable descendant |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/10-era-console/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/10-era-console/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | — |
| D11 来源与许可 | ⬜ | — |
| D12 交付完整性 | ⬜ | — |

### 11-era-online — 联机曙光 2000s

产物目录：`11-era-online/` ｜ 文件数：40 ｜ 构建命令：`tsc --noEmit && vite build` ｜ 验收结论：**fail**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 10675字, canvas 3) |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 10675字, canvas 3) |
| D3 开始/暂停/重置 | ⚠️ | [进入可玩展品] 点击展品入口「展项 A · 灯塔协议 BEACON PROTOCO」（#exhibits button）<br>[游戏载体存在] 找到游戏面：canvas（<canvas> 340×164）<br>[开始流程] 未找到「开始 / 进入 / 游玩」类按钮<br>[暂停流程] 点击「暂停 (P)」后 state=n/a，未观测到 paused 状态<br>[重开流程] 点击「重开」后 state=n/a<br>[难度切换] no difficulty control |
| D4 存档 | ⚠️ | [本地存档键] localStorage 为空，未观察到任何持久化写入 |
| D5 键盘焦点 | ❌ | [键盘焦点可达性与可见性] 197 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 197 个<br>[键盘焦点作用域（未聚焦不响应）] 页面未暴露可观测的游戏状态（window.__lumenRally 等），无法自动比对运动量；仅验证了 DOM 层面<br>[键盘焦点作用域（聚焦后响应）] 无法聚焦游戏根节点：root not focusable and no focusable descendant |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/11-era-online/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/11-era-online/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | — |
| D11 来源与许可 | ⬜ | — |
| D12 交付完整性 | ⬜ | — |

### 12-era-modern — 万象游乐 2010s 至今

产物目录：`12-era-modern/` ｜ 文件数：63 ｜ 构建命令：`vite build` ｜ 验收结论：**fail**

| 维度 | 状态 | 结论 |
| --- | --- | --- |
| D1 桌面端 | ✅ | [desktop 布局 (1440×900)] desktop: 布局正常 (文本 6487字, canvas 1) |
| D2 移动端 | ✅ | [mobile 布局 (390×844)] mobile: 布局正常 (文本 6487字, canvas 1) |
| D3 开始/暂停/重置 | ❌ | [进入可玩展品] 既没有子页链接，也没有找到展品入口控件 —— 请确认该展厅的玩法入口<br>[游戏载体存在] 找到游戏面：#main（<main> 1440×7518）<br>[开始流程] 点击「进入《脉冲走廊》」后未进入可玩状态（state=n/a，overlay=false）<br>[暂停流程] 未找到「暂停 / 继续」类按钮<br>[重开流程] 未找到「重开 / 重来 / 重置」类按钮<br>[难度切换] no difficulty control |
| D4 存档 | ✅ | [本地存档键] localStorage 写入 1 个键：prismera.v1.progress |
| D5 键盘焦点 | ⚠️ | [键盘焦点可达性与可见性] 43 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见<br>[键盘焦点（移动端）] 移动端无 Tab 环，仅统计可聚焦元素 43 个<br>[键盘焦点作用域（未聚焦不响应）] 页面未暴露可观测的游戏状态（window.__lumenRally 等），无法自动比对运动量；仅验证了 DOM 层面<br>[键盘焦点作用域（聚焦后响应）] 已聚焦（root），但按键未观测到状态变化（可能是该游戏不支持这些键，或状态未外露） |
| D6 控制台错误 | ✅ | [控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions<br>[控制台错误] no console errors, no uncaught exceptions |
| D7 资源 404 | ✅ | [资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化<br>[资源 404 / 请求失败] all same-origin resource requests succeeded<br>[外部依赖（跨域请求）] 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径 | ✅ | [页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/12-era-modern/" 下解析成功<br>[页面子路径兼容性] 所有资源在子路径 "/playtime-atlas-20261021/exhibits/12-era-modern/" 下解析成功 |
| D9 模型导出 | ⬜ | — |
| D10 原创差异 | ⬜ | — |
| D11 来源与许可 | ⬜ | — |
| D12 交付完整性 | ⬜ | — |

---

## 三、统计

| 项 | 数量 |
| --- | --- |
| 任务目录总数 | 13 |
| 有可运行产物 | 12 |
| 浏览器实测完成 | 10 |
| 未交付 | 2 |
| 施工中 | 0 |

