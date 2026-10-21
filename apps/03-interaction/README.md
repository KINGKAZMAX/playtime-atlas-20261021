# 织造车间调度台 · LOOMDECK

> 一间手工织造车间的浏览器端调度台：12 台提花织机接单、换经、织造、断经、完工，
> 订单簿 / 机台矩阵 / 实时遥测 / 事件日志四区联动，全部在本地浏览器里跑，
> 刷新后原样恢复。

本项目是 2026-10-21 批次「MiniMax M3.1 Flash 优秀交互案例复刻」中任务 03 的产出：
对公开案例 [@0xRicker 的「AI agent command center」](https://x.com/0xRicker/status/2112519745270321496)
的**原创改编**（借鉴交互机制骨架，不复制素材）。
来源核验见 [`SOURCE.md`](./SOURCE.md)，逐项差异对照见 [`DESIGN-DIFF.md`](./DESIGN-DIFF.md)。

---

## 快速开始

```bash
npm install          # 安装构建期依赖（无运行时依赖）
npm run build        # 字体子集化 + 打包 → dist/
npm run serve        # 本地静态服务：http://127.0.0.1:4313
```

- **本地端口**：`4313`，服务只绑定 `127.0.0.1`，不对外暴露。
- `npm run dev` 是 Vite 开发服务器；`npm run preview` 用 Vite 预览 `dist/`。
- `npm run verify` 对 `dist/` 做发布前自检：确认没有外部 `http(s)://` 资源引用、
  字体已本地化、产物中没有敏感文件，并打印体积报告。
- `npm run check:fonts` 校验字体资产：族名与 `16-design-system/fonts/FONT-MANIFEST.json` 一致、
  五份 OFL 全文齐备、Noto Sans SC 子集覆盖本作品全部汉字、Inter 覆盖全部可打印 ASCII、无外链字体。
- `node scripts/check-contrast.mjs` 校验配色对比度（正文 ≥4.5:1，图形与控件边界 ≥3:1）。
- `npm run check:tokens` 校验令牌层与 16 规范的**九项**一致性：V.11 字体栈顺序、V.12 不自造字体栈、
  V.13 与 `design-tokens.json` 无漂移、口径 A 必备 17 项、与 16 的 `src/tokens.css` 全量等值、
  **降级隔离**（1ms 只能出现在 `prefers-reduced-motion` 块内）、`--ds-target-min` 44px。
- `node ../16-design-system/tools/ds-audit-tokens.mjs --root ..` 同样口径的全库只读审计（跨目录比对）。
- `npm run qa` 跑真实浏览器冒烟测试（19 项），产出 `qa/report.json` 与自测截图 `qa/shots/`
  （**不覆盖** `screenshots/` 里的交付截图 —— 那三张由 Ego 浏览器产出，见 `QA.md` §3.5）；
  需要本机已装 Chromium（缺浏览器时先跑 `npx playwright install chromium`）。
- **运行期零外部请求**：不连 CDN、不调 API、不加载外部字体。

> `npm run build` 的第一步是中文子集化，需要一份完整的 Noto Sans SC 源字型（`.ttf`）。
> 找不到时脚本保留仓库内已生成的子集并正常退出，**不会中断构建**；
> 需要重新生成时：`NOTO_SANS_SC_SRC=<路径> npm run fonts`（变量名见脚本头部说明）。

## 目录结构

```
03-interaction/
├── index.html              界面骨架（页眉 / 订单簿 / 机台矩阵 / 遥测台 / 日志带 / 抽屉 / 弹窗）
│                           含 data-i18n 双语钩子
├── src/
│   ├── tokens.css          设计令牌层：--ds-* 取值 + 旧变量语义别名层 + 中文排版修正
│   ├── ds-components.css   通用组件层：.ds-shell / .ds-skip / .ds-topbar / .ds-footer / .ds-btn / .ds-tag / .ds-chip / .ds-field / .ds-input
│   ├── styles.css          作品样式层（增量替换：语义别名重定向 + 浅色栏头 + 三档响应式）
│   ├── workshop.js         车间模型与仿真核心（机台状态机、订单、遥测、派单、日志）
│   ├── storage.js          localStorage 持久化 + 配额/隐私模式降级 + 存档补齐
│   ├── ui.js               纯渲染层（页眉、订单、机台、遥测、日志、抽屉、toast）
│   └── main.js             主控制器（状态装配、仿真循环、事件派单、键盘、持久化调度）
├── scripts/
│   ├── build-fonts.mjs     扫描源码收集字符集 → 子集化中文 + 实例化字重 + 规范化 name 表
│   ├── check-fonts.mjs     字体资产校验（族名 / 许可 / 汉字覆盖 / ASCII / 无外链）
│   ├── check-contrast.mjs  对比度校验（WCAG 2.2）
│   ├── check-tokens-spec.mjs 令牌层自测（V.11/V.12/V.13 + 口径 A 必备 + 降级隔离 + 阈值）
│   ├── clean-dist.mjs      构建后清理产物中的 .DS_Store（postbuild）
│   ├── restyle-apply.mjs   改版增量替换脚本（61 条精确替换，作为审计证据保留）
│   ├── fetch-sources.sh    需要重新生成中文子集时拉取 Noto Sans SC 源字型（仅构建期）
│   ├── qa-smoke.mjs        真实浏览器冒烟测试（19 项）
│   ├── serve.mjs           仅绑 127.0.0.1:4313 的本地静态服务器
│   └── verify-build.mjs    产物自检（无外部引用 / 字体本地化 / 无敏感文件）
├── public/fonts/           5 个自托管 woff2 + 5 份 OFL 全文 + fonts.css + fonts.manifest.json
├── i18n/keys.json          中英键表（194 键）
├── screenshots/            交付截图（桌面 / 抽屉 / 移动端）—— 由 Ego 浏览器产出
├── qa/                     自测报告 report.json 与自测截图 shots/（不覆盖交付截图）
├── SOURCE.md               参考案例核验、模型归属证据、证据限制
├── DESIGN-DIFF.md          与参考案例的七项差异对照 + 本轮规范迁移的执行结果
├── RESTYLE-INVENTORY.md    改版「待替换清单」与落地结果
├── I18N-KEYS.md            双语键表与接入说明
├── CHANGELOG.md            变更记录
├── QA.md                   验收记录（实测结论）
├── LICENSES.md             素材与许可
└── manifest.json           交付清单
```

## 怎么玩

### 核心循环

1. 左栏**下单**：选布种 / 配色，填幅宽、经密、匹数与优先级 → 「加入订单簿」。
2. **派工**：点订单卡上的「派单…」把订单交给一台空闲机台；或点顶栏「开始派工」
   一次性把队列全部派出去。机台空出来后若开启自动续派，会自己接下一张队首订单；
   订单簿标题栏右侧的「自动续派 · 开/关」可随时关掉，改为纯手动派工。
3. **盯着跑**：中栏 12 张机台卡显示状态、订单、进度、梭速 / 张力 / 断经与迷你趋势；
   右栏遥测台给出车间平均经密 / 梭速 / 张力、断经次数、能耗与趋势曲线；
   底部日志带实时滚动事件。
4. **处理异常**：断经会停机并报警，点机台卡打开详情抽屉 →「复位故障」；
   也可以「停机」让某台机退出轮转。
5. **收工**：顶栏「重置车间」把车间恢复成初始模板（订单簿回到示例订单、机台待开工），
   误点了可以在 toast 上「撤销」。

### 顶栏四个控制

| 控件 | 作用 |
| --- | --- |
| 状态芯片 | 当前当班状态：待开工 / 在产 / 已暂停 |
| 开始派工 | 把待排订单派到空闲机台；当班处于「待开工」时先开工再派 |
| 暂停当班 | 冻结织造与遥测（再点继续） |
| 重置车间 | 恢复初始模板（可撤销） |

机台矩阵标题栏右侧的**班次节奏**（轻松 / 标准 / 紧排）直接改变织造推进速率：
轻松适合细密织物，紧排赶工但断经风险上升。
订单簿标题栏右侧的**自动续派**开关控制「机台空出后是否自动接队首订单」。

### 键盘

快捷键只在展品自身获得焦点后生效 —— 点一下界面即可，界面右上角也有提示。
输入框内不劫持按键。

| 键 | 作用 |
| --- | --- |
| `↑` `↓` `←` `→` | 在机台矩阵中移动选中机台 |
| `1`–`9` `0` | 聚焦第 1–10 台织机 |
| `Enter` | 为选中机台派发队首订单 |
| `Backspace` | 撤销选中机台的当前订单（退回队列并挂起） |
| `Space` | 暂停 / 继续当班生产 |
| `S` | 暂停 / 继续日志自动滚动 |
| `L` | 清空日志 |
| `R` | 复位选中机台的故障 |
| `T` | 切换遥测刻度（经密 / 梭速） |
| `N` | 聚焦新增订单表单 |
| `Esc` | 关闭抽屉 / 取消选中 |

## 数据与隐私

- 车间状态（订单、机台、日志、遥测、选中机台、当班状态、节奏）写入浏览器
  `localStorage`，键名 `loomdeck.workshop.v1`，**不出网、不上传**。
- 刷新后自动恢复，并在顶部给出「已恢复上次会话 · 时间」提示条。
- 配额写满或隐私模式下自动降级为内存存档，并通过 toast 明确告知「刷新后不保留」。
- 清空站点数据即彻底清除。

## 技术说明

- 纯前端，无框架、无运行时依赖：ES Module + 手写状态机 + DOM/SVG 渲染。
- 图表是手写 SVG 折线图（经密 / 梭速两套刻度），无第三方图表库。
- 视觉语言：余晖设计系统（`16-design-system`）浅色主题 ——
  `src/tokens.css` 提供 `--ds-*` 令牌，`src/ds-components.css` 提供 `.ds-*` 通用组件，
  `src/styles.css` 保留作品自有结构并把旧变量重定向到新 token（增量替换，非推倒重写）。
- 统一外壳（`DESIGN-SPEC §14.3`）：`<body class="ds-shell">` + `.ds-topbar` 页头 + `.ds-footer` 来源与许可页脚 + `.ds-skip` 跳转链接；
  `--ds-base` 注入在 `index.html` 入口（取空串 + `base: './'`，适配任意子路径深度）。
- 字体：Space Grotesk（展示）+ Inter（正文）+ Space Mono（等宽）+ **Noto Sans SC**（中文离线兜底），
  全部自托管（OFL 1.1），构建时按源码实际用到的字符裁剪中文子集（**565/565 汉字全覆盖**），
  随产物发布共 304 KB，运行时不请求任何字体 CDN。
- **中文字族栈按 `16-design-system/DESIGN-SPEC.md` §2.5 排序**：拉丁自托管字体 →
  系统 CJK 栈（PingFang SC / Hiragino Sans GB / Microsoft YaHei / Source Han Sans SC）→
  Noto Sans SC 子集 → 通用族。**覆盖完整的系统族必须排在有限子集之前**，否则同段文字会混入
  两套字形与两套基线。自托管的 Noto Sans SC 子集因此降为「系统栈整体不可用」时的**离线兜底**，
  仍随包发布且已实测可强制加载。
- 双语：`i18n/keys.json` 备有 194 条 zh/en 文案键（HTML 侧已打 `data-i18n` 钩子），
  运行时切换由 19/14 统一接入（见 [`I18N-KEYS.md`](./I18N-KEYS.md)）。
- `vite.config.js` 使用 `base: './'`，产物可部署在任意子路径（如
  `/playtime-atlas-20261021/exhibits/03-interaction/`）。

## 来源、改编与许可

- 参考案例与模型归属证据、互动数据核验（2026-10-21）、证据限制：[`SOURCE.md`](./SOURCE.md)
- 与参考案例的七项差异对照：[`DESIGN-DIFF.md`](./DESIGN-DIFF.md)
- 变更记录：[`CHANGELOG.md`](./CHANGELOG.md)
- 素材与许可：[`LICENSES.md`](./LICENSES.md)
- 验收记录：[`QA.md`](./QA.md)
- 改版清单与落地结果：[`RESTYLE-INVENTORY.md`](./RESTYLE-INVENTORY.md)
- 双语键表：[`I18N-KEYS.md`](./I18N-KEYS.md)
- 本作品为**原创改编**，不是参考案例的复制品；未复制其源码、截图、视频、字体或图标，
  未使用任何游戏 ROM、商业游戏资源或品牌视觉。代码 MIT，字体 SIL OFL 1.1。
