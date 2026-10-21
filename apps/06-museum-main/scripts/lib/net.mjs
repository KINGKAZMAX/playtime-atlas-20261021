/**
 * 构建期网络工具：代理感知 + 限流自适应的 JSON 请求封装。
 *
 * 背景：
 *  1) 部分环境通过 http_proxy / https_proxy 走本地代理，Node 内置 fetch
 *     默认不读取这些变量会直接连接超时，而 curl 会自动遵循。
 *  2) 公开百科 API 对高频请求会返回 429/403，因此这里内置退避重试。
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const UA = 'playtime-atlas-museum/1.0 (build-time source verification)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 带代理回落与限流退避的 JSON GET
 * @param {string} url
 * @param {{timeoutMs?:number, retries?:number, retryBaseMs?:number}} options
 */
export async function fetchJson(url, options = {}) {
  const { timeoutMs = 25000, retries = 5, retryBaseMs = 2000 } = options;
  const errors = [];

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const { stdout } = await execFileAsync(
        'curl',
        [
          '-sSL', '--compressed',
          '--max-time', String(Math.ceil(timeoutMs / 1000)),
          '-H', `User-Agent: ${UA}`,
          '-w', '\n%{http_code}',
          url,
        ],
        { maxBuffer: 16 * 1024 * 1024 },
      );
      const idx = stdout.lastIndexOf('\n');
      const body = stdout.slice(0, idx);
      const status = Number(stdout.slice(idx + 1).trim());

      if (status === 429 || status === 403) {
        errors.push(`HTTP ${status}（被限流）`);
        await sleep(retryBaseMs * 2 ** attempt);
        continue;
      }
      if (status >= 400) {
        errors.push(`HTTP ${status}`);
        await sleep(retryBaseMs * 2 ** attempt);
        continue;
      }
      return JSON.parse(body);
    } catch (err) {
      errors.push(`curl: ${err.stderr?.toString().trim() || err.message}`);
      await sleep(retryBaseMs * 2 ** attempt);
    }
  }

  // curl 全部失败后再试一次内置 fetch（适用于无代理但直连可达的环境）
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    errors.push(`fetch: ${err.message}`);
  }

  throw new Error(errors.join(' | '));
}
