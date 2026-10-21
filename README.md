# 回响电玩馆 · 作品总廊 — PLAYTIME ATLAS

> **MASTER GALLERY** — 本批 MiniMax M3.1 Flash 关联作品、年代可玩展厅、原创美术资产与来源核验档案的**统一在线入口**。
> 纯静态站点，GitHub Pages 自动构建部署。

**线上地址** → https://KINGKAZMAX.github.io/playtime-atlas-20261021/

---

## 这是什么

本仓库是 `flash-showcase-20261021` 批次的**部署总控**。它不生产新作品，而是：

1. 提供一个**原创的作品大厅**（`hall/`），作为全部作品的统一目录与试玩入口；
2. 逐个接入上游各任务交付的**可静态构建产物**（`apps/<id>/`）；
3. 用 GitHub Actions **自动构建**并发布到 GitHub Pages；
4. 为每一件作品保留**来源、许可与差异说明**，并如实标注未就绪项。

## 目录结构

```
.
├── works.json              ← 总目录（唯一事实源）：id/title/description/entry/buildCommand/outputDir/status
├── hall/                   ← 作品大厅前端（静态，零运行时依赖）
│   ├── index.html
│   └── assets/{hall.css,hall.js,page.css}
├── apps/<id>/              ← 各作品**源码副本**（自同级任务目录只读复制而来）
├── scripts/
│   ├── sync-apps.mjs       ← 从同级任务目录同步源码（只读复制，不修改上游）
│   ├── build.mjs           ← 逐件构建 + 组装 site/ + 失败回退 + 状态报告
│   ├── make-covers.mjs     ← 程序化生成每件作品的原创封面 SVG
│   ├── build-research-index.mjs / build-catalog-page.mjs / build-qa-page.mjs
│   └── serve.mjs           ← 零依赖本地静态服务器
├── site/                   ← **发布根**（构建产物，随仓库提交，作为失败回退与快照）
└── .github/workflows/pages.yml
```

## 构建与发布

```bash
node scripts/sync-apps.mjs   # 可选：从同级任务目录拉取最新源码
node scripts/build.mjs       # 构建全部作品 → site/
node scripts/serve.mjs 4320  # 本地预览 http://127.0.0.1:4320/
```

推送 `main` 分支即触发 `.github/workflows/pages.yml`：

```
checkout → setup-node → make-covers → build → configure-pages → upload-artifact → deploy-pages
```

### 失败回退策略

`scripts/build.mjs` 对每一件作品**独立构建**，单件失败不阻断其余作品：

| 情况 | 处理 | 大厅表现 |
| --- | --- | --- |
| 构建成功且入口存在 | 标记 `built` | 正常可玩 / 可打开 |
| 构建成功但入口缺失 | 标记 `built-no-entry` | 显示状态，不提供入口 |
| 构建失败，但仓库已有上一版产物 | 回退到 `HEAD` 版本，标记 `fallback` | 正常可玩（可点击） |
| 构建失败且无历史产物 | 标记 `unavailable` | **不提供任何可点击的游玩入口**，只显示阻塞原因 |

未就绪的作品在目录中以真实状态呈现，**不放假按钮**。

### Pages 子路径兼容

线上基址是 `https://<user>.github.io/playtime-atlas-20261021/`，所有资源必须使用**相对路径**。

- 集成时统一要求上游 Vite 配置 `base: './'`；若上游未满足，在 `apps/` 副本内修正（**不修改上游源目录**）。
- 构建后自动扫描产物中的 `src="/"` / `href="/"` 等根绝对路径并写入 `data/build-report.json`。
- 大厅内部链接与 `iframe` 全部使用相对路径。

## 作品目录

`works.json` 的每一项包含：

| 字段 | 含义 |
| --- | --- |
| `id` | 稳定标识，同时是 `apps/` 与 `site/works/` 下的目录名 |
| `title` / `subtitle` | 展示名（中 / 英） |
| `description` | 大厅与详情页文案 |
| `entry` | 相对仓库根的入口路径（如 `works/mech-sandworm/index.html`） |
| `buildCommand` | 构建命令 |
| `outputDir` | 构建产物目录 |
| `status` | `ready` / `pending` / `building` —— 反映上游交付状态 |

## 来源、许可与差异

- 详见 [`LICENSES.md`](./LICENSES.md) 与站内「来源与许可」板块。
- 复刻类作品的**机制**参考公开案例，**名称 / 文案 / 字体 / 配色 / 布局细节 / 模型形态**全部重新设计；站内保留来源说明，不声称原创参考作品。
- 全部几何、贴图、图标、封面与音效均为程序化生成或使用可再分发的开源字体；**不使用**未授权 ROM、商业游戏资源或品牌视觉。

## 已知限制

- 博物馆与年代展厅的收录为**代表性选样**，不宣称穷尽任何时代。
- 平台互动量为 **2026-10-21 观测快照**，不同平台口径不可横向比较；不声称「全网第一」。
- 依赖指针锁定的驾驶类作品在 `iframe` 嵌套时可能被浏览器限制，可使用「独立窗口打开」。
- 仓库内的 `site/` 是**上一次成功构建的快照**，CI 会重新构建并覆盖；它是单件构建失败时的回退来源。

## 许可

代码 MIT。素材逐项说明见 `LICENSES.md`。
