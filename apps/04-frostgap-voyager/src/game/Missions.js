/**
 * Ordered voyage chain. Only the active step is evaluated each frame;
 * completing it advances the chain and unlocks the next entry.
 */
export const MISSIONS = [
  {
    id: 'leave-beacon',
    title: '离开灯塔站',
    titleEn: 'Leave Beacon Station',
    desc: '脱离泊位，把霜隙号开出灯塔站 6 公里以外。',
    descEn: 'Undock and fly FG-1 more than 6 km clear of Beacon Station.',
    hint: 'R 脱离泊位 → W 推进 → Shift 后燃',
    hintEn: 'R to undock → W to thrust → Shift for the burner',
    progress: (ctx) => Math.min(1, ctx.distToStation / 60),
    check: (ctx) => ctx.distToStation > 60,
  },
  {
    id: 'cruise-check',
    title: '通过巡航检定',
    titleEn: 'Pass the cruise check',
    desc: '把航速推到 400 m/s 以上，确认推进系统工作正常。',
    descEn: 'Push the speed past 400 m/s to confirm the drive is healthy.',
    hint: '按住 W，必要时用 Shift',
    hintEn: 'Hold W, add Shift if needed',
    progress: (ctx) => Math.min(1, ctx.speedMs / 400),
    check: (ctx) => ctx.speedMs > 400,
  },
  {
    id: 'archive-velan',
    title: '为维岚建立档案',
    titleEn: 'File Velan',
    desc: '把准星对准气态巨行星维岚，按 F 启动天体扫描。',
    descEn: 'Aim the reticle at the gas giant Velan and press F to scan it.',
    hint: '对准行星后按 F',
    hintEn: 'Line up the planet, then press F',
    progress: (ctx) => (ctx.save.hasDiscovered('velan') ? 1 : ctx.scanProgress),
    check: (ctx) => ctx.save.hasDiscovered('velan'),
  },
  {
    id: 'first-jump',
    title: '跨越第一段空隙',
    titleEn: 'Cross the first gap',
    desc: '打开星图，把航向指向碎屑回廊并执行跃迁。',
    descEn: 'Open the chart, set a course for the Debris Gallery and execute the jump.',
    hint: '按 M 打开星图',
    hintEn: 'Press M for the chart',
    progress: (ctx) => Math.min(1, ctx.save.data.jumps / 1),
    check: (ctx) => ctx.save.data.jumps >= 1,
  },
  {
    id: 'gallery-anomaly',
    title: '辨认回廊里的异物',
    titleEn: 'Identify what is out there',
    desc: '在碎屑回廊中找到并扫描任意一处未登记异常体。',
    descEn: 'Find and scan any unlogged anomaly inside the Debris Gallery.',
    hint: '对准发光的异常体后按 F',
    hintEn: 'Aim at a lit anomaly, then press F',
    progress: (ctx) => (ctx.anomalyDiscovered ? 1 : ctx.scanProgress),
    check: (ctx) => ctx.anomalyDiscovered,
  },
  {
    id: 'archive-frostgap',
    title: '为霜隙建立档案',
    titleEn: 'File Frostgap',
    desc: '跃迁到霜隙环系，扫描这颗带环的冰巨星。',
    descEn: 'Jump to the Frostgap system and scan this ringed ice giant.',
    hint: '星图 → 霜隙环系',
    hintEn: 'Chart → Frostgap system',
    progress: (ctx) => (ctx.save.hasDiscovered('frostgap') ? 1 : ctx.scanProgress),
    check: (ctx) => ctx.save.hasDiscovered('frostgap'),
  },
  {
    id: 'return-beacon',
    title: '回到灯塔',
    titleEn: 'Return to the beacon',
    desc: '返回灯塔站，对准泊位导引灯按 R 完成停靠与补给。',
    descEn: 'Come back to Beacon Station, line up on the berth lights and press R to dock and resupply.',
    hint: '减速到 300 m/s 以下后按 R',
    hintEn: 'Slow below 300 m/s, then press R',
    progress: (ctx) => (ctx.docked ? 1 : Math.max(0, 1 - ctx.distToPort / 400)),
    check: (ctx) => ctx.docked,
  },
  {
    id: 'free-voyage',
    title: '自由远航',
    titleEn: 'Open voyage',
    desc: '既定航程完成。接下来由你决定，把十个目标全部登记进档案。',
    descEn: 'The set course is done. The rest is yours — log all ten targets.',
    hint: '按 M 查看星图，按 F 扫描天体',
    hintEn: 'Press M for the chart, F to scan',
    progress: (ctx) => ctx.save.discoveryCount / 10,
    check: (ctx) => ctx.save.discoveryCount >= 10,
  },
];

export class MissionTracker {
  constructor(save, bus) {
    this.save = save;
    this.bus = bus;
    this.index = 0;
    // Resume the chain from persistent progress.
    while (this.index < MISSIONS.length && save.isMissionComplete(MISSIONS[this.index].id)) {
      this.index += 1;
    }
  }

  get current() {
    return MISSIONS[Math.min(this.index, MISSIONS.length - 1)];
  }

  get completedCount() {
    return this.save ? Object.keys(this.save.data.missions).length : 0;
  }

  get total() {
    return MISSIONS.length;
  }

  evaluate(ctx) {
    const mission = this.current;
    if (!mission) return;
    if (mission.check(ctx)) {
      this.save.completeMission(mission.id);
      this.index = Math.min(this.index + 1, MISSIONS.length);
      this.bus.emit('mission:complete', { mission, next: this.current });
    }
  }
}
