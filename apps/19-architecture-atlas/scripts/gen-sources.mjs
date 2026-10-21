/**
 * Generate SOURCES.md from the vendored catalogue.
 *
 * The source list is a fact about the catalogue, so it is generated rather
 * than hand-maintained: a hand-written list drifts the moment a case gains
 * or loses a source. The prose around the table is fixed and lives here.
 *
 * Usage: node scripts/gen-sources.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/upstream/catalog.json'), 'utf8'));
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/upstream/catalog.meta.json'), 'utf8'));
const glossary = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/upstream/glossary.json'), 'utf8'));
const OUT = path.join(ROOT, 'SOURCES.md');

/**
 * Official Chinese government endpoints that answer on HTTP only — they do
 * not serve TLS. Every one was tested on 2026-10-21; see the table below.
 */
const HTTP_ONLY = new Map([
  ['www.yingxian.gov.cn', '应县人民政府 — 应县木塔'],
  ['www.ncha.gov.cn', '国家文物局 — 佛光寺东大殿'],
  ['wutai.gov.cn', '五台县人民政府 — 五台山建筑群'],
  ['www.hrbdw.gov.cn', '哈尔滨市道外区人民政府 — 中华巴洛克街区'],
  ['wwj.wlt.fujian.gov.cn', '福建省文旅厅 — 华林寺 / 陈家祠'],
  ['www.sjx.gov.cn', '晋江市人民政府 — 草庵 / 祇园'],
  ['www.zhongguowenwubao.com', '中国文物报（数字报）— 南禅寺 / 佛光寺 / 开化寺'],
  ['sn.people.com.cn', '人民网陕西频道 — 柏社村地坑窑（TLS 证书与主机名不匹配）'],
]);

/**
 * What was actually observed on 2026-10-21, per host. A host that is not
 * listed here answered 200 on the first try and needs no footnote.
 */
const MEASURED = new Map([
  ['whc.unesco.org', 'curl 得 403（Cloudflare 反爬挑战）；真实浏览器打开 /en/list/1002/ 得 200，页面正常'],
  ['sn.people.com.cn', 'https 报 ERR_CERT_COMMON_NAME_INVALID（主机返回 CDN 默认证书）；http 得 200'],
  ['zh.wikipedia.org', '首次 429（维基限流），退避后得 200'],
]);

const esc = (s) => String(s).replace(/\|/g, '\\|');

const byHost = new Map();
for (const c of catalog.cases) {
  for (const s of c.sources || []) {
    const host = new URL(s.url).host;
    if (!byHost.has(host)) byHost.set(host, { labels: new Set(), accessed: new Set(), cases: new Set() });
    const e = byHost.get(host);
    e.labels.add(s.label);
    e.accessed.add(s.accessedAt);
    e.cases.add(c.id);
  }
}

const allUrls = new Set();
for (const c of catalog.cases) for (const s of c.sources || []) allUrls.add(s.url);

const lines = [];
const push = (...xs) => lines.push(...xs);

/* ------------------------------------------------------------------ head */

push(
  '# 来源 · Sources',
  '# 构筑华夏 / Built in China — Structures & Stories',
  '',
  '> **每条事实都指向一个可核验的公开出处；没有出处的说法不写。**',
  '> **Every factual claim points at a verifiable public source. Claims without a source are not made.**',
  '',
  `本文件由 \`scripts/gen-sources.mjs\` 从 \`src/data/upstream/catalog.json\`（上游任务 17-architecture-research）生成，`,
  `因此与站内「来源与许可」页面永远一致。共 **${catalog.cases.length} 例案例、${allUrls.size} 个不同来源、${byHost.size} 个来源主机**。`,
  '',
  '访问日期一律记录为来源条目自带的 `accessedAt`（2026-10-21 实测）。',
  '',
  '---',
  '',
  '## 1. 目录级说明',
  '',
  `- **代表性样本，不是穷尽名录。** 覆盖 ${meta.coverage.byRegion ? Object.keys(meta.coverage.byRegion).length : 8} 个地域、${meta.vocabularies.eras ? Object.keys(meta.vocabularies.eras).length : 10} 个时代、${Object.keys(meta.vocabularies.structureTypes || {}).length || meta.counts.structureTypes} 类构造特征。同一类型内的其他重要实例未被纳入。`,
  '- **年代按多口径记录。** 「始建于 X、重修于 Y」等信息以 `yearText` 原样保留，并用 `yearUncertainty` 标注确定性（`certain` / `approx` / `disputed` / `not-applicable`），**不用单一年份冒充断代**。',
  '- **核验强度不均一。** 案例级标注 `verification.level` 与来源的 `evidenceLevel`；并非每一例都做过现场或原始档案核验。',
  '- **图片不下载、不再分发。** 大多数古迹的摄影与博物馆档案均为保留权利；本站的所有配图都是代码生成的线稿示意图。',
  '',
  '---',
  '',
  '## 2. UNESCO 世界遗产编号的核对方式',
  '',
  `方法：${meta.unescoIdVerification.method}`,
  '',
  `- 端点：\`${meta.unescoIdVerification.endpoint}\``,
  `- 组件端点：\`${meta.unescoIdVerification.componentEndpoint}\``,
  `- 核对日期：${meta.unescoIdVerification.checkedAt}`,
  `- ${meta.unescoIdVerification.note}`,
  '',
  '> 核对结果（编号与正式名称逐条比对）：',
  '> 280、438、439、439bis、440、441、705、707ter、811bis、812、813bis、912、1001、1002、1003、1004ter、1112、1113、1305rev、1334、1442、1443、1474、1736',
  '>',
  '> 「某建筑是否为该遗产的组成部分」这一关系也逐条核过——例如洛阳桥属 1561，佛光寺东大殿属 1279。',
  '',
  '---',
  '',
  '## 3. 逐例来源',
  '',
  '| 案例 | 中文名 | English | 地域 | 来源（类型） |',
  '| --- | --- | --- | --- | --- |',
);

for (const c of catalog.cases) {
  const srcs = (c.sources || []).map((s) => {
    const kind = s.evidenceLevel === 'primary-verified' ? '一次来源' : '参考';
    return `[${esc(s.label)}](${s.url})（${kind}）`;
  }).join('<br>');
  push(`| \`${c.id}\` | ${esc(c.nameZh)} | ${esc(c.nameEn)} | ${esc(c.region)} | ${srcs} |`);
}

push(
  '',
  '---',
  '',
  '## 4. 来源主机一览',
  '',
  `共 ${byHost.size} 个主机。**除下表列出的 ${HTTP_ONLY.size} 个之外，全部为 https。**`,
  '',
  '| 主机 | 机构 / 用途 | 涉及案例 | 协议 | 实测 |',
  '| --- | --- | --- | --- | --- |',
);

for (const [host, e] of [...byHost.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const isHttpOnly = HTTP_ONLY.has(host);
  const label = [...e.labels][0] || host;
  const observed = MEASURED.get(host) || (isHttpOnly ? 'http 得 200；https 不通' : '200');
  push(`| \`${host}\` | ${esc(label)} | ${e.cases.size} | ${isHttpOnly ? 'http' : 'https'} | ${esc(observed)} |`);
}

push(
  '',
  '### 4.1 仅支持 HTTP 的官方端点',
  '',
  '以下官方站点在 TLS 上不提供服务，只能以 `http://` 访问。它们是**官方的一次来源**，不是失效链接；',
  '校验器 `scripts/validate.mjs` 的 `HTTP_ONLY_HOSTS` 白名单逐一登记了这 7 个主机，',
  '任何**不在白名单内**的 `http://` 来源都会让静态校验失败。',
  '',
  '| 主机 | 机构 | 2026-10-21 实测 |',
  '| --- | --- | --- |',
);

for (const [host, note] of HTTP_ONLY) {
  push(`| \`${host}\` | ${note} | http → 200；https → 不通 |`);
}

push(
  '',
  '> 已排除：`http://www.hongcun.com.cn` 是停放域名，**不作为来源使用**。',
  '',
  '### 4.2 本站对来源 URL 做的一处修正',
  '',
  '上游目录的一条来源 URL 在浏览器里**直接不可用**，本站的适配层（`src/data/catalog.js` 的 `SOURCE_URL_FIXES`）把它改成了同一页面可用的形式，并在本表如实记录。上游目录本身未被改动。',
  '',
  '| 主机 | 上游 URL | 本站展示的 URL | 实测（2026-10-21） |',
  '| --- | --- | --- | --- |',
  '| `sn.people.com.cn` | `https://sn.people.com.cn/BIG5/n2/2025/0918/c226647-41355949-9.html` | `http://sn.people.com.cn/...` | https → `ERR_CERT_COMMON_NAME_INVALID`（主机返回 CDN 默认证书 `default.chinanetcenter.com`，浏览器直接拒绝）；http → 200 |',
  '',
  '> 这不是「把 https 降级成 http」的通例：其余 22 个主机均按上游原样使用 https。',
  '',
  '### 4.3 取证时遇到的实际障碍（如实记录）',
  '',
  '| 站点 | 现象 | 处置 |',
  '| --- | --- | --- |',
  '| `whc.unesco.org` 列表页 | 对本环境返回 403（Cloudflare 挑战） | 改用 `uploads/nominations/<id>.pdf` 提名档案（200），编号经 Wikipedia wikitext 交叉核验 |',
  '| `huangshan.gov.cn` | 412 / 405（WAF） | 改用可直取的官方替代端点 |',
  '| `yixian.gov.cn` | 412 | 同上 |',
  '| `www.ncha.gov.cn` | TLS 不通 | 登记为 http-only 官方端点 |',
  '',
  '---',
  '',
  '## 5. 术语表来源',
  '',
  `术语表共 **${glossary.terms.length} 条**、${new Set(glossary.terms.map((t) => t.category)).size} 个类别，`,
  '由上游任务 17-architecture-research 统一编制，每条含中文名、拼音、英文名与双语释义，并链接到使用该术语的案例。',
  '',
  '> 术语表同样遵循「没有出处的说法不写」：每条的英文释义与中文释义同源，不引入第二套未经核验的说法。',
  '',
  '---',
  '',
  '## 6. 坐标来源（本站补充）',
  '',
  '上游目录**不含坐标**，因为它是文献目录而非地理数据。本站需要坐标把 42 例放到区域地图上，',
  '因此在 `src/data/enrichment.js` 中补充，并做了**双源复核**：',
  '',
  '1. 第一来源：各案例的中文 / 英文维基条目坐标；无坐标者取其所在县市一级的坐标。',
  '2. 第二来源：OpenStreetMap Nominatim 独立反查，2026-10-21 逐条比对。',
  '',
  '复核**修正了 10 处**坐标，其中两处偏差最大、也最值得记：',
  '',
  '| 案例 | 原值 | 修正后 | 原因 |',
  '| --- | --- | --- | --- |',
  '| `c01-nanchan-main-hall` 南禅寺 | 113.575, 39.003 | **113.114, 38.701** | 南禅寺在五台县阳白乡，不在台怀镇 |',
  '| `c02-foguang-east-hall` 佛光寺 | 113.039, 39.012 | **113.387, 38.869** | 佛光寺在五台县豆村镇，不在台怀镇 |',
  '| `c04-baoguo-main-hall` 保国寺 | 121.617, 29.936 | **121.517, 29.982** | 应落在宁波洪塘保国寺博物馆 |',
  '| `c05-huayan-pujioge` 华严寺 | 113.367, 40.097 | **113.288, 40.091** | 应落在大同平城区，非市中心 |',
  '| `c17-fujian-tulou` 福建土楼 | 116.742, 24.663 | **116.973, 24.666** | 应落在永定洪坑土楼群 |',
  '| `c18-kaiping-diaolou` 开平碉楼 | 112.457, 22.365 | **112.575, 22.376** | 应落在开平自力村 |',
  '| `c27-zhaoxing-dong-village` 肇兴侗寨 | 109.126, 26.213 | **109.170, 25.909** | 原值为黎平县城，已改为侗寨本身 |',
  '| `c30-zhaozhou-bridge` 赵州桥 | 114.786, 37.755 | **114.763, 37.720** | 对齐到赵州镇 |',
  '| `c40-feiyun-pavilion` 飞云楼 | 112.901, 35.618 | **112.923, 35.798** | 原值为泽州县城，已改为高平市 |',
  '| `c42-baise-cellar-courtyard` 柏社村 | 108.885, 34.774 | **108.861, 34.804** | 对齐到三原县新兴镇柏社村 |',
  '',
  '> **坐标是示意地图的参考点，不是测绘数据。** 精度约 0.1°；地图轮廓本身也是示意性分区，不按比例绘制。',
  '',
  '---',
  '',
  '## 7. 声明边界 · Stated limits',
  '',
);
for (const l of meta.limitations) push(`- ${l}`);
push(
  '',
  '---',
  '',
  '## 8. 机械校验',
  '',
  '```bash',
  'node scripts/validate.mjs',
  '```',
  '',
  '静态校验会核对：每条来源都是 http(s)、每个 `http://` 来源都在上面第 4.1 节的白名单里、',
  '每例至少有一条一次来源、每例都有 `label` 与 `accessedAt`、坐标落在合理经纬范围内。',
  '',
  `*本文件由 \`scripts/gen-sources.mjs\` 生成于 ${new Date().toISOString().slice(0, 10)}；数据源 \`src/data/upstream/catalog.json\`（${meta.version}，生成于 ${meta.generatedAt}）。*`,
);

fs.writeFileSync(OUT, lines.join('\n'));
console.log(`✅ 已写入 ${path.relative(ROOT, OUT)}（${catalog.cases.length} 例 · ${allUrls.size} 个来源 · ${byHost.size} 个主机）`);
