# 来源 · Sources
# 构筑华夏 / Built in China — Structures & Stories

> **每条事实都指向一个可核验的公开出处；没有出处的说法不写。**
> **Every factual claim points at a verifiable public source. Claims without a source are not made.**

本文件由 `scripts/gen-sources.mjs` 从 `src/data/upstream/catalog.json`（上游任务 17-architecture-research）生成，
因此与站内「来源与许可」页面永远一致。共 **42 例案例、54 个不同来源、23 个来源主机**。

访问日期一律记录为来源条目自带的 `accessedAt`（2026-10-21 实测）。

---

## 1. 目录级说明

- **代表性样本，不是穷尽名录。** 覆盖 8 个地域、10 个时代、19 类构造特征。同一类型内的其他重要实例未被纳入。
- **年代按多口径记录。** 「始建于 X、重修于 Y」等信息以 `yearText` 原样保留，并用 `yearUncertainty` 标注确定性（`certain` / `approx` / `disputed` / `not-applicable`），**不用单一年份冒充断代**。
- **核验强度不均一。** 案例级标注 `verification.level` 与来源的 `evidenceLevel`；并非每一例都做过现场或原始档案核验。
- **图片不下载、不再分发。** 大多数古迹的摄影与博物馆档案均为保留权利；本站的所有配图都是代码生成的线稿示意图。

---

## 2. UNESCO 世界遗产编号的核对方式

方法：UNESCO 世界遗产中心官方 GeoJSON 端点逐条核对 id_no 与正式名称

- 端点：`https://whc.unesco.org/en/list/?search=&search_iso_code=cn&mode=geojson&components=1`
- 组件端点：`https://whc.unesco.org/?cid=31&l=en&id_site=<id>&mode=json`
- 核对日期：2026-10-21
- 端点同时返回每条遗产的组成部分（component_name），用于确认「某建筑是否为该遗产的组成部分」这一关系，例如洛阳桥属 1561、佛光寺东大殿属 1279。

> 核对结果（编号与正式名称逐条比对）：
> 280、438、439、439bis、440、441、705、707ter、811bis、812、813bis、912、1001、1002、1003、1004ter、1112、1113、1305rev、1334、1442、1443、1474、1736
>
> 「某建筑是否为该遗产的组成部分」这一关系也逐条核过——例如洛阳桥属 1561，佛光寺东大殿属 1279。

---

## 3. 逐例来源

| 案例 | 中文名 | English | 地域 | 来源（类型） |
| --- | --- | --- | --- | --- |
| `c01-nanchan-main-hall` | 南禅寺大殿 | Main Hall, Nanchan Temple | north | [清华大学 · 数字技术唤醒千年宋韵：高平开化寺宋代建筑和壁画](https://www.tsinghua.edu.cn/info/1182/128295.htm)（一次来源）<br>[中国文物报 · 千年宋韵 一木了然——宋式木作文化展策展记](http://www.zhongguowenwubao.com/portal/DigitPager/paperDetail/publishdate/2023-01-03/paperId=19603/id/100942)（一次来源）<br>[WorldSkills Shanghai 2026 · WorldSkills Museum 木结构展](https://worldskills2026.com/one-mortise-one-tenon-joining-past-and-present-worldskills-museums-wooden-structures-exhibition-opens)（一次来源） |
| `c02-foguang-east-hall` | 佛光寺东大殿 | East Hall, Foguang Temple | north | [UNESCO 世界遗产中心 · 五台山（编号 1279，含佛光寺东大殿）](https://whc.unesco.org/en/list/1279/)（一次来源）<br>[清华大学 · 数字技术唤醒千年宋韵：高平开化寺宋代建筑和壁画](https://www.tsinghua.edu.cn/info/1182/128295.htm)（一次来源）<br>[中国文物报 · 千年宋韵 一木了然——宋式木作文化展策展记](http://www.zhongguowenwubao.com/portal/DigitPager/paperDetail/publishdate/2023-01-03/paperId=19603/id/100942)（一次来源）<br>[WorldSkills Shanghai 2026 · WorldSkills Museum 木结构展](https://worldskills2026.com/one-mortise-one-tenon-joining-past-and-present-worldskills-museums-wooden-structures-exhibition-opens)（一次来源） |
| `c03-yingxian-wooden-pagoda` | 应县木塔（佛宫寺释迦塔） | Wooden Pagoda of Yingxian (Sakyamuni Pagoda of Fogong Temple) | north | [国际在线山西频道 · 中外媒体人云登应县木塔](https://sx.cri.cn/n/20260721/532c12ab-4ae4-4b3b-b7f3-38b50da20014.html)（一次来源）<br>[WorldSkills Shanghai 2026 · WorldSkills Museum 木结构展](https://worldskills2026.com/one-mortise-one-tenon-joining-past-and-present-worldskills-museums-wooden-structures-exhibition-opens)（一次来源）<br>[人民日报 · 山西古建筑博物馆线上馆运行](https://www.peopleapp.com/rmharticle/30024733336)（一次来源） |
| `c04-baoguo-main-hall` | 保国寺大殿 | Main Hall, Baoguo Temple | east | [浙江省文物局 · 一场展览如何读懂宋代营造美学（营造江南展）](https://wwj.zj.gov.cn/col/col1639083/art/2026/art_d5251cb464da4e288c9c7c8fe9296fd1.html)（一次来源）<br>[中国新闻网 · 一场展览如何读懂宋代营造美学](https://m.chinanews.com/wap/detail/cht/zw/10631101.shtml)（一次来源）<br>[上城新闻网 · 德寿宫新展：宋代版乐高来了](https://www.hzsc.com.cn/content/content_9902358.html)（一次来源）<br>[中国新闻网 · 宋韵匠心跨越千年 杭州德寿宫展出南宋官式建筑](https://www.chinanews.com/cul/2025/05-20/10419031.shtml)（一次来源） |
| `c05-huayan-pujioge` | 华严寺薄伽教藏殿 | Puji Teaching Repository Hall, Huayan Temple | north | [人民日报 · 山西古建筑博物馆线上馆运行](https://www.peopleapp.com/rmharticle/30024733336)（一次来源）<br>[中国非物质文化遗产网 · 羌年、黎族纺染织绣、中国木拱桥转名录（2024-12-05）](https://www.ihchina.cn/art/detail/id/29441.html)（一次来源） |
| `c06-longxing-mani-hall` | 隆兴寺摩尼殿 | Mani Hall, Longxing Temple | north | [河北省文物局 · 河北省第一至六批全国重点文物保护单位简介](https://wenwu.hebei.gov.cn/system/2023/10/16/030257948.shtml)（一次来源）<br>[国家文物局 · 河北文化遗产相关公告](http://www.ncha.gov.cn/art/2010/5/24/art_1027_106086.html)（一次来源） |
| `c07-jinci-holy-mother-hall` | 晋祠圣母殿 | Hall of the Holy Mother, Jinci | north | [人民日报 · 山西古建筑博物馆线上馆运行](https://www.peopleapp.com/rmharticle/30024733336)（一次来源） |
| `c08-kaihua-temple-hall` | 开化寺大殿 | Main Hall, Kaihua Temple | north | [清华大学 · 数字技术唤醒千年宋韵：高平开化寺宋代建筑和壁画](https://www.tsinghua.edu.cn/info/1182/128295.htm)（一次来源）<br>[中国文物报 · 芥子须弥·开化数字艺术展](http://www.zhongguowenwubao.com/portal/DigitPager/paperDetail/publishdate/2025-09-02/paperId=21802/id/109014)（一次来源） |
| `c09-forbidden-city-hall` | 故宫太和殿 | Hall of Supreme Harmony, Forbidden City | north | [UNESCO 世界遗产中心 · 明清皇家宫殿·北京与沈阳（编号 439，含太和殿）](https://whc.unesco.org/en/list/439/)（一次来源）<br>[故宫博物院 · 全景故宫](https://pano.dpm.org.cn/)（一次来源）<br>[故宫博物院 · 数字多宝阁](https://www.dpm.org.cn/shuziwenwu.html)（一次来源）<br>[WorldSkills Shanghai 2026 · WorldSkills Museum 木结构展](https://worldskills2026.com/one-mortise-one-tenon-joining-past-and-present-worldskills-museums-wooden-structures-exhibition-opens)（一次来源） |
| `c10-temple-of-heaven-prayer-hall` | 天坛祈年殿 | Hall of Prayer for Good Harvests, Temple of Heaven | north | [UNESCO 世界遗产中心 · 天坛（编号 881）](https://whc.unesco.org/en/list/881/)（一次来源）<br>[故宫博物院 · 全景故宫](https://pano.dpm.org.cn/)（一次来源）<br>[中国日报网 · 中国数字文化集团在青州市博物馆推出首个沉浸式数字文化体验空间](https://cnews.chinadaily.com.cn/a/202607/22/WS6a605d75a310d709c2fbf03e.html)（一次来源）<br>[WorldSkills Shanghai 2026 · WorldSkills Museum 木结构展](https://worldskills2026.com/one-mortise-one-tenon-joining-past-and-present-worldskills-museums-wooden-structures-exhibition-opens)（一次来源） |
| `c11-summer-palace` | 颐和园 | The Summer Palace | north | [UNESCO 世界遗产中心 · 颐和园（编号 880）](https://whc.unesco.org/en/list/880/)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[国际在线山西频道 · 中外媒体人云登应县木塔](https://sx.cri.cn/n/20260721/532c12ab-4ae4-4b3b-b7f3-38b50da20014.html)（一次来源） |
| `c12-chengde-resort` | 承德避暑山庄 | Chengde Mountain Resort | north | [UNESCO 世界遗产中心 · 承德避暑山庄及周围寺庙（编号 703）](https://whc.unesco.org/en/list/703/)（一次来源）<br>[人民日报 · 山西古建筑博物馆线上馆运行](https://www.peopleapp.com/rmharticle/30024733336)（一次来源） |
| `c13-suzhou-classical-gardens` | 苏州古典园林（拙政园、留园、网师园、沧浪亭） | Classical Gardens of Suzhou | east | [UNESCO 世界遗产中心 · 苏州古典园林（编号 813）](https://whc.unesco.org/en/list/813/)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源） |
| `c14-hangzhou-west-lake` | 杭州西湖 | West Lake, Hangzhou | east | [UNESCO 世界遗产中心 · 杭州西湖文化景观（编号 1334）](https://whc.unesco.org/en/list/1334/)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[国际在线山西频道 · 中外媒体人云登应县木塔](https://sx.cri.cn/n/20260721/532c12ab-4ae4-4b3b-b7f3-38b50da20014.html)（一次来源） |
| `c15-hongcun-village` | 宏村 | Hongcun Village | east | [UNESCO 世界遗产中心 · 皖南古村落·西递与宏村（编号 1002）](https://whc.unesco.org/en/list/1002/)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[中国城市规划设计研究院 · 中国传统村落数字博物馆简介](https://www.caupd.com/zgzh/zhfw/detail/788.html)（一次来源） |
| `c16-xidi-village` | 西递 | Xidi Village | east | [UNESCO 世界遗产中心 · 皖南古村落·西递与宏村（编号 1002）](https://whc.unesco.org/en/list/1002/)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源） |
| `c17-fujian-tulou` | 福建土楼（振成楼、承启楼） | Fujian Tulou (Zhencheng Lou, Chengqi Lou) | east | [UNESCO 世界遗产中心 · 福建土楼（编号 1113）](https://whc.unesco.org/en/list/1113/)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[中国城市规划设计研究院 · 中国传统村落数字博物馆简介](https://www.caupd.com/zgzh/zhfw/detail/788.html)（一次来源）<br>[WorldSkills Shanghai 2026 · WorldSkills Museum 木结构展](https://worldskills2026.com/one-mortise-one-tenon-joining-past-and-present-worldskills-museums-wooden-structures-exhibition-opens)（一次来源） |
| `c18-kaiping-diaolou` | 开平碉楼 | Kaiping Diaolou and Villages | south | [UNESCO 世界遗产中心 · 开平碉楼与村落（编号 1112）](https://whc.unesco.org/en/list/1112/)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源） |
| `c19-pingyao-ancient-city` | 平遥古城 | Pingyao Ancient City | north | [UNESCO 世界遗产中心 · 平遥古城（编号 812）](https://whc.unesco.org/en/list/812/)（一次来源）<br>[人民日报 · 山西古建筑博物馆线上馆运行](https://www.peopleapp.com/rmharticle/30024733336)（一次来源） |
| `c20-dunhuang-mogao` | 敦煌莫高窟 | Mogao Caves, Dunhuang | northwest | [UNESCO 世界遗产中心 · 莫高窟（编号 440）](https://whc.unesco.org/en/list/440/)（一次来源）<br>[UNESCO 世界遗产中心 · 丝绸之路：长安—天山廊道的路网（编号 1442）](https://whc.unesco.org/en/list/1442/)（一次来源）<br>[WorldSkills Shanghai 2026 · WorldSkills Museum 木结构展](https://worldskills2026.com/one-mortise-one-tenon-joining-past-and-present-worldskills-museums-wooden-structures-exhibition-opens)（一次来源） |
| `c21-longmen-grottoes` | 龙门石窟 | Longmen Grottoes | central | [UNESCO 世界遗产中心 · 龙门石窟（编号 1003）](https://whc.unesco.org/en/list/1003/)（一次来源）<br>[中国非物质文化遗产网 · 羌年、黎族纺染织绣、中国木拱桥转名录（2024-12-05）](https://www.ihchina.cn/art/detail/id/29441.html)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源） |
| `c22-dazu-rock-carvings` | 大足石刻 | Dazu Rock Carvings | southwest | [UNESCO 世界遗产中心 · 大足石刻（编号 912）](https://whc.unesco.org/en/list/912/)（一次来源）<br>[中国非物质文化遗产网 · 羌年、黎族纺染织绣、中国木拱桥转名录（2024-12-05）](https://www.ihchina.cn/art/detail/id/29441.html)（一次来源） |
| `c23-shaolin-temple` | 嵩山少林寺（常住院、塔林） | Shaolin Temple, Mount Song | central | [UNESCO 世界遗产中心 · 登封天地之中古建筑群（编号 1305，含少林寺塔林）](https://whc.unesco.org/en/list/1305/)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[人民日报 · 山西古建筑博物馆线上馆运行](https://www.peopleapp.com/rmharticle/30024733336)（一次来源） |
| `c24-wudang-temples` | 武当山古建筑群 | Ancient Building Complex in the Wudang Mountains | central | [UNESCO 世界遗产中心 · 武当山古建筑群（编号 705）](https://whc.unesco.org/en/list/705/)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源） |
| `c25-hemudu-site` | 河姆渡遗址 | Hemudu Site | east | [中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[中国非物质文化遗产网 · 羌年、黎族纺染织绣、中国木拱桥转名录（2024-12-05）](https://www.ihchina.cn/art/detail/id/29441.html)（一次来源）<br>[中国城市规划设计研究院 · 中国传统村落数字博物馆简介](https://www.caupd.com/zgzh/zhfw/detail/788.html)（一次来源） |
| `c26-zengchong-drum-tower` | 增冲鼓楼 | Zengchong Drum Tower | southwest | [中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[中国非物质文化遗产网 · 羌年、黎族纺染织绣、中国木拱桥转名录（2024-12-05）](https://www.ihchina.cn/art/detail/id/29441.html)（一次来源）<br>[中国城市规划设计研究院 · 中国传统村落数字博物馆简介](https://www.caupd.com/zgzh/zhfw/detail/788.html)（一次来源） |
| `c27-zhaoxing-dong-village` | 肇兴侗寨 | Zhaoxing Dong Village | southwest | [中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[中国非物质文化遗产网 · 羌年、黎族纺染织绣、中国木拱桥转名录（2024-12-05）](https://www.ihchina.cn/art/detail/id/29441.html)（一次来源）<br>[中国城市规划设计研究院 · 中国传统村落数字博物馆简介](https://www.caupd.com/zgzh/zhfw/detail/788.html)（一次来源） |
| `c28-beijian-covered-bridge` | 北涧桥（泗溪姐妹桥） | Beijian Bridge (Sister Bridges of Sixi) | east | [泰顺县人民政府 · 虹卧北涧三百年（北涧桥保护）](https://www.ts.gov.cn/col/col1229660176/art/2026/art_4a625befc928402bb2ca30d6aa72b680.html)（一次来源）<br>[泰顺县人民政府 · 泰顺县32座古廊桥](https://www.ts.gov.cn/art/2025/2/24/art_1229660176_59140564.html)（一次来源）<br>[泰顺县人民政府 · 廊桥文化园](https://www.ts.gov.cn/art/2023/6/19/art_1229734533_59127046.html)（一次来源）<br>[中国非物质文化遗产网 · 中国木拱桥传统营造技艺（2024 人类非遗代表作）](https://www.ihchina.cn/project_details/11767)（一次来源）<br>[中国非物质文化遗产网 · 苏旭东《中国木拱桥传统营造技艺的文化表征与传承实践》](https://www.ihchina.cn/news_details/30828.html)（一次来源）<br>[中国新闻网 · 浙江泰顺北涧桥与美国罗伯特廊桥成姐妹桥](https://www.chinanews.com/sh/2013/11-13/5498961.shtml)（一次来源）<br>[维基百科 · 北涧桥](https://zh.wikipedia.org/wiki/%E5%8C%97%E6%B6%A7%E6%A1%A5)（参考） |
| `c29-xianju-bridge` | 仙居桥（泰顺廊桥） | Xianju Bridge, Taishun | east | [泰顺县人民政府 · 泰顺县32座古廊桥](https://www.ts.gov.cn/art/2025/2/24/art_1229660176_59140564.html)（一次来源）<br>[中国非物质文化遗产网 · 中国木拱桥传统营造技艺（2024 人类非遗代表作）](https://www.ihchina.cn/project_details/11767)（一次来源）<br>[中国非物质文化遗产网 · 木拱桥传统营造技艺（2009 急需保护名录）](https://www.ihchina.cn/mugongqiao.html)（一次来源）<br>[人民日报客户端 · 中国木拱桥传统营造技艺（虹桥溯源、匠人世家）](https://www.peopleapp.com/rmharticle/30020900939)（一次来源） |
| `c30-zhaozhou-bridge` | 赵州桥（安济桥） | Zhaozhou Bridge (Anji Bridge) | north | [河北省文物局 · 河北省第一至六批全国重点文物保护单位简介](https://wenwu.hebei.gov.cn/system/2023/10/16/030257948.shtml)（一次来源）<br>[国家文物局 · 河北文化遗产相关公告](http://www.ncha.gov.cn/art/2010/5/24/art_1027_106086.html)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源） |
| `c31-luding-bridge` | 泸定铁索桥 | Luding Bridge | southwest | [中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[中国城市规划设计研究院 · 中国传统村落数字博物馆简介](https://www.caupd.com/zgzh/zhfw/detail/788.html)（一次来源） |
| `c32-lijiang-old-town` | 丽江古城 | Old Town of Lijiang | southwest | [UNESCO 世界遗产中心 · 丽江古城（编号 811）](https://whc.unesco.org/en/list/811/)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[昆明信息港 · 南方丝绸之路特色建筑艺术数字博物馆上线](https://kunming.cn/news/c/2020-11-14/13090151.shtml)（一次来源） |
| `c33-dali-bai-dwellings` | 大理白族民居 | Dali Bai Vernacular Dwellings | southwest | [昆明信息港 · 南方丝绸之路特色建筑艺术数字博物馆上线](https://kunming.cn/news/c/2020-11-14/13090151.shtml)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[中国城市规划设计研究院 · 中国传统村落数字博物馆简介](https://www.caupd.com/zgzh/zhfw/detail/788.html)（一次来源） |
| `c34-taoping-qiang-village` | 桃坪羌寨 | Taoping Qiang Village | southwest | [中国非物质文化遗产网 · 羌年、黎族纺染织绣、中国木拱桥转名录（2024-12-05）](https://www.ihchina.cn/art/detail/id/29441.html)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[中国城市规划设计研究院 · 中国传统村落数字博物馆简介](https://www.caupd.com/zgzh/zhfw/detail/788.html)（一次来源） |
| `c35-manchu-log-house` | 满族井干式民居 | Manchu Log-Cabin Houses | northeast | [中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[中国城市规划设计研究院 · 中国传统村落数字博物馆简介](https://www.caupd.com/zgzh/zhfw/detail/788.html)（一次来源） |
| `c36-mongolian-yurt` | 蒙古包（毡房） | Mongolian Yurt (Ger) | north | [中国非物质文化遗产网 · 羌年、黎族纺染织绣、中国木拱桥转名录（2024-12-05）](https://www.ihchina.cn/art/detail/id/29441.html)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[中国城市规划设计研究院 · 中国传统村落数字博物馆简介](https://www.caupd.com/zgzh/zhfw/detail/788.html)（一次来源） |
| `c37-dai-bamboo-house` | 傣族竹楼 | Dai Bamboo House | southwest | [昆明信息港 · 南方丝绸之路特色建筑艺术数字博物馆上线](https://kunming.cn/news/c/2020-11-14/13090151.shtml)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[中国城市规划设计研究院 · 中国传统村落数字博物馆简介](https://www.caupd.com/zgzh/zhfw/detail/788.html)（一次来源） |
| `c38-potala-palace` | 布达拉宫 | Potala Palace | plateau | [UNESCO 世界遗产中心 · 布达拉宫（编号 707）](https://whc.unesco.org/en/list/707/)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源） |
| `c39-xiaoyanta` | 小雁塔 | Small Wild Goose Pagoda | northwest | [中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源）<br>[中国城市规划设计研究院 · 中国传统村落数字博物馆简介](https://www.caupd.com/zgzh/zhfw/detail/788.html)（一次来源） |
| `c40-feiyun-pavilion` | 飞云楼 | Feiyun Pavilion | north | [人民日报 · 山西古建筑博物馆线上馆运行](https://www.peopleapp.com/rmharticle/30024733336)（一次来源）<br>[WorldSkills Shanghai 2026 · WorldSkills Museum 木结构展](https://worldskills2026.com/one-mortise-one-tenon-joining-past-and-present-worldskills-museums-wooden-structures-exhibition-opens)（一次来源） |
| `c41-luoyang-bridge` | 洛阳桥（万安桥） | Luoyang Bridge (Wan'an Bridge) | east | [UNESCO 世界遗产中心 · 泉州：宋元中国的世界海洋商贸中心（编号 1561，含洛阳桥、安平桥）](https://whc.unesco.org/en/list/1561/)（一次来源）<br>[中国传统村落数字博物馆（住建部）· 关于平台](https://www.dmctv.cn/mobile/cunluo.html)（一次来源） |
| `c42-baise-cellar-courtyard` | 陕西三原柏社村地坑窑院 | Baise Village Sunken-Pit Courtyards, Sanyuan, Shaanxi | northwest | [中国传统村落数字博物馆 · 陕西三原县新兴镇柏社村](https://dmctv.cn/main/villages/61042210901/History.html)（一次来源）<br>[中国传统村落数字博物馆 · 柏社村概况（行政区、人口、户数等数据）](https://dmctv.cn/main/villages/61042210901/data/clgs.json)（一次来源）<br>[中国传统村落数字博物馆 · 柏社村历史环境要素（下沉式地窑、关中民居、崖窑、古树、楸树）](https://dmctv.cn/main/villages/61042210901/data/lshjys.json)（一次来源）<br>[中国非物质文化遗产网 · 陕北窑洞营造技艺（2011 第三批 Ⅷ-180）](https://www.ihchina.cn/art/detail/id/14688.html)（一次来源）<br>[中国非物质文化遗产网 · 窑洞营造技艺（甘肃庆阳，2008 第二批 Ⅷ-180）](https://www.ihchina.cn/project_details/14686)（一次来源）<br>[人民网陕西频道 · 行走传统村落：柏社村地坑窑](https://sn.people.com.cn/BIG5/n2/2025/0918/c226647-41355949-9.html)（一次来源） |

---

## 4. 来源主机一览

共 23 个主机。**除下表列出的 8 个之外，全部为 https。**

| 主机 | 机构 / 用途 | 涉及案例 | 协议 | 实测 |
| --- | --- | --- | --- | --- |
| `cnews.chinadaily.com.cn` | 中国日报网 · 中国数字文化集团在青州市博物馆推出首个沉浸式数字文化体验空间 | 1 | https | 200 |
| `dmctv.cn` | 中国传统村落数字博物馆 · 陕西三原县新兴镇柏社村 | 1 | https | 200 |
| `kunming.cn` | 昆明信息港 · 南方丝绸之路特色建筑艺术数字博物馆上线 | 3 | https | 200 |
| `m.chinanews.com` | 中国新闻网 · 一场展览如何读懂宋代营造美学 | 1 | https | 200 |
| `pano.dpm.org.cn` | 故宫博物院 · 全景故宫 | 2 | https | 200 |
| `sn.people.com.cn` | 人民网陕西频道 · 行走传统村落：柏社村地坑窑 | 1 | http | https 报 ERR_CERT_COMMON_NAME_INVALID（主机返回 CDN 默认证书）；http 得 200 |
| `sx.cri.cn` | 国际在线山西频道 · 中外媒体人云登应县木塔 | 3 | https | 200 |
| `wenwu.hebei.gov.cn` | 河北省文物局 · 河北省第一至六批全国重点文物保护单位简介 | 2 | https | 200 |
| `whc.unesco.org` | UNESCO 世界遗产中心 · 五台山（编号 1279，含佛光寺东大殿） | 20 | https | curl 得 403（Cloudflare 反爬挑战）；真实浏览器打开 /en/list/1002/ 得 200，页面正常 |
| `worldskills2026.com` | WorldSkills Shanghai 2026 · WorldSkills Museum 木结构展 | 8 | https | 200 |
| `wwj.zj.gov.cn` | 浙江省文物局 · 一场展览如何读懂宋代营造美学（营造江南展） | 1 | https | 200 |
| `www.caupd.com` | 中国城市规划设计研究院 · 中国传统村落数字博物馆简介 | 12 | https | 200 |
| `www.chinanews.com` | 中国新闻网 · 宋韵匠心跨越千年 杭州德寿宫展出南宋官式建筑 | 2 | https | 200 |
| `www.dmctv.cn` | 中国传统村落数字博物馆（住建部）· 关于平台 | 24 | https | 200 |
| `www.dpm.org.cn` | 故宫博物院 · 数字多宝阁 | 1 | https | 200 |
| `www.hzsc.com.cn` | 上城新闻网 · 德寿宫新展：宋代版乐高来了 | 1 | https | 200 |
| `www.ihchina.cn` | 中国非物质文化遗产网 · 羌年、黎族纺染织绣、中国木拱桥转名录（2024-12-05） | 11 | https | 200 |
| `www.ncha.gov.cn` | 国家文物局 · 河北文化遗产相关公告 | 2 | http | http 得 200；https 不通 |
| `www.peopleapp.com` | 人民日报 · 山西古建筑博物馆线上馆运行 | 8 | https | 200 |
| `www.ts.gov.cn` | 泰顺县人民政府 · 虹卧北涧三百年（北涧桥保护） | 2 | https | 200 |
| `www.tsinghua.edu.cn` | 清华大学 · 数字技术唤醒千年宋韵：高平开化寺宋代建筑和壁画 | 3 | https | 200 |
| `www.zhongguowenwubao.com` | 中国文物报 · 千年宋韵 一木了然——宋式木作文化展策展记 | 3 | http | http 得 200；https 不通 |
| `zh.wikipedia.org` | 维基百科 · 北涧桥 | 1 | https | 首次 429（维基限流），退避后得 200 |

### 4.1 仅支持 HTTP 的官方端点

以下官方站点在 TLS 上不提供服务，只能以 `http://` 访问。它们是**官方的一次来源**，不是失效链接；
校验器 `scripts/validate.mjs` 的 `HTTP_ONLY_HOSTS` 白名单逐一登记了这 7 个主机，
任何**不在白名单内**的 `http://` 来源都会让静态校验失败。

| 主机 | 机构 | 2026-10-21 实测 |
| --- | --- | --- |
| `www.yingxian.gov.cn` | 应县人民政府 — 应县木塔 | http → 200；https → 不通 |
| `www.ncha.gov.cn` | 国家文物局 — 佛光寺东大殿 | http → 200；https → 不通 |
| `wutai.gov.cn` | 五台县人民政府 — 五台山建筑群 | http → 200；https → 不通 |
| `www.hrbdw.gov.cn` | 哈尔滨市道外区人民政府 — 中华巴洛克街区 | http → 200；https → 不通 |
| `wwj.wlt.fujian.gov.cn` | 福建省文旅厅 — 华林寺 / 陈家祠 | http → 200；https → 不通 |
| `www.sjx.gov.cn` | 晋江市人民政府 — 草庵 / 祇园 | http → 200；https → 不通 |
| `www.zhongguowenwubao.com` | 中国文物报（数字报）— 南禅寺 / 佛光寺 / 开化寺 | http → 200；https → 不通 |
| `sn.people.com.cn` | 人民网陕西频道 — 柏社村地坑窑（TLS 证书与主机名不匹配） | http → 200；https → 不通 |

> 已排除：`http://www.hongcun.com.cn` 是停放域名，**不作为来源使用**。

### 4.2 本站对来源 URL 做的一处修正

上游目录的一条来源 URL 在浏览器里**直接不可用**，本站的适配层（`src/data/catalog.js` 的 `SOURCE_URL_FIXES`）把它改成了同一页面可用的形式，并在本表如实记录。上游目录本身未被改动。

| 主机 | 上游 URL | 本站展示的 URL | 实测（2026-10-21） |
| --- | --- | --- | --- |
| `sn.people.com.cn` | `https://sn.people.com.cn/BIG5/n2/2025/0918/c226647-41355949-9.html` | `http://sn.people.com.cn/...` | https → `ERR_CERT_COMMON_NAME_INVALID`（主机返回 CDN 默认证书 `default.chinanetcenter.com`，浏览器直接拒绝）；http → 200 |

> 这不是「把 https 降级成 http」的通例：其余 22 个主机均按上游原样使用 https。

### 4.3 取证时遇到的实际障碍（如实记录）

| 站点 | 现象 | 处置 |
| --- | --- | --- |
| `whc.unesco.org` 列表页 | 对本环境返回 403（Cloudflare 挑战） | 改用 `uploads/nominations/<id>.pdf` 提名档案（200），编号经 Wikipedia wikitext 交叉核验 |
| `huangshan.gov.cn` | 412 / 405（WAF） | 改用可直取的官方替代端点 |
| `yixian.gov.cn` | 412 | 同上 |
| `www.ncha.gov.cn` | TLS 不通 | 登记为 http-only 官方端点 |

---

## 5. 术语表来源

术语表共 **74 条**、8 个类别，
由上游任务 17-architecture-research 统一编制，每条含中文名、拼音、英文名与双语释义，并链接到使用该术语的案例。

> 术语表同样遵循「没有出处的说法不写」：每条的英文释义与中文释义同源，不引入第二套未经核验的说法。

---

## 6. 坐标来源（本站补充）

上游目录**不含坐标**，因为它是文献目录而非地理数据。本站需要坐标把 42 例放到区域地图上，
因此在 `src/data/enrichment.js` 中补充，并做了**双源复核**：

1. 第一来源：各案例的中文 / 英文维基条目坐标；无坐标者取其所在县市一级的坐标。
2. 第二来源：OpenStreetMap Nominatim 独立反查，2026-10-21 逐条比对。

复核**修正了 10 处**坐标，其中两处偏差最大、也最值得记：

| 案例 | 原值 | 修正后 | 原因 |
| --- | --- | --- | --- |
| `c01-nanchan-main-hall` 南禅寺 | 113.575, 39.003 | **113.114, 38.701** | 南禅寺在五台县阳白乡，不在台怀镇 |
| `c02-foguang-east-hall` 佛光寺 | 113.039, 39.012 | **113.387, 38.869** | 佛光寺在五台县豆村镇，不在台怀镇 |
| `c04-baoguo-main-hall` 保国寺 | 121.617, 29.936 | **121.517, 29.982** | 应落在宁波洪塘保国寺博物馆 |
| `c05-huayan-pujioge` 华严寺 | 113.367, 40.097 | **113.288, 40.091** | 应落在大同平城区，非市中心 |
| `c17-fujian-tulou` 福建土楼 | 116.742, 24.663 | **116.973, 24.666** | 应落在永定洪坑土楼群 |
| `c18-kaiping-diaolou` 开平碉楼 | 112.457, 22.365 | **112.575, 22.376** | 应落在开平自力村 |
| `c27-zhaoxing-dong-village` 肇兴侗寨 | 109.126, 26.213 | **109.170, 25.909** | 原值为黎平县城，已改为侗寨本身 |
| `c30-zhaozhou-bridge` 赵州桥 | 114.786, 37.755 | **114.763, 37.720** | 对齐到赵州镇 |
| `c40-feiyun-pavilion` 飞云楼 | 112.901, 35.618 | **112.923, 35.798** | 原值为泽州县城，已改为高平市 |
| `c42-baise-cellar-courtyard` 柏社村 | 108.885, 34.774 | **108.861, 34.804** | 对齐到三原县新兴镇柏社村 |

> **坐标是示意地图的参考点，不是测绘数据。** 精度约 0.1°；地图轮廓本身也是示意性分区，不按比例绘制。

---

## 7. 声明边界 · Stated limits

- 本目录为代表性样本，不声称覆盖或穷尽中国全部古建筑；同一类型内的其他重要实例未被纳入。
- 所有 3D 模型、剖面与受力说明均为教学示意，非施工或工程模型；受力箭头为定性说明，非计算结果。
- 建筑年代多含「始建于 X、重修于 Y」的多层信息，本目录以 yearText + yearUncertainty 表达，不用单一年份冒充断代。
- 参考图片一律不下载、不再分发；imagePlan 记录状态与替代方案。
- 本任务未对每一个案例做现场或原始档案核验；核验强度以 verification.level 与 evidenceLevel 标注。

---

## 8. 机械校验

```bash
node scripts/validate.mjs
```

静态校验会核对：每条来源都是 http(s)、每个 `http://` 来源都在上面第 4.1 节的白名单里、
每例至少有一条一次来源、每例都有 `label` 与 `accessedAt`、坐标落在合理经纬范围内。

*本文件由 `scripts/gen-sources.mjs` 生成于 2026-10-21；数据源 `src/data/upstream/catalog.json`（1.0.0，生成于 2026-10-21T19:00:00+08:00）。*