/* 由 scripts/build-tokens.mjs 自动生成，请勿手改。
 * 依据 16-design-system/design-tokens.json（对齐来源：live:16-design-system）
 */
export const tokens = {
  "$schema": "https://design-tokens.org/schema.json",
  "meta": {
    "id": "playtime-atlas-art",
    "name": "回响电玩馆 / PLAYTIME ATLAS — 美术资产包令牌（已对齐余晖设计系统）",
    "nameEn": "PLAYTIME ATLAS — Art Asset Pack Tokens (aligned to Afterglow DS)",
    "version": "1.1.0",
    "updated": "2026-10-21",
    "theme": "dark",
    "scheme": {
      "name": "UI 采用余晖 DS 深色主题；展品内嵌仍为深墨蓝 + 暖纸白 + 信号橙",
      "uiBackground": "#100F0E",
      "uiAccent": "#E0684A",
      "exhibitInk": "#0C1726",
      "exhibitPaper": "#FBF7EF",
      "exhibitSignal": "#F0601F"
    },
    "alignment": {
      "designSystem": "余晖设计系统",
      "designSystemEn": "Afterglow Design System",
      "designSystemId": "afterglow-ds",
      "designSystemVersion": "1.0.0",
      "alignedTo": "16-design-system/design-tokens.json",
      "alignedToCss": "16-design-system/src/tokens.css",
      "spec": "16-design-system/DESIGN-SPEC.md",
      "audit": "16-design-system/REFERENCE-AUDIT.md",
      "migration": "16-design-system/MIGRATION-NOTES.md §2.3",
      "source": "live:16-design-system",
      "alignedAt": "2026-10-21T15:14:01.490Z",
      "cssVariablePrefix": "--ds-",
      "fingerprints": {
        "designTokensSha256": "042a38a36707e8cea6584dcb0462ef1ca442d66fad5c42c1ffefcf71034f82f4",
        "tokensCssSha256": "e9595d51336fac6a2cb013095b8863c72022bb20e545fa46867c129e9addf368",
        "fontsSha256": {
          "inter-latin.woff2": "98342e4c9d04d96ee10270f855930ecc1adc34dc6273134d80a3c385dc530fe0",
          "noto-sans-sc-subset.woff2": "0a0b62b40f8b359d0714d47fd3e293d2ca871d0ee21acb200c0b31ebc667fe4b",
          "space-grotesk-latin.woff2": "4212a294d495570baaa60d085f3b6a72b6790b5b1d13471630721ceb9c2babcf",
          "space-mono-bold.woff2": "d09323c39cee214f6472155bb71d374a89726805f7e6313d656f3947b16ccf6c",
          "space-mono-regular.woff2": "2bd76ba5ecee41cdbde94aa862f0c998a6f85ee7e70b8142d19e9e8eb364eb27"
        },
        "localFontsSha256": {
          "inter-latin.woff2": "98342e4c9d04d96ee10270f855930ecc1adc34dc6273134d80a3c385dc530fe0",
          "noto-sans-sc-subset.woff2": "0a0b62b40f8b359d0714d47fd3e293d2ca871d0ee21acb200c0b31ebc667fe4b",
          "space-grotesk-latin.woff2": "4212a294d495570baaa60d085f3b6a72b6790b5b1d13471630721ceb9c2babcf",
          "space-mono-bold.woff2": "d09323c39cee214f6472155bb71d374a89726805f7e6313d656f3947b16ccf6c",
          "space-mono-regular.woff2": "2bd76ba5ecee41cdbde94aa862f0c998a6f85ee7e70b8142d19e9e8eb364eb27"
        },
        "fontsIdentical": true
      },
      "drift": [
        {
          "variable": "--ds-font-mono",
          "kind": "value-differs",
          "css": "\"Space Mono\", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          "json": "'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          "jsonPath": "typography.family.mono",
          "inherited": true,
          "note": "16 的 src/tokens.css 与 design-tokens.json 在此项上本身不一致（跨层差异，源自 16）。本包 CSS 层照抄 16 的 CSS 取值、JSON 层照抄 16 的 JSON 取值，两层均未做任何取舍或改写。"
        }
      ],
      "alignmentLayers": {
        "cssLayer": {
          "source": "16-design-system/src/tokens.css",
          "sha256": "e9595d51336fac6a2cb013095b8863c72022bb20e545fa46867c129e9addf368",
          "applied": "cssVars.root / cssVars.dark（逐项照抄，未做任何取舍）"
        },
        "jsonLayer": {
          "source": "16-design-system/design-tokens.json",
          "sha256": "042a38a36707e8cea6584dcb0462ef1ca442d66fad5c42c1ffefcf71034f82f4",
          "applied": "designSystem（令牌树原样引用，取值未改）"
        },
        "note": "本包分两层对齐 16：CSS 层（--ds-* 变量表）照抄 16 的 src/tokens.css，JSON 层（designSystem 令牌树）照抄 16 的 design-tokens.json。drift 记录的是这两层之间、即 16 自身 JSON 与 CSS 的不一致项；每项都已登记 inherited 与说明，本包不做取舍。"
      },
      "inapplicableChecks": [
        {
          "check": "指示器 bottom 必须保留 clamp(36px, 8vh, 64px)",
          "registry": "16-design-system/src/components.css §10（.ds-indicator）",
          "reason": "指示器是 16 预览页的滚动提示组件（圆点↔箭头形变）。本包是资产面板，没有该组件，也不存在等价物；强行加入只为通过校验属于为指标而造功能，故登记为不适用。"
        }
      ],
      "note": "designSystem 为 16 令牌树原样引用（取值未改）；local 为本包展品内嵌配色与资产规格（海报/封面/展柜/GLB 材质已烘焙，不随 UI 主题变化）；compat 为 1.0.0 旧键名到 16 取值的兼容视图。"
    }
  },
  "designSystem": {
    "$schema": "https://design-tokens.org/schema.json",
    "meta": {
      "id": "afterglow-ds",
      "name": "余晖设计系统",
      "nameEn": "Afterglow Design System",
      "version": "1.0.0",
      "author": "16-design-system",
      "prefix": {
        "cssVariable": "--ds-",
        "className": ".ds-",
        "dataAttribute": "data-ds"
      },
      "referenceBasis": {
        "site": "https://olek.si/",
        "auditedAt": "2026-10-21T11:30:33.158Z",
        "auditDoc": "REFERENCE-AUDIT.md",
        "note": "本系统复用参考站【可观察机制】（全屏分段滚动、色调自适应分区、媒体卡去饱和遮罩、圆点↔箭头形变、景深式导航轨、入场模糊+旋转）。颜色、字体、字号、圆角、缓动曲线、命名全部为本系统自有设计，与参考站取值不同，差异见 DESIGN-SPEC.md §12。不含参考站任何资产、字体文件或文案。"
      },
      "target": {
        "sites": [
          "14-publish 作品大厅",
          "06 回响电玩馆",
          "01—12 各作品",
          "17—19 建筑新项目"
        ],
        "basePath": "/playtime-atlas-20261021/",
        "assetPolicy": "全部资源本地化，运行期零外部 CDN 请求"
      }
    },
    "color": {
      "light": {
        "$description": "默认浅色主题。暖白纸面 + 墨色 + 朱砂一点。",
        "bg": {
          "$value": "#FCFBF9",
          "$type": "color",
          "$description": "页面底色（暖白纸）"
        },
        "bgRaised": {
          "$value": "#FFFFFF",
          "$type": "color",
          "$description": "卡片/浮层底色"
        },
        "bgSunken": {
          "$value": "#F2EEE9",
          "$type": "color",
          "$description": "凹陷槽位、输入框底"
        },
        "ink": {
          "$value": "#14110F",
          "$type": "color",
          "$description": "主文字（暖近黑）"
        },
        "inkSoft": {
          "$value": "#59514B",
          "$type": "color",
          "$description": "次级文字；对 --ds-bg 实测 7.48:1"
        },
        "inkFaint": {
          "$value": "#6E655E",
          "$type": "color",
          "$description": "占位/禁用/轴标；对全部浅色底面实测 ≥4.80:1"
        },
        "line": {
          "$value": "#E4DED7",
          "$type": "color",
          "$description": "常规描边"
        },
        "lineStrong": {
          "$value": "#CFC6BC",
          "$type": "color",
          "$description": "强调描边、hover 描边"
        },
        "surface": {
          "$value": "#F2EEE9",
          "$type": "color",
          "$description": "静置块面（对应参考站 --element）"
        },
        "accent": {
          "$value": "#B4432B",
          "$type": "color",
          "$description": "朱砂主色，CTA/选中/焦点"
        },
        "accentHover": {
          "$value": "#97361F",
          "$type": "color"
        },
        "accentSoft": {
          "$value": "#F6E9E4",
          "$type": "color",
          "$description": "主色浅底（标签底）"
        },
        "accentInk": {
          "$value": "#FFFFFF",
          "$type": "color",
          "$description": "主色上的文字"
        },
        "jade": {
          "$value": "#2E6A5E",
          "$type": "color",
          "$description": "辅助色：建筑/结构模型线稿与图解"
        },
        "jadeSoft": {
          "$value": "#E4EEEB",
          "$type": "color"
        },
        "overlay": {
          "$value": "rgba(20, 17, 15, 0.44)",
          "$type": "color",
          "$description": "遮罩"
        }
      },
      "dark": {
        "$description": "深色主题。建筑项目与游戏内夜间场景默认使用。",
        "bg": {
          "$value": "#100F0E",
          "$type": "color"
        },
        "bgRaised": {
          "$value": "#1A1917",
          "$type": "color"
        },
        "bgSunken": {
          "$value": "#0B0A09",
          "$type": "color"
        },
        "ink": {
          "$value": "#F7F4F0",
          "$type": "color"
        },
        "inkSoft": {
          "$value": "#C0B7B0",
          "$type": "color",
          "$description": "次级文字；对 --ds-bg 实测 9.71:1"
        },
        "inkFaint": {
          "$value": "#9A918A",
          "$type": "color",
          "$description": "对全部深色底面实测 ≥5.15:1"
        },
        "line": {
          "$value": "#2B2926",
          "$type": "color"
        },
        "lineStrong": {
          "$value": "#453F39",
          "$type": "color"
        },
        "surface": {
          "$value": "#1E1D1B",
          "$type": "color"
        },
        "accent": {
          "$value": "#E0684A",
          "$type": "color"
        },
        "accentHover": {
          "$value": "#EE8266",
          "$type": "color"
        },
        "accentSoft": {
          "$value": "#331C15",
          "$type": "color"
        },
        "accentInk": {
          "$value": "#17110F",
          "$type": "color"
        },
        "jade": {
          "$value": "#5FA99A",
          "$type": "color"
        },
        "jadeSoft": {
          "$value": "#16211E",
          "$type": "color"
        },
        "overlay": {
          "$value": "rgba(8, 7, 6, 0.62)",
          "$type": "color"
        }
      },
      "section": {
        "$description": "分区色调系统。每个作品/展项可声明自己的底色，文本与控件自动反色。这是本系统从参考站取用的核心机制之一（参考站按项目色计算 tone）。",
        "lightInk": {
          "$value": "#14110F",
          "$type": "color",
          "$description": "浅底分区上的主色"
        },
        "lightSoft": {
          "$value": "rgba(20, 17, 15, 0.62)",
          "$type": "color"
        },
        "lightFaint": {
          "$value": "rgba(20, 17, 15, 0.38)",
          "$type": "color"
        },
        "darkInk": {
          "$value": "#F7F4F0",
          "$type": "color"
        },
        "darkSoft": {
          "$value": "rgba(247, 244, 240, 0.78)",
          "$type": "color"
        },
        "darkFaint": {
          "$value": "rgba(247, 244, 240, 0.46)",
          "$type": "color"
        },
        "toneFadeLight": {
          "$value": "#EDEAE5",
          "$type": "color",
          "$description": "浅色主题下的滚动淡出底色"
        },
        "toneFadeDark": {
          "$value": "#141311",
          "$type": "color"
        },
        "toneThreshold": {
          "$value": 140,
          "$type": "number",
          "$description": "按 WCAG 相对亮度阈值判定分区明暗：L ≥ 0.18 视为浅底"
        },
        "radiusFormula": {
          "$value": "clamp(16px, 2vw, 28px) / var(--ds-section-radius-scale, 1)",
          "$type": "string"
        }
      },
      "canvas": {
        "$description": "游戏/模型画布专用色，保证 HUD 在任何画面上可读。",
        "hudBg": {
          "$value": "rgba(16, 15, 14, 0.72)",
          "$type": "color"
        },
        "hudInk": {
          "$value": "#F7F4F0",
          "$type": "color"
        },
        "hudLine": {
          "$value": "rgba(247, 244, 240, 0.24)",
          "$type": "color"
        },
        "scrim": {
          "$value": "rgba(16, 15, 14, 0.55)",
          "$type": "color",
          "$description": "画布上承载正文时的最低遮罩"
        },
        "danger": {
          "$value": "#C2452B",
          "$type": "color"
        },
        "success": {
          "$value": "#3F7A4E",
          "$type": "color"
        },
        "warning": {
          "$value": "#B07A1E",
          "$type": "color"
        },
        "info": {
          "$value": "#2C5C8F",
          "$type": "color"
        }
      }
    },
    "typography": {
      "family": {
        "display": {
          "$value": "'Space Grotesk', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Source Han Sans SC', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif",
          "$type": "fontFamily",
          "$description": "展示体：作品名/分区标题/英雄区。拉丁用 Space Grotesk，中文回退系统黑体。顺序规则：覆盖完整的系统 CJK 族必须排在覆盖有限的 Noto Sans SC 子集之前（CSS 按字符回退，子集在前会让同段文字混入两套字形、基线错位）。"
        },
        "text": {
          "$value": "'Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Source Han Sans SC', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif",
          "$type": "fontFamily",
          "$description": "正文体：长文/说明/详情。顺序规则同 display：完整覆盖的系统 CJK 族必须排在 Noto Sans SC 子集之前。"
        },
        "mono": {
          "$value": "'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          "$type": "fontFamily",
          "$description": "等宽体：年份、坐标、键位、编号、史料编号。"
        }
      },
      "size": {
        "display": {
          "$value": "clamp(40px, 6.6vw, 84px)",
          "$type": "dimension",
          "$description": "英雄区主标题（中文建议再降一档）"
        },
        "h1": {
          "$value": "clamp(30px, 4.2vw, 52px)",
          "$type": "dimension"
        },
        "h2": {
          "$value": "clamp(22px, 2.6vw, 32px)",
          "$type": "dimension"
        },
        "h3": {
          "$value": "20px",
          "$type": "dimension",
          "$description": "分区标题，参考站同角色为 20px/500"
        },
        "h4": {
          "$value": "17px",
          "$type": "dimension"
        },
        "lead": {
          "$value": "19px",
          "$type": "dimension",
          "$description": "详情页导语"
        },
        "body": {
          "$value": "16px",
          "$type": "dimension"
        },
        "sm": {
          "$value": "14px",
          "$type": "dimension"
        },
        "xs": {
          "$value": "12.5px",
          "$type": "dimension"
        },
        "mono": {
          "$value": "13px",
          "$type": "dimension"
        }
      },
      "lineHeight": {
        "display": {
          "$value": 1.08,
          "$type": "number"
        },
        "tight": {
          "$value": 1.22,
          "$type": "number"
        },
        "snug": {
          "$value": 1.35,
          "$type": "number"
        },
        "normal": {
          "$value": 1.6,
          "$type": "number"
        },
        "relaxed": {
          "$value": 1.75,
          "$type": "number"
        },
        "mono": {
          "$value": 1.45,
          "$type": "number"
        }
      },
      "weight": {
        "regular": {
          "$value": 400,
          "$type": "fontWeight"
        },
        "medium": {
          "$value": 500,
          "$type": "fontWeight"
        },
        "semibold": {
          "$value": 600,
          "$type": "fontWeight"
        },
        "bold": {
          "$value": 700,
          "$type": "fontWeight"
        }
      },
      "tracking": {
        "display": {
          "$value": "-0.03em",
          "$type": "dimension",
          "$description": "仅拉丁适用"
        },
        "body": {
          "$value": "-0.005em",
          "$type": "dimension"
        },
        "cjk": {
          "$value": "0",
          "$type": "dimension",
          "$description": "中文字距必须归零，负字距会破坏汉字字面"
        },
        "mono": {
          "$value": "0.02em",
          "$type": "dimension"
        },
        "caps": {
          "$value": "0.08em",
          "$type": "dimension",
          "$description": "全大写标签"
        }
      },
      "weightCjk": {
        "$description": "中文没有真 medium/bold 的独立设计时，用字重 500 + 字号补偿。",
        "display": {
          "$value": 500,
          "$type": "fontWeight"
        },
        "body": {
          "$value": 400,
          "$type": "fontWeight"
        }
      }
    },
    "space": {
      "1": {
        "$value": "4px",
        "$type": "dimension"
      },
      "2": {
        "$value": "8px",
        "$type": "dimension"
      },
      "3": {
        "$value": "12px",
        "$type": "dimension"
      },
      "4": {
        "$value": "16px",
        "$type": "dimension"
      },
      "5": {
        "$value": "24px",
        "$type": "dimension"
      },
      "6": {
        "$value": "32px",
        "$type": "dimension"
      },
      "7": {
        "$value": "48px",
        "$type": "dimension"
      },
      "8": {
        "$value": "64px",
        "$type": "dimension"
      },
      "9": {
        "$value": "96px",
        "$type": "dimension"
      },
      "10": {
        "$value": "128px",
        "$type": "dimension"
      },
      "gutter": {
        "$value": "clamp(16px, 4vw, 48px)",
        "$type": "dimension",
        "$description": "页面左右安全边距"
      },
      "railGap": {
        "$value": "12px",
        "$type": "dimension",
        "$description": "左侧导航轨条目间距"
      },
      "sectionPadTop": {
        "$value": "clamp(56px, 9vh, 104px)",
        "$type": "dimension"
      },
      "sectionPadBottom": {
        "$value": "clamp(40px, 8vh, 88px)",
        "$type": "dimension"
      }
    },
    "radius": {
      "xs": {
        "$value": "6px",
        "$type": "dimension"
      },
      "sm": {
        "$value": "10px",
        "$type": "dimension"
      },
      "md": {
        "$value": "14px",
        "$type": "dimension"
      },
      "lg": {
        "$value": "20px",
        "$type": "dimension"
      },
      "xl": {
        "$value": "28px",
        "$type": "dimension"
      },
      "pill": {
        "$value": "999px",
        "$type": "dimension"
      },
      "media": {
        "$value": "clamp(16px, 2vw, 28px)",
        "$type": "dimension",
        "$description": "媒体卡/作品封面圆角"
      },
      "control": {
        "$value": "999px",
        "$type": "dimension",
        "$description": "胶囊控件，参考站同类为 18–25px 圆形"
      }
    },
    "shadow": {
      "1": {
        "$value": "0 1px 2px rgba(20, 17, 15, 0.05)",
        "$type": "shadow"
      },
      "2": {
        "$value": "0 4px 16px rgba(20, 17, 15, 0.07)",
        "$type": "shadow"
      },
      "3": {
        "$value": "0 12px 40px rgba(20, 17, 15, 0.10)",
        "$type": "shadow"
      },
      "4": {
        "$value": "0 24px 80px rgba(20, 17, 15, 0.16)",
        "$type": "shadow"
      },
      "ring": {
        "$value": "inset 0 0 0 1px var(--ds-line)",
        "$type": "shadow",
        "$description": "静息描边控件"
      },
      "ringStrong": {
        "$value": "inset 0 0 0 1px var(--ds-line-strong)",
        "$type": "shadow"
      },
      "focusRing": {
        "$value": "0 0 0 2px var(--ds-bg), 0 0 0 4px var(--ds-accent)",
        "$type": "shadow"
      }
    },
    "motion": {
      "$description": "本系统自有缓动曲线族。参考站的标志性缓动实测为 cubic-bezier(0.1, 0.1, 0, 1)，本系统改用下列曲线以形成自有气质（差异见 DESIGN-SPEC §12）。",
      "duration": {
        "instant": {
          "$value": "120ms",
          "$type": "duration"
        },
        "fast": {
          "$value": "200ms",
          "$type": "duration"
        },
        "base": {
          "$value": "320ms",
          "$type": "duration"
        },
        "slow": {
          "$value": "520ms",
          "$type": "duration"
        },
        "reveal": {
          "$value": "800ms",
          "$type": "duration"
        }
      },
      "easing": {
        "out": {
          "$value": "cubic-bezier(0.22, 1, 0.36, 1)",
          "$type": "cubicBezier",
          "$description": "默认出场"
        },
        "inOut": {
          "$value": "cubic-bezier(0.65, 0, 0.35, 1)",
          "$type": "cubicBezier"
        },
        "veil": {
          "$value": "cubic-bezier(0.4, 0, 0.2, 1)",
          "$type": "cubicBezier",
          "$description": "遮罩/淡入淡出"
        },
        "spring": {
          "$value": "cubic-bezier(0.34, 1.42, 0.64, 1)",
          "$type": "cubicBezier",
          "$description": "轻微回弹，仅用于小控件"
        },
        "snap": {
          "$value": "cubic-bezier(0.16, 1, 0.3, 1)",
          "$type": "cubicBezier",
          "$description": "滚动吸附"
        }
      },
      "stagger": {
        "step": {
          "$value": "60ms",
          "$type": "duration"
        },
        "maxSteps": {
          "$value": 6,
          "$type": "number",
          "$description": "交错入场最多 6 级，防止长列表等待过久"
        }
      },
      "entry": {
        "$description": "入场动效规范。位移 24px + 透明度 + 轻微模糊，禁用旋转（旋转在大字号中文下易晕）。",
        "translateY": {
          "$value": "24px",
          "$type": "dimension"
        },
        "blur": {
          "$value": "6px",
          "$type": "dimension"
        },
        "duration": {
          "$value": "640ms",
          "$type": "duration"
        }
      },
      "reducedMotion": {
        "$description": "prefers-reduced-motion: reduce 时全局生效",
        "maxDuration": {
          "$value": "1ms",
          "$type": "duration"
        },
        "disableTransform": {
          "$value": true,
          "$type": "boolean"
        },
        "disableBlur": {
          "$value": true,
          "$type": "boolean"
        },
        "disableSmoothScroll": {
          "$value": true,
          "$type": "boolean"
        },
        "keepOpacity": {
          "$value": true,
          "$type": "boolean",
          "$description": "仅保留不产生位移的淡入淡出"
        }
      }
    },
    "zIndex": {
      "base": {
        "$value": 0,
        "$type": "number"
      },
      "raised": {
        "$value": 10,
        "$type": "number"
      },
      "sticky": {
        "$value": 100,
        "$type": "number"
      },
      "rail": {
        "$value": 200,
        "$type": "number",
        "$description": "左侧导航轨"
      },
      "overlay": {
        "$value": 300,
        "$type": "number"
      },
      "modal": {
        "$value": 400,
        "$type": "number"
      },
      "toast": {
        "$value": 500,
        "$type": "number"
      },
      "debug": {
        "$value": 9000,
        "$type": "number"
      }
    },
    "layout": {
      "maxWidth": {
        "$value": "1280px",
        "$type": "dimension"
      },
      "maxWidthWide": {
        "$value": "1600px",
        "$type": "dimension"
      },
      "readWidth": {
        "$value": "68ch",
        "$type": "dimension",
        "$description": "正文阅读行宽上限"
      },
      "railWidth": {
        "$value": "132px",
        "$type": "dimension",
        "$description": "左侧导航轨占位，参考站实测约 129px"
      },
      "railInset": {
        "$value": "24px",
        "$type": "dimension",
        "$description": "导航轨距左边缘"
      },
      "viewportSection": {
        "$value": "100dvh",
        "$type": "dimension",
        "$description": "全屏分段高"
      },
      "snapAlign": {
        "$value": "start",
        "$type": "string"
      },
      "snapType": {
        "$value": "y mandatory",
        "$type": "string"
      },
      "breakpoints": {
        "sm": {
          "$value": "480px",
          "$type": "dimension"
        },
        "md": {
          "$value": "768px",
          "$type": "dimension",
          "$description": "参考站主断点，实测一致"
        },
        "lg": {
          "$value": "1024px",
          "$type": "dimension"
        },
        "xl": {
          "$value": "1280px",
          "$type": "dimension"
        }
      },
      "grid": {
        "columns": {
          "$value": 12,
          "$type": "number"
        },
        "gap": {
          "$value": "24px",
          "$type": "dimension"
        },
        "gutter": {
          "$value": "clamp(16px, 4vw, 48px)",
          "$type": "dimension"
        }
      }
    },
    "border": {
      "width": {
        "$value": "1px",
        "$type": "dimension"
      },
      "widthStrong": {
        "$value": "2px",
        "$type": "dimension"
      },
      "style": {
        "$value": "solid",
        "$type": "string"
      }
    },
    "component": {
      "$description": "组件级约定。各作品实现时以此为准。",
      "button": {
        "heightSm": {
          "$value": "32px",
          "$type": "dimension"
        },
        "heightMd": {
          "$value": "40px",
          "$type": "dimension"
        },
        "heightLg": {
          "$value": "48px",
          "$type": "dimension"
        },
        "paddingX": {
          "$value": "18px",
          "$type": "dimension"
        },
        "gap": {
          "$value": "8px",
          "$type": "dimension"
        },
        "iconOnly": {
          "$value": "40px",
          "$type": "dimension",
          "$description": "方形图标按钮尺寸"
        }
      },
      "navRail": {
        "itemFontSize": {
          "$value": "14px",
          "$type": "dimension"
        },
        "itemTracking": {
          "$value": "-0.01em",
          "$type": "dimension"
        },
        "focusFontSize": {
          "$value": "16px",
          "$type": "dimension",
          "$description": "当前分区的年份标签字号"
        },
        "separatorWidth": {
          "$value": "10px",
          "$type": "dimension"
        },
        "separatorOpacity": {
          "$value": 0.35,
          "$type": "number"
        },
        "dimming": {
          "$value": "color-size-weight",
          "$type": "string",
          "$description": "景深层级用「墨色层级 + 字号 + 字重」表达，**不使用 opacity 衰减**（半透明文字无法保持 4.5:1）"
        },
        "levels": {
          "$description": "按与当前分区的距离分三级，三级均满足 4.5:1",
          "level0": {
            "color": "var(--ds-ink)",
            "fontSize": "16px",
            "fontWeight": 500,
            "$type": "string"
          },
          "level1": {
            "color": "var(--ds-ink-soft)",
            "fontSize": "14px",
            "fontWeight": 400,
            "$type": "string"
          },
          "level2": {
            "color": "var(--ds-ink-faint)",
            "fontSize": "14px",
            "fontWeight": 400,
            "scale": "0.97",
            "$type": "string"
          }
        },
        "blurMax": {
          "$value": "0px",
          "$type": "dimension",
          "$description": "默认 0。若项目仍需景深模糊，须同时保证该层文字对比度 ≥4.5:1 或标记为纯装饰并提供 aria-label"
        }
      },
      "workCard": {
        "mediaRatio": {
          "$value": "16 / 10",
          "$type": "string"
        },
        "titleSize": {
          "$value": "20px",
          "$type": "dimension"
        },
        "metaSize": {
          "$value": "14px",
          "$type": "dimension"
        },
        "metaFont": {
          "$value": "mono",
          "$type": "string",
          "$description": "年份/编号使用等宽"
        },
        "dimOverlay": {
          "$value": "rgba(128, 128, 128, 0.30)",
          "$type": "color",
          "$description": "hover 时媒体去饱和遮罩"
        },
        "dimOpacity": {
          "$value": 1,
          "$type": "number",
          "$description": "hover 时遮罩显隐"
        }
      },
      "galleryIndicator": {
        "dotSize": {
          "$value": "6px",
          "$type": "dimension"
        },
        "dotGap": {
          "$value": "8px",
          "$type": "dimension"
        },
        "dotRadius": {
          "$value": "999px",
          "$type": "dimension"
        },
        "inactiveOpacity": {
          "$value": 0.22,
          "$type": "number"
        },
        "activeOpacity": {
          "$value": 1,
          "$type": "number"
        },
        "offsetFromBottom": {
          "$value": "clamp(36px, 8vh, 64px)",
          "$type": "dimension",
          "$description": "参考站实测值，本系统沿用该位置关系"
        }
      },
      "lightbox": {
        "backdropBlur": {
          "$value": "16px",
          "$type": "dimension"
        },
        "contentOpacity": {
          "$value": 0.08,
          "$type": "number",
          "$description": "详情展开时背景内容的残留不透明度"
        },
        "closeSize": {
          "$value": "48px",
          "$type": "dimension"
        },
        "closeRadius": {
          "$value": "24px",
          "$type": "dimension"
        }
      },
      "detail": {
        "heroAspect": {
          "$value": "21 / 9",
          "$type": "string"
        },
        "sectionGap": {
          "$value": "clamp(40px, 7vh, 88px)",
          "$type": "dimension"
        },
        "metaFont": {
          "$value": "mono",
          "$type": "string"
        }
      },
      "tag": {
        "height": {
          "$value": "24px",
          "$type": "dimension"
        },
        "paddingX": {
          "$value": "10px",
          "$type": "dimension"
        },
        "radius": {
          "$value": "999px",
          "$type": "dimension"
        },
        "fontSize": {
          "$value": "12.5px",
          "$type": "dimension"
        }
      },
      "figure": {
        "captionSize": {
          "$value": "13px",
          "$type": "dimension"
        },
        "captionColor": {
          "$value": "var(--ds-ink-soft)",
          "$type": "color"
        },
        "captionGap": {
          "$value": "10px",
          "$type": "dimension"
        }
      }
    },
    "a11y": {
      "minContrastText": {
        "$value": 4.5,
        "$type": "number"
      },
      "minContrastLarge": {
        "$value": 3,
        "$type": "number",
        "$description": "≥24px 或 ≥19px 粗体"
      },
      "minContrastUi": {
        "$value": 3,
        "$type": "number",
        "$description": "控件边界、图形"
      },
      "minTargetSize": {
        "$value": "24px",
        "$type": "dimension",
        "$description": "WCAG 2.2 AA (2.5.8) 最低触摸目标"
      },
      "focusRingWidth": {
        "$value": "2px",
        "$type": "dimension"
      },
      "focusRingOffset": {
        "$value": "2px",
        "$type": "dimension"
      },
      "focusRingColor": {
        "$value": "var(--ds-accent)",
        "$type": "color"
      },
      "skipLinkOffset": {
        "$value": "8px",
        "$type": "dimension"
      },
      "langSwitchAttr": {
        "$value": "lang",
        "$type": "string"
      },
      "ariaLivePolite": {
        "$value": "polite",
        "$type": "string"
      },
      "targetSizeEnhanced": {
        "$value": "44px",
        "$type": "dimension",
        "$description": "WCAG 2.2 AAA (2.5.5) 增强目标；主按钮与图标按钮必须达到"
      },
      "primaryControlMin": {
        "$value": "40px",
        "$type": "dimension",
        "$description": "主按钮 .ds-btn 与 .ds-iconbtn 的最小高度"
      }
    },
    "asset": {
      "$description": "资源策略：全部本地化，Pages 子路径适配，运行期零外部请求。",
      "basePathVar": {
        "$value": "--ds-base",
        "$type": "string",
        "$description": "由各项目注入，例如 /playtime-atlas-20261021/"
      },
      "fontLoading": {
        "$value": "swap",
        "$type": "string"
      },
      "prefetch": {
        "$value": "false",
        "$type": "string",
        "$description": "不预取跨页大资源"
      },
      "imageFormat": {
        "$value": "webp",
        "$type": "string"
      },
      "imageFallback": {
        "$value": "png",
        "$type": "string"
      },
      "lazyLoading": {
        "$value": "loading=\"lazy\"",
        "$type": "string"
      },
      "eagerAboveFold": {
        "$value": "loading=\"eager\" fetchpriority=\"high\"",
        "$type": "string"
      }
    }
  },
  "local": {
    "$description": "本包展品内嵌配色与资产规格。海报 / 封面 / 展柜 / GLB 材质已按此取值烘焙进资产文件，不随 UI 主题变化；因此它不是 UI 色板，UI 一律走 --ds-*。",
    "color": {
      "ink": {
        "100": "#AFC4D6",
        "200": "#7A9BB8",
        "300": "#4B7096",
        "400": "#33567A",
        "500": "#24415E",
        "600": "#1A3149",
        "700": "#122236",
        "800": "#0C1726",
        "900": "#070E19"
      },
      "paper": {
        "50": "#FBF7EF",
        "100": "#F3EBDC",
        "200": "#E7DCC7",
        "300": "#D3C4A8",
        "400": "#B9A784",
        "500": "#9C8A68"
      },
      "signal": {
        "200": "#FFC08E",
        "300": "#FF9A5E",
        "400": "#FF7A33",
        "500": "#F0601F",
        "600": "#D94A15",
        "700": "#B23A0F"
      },
      "teal": {
        "300": "#7FD0C0",
        "400": "#4FB3A0",
        "500": "#3E9C8B",
        "600": "#2F7A6D"
      }
    },
    "typography": {
      "fontFamily": {
        "display": "'Space Grotesk', 'Noto Sans SC', -apple-system, system-ui, sans-serif",
        "sans": "'Inter', 'Noto Sans SC', -apple-system, system-ui, sans-serif",
        "mono": "'Space Mono', 'Noto Sans Mono', ui-monospace, SFMono-Regular, monospace",
        "cjk": "'Noto Sans SC', -apple-system, system-ui, sans-serif"
      },
      "fontSize": {
        "2xs": "0.6875rem",
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "md": "1.125rem",
        "lg": "1.375rem",
        "xl": "1.75rem",
        "2xl": "2.25rem",
        "3xl": "3rem",
        "4xl": "4rem",
        "5xl": "5.5rem",
        "6xl": "7rem"
      },
      "fontWeight": {
        "regular": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      },
      "lineHeight": {
        "tight": 1.08,
        "snug": 1.28,
        "normal": 1.55,
        "loose": 1.85
      },
      "letterSpacing": {
        "tightest": "-0.032em",
        "tight": "-0.02em",
        "normal": "0em",
        "wide": "0.045em",
        "wider": "0.1em",
        "widest": "0.2em"
      }
    },
    "space": {
      "0": "0px",
      "1": "4px",
      "2": "8px",
      "3": "12px",
      "4": "16px",
      "5": "24px",
      "6": "32px",
      "7": "40px",
      "8": "48px",
      "9": "64px",
      "10": "96px",
      "11": "128px"
    },
    "radius": {
      "none": "0px",
      "xs": "2px",
      "sm": "4px",
      "md": "8px",
      "lg": "14px",
      "xl": "22px",
      "pill": "999px"
    },
    "shadow": {
      "none": "none",
      "sm": "0 1px 2px rgba(7, 14, 25, 0.5)",
      "md": "0 6px 18px rgba(7, 14, 25, 0.55)",
      "lg": "0 18px 48px rgba(7, 14, 25, 0.62)",
      "glow": "0 0 0 1px rgba(240, 96, 31, 0.4), 0 10px 34px rgba(240, 96, 31, 0.28)",
      "inner": "inset 0 1px 0 rgba(251, 247, 239, 0.08)"
    },
    "grid": {
      "columns": 12,
      "gutter": "24px",
      "margin": "32px",
      "maxWidth": "1360px",
      "poster": {
        "width": 1200,
        "height": 1800
      },
      "cover": {
        "width": 1600,
        "height": 900
      },
      "modelRender": {
        "width": 1024,
        "height": 1024
      },
      "icon": {
        "width": 24,
        "height": 24,
        "stroke": 1.5
      },
      "labelPlate": {
        "width": 520,
        "height": 180
      }
    },
    "motion": {
      "instant": "120ms",
      "fast": "180ms",
      "base": "260ms",
      "slow": "420ms",
      "easeOut": "cubic-bezier(0.16, 1, 0.3, 1)",
      "easeInOut": "cubic-bezier(0.65, 0, 0.35, 1)"
    },
    "z": {
      "base": 0,
      "raised": 10,
      "sticky": 100,
      "overlay": 500,
      "modal": 800,
      "toast": 900
    }
  },
  "compat": {
    "$description": "1.0.0 旧键名 → 16 取值的兼容视图。语义色取 16 浅色主题（design-tokens.json 默认主题）；深色主题请用 CSS 变量 var(--ds-*)，它随 [data-ds-theme] 自动切换。",
    "semantic": {
      "bgBase": "#FCFBF9",
      "bgDeep": "#EDEAE5",
      "bgPanel": "#F2EEE9",
      "bgRaised": "#FFFFFF",
      "textPrimary": "#14110F",
      "textSecondary": "#59514B",
      "textMuted": "#6E655E",
      "textOnSignal": "#FFFFFF",
      "accent": "#B4432B",
      "accentDeep": "#97361F",
      "accentSoft": "#F6E9E4",
      "positive": "#2E6A5E",
      "hairline": "#E4DED7",
      "hairlineStrong": "#CFC6BC",
      "scrim": "rgba(16, 15, 14, 0.55)"
    },
    "typography": {
      "fontFamily": {
        "display": "'Space Grotesk', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Source Han Sans SC', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif",
        "sans": "'Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Source Han Sans SC', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif",
        "mono": "'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
        "cjk": "'Noto Sans SC', -apple-system, system-ui, sans-serif"
      },
      "fontSize": {
        "2xs": "11px",
        "xs": "12.5px",
        "sm": "14px",
        "base": "16px",
        "md": "17px",
        "lg": "20px",
        "xl": "clamp(22px, 2.6vw, 32px)",
        "2xl": "clamp(30px, 4.2vw, 52px)",
        "3xl": "clamp(40px, 6.6vw, 84px)"
      },
      "lineHeight": {
        "tight": 1.22,
        "snug": 1.35,
        "normal": 1.6,
        "loose": 1.75
      }
    },
    "space": {
      "1": "4px",
      "2": "8px",
      "3": "12px",
      "4": "16px",
      "5": "24px",
      "6": "32px",
      "7": "48px",
      "8": "64px",
      "9": "96px",
      "10": "128px"
    },
    "radius": {
      "xs": "6px",
      "sm": "10px",
      "md": "14px",
      "lg": "20px",
      "xl": "28px",
      "pill": "999px",
      "media": "clamp(16px, 2vw, 28px)",
      "control": "999px"
    },
    "motion": {
      "instant": "120ms",
      "fast": "200ms",
      "base": "320ms",
      "slow": "520ms",
      "easeOut": "cubic-bezier(0.22, 1, 0.36, 1)",
      "easeInOut": "cubic-bezier(0.65, 0, 0.35, 1)"
    }
  },
  "cssVars": {
    "root": {
      "--ds-bg": "#fcfbf9",
      "--ds-bg-raised": "#ffffff",
      "--ds-bg-sunken": "#f2eee9",
      "--ds-ink": "#14110f",
      "--ds-ink-soft": "#59514b",
      "--ds-ink-faint": "#6e655e",
      "--ds-line": "#e4ded7",
      "--ds-line-strong": "#cfc6bc",
      "--ds-surface": "#f2eee9",
      "--ds-accent": "#b4432b",
      "--ds-accent-hover": "#97361f",
      "--ds-accent-soft": "#f6e9e4",
      "--ds-accent-ink": "#ffffff",
      "--ds-jade": "#2e6a5e",
      "--ds-jade-soft": "#e4eeeb",
      "--ds-overlay": "rgba(20, 17, 15, 0.44)",
      "--ds-section-ink": "var(--ds-ink)",
      "--ds-section-soft": "rgba(20, 17, 15, 0.62)",
      "--ds-section-faint": "rgba(20, 17, 15, 0.38)",
      "--ds-section-bg": "var(--ds-bg)",
      "--ds-tone-fade": "#edeae5",
      "--ds-glow": "var(--ds-bg)",
      "--ds-section-radius-scale": "1",
      "--ds-canvas-hud-bg": "rgba(16, 15, 14, 0.72)",
      "--ds-canvas-hud-ink": "#f7f4f0",
      "--ds-canvas-hud-line": "rgba(247, 244, 240, 0.24)",
      "--ds-canvas-scrim": "rgba(16, 15, 14, 0.55)",
      "--ds-danger": "#c2452b",
      "--ds-success": "#3f7a4e",
      "--ds-warning": "#b07a1e",
      "--ds-info": "#2c5c8f",
      "--ds-font-display": "\"Space Grotesk\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", \"Source Han Sans SC\", \"Noto Sans SC\", -apple-system, BlinkMacSystemFont, sans-serif",
      "--ds-font-text": "\"Inter\", \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", \"Source Han Sans SC\", \"Noto Sans SC\", -apple-system, BlinkMacSystemFont, sans-serif",
      "--ds-font-mono": "\"Space Mono\", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      "--ds-type-display": "clamp(40px, 6.6vw, 84px)",
      "--ds-type-h1": "clamp(30px, 4.2vw, 52px)",
      "--ds-type-h2": "clamp(22px, 2.6vw, 32px)",
      "--ds-type-h3": "20px",
      "--ds-type-h4": "17px",
      "--ds-type-lead": "19px",
      "--ds-type-body": "16px",
      "--ds-type-sm": "14px",
      "--ds-type-xs": "12.5px",
      "--ds-type-mono": "13px",
      "--ds-lh-display": "1.08",
      "--ds-lh-tight": "1.22",
      "--ds-lh-snug": "1.35",
      "--ds-lh-normal": "1.6",
      "--ds-lh-relaxed": "1.75",
      "--ds-lh-mono": "1.45",
      "--ds-w-regular": "400",
      "--ds-w-medium": "500",
      "--ds-w-semibold": "600",
      "--ds-w-bold": "700",
      "--ds-track-display": "-0.03em",
      "--ds-track-body": "-0.005em",
      "--ds-track-cjk": "0",
      "--ds-track-mono": "0.02em",
      "--ds-track-caps": "0.08em",
      "--ds-space-1": "4px",
      "--ds-space-2": "8px",
      "--ds-space-3": "12px",
      "--ds-space-4": "16px",
      "--ds-space-5": "24px",
      "--ds-space-6": "32px",
      "--ds-space-7": "48px",
      "--ds-space-8": "64px",
      "--ds-space-9": "96px",
      "--ds-space-10": "128px",
      "--ds-space-gutter": "clamp(16px, 4vw, 48px)",
      "--ds-space-rail-gap": "12px",
      "--ds-space-section-top": "clamp(56px, 9vh, 104px)",
      "--ds-space-section-bottom": "clamp(40px, 8vh, 88px)",
      "--ds-radius-xs": "6px",
      "--ds-radius-sm": "10px",
      "--ds-radius-md": "14px",
      "--ds-radius-lg": "20px",
      "--ds-radius-xl": "28px",
      "--ds-radius-pill": "999px",
      "--ds-radius-media": "clamp(16px, 2vw, 28px)",
      "--ds-radius-control": "999px",
      "--ds-shadow-1": "0 1px 2px rgba(20, 17, 15, 0.05)",
      "--ds-shadow-2": "0 4px 16px rgba(20, 17, 15, 0.07)",
      "--ds-shadow-3": "0 12px 40px rgba(20, 17, 15, 0.1)",
      "--ds-shadow-4": "0 24px 80px rgba(20, 17, 15, 0.16)",
      "--ds-ring": "inset 0 0 0 1px var(--ds-line)",
      "--ds-ring-strong": "inset 0 0 0 1px var(--ds-line-strong)",
      "--ds-focus-ring": "0 0 0 2px var(--ds-bg), 0 0 0 4px var(--ds-accent)",
      "--ds-dur-instant": "120ms",
      "--ds-dur-fast": "200ms",
      "--ds-dur-base": "320ms",
      "--ds-dur-slow": "520ms",
      "--ds-dur-reveal": "800ms",
      "--ds-ease-out": "cubic-bezier(0.22, 1, 0.36, 1)",
      "--ds-ease-inout": "cubic-bezier(0.65, 0, 0.35, 1)",
      "--ds-ease-veil": "cubic-bezier(0.4, 0, 0.2, 1)",
      "--ds-ease-spring": "cubic-bezier(0.34, 1.42, 0.64, 1)",
      "--ds-ease-snap": "cubic-bezier(0.16, 1, 0.3, 1)",
      "--ds-stagger-step": "60ms",
      "--ds-entry-translate": "24px",
      "--ds-entry-blur": "6px",
      "--ds-entry-duration": "640ms",
      "--ds-in-delay": "0ms",
      "--ds-z-base": "0",
      "--ds-z-raised": "10",
      "--ds-z-sticky": "100",
      "--ds-z-rail": "200",
      "--ds-z-overlay": "300",
      "--ds-z-modal": "400",
      "--ds-z-toast": "500",
      "--ds-max-width": "1280px",
      "--ds-max-width-wide": "1600px",
      "--ds-read-width": "68ch",
      "--ds-rail-width": "132px",
      "--ds-rail-inset": "24px",
      "--ds-section-height": "100dvh",
      "--ds-grid-gutter": "var(--ds-space-gutter)",
      "--ds-grid-gap": "var(--ds-space-5)",
      "--ds-rail-scale": "1",
      "--ds-rail-blur": "0px",
      "--ds-work-dim": "rgba(128, 128, 128, 0.3)",
      "--ds-contrast-text": "4.5",
      "--ds-contrast-large": "3",
      "--ds-contrast-ui": "3",
      "--ds-target-min": "44px",
      "--ds-focus-width": "2px",
      "--ds-focus-offset": "2px",
      "--ds-base": "\"\"",
      "--ds-font-display-src": "var(--ds-base)"
    },
    "dark": {
      "--ds-bg": "#100f0e",
      "--ds-bg-raised": "#1a1917",
      "--ds-bg-sunken": "#0b0a09",
      "--ds-ink": "#f7f4f0",
      "--ds-ink-soft": "#c0b7b0",
      "--ds-ink-faint": "#9a918a",
      "--ds-line": "#2b2926",
      "--ds-line-strong": "#453f39",
      "--ds-surface": "#1e1d1b",
      "--ds-accent": "#e0684a",
      "--ds-accent-hover": "#ee8266",
      "--ds-accent-soft": "#331c15",
      "--ds-accent-ink": "#17110f",
      "--ds-jade": "#5fa99a",
      "--ds-jade-soft": "#16211e",
      "--ds-overlay": "rgba(8, 7, 6, 0.62)",
      "--ds-section-ink": "#f7f4f0",
      "--ds-section-soft": "rgba(247, 244, 240, 0.78)",
      "--ds-section-faint": "rgba(247, 244, 240, 0.46)",
      "--ds-tone-fade": "#141311",
      "--ds-canvas-hud-bg": "rgba(8, 7, 6, 0.78)"
    }
  }
};
export default tokens;
if (typeof window !== "undefined") { window.ATLAS_TOKENS = tokens; }
