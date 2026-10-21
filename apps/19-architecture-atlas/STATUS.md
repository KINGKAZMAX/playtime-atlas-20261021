# STATUS — 19-architecture-atlas：构筑华夏 / Built in China

**最后更新**：2026-10-22 01:2x (GMT+8, 台北)
**当前阶段**：**P11 交付完成** —— 静态校验 39/39、运行时自检 42/42 × 3 轮、布局与焦点诊断 0 问题；交付物齐备，可交 14-publish 集成。

---

## 0. 一句话状态

**可部署。** 42 例目录（接 17）、6 件三维实验室（接 18）、令牌层（接 16）、双语默认英文 + `?lang=` 深链接；
`dist/` 已构建，三套校验全绿，README / manifest / LICENSES / SOURCES / QA 五份交付物齐备。

---

## 1. 阶段总览

| 阶段 | 状态 | 说明 |
| --- | --- | --- |
| P0 读取上游指令 | ✅ | 已读 `PROMPT.md`、`MASTER-UPDATE.md`、15/16/17/18/14 的契约 |
| P1 参考站取证 | ✅ | **实访成功**：`https://olek.si` HTTP 200，3 张截图 + 原始 HTML/JS 包，见 `REFERENCE-AUDIT.md` |
| P2 立项 | ✅ | `TASK.md`（范围 / 边界 / 验收 A1–A14）、本 `STATUS.md` |
| P3 设计令牌 + 骨架 | ✅ | Vite + 原生 ES 模块 + hash 路由 + i18n；令牌层改接 16 |
| P4 内容层 | ✅ | **改接 17**：42 例目录 + 74 条术语 + 10 题测验 |
| P5 地图 + 年代轴 + 目录 + 详情 | ✅ | 8 地域 / 10 时代 / 19 类构造 |
| P6 6 个 3D 实验室 | ✅ | **改接 18**：统一模型契约 v1.1，6 件模型逐件真实构建通过 |
| P7 测验 + 收藏 + 术语 | ✅ | 测验页曾有「建了 shell 未挂载」的真实缺陷，已修 |
| P8 程序化美术 | ✅ | 案例线稿 / 地图 / 图标全部代码生成，零位图 |
| P9 无障碍 / 降级 / 移动端 | ✅ | 焦点环可见、reduced-motion 生效、2D 降级走应用自身分支、390 无横向溢出 |
| P10 构建 + QA + 截图 | ✅ | 见 §4 |
| P11 交付元数据 | ✅ | README / manifest / LICENSES / SOURCES / QA |

---

## 2. 三条交接链的当前状态（15 的问题，逐条回答）

### 2.1 数据层：**已全部改接 17，无本地占位**

| 模块 | 数据来源 | 状态 |
| --- | --- | --- |
| 目录（42 例） | 17 `catalog.json`（逐字节 vendor） | ✅ 已接 |
| 术语表（74 条） | 17 `glossary.json` + `glossary-en.json` | ✅ 已接 |
| 地域 / 时代 / 构造词表 | 17 `catalog.meta.json` | ✅ 已接 |
| 测验（10 题） | 19 自撰（不引用案例 id） | 本项目自有，非占位 |
| 地图轮廓 | 19 自绘（示意性，界面已标注） | 本项目自有 |
| 案例英文 + 坐标 | 19 `src/data/enrichment.js` | 本项目补充上游未提供项，**非占位** |

上游目录只给中文的 `yearText / caveat / type / ethnicGroup`，且**完全不含坐标**；
英文与坐标由 19 补齐，坐标经**双源复核**（维基 + OpenStreetMap Nominatim），修正 10 处，详见 `SOURCES.md` §6。

### 2.2 三维层：**直接消费 18，不是并列实现**

- 19 vendor 18 的 `src/core/` 与 `src/models/`（逐字节），用 18 的 `Viewer` 驱动，遵守 18 的统一模型契约 v1.1。
- `scripts/validate.mjs` 的 `models.vendoredFrom18Unchanged` 校验两份副本**逐字节一致**，防止就地改动。
- `scripts/sync-18-models.mjs` 用于 18 变更后重新同步（18 在交付窗口内仍在更新，本轮已同步两次）。
- **2D 降级用 18 的 `renderFallbackSVG()`，由同一份三维几何派生**，不是另画一张假图。
- 19 自有的 `src/art/schematic.js` 是**案例页的轻量二维线稿插画层**，与 18 的三维模型体系是两种东西；两侧文档均已声明。
- **19 在适配层吸收了 18 的一处数据形状缺陷**：stone-arch 的受力箭头端点写成 `{x,y,z}` 对象（其余五件为 `[x,y,z]`），three.js 只认数组，`new THREE.Vector3({x,y,z})` 会静默产出 NaN 向量。19 在 `src/views/labs.js` 的 `normalizeBuild()` 归一化，**不改 vendor 副本**。

### 2.3 令牌层：**按 16 MIGRATION-NOTES §1.1 路径 A/B 落地**

- `scripts/sync-ds-tokens.mjs` **只读** 16 的 `design-tokens.json` 与 `src/tokens.css`，把取值写进 `src/styles/tokens.css` 的哨兵生成区，把 `.ds-*` 组件类写进 `src/styles/components.css`。
- `--ds-*` 在本目录**只声明一次**；本地变量层只写语义别名（16 §0 风险 B）。
- 111 个令牌与 `design-tokens.json` 交叉核对，**0 处真实不一致**，1 处登记为已知人工校准差异（`--ds-font-mono` 多 `Consolas`）。`--check` 幂等。
- **本轮修掉一个真实缺陷**：生成器漏了 `:root {` 包裹，导致整层令牌在运行期失效（详见 §4.1①）。

---

## 3. 15 的双语四项硬指标

| 要求 | 落实 | 机械校验 |
| --- | --- | --- |
| ① 默认英文 | `store.js` 默认 `lang: 'en'`；首屏、导航、标题、图例、术语全英文 | `bilingual.defaultIsEnglish` ✅ |
| ② 切换可用，动态内容一起切 | 筛选 chip、卡片标签、时间轴、地图列表、测验选项、术语分类全部随语言重建 | `i18n.dynamicFiltersSwitch` / `i18n.dynamicCardTagsSwitch` ✅（运行时） |
| ③ `<html lang>` 同步 | `setLanguage()` 写 `document.documentElement.lang`（`en` / `zh-Hans`）与 `data-lang` | `bilingual.htmlLangIsSynced` ✅ |
| ④ 双语一致性机械校验 | `validate.mjs` 第 5b 节，8 条判定 | 8/8 ✅ |

**深链接保持语言状态**：`?lang=zh|en`。`?lang=` 决定**本次访问**的语言，但**不覆盖**访客自己保存的偏好——别人发来的链接不会改掉你的默认语言。

---

## 4. 本轮修掉的真实缺陷

### 4.1 13-qa-curation 实测提出的三项

| # | 现象 | 根因 | 修复 |
| --- | --- | --- | --- |
| ① | 聚焦元素没有可见焦点样式 | **`src/styles/tokens.css` 生成区缺 `:root {` 包裹** → 整块 `--ds-*` 顶层无效 CSS → 全部令牌运行期 undefined → `--ds-focus-ring` 失效 | 修生成器 + 加守卫（生成区不以 `:root` 开头即报错） |
| ② | 390×844 页面级横向滚动 427 > 390 | 同一根因 | 令牌层修复后归零；**并删掉 `body { overflow-x: hidden }`**，不用掩盖 |
| ③ | 自校验退出码 1、报告不可解析 | Node 24 的 JSON 模块需 import attribute；§3b 还在检查已被 18 取代的自建 builder | 加零依赖 Node 模块钩子；§3b 改用**真实 three.js** 按 18 契约构建；新增 §5b 双语校验 |

### 4.2 自测发现的其他真实缺陷

- **测验页是空的**（`src/views/quiz.js` 建了 shell 却从未 `host.append`）。
- **案例关联术语全是死链**（`catalog.js` 用了上游不透明 id `g01`…，未映射到本站 slug）。
- **stone-arch 受力箭头几何损坏**（18 的数据形状差异，19 适配层归一化）。
- **10 处坐标偏差**（最大 ~46 km；南禅寺 / 佛光寺被误置于台怀镇）。
- **人民网陕西频道链接在浏览器里打不开**（TLS 返回 CDN 默认证书，浏览器 `ERR_CERT_COMMON_NAME_INVALID`）→ 适配层改用同一页面的 http 形式并在 `SOURCES.md` §4.2 登记。
- **`fallback.js` vendor 副本漂移**（18 在交付窗口内两次更新，其中一次修好了「2D 降级图全部构件标注被静默丢弃」的真实缺陷）→ 新增 `scripts/sync-18-models.mjs`。

---

## 5. 验收结果

| 项 | 结果 |
| --- | --- |
| 静态校验 `node scripts/validate.mjs` | **39 / 39 通过**，退出码 0 |
| 运行时自检 `node scripts/qa-runtime.mjs` | **42 / 42 × 3 轮**（桌面 / 移动 / reduced-motion）通过 |
| 布局与焦点 `node scripts/run-ego.mjs scripts/ego/diagnose.mjs` | **0 问题**（6 路由 × 2 视口） |
| 实玩截图 | `evidence/screenshots/`（桌面 / 移动 / 中英 / 3D / 2D 降级） |

浏览器：**ego-browser v2.1.0**（项目唯一浏览器入口）。全部报告在 `evidence/` 下，为机器可读 JSON。

---

## 6. 限制与已知问题（如实记录）

| 项 | 状态 | 影响 |
| --- | --- | --- |
| 目录是代表性样本 | 42 例覆盖 8 地域 / 10 时代 / 19 类构造 | **不声称穷尽**；三个时代（汉、元、近现代）在词表里但样本无案例——已作为提示而非错误登记 |
| 核验强度不均一 | 案例级标 `verification.level` / `evidenceLevel` | 并非每例都做过现场或原始档案核验 |
| 年代多口径 | 「始建 / 重修 / 现存」并存 | 上游标 `disputed` 的条目逐条标注，不用单一年份冒充断代 |
| 三维与剖面 | 教学示意 | 非测绘成果、非工程模型；受力箭头只表示传力方向 |
| 坐标 | 约 0.1° 精度，部分取县市一级 | 示意地图的参考点，不是测绘数据 |
| 来源可达性 | 2026-10-21 逐主机实测并记录 | `whc.unesco.org` 对命令行客户端 403（Cloudflare 挑战，真实浏览器正常）；`zh.wikipedia.org` 有速率限制 |
| ego 视口控制 | `mobile:false` 的 Emulation 覆盖不跨导航存活 | 桌面档以 `mobile:true` 设备指标取得精确宽度；本项目 CSS 无 `hover`/`pointer` 媒体查询，测量等价 |
| 未覆盖 | 屏幕阅读器实测、多浏览器矩阵、打印样式逐页核对、性能压测 | 本轮验收不声称这些已验证 |
| 18 仍在变更 | 交付窗口内 `fallback.js` 两次更新 | 交付前需再跑一次 `node scripts/sync-18-models.mjs` |

---

## 7. 交 14-publish 的集成契约

```json
{
  "id": "19-architecture-atlas",
  "entry": "works/19-architecture-atlas/index.html",
  "buildCommand": "npm run build",
  "outputDir": "docs/works/19-architecture-atlas",
  "status": "ready",
  "build": { "type": "npm", "appDir": "apps/19-architecture-atlas" }
}
```

- `dist/` 由 14 自行构建（`sync-apps.mjs` 同步时排除 `dist`）；本目录的 `.gitignore` **故意不忽略** `dist/`，两条路径都不被阻断。
- 部署到 `/playtime-atlas-20261021/works/19-architecture-atlas/` 子路径可直接工作：`base: './'` + hash 路由，无需服务端重写。

---

## 8. 变更日志

- 2026-10-21 19:00：读取上游契约。
- 2026-10-21 19:05：`curl` 确认 `https://olek.si` 可达（200 / 2.5s）。
- 2026-10-21 19:10–19:18：参考站实拍截图 ×3 + 前端包实测色板 / 字号 / 圆角 / 缓动 / 分区调性变量。
- 2026-10-21 19:25：写入 `TASK.md`、`STATUS.md`、`REFERENCE-AUDIT.md`。
- 2026-10-21 20:00–23:00：Vite 骨架、10 个视图、i18n、hash 路由、路由与 i18n 缺陷修复。
- 2026-10-21 22:40：**令牌层改接 16**（111 令牌交叉核对，0 不一致）。
- 2026-10-21 22:50：**数据层改接 17**（42 例 + 74 术语），自建 builder 移除。
- 2026-10-21 23:10：**三维层改接 18**（6 件模型 + 统一契约），旧 builder 目录移除。
- 2026-10-21 23:15：**参考站观察证据隔离**到 `research/_QUARANTINE__/` 并加 `.gitignore` 排除。
- 2026-10-21 23:36：`enrichment.js` 落地；坐标双源复核，**修正 10 处**。
- 2026-10-21 23:45：接入 `?lang=` 深链接；动态内容改为语言感知。
- 2026-10-22 00:30：13 的三项缺陷定位与修复（`:root` 包裹 / 390 溢出 / 校验器退出码）。
- 2026-10-22 00:50：修测验页未挂载、术语 id 未映射、stone-arch 受力箭头 NaN 几何、人民网来源链接。
- 2026-10-22 01:10：新增 `sync-18-models.mjs`；同步 18 的两次更新。
- 2026-10-22 01:25：全部 QA 转绿；补齐 README / manifest / LICENSES / SOURCES / QA 五份交付物。
