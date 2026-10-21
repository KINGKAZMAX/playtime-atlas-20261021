/**
 * 入口：样式 → 应用
 *
 * 样式加载顺序（2026-10-22 接入设计系统 assets/ds/ 之后）：
 *   0. assets/ds/tokens.css     ← index.html 里静态引入，130 个 --ds-* 取值的**唯一声明处**
 *   1. assets/ds/components.css ← index.html 里静态引入，.ds-* 组件层**共享基线**
 *   2. tokens.css               ← 本馆增量层：语义别名 + 本馆专属令牌
 *   3. base.css / layout.css / components.css / hall.css ← 本馆自有样式
 *   4. ds-bridge.css            ← **必须最后**：钉死查证过的 DS/本馆差异
 *
 * 第 4 层为什么必须垫底：桥接块要靠「同特异度、后加载」压住 DS 基线，
 * 放在别的层后面就压不住了。
 */

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/hall.css';
import './styles/ds-bridge.css';

import './app.js';
