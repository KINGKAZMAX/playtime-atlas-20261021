/**
 * 界面文案 · 中文（zh-CN）
 *
 * 依据 15-supervisor/RESTYLE-SPEC.md §4 第 1 步「准备中英文案骨架（zh/en key 清单）」
 * 与 16-design-system/DESIGN-SPEC.md §4.3「语言切换」。
 *
 * 约定：
 *  · 界面装饰性文案（按钮、标签、提示、toast）走本字典。
 *  · 世界观内容（天体档案、任务、跃迁目标、区域）保留在各数据文件的 `xxEn` 字段，
 *    由 src/i18n/index.js 的 loc() 按语言取值。
 *  · 文案全部为本批原创，英文版为对应改写，不复用任何第三方既有文本。
 */
export default {
  /* ---------- 主菜单 ---------- */
  'menu.start': '接管霜隙号',
  'menu.help': '操作说明',
  'menu.settings': '设置',
  'menu.journal': '远航档案',
  'menu.skip': '跳到驾驶舱',
  'menu.scene': '驾驶舱视图',
  'hud.logTitle': '远航日志',
  'menu.note': '进入后点击画面锁定鼠标；若浏览器拒绝锁定，将自动切换为拖拽 / 方向键操控。',
  'menu.lore':
    '灯塔站的补给只够走完七段航程。<br />' +
    '你的任务是把这艘单人穿梭艇——<b>霜隙号 FG-1</b>——开过这片空隙，' +
    '并把沿途每一个天体都登记进远航档案。',

  /* ---------- 暂停 / 设置 ---------- */
  'pause.title': '航行暂停',
  'pause.resume': '继续航行',
  'pause.help': '操作说明',
  'pause.reset': '重置飞船',
  'pause.quit': '返回主菜单',
  'set.quality': '画质',
  'set.volume': '音量',
  'set.sensitivity': '鼠标灵敏度',
  'set.fov': '视场角 FOV',
  'set.invertY': '反转 Y 轴',
  'set.assist': '飞行辅助（松杆自动减速）',
  'set.mute': '静音',
  'set.quality.low': '低',
  'set.quality.medium': '中',
  'set.quality.high': '高',

  /* ---------- 星图 ---------- */
  'starmap.title': '星图',
  'starmap.jump': '执行跃迁',
  'starmap.close': '关闭',
  'starmap.region': '所属区域',
  'starmap.coords': '坐标',

  /* ---------- 操作说明 ---------- */
  'help.title': '操作说明',
  'help.note': '飞船遵循牛顿惯性：推进只加速，松杆不会自动停住。',
  'help.close': '返回',

  /* ---------- 远航档案 ---------- */
  'journal.title': '远航档案',
  'journal.close': '返回',
  'journal.unlogged': '未登记目标',

  /* ---------- 扫描结果 ---------- */
  'scan.close': '关闭',
  'scan.kind.star': '恒星',
  'scan.kind.planet': '行星',
  'scan.kind.moon': '卫星',
  'scan.kind.anomaly': '异常体',
  'scan.kind.station': '空间站',
  'scan.kind.derelict': '废弃结构',

  /* ---------- 载入 / 指针 ---------- */
  'load.init': '正在初始化',
  /* 页头 / 页脚（G.2 .ds-topbar / .ds-footer） */
  'menu.tag': '可玩 · 6DOF',
  'footer.hint': '键盘操作 · Esc 暂停 · M 星图 · F 扫描 · R 对接',
  'footer.credit': '全部素材程序化生成 · 零外部请求 · 自托管字体',
  'load.hint': '全部素材由程序实时生成 · 无外部网络请求',
  'pointer.title': '点击画面',
  'pointer.desc': '锁定鼠标以驾驶',

  /* ---------- HUD ---------- */
  'hud.shipName': '霜隙号',
  'hud.nearest': '最近目标',
  'hud.dockDist': '泊位距离',
  'hud.discovery': '已归档',
  'hud.heading': '航向',
  'hud.camMode': '驾驶模式',
  'hud.throttle': '推进',
  'hud.fuel': '燃料',
  'hud.hull': '船体',
  'hud.scan': '扫描',
  'hud.cam.cockpit': '座舱',
  'hud.cam.chase': '追尾',
  'hud.boost.idle': '后燃器待机',
  'hud.boost.on': '后燃器点火',
  'hud.key.thrust': '推进',
  'hud.key.lift': '升降',
  'hud.key.roll': '滚转',
  'hud.key.boost': '后燃',
  'hud.key.brake': '刹停',
  'hud.key.scan': '扫描',
  'hud.key.dock': '对接',
  'hud.key.starmap': '星图',
  'hud.key.view': '视角',
  'hud.key.help': '帮助',

  /* ---------- 教学提示 ---------- */
  'tutorial.0': 'W / S 前后推进 · A / D 平移',
  'tutorial.1': 'Space / Ctrl 升降 · Q / E 滚转',
  'tutorial.2': '鼠标控制俯仰与偏航',
  'tutorial.3': 'Shift 后燃器推进 · X 刹停',
  'tutorial.4': 'F 扫描天体 · M 打开星图',
  'tutorial.5': 'R 在灯塔站对接',

  /* ---------- 操作说明行 ---------- */
  'help.row.mouse': '俯仰 / 偏航（锁定指针后直接操控）',
  'help.row.drag': '未锁定指针时的转向备用方式',
  'help.row.ws': '向前 / 向后推进',
  'help.row.ad': '向左 / 向右平移',
  'help.row.lift': '上升 / 下降',
  'help.row.roll': '向左 / 向右滚转',
  'help.row.arrow': '俯仰 / 偏航（纯键盘操控）',
  'help.row.shift': '后燃器推进（消耗燃料）',
  'help.row.brake': '刹停（反推抵消速度）',
  'help.row.f': '扫描天体并归档',
  'help.row.r': '与灯塔站对接 / 脱离',
  'help.row.m': '打开星图并跃迁',
  'help.row.tab': '在菜单与面板之间移动焦点（不劫持）',
  'help.row.v': '座舱 / 追尾视角切换',
  'help.row.h': '打开本说明',
  'help.row.esc': '暂停 / 解除鼠标锁定',
  'help.row.backspace': '重置飞船姿态与位置',

  /* ---------- Toast ---------- */
  'toast.lockHint': '点击画面锁定鼠标；若锁定失败，可用拖拽或方向键操控',
  'toast.reset': '霜隙号已重置到泊位',
  'toast.camCockpit': '座舱视角',
  'toast.camChase': '追尾视角',
  'toast.undock': '已脱离泊位',
  'toast.dockTooFar': '距离泊位过远，无法对接',
  'toast.dockTooFast': '速度过高（{speed} m/s），按 X 刹车',
  'toast.dockDone': '对接完成 · 燃料加满 · 船体修复',
  'toast.noScanTarget': '扫描范围内没有可扫描的目标',
  'toast.scanStart': '开始扫描：{name}',
  'toast.scanLost': '目标已超出扫描范围，中断扫描',
  'toast.newRecord': '新登记：{name}',
  'toast.archived': '{name} 的资料已归档',
  'toast.routeLocked': '跃迁航线已锁定：{name}',
  'toast.warpDone': '跃迁完成：{name}',
  'toast.hullLost': '船体损毁 · 紧急拖回灯塔站（-150 信用点）',
  'toast.quality': '画质已切换',
  'toast.scanRunning': '扫描进行中',
  'toast.scanTarget': '扫描 {name}',

  /* ---------- 警告 / 其它 ---------- */
  'hud.unknown': '未知空域',
  'hud.berth': '泊位',
  'help.key.mouse': '鼠标移动',
  'help.key.drag': '鼠标拖拽',
  'help.key.arrow': '方向键',
  'journal.needScan': '需要扫描',
  'journal.needScanDesc': '靠近并使用扫描仪（F）以取得该目标的详细数据。',
  'journal.summary': '航程小结',
  'journal.stat': '已登记 {logged} / {total} 个目标 · 完成 {missions} 项任务 · 跃迁 {jumps} 次 · 对接 {docks} 次 · 累计航行 {distance} km · 信用点 {credits}',
  'scan.stat.radius': '半径',
  'scan.stat.distance': '距船',
  'scan.stat.kind': '类型',
  'scan.stat.time': '扫描时间',
  'warn.atmosphere': '进入{name}大气层 · 过热警告',
  'warn.impact': '撞击{name}地表 · 船体受损',
  'warn.approach': '接近{name}地表',

  /* ---------- 上下文提示（画布中央） ---------- */
  'prompt.warp': '跃迁进行中',
  'prompt.undock': '按 R 脱离泊位，开始这段航程',
  'prompt.dock': '按 R 与灯塔站对接',
  'prompt.slowDown': '减速到 {limit} m/s 以下才能对接（当前 {speed} m/s）',

  /* ---------- 碰撞 / 告警 ---------- */
  'warn.stationStructure': '撞击空间站结构',
  'warn.stationRing': '撞击空间站旋转环',
  'warn.kalsoArray': '撞击开普勒阵列',
  'warn.unknownStructure': '撞击未知结构',
  'warn.asteroid': '撞击小行星',
  'warn.lowFuel': '燃料不足 · 返回灯塔站补给',
  'warn.overheat': '船体过热 · 离开大气层',
  'warn.warpCharging': '跃迁充能中',
  'mfd.lowFuel': '燃料不足',

  /* ---------- 加载 ---------- */
  'load.generating': '正在生成天体系统',
  'load.rebuilding': '正在重建天体系统…',

  /* ---------- 标记 ---------- */
  'marker.star': '索尔·普莱姆',
};
