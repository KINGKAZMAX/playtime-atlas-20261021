# 素材与许可 · LICENSES

**作品**：织造车间调度台 · LOOMDECK（`flash-showcase-20261021/03-interaction`）

本文件说明本目录随包发布的全部代码、字体、图形素材的来源与许可。
原则：**不复制未授权 ROM、商业游戏资源或品牌视觉**；所有素材要么原创，要么来自
明确允许再分发的开源许可。

---

## 1. 代码

| 内容 | 许可 | 说明 |
| --- | --- | --- |
| `index.html` / `src/*.js` / `src/styles.css` / `src/tokens.css` / `src/ds-components.css` / `scripts/*.mjs` / `vite.config.js` | MIT | 本任务原创编写，随仓库授权 |
| `package.json` / `package-lock.json` | MIT | 本任务原创 |

仓库根目录的授权文件覆盖本目录全部原创代码（见根 `LICENSE`）。

## 2. 字体（随产物发布，运行时不请求任何字体 CDN）

改版后本作品改用 **余晖设计系统（16-design-system）的四族自托管字体**，
族名与 `16-design-system/fonts/FONT-MANIFEST.json` 保持一致
（`MIGRATION-NOTES.md` §8「字体族名一致」）：

| 字体 | 用途 | 许可 | 来源 | 体积 |
| --- | --- | --- | --- | --- |
| Space Grotesk（拉丁可变字体） | 展示字：作品名 / 分区标题 | SIL OFL 1.1 | [floriankarsten/space-grotesk](https://github.com/floriankarsten/space-grotesk)（与 16 同源 vendored 文件，逐字节复制未改） | 34.0 KB |
| Inter（拉丁可变字体） | 正文字：说明 / 详情 / 界面文字 | SIL OFL 1.1 | [rsms/inter](https://github.com/rsms/inter)（同上，逐字节复制未改） | 129.6 KB |
| Space Mono（拉丁等宽） | 编号 / 读数 / 键位 | SIL OFL 1.1 | [sharanda/space-mono](https://github.com/sharanda/space-mono)（同上，逐字节复制未改） | 14.5 KB + 14.6 KB |
| Noto Sans SC（中文子集） | 中文**离线兜底**（系统 CJK 栈不可用时生效） | SIL OFL 1.1 | [notofonts/noto-cjk](https://github.com/notofonts/noto-cjk)，取完整 Noto Sans SC 源字型，按本作品用字子集化 | 104.1 KB |

- **许可全文随包**：五份 `OFL-*.txt` 位于 `public/fonts/`，与 woff2 同目录，
  构建后原样复制到 `dist/fonts/`（见 `dist/fonts/OFL-*.txt`）。
- **SIL OFL 1.1 允许随产品再分发与嵌入**，前提是保留授权声明与保留字体名称；
  本文件与 `public/fonts/OFL-*.txt` 即为此声明。
- **字体文件清单**：`public/fonts/fonts.manifest.json`（族名 / 文件 / 字节 / 许可），
  由 `scripts/build-fonts.mjs` 生成，由 `scripts/check-fonts.mjs` 校验。

### 2.1 中文字子集（Noto Sans SC）

> **角色说明（v1.1.1 起）**：按 `16-design-system/DESIGN-SPEC.md` §2.5 的硬性条款，
> 字族栈里**覆盖完整的系统 CJK 族必须排在覆盖有限的子集之前**，
> 因此**汉字的实际渲染字形来自系统黑体**（macOS 苹方 / Windows 雅黑 / Linux 思源）。
> 本子集**不删除**，继续随包发布，作为「系统 CJK 栈整体不可用」时的**离线兜底**
> （`MIGRATION-NOTES.md` §5.3 第 ③ 条）。它的价值也正是在这里：
> 若直接引用 16 随包的那份子集，它只覆盖 07-museum-art 的用字，缺本作品 168 个汉字，
> 一旦真的需要兜底就会缺字。

| 项 | 说明 |
| --- | --- |
| 字符集来源 | 构建脚本扫描 `index.html` 与 `src/*.js` 的真实文本自动收集，**不手工维护** |
| 覆盖范围 | 实测 **565/565 个汉字与中文标点**全部命中（`npm run check:fonts` 用 harfbuzz 逐码位校验） |
| 体积 | 106 556 字节（占原 16 子集 197 600 字节的 54%，且覆盖更多字） |
| 处理方式 | `subset-font` 按用字裁剪 → `wght` 轴实例化到 400（静态 Regular）→ 重写 `name` 表族名 → `wawoff2` 压缩 |
| 名字来源 | 源字型是 Noto Sans SC 的可变字体，其 `name` 表把族名写作「Noto Sans SC Thin」（默认实例 Thin）。本作品把 `wght` 实例化到 400 后将 name ID 1/4/6/16/17 规整为「Noto Sans SC / Regular」，否则浏览器按 CSS `font-family: 'Noto Sans SC'` 匹配不到该文件。**OFL 合规性**：该字体的保留字体名（Reserved Font Name）仅为 `'Source'`（见 `OFL-noto-sans-sc.txt` 首行），本次改名未使用保留名，符合 OFL 1.1 第 3 条 |
| 源字型未收录的符号 | 仅 `⌨`（键盘提示图标）不在 Noto Sans SC 中，由系统符号字体回退，不缺字 |
| 重新生成 | `NOTO_SANS_SC_SRC=<完整 Noto Sans SC .ttf 路径> npm run fonts`；找不到源字型时保留仓库内既有子集，**构建不中断** |
| 可复现性 | 同一份源码重建，产物 sha256 与前次**逐字节一致**（实测，2026-10-21 23:0x） |
| 兜底可用性实测 | `document.fonts.load('400 16px "Noto Sans SC"')` → **`Noto Sans SC:loaded`**（见 `QA.md` §1 第 2 项） |

> 16 随包的 `noto-sans-sc-subset.woff2` 只覆盖 07-museum-art 的用字，
> 实测缺本作品 168 个汉字（织 / 簿 / 遥 / 麻 / 缎…），
> 直接引用会出现「部分汉字 Noto Sans SC、其余回退系统黑体」的混排。
> 因此本目录按自身用字重新子集化，族名仍与 16 清单一致。

### 2.2 字体验证

`scripts/check-fonts.mjs` 每次构建后逐项校验：

1. 五个 woff2 存在且字节数与 `fonts.manifest.json` 一致；
2. 五份 OFL 许可全文随包；
3. 每个字体的 `name` 表族名与 `16-design-system/fonts/FONT-MANIFEST.json` 一致；
4. Noto Sans SC 子集覆盖本作品全部汉字（当前 565/565）；
5. Inter 拉丁子集覆盖全部可打印 ASCII；
6. 入口 HTML 与全部样式表中**无外链字体 / CDN 引用**。

另：`scripts/check-contrast.mjs` 校验配色对比度（正文 ≥4.5:1、图形/控件边界 ≥3:1）。

## 3. 图形 / 图标 / 视觉

| 内容 | 来源 |
| --- | --- |
| `public/favicon.svg`（原创织机纹样） | 本任务原创 |
| 面板配色、状态色、织机状态底纹 | 本任务原创（CSS 渐变与 `color-mix`，无位图） |
| 视觉语言（令牌 / 组件类） | 取自同级 `16-design-system`（余晖设计系统）的**取值规范**（`design-tokens.json` / `DESIGN-SPEC.md`），落地代码为本目录自写，未复制其文件 |
| 遥测折线图、负载条、迷你趋势柱 | 运行时由 JS 生成 SVG / DOM，无外部图片 |
| 图标 | 无第三方图标库；全部为内联 SVG 或纯 CSS 绘制 |

**未使用**：任何游戏 ROM、卡带、截图、商标、角色形象或商业美术资源。

## 4. 构建期依赖（不随产物发布）

| 包 | 许可 | 用途 |
| --- | --- | --- |
| `vite@5.4.x` | MIT | 打包 |
| `subset-font@2.9.x` | MIT | 基于 harfbuzz 的字体裁剪与变体实例化 |
| `wawoff2@2.0.x` | MIT | woff2 压缩 / 解压 |
| `harfbuzzjs@1.6.x` | MIT | 字形表读取（校验字符覆盖与 `name` 表族名） |
| `playwright-core@1.64.x` | MIT | 冒烟测试用浏览器驱动（构建期） |

运行时依赖：**无**。产物是纯静态文件，浏览器只加载 `dist/` 内的 HTML / CSS / JS / woff2。

## 5. 参考案例

本作品是对一个公开案例的**原创改编**（借鉴交互机制骨架，不复制素材）。
参考案例的作者、原始帖 URL、模型归属证据与互动数据核验记录在 `SOURCE.md`，
逐项差异对照在 `DESIGN-DIFF.md`。

参考案例的作者署名与原帖链接已在此如实保留；**未复制其源码、截图、视频、字体或图标**，
因此本目录不包含来自该案例的任何素材文件。

## 6. 数据

本作品不采集、不上传任何用户数据。车间状态（订单、机台、日志、遥测、选中项、当班状态）
只写入浏览器的 `localStorage`，键名 `loomdeck.workshop.v1`，纯本地、不出网；
用户清除站点数据即随之消失。
