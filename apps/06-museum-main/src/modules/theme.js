/**
 * 美术包接入探测
 *
 * 07-museum-art 交付 `design-tokens.json` 与 OFL 字体（字体样式表由 index.html
 * 静态引入，见 <link rel="stylesheet" href="./assets/ds/fonts/fonts.css">，
 * 权威来源是 16-design-system/fonts/，art/assets/fonts/fonts.css 只是兼容 shim）。
 *
 * **本模块不再把 07 的令牌写进 CSS 变量**：改版后全站色板由
 * 16-design-system 的 `--ds-*` 令牌层唯一决定（DESIGN-SPEC §1.1），
 * 而 07 的 design-tokens.json 仍带旧色板（信号橙 #F0601F）。
 * 若继续运行时注入，同名变量会「后加载者胜」把新令牌覆盖回旧色板——
 * 这正是 MIGRATION-NOTES 风险 B 描述的命名空间冲突。
 *
 * 因此这里只做两件事：探测字体样式表是否就位、探测 07 的令牌文件是否存在，
 * 结果用于馆方说明页如实标注美术资产来源。
 *
 * 若 07 美术包缺席，模块静默降级，不影响任何功能。
 *
 * @returns {{tokens: boolean, fonts: boolean, meta: object|null}}
 */

const BASE = (import.meta.env?.BASE_URL ?? './').replace(/\/*$/, '/');

/**
 * 美术包接入探测
 *
 * 07-museum-art 交付 `design-tokens.json` 与 OFL 字体（字体样式表由 index.html
 * 静态引入，见 `<link rel="stylesheet" href="./assets/ds/fonts/fonts.css">`，
 * 权威来源是 16-design-system/fonts/，art/assets/fonts/fonts.css 只是兼容 shim）。
 *
 * **本模块不再把 07 的令牌写进 CSS 变量**：改版后全站色板由
 * 16-design-system 的 `--ds-*` 令牌层唯一决定（DESIGN-SPEC §1.1），
 * 而 07 的 `design-tokens.json` 仍带旧色板（信号橙 `#F0601F`）。
 * 若继续运行时注入，同名变量会**后加载者胜**把新令牌覆盖回旧色板——
 * 这正是 MIGRATION-NOTES 风险 B 描述的命名空间冲突。
 *
 * 因此这里只做两件事：探测字体样式表是否就位、探测 07 的令牌文件是否存在，
 * 结果用于馆方说明页如实标注美术资产来源。
 *
 * 若 07 美术包缺席，模块静默降级，不影响任何功能。
 *
 * @returns {{tokens: boolean, fonts: boolean, meta: object|null}}
 */
export async function applyTheme() {
  const result = { tokens: false, fonts: false, meta: null };

  // 1) 字体样式表是否真的就位（读已解析的样式表，不再发网络请求）
  await new Promise((r) => setTimeout(r, 0));
  result.fonts = [...document.styleSheets].some((sheet) => {
    try {
      return [...sheet.cssRules].some((rule) => rule instanceof CSSFontFaceRule);
    } catch {
      return false;
    }
  });
  if (!result.fonts) {
    console.warn('[theme] 未检测到自托管 @font-face 规则，已回落到系统字体栈。');
  }

  // 2) 07 的美术令牌文件是否在位（只作来源标注，不注入变量）
  try {
    const res = await fetch(`${BASE}data/design-tokens.json`, { cache: 'no-cache' });
    if (res.ok) {
      const tokens = await res.json();
      result.tokens = Boolean(tokens);
      result.meta = tokens.meta ?? null;
    }
  } catch {
    /* 保持本馆自带令牌 */
  }

  return result;
}
