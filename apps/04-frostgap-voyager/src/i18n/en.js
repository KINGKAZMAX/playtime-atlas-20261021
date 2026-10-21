/**
 * 界面文案 · English (en)
 *
 * 依据 15-supervisor/RESTYLE-SPEC.md §4 / 16-design-system/DESIGN-SPEC.md §4.3。
 * 全部为本作自撰的英文改写，不复用任何第三方既有文本；键名与 zh.js 一一对应。
 */
export default {
  /* ---------- Main menu ---------- */
  'menu.start': 'Take the helm of FG-1',
  'menu.help': 'Controls',
  'menu.settings': 'Settings',
  'menu.journal': 'Voyage log',
  'menu.skip': 'Skip to the cockpit',
  'menu.scene': 'Cockpit view',
  'hud.logTitle': 'Voyage log',
  'menu.note': 'Click the view to lock the pointer. If the browser refuses, steering falls back to drag or arrow keys.',
  'menu.lore':
    'Lighthouse Station can fuel seven legs of this voyage.<br />' +
    'Your job is to fly the single-seat shuttle — <b>Frostgap FG-1</b> — ' +
    'across the gap, and log every body you meet in the voyage record.',

  /* ---------- Pause / settings ---------- */
  'pause.title': 'Flight paused',
  'pause.resume': 'Resume flight',
  'pause.help': 'Controls',
  'pause.reset': 'Reset ship',
  'pause.quit': 'Back to main menu',
  'set.quality': 'Graphics quality',
  'set.volume': 'Volume',
  'set.sensitivity': 'Mouse sensitivity',
  'set.fov': 'Field of view',
  'set.invertY': 'Invert Y axis',
  'set.assist': 'Flight assist (auto-damp when idle)',
  'set.mute': 'Mute',
  'set.quality.low': 'Low',
  'set.quality.medium': 'Medium',
  'set.quality.high': 'High',

  /* ---------- Star chart ---------- */
  'starmap.title': 'Stellar chart',
  'starmap.jump': 'Execute jump',
  'starmap.close': 'Close',
  'starmap.region': 'Region',
  'starmap.coords': 'Coordinates',

  /* ---------- Controls ---------- */
  'help.title': 'Controls',
  'help.note': 'The ship follows Newtonian inertia: thrust only accelerates, and releasing the stick does not stop you.',
  'help.close': 'Back',

  /* ---------- Voyage log ---------- */
  'journal.title': 'Voyage log',
  'journal.close': 'Back',
  'journal.unlogged': 'Unlogged body',

  /* ---------- Scan result ---------- */
  'scan.close': 'Close',
  'scan.kind.star': 'Star',
  'scan.kind.planet': 'Planet',
  'scan.kind.moon': 'Moon',
  'scan.kind.anomaly': 'Anomaly',
  'scan.kind.station': 'Station',
  'scan.kind.derelict': 'Derelict',

  /* ---------- Loading / pointer ---------- */
  'load.init': 'Initialising',
  /* Top bar / footer (G.2 .ds-topbar / .ds-footer) */
  'menu.tag': 'Playable · 6DOF',
  'footer.hint': 'Keyboard · Esc pause · M star map · F scan · R dock',
  'footer.credit': 'Everything generated at runtime · no external requests · self-hosted fonts',
  'load.hint': 'Every asset is generated at runtime · no network requests',
  'pointer.title': 'Click the view',
  'pointer.desc': 'Lock the pointer to fly',

  /* ---------- HUD ---------- */
  'hud.shipName': 'FG-1',
  'hud.nearest': 'Nearest target',
  'hud.dockDist': 'Berth range',
  'hud.discovery': 'Logged',
  'hud.heading': 'Heading',
  'hud.camMode': 'View mode',
  'hud.throttle': 'Thrust',
  'hud.fuel': 'Fuel',
  'hud.hull': 'Hull',
  'hud.scan': 'Scan',
  'hud.cam.cockpit': 'Cockpit',
  'hud.cam.chase': 'Chase',
  'hud.boost.idle': 'Burner standby',
  'hud.boost.on': 'Burner lit',
  'hud.key.thrust': 'Thrust',
  'hud.key.lift': 'Lift',
  'hud.key.roll': 'Roll',
  'hud.key.boost': 'Burner',
  'hud.key.brake': 'Brake',
  'hud.key.scan': 'Scan',
  'hud.key.dock': 'Dock',
  'hud.key.starmap': 'Chart',
  'hud.key.view': 'View',
  'hud.key.help': 'Help',

  /* ---------- Tutorial ---------- */
  'tutorial.0': 'W / S thrust · A / D strafe',
  'tutorial.1': 'Space / Ctrl lift · Q / E roll',
  'tutorial.2': 'Mouse pitches and yaws',
  'tutorial.3': 'Shift burner · X brake',
  'tutorial.4': 'F scan a body · M open the chart',
  'tutorial.5': 'R docks at Lighthouse Station',

  /* ---------- Control rows ---------- */
  'help.row.mouse': 'Pitch / yaw (direct control once the pointer is locked)',
  'help.row.drag': 'Fallback steering by dragging when the pointer is free',
  'help.row.ws': 'Thrust forward / back',
  'help.row.ad': 'Strafe left / right',
  'help.row.lift': 'Ascend / descend',
  'help.row.roll': 'Roll left / right',
  'help.row.arrow': 'Pitch / yaw (keyboard only)',
  'help.row.shift': 'Afterburner thrust (burns fuel)',
  'help.row.brake': 'Brake (retro-thrust to cancel speed)',
  'help.row.f': 'Scan a body and file it',
  'help.row.r': 'Dock / undock at Lighthouse Station',
  'help.row.m': 'Open the chart and jump',
  'help.row.tab': 'Move focus between menus and panels (never hijacked)',
  'help.row.v': 'Toggle cockpit / chase view',
  'help.row.h': 'Open this panel',
  'help.row.esc': 'Pause / release the pointer',
  'help.row.backspace': 'Reset ship attitude and position',

  /* ---------- Toasts ---------- */
  'toast.lockHint': 'Click the view to lock the pointer; if it fails, use drag or arrow keys',
  'toast.reset': 'FG-1 reset to the berth',
  'toast.camCockpit': 'Cockpit view',
  'toast.camChase': 'Chase view',
  'toast.undock': 'Undocked',
  'toast.dockTooFar': 'Berth is out of range',
  'toast.dockTooFast': 'Too fast ({speed} m/s) — press X to brake',
  'toast.dockDone': 'Docked · refuelled · hull repaired',
  'toast.noScanTarget': 'No scannable body in range',
  'toast.scanStart': 'Scanning: {name}',
  'toast.scanLost': 'Target left scan range — scan aborted',
  'toast.newRecord': 'New entry: {name}',
  'toast.archived': '{name} filed in the voyage record',
  'toast.routeLocked': 'Jump route locked: {name}',
  'toast.warpDone': 'Jump complete: {name}',
  'toast.hullLost': 'Hull destroyed · emergency tow to Lighthouse Station (−150 credits)',
  'toast.quality': 'Graphics quality switched',
  'toast.scanRunning': 'Scan in progress',
  'toast.scanTarget': 'Scanning {name}',

  /* ---------- Warnings / misc ---------- */
  'hud.unknown': 'Unknown airspace',
  'hud.berth': 'Berth',
  'help.key.mouse': 'Mouse move',
  'help.key.drag': 'Mouse drag',
  'help.key.arrow': 'Arrow keys',
  'journal.needScan': 'Scan required',
  'journal.needScanDesc': 'Close in and use the scanner (F) to pull detailed data on this body.',
  'journal.summary': 'Voyage summary',
  'journal.stat': '{logged} / {total} bodies logged · {missions} missions completed · {jumps} jumps · {docks} dockings · {distance} km flown · {credits} credits',
  'scan.stat.radius': 'Radius',
  'scan.stat.distance': 'Range',
  'scan.stat.kind': 'Type',
  'scan.stat.time': 'Scanned at',
  'warn.atmosphere': 'Entering the {name} atmosphere · overheat warning',
  'warn.impact': 'Impact with the {name} surface · hull damage',
  'warn.approach': 'Approaching the {name} surface',

  /* ---------- Context prompts (canvas centre) ---------- */
  'prompt.warp': 'Jump in progress',
  'prompt.undock': 'Press R to leave the berth and begin the voyage',
  'prompt.dock': 'Press R to dock with Lighthouse Station',
  'prompt.slowDown': 'Slow below {limit} m/s to dock (currently {speed} m/s)',

  /* ---------- Collisions / alerts ---------- */
  'warn.stationStructure': 'Collision with the station structure',
  'warn.stationRing': 'Collision with the station’s rotating ring',
  'warn.kalsoArray': 'Collision with the Kalso Array',
  'warn.unknownStructure': 'Collision with an unknown structure',
  'warn.asteroid': 'Asteroid impact',
  'warn.lowFuel': 'Low fuel · return to Lighthouse Station for refuelling',
  'warn.overheat': 'Hull overheating · leave the atmosphere',
  'warn.warpCharging': 'Jump charging',
  'mfd.lowFuel': 'LOW FUEL',

  /* ---------- Loading ---------- */
  'load.generating': 'Generating the star system',
  'load.rebuilding': 'Rebuilding the star system…',

  /* ---------- Markers ---------- */
  'marker.star': 'Sol Prime',
};
