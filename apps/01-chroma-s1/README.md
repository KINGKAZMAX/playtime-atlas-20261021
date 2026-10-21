# CHROMA S1 · 千色仪

**把颜色，量出来。**

一页式虚构产品发布站：CHROMA S1 是一台口袋级光谱色度仪。页面里的光谱曲线、峰值波长、
FWHM、ΔE<sub>00</sub>、SNR 全部是**实时算出来的**——用 CIE 1931 配色函数积分得到 XYZ，
再按 CIEDE2000 算色差；改任何一个滑块，读数立刻跟着变。

本作品是**对公开案例工艺水准的原创改编**，不是任何现有页面的复制品。
选案证据链见 [`../00-research/SOURCE.md`](../00-research/SOURCE.md)，
逐维度差异见 [`DIFF-vs-SOURCE.md`](DIFF-vs-SOURCE.md)。

---

## 快速开始

```bash
npm ci          # 安装依赖（全部本地，无 CDN）
npm run dev     # 开发服务器 → http://127.0.0.1:4311
```

| 命令 | 作用 |
|---|---|
| `npm run dev` | 开发服务器，**端口 4311**（`strictPort`，占用即报错） |
| `npm run build` | 类型检查 + 生产构建 → `dist/`（纯静态） |
| `npm run preview` | 本地预览构建产物，端口 4311 |
| `npm run typecheck` | 仅类型检查 |
| `npm run qa` | Playwright 驱动本机 Chrome 跑 44 项点击断言 + 出截图 |
| `npm run qa:headed` | 同上，但显示浏览器窗口 |

> `npm run qa` 需要本机装有 Google Chrome（脚本用 `channel: 'chrome'`）。
> 未下载 Playwright 自带浏览器。

---

## 页面结构

| 区块 | 内容 | 关键交互 |
|---|---|---|
| **00 概览** | 标题、导语、四个关键指标、三维主视图 | 拖动旋转、双击复位、机身配色切换（石墨灰 / 沙岩色 / 冰蓝）、实时读数面板 |
| **数据带** | 10 项指标横向滚动 | 悬停暂停；随视口进度循环 |
| **01 光谱实验室** | 实时光谱图 + 控制台 | 目标波长 380–780 nm、增益 0.2–3.0×、积分时间 1–16 ms；三种测量模式（单次 / 连续扫描 / 白平衡校准） |
| **02 样本库** | 12 种真实表面，贴图程序化生成 | 点击任一块 → 仪器读数、光谱曲线、机身小屏同步变化；← → 方向键切换 |
| **03 规格矩阵** | 10 行指标 | 点行展开说明（可访问性：aria-expanded / aria-controls） |
| **04 拆解视图** | 6 个零件的爆炸图 | 「展开 / 合拢」按钮；悬停右侧条目高亮对应零件并自发光 |
| **05 常见问题** | 6 条问答 | 手风琴展开 |
| **06 预约** | 首批实测申请 | 表单本地校验 → 错误提示 → 提交中 → 成功态；**不发送任何数据** |
| 全局 | 左侧章节索引轨 | 滚动高亮当前章节、阅读进度条、点击跳转；移动端底部 HUD |

---

## 色彩计算是真的

`src/color.ts` 是一套完整的小型色度引擎：

- **CIE 1931 2° 配色函数**：Wyman–Sloan–Shirley 多高斯解析拟合；
- **sRGB → XYZ → L\*a\*b\***：D65 白点，标准传递函数；
- **CIEDE2000**：完整公式（含 C′、h′、T、R<sub>t</sub> 修正项）；
- **光谱重建**：用 8 条窄带高斯反射谱做**主动集非负最小二乘**（NNLS）拟合目标色，
  保证「sRGB → 光谱 → XYZ」是精确可逆的。12 个样本色的往返误差量级为 1e-13 ΔE；
- **测量噪声**：按响应峰值的相对幅度建模（≈1.2%），随积分时间按 4/t 缩放，
  随增益改变信噪比——所以调滑块时 ΔE00 会真实地变好或变差。

`src/modules/spectrum.ts` 负责把这条管线画成图，并在图上标注峰值波长、FWHM、噪声底噪与扫描线。

---

## 目录结构

```
01-web/
├── index.html              页面结构
├── vite.config.ts          base:'./'（适配任意子路径）、4311 端口
├── src/
│   ├── main.ts             装配与事件接线
│   ├── content.ts          全部文案与数据（样本 / 规格 / FAQ / 指标带）
│   ├── color.ts            色度引擎（CMF / Lab / CIEDE2000 / NNLS 光谱重建）
│   ├── styles/
│   │   ├── base.css        设计令牌、重置、排版原子
│   │   ├── layout.css      外壳、索引轨、顶栏、区块栅格、响应式
│   │   └── components.css  按钮、面板、读数、滑块、表单、跑马灯
│   ├── three/
│   │   ├── device.ts       机身程序化建模 + 屏幕 CanvasTexture
│   │   └── stage.ts        场景、灯光、环境、轨道控制、爆炸动画
│   └── modules/
│       ├── spectrum.ts     光谱实验室画布
│       ├── samples.ts      样本贴图程序化绘制 + 样本库
│       ├── lists.ts        指标带 / 规格矩阵 / FAQ 渲染
│       ├── reveal.ts       滚动显现、数字滚动、索引轨滚动监听
│       ├── form.ts         表单本地校验
│       └── motion.ts       动效模式与时间轴可用性探测
├── qa/verify.mjs           Playwright 点击验证脚本
├── qa/report.json          最近一次验证报告
├── screenshots/            11 张浏览器截图
├── manifest.json           交付清单
├── DIFF-vs-SOURCE.md       与参考作品的逐维度差异
├── SOURCES.md              来源、素材许可、运行时网络声明
└── QA.md                   验收记录
```

---

## 设计系统

| 令牌 | 值 | 用途 |
|---|---|---|
| `--ink-900 … --ink-700` | `#0a0d11 → #222c37` | 冷黑仪表底色阶 |
| `--paper … --paper-4` | `#ece9e2 → #4a545e` | 文字灰阶 |
| `--signal` | `#ff6b2c` | 琥珀橙：主强调色、交互态、CTA |
| `--pulse` | `#4fd8e8` | 电光青：数据、目标单色线、焦点环 |
| `--iris` | `#a78bfa` | 紫罗兰：峰值标记 |
| `--f-display` | Martian Mono | 标题与数值（宽体等宽） |
| `--f-body` | Space Grotesk + 系统中文栈 | 正文 |
| `--f-mono` | JetBrains Mono | 标签、读数、刻度 |

---

## 动效与可访问性

- **动效模式**：`?motion=on`（默认）/ `?motion=off`（静态）。
  系统开启「减少动态效果」时自动落到 `off`。
  `off` 模式下所有元素直接呈现终态，**任何环境下内容都不会被动画卡住**。
- 内容默认可见，入场动画只在时间轴确实推进时才播（`src/modules/motion.ts` 探测）。
- 所有折叠控件带 `aria-expanded` / `aria-controls`；跳转链接有 `aria-label`；
  样本卡是真正的 `<button>`；表单错误用 `role="status"` 播报。
- 支持键盘：Tab 聚焦可见焦点环，← → 切换样本。

---

## 响应式

| 断点 | 变化 |
|---|---|
| ≥ 1181 px | 左侧索引轨常驻，概览双栏，拆解视图双栏 |
| 1090 – 1180 px | 拆解视图改单栏 |
| 861 – 1089 px | 隐藏索引轨，概览改单栏，光谱实验室改单栏 |
| 621 – 860 px | 隐藏顶部导航，显示底部章节 HUD，规格矩阵改两列排布 |
| ≤ 620 px | 指标改 2×2，按钮整行，样本库三列 |

实测 390 px 与 834 px 下 `scrollWidth - clientWidth = 0`，无横向溢出。

---

## 构建产物

```bash
npm run build
# → dist/index.html
#   dist/assets/index-*.js     (~57 kB, gzip ~20 kB)
#   dist/assets/index-*.css    (~30 kB, gzip ~7 kB)
#   dist/assets/three-*.js     (~553 kB, gzip ~141 kB)
#   dist/assets/*.woff2        (拉丁字体子集)
```

全部相对路径引用，**可直接放到任意子路径**（如 GitHub Pages 项目站）下工作。
运行时**零外部请求**：无 CDN、无外部 API、无远程字体或图片。

---

## 相关文档

- [`TASK.md`](TASK.md) —— 任务口径与验收清单
- [`STATUS.md`](STATUS.md) —— 执行状态、决策记录、已知限制
- [`QA.md`](QA.md) —— 验收记录、断言结果、缺陷与修复、截图索引
- [`CHANGELOG.md`](CHANGELOG.md) —— 变更记录
- [`DIFF-vs-SOURCE.md`](DIFF-vs-SOURCE.md) —— 与参考作品的逐维度差异
- [`SOURCES.md`](SOURCES.md) —— 来源、素材许可、网络声明
- [`../00-research/SOURCE.md`](../00-research/SOURCE.md) —— 选案证据链
