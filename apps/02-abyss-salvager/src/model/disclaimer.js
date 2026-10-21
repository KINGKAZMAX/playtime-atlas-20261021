/**
 * 教学示意声明 —— 唯一真源。
 *
 * RESTYLE-SPEC.md §6.9（通用硬性要求 9）：
 *   「与真实比例/构造不完全一致的模型显著标注『教学示意，非施工/工程模型』；
 *     受力箭头为定性说明，非工程计算；示意模型不得冒充实测测绘。」
 *
 * 本作《渊甲拾遗者 AC-VII》的体长 760 m、18 驱动体节、Ø 41.7 m 等全部参数
 * 都是**本作品自设的虚构参数**，不对应任何真实装备、测绘或工程文件。
 * 因此声明必须在**三处**同时可见，缺一不可：
 *
 *   1. 模型内   —— 3D 场景中随模型一同运动的声明牌（见 src/ui/inspect.js 的
 *                  createDisclaimerBadge），以及 2D 技术面板下方的脚注。
 *   2. 说明页   —— notes.html（构建产物中的 notes.html）。
 *   3. 导出元数据 —— GLB 的 asset.extras.disclaimer（见 main.js 的
 *                  patchGlbDisclaimer，写入 JSON chunk）。
 *
 * 三处文案由本文件导出，保证一致；任何一处改动都会同步到全部落点。
 */

export const DISCLAIMER = {
  /** 短标（模型内铭牌 / 卡片徽标） */
  flagZh: '教学示意，非施工/工程模型',
  flagEn: 'Teaching illustration — not a construction or engineering model',

  /** 长说明（说明页 / 导出元数据） */
  bodyZh:
    '《渊甲拾遗者 AC-VII》为原创教学示意模型。全部几何、贴图与参数（体长 760 m、' +
    '18 驱动体节、体径 Ø 41.7 m 等）均为本作品自设的虚构参数，不来自任何实测测绘、' +
    '厂商图纸或公开工程资料，也不对应任何真实装备。本模型仅用于说明可分解检视、' +
    '剖切与参数化重建等交互机制，不得用于施工、设计、制造、招投标或安全评估。' +
    '模型中的受力、姿态与关节关系为定性示意，不构成工程计算。',
  bodyEn:
    'ABYSS-CARAPACE SALVAGER AC-VII is an original teaching illustration. All geometry, ' +
    'textures and parameters (760 m overall length, 18 driven body segments, Ø 41.7 m ' +
    'diameter, etc.) are fictional values invented for this work; they are not derived from ' +
    'any survey, vendor drawing or public engineering document, and they do not correspond ' +
    'to any real equipment. The model exists to demonstrate interactive mechanisms ' +
    '(exploded inspection, sectioning, parametric rebuild) and must not be used for ' +
    'construction, design, fabrication, procurement or safety assessment. Forces, poses and ' +
    'joint relationships shown are qualitative illustration, not engineering calculation.',

  /** 导出元数据里的机器可读字段 */
  machine: {
    classification: 'teaching-illustration',
    isConstructionModel: false,
    isEngineeringModel: false,
    isSurveyedGeometry: false,
    forcesAreQualitativeOnly: true,
  },
};

/** 写入 GLB asset.extras 的扁平对象（值必须是字符串 / 布尔 / 数字）。 */
export function disclaimerExtras() {
  return {
    classification: DISCLAIMER.machine.classification,
    disclaimer_zh: DISCLAIMER.flagZh,
    disclaimer_en: DISCLAIMER.flagEn,
    disclaimer_body_zh: DISCLAIMER.bodyZh,
    disclaimer_body_en: DISCLAIMER.bodyEn,
    isConstructionModel: false,
    isEngineeringModel: false,
    isSurveyedGeometry: false,
    forcesAreQualitativeOnly: true,
  };
}
