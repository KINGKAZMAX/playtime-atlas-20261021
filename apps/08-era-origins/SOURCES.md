# 来源台账 / SOURCES

本文件与 `src/data/exhibits.js` 中的 `SOURCES` 数组**同源**：展厅长廊与差异章节里出现的每一句史实，都能落到下表某一条的「所支撑的史实」中。

**取证时间：2026-10-21**（一次抽样复核：全部条目返回 HTTP 200，`bnl.gov` 两条例外，见下）

**取证方式标记**

| 标记 | 含义 |
| --- | --- |
| `http-200` | 直接抓取原页面成功，HTTP 状态码 200，正文可读 |
| `search-index` | 目标域名在本次沙箱内被网络策略拦截，**正文经搜索索引完整取回**并逐条比对；未直连成功，如实标注 |

> **引用 ≠ 授权。** 下列页面仅用于历史研究与事实核对，其著作权归各自机构或作者所有；本项目未复制其任何美术、代码或商标。

---

## A. 官方机构 / 馆方

### 1. The First Video Game? — Before "Pong", There Was "Tennis for Two"
- **机构**：Brookhaven National Laboratory（美国布鲁克海文国家实验室）
- **URL**：<https://www.bnl.gov/about/history/firstvideo.php>
- **取证方式**：`search-index`（`bnl.gov` 直连被沙箱网络策略拦截，正文经检索索引取回并逐条比对）
- **所支撑的史实**：
  - Tennis for Two 于 1958-10-18 在 BNL 年度公众开放日首次公开
  - 双人各持一个控制器，连接模拟计算机，使用示波器作为屏幕
  - 画面是二维侧视球场；球是「一个明亮的、会动的点」，反弹时留下拖影
  - 控制器上有按钮和可旋转的旋钮，用于控制看不见的球拍角度
  - 大脑是 Donner Model 30 模拟计算机；其说明书里的弹跳球轨迹曲线启发了 Higinbotham
  - 10 个运算放大器中 4 个用于生成球的运动，其余 6 个用于感知触地与触网并切换控制权
  - 以分时方式轮流显示球场、球网与球，三路输出以 36Hz 切换，人眼看到的是一幅完整画面
  - 1958 年使用 5 英寸示波器；1959 年改进为 10–17 英寸，并可选月球低重力 / 木星高重力
  - 该游戏从未申请专利，公开演示约一年后被拆解，原始零件后来被丢弃
  - 前身：1948 年 Goldsmith 与 Mann 的「Cathode-Ray Tube Amusement Device」专利
  - 前身：1951 年 Ferranti International 的 Nimrod 计算机，在 Festival of Britain 展示
  - 前身：1952 年剑桥大学 A. S. Douglas 在 EDSAC 上做的电子井字棋 OXO

### 2. Celebrating 'Tennis for Two' With A Video Game Extravaganza
- **机构**：Brookhaven National Laboratory
- **URL**：<https://www.bnl.gov/newsroom/news.php?a=2964>
- **取证方式**：`search-index`（同域名受限）
- **所支撑的史实**：
  - 2008 年 BNL 仪器部用继电器与锗管等老元件重建了可玩的 Tennis for Two
  - 重建者：Peter Takacs、Gene Von Achen、Paul O'Connor、Scott Coburn
  - 1950 年代原机使用真空管模拟电路，重建版用现代集成电路模拟

### 3. Computer Space — Catalog Object
- **机构**：Computer History Museum
- **URL**：<https://www.computerhistory.org/collections/catalog/102667509>
- **取证方式**：`http-200`
- **所支撑的史实**：馆藏 Computer Space 街机机台实物档案

### 4. Pong — Hall of Fame entry
- **机构**：The Strong National Museum of Play
- **URL**：<https://www.museumofplay.org/games/pong/>
- **取证方式**：`http-200`
- **所支撑的史实**：Pong 入选世界电子游戏名人堂的馆方条目

### 5. Computer Space — Hall of Fame entry
- **机构**：The Strong National Museum of Play
- **URL**：<https://www.museumofplay.org/games/computer-space/>
- **取证方式**：`http-200`
- **所支撑的史实**：Computer Space 入选世界电子游戏名人堂的馆方条目

### 6. Game, set, match: a history of tennis videogames
- **机构**：ACMI（Australian Centre for the Moving Image）
- **URL**：<https://www.acmi.net.au/stories-and-ideas/videogame-set-match/>
- **取证方式**：`http-200`
- **所支撑的史实**：馆方关于电子网球游戏谱系的专题文章

### 7. Historical Context
- **机构**：MEGA — Museum of Electronic Games & Art
- **URL**：<http://t42.m-e-g-a.org/context.html>
- **取证方式**：`http-200`
- **所支撑的史实**：
  - 1958-10-18 数百名访客排队体验最早的电子动作游戏
  - 控制器为旋钮（改变角度）与扳机（击球），屏幕上是一个明亮的移动点

---

## B. 百科条目

### 8. Tennis for Two
- **URL**：<https://en.wikipedia.org/wiki/Tennis_for_Two> · 取证：`http-200`
- **所支撑的史实**：
  - 由美国物理学家 William Higinbotham 于 1958 年在 Brookhaven 设计
  - 与技师 Robert V. Dvorak 合作，用三周时间搭建
  - Higinbotham 在数小时内完成设计，目标是让实验室开放日更有趣

### 9. Spacewar!
- **URL**：<https://en.wikipedia.org/wiki/Spacewar!> · 取证：`http-200`
- **所支撑的史实**：
  - 1962 年由 Steve Russell 与 Martin Graetz、Wayne Wiitanen、Bob Saunders、Steve Piner 等人开发
  - 运行在麻省理工学院新装的 DEC PDP-1 小型机上
  - 两艘飞船「针」与「楔」在一颗恒星的引力井中缠斗
  - 飞船有有限弹药与燃料，未加速时仍保持惯性运动
  - 贴近恒星借力（gravity assist）是常用战术
  - 飞船撞上鱼雷、恒星或对方即被摧毁；可随时进入超空间随机跳跃

### 10. Computer Space
- **URL**：<https://en.wikipedia.org/wiki/Computer_Space> · 取证：`http-200`
- **所支撑的史实**：
  - 1971 年由 Nolan Bushnell 与 Ted Dabney 以 Syzygy Engineering 合作创作
  - 被认为是最早的街机电子游戏，也是第一款商业可售电子游戏
  - 机制源自 1962 年的 Spacewar!
  - 玩家驾驶火箭，与两架由硬件逻辑控制的飞碟在星空中对战
  - 用定长时间计分，超时免费续一局
  - 因无法经济地在 Data General Nova 等小型机上运行，改用定制硬件替代中央计算机
  - 机柜为 Bushnell 设计的定制玻璃钢外壳

### 11. Magnavox Odyssey
- **URL**：<https://en.wikipedia.org/wiki/Magnavox_Odyssey> · 取证：`http-200`
- **所支撑的史实**：
  - 第一台商业家用电子游戏主机，由 Ralph Baer 带领的 Sanders Associates 团队设计
  - 美国于 1972 年 9 月发布，英国 1973 年，其他欧洲国家 1974 年
  - 画面能力为三个方点与一条高度可变的线，单色黑白
  - 玩家在屏幕前覆盖塑料贴片以补充每个游戏的视觉元素
  - 主机无法发声，也无法记录分数

### 12. Pong
- **URL**：<https://en.wikipedia.org/wiki/Pong> · 取证：`http-200`
- **所支撑的史实**：
  - 1972 年由 Atari 开发并发行，作品由 Allan Alcorn 制作，起因是 Nolan Bushnell 布置的训练任务
  - Bushnell 与 Ted Dabney 对完成质量感到意外，决定量产
  - Pong 是第一款商业上成功的电子游戏
  - 概念参考 Magnavox Odyssey 上的电子乒乓球；Magnavox 随后就专利侵权起诉 Atari

### 13. PLATO (computer system)
- **URL**：<https://en.wikipedia.org/wiki/PLATO_(computer_system)> · 取证：`http-200`
- **所支撑的史实**：
  - PLATO 是第一套通用的计算机辅助教学系统，1960 年起运行于伊利诺伊大学的 ILLIAC I
  - PLATO IV 终端（c. 1964，Donald Bitzer）采用橙色等离子显示屏
  - 显示为 512×512 位图，硬连线逻辑同时支持字符与矢量绘图，1260 波特
  - 配备 16 格触摸面板，是最早的触摸屏之一
  - 到 1970 年代末支持分布全球的数千个图形终端，运行在近十台联网主机上
  - 论坛、留言板、在线测试、电子邮件、聊天室、多人电子游戏等概念最早在此出现

### 14. Sketchpad
- **URL**：<https://en.wikipedia.org/wiki/Sketchpad> · 取证：`http-200`
- **所支撑的史实**：
  - 1963 年 Ivan Sutherland 在博士论文中写就的程序
  - 开创了人机交互，被视为现代 CAD 程序的祖先
  - 用光笔与 CRT 工作，展示了计算机图形可同时用于艺术与技术

### 15. Vector display
- **URL**：<https://en.wikipedia.org/wiki/Vector_display> · 取证：`http-200`
- **所支撑的史实**：
  - 矢量显示器是 1970 年代前后的图形显示设备，本质是一类示波器式 CRT
  - 图像由电子束沿任意路径绘制的线条组成，而不是发光像素网格
  - 刷新式矢量显示器需要每秒 30–40 次刷新才能稳定成像
  - 存储管显示器（如 Tektronix 4010）使用长余辉磷光体，可保持数分钟
  - 1970 年代矢量显示比位图更便宜，因为百万像素的计算机存储仍极其昂贵

### 16. The golden age of arcade video games
- **URL**：<https://en.wikipedia.org/wiki/Golden_age_of_arcade_video_games> · 取证：`http-200`
- **所支撑的史实**：
  - 街机黄金时代通常指 1970 年代末至 1980 年代初
  - 1978 年《Space Invaders》引发了射击游戏浪潮
  - 1979 年的《Asteroids》使用矢量图形，与《Galaxian》等并肩成为代表

---

## C. 专题站

### 17. The History of Vector Games
- **机构**：ArcadeVector
- **URL**：<https://arcadevector.com/history> · 取证：`http-200`
- **所支撑的史实**：
  - 1977 年 Cinematronics 的《Space Wars》由 Larry Rosenthal 开发，被称作第一款商业矢量街机
  - Rosenthal 在自家车库自制了矢量显示处理器
  - 1979 年 11 月 Atari 发布《Asteroids》，由 Lyle Rains 设计、Ed Logg 编写
  - 《Asteroids》成为 Atari 史上销量最高的街机作品，售出约 7 万台

---

## 取证说明与局限

- 本次共抽样复核 17 条 URL，返回状态码全部为 `200`；`bnl.gov` 的两条因沙箱网络策略直连失败，但正文已通过检索索引完整取回并逐条比对，故标 `search-index`，**不做「已直连」的粉饰**。
- `http-200` 仅表示**页面可达**，不表示内容永久不变；如需长期引用请以机构页面为准。
- Wikipedia 条目为**可编辑来源**，本项目仅引用其中被多家来源交叉印证的事实。
- 展厅叙事只做**代表性选样**，不做「覆盖全时代」的宣称；未列出的作品不等于不重要，只是不在本次选样范围内。
