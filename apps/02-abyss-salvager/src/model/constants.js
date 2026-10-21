/**
 * Shared constants for 《渊甲拾遗者 / ABYSS-CARAPACE SALVAGER》.
 *
 * The machine is an original design: a segmented, armoured deep-sea ore
 * harvester that works a hydrothermal vent field. Its default build (18 driven
 * carapace segments) spans exactly 22.6 scene units, which is calibrated to
 * 760 m of real machine. Every length shown anywhere in the UI is derived from
 * these two numbers, so a readout can never disagree with the geometry.
 */

export const WORK = Object.freeze({
  id: 'abyss-carapace-salvager',
  titleCn: '渊甲拾遗者',
  titleEn: 'ABYSS-CARAPACE SALVAGER',
  model: 'AC-VII',
  subtitleCn: '深渊热液区甲壳式矿脉采集体',
  subtitleEn: 'HADAL VENT ORE-HARVESTING CARAPACE',
  operator: '深渊矿业观测计划 / ABYSSAL MINING SURVEY',
});

/** Length of the scene axis occupied by the machine, in scene units. */
export const MACHINE_UNITS = 22.6;

/** Real length of the default machine, in metres. */
export const MACHINE_METRES = 760;

/** Scene units -> real metres. */
export const METRES_PER_UNIT = MACHINE_METRES / MACHINE_UNITS;

/** Convert a scene-unit length to the real metres of the machine. */
export function unitsToMetres(units) {
  return units * METRES_PER_UNIT;
}

/** Convert a real metre length to scene units. */
export function metresToUnits(metres) {
  return metres / METRES_PER_UNIT;
}
