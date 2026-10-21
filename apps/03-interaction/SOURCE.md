# SOURCE · 来源核验与证据边界

核验时间：**2026-10-21**（Asia/Taipei）。核验方式：内置 Browser 直接打开 x.com 帖子页读取**可见**的互动数据；辅以 X snowflake ID 反解时间戳交叉验证。

---

## 1. 选定参考作品

### 1.1 主参考（已完整核验）

| 项 | 值 |
| --- | --- |
| 作者 | Ricker（@0xRicker，蓝标认证；简介：AI researcher • developer • engineer） |
| 帖子 URL | **https://x.com/0xRicker/status/2112519745270321496** |
| 帖内媒体 | 视频（00:00 播放器，Demo 录屏） |
| 发布时间 | 帖子页显示「下午 8:22 · 2026年10月20日」 |
| snowflake 反解 | `2112519745270321496` → 2026-10-20 12:22:10 UTC = **2026-10-20 20:22:10 GMT+8** ✅ 与页面显示一致 |

**帖子正文（逐字，页面可见）**

> I gave MiniMax M3.1 Flash one prompt to build an AI agent command center from scratch.
>
> It generated an interactive dashboard with:
> → 25 simulated agents
> → live execution logs
> → task orchestration
> → real-time telemetry
>
> All running in the browser.
>
> What interests me most is how quickly models are turning complex UI concepts into working prototypes.
>
> Built with @MiniMax_AI.

**可见互动数据（2026-10-21 读取）**

| 指标 | 数值 |
| --- | --- |
| 浏览 | **976** |
| 回复 | **11** |
| 转发 | **2** |
| 喜欢 | **49** |
| 收藏 | **22** |

**模型归属证据强度：高。** 三处独立指向同一模型：
1. 正文第一句「I gave **MiniMax M3.1 Flash** one prompt to build…」。
2. 正文末尾「Built with **@MiniMax_AI**」（指 MiniMax 官方账号）。
3. InfoQ 中文报道转述同一事实并配图，图片内为同一帖子截图（含蓝标作者、原文与视频播放器）。

**证据限制（明确标注）**
- 页面在**未登录**状态下可见的互动数即为上表数值；**无法核实**是否存在登录后展示的更多字段（如精确转发者名单、书签者身份）。
- 数字为**读取时快照**，之后会随时间增长；引用时请带核验日期。
- 帖子**未公开**原始 prompt、源码仓库或在线 demo 地址，因此本任务**无法逐像素复刻其界面**，也**没有**试图复刻；本任务做的是**原创改编**（见 `DESIGN-DIFF.md`）。
- 「25 simulated agents」是作者对该 demo 行为的**自述**，本任务未获得该 demo 本体，未能独立验证其内部实现。

### 1.2 佐证来源

| 来源 | URL | 作用 |
| --- | --- | --- |
| InfoQ 中文报道 | https://www.infoq.cn/article/7Twa7KBWIzi8JGOdVwCK | 收录该帖截图并复述「AI 代理指挥中心 / 25 个模拟代理 / 实时执行日志 / 任务编排 / 实时遥测」；文末参考链接给出 nutlope 帖 URL |
| 新浪财经转载（InfoQ） | https://finance.sina.cn/2026-10-20/detail-inivwyrc5678558.d.html | 同上内容的可访问镜像 |
| 网易／AI科技评论 | https://www.163.com/dy/article/L9NNE5FE0511DPVD.html | 报道 M3.1 Flash 发布与实测，含多个开发者案例 |
| awesome-minimax-m3-1-flash | https://github.com/sandbase-lab/awesome-minimax-m3-1-flash | **88 个视频 / 72 位创作者**的公开索引，含本帖同批作品；用于横向比较热度与机制 |
| MiniMax 官方账号 | https://x.com/MiniMax_AI | 模型发布方原始帖：M3.1 Flash 发布公告（Space Bunny 即其早期版本） |
| MiniMax 官方博客 | https://www.minimax.io/blog/minimax-m31f | 官方模型说明 |
| MiniMax M Plan 页 | https://www.minimax.io/m-plan | 官方套餐与模型列表 |

### 1.3 同批候选横向对比（用于说明选型理由）

全部在同一时段（2026-10-19 ~ 10-20）、同一模型（M3.1 Flash）下产生，互动数据读取于 2026-10-21。

| 作者 | 作品类型 | 帖子 URL | 浏览 | 回复 | 转发 | 喜欢 | 收藏 |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| **@0xRicker** | **AI 代理指挥中心（交互仪表盘）** | [2112519745270321496](https://x.com/0xRicker/status/2112519745270321496) | 976 | 11 | 2 | **49** | **22** |
| @neropursue | Crossy Road 复刻（可玩游戏） | [2112541287622578567](https://x.com/neropursue/status/2112541287622578567) | 1,250 | 12 | 5 | 26 | 14 |
| @nutlope | 硬件发布落地页（静态对比） | [2112238098147135880](https://x.com/nutlope/status/2112238098147135880) | 13万 | 84 | 38 | 1,416 | 712 |
| @ItsmeAjayKV | 第一人称竞技场 FPS（three.js） | [2112213565566587346](https://x.com/ItsmeAjayKV/status/2112213565566587346) | — | — | — | — | — |
| @leo114119 | 第一人称竞技场 FPS（中文帖） | [2112223208338592187](https://x.com/leo114119/status/2112223208338592187) | — | — | — | — | — |

> **选型说明**
> - @nutlope 热度最高，但它是**落地页**（静态展示），与兄弟任务 `01-web` 属同类，排除。
> - 两则 FPS 帖属 **3D 实时渲染**，与兄弟任务 `02-model`（3D 查看器）邻近，且未取得完整互动数，排除。
> - Crossy Road 帖浏览量最高，但喜欢/收藏均低于 @0xRicker；且其机制为「游戏」，与本任务「调度台工具」定位不同。
> - @0xRicker 的**收藏 22 / 喜欢 49** 比值在交互型案例中偏高，说明用户更多是把它当作「可复用的交互范式」收藏，而非单纯点赞 → 与本任务「复刻交互范式」的目标最匹配。

**跨源佐证**：InfoQ 报道与 awesome 索引均独立收录了上述同批作品，两个来源对「@0xRicker = AI 代理指挥中心 / 25 代理 / 实时日志 / 任务编排 / 实时遥测」的描述一致。

---

## 2. 模型与发布背景（事实核验）

- **发布日**：2026-10-19，MiniMax 正式发布 **MiniMax M3.1 Flash**。
- **Space Bunny**：此前在开发者社区匿名走红的模型，MiniMax 确认其即 M3.1 Flash 的**早期版本**。OpenRouter 披露其曾连续 10 天位居平台调用量榜首，累计处理 **56.7T Token**；MiniMax 称累计处理量超 **200T Token**。（来源：InfoQ、新浪财经、网易／AI科技评论）
- **官方价格**：输入 $0.15 / 百万 token，输出 $0.60 / 百万 token，缓存输入 $0.015 / 百万 token（InfoQ 引官方价）。InfoQ 报道中另有一处写作「每百万 Token 输入 1 元、输出 4 元」，为同一价格的**人民币**口径表述，两处一致。
- **官方基准**（厂商自报，见 InfoQ）：Automation-Bench v1.0.6 **62.2**（复杂 Agent 任务对比第一）、BankerToolBench **76.2**、CyberGym **82.2**、OSWorld V2 **61.7**、DeepSWE v1.1 **73.7%、Artificial Analysis Intelligence Index **43**（前代 M3 为 29）。

## 3. 诚实声明

1. **本作品为原创改编，不是复刻。** 未获取参考 demo 源码与截图细节，故不存在像素级复刻；机制骨架（多执行体 / 实时日志 / 任务编排 / 实时遥测）来自帖子正文**文字描述**，具体交互由本任务**重新设计**。
2. **不声称全网第一。** 本任务只说明：在上述**已核验的 5 个同批候选**中，@0xRicker 帖的喜欢与收藏最高；未做全网普查，awesome 索引也自述为 curated 而非穷尽。
3. **未使用任何受限素材。** 未复制参考作品视频、截图、代码、字体文件、图标、ROM 或商业游戏资源；所有文案、配色、图形、织造术语均为原创。
4. **交互数据为快照值**，且读取自未登录视图；引用须带核验日期 2026-10-21。
5. **厂商基准为自报数据**，非独立第三方复测，本任务未做复测。
