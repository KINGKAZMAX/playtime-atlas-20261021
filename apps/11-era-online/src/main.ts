/**
 * main.ts — 入口。
 *
 * 全部功能在浏览器本地运行：不发起任何网络请求，不连接任何服务器。
 */

// 令牌层与组件层由 index.html 直接引入 16-design-system 的副本：
//   ./assets/ds/tokens.css · ./assets/ds/components.css · ./assets/ds/fonts/fonts.css
// 本目录的样式只做**增量**（语义别名 + 作品专属外壳），不重复声明 --ds-* 取值。
import './styles/base.css';
import './styles/shell.css';
import './styles/defense.css';
import './styles/handheld.css';

import { audio } from './core/audio';
import { createShell } from './shell/shell';

const mount = document.getElementById('app');
if (!mount) throw new Error('缺少挂载点 #app');

// hreflang 备选链接：按运行时基准路径生成，兼容任意 Pages 子路径
// （不写死线上路径，也不写死本地路径）。
// 本作品当前只有中文版，故只声明 zh-CN 与 x-default；英文版待 19/14 统一接入后再补 en。
const altBase = new URL('.', document.baseURI).href;
for (const lang of ['zh-CN', 'x-default']) {
  const link = document.createElement('link');
  link.rel = 'alternate';
  link.hreflang = lang;
  link.href = altBase;
  document.head.append(link);
}

const shell = createShell(mount);

// 浏览器自动播放策略要求音频在用户手势后启动
audio.bindAutoUnlock();

// 便于在控制台核对（不影响功能）
(window as unknown as { __linkDawn?: unknown }).__linkDawn = {
  shell,
  audio,
  get defense() {
    return shell.getDefenseView();
  },
  get handheld() {
    return shell.getHandheldView();
  },
};

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    shell.destroy();
  });
}
