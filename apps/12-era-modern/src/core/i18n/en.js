/**
 * 折光纪 · 文案骨架（英文）
 *
 * 与 `zh.js` 保持**完全相同的键集合**（由 `scripts/check-i18n.mjs` 强制校验）。
 * 缺失的英文条目一律回落到中文源文案，不允许出现空白或占位符。
 *
 * 注意：作品名（脉冲走廊 / PULSE CORRIDOR 等）与品牌名沿用页面既有的双语并置形式，
 * 不在此处翻译；史料条目、关卡叙事与热点长文属于内容型文案，暂不入骨架。
 */

/** @type {Record<string, string>} */
export const en = {
  /* ---------------- Brand / navigation ---------------- */
  'brand.cn': '折光纪',
  'brand.en': 'PRISM ERA',
  'brand.aria': 'Back to the Prism Era hall',
  'nav.aria': 'Hall navigation',
  'nav.hall': 'Hall',
  'nav.pulse': 'Pulse Corridor',
  'nav.atrium': 'Prism Atrium',
  'nav.halo': 'Halo Deck',
  'title.hall': 'Prism Era · Contemporary Playable Hall',
  'title.pulse': 'Pulse Corridor · Rhythm Reaction | PRISM ERA',
  'title.atrium': 'Prism Atrium · Spatial Puzzle | PRISM ERA',
  'title.halo': 'Halo Deck · Desktop Viewing Deck | PRISM ERA',
  'title.default': 'Prism Era · Contemporary Playable Hall | PRISM ERA',

  /* ---------------- Common ---------------- */
  'common.back': '← Back to hall',
  'common.returnHall': 'Back to hall',

  /* ---------------- Footer ---------------- */
  'footer.note.1':
    'Prism Era · Contemporary Playable Hall — the modern-era wing of the Echo Arcade (PLYTIME ATLAS).',
  'footer.note.2':
    'Every title, piece of writing, track, visual and level in this hall is original. Only the mechanics and quality standards of public works are referenced; no unlicensed ROM, commercial game asset or brand visual is included.',
  'footer.note.3':
    'Halo Deck is a desktop interaction demo and does not support VR headsets. Sources are linked from each entry in the hall.',

  /* ---------------- Settings panel ---------------- */
  'settings.open': 'Settings',
  'settings.title': 'Hall settings',
  'settings.desc':
    'All settings and scores are stored in this browser only. Nothing is uploaded.',
  'settings.switch.muted.label': 'Mute',
  'settings.switch.muted.hint': 'Turns off all audio output. Judgement is unaffected.',
  'settings.switch.visualPulse.label': 'Visual beat mode',
  'settings.switch.visualPulse.hint':
    'Uses no audio at all: the beat is shown by the contracting beat ring, lane pulses and the beat ruler.',
  'settings.switch.reducedMotion.label': 'Reduce motion',
  'settings.switch.reducedMotion.hint': 'Replaces flicker and movement with smooth transitions.',
  'settings.switch.highContrast.label': 'High contrast',
  'settings.switch.highContrast.hint': 'Raises foreground/background contrast.',
  'settings.offset.label': 'Judgement calibration',
  'settings.offset.hint': 'Nudge the rhythm judgement window if your hits feel early or late.',
  'settings.offset.aria': 'Judgement calibration offset (milliseconds)',
  'settings.action.clear': 'Clear all saved data',
  'settings.action.reset': 'Restore default settings',
  'settings.action.done': 'Done',
  'settings.toast.cleared': 'Saved data and settings cleared',
  'settings.toast.reset': 'Settings restored to default',
  'settings.switch.on': 'on',
  'settings.switch.off': 'off',

  /* ---------------- Hall ---------------- */
  'hall.hero.eyebrow': 'Echo Arcade · Modern era wing',
  'hall.hero.sub': 'PRISM ERA · 2010s — NOW',
  'hall.hero.lead':
    'When games left the living room, moved into pockets, wrapped around wrists and covered the eyes, an entirely new set of bodily experiences was established. Prism Era collects three playable exhibits from that history: rhythm reaction, a spatial puzzle, and an honest desktop viewing deck.',
  'hall.hero.cta.pulse': 'Enter Pulse Corridor',
  'hall.hero.cta.atrium': 'Enter Prism Atrium',
  'hall.hero.cta.halo': 'Enter Halo Deck',
  'hall.index.exhibits': '01 / EXHIBITS',
  'hall.index.threads': '02 / THREADS',
  'hall.index.timeline': '03 / TIMELINE',
  'hall.index.catalog': '04 / CATALOG',
  'hall.index.notes': '05 / NOTES',
  'hall.section.exhibits.title': 'Three playable exhibits',
  'hall.section.exhibits.sub':
    'All original to this hall: no specific work is reimplemented, only the mature mechanics and quality standards of public works are borrowed.',
  'hall.section.threads.title': 'Four threads of this era',
  'hall.section.threads.sub':
    'Touch-first, independent, service-based and immersive — together they decided what games became after 2010.',
  'hall.section.timeline.title': '2010 — 2026 timeline',
  'hall.section.timeline.sub':
    'A representative sample rather than a complete chronology. Years, platforms and makers follow official or primary sources.',
  'hall.section.catalog.title': 'Plain-text catalogue',
  'hall.section.catalog.sub':
    'A way to read without graphics: a readable list of the exhibits and every historical entry.',
  'hall.section.notes.title': 'About this hall',
  'hall.exhibit.go': 'Enter exhibit →',
  'hall.notice.original.title': 'Originality statement: ',
  'hall.notice.original.body':
    'The naming, writing, music, visuals, layout and levels of this hall are original works. They reference the mature mechanics and quality standards of public works, claim originality over no referenced work, and copy no unlicensed ROM, commercial game asset or brand visual.',
  'hall.notice.halo.title': 'About Halo Deck: ',
  'hall.notice.halo.body':
    'This exhibit is a desktop interaction demo. It uses mouse dragging and keyboard look control, does not implement WebXR and does not support VR headsets. The deck offers a "detect this machine’s immersive VR support" button whose result comes from the browser’s real return value.',
  'hall.notice.sources.title': 'Sources and limits: ',
  'hall.notice.sources.body':
    'The timeline holds 24 entries; every link was verified reachable on 2026-10-21. This hall uses no image assets — all page graphics are drawn procedurally.',

  /* ---------------- Pulse Corridor ---------------- */
  'pulse.exhibit.no': 'EXHIBIT 01',
  'pulse.head.sub': 'PULSE CORRIDOR · Rhythm reaction',
  'pulse.mode.chart': 'Chart mode',
  'pulse.mode.drill': 'Reaction drill',
  'pulse.mode.hybrid': 'Hybrid mode',
  'pulse.setup.mode.title': 'Choose a mode',
  'pulse.setup.track.title': 'Choose a track',
  'pulse.setup.audio.title': 'Playback settings',
  'pulse.setup.track.hint': 'Reaction drill needs no track.',
  'pulse.setup.visual.label': 'Visual beat mode (silent substitute)',
  'pulse.setup.visual.hint': 'No sound at all — the beat is carried by light instead of music.',
  'pulse.setup.visual.aria': 'Visual beat mode',
  'pulse.setup.note.silent':
    'Visual beat mode is on: nothing will be played, and the beat is expressed by the contracting beat ring, the descending light band and the beat ruler at the top. Judgement precision matches the audio mode.',
  'pulse.setup.note.muted':
    'Globally muted: no sound is produced, but the beat cues stay complete (beat ring + descending light band + beat ruler).',
  'pulse.setup.note.default':
    'Audio is only created and started after you press Start (browsers require a user gesture). The volume is synthesised live; there are no audio files.',
  'pulse.setup.start': 'Start',
  'pulse.setup.starting': 'Preparing…',
  'pulse.setup.keys': 'Lane keys: ',
  'pulse.setup.keys.esc': 'pause',
  'pulse.setup.keys.r': 'restart',
  'pulse.setup.best': 'Best {score}',
  'pulse.hud.score': 'Score',
  'pulse.hud.combo': 'Combo',
  'pulse.hud.accuracy': 'Accuracy',
  'pulse.hud.judge': 'Judgement',
  'pulse.action.pause': 'Pause',
  'pulse.action.resume': 'Resume',
  'pulse.action.restart': 'Restart',
  'pulse.pause.title': 'Paused',
  'pulse.pause.hint': 'Press Esc or click the button below to continue.',
  'pulse.pause.restart': 'Restart run',
  'pulse.result.title': 'Run complete',
  'pulse.result.drill.title': 'Reaction drill complete',
  'pulse.result.drill.desc':
    'Reaction drill is not scored — it focuses on the time from "read the cue" to "decide" to "act".',
  'pulse.result.score': 'Score',
  'pulse.result.maxCombo': 'Max combo',
  'pulse.result.accuracy': 'Accuracy',
  'pulse.result.perfectGreat': 'Perfect / Great',
  'pulse.result.goodMiss': 'Good / Miss',
  'pulse.result.best': 'Best',
  'pulse.result.cueCount': 'Cues',
  'pulse.result.hitRate': 'Responded',
  'pulse.result.median': 'Median reaction',
  'pulse.result.fastest': 'Fastest',
  'pulse.result.slowest': 'Slowest',
  'pulse.result.average': 'Average',
  'pulse.foot':
    'The beat is announced ahead of time by the descending light band: the moment the band reaches the judgement line is the beat.',

  /* ---------------- Prism Atrium ---------------- */
  'atrium.exhibit.no': 'EXHIBIT 02',
  'atrium.head.sub': 'PRISM ATRIUM · Spatial puzzle',
  'atrium.hud.time': 'Time',
  'atrium.hud.motes': 'Motes',
  'atrium.hud.receivers': 'Receivers',
  'atrium.action.undo': 'Undo',
  'atrium.action.hint': 'Hint',
  'atrium.action.reset': 'Reset',
  'atrium.action.view': 'Reset view',
  'atrium.legend.cyan': 'Cyan receiver',
  'atrium.legend.magenta': 'Magenta receiver',
  'atrium.legend.splitter': 'Splitter',
  'atrium.help.move': 'WASD / arrow keys to move',
  'atrium.help.rotate': 'Click an element or press E to rotate',
  'atrium.help.tab': 'Tab to cycle targets',
  'atrium.help.view': 'Drag to orbit · scroll to zoom',
  'atrium.elem.mirror': 'mirror',
  'atrium.elem.splitter': 'splitter',
  'atrium.elem.dispersion': 'dispersion prism',
  'atrium.sel': 'Selected: {name} (press E to rotate)',
  'atrium.result.time': 'Time',
  'atrium.result.motes': 'Motes',
  'atrium.result.best': 'Best time',
  'atrium.result.rating': 'Rating',
  'atrium.result.again': 'Play again',
  'atrium.result.next': 'Next level: {name}',
  'atrium.result.toPulse': 'Back to Pulse Corridor',
  'atrium.toast.tooFar': 'Too far — walk up to it before rotating',
  'atrium.toast.noUndo': 'Nothing left to undo',
  'atrium.toast.undone': 'Undid the last step',
  'atrium.toast.hintUsedUp': 'No hints left for this level (3 total)',
  'atrium.toast.hintNone':
    'Every element is already on its recommended facing — the problem lies elsewhere',
  'atrium.toast.reset': 'Level reset',
  'atrium.receiver.lit': 'Lit',
  'atrium.receiver.mismatch': 'Wrong colour',
  'atrium.receiver.dark': 'Not lit',

  /* ---------------- Halo Deck ---------------- */
  'halo.exhibit.no': 'EXHIBIT 03',
  'halo.head.sub': 'HALO DECK · Desktop viewing deck',
  'halo.disclaimer.title': 'Desktop interaction demo: ',
  'halo.disclaimer.body':
    'This exhibit simulates head movement with mouse dragging and keyboard. It does not implement WebXR, does not support VR headsets, and has no stereoscopic rendering or hand tracking. It demonstrates an "interaction model for immersive exhibition", not a VR application.',
  'halo.panel.deviceTitle': 'Device support for this exhibit:',
  'halo.panel.deviceStatus': 'Device support status',
  'halo.panel.item.stereo': 'Stereoscopic rendering / hand tracking: ',
  'halo.panel.item.stereoValue': 'Not implemented',
  'halo.panel.item.input': 'Interaction: ',
  'halo.panel.item.inputValue': 'Drag to look around · scroll to zoom · WASD to move',
  'halo.panel.detect': 'Detect this machine’s immersive VR support',
  'halo.panel.detecting': 'Detecting…',
  'halo.panel.foot':
    'The exhibit labels quote public primary and official sources; follow the links on a card to read the original.',
};

export default en;
