# 霜隙远航 · Frostgap Voyager

> 一款完全程序化生成的第一人称 6 自由度飞船驾驶游戏。驾驶单人穿梭艇「霜隙号 FG-1」，
> 在一片稀疏的恒星系统里跃迁、扫描、记录，把每一个天体都登记进远航档案。

浏览器原生运行 · Three.js + Vite · **零 CDN / 零在线 API / 零外部素材**

---

## 快速开始

```bash
cd 04-spaceflight
npm run start          # 自动装依赖并启动 http://127.0.0.1:4314
```

或者分步执行：

```bash
npm install
npm run dev            # 开发服务器 127.0.0.1:4314
npm run build          # 产出静态包到 dist/
npm run preview        # 预览 dist/
```

> 仅监听 `127.0.0.1`，不对外网发布。端口被占用时 `scripts/start.sh` 会自动顺延。

---

## 这是什么

从驾驶舱第一视角驾驶一艘小型穿梭艇，在同一个恒星系统里自由活动。

| 要素 | 说明 |
| --- | --- |
| **真 6 自由度** | 鼠标俯仰 / 偏航，`Q`/`E` 滚转，`W A S D` 平移与推进，`Space`/`Ctrl` 升降。后三项互相独立，不是"换皮"的伪 6DOF。 |
| **牛顿惯性** | 推进器只给加速度，松手不会自动停住。惯性由固定步长积分器驱动，帧率无关。 |
| **四个可探索区域** | 维岚轨道、碎屑回廊、霜隙环系、伊尔达星域，各自有独立天体与扫描目标。 |
| **星图跃迁** | 在星图上选目标 → 充能 → 沿弯曲航线跃迁，带屏幕空间拉丝特效与音效。 |
| **天体扫描** | 准星对准目标按 `F`，2.6 s 扫描后写入远航档案（localStorage 持久化）。 |
| **空间站对接** | 靠近灯塔站泊位导引灯，减速后按 `R` 完成对接，燃料加满、船体修复。 |
| **程序化美术** | 行星表面、环带、星云、恒星米粒组织、船体蒙皮、空间站全部由 Canvas 噪声实时生成；没有任何图片文件。 |
| **程序化音频** | 引擎轰鸣、后燃器噪声、扫描蜂鸣、跃迁、碰撞闷响全部由 WebAudio 振荡器合成；没有音频文件。 |

## 文档索引

| 文件 | 内容 |
| --- | --- |
| [CONTROLS.md](CONTROLS.md) | 完整操作说明与键位表 |
| [QA.md](QA.md) | 人工与自动化验收清单、实测结果、已知限制 |
| [SOURCE-AND-DIFFERENCES.md](SOURCE-AND-DIFFERENCES.md) | 来源说明与「对照差异说明」 |
| [CHANGELOG.md](CHANGELOG.md) | 版本变更记录 |
| [manifest.json](manifest.json) | 交付清单（供 14-publish 集成） |
| [TASK.md](TASK.md) / [STATUS.md](STATUS.md) | 任务拆解与阶段状态 |

## 技术栈

- **Three.js 0.169**（npm 本地安装）
- **Vite 5**（npm 本地安装，构建产物为纯静态文件）
- 渲染：WebGL2 + ACES Filmic 色调映射 + UnrealBloom（可关）
- 音频：Web Audio API
- 持久化：`localStorage`

运行期**不发起任何网络请求**：字体使用系统字体栈，贴图与音频全部在本地程序化生成。

## 目录结构

```
04-spaceflight/
├── index.html              # 入口：HUD 结构 + 全部覆盖层 + SVG 字标
├── package.json
├── vite.config.js
├── scripts/start.sh        # 一键启动（自动装依赖、顺延端口）
├── qa/qa.mjs               # Playwright 自动化验收脚本
├── screenshots/            # 实机截图
├── dist/                   # 静态构建产物（可发布）
└── src/
    ├── main.js
    ├── styles.css          # 设计系统：暖金 / 象牙白 / 余烬红
    ├── core/               # Settings · SaveGame · EventBus · Util
    ├── gfx/                # Procedural（噪声/贴图）· Shaders（GLSL）
    ├── world/              # Config（世界常量）· Universe（世界装配）
    ├── ship/               # FlightModel（6DOF）· Cockpit（驾驶舱/船体）
    ├── input/              # Input（指针锁定 + 回退操控）
    ├── audio/              # AudioEngine（程序化合成）
    ├── ui/                 # HUD · MFD · Gauge · Overlays
    └── game/               # Game（主循环）· Missions（任务链）
```

## URL 参数

| 参数 | 作用 |
| --- | --- |
| `?quality=low\|medium\|high` | 启动时强制画质档位（会写入设置） |
| `?gpu=force` | 不因检测到软件光栅器而自动降档（用于真实 GPU 截图） |

## 许可

代码与全部程序化素材均为本项目原创产出，详见 [SOURCE-AND-DIFFERENCES.md](SOURCE-AND-DIFFERENCES.md)。
依赖 `three`（MIT）与 `vite`（MIT）均已本地化安装。
