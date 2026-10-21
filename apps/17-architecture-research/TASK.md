# TASK — 17 中国经典建筑与传统结构联网研究

最后更新：2026-10-21（UTC+8）

## 1. 目标

为「构筑华夏 / Built in China: Structures & Stories」双语建筑科普主站（19）与其 3D 教学模型（18）提供**可核验的联网研究底稿**：

1. **交互可视化案例库**：至少 8 个真实存在的「中国传统建筑 / 榫卯 / 斗栱 / 木构交互可视化」项目，记录网址、作者、交互机制、模型形式、许可；从中挑选 **3 个机制优秀案例**供原创改编（改编而非复制）。
2. **代表性建筑目录**：覆盖全国主要区域、时代、民族与建筑类型，**首批至少 36 个建筑案例**、**至少 12 类构造**。不声称穷尽全部中国古建筑。
3. **术语表**：中英对照 + 拼音 + 通俗解释。
4. **交互设计简报**：把研究到的机制翻译成可实现的交互规格。

## 2. 硬性约束

| 约束 | 说明 |
| --- | --- |
| 只写本目录 | 不写 `18-architecture-models` / `19-architecture-atlas` 等同级目录；仅可只读 |
| 14-publish 唯一发布者 | 本任务**不建仓、不 push、不部署**，只产出资料与可分发文件 |
| 一次来源优先 | 故宫博物院 / 国家文物局 / 各省博物馆 / UNESCO / 大学与学术论文优先于二手转载 |
| 不虚称穷尽 | 目录为"代表性样本"，README 与目录元数据都要写明 |
| 不把示意当测绘 | 所有 3D/剖面/受力说明标注「教学示意，非施工/工程模型」；受力箭头为定性说明 |
| 原创改编 | 参考项目只学**机制**；文案、命名、视觉、模型一律原创，不冒充原作作者或项目 |
| 许可诚实 | 参考项目许可逐个记录；未核实许可的图片不下载、不再分发 |
| UI 取证 | 必须**实际浏览**参考站并保存截图与观察依据；不可臆造。未核验就写"未核验" |
| 双语 | 中文为主、英文准确通俗；术语带拼音 + 解释 |
| 资源本地化 | 参考图不随包再分发时，提供文字描述 + 外链 + 程序化绘制建议 |

## 3. 交付物清单

| 文件 | 内容 |
| --- | --- |
| `TASK.md` | 本文件 |
| `STATUS.md` | 阶段进度、关键决策、限制与阻塞 |
| `README.md` | 资料总览、字段说明、使用方式、限制声明 |
| `catalog.json` | 建筑案例目录（≥36 条） |
| `catalog.meta.json` | 类型/区域/年代词表、统计、字段说明、限制 |
| `glossary.json` | 术语表（zh / en / pinyin / 解释 / 关联案例） |
| `REFERENCES.md` | ≥8 个交互可视化项目的逐条台账 + 3 个入选改编案例说明 |
| `INTERACTION-BRIEF.md` | 交互机制规格，可直接交给 18 / 19 实现 |
| `SOURCES.md` | 逐条来源台账（每条一行的可点击来源） |
| `LICENSES.md` | 引用与素材许可边界 |
| `QA.md` | 实际跑过的检查与结果 |
| `manifest.json` | id / title / description / entry / buildCommand / outputDir / status |
| `handoff/` | 给 18、19 的切片与接入说明 |
| `screenshots/` | 参考站实际截图 + `INDEX.tsv` |
| `scripts/` | 校验与构建脚本，可复现 |

## 4. 字段规格

### 4.1 `catalog.json` 每条建筑案例

```
id                稳定短 ID（如 c01-forbidden-city-hall-of-supreme-harmony）
nameZh / nameEn   中英文名称
pinyin            中文名拼音
region            地域（华北/东北/华东/华中/华南/西南/西北/青藏 …）
province / locality  省 / 具体地点
era               时代档位
yearText          年代（带不确定性描述，如 "1420 年建成，此后多次重修"）
yearUncertainty   uncertainty 字段：确定 / 约略 / 存疑
type              建筑类型（宫殿/寺塔/园林/民居/桥梁/陵墓/防御 …）
structureType     构造类别（dougong / mortise-tenon / tailiang / chuandou / …）
ethnicGroup       民族
principleZh/En    结构原理（通俗解释，非施工图）
cultureZh/En      文化背景
culturalKeywords  关键词数组
sources[]         {label, url, type, accessedAt}
imagePlan         {status, source, license, note} —— 参考图许可状态
verification      {level, checkedAt, notes}
caveat            示意边界 / 不确定性提示
```

### 4.2 `glossary.json` 每条术语

```
termZh / termEn / pinyin / category / shortZh / shortEn
relatedCases[]    关联 catalog id
note              常见误用提示
```

### 4.3 `REFERENCES.md` 每个可视化项目

```
名称 / 网址 / 作者或机构 / 交互机制 / 模型形式 / 许可 / 实际核验时间与方式 / 改编价值判断
```

## 5. 验收标准

- [ ] `catalog.json` ≥ 36 条案例，且 `type` 覆盖 ≥ 12 类构造
- [ ] 每条案例 `sources` 非空，且至少 1 条为一次来源（官方机构 / UNESCO / 学术）
- [ ] 每条案例有 `nameZh` / `nameEn` / `pinyin` / `region` / `era` / `type` / `structureType` / `principle` / `sources`
- [ ] `glossary.json` ≥ 40 条术语，zh/en/pinyin 齐全
- [ ] `REFERENCES.md` ≥ 8 个真实项目 + 3 个改编入选说明
- [ ] 参考站截图真实存在（字节数 > 0），`INDEX.tsv` 记录抓取方式与时间
- [ ] `scripts/validate_catalog.py` 全部通过
- [ ] `handoff/` 提供给 18（结构机制优先）与 19（首批案例优先）的两个切片
- [ ] 所有"未核验 / 不可达 / 缺截图"如实记录，不静默省略

## 6. 下游契约

- **18-architecture-models**：读 `INTERACTION-BRIEF.md` 的机制规格 + `catalog.json` 的 `structureType`；需要"一个构造类别 → 一组构件名 + 拆解顺序 + 受力定性说明"。
- **19-architecture-atlas**：读 `catalog.json` 全量 + `glossary.json` + `handoff/first-18.json`。
- **16-design-system**：本任务提供 UI 取证观察（`screenshots/` + `REFERENCE-NOTES.md`），不定义色板与字体。
- **14-publish**：本目录**无构建步骤**，直接并入发布仓库即可；`screenshots/` 依许可决定是否随包发布。
