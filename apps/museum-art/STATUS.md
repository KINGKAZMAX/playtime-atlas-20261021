# STATUS — 回响电玩馆 / PLAYTIME ATLAS 美术包开发阶段状态

最后更新：2026-10-21

| 阶段 | 状态 | 说明 |
| --- | --- | --- |
| 0. 任务立项 | ✅ 完成 | `TASK.md` 需求拆解完成（资产清单、约束、验收标准） |
| 1. 年代/硬件研究 | ✅ 完成 | 7 个年代分段 + 6 件跨时代硬件形态确定；来源与差异说明写入 `LICENSES.md` |
| 2. 工程脚手架 | ✅ 完成 | Vite + three + @gltf-transform 本地安装；字体工具链 uv venv (fontTools/brotli) 就绪 |
| 3. 设计令牌 | 🔄 进行中 | `design-tokens.json` / `tokens.css` / `tokens.js` 同源生成 |
| 4. 字体管线 | ⬜ 待办 | OFL 字体下载 + 子集化 + 自托管 `@font-face` |
| 5. 图标集 | ⬜ 待办 | ~48 枚原创 SVG 图标 + 雪碧图 |
| 6. 年代海报 | ⬜ 待办 | 7 张 SVG + PNG（AI 无字关键帧 + SVG 排版层） |
| 7. 年代封面 | ⬜ 待办 | 7 张 SVG + PNG |
| 8. 展柜图形 | ⬜ 待办 | 6 组展柜 SVG + PNG |
| 9. 硬件 3D 模型 | ⬜ 待办 | 6 个 GLB + 实机渲染 PNG + 技术插画降级图 |
| 10. 降级与离线 | ⬜ 待办 | 通用降级图、离线提示、无 WebGL 降级路径 |
| 11. 预览页 | ⬜ 待办 | `preview.html` + three.js 模型查看器，端口 4327 |
| 12. 共享接口 | ⬜ 待办 | `INTERFACE.md`（给 06-museum-core） |
| 13. 文档与清单 | ⬜ 待办 | README / LICENSES / QA / manifest.json |
| 14. 浏览器验收 | ⬜ 待办 | 全量资产校验 + 截图证据 |

## 当前状态

**进行中**。已完成：任务立项、年代研究、工程与字体工具链就绪。
下一步：生成统一设计令牌，随后按令牌驱动字体 / 图标 / 海报 / 封面 / 展柜 / 模型。

## 目录约定

```
07-museum-art/
├── TASK.md / STATUS.md          任务与进度
├── README.md / QA.md            使用说明与验收记录
├── INTERFACE.md                 与 06-museum-core 的共享资产接口
├── LICENSES.md                  资产来源与许可
├── manifest.json                交付清单（供 14-publish 集成）
├── design-tokens.json           统一设计令牌（canonical）
├── scripts/                     资产生成脚本（可重跑）
├── src/ + index.html            预览页源码
├── public/assets/               生成产物（字体/图标/海报/封面/展柜/模型/降级图）
├── dist/                        静态构建输出（供 14-publish 复制）
└── screenshots/                 验收截图
```

## 变更日志

- 2026-10-21：创建 `TASK.md`，完成年代与硬件形态研究，安装 Vite/three/@gltf-transform，
  建立 uv 隔离的 fontTools + brotli 字体子集化环境。
- 2026-10-21：安装 Playwright + Chromium，作为 SVG→PNG 与 3D 模型实机渲染的统一光栅化后端。
