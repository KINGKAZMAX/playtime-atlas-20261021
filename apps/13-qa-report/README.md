# 13-qa-curation — 全作品试玩验收与差异审计

> 独立验收任务：**只读**本批 `00-research` … `12-era-modern` 产物，**只写**本目录。
> 不修改任何实现者文件，不参与 GitHub 写入（部署统一由 `14-publish` 负责）。

---

## 结论速览

| 作品 | 验收结论 | 一句话 |
| --- | --- | --- |
| **00-research** | ✅ **可上线** | 134 条案例逐条带来源与归属证据，8 条正确排除出 M3.1 Flash，零编造数字 |
| **01-web** | 🔄 施工中 | 入口 `src/main.ts` 未落地，暂不可测 |
| **02-model** | ⚠️ **需修复后上线** | 导出功能正常，但随包 GLB 未进构建产物 + 用了《沙丘》专有地名 Arrakis + 缺 README/manifest |
| **03-interaction** | ⛔ **未交付** | 目录为空 |
| **04-spaceflight** | ❌ **暂不上线** | **Blocker**：`makeRingTexture()` 引用未定义的 `data`，游戏完全无法启动 |
| **05-museum-research** | 🔄 施工中 | 已有抓取脚本与种子数据，`catalog.json` 未产出 |
| **06-museum-core** | 见矩阵 | — |
| **07-museum-art** | 🔄 施工中 | 资产包已产出 695 个文件，`index.html` 未落地 |
| **08—12** | 🔄 施工中 | 陆续落地，见 `QA-MATRIX.md` |

> 完整结论见 **`QA-MATRIX.md`**（作品 × 维度）与 **`issues.json`**（逐条可执行修复建议）。

---

## 目录

| 文件 | 内容 |
| --- | --- |
| `TASK.md` | 任务契约、维度定义、严重级别、完成定义 |
| `STATUS.md` | 执行进度与关键判定记录 |
| `QA-CHECKLIST.md` | 逐作品 × 逐维度的勾选清单 |
| `QA-MATRIX.md` | **主报告**：作品 × 维度总矩阵 |
| `issues.json` | **机器可读**问题清单，每条含复现步骤与可复制修复建议 |
| `DIFF-AUDIT.md` | 原创差异与来源许可审计（8 项判定口径） |
| `HANDOFF-14.md` | 给发布任务的三类名单与行动清单 |
| `inventory.json` | 00—12 产物清点（文件数、构建命令、产出目录、状态） |
| `qa-harness/` | **可执行**验收方案（Playwright），见其 `README.md` |
| `evidence/` | 每次验收的原始 JSON（build 日志、逐项检查、console/网络记录） |
| `screenshots/` | 真实浏览器截图证据 |

---

## 怎么复现一次验收

```bash
cd 13-qa-curation/qa-harness
npm install
node run-qa.mjs                 # 全部目标
node run-qa.mjs --target=04-spaceflight
node build-reports.mjs          # 重新生成 QA-MATRIX.md / issues.json / inventory.json
```

harness 的三个设计约束：

1. **绝不写入实现者目录** —— 构建在临时副本中进行，`node_modules` 用符号链接复用。
2. **子路径优先** —— 站点一律挂在 `/playtime-atlas-20261021/exhibits/<id>/` 下访问，复现 GitHub Pages 真实形态（`vite preview` 做不到）。
3. **就绪闸门** —— 半成品记为 `in-progress`，**既不算通过也不算失败**。

---

## 验收方法

| 维度 | 怎么测 |
| --- | --- |
| D1/D2 桌面与移动 | 1440×900 与 390×844 双视口真实加载，检查页面级横向滚动、元素溢出、文字是否被压成逐字换行、空白页 |
| D3 开始/暂停/重置 | 读取页面暴露的状态机（`window.__deepSpaceDrifter.state` / `window.__lumenRally.state`），断言 `idle → countdown/playing → paused → reset` |
| D4 存档 | 写入 localStorage → **刷新页面** → 读回并校验 JSON 可解析、版本正确 |
| D5 键盘焦点 | 连续 Tab 采样 `document.activeElement`，检查焦点可移动 + 焦点环可见；**并做「未聚焦不响应 / 聚焦后响应」两段对照**（iframe 嵌入场景的硬要求） |
| D6 控制台 | 收集 `console.error` + `pageerror` + `unhandledrejection`，过滤已豁免噪声（favicon、自动播放策略、GLTF texture-merge 告警） |
| D7 资源 404 | `response.status >= 400` + `requestfailed`，**排除探针自己发起的请求** |
| D8 子路径 | 全程挂子路径前缀访问，任何资源解析失败即 fail |
| D9 模型导出 | 拦截 `URL.createObjectURL` 拿 Blob，**校验 GLB 容器头**（magic = `glTF`、header 长度 == 实际长度） |
| D10/D11/D12 | 静态审计：IP 引用检索、品牌 logo 检索、素材许可、交付文件齐备性、manifest 字段完整性 |

---

## 关键发现（完整版见 `issues.json`）

### Blocker

**`04-spaceflight` 的游戏完全无法启动。**
`src/gfx/Procedural.js:297` 的 `makeRingTexture()` 在第 302 行声明了 `const img = ctx.createImageData(width, 4)` 却**漏掉 `const data = img.data;`**，第 332–335 行直接写 `data[idx]`。
同一文件的 `makePlanetTexture`（第 215 行）等三个函数都有这一行 —— 只有它漏了。
`makeRingTexture` 由 `src/world/Universe.js:263` 在世界构建阶段调用，抛出的 `ReferenceError` 被 `src/main.js` 的 catch 吞掉，页面停在「启动失败」，状态机永远停在 `loading`。
**dev 与 build 都会失败**（已提交的 `dist/assets/index-D-o4Q023.js` 同样是坏的）。
修复只需补一行（见 `issues.json`）。

### Critical

**`04-spaceflight/STATUS.md` 的完成声明与磁盘事实不符。**
阶段表写着「文档 ✅（README、CONTROLS、QA）」「实机验证 ✅（浏览器全流程自测）」「截图 ✅（screenshots/ 内实机截图）」「**可交付**」——
但 `README.md`、`QA.md`、`CONTROLS.md`、`screenshots/`、`manifest.json` **五个文件全部不存在**，
且在「游戏根本无法启动」的前提下，这些声明无法成立。

### Major

- `02-model` 随包 `models/*.glb` **未进入构建产物**（该目录在项目根而非 `public/`，Vite 不复制）→ 部署后 404。
- `02-model` 直接使用《沙丘》专有地名 **Arrakis**（面板标题、Canvas 绘图文字、源码注释）→ 需换原创地名。
- `02-model` / `04-spaceflight` 均**缺 `README.md` 与 `manifest.json`** → 14-publish 无法按 manifest 接入。
- `04-spaceflight` 全局 `preventDefault('Tab')` 并把 Tab 改绑为「打开星图」→ 键盘完全无法在界面间移动焦点。

---

## 限制声明

- 触屏**手势**（滑动、双指缩放）未在真机上验证；触控结论基于 390×844 的 Chromium 模拟上下文与命中区域尺寸检查。
- 音频未做主观音质评估，只验证 AudioContext 可在用户手势后启动且无控制台报错。
- 性能未做量化（FPS 只读取页面自报值）。
- 无头 Chromium 与真机 Safari / iOS 的渲染差异未覆盖。
- 研究类任务（`00-research`、`05-museum-research`）按**文件级交付物**验收，不做浏览器维度判定。
- 本任务**不执行** GitHub 写入与部署；线上验收由 `14-publish` 在部署后进行。

---

## 来源与许可

- 本目录所有脚本、文档、报告均为本任务原创产出。
- `qa-harness` 依赖 `playwright-core`（Apache-2.0），**不下载浏览器**，复用本机 `~/Library/Caches/ms-playwright/chromium-1248` 缓存。
- 截图取自本批自有作品，未使用任何第三方素材。
- 本任务**只读**其他任务目录，未复制其任何素材到本目录。

---

*本任务的最终结论以 `QA-MATRIX.md` 与 `issues.json` 为准；两者均由 `qa-harness/build-reports.mjs` 从 `evidence/` 原始数据生成，可随时重跑复现。*
