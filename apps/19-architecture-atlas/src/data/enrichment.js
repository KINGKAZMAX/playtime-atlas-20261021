/**
 * 案例补全表 / Case enrichment table.
 *
 * WHY THIS EXISTS
 *   The catalogue vendored from 17-architecture-research (./upstream/catalog.json)
 *   stays authoritative and is never edited from here. It publishes, for each of
 *   the 42 cases, a Chinese-only `yearText`, `caveat`, `type` and `ethnicGroup`,
 *   and it carries no coordinates at all — while this site is English by default
 *   and plots every case on a region map.
 *
 *   This table fills exactly those gaps, one entry per case id:
 *     lon / lat        decimal degrees, used to place the marker on the
 *                      schematic region map
 *     yearTextEn       the same dating information as the Chinese `yearText`,
 *                      written for an international reader
 *     caveatEn         the same limitation as the Chinese `caveat`
 *     typeEn           a natural English building type
 *     ethnicityEn      the English name of the group's `ethnicGroup`
 *
 * PROVENANCE
 *   Coordinates come from the English and Chinese Wikipedia articles for each
 *   site (or, where an article carries no coordinate of its own, from the
 *   article for the containing town or county, which is recorded in the case
 *   notes of this project's research log). They are reference points for a
 *   schematic map, not survey data: treat them as accurate to about a tenth of
 *   a degree, and do not quote them as coordinates for the building itself.
 *
 *   Every coordinate was then re-checked against a second, independent gazetteer
 *   (OpenStreetMap Nominatim) on 2026-10-21, and ten entries were corrected as
 *   a result. The corrections worth naming, because they were large and they
 *   were errors on both sides of the review:
 *
 *     c01 南禅寺 Nanchan      113.575,39.003 → 113.114,38.701  (阳白乡, 五台县)
 *     c02 佛光寺 Foguang      113.039,39.012 → 113.387,38.869  (豆村镇, 五台县)
 *     c04 保国寺 Baoguo       121.617,29.936 → 121.517,29.982  (洪塘, 宁波)
 *     c05 华严寺 Huayan       113.367,40.097 → 113.288,40.091  (平城区, 大同)
 *     c17 福建土楼 Tulou      116.742,24.663 → 116.973,24.666  (洪坑, 永定)
 *     c18 开平碉楼 Diaolou    112.457,22.365 → 112.575,22.376  (自力村, 开平)
 *     c27 肇兴侗寨 Zhaoxing   109.126,26.213 → 109.170,25.909  (肇兴, 黎平)
 *     c30 赵州桥 Zhaozhou     114.786,37.755 → 114.763,37.720  (赵州镇, 赵县)
 *     c40 飞云楼 Feiyun       112.901,35.618 → 112.923,35.798  (高平市)
 *     c42 柏社村 Baishe       108.885,34.774 → 108.861,34.804  (新兴镇, 三原)
 *
 *   The first two are the instructive ones. Foguang Temple and Nanchan Temple
 *   are two different villages in two different townships of Wutai County —
 *   豆村镇 and 阳白乡 — and neither of them is at the 台怀镇 cluster where
 *   Xiantong and Tayuan temples stand. Placing them there would have put the
 *   two buildings tens of kilometres from their true positions and ~45 km from
 *   each other in the wrong direction.
 *
 *   The English text follows the Chinese catalogue in substance and in its
 *   caveats — it is a rendering for a second language, not a fresh claim, and
 *   it deliberately keeps every hedging the catalogue applies to dates.
 *
 * DATA
 *   Plain data only — no imports, no functions, no URLs.
 */

/** @type {Record<string, {lon: number, lat: number, yearTextEn: string, caveatEn: string, typeEn: string, ethnicityEn: string}>} */
export const ENRICHMENT = {
  'c01-nanchan-main-hall': {
    lon: 113.1138,
    lat: 38.7012,
    yearTextEn: 'Founded in 781; the hall standing today was rebuilt in 782.',
    caveatEn:
      'The "oldest surviving timber hall" claim follows the prevailing scholarly consensus, which rests on the 1957 Chinese Academy of Sciences survey; recent academic discussion has questioned the dating of individual members, and this catalogue does not settle that dispute.',
    typeEn: 'Buddhist temple hall',
    ethnicityEn: 'Han',
  },
  'c02-foguang-east-hall': {
    lon: 113.3873,
    lat: 38.8689,
    yearTextEn: 'Rebuilt in 857, during the Tang dynasty.',
    caveatEn:
      'The core dates from 857, but every later dynasty repaired the building and individual members may be later replacements; the "Tang" attribution is a scholarly consensus rather than a per-member dating.',
    typeEn: 'Buddhist temple hall',
    ethnicityEn: 'Han',
  },
  'c03-yingxian-wooden-pagoda': {
    lon: 113.187,
    lat: 39.556,
    yearTextEn:
      'Completed in 1056 under the Liao dynasty; repaired repeatedly in the Ming and Qing.',
    caveatEn:
      'The tower\'s present volume and appearance have been altered by repairs in every later dynasty, especially in the Ming and Qing; "not a single nail in the whole tower" describes its original construction and main frame, and does not rule out later iron fittings.',
    typeEn: 'Timber tower-pagoda',
    ethnicityEn: 'Han',
  },
  'c04-baoguo-main-hall': {
    lon: 121.5169,
    lat: 29.9822,
    yearTextEn:
      'Built in 1013 in the Northern Song, ninety years before the Yingzao Fashi was compiled.',
    caveatEn:
      'Its main structural work — the caisson ceiling and the "shrimp-whisker" brackets — is treated as a unique case that corroborates the Yingzao Fashi; that judgement comes from the statements published by the Baoguo Temple Ancient Architecture Museum and the Zhejiang Provincial Institute of Ancient Architectural Design.',
    typeEn: 'Buddhist temple hall',
    ethnicityEn: 'Han',
  },
  'c05-huayan-pujioge': {
    lon: 113.288,
    lat: 40.0913,
    yearTextEn:
      'Rebuilt in 1038 under the Liao, and repaired again in 1176 under the Jin.',
    caveatEn:
      'The present state of the hall is described either as a rebuilding of 1038 (Liao) or as a repair of 1176 (Jin), so the date is given here as approximate.',
    typeEn: 'Buddhist sutra repository hall',
    ethnicityEn: 'Han',
  },
  'c06-longxing-mani-hall': {
    lon: 114.576,
    lat: 38.144,
    yearTextEn:
      'Built in 1052, in the Huangyou era of the Northern Song.',
    caveatEn:
      'Its cruciform plan is not unusual among early Chinese halls; what this entry highlights is the difference between it and the rectangular halls of the same period.',
    typeEn: 'Buddhist temple hall',
    ethnicityEn: 'Han',
  },
  'c07-jinci-holy-mother-hall': {
    lon: 112.444,
    lat: 37.708,
    yearTextEn:
      'Rebuilt during the Tian Sheng era of the Northern Song (1023–1032).',
    caveatEn:
      'Reconstruction dates vary between the Tian Sheng and Chongning eras; this catalogue follows the Tian Sheng dating and flags it as approximate.',
    typeEn: 'Shrine hall',
    ethnicityEn: 'Han',
  },
  'c08-kaihua-temple-hall': {
    lon: 113.037,
    lat: 35.87,
    yearTextEn:
      'Built between the Dazhong Xiangfu and Shaosheng eras of the Northern Song (c. 1008–1098).',
    caveatEn:
      'The interior polychromy and murals have been restored by later generations; "preserved in full" is the standard official and scholarly description, and does not mean that every layer is original Northern Song work.',
    typeEn: 'Buddhist temple hall',
    ethnicityEn: 'Han',
  },
  'c09-forbidden-city-hall': {
    lon: 116.397,
    lat: 39.916,
    yearTextEn:
      'Completed in 1420 under the Ming Yongle emperor, and rebuilt repeatedly under the Qing.',
    caveatEn:
      'What survives today is largely Qing work; 1420 is the founding date, not the fabric you see.',
    typeEn: 'Palace hall',
    ethnicityEn: 'Han',
  },
  'c10-temple-of-heaven-prayer-hall': {
    lon: 116.407,
    lat: 39.882,
    yearTextEn:
      'Completed in 1420 under the Ming Yongle emperor; rebuilt in 1751 by the Qianlong emperor.',
    caveatEn:
      'The building standing today is the 1751 Qianlong reconstruction, not the original Ming structure, and how the circular plan was actually built remains a subject of modern reconstruction research.',
    typeEn: 'Ritual building',
    ethnicityEn: 'Han',
  },
  'c11-summer-palace': {
    lon: 116.269,
    lat: 39.998,
    yearTextEn:
      'Begun in 1750 under the Qianlong emperor and rebuilt in 1888 during the Guangxu reign.',
    caveatEn:
      'This entry focuses on the spatial organisation of the garden and its long timber corridor; the World Heritage listing is UNESCO no. 880. Many of the buildings inside have been repaired, so the present state is not the original Qianlong-era appearance.',
    typeEn: 'Royal garden',
    ethnicityEn: 'Han',
  },
  'c12-chengde-resort': {
    lon: 117.938,
    lat: 40.988,
    yearTextEn:
      'Built in stages between 1703 and 1780, under the Kangxi and Qianlong emperors.',
    caveatEn:
      'The resort contains a large number of buildings rebuilt or repaired in the 1990s, so not everything standing today can be read as original Qing work.',
    typeEn: 'Royal garden and palace complex',
    ethnicityEn: 'Han',
  },
  'c13-suzhou-classical-gardens': {
    lon: 120.629,
    lat: 31.324,
    yearTextEn:
      'Each garden was founded between the Song and Yuan dynasties and repeatedly enlarged and remodelled in the Ming and Qing.',
    caveatEn:
      'The dates, layouts and visiting areas of the four gardens have changed over time; this entry treats them together as one garden type, while UNESCO lists each garden separately.',
    typeEn: 'Classical garden',
    ethnicityEn: 'Han',
  },
  'c14-hangzhou-west-lake': {
    lon: 120.15,
    lat: 30.246,
    yearTextEn:
      'The lake took shape in the mid-Tang and was laid out as "West Lake" in the Southern Song; building continued through later dynasties.',
    caveatEn:
      'West Lake\'s heritage status is that of a cultural landscape whose buildings are largely later reconstructions, so this entry does not date the surviving buildings on their own.',
    typeEn: 'Classical garden and lake landscape',
    ethnicityEn: 'Han',
  },
  'c15-hongcun-village': {
    lon: 117.991,
    lat: 30.003,
    yearTextEn:
      'Laid out during the Southern Song, formed as a settlement in the Ming, and at its height in the Qing.',
    caveatEn:
      'Most surviving houses date from the Qing, and the detailed periodisation of Huizhou architecture varies between authorities; the "ox-shaped" water system is a modern interpretation.',
    typeEn: 'Traditional village of houses',
    ethnicityEn: 'Han',
  },
  'c16-xidi-village': {
    lon: 117.996,
    lat: 29.903,
    yearTextEn:
      'Village founded during the Huangyou era of the Northern Song; at its height in the Ming and Qing.',
    caveatEn:
      'Several houses were substantially altered in the twentieth century, so the share of original Ming-Qing fabric cannot be judged from appearance alone.',
    typeEn: 'Traditional village of houses',
    ethnicityEn: 'Han',
  },
  'c17-fujian-tulou': {
    lon: 116.9727,
    lat: 24.6658,
    yearTextEn:
      'The tulou tradition took shape in the late Ming and early Qing; most surviving examples were built in the eighteenth and nineteenth centuries.',
    caveatEn:
      'The surviving clusters have been repaired and altered by residents over generations; what this entry describes is the division of labour between earth walls for enclosure and timber for the floors, not a claim that every wall is original rammed earth.',
    typeEn: 'Fortified earthen dwelling',
    ethnicityEn: 'Han',
  },
  'c18-kaiping-diaolou': {
    lon: 112.5745,
    lat: 22.3765,
    yearTextEn:
      'Built one after another from the mid-Qing period to the Republican era (16th–20th centuries).',
    caveatEn:
      'Most surviving towers were restored with overseas donations in the 1980s and 1990s; the openable windows and added staircases inside are not original.',
    typeEn: 'Defensive watchtower',
    ethnicityEn: 'Han',
  },
  'c19-pingyao-ancient-city': {
    lon: 112.15,
    lat: 37.2,
    yearTextEn:
      'Expanded in the Ming and Qing; the surviving city wall dates from the 1370 Hongwu expansion and later repairs.',
    caveatEn:
      'Many modern buildings were inserted into the old city in the twentieth century; "largely intact" is meant in the sense of the World Heritage evaluation rather than literally.',
    typeEn: 'Historic walled city',
    ethnicityEn: 'Han',
  },
  'c20-dunhuang-mogao': {
    lon: 94.809,
    lat: 40.043,
    yearTextEn:
      'Begun in 366 under the Former Qin and enlarged through the Sixteen Kingdoms, Tang and Yuan dynasties.',
    caveatEn:
      'The murals and painted sculpture have been repeatedly restored and have flaked; this entry focuses on the cave forms and the cliff structure rather than on dating the art.',
    typeEn: 'Rock-cut cave temple',
    ethnicityEn: 'Han',
  },
  'c21-longmen-grottoes': {
    lon: 112.467,
    lat: 34.556,
    yearTextEn:
      'Excavated from 493 onwards, after the Northern Wei moved its capital to Luoyang, and at its height under the Tang.',
    caveatEn:
      'Its World Heritage status refers to UNESCO listing 1003; the scholarly periodisation of the excavation and the sculpture still differs in detail, so this catalogue gives only the broad outline.',
    typeEn: 'Rock-cut cave temple',
    ethnicityEn: 'Han',
  },
  'c22-dazu-rock-carvings': {
    lon: 105.7,
    lat: 29.7,
    yearTextEn:
      'Mostly excavated in the Southern Song (12th–13th centuries), with later additions.',
    caveatEn:
      'The World Heritage listing 912 covers five separate cliff faces — Baoding, Beishan, Nanshan, Shizhuanshan and Shijia Mountain — and the dating of subjects and periods differs slightly between studies.',
    typeEn: 'Rock-cut cliff-carving site',
    ethnicityEn: 'Han',
  },
  'c23-shaolin-temple': {
    lon: 112.936,
    lat: 34.507,
    yearTextEn:
      'Founded during the Tai\'an era of the Northern Wei (455–466); the halls seen today were rebuilt in the Ming and Qing.',
    caveatEn:
      'Most surviving halls are Ming-Qing rebuilds, so the link to the Northern Wei site has to be read from documents and the pagoda forest rather than from the surviving timberwork.',
    typeEn: 'Buddhist temple complex',
    ethnicityEn: 'Han',
  },
  'c24-wudang-temples': {
    lon: 111.004,
    lat: 32.401,
    yearTextEn:
      'Large-scale construction begun in 1412 under the Ming Yongle emperor and continued into the Qing.',
    caveatEn:
      'The mountain buildings were damaged by fire many times in history, and what stands today includes structures reconstructed in the 1990s from archaeological evidence and documents.',
    typeEn: 'Daoist temple complex',
    ethnicityEn: 'Han',
  },
  'c25-hemudu-site': {
    lon: 121.346,
    lat: 29.963,
    yearTextEn:
      'Dated to roughly 7000 years ago, with the cultural deposits spanning about 5000 years.',
    caveatEn:
      'The excavated members are mostly fragments and decayed samples, so their reconstruction has several possible readings; this entry marks a technical starting point rather than a complete building.',
    typeEn: 'Archaeological settlement site',
    ethnicityEn: 'Prehistoric ancestors',
  },
  'c26-zengchong-drum-tower': {
    lon: 108.643,
    lat: 25.959,
    yearTextEn:
      'Built in 1841 during the Qing Daoguang reign; the frame was rebuilt in the 1980s.',
    caveatEn:
      'The tower shows traces of the tailiang frame rebuilt in the 1980s; 1841 is the accepted completion date.',
    typeEn: 'Dong drum tower',
    ethnicityEn: 'Dong',
  },
  'c27-zhaoxing-dong-village': {
    lon: 109.17,
    lat: 25.9086,
    yearTextEn:
      'Grew up gradually after the Song dynasty; most surviving buildings date from the late Qing and early Republican period.',
    caveatEn:
      'The houses have been repeatedly repaired and rebuilt, especially since the 1990s, so "Dong architecture" features stand alongside modern alterations.',
    typeEn: 'Dong village',
    ethnicityEn: 'Dong',
  },
  'c28-beijian-covered-bridge': {
    lon: 119.996,
    lat: 27.474,
    yearTextEn:
      'Begun in 1674 during the Qing Kangxi reign, rebuilt in 1803 and repaired again in 1849.',
    caveatEn:
      'The bridge was conserved in 2020–2021 — the twisted frame was straightened and damaged members replaced — so the present state carries restoration traces; "without a single nail or rivet" refers to the woven-beam arch itself.',
    typeEn: 'Covered timber bridge',
    ethnicityEn: 'Han',
  },
  'c29-xianju-bridge': {
    lon: 119.752,
    lat: 27.578,
    yearTextEn:
      'Begun in 1453 during the Ming Jingtai reign and repeatedly repaired in the Qing.',
    caveatEn:
      'The form standing today is the state after Qing rebuilding; 1453 is the founding date. The timber dimensions and the "old mountain timber" grade are described in the intangible-heritage documentation.',
    typeEn: 'Covered timber bridge',
    ethnicityEn: 'Han',
  },
  'c30-zhaozhou-bridge': {
    lon: 114.7633,
    lat: 37.7202,
    yearTextEn:
      'Designed and built between the Sui and early Tang, roughly 605–630.',
    caveatEn:
      'Both a Sui and a Tang foundation date are in circulation, about twenty years apart; this catalogue marks the date approximate and keeps both readings.',
    typeEn: 'Stone segmental-arch bridge',
    ethnicityEn: 'Han',
  },
  'c31-luding-bridge': {
    lon: 102.23,
    lat: 29.915,
    yearTextEn:
      'Completed between 1705 and 1706 under the Qing Kangxi emperor.',
    caveatEn:
      'The iron chains were replaced in the 1950s and the deck and fittings have been repaired many times; "begun under the Qing" describes the history of the form, not the age of the chains on view.',
    typeEn: 'Iron chain suspension bridge',
    ethnicityEn: 'Han',
  },
  'c32-lijiang-old-town': {
    lon: 100.227,
    lat: 26.855,
    yearTextEn:
      'Town established under the Yuan dynasty and expanded into its present form in the Ming and Qing.',
    caveatEn:
      'Lijiang was heavily reshaped for tourism in the 1990s, and the gap between the present state and a "historic city original" is still debated by scholars and planners.',
    typeEn: 'Historic town',
    ethnicityEn: 'Naxi',
  },
  'c33-dali-bai-dwellings': {
    lon: 100.3,
    lat: 25.681,
    yearTextEn:
      'Formed in the Ming and Qing and extensively modified and extended in the modern period.',
    caveatEn:
      'The "three bays and a screen wall" layout is shared by Bai settlements such as Dali, Jianchuan and Heqing, but the workmanship differs from place to place and cannot be generalised.',
    typeEn: 'Bai vernacular dwelling',
    ethnicityEn: 'Bai',
  },
  'c34-taoping-qiang-village': {
    lon: 103.6,
    lat: 31.54,
    yearTextEn:
      'Formed in the Ming; most of the buildings inside the village today are Qing or more recent.',
    caveatEn:
      'The 2008 Wenchuan earthquake badly damaged Taoping, and the surviving buildings include ones restored to their former appearance after the quake.',
    typeEn: 'Qiang fortified village',
    ethnicityEn: 'Qiang',
  },
  'c35-manchu-log-house': {
    lon: 129.633,
    lat: 44.551,
    yearTextEn:
      'Formed during the Qing dynasty and still in use today.',
    caveatEn:
      'Many log houses in the northeastern forest region were relocated there by forest-industry settlers in the mid-twentieth century, so not every surviving example has been continuously occupied since the Qing.',
    typeEn: 'Log-cabin dwelling',
    ethnicityEn: 'Manchu',
  },
  'c36-mongolian-yurt': {
    lon: 116.048,
    lat: 43.934,
    yearTextEn:
      'A traditional Mongol dwelling, still in continuous use today.',
    caveatEn:
      'Most settled gers today are built in brick, timber and corrugated sheet, so "portable" and "felt-covered" are not universal features of present-day examples.',
    typeEn: 'Portable felt dwelling',
    ethnicityEn: 'Mongol',
  },
  'c37-dai-bamboo-house': {
    lon: 100.797,
    lat: 22.009,
    yearTextEn:
      'A living tradition; since the 1950s most have been rebuilt in brick and timber.',
    caveatEn:
      'Most surviving "Dai bamboo houses" are reconstructions or imitations; genuinely all-bamboo structures are now rare in the villages of Yunnan.',
    typeEn: 'Stilted bamboo dwelling',
    ethnicityEn: 'Dai',
  },
  'c38-potala-palace': {
    lon: 91.117,
    lat: 29.657,
    yearTextEn:
      'Begun in the seventeenth century and completed in stages from 1693; it was the residence of successive Dalai Lamas until the mid-twentieth century.',
    caveatEn:
      'The UNESCO number carried here is a placeholder and must be checked against the official UNESCO list before citation; the palace interiors hold collections of works of art from many periods.',
    typeEn: 'Palace and religious building',
    ethnicityEn: 'Tibetan',
  },
  'c39-xiaoyanta': {
    lon: 108.937,
    lat: 34.241,
    yearTextEn:
      'Built in 707 during the Tang dynasty, and repaired repeatedly in the Ming and Qing.',
    caveatEn:
      'The tilt and the cracks have been reinforced more than once, and the storey count in the "dense-eave" (miyan) description differs between studies.',
    typeEn: 'Brick pagoda',
    ethnicityEn: 'Han',
  },
  'c40-feiyun-pavilion': {
    lon: 112.923,
    lat: 35.7984,
    yearTextEn:
      'Rebuilt in 1849 during the Qing Daoguang reign.',
    caveatEn:
      'The tower standing today is the Qing Daoguang reconstruction, itself overhauled around 1940; "China\'s number one wooden tower" is a popular-media and popular nickname, not an official title.',
    typeEn: 'Multi-storey timber tower',
    ethnicityEn: 'Han',
  },
  'c41-luoyang-bridge': {
    lon: 118.676,
    lat: 24.955,
    yearTextEn:
      'Built between 1053 and 1059 under the Northern Song; the bridge standing today was rebuilt on the original site in the 1950s.',
    caveatEn:
      'The surviving bridge is a 1950s rebuild on the original alignment, reusing some of the original stone beams and piers, so it is not the original Northern Song fabric; this entry describes the beam-and-pier stone bridge technique without asserting a measured dating.',
    typeEn: 'Stone beam-and-pier bridge',
    ethnicityEn: 'Han',
  },
  'c42-baise-cellar-courtyard': {
    lon: 108.8607,
    lat: 34.8035,
    yearTextEn:
      'A continuous tradition with no single founding date; the village is said to have been founded in the Jin dynasty.',
    caveatEn:
      'Sunken-pit courtyards are a continuous dwelling tradition with no common founding date; the surviving courtyards have been repaired and rebuilt over generations and survive in varying condition, and the figure of 780 households counts village households, not courtyard dwellings.',
    typeEn: 'Sunken-pit courtyard dwelling',
    ethnicityEn: 'Han',
  },
};

export default ENRICHMENT;
