/**
 * 折光纪 · 文案骨架（中文源文案）
 *
 * 约定：
 *   - 键名使用点分层级：`<域>.<子域>.<键>`，全小写下划线风格不混用中文；
 *   - 本文件是**中文的权威来源**，与页面现有文案逐字一致；
 *   - 插值统一用 `{name}` 占位，由 `t()` 替换；
 *   - 只有「界面骨架文案」（导航 / 页脚 / 设置 / HUD 标签 / 按钮 / 提示语）进入骨架；
 *     作品正文、史料条目、关卡叙事、热点长文属于**内容型文案**，
 *     它们随展项内容演进，暂不入骨架（见 i18n/README.md 的范围说明）。
 */

/** @type {Record<string, string>} */
export const zh = {
  /* ---------------- 品牌 / 导航 ---------------- */
  'brand.cn': '折光纪',
  'brand.en': 'PRISM ERA',
  'brand.aria': '返回折光纪展厅首页',
  'nav.aria': '展厅导航',
  'nav.hall': '展厅',
  'nav.pulse': '脉冲走廊',
  'nav.atrium': '折光阁',
  'nav.halo': '光环台',
  'title.hall': '折光纪 · 当代可玩展厅',
  'title.pulse': '脉冲走廊 · 节奏反应 | PRISM ERA',
  'title.atrium': '折光阁 · 空间解谜 | PRISM ERA',
  'title.halo': '光环台 · 桌面观景台 | PRISM ERA',
  'title.default': '折光纪 · 当代可玩展厅 | PRISM ERA',

  /* ---------------- 通用 ---------------- */
  'common.back': '← 返回展厅',
  'common.returnHall': '返回展厅',

  /* ---------------- 页脚 ---------------- */
  'footer.note.1': '折光纪 · 当代可玩展厅 —— 回响电玩馆（PLYTIME ATLAS）现代时代分厅。',
  'footer.note.2':
    '本厅全部作品名、文案、音乐、视觉与关卡均为原创，仅参考公开作品的机制与品质标准；不含任何未授权 ROM、商业游戏资源或品牌视觉。',
  'footer.note.3': '《光环台》为桌面端交互演示，不支持 VR 头显。史料来源见展厅内各条目的链接。',

  /* ---------------- 设置面板 ---------------- */
  'settings.open': '设置',
  'settings.title': '展厅设置',
  'settings.desc': '所有设置与成绩都保存在本机浏览器中，不上传任何数据。',
  'settings.switch.muted.label': '静音',
  'settings.switch.muted.hint': '关闭全部音频输出。游戏判定不受影响。',
  'settings.switch.visualPulse.label': '视觉节拍模式',
  'settings.switch.visualPulse.hint': '完全不使用音频：节拍改由收缩节拍环、轨道脉冲与拍点标尺表达。',
  'settings.switch.reducedMotion.label': '减少动效',
  'settings.switch.reducedMotion.hint': '以平滑过渡替代闪烁与位移动画。',
  'settings.switch.highContrast.label': '高对比',
  'settings.switch.highContrast.hint': '提高前景与背景对比度。',
  'settings.offset.label': '判定校准',
  'settings.offset.hint': '若敲击感觉偏早或偏晚，可在此微调节奏判定窗口。',
  'settings.offset.aria': '判定校准偏移（毫秒）',
  'settings.action.clear': '清除全部存档',
  'settings.action.reset': '恢复默认设置',
  'settings.action.done': '完成',
  'settings.toast.cleared': '存档与设置已清除',
  'settings.toast.reset': '设置已恢复默认',
  'settings.switch.on': '已开启',
  'settings.switch.off': '已关闭',

  /* ---------------- 展厅主站 ---------------- */
  'hall.hero.eyebrow': '回响电玩馆 · 现代时代分厅',
  'hall.hero.sub': 'PRISM ERA · 2010s — NOW',
  'hall.hero.lead':
    '当游戏离开客厅、进入口袋、缠上手腕、罩住双眼，一整套新的身体经验被建立起来。折光纪收集这段历史里的三件可玩展品：节奏反应、空间解谜，以及一座诚实的桌面观景台。',
  'hall.hero.cta.pulse': '进入《脉冲走廊》',
  'hall.hero.cta.atrium': '进入《折光阁》',
  'hall.hero.cta.halo': '进入《光环台》',
  'hall.index.exhibits': '01 / EXHIBITS',
  'hall.index.threads': '02 / THREADS',
  'hall.index.timeline': '03 / TIMELINE',
  'hall.index.catalog': '04 / CATALOG',
  'hall.index.notes': '05 / NOTES',
  'hall.section.exhibits.title': '三件可玩展品',
  'hall.section.exhibits.sub':
    '全部为本厅原创：没有复刻任何具体作品，只借用了公开作品成熟的机制与品质标准。',
  'hall.section.threads.title': '这一时代的四条线索',
  'hall.section.threads.sub':
    '触屏化、独立化、服务化、沉浸化——它们共同决定了 2010 年以后游戏长成的样子。',
  'hall.section.timeline.title': '2010 — 2026 时间轴',
  'hall.section.timeline.sub': '代表性选样，而非编年全集。年份、平台与厂商信息均以官方或一手来源为准。',
  'hall.section.catalog.title': '纯文本目录',
  'hall.section.catalog.sub': '不使用图形界面的阅读方式：展项与全部史料条目的可读列表。',
  'hall.section.notes.title': '关于本厅',
  'hall.exhibit.go': '进入展项 →',
  'hall.notice.original.title': '原创声明：',
  'hall.notice.original.body':
    '本厅的命名、文案、音乐、视觉、布局与关卡均为原创作品，参考的是公开作品成熟的机制与品质标准，不声称原创任何参考作品，也不复制任何未授权 ROM、商业游戏资源或品牌视觉。',
  'hall.notice.halo.title': '《光环台》说明：',
  'hall.notice.halo.body':
    '该展项是桌面端交互演示，使用鼠标拖拽与键盘模拟头部转动，未接入 WebXR，不支持 VR 头显。展台内提供「检测本机 WebXR 沉浸式 VR 支持」按钮，其结果来自浏览器真实返回值。',
  'hall.notice.sources.title': '来源与限制：',
  'hall.notice.sources.body':
    '时间轴共 24 条，全部链接已于 2026-10-21 核验可达；本厅未使用任何图片素材，页面图形均为程序化绘制。',

  /* ---------------- 脉冲走廊 ---------------- */
  'pulse.exhibit.no': 'EXHIBIT 01',
  'pulse.head.sub': 'PULSE CORRIDOR · 节奏反应',
  'pulse.mode.chart': '谱面模式',
  'pulse.mode.drill': '反应训练',
  'pulse.mode.hybrid': '混合模式',
  'pulse.setup.mode.title': '选择模式',
  'pulse.setup.track.title': '选择曲目',
  'pulse.setup.audio.title': '播放设置',
  'pulse.setup.track.hint': '反应训练模式不需要曲目。',
  'pulse.setup.visual.label': '视觉节拍模式（静音替代）',
  'pulse.setup.visual.hint': '完全不发声，用视觉节拍代替音乐。',
  'pulse.setup.visual.aria': '视觉节拍模式',
  'pulse.setup.note.silent':
    '视觉节拍模式已开启：本次不产生任何声音，节拍由收缩节拍环、下行光带与顶部拍点标尺表达。判定精度与有声模式一致。',
  'pulse.setup.note.muted':
    '当前为全局静音：不发出声音，但节拍提示仍然完整（收缩节拍环 + 下行光带 + 拍点标尺）。',
  'pulse.setup.note.default':
    '点击「开始」后才会创建并启动音频（浏览器要求用户手势）。音量为程序化实时合成，无音频文件。',
  'pulse.setup.start': '开始',
  'pulse.setup.starting': '准备中…',
  'pulse.setup.keys': '轨道键：',
  'pulse.setup.keys.esc': '暂停',
  'pulse.setup.keys.r': '重开',
  'pulse.setup.best': '最佳 {score}',
  'pulse.hud.score': '分数',
  'pulse.hud.combo': '连击',
  'pulse.hud.accuracy': '准度',
  'pulse.hud.judge': '判定',
  'pulse.action.pause': '暂停',
  'pulse.action.resume': '继续',
  'pulse.action.restart': '重开',
  'pulse.pause.title': '已暂停',
  'pulse.pause.hint': '按 Esc 或点击下方按钮继续。',
  'pulse.pause.restart': '重新开始',
  'pulse.result.title': '本局结束',
  'pulse.result.drill.title': '反应训练结束',
  'pulse.result.drill.desc': '反应训练不计分，专注在「看准 → 判断 → 动手」这一段链路的时间。',
  'pulse.result.score': '分数',
  'pulse.result.maxCombo': '最大连击',
  'pulse.result.accuracy': '准度',
  'pulse.result.perfectGreat': '极准 / 很准',
  'pulse.result.goodMiss': '尚可 / 失手',
  'pulse.result.best': '最佳',
  'pulse.result.cueCount': '提示次数',
  'pulse.result.hitRate': '成功响应',
  'pulse.result.median': '中位反应时',
  'pulse.result.fastest': '最快',
  'pulse.result.slowest': '最慢',
  'pulse.result.average': '平均',
  'pulse.foot': '节拍由「下行光带」提前预告：光带抵达判定线的那一刻就是节拍点。',

  /* ---------------- 折光阁 ---------------- */
  'atrium.exhibit.no': 'EXHIBIT 02',
  'atrium.head.sub': 'PRISM ATRIUM · 空间解谜',
  'atrium.hud.time': '用时',
  'atrium.hud.motes': '光点',
  'atrium.hud.receivers': '接收环',
  'atrium.action.undo': '撤销',
  'atrium.action.hint': '提示',
  'atrium.action.reset': '重置',
  'atrium.action.view': '视角复位',
  'atrium.legend.cyan': '青光接收环',
  'atrium.legend.magenta': '品红光接收环',
  'atrium.legend.splitter': '分光镜',
  'atrium.help.move': 'WASD / 方向键 移动',
  'atrium.help.rotate': '点击元件或按 E 旋转',
  'atrium.help.tab': 'Tab 切换目标',
  'atrium.help.view': '拖拽 旋转视角 · 滚轮 缩放',
  'atrium.elem.mirror': '反光板',
  'atrium.elem.splitter': '分光镜',
  'atrium.elem.dispersion': '色散棱镜',
  'atrium.sel': '已选中：{name}（按 E 旋转）',
  'atrium.result.time': '用时',
  'atrium.result.motes': '光点',
  'atrium.result.best': '最佳用时',
  'atrium.result.rating': '评级',
  'atrium.result.again': '再玩一次',
  'atrium.result.next': '下一关：{name}',
  'atrium.result.toPulse': '回到《脉冲走廊》',
  'atrium.toast.tooFar': '离得太远了 —— 走到它旁边再旋转',
  'atrium.toast.noUndo': '没有可撤销的操作了',
  'atrium.toast.undone': '已撤销上一步',
  'atrium.toast.hintUsedUp': '本关提示次数已用完（3 次）',
  'atrium.toast.hintNone': '当前所有元件都已在推荐朝向上——问题可能在别处',
  'atrium.toast.reset': '本关已重置',
  'atrium.receiver.lit': '已点亮',
  'atrium.receiver.mismatch': '颜色不符',
  'atrium.receiver.dark': '未点亮',

  /* ---------------- 光环台 ---------------- */
  'halo.exhibit.no': 'EXHIBIT 03',
  'halo.head.sub': 'HALO DECK · 桌面观景台',
  'halo.disclaimer.title': '桌面端交互演示：',
  'halo.disclaimer.body':
    '本展项用鼠标拖拽与键盘模拟头部转动，未接入 WebXR，不支持 VR 头显，也没有立体渲染与手柄追踪。它是「沉浸式展陈的交互模型」演示，而不是 VR 应用。',
  'halo.panel.deviceTitle': '本展项的设备支持：',
  'halo.panel.deviceStatus': '设备支持状态',
  'halo.panel.item.stereo': '立体渲染 / 手柄追踪：',
  'halo.panel.item.stereoValue': '未实现',
  'halo.panel.item.input': '交互方式：',
  'halo.panel.item.inputValue': '鼠标拖拽环视 · 滚轮变焦 · WASD 移动',
  'halo.panel.detect': '检测本机 WebXR 沉浸式 VR 支持',
  'halo.panel.detecting': '检测中…',
  'halo.panel.foot': '展签内容引自公开的一手与官方来源，点击卡片中的链接可前往原文。',
};

export default zh;
