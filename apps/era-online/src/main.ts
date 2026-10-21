/**
 * main.ts — 入口。
 *
 * 全部功能在浏览器本地运行：不发起任何网络请求，不连接任何服务器。
 */

import './styles/base.css';
import './styles/shell.css';
import './styles/defense.css';
import './styles/handheld.css';

import { audio } from './core/audio';
import { createShell } from './shell/shell';

const mount = document.getElementById('app');
if (!mount) throw new Error('缺少挂载点 #app');

const shell = createShell(mount);

// 浏览器自动播放策略要求音频在用户手势后启动
audio.bindAutoUnlock();

// 便于在控制台核对（不影响功能）
(window as unknown as { __linkDawn?: unknown }).__linkDawn = { shell, audio };

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    shell.destroy();
  });
}
