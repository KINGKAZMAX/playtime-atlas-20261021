# 验收记录 · QA Report
# 构筑华夏 / Built in China — Structures & Stories

> **结论：通过。** 静态校验 39/39，真实浏览器运行时自检 43/43 × 3 轮，布局与焦点诊断 0 问题。
> **Verdict: PASS.** 39/39 static checks, 43/43 runtime assertions across three passes, zero layout or focus problems.

- 验收日期：2026-10-21
- 浏览器：**ego-browser v2.1.0**（项目唯一浏览器入口；不自起 Chromium/Playwright）
- 构建：`npm run build` → `dist/`（Vite 5.4.11，`base: './'`，hash 路由）

---

## 1. 怎么跑 · How to run

```bash
npm install
npm run build

node scripts/validate.mjs                       # 静态校验      退出码 0 = 通过
node scripts/qa-runtime.mjs                     # 运行时自检    退出码 0 = 通过
node scripts/run-ego.mjs scripts/ego/diagnose.mjs   # 布局与焦点诊断 退出码 0 = 通过
```

三份脚本都以**退出码**表达结论，并把机器可读报告落盘：

| 报告 | 路径 |
| --- | --- |
| 运行时自检 | `evidence/qa/qa-runtime.json`（另有每轮明细 `evidence/qa/{pass}.json`） |
| 布局与焦点 | `evidence/layout/layout-diagnostics.json` |
| 实玩截图 | `evidence/screenshots/*.png` + `manifest.json` |

13-qa-curation 可直接引用上述 JSON，不必重跑。

---

## 2. 静态校验 · Static validation

`scripts/validate.mjs` —— **39 项，全部通过**（`All 39 checks passed.`）

| 组 | 检查数 | 覆盖内容 |
| --- | --- | --- |
| 1 · Catalog data | 5 | 42 例的必填字段、地域/时代/构造 id 合法、来源为 http(s) 且在 http-only 白名单内、每例至少一条一次来源、坐标落在合理经纬范围、id 唯一 |
| 2 · Glossary | 3 | 74 条术语的 id/中文/拼音/英文/类别/释义齐全，案例引用可解析，id 唯一 |
| 3 · Structural labs | 2 | 6 件模型；构件、层、步、受力箭头齐全且双语 |
| 3b · Model execution | 2 | **用真实 three.js 逐件构建**，与 `labs-meta.js` 一致；vendor 副本与 18 **逐字节相同** |
| 4 · Quiz | 2 | 10 题的题面/选项/答案/解析双语完整 |
| 5 · Bilingual strings | 3 | 每个键是完整二元组；`t()` 的字面量键全部可解析；无闲置键 |
| 5b · **Bilingual consistency** | **8** | 见 §3 |
| 6 · Asset & network hygiene | 8 | 源码无外部 URL、无网络调用、HTML 无外链、无 CDN/外网字体、CSS 无远程资源、只有系统字体栈、无 `@font-face`、无未授权二进制 |
| 7 · Build output | 4 | `dist/` 存在、HTML 无外链、资源走相对路径、three.js 独立成块且首屏不静态引入 |

### 3. 双语机械校验 · Bilingual consistency（供 13 直接引用）

第 5b 节的 8 条判定，**全部通过**：

| 检查名 | 结论 |
| --- | --- |
| `bilingual.everyKeyHasBothLanguages` | 215 个 i18n 键，中英两侧都非空 |
| `bilingual.englishSideHasNoChinese` | 任何英文串里都没有汉字（抓「中文串直接当英文用」） |
| `bilingual.dataEnglishSideHasNoChinese` | 数据层的英文字段里没有汉字 |
| `bilingual.noHardcodedChineseInRenderLayer` | 15 个渲染文件里没有硬编码中文文案（唯一例外：语言切换按钮上的「中文」字样，按语言自称，是正确做法，已登记白名单） |
| `bilingual.defaultIsEnglish` | `store.js` 的默认语言是 `en` |
| `bilingual.htmlLangIsSynced` | `setLanguage()` 写 `document.documentElement.lang` |
| `bilingual.deepLinkCarriesLanguage` | `?lang=` 深链接被认领 |
| `bilingual.everyRecordHasBothLanguages` | 42 案例 / 74 术语 / 6 实验室的每条记录都有双语 |

---

## 4. 运行时自检 · Runtime self-test

页面内自检（`src/qa.js`）**只在 URL 带 `?qa=1` 时动态载入**，不进入生产包。它驱动真实 UI：真实点击、真实 hash 路由、真实筛选、真实语言切换。

**三轮，各 43 项，全部通过：**

| 轮次 | 视口 | 结果 |
| --- | --- | --- |
| `desktop-1440` | 1440×900 | **43 / 43** |
| `mobile-390` | 390×844 | **43 / 43** |
| `reduced-motion` | 1440×900 + `prefers-reduced-motion: reduce` | **43 / 43** |

覆盖的 43 项：

```
shell.topbar / shell.footer / shell.hero
network.firstScreenHasNoThree          ← 首屏不含 three.js
hero.stats.count / hero.stats.nonzero
map.hotspots / map.hotspots.focusable   ← 热点可键盘到达且有标签
catalog.cards / catalog.deepLinks
timeline.eras / atlas.regions
filter.region / filter.reset
i18n.dynamicFiltersSwitch               ← 动态筛选 chip 随语言切换
i18n.dynamicCardTagsSwitch              ← 动态卡片标签随语言切换
i18n.switch / i18n.chineseRendered
i18n.urlParam / i18n.switchBack / i18n.urlParamBack   ← ?lang= 双向同步
route.case / route.case.sources / route.case.figures
route.labs / route.lab.stage / route.lab.panel / route.lab.notice
route.glossary
route.quiz / route.quiz.start / route.quiz.answer
route.saved / route.sources
favourites.persist
network.noExternal / network.threeOnlyAfterLab
a11y.lang / a11y.skipLink / a11y.mainLandmark / a11y.h1 / a11y.buttonsLabelled
render.noObjectArtifacts             ← 任何路由都不得出现 [object ...] 渲染残渣
```

---

## 5. 布局与焦点 · Layout and focus

`scripts/ego/diagnose.mjs` —— 在真实浏览器里，对 **6 条路由 × 2 个视口 = 12 组**逐一测量。

| 视口 | 路由 | 页面级横向溢出 | 无可见焦点环的可聚焦元素 |
| --- | --- | --- | --- |
| 1440×900 | `/`、`/#/labs`、`/#/catalog`、`/#/glossary`、`/#/quiz`、`/#/case/c01-nanchan-main-hall` | **0** | **0 / 38–40** |
| 390×844 | 同上 6 条 | **0** | **0 / 38–40** |

测量方法：

- **溢出**：取 `documentElement.scrollWidth` 与 `clientWidth` 的差；并列出所有越界元素，**排除被祖先滚动容器收纳的元素**（年代轴本来就该横向滚动，它在 390 下 `scrollWidth` 为 1720，但被自己的 `overflow-x` 容器收纳，**不是**页面级溢出）。
- **焦点环**：用**真实键盘 Tab 遍历**（不是程序化 `.focus()`——后者不触发 `:focus-visible`，测出来是假阴性），每次按 Tab 后读当前元素的计算样式，`outline-style !== none && outline-width > 0` 或有 `box-shadow` 才算可见。

---

## 6. 缺陷与修复 · Defects found and fixed

### 6.1 13-qa-curation 实测提出的三项

| # | 现象 | **根因** | 修复 |
| --- | --- | --- | --- |
| ① | 聚焦元素没有可见焦点样式 | **`src/styles/tokens.css` 的生成区缺少 `:root {` 包裹。** 生成器 `sync-ds-tokens.mjs` 把 16 的 `:root { … }` **内部内容**直接贴出来，没有补选择器，于是整块 `--ds-*` 声明成了顶层无效 CSS，**全部令牌在运行期解析为 undefined**——`--ds-focus-ring` 因此失效。16 的 ds-audit 早已把这一项标为「🔴 19 生成区缺 :root 包裹」，当时未修 | 修生成器：补 `:root { … }` 包裹，并加一条**守卫**——生成区若不以 `:root` 开头即报错，防止再次静默失效。重新生成后 12 组测量全部有可见焦点环 |
| ② | 移动端 390×844 页面级横向滚动（scrollW 427 > clientW 390） | 同 ③ 的同一个根因：令牌层失效使依赖 `--ds-space-*` 等变量的布局声明失效，元素撑破视口 | 令牌层修复后，12 组测量 `scrollWidth === clientWidth`。**并且把 `body { overflow-x: hidden }` 删掉了**——它只是把滚动条藏起来，内容仍不可达；删掉之后仍无溢出，才算真修 |
| ③ | 上游自校验退出码 1、报告不可解析 | `scripts/validate.mjs` 用 Node 24 直接 import 应用模块，而 Node 24 的 JSON 模块需要 `with { type: 'json' }`；同时 §3b 还在检查**已被 18 取代**的自建 builder 目录 | 加一个零依赖的 Node 模块钩子（`scripts/lib/json-loader.mjs`）让 `.json` 能作为 ES 模块加载，**不改应用源码**（源码保持 Vite 友好）；§3b 重写为「用真实 three.js 按 18 的统一模型契约逐件构建」；另加 §5b 双语机械校验。**现在退出码 0，产出 39 项可解析报告** |

### 6.2 本轮自测发现并修掉的其他真实缺陷

| 缺陷 | 位置 | 说明 |
| --- | --- | --- |
| **测验页是空的** | `src/views/quiz.js` | `renderQuiz()` 建好了 `shell` 却**从未 `host.append(shell)`**，整个页面渲染不出内容。运行时自检 `route.quiz` 一项立刻暴露了它 |
| **案例关联术语全是死链** | `src/data/catalog.js` | 案例的 `terms` 直接用了上游的不透明 id（`g01`、`g02`…），而本站术语表用可读 slug 作 id，于是 42 例的相关术语**一条都指不到**。改为经 `GLOSSARY_ID_BY_UPSTREAM` 映射 |
| **stone-arch 受力箭头几何损坏** | `src/views/labs.js` | 18 的 stone-arch 把箭头端点写成 `{x,y,z}` 对象，其余五件用 `[x,y,z]`。`new THREE.Vector3({x,y,z})` **不报错**，但会造出分量为 NaN 的向量，箭头渲染成坏几何。在 19 的适配层归一化（不动 vendor 副本，`validate.mjs` 校验其逐字节一致） |
| **10 处坐标偏差（最大 ~46 km）** | `src/data/enrichment.js` | 上游目录不含坐标，本项目补的坐标用维基条目，并**用第二套地名库（OSM Nominatim）逐条复核**，修正 10 处。其中南禅寺与佛光寺最典型：二者分属五台县**阳白乡**与**豆村镇**，均不在台怀镇（显通寺、塔院寺所在）。详见 `SOURCES.md` §6 |
| **人民网陕西频道的链接在浏览器里打不开** | `src/data/catalog.js` | 该主机的 TLS 返回 CDN 默认证书 `default.chinanetcenter.com`，浏览器报 `ERR_CERT_COMMON_NAME_INVALID`。适配层改为同一页面的 http 形式，并在 `SOURCES.md` §4.2 如实登记（上游目录本身未改） |
| **装配步骤读数显示 `[object HTMLOutputElement]`** | `src/views/labs.js` | `el('span', { text: stepLabel })` 把 `<output>` **元素对象**塞给了 `text` 属性，于是被 `String()` 成了 `[object HTMLOutputElement]`，而真正的 `<output>` 元素从未进入 DOM。改为 `el('span', {}, [stepLabel])`。**这个缺陷是靠实玩截图看出来的——自动断言全绿。** 修完补了一条永久守卫：`render.noObjectArtifacts` 扫描每条路由的可见文本，任何 `[object ...]` 残渣即失败 |

---

## 7. 手工核对 · Manual checks

| 项 | 结论 | 依据 |
| --- | --- | --- |
| 零跨域请求 | ✅ | 运行时自检 `network.noExternal`；截图清单每张都记录 `external=0` |
| 首屏不加载 three.js | ✅ | `network.firstScreenHasNoThree`；构建产物中 three 独立成块 `assets/three-*.js` |
| 六件模型各自独立成块 | ✅ | `dist/assets/{dougong,mortise,taoliang,chuandou,stone-arch,tulou}-*.js` |
| reduced-motion 生效且交互保留 | ✅ | 第三轮 42/42 全通过 |
| 无 WebGL 时 2D 降级 | ✅ | 截图 `14-mobile-lab-2d-fallback` / `15-desktop-lab-2d-fallback`：**在页面脚本运行前**注入脚本禁用 WebGL，走的是应用自己的 `hasWebGL()` 分支，不是模拟 |
| 收藏只存本机 | ✅ | `favourites.persist` + `store.js` 的 `built-in-china:v1` 键 |
| 教学声明显著 | ✅ | 实验室画布 HUD、控制面板声明块、2D 降级旁、GLB 导出元数据、站内来源页、全部交付文档 |
| 坐标不是测绘数据 | ✅ | 地图图例明示「地域轮廓为示意性分区，不按比例绘制」；`SOURCES.md` §6 逐条说明精度约 0.1° |

---

## 8. 限制 · Limitations

验收通过**不等于**内容无误。以下是本次验收**没有**覆盖、读者应当知道的事：

1. **目录是代表性样本**，42 例覆盖 8 地域 / 10 时代 / 19 类构造特征，**不声称穷尽**中国古建筑。三个时代（汉、元、近现代）在词表里但样本中没有案例——这是范围事实，已在 `validate.mjs` 中作为提示而非错误登记。
2. **核验强度不均一。** 案例级标注 `verification.level` 与来源的 `evidenceLevel`；并非每一例都做过现场或原始档案核验。
3. **年代多口径。** 「始建于 X、重修于 Y」不以单一年份冒充断代；上游标 `disputed` 的条目在界面上逐条标注。
4. **三维与剖面是教学示意**，不是测绘成果，也不是工程模型；受力箭头表示传力**方向**，不表示大小。
5. **坐标是示意地图的参考点**（约 0.1°），部分条目取的是所在县市一级的坐标。
6. **来源可达性会变。** 23 个来源主机在 2026-10-21 逐个实测；其中 `whc.unesco.org` 的列表页对命令行客户端返回 Cloudflare 挑战（403），真实浏览器可正常打开；`zh.wikipedia.org` 有速率限制。链接失效属于外部状态变化，本验收无法持续保证。
7. **未做**屏幕阅读器实测、**未做**多浏览器矩阵（仅 ego-browser/Chromium）、**未做**打印样式的逐页核对。
8. **未做**性能压测；已确认的只有「首屏不加载 three.js」「六件模型各自成块」「图片全部为程序化 SVG」。

---

*执行：19-architecture-atlas · 2026-10-21 · 浏览器：ego-browser v2.1.0*
