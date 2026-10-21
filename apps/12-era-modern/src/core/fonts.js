/**
 * 自托管字体的显式预加载。
 *
 * 为什么需要它：
 * 浏览器只在**页面上真的用到某个字重**时才会去取对应的 @font-face 文件。
 * 本目录的等宽体 Space Mono 分 Regular(400) 与 Bold(700) 两个文件，
 * 而页面正文只用到 400 —— 于是 700 那个文件长期处于 `status: "unloaded"`。
 * Canvas 2D 的 `ctx.font` 是**同步**赋值、立即绘制的，取不到字体时不会等待，
 * 而是静默回落到系统等宽字体（Mac 上是 Menlo），肉眼几乎看不出差别，
 * 但字体栈里的 `Space Mono` 实际并没有生效。
 *
 * 所以这里显式 `document.fonts.load()`，把设计系统实际会用到的那几个字重全部拉起来。
 * 字体文件都在本目录内、体积很小（合计约 200 KB），等待代价可忽略。
 *
 * 注意：不能用 `document.fonts.check()` 判断某个字重是否已就绪——
 * 实测它在粗体字面仍为 `unloaded` 时也会返回 true，因此这里自己记录加载状态。
 */

/** 需要确保可用的字重：与 tokens.css 的 --ds-font-* 实际使用方式对应 */
const REQUIRED_FACES = [
  '400 12px "Inter"',
  '700 12px "Space Grotesk"',
  '400 12px "Space Mono"',
  '700 12px "Space Mono"',
];

let allLoaded = false;

/**
 * 预加载自托管字体。
 * 重复调用时若已完成则立即返回，不会给「开始游戏」等交互带来额外延迟。
 * @returns {Promise<string[]>} 成功加载的字体描述列表
 */
export function preloadFonts() {
  if (allLoaded) return Promise.resolve(REQUIRED_FACES.slice());
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve([]);

  return Promise.all(
    REQUIRED_FACES.map((face) =>
      document.fonts
        .load(face)
        .then(() => face)
        .catch(() => null),
    ),
  ).then((list) => {
    const ok = list.filter(Boolean);
    if (ok.length === REQUIRED_FACES.length) allLoaded = true;
    return ok;
  });
}
