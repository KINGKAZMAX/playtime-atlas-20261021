# SOURCES.md — 来源与资产许可

> 任务：01｜热门网页案例复刻（原创改编）
> 整理时间：2026-10-21（Asia/Taipei）
> 原则：**运行时零外部请求**。没有 CDN、没有外部 API、没有远程字体或图片。

---

## 1. 参考来源（事实性引用）

本作品参考了一个公开案例所展示的**工艺水准**，但**不是它的复制品**。
完整选案证据链见 `../00-research/SOURCE.md`。

| 项目 | 内容 |
|---|---|
| 参考原帖 | https://x.com/nutlope/status/2112238098147135880 |
| 作者 | Hassan（@nutlope），蓝色认证，认证主体 Together AI |
| 发帖时间 | 2026-10-19T17:43:00Z = 2026-10-20 01:43（UTC+8） |
| 模型证据 | 原帖正文：`I asked M3.1 Flash (left) and Opus 5.5 (right) to build me a landing page for a hardware device launch.` / `MiniMax cost just $0.014 vs $1.22 for Opus` |
| 可见互动 | 1,417 赞、85 回复、13 万次视频播放（取数日 2026-10-21） |
| 引用范围 | 仅作**出处性引用**：说明本作品参考了哪件公开作品、该作品由哪个模型生成、其公开互动量是多少 |
| 未引用 | 原帖的文案、图像、视频、字体、图形**一律未复制**到本交付物中 |

### ⚠️ 证据缺口（如实标注）

参考原帖的**转发数与收藏数本次未能核到**：

- X 官方 syndication 接口不返回 `retweet_count` / `bookmark_count` 字段；
- 未登录状态下的原帖页把操作条渲染成不带数字的图标按钮，公开接口拿不到数值。

因此本仓库任何文件都**不写转发数与收藏数**，也不用点赞量折算。已尝试并失败的路径记录在
`../00-research/SOURCE.md` 第 2.3 节。

---

## 2. 素材清单与许可

### 2.1 图像 / 贴图 —— 100% 运行时程序化生成

| 素材 | 生成方式 | 位置 |
|---|---|---|
| 12 块样本表面贴图 | Canvas 2D：噪点 / 条带 / 斑点 / 龟裂 / 拉丝 / 纤维 / 渐变 / 圆点 八种程序化画法 + 暗角与高光 | `src/modules/samples.ts` → `paintTile()` |
| 机身小屏幕 | Canvas 2D：色块、HEX、λ 读数、迷你光谱条 | `src/three/device.ts` → `drawDeviceScreen()` |
| 地面工程网格 | Canvas 2D：同心圆 + 放射线 | `src/three/stage.ts` → `makeGridTexture()` |
| 页面纹理底 | 纯 CSS 渐变与网格，无位图 | `src/styles/base.css` |
| favicon | 内联 SVG data URI | `index.html` |

**未使用任何外部图片、照片、插画或图标库。** 页面中出现的每一个像素都由上述代码或 CSS 生成。

### 2.2 三维模型 —— 100% 程序化建模

| 部件 | 图元 | 位置 |
|---|---|---|
| 机身外壳 | `ExtrudeGeometry`（圆角矩形 + bevel） | `src/three/device.ts` |
| 光学窗口 | `TorusGeometry` + `CylinderGeometry` + `CircleGeometry` | 同上 |
| 传感器 | `BoxGeometry` 芯片 + 封装框 | 同上 |
| 主板 | `BoxGeometry` + 5 个 `CylinderGeometry` 电容 + USB 触点 | 同上 |
| 电池 | 圆角 `ExtrudeGeometry` + 标签 | 同上 |
| 屏幕 | `PlaneGeometry`（贴 CanvasTexture） + 圆角 bezel | 同上 |
| 校准色片 | 3 个 `BoxGeometry` | 同上 |
| 旋钮 / 扳机 / 挂绳环 | `CylinderGeometry` / `BoxGeometry` / `TorusGeometry` | 同上 |
| 环境光照 | `three/examples/jsm/environments/RoomEnvironment`（程序化房间） | `src/three/stage.ts` |

**未导入任何 `.glb` / `.gltf` / `.obj` 模型文件，未使用任何 HDR / EXR 环境贴图。**

### 2.3 字体

| 字体 | 来源 | 许可 | 打包方式 |
|---|---|---|---|
| Martian Mono（400/600/800） | npm `@fontsource/martian-mono` | SIL OFL 1.1 | latin 子集 woff2/woff，随构建产物本地化 |
| Space Grotesk（300/400/500/700） | npm `@fontsource/space-grotesk` | SIL OFL 1.1 | 同上 |
| JetBrains Mono（400/500） | npm `@fontsource/jetbrains-mono` | SIL OFL 1.1 | 同上 |
| 中文（PingFang SC / 微软雅黑 / Noto Sans CJK） | 操作系统自带 | 系统字体 | **不下载**，使用系统字体栈回退 |

> 中文字形不打包：Martian Mono 等拉丁字体不含 CJK 字形，强行打包思源黑体会把产物撑大数 MB。
> 因此中文走系统栈，拉丁字母与全部数字走上面的等宽/无衬线字体——这恰好构成本页「中文正文 + 仪表盘等宽数字」的双语排版系统。

### 2.4 代码依赖

| 包 | 版本 | 许可 | 用途 |
|---|---|---|---|
| three | 0.186.1 | MIT | 三维渲染 |
| vite | 7.1.7 | MIT | 构建与开发服务器 |
| typescript | 5.9.2 | Apache-2.0 | 类型检查 |
| @types/three | 0.186.0 | MIT | 类型定义 |
| @fontsource/* | 5.3.0 | OFL-1.1 | 字体 |
| playwright | 1.64.1 | Apache-2.0 | **仅 QA 用**，不进入产物 |

`playwright` 只在 `qa/verify.mjs` 里用于驱动本机 Chrome 做点击验证，不参与 `npm run build`，不进入 `dist/`。

---

## 3. 运行时网络请求

**零。** 构建产物 `dist/` 是一组静态文件：

```
dist/index.html
dist/assets/*.js
dist/assets/*.css
dist/assets/*.woff2 / *.woff
```

- 所有 JS/CSS/字体均为相对路径引用（`base: './'`），可直接放到任意子路径（GitHub Pages 项目站）下工作；
- 没有 `<script src="https://...">`、没有 `fetch(...)`、没有 `XMLHttpRequest`、没有 WebSocket；
- QA 脚本对此有硬断言：**`no external network requests`**，任何一条外部请求都会让验证失败。

---

## 4. 品牌与商标

- 「CHROMA S1」「千色仪」为本任务**虚构的原创产品名**，与任何在售产品无关；
- 页面不出现任何真实厂商的 Logo、产品名、注册商标或商业外观；
- 页面内引用的型号词（`MODEL CS1-R`、`OPTICAL APERTURE Ø8` 等）均为本作品自撰；
- 页面底部已明确标注「虚构产品演示页」。

---

## 5. 声明

本仓库不包含、也不上传任何凭据、令牌、日志、私有文件或与本任务无关的文件。
`dist/` 与 `screenshots/` 是唯一建议对外发布的内容（见 `manifest.json`）。
