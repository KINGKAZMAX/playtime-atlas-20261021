(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();const Ka="prismera.v1.";function Hc(){try{const i=`${Ka}__probe`;return window.localStorage.setItem(i,"1"),window.localStorage.removeItem(i),!0}catch{return!1}}const Xl=Hc(),ta=new Map;function ql(i,t=null){const e=Ka+i;try{const n=Xl?window.localStorage.getItem(e):ta.get(e);return n==null?t:JSON.parse(n)}catch(n){return console.warn(`[store] read failed for ${i}, using fallback`,n),t}}function $a(i,t){const e=Ka+i,n=JSON.stringify(t);try{return Xl?window.localStorage.setItem(e,n):ta.set(e,n),!0}catch(s){return console.warn(`[store] write failed for ${i}`,s),ta.set(e,n),!1}}function Gc(){const i=new Map;function t(r,a){return i.has(r)||i.set(r,new Set),i.get(r).add(a),()=>n(r,a)}function e(r,a){const o=t(r,l=>{o(),a(l)});return o}function n(r,a){const o=i.get(r);o&&o.delete(a)}function s(r,a){const o=i.get(r);if(o)for(const l of Array.from(o))try{l(a)}catch(c){console.error(`[bus] handler failed for "${r}"`,c)}}return{on:t,once:e,off:n,emit:s}}const wi=Gc(),ja="settings",Gs={muted:!1,visualPulse:!1,reducedMotion:!1,highContrast:!1,offsetMs:0,showFps:!1};let Te={...Gs,...ql(ja,{})||{}};(typeof Te.offsetMs!="number"||!Number.isFinite(Te.offsetMs))&&(Te.offsetMs=0);Te.offsetMs=Math.max(-200,Math.min(200,Math.round(Te.offsetMs)));function Ge(){return{...Te}}function Vs(i,t){if(!(i in Gs))return;const e={...Te,[i]:t};e.offsetMs!==Te.offsetMs&&(e.offsetMs=Math.max(-200,Math.min(200,Math.round(Number(e.offsetMs)||0))));const n=Object.keys(e).filter(s=>e[s]!==Te[s]);n.length&&(Te=e,$a(ja,Te),n.forEach(s=>wi.emit(`settings:${s}`,Te[s])),wi.emit("settings:change",Ge()))}function Ao(){Te={...Gs},$a(ja,Te),wi.emit("settings:change",Ge()),Object.keys(Gs).forEach(i=>wi.emit(`settings:${i}`,Te[i]))}function Ro(i=Ge()){const t=document.documentElement;t.dataset.muted=String(i.muted),t.dataset.visualPulse=String(i.visualPulse),t.dataset.reducedMotion=String(i.reducedMotion),i.reducedMotion?t.setAttribute("data-rm","reduce"):t.removeAttribute("data-rm"),t.dataset.highContrast=String(i.highContrast)}const lr=['400 12px "Inter"','700 12px "Space Grotesk"','400 12px "Space Mono"','700 12px "Space Mono"'];let Co=!1;function Yl(){return Co?Promise.resolve(lr.slice()):typeof document>"u"||!document.fonts?Promise.resolve([]):Promise.all(lr.map(i=>document.fonts.load(i).then(()=>i).catch(()=>null))).then(i=>{const t=i.filter(Boolean);return t.length===lr.length&&(Co=!0),t})}const cr={state:"idle",route:"/",chapter:null,score:0,combo:0,player:{x:0,y:0,lane:-1,presses:0},extra:{}};let Po=!1;const Vc="__eraGame";function Wc(){if(Po)return cr;try{window[Vc]=cr,Po=!0}catch{}return cr}function qn(i){const t=Wc();for(const[e,n]of Object.entries(i||{}))t[e]=n;return t}const Xc=(i,t=document)=>Array.from(t.querySelectorAll(i));function M(i,t=null,...e){const[n,...s]=String(i).split("."),r=document.createElement(n||"div");if(s.length&&(r.className=s.join(" ")),t&&typeof t=="object"&&!(t instanceof Node)&&!Array.isArray(t))for(const[a,o]of Object.entries(t))o==null||o===!1||(a==="class"||a==="className"?r.className=`${r.className} ${o}`.trim():a==="text"?r.textContent=String(o):a==="html"?r.innerHTML=String(o):a==="style"&&typeof o=="object"?Object.assign(r.style,o):a==="dataset"&&typeof o=="object"?Object.assign(r.dataset,o):a.startsWith("on")&&typeof o=="function"?r.addEventListener(a.slice(2).toLowerCase(),o):o===!0?r.setAttribute(a,""):r.setAttribute(a,String(o)));else t!=null&&e.unshift(t);for(const a of e.flat(1/0))a==null||a===!1||r.appendChild(a instanceof Node?a:document.createTextNode(String(a)));return r}function ue(i){for(;i&&i.firstChild;)i.removeChild(i.firstChild);return i}function qc(i){const t='a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';function e(n){if(n.key!=="Tab")return;const s=Xc(t,i).filter(o=>o.offsetParent!==null||o===document.activeElement);if(!s.length)return;const r=s[0],a=s[s.length-1];n.shiftKey&&document.activeElement===r?(n.preventDefault(),a.focus()):!n.shiftKey&&document.activeElement===a&&(n.preventDefault(),r.focus())}return i.addEventListener("keydown",e),()=>i.removeEventListener("keydown",e)}function is(i){if(!Number.isFinite(i)||i<0)return"--:--";const t=Math.floor(i/1e3),e=Math.floor(t/60),n=t%60;return`${String(e).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function Zs(i=!1){try{window.scrollTo({top:0,left:0,behavior:i?"smooth":"auto"})}catch{window.scrollTo(0,0)}}const Kl="progress",Yc={puzzle:{current:"corridor"}};function $l(i){const t=i&&typeof i=="object"?i:{};return{version:1,rhythm:t.rhythm&&typeof t.rhythm=="object"?t.rhythm:{},puzzle:{current:t.puzzle?.current||Yc.puzzle.current,completed:t.puzzle?.completed&&typeof t.puzzle.completed=="object"?t.puzzle.completed:{},hintsUsed:t.puzzle?.hintsUsed&&typeof t.puzzle.hintsUsed=="object"?t.puzzle.hintsUsed:{}},visited:t.visited&&typeof t.visited=="object"?t.visited:{}}}let xe=$l(ql(Kl,null));function Di(){$a(Kl,xe),wi.emit("progress:change",Kc())}function Kc(){return JSON.parse(JSON.stringify(xe))}function $c(i,t){const e=xe.rhythm[i]||{bestScore:0,bestCombo:0,bestAccuracy:0,plays:0,bestReactionMs:null},n={bestScore:Math.max(e.bestScore||0,t.score||0),bestCombo:Math.max(e.bestCombo||0,t.maxCombo||0),bestAccuracy:Math.max(e.bestAccuracy||0,t.accuracy||0),bestReactionMs:e.bestReactionMs==null?t.reactionMs??null:Math.min(e.bestReactionMs,t.reactionMs??e.bestReactionMs),plays:(e.plays||0)+1};return xe.rhythm[i]=n,Di(),n}function jc(i){return xe.rhythm[i]||null}function Zc(){return xe.puzzle}function Jc(i){xe.puzzle.current=i,Di()}function Qc(i,{timeMs:t,motes:e,totalMotes:n}){const s=xe.puzzle.completed[i],r=e>=n?3:e>0?2:1,a={timeMs:s?Math.min(s.timeMs,t):t,motes:Math.max(s?.motes||0,e),stars:Math.max(s?.stars||0,r)};return xe.puzzle.completed[i]=a,Di(),a}function th(i){return xe.puzzle.hintsUsed[i]=(xe.puzzle.hintsUsed[i]||0)+1,Di(),xe.puzzle.hintsUsed[i]}function eh(i){return xe.puzzle.hintsUsed[i]||0}function nh(i){return!!xe.puzzle.completed[i]}function Js(i){xe.visited[i]||(xe.visited[i]=Date.now(),Di())}function ih(){xe=$l(null),Di()}const sh={"brand.cn":"折光纪","brand.en":"PRISM ERA","brand.aria":"返回折光纪展厅首页","nav.aria":"展厅导航","nav.hall":"展厅","nav.pulse":"脉冲走廊","nav.atrium":"折光阁","nav.halo":"光环台","title.hall":"折光纪 · 当代可玩展厅","title.pulse":"脉冲走廊 · 节奏反应 | PRISM ERA","title.atrium":"折光阁 · 空间解谜 | PRISM ERA","title.halo":"光环台 · 桌面观景台 | PRISM ERA","title.default":"折光纪 · 当代可玩展厅 | PRISM ERA","common.back":"← 返回展厅","common.returnHall":"返回展厅","footer.note.1":"折光纪 · 当代可玩展厅 —— 回响电玩馆（PLYTIME ATLAS）现代时代分厅。","footer.note.2":"本厅全部作品名、文案、音乐、视觉与关卡均为原创，仅参考公开作品的机制与品质标准；不含任何未授权 ROM、商业游戏资源或品牌视觉。","footer.note.3":"《光环台》为桌面端交互演示，不支持 VR 头显。史料来源见展厅内各条目的链接。","settings.open":"设置","settings.title":"展厅设置","settings.desc":"所有设置与成绩都保存在本机浏览器中，不上传任何数据。","settings.switch.muted.label":"静音","settings.switch.muted.hint":"关闭全部音频输出。游戏判定不受影响。","settings.switch.visualPulse.label":"视觉节拍模式","settings.switch.visualPulse.hint":"完全不使用音频：节拍改由收缩节拍环、轨道脉冲与拍点标尺表达。","settings.switch.reducedMotion.label":"减少动效","settings.switch.reducedMotion.hint":"以平滑过渡替代闪烁与位移动画。","settings.switch.highContrast.label":"高对比","settings.switch.highContrast.hint":"提高前景与背景对比度。","settings.offset.label":"判定校准","settings.offset.hint":"若敲击感觉偏早或偏晚，可在此微调节奏判定窗口。","settings.offset.aria":"判定校准偏移（毫秒）","settings.action.clear":"清除全部存档","settings.action.reset":"恢复默认设置","settings.action.done":"完成","settings.toast.cleared":"存档与设置已清除","settings.toast.reset":"设置已恢复默认","settings.switch.on":"已开启","settings.switch.off":"已关闭","hall.hero.eyebrow":"回响电玩馆 · 现代时代分厅","hall.hero.sub":"PRISM ERA · 2010s — NOW","hall.hero.lead":"当游戏离开客厅、进入口袋、缠上手腕、罩住双眼，一整套新的身体经验被建立起来。折光纪收集这段历史里的三件可玩展品：节奏反应、空间解谜，以及一座诚实的桌面观景台。","hall.hero.cta.pulse":"进入《脉冲走廊》","hall.hero.cta.atrium":"进入《折光阁》","hall.hero.cta.halo":"进入《光环台》","hall.index.exhibits":"01 / EXHIBITS","hall.index.threads":"02 / THREADS","hall.index.timeline":"03 / TIMELINE","hall.index.catalog":"04 / CATALOG","hall.index.notes":"05 / NOTES","hall.section.exhibits.title":"三件可玩展品","hall.section.exhibits.sub":"全部为本厅原创：没有复刻任何具体作品，只借用了公开作品成熟的机制与品质标准。","hall.section.threads.title":"这一时代的四条线索","hall.section.threads.sub":"触屏化、独立化、服务化、沉浸化——它们共同决定了 2010 年以后游戏长成的样子。","hall.section.timeline.title":"2010 — 2026 时间轴","hall.section.timeline.sub":"代表性选样，而非编年全集。年份、平台与厂商信息均以官方或一手来源为准。","hall.section.catalog.title":"纯文本目录","hall.section.catalog.sub":"不使用图形界面的阅读方式：展项与全部史料条目的可读列表。","hall.section.notes.title":"关于本厅","hall.exhibit.go":"进入展项 →","hall.notice.original.title":"原创声明：","hall.notice.original.body":"本厅的命名、文案、音乐、视觉、布局与关卡均为原创作品，参考的是公开作品成熟的机制与品质标准，不声称原创任何参考作品，也不复制任何未授权 ROM、商业游戏资源或品牌视觉。","hall.notice.halo.title":"《光环台》说明：","hall.notice.halo.body":"该展项是桌面端交互演示，使用鼠标拖拽与键盘模拟头部转动，未接入 WebXR，不支持 VR 头显。展台内提供「检测本机 WebXR 沉浸式 VR 支持」按钮，其结果来自浏览器真实返回值。","hall.notice.sources.title":"来源与限制：","hall.notice.sources.body":"时间轴共 24 条，全部链接已于 2026-10-21 核验可达；本厅未使用任何图片素材，页面图形均为程序化绘制。","pulse.exhibit.no":"EXHIBIT 01","pulse.head.sub":"PULSE CORRIDOR · 节奏反应","pulse.mode.chart":"谱面模式","pulse.mode.drill":"反应训练","pulse.mode.hybrid":"混合模式","pulse.setup.mode.title":"选择模式","pulse.setup.track.title":"选择曲目","pulse.setup.audio.title":"播放设置","pulse.setup.track.hint":"反应训练模式不需要曲目。","pulse.setup.visual.label":"视觉节拍模式（静音替代）","pulse.setup.visual.hint":"完全不发声，用视觉节拍代替音乐。","pulse.setup.visual.aria":"视觉节拍模式","pulse.setup.note.silent":"视觉节拍模式已开启：本次不产生任何声音，节拍由收缩节拍环、下行光带与顶部拍点标尺表达。判定精度与有声模式一致。","pulse.setup.note.muted":"当前为全局静音：不发出声音，但节拍提示仍然完整（收缩节拍环 + 下行光带 + 拍点标尺）。","pulse.setup.note.default":"点击「开始」后才会创建并启动音频（浏览器要求用户手势）。音量为程序化实时合成，无音频文件。","pulse.setup.start":"开始","pulse.setup.starting":"准备中…","pulse.setup.keys":"轨道键：","pulse.setup.keys.esc":"暂停","pulse.setup.keys.r":"重开","pulse.setup.best":"最佳 {score}","pulse.hud.score":"分数","pulse.hud.combo":"连击","pulse.hud.accuracy":"准度","pulse.hud.judge":"判定","pulse.action.pause":"暂停","pulse.action.resume":"继续","pulse.action.restart":"重开","pulse.pause.title":"已暂停","pulse.pause.hint":"按 Esc 或点击下方按钮继续。","pulse.pause.restart":"重新开始","pulse.result.title":"本局结束","pulse.result.drill.title":"反应训练结束","pulse.result.drill.desc":"反应训练不计分，专注在「看准 → 判断 → 动手」这一段链路的时间。","pulse.result.score":"分数","pulse.result.maxCombo":"最大连击","pulse.result.accuracy":"准度","pulse.result.perfectGreat":"极准 / 很准","pulse.result.goodMiss":"尚可 / 失手","pulse.result.best":"最佳","pulse.result.cueCount":"提示次数","pulse.result.hitRate":"成功响应","pulse.result.median":"中位反应时","pulse.result.fastest":"最快","pulse.result.slowest":"最慢","pulse.result.average":"平均","pulse.foot":"节拍由「下行光带」提前预告：光带抵达判定线的那一刻就是节拍点。","atrium.exhibit.no":"EXHIBIT 02","atrium.head.sub":"PRISM ATRIUM · 空间解谜","atrium.hud.time":"用时","atrium.hud.motes":"光点","atrium.hud.receivers":"接收环","atrium.action.undo":"撤销","atrium.action.hint":"提示","atrium.action.reset":"重置","atrium.action.view":"视角复位","atrium.legend.cyan":"青光接收环","atrium.legend.magenta":"品红光接收环","atrium.legend.splitter":"分光镜","atrium.help.move":"WASD / 方向键 移动","atrium.help.rotate":"点击元件或按 E 旋转","atrium.help.tab":"Tab 切换目标","atrium.help.view":"拖拽 旋转视角 · 滚轮 缩放","atrium.elem.mirror":"反光板","atrium.elem.splitter":"分光镜","atrium.elem.dispersion":"色散棱镜","atrium.sel":"已选中：{name}（按 E 旋转）","atrium.result.time":"用时","atrium.result.motes":"光点","atrium.result.best":"最佳用时","atrium.result.rating":"评级","atrium.result.again":"再玩一次","atrium.result.next":"下一关：{name}","atrium.result.toPulse":"回到《脉冲走廊》","atrium.toast.tooFar":"离得太远了 —— 走到它旁边再旋转","atrium.toast.noUndo":"没有可撤销的操作了","atrium.toast.undone":"已撤销上一步","atrium.toast.hintUsedUp":"本关提示次数已用完（3 次）","atrium.toast.hintNone":"当前所有元件都已在推荐朝向上——问题可能在别处","atrium.toast.reset":"本关已重置","atrium.receiver.lit":"已点亮","atrium.receiver.mismatch":"颜色不符","atrium.receiver.dark":"未点亮","halo.exhibit.no":"EXHIBIT 03","halo.head.sub":"HALO DECK · 桌面观景台","halo.disclaimer.title":"桌面端交互演示：","halo.disclaimer.body":"本展项用鼠标拖拽与键盘模拟头部转动，未接入 WebXR，不支持 VR 头显，也没有立体渲染与手柄追踪。它是「沉浸式展陈的交互模型」演示，而不是 VR 应用。","halo.panel.deviceTitle":"本展项的设备支持：","halo.panel.deviceStatus":"设备支持状态","halo.panel.item.stereo":"立体渲染 / 手柄追踪：","halo.panel.item.stereoValue":"未实现","halo.panel.item.input":"交互方式：","halo.panel.item.inputValue":"鼠标拖拽环视 · 滚轮变焦 · WASD 移动","halo.panel.detect":"检测本机 WebXR 沉浸式 VR 支持","halo.panel.detecting":"检测中…","halo.panel.foot":"展签内容引自公开的一手与官方来源，点击卡片中的链接可前往原文。"},rh={"brand.cn":"折光纪","brand.en":"PRISM ERA","brand.aria":"Back to the Prism Era hall","nav.aria":"Hall navigation","nav.hall":"Hall","nav.pulse":"Pulse Corridor","nav.atrium":"Prism Atrium","nav.halo":"Halo Deck","title.hall":"Prism Era · Contemporary Playable Hall","title.pulse":"Pulse Corridor · Rhythm Reaction | PRISM ERA","title.atrium":"Prism Atrium · Spatial Puzzle | PRISM ERA","title.halo":"Halo Deck · Desktop Viewing Deck | PRISM ERA","title.default":"Prism Era · Contemporary Playable Hall | PRISM ERA","common.back":"← Back to hall","common.returnHall":"Back to hall","footer.note.1":"Prism Era · Contemporary Playable Hall — the modern-era wing of the Echo Arcade (PLYTIME ATLAS).","footer.note.2":"Every title, piece of writing, track, visual and level in this hall is original. Only the mechanics and quality standards of public works are referenced; no unlicensed ROM, commercial game asset or brand visual is included.","footer.note.3":"Halo Deck is a desktop interaction demo and does not support VR headsets. Sources are linked from each entry in the hall.","settings.open":"Settings","settings.title":"Hall settings","settings.desc":"All settings and scores are stored in this browser only. Nothing is uploaded.","settings.switch.muted.label":"Mute","settings.switch.muted.hint":"Turns off all audio output. Judgement is unaffected.","settings.switch.visualPulse.label":"Visual beat mode","settings.switch.visualPulse.hint":"Uses no audio at all: the beat is shown by the contracting beat ring, lane pulses and the beat ruler.","settings.switch.reducedMotion.label":"Reduce motion","settings.switch.reducedMotion.hint":"Replaces flicker and movement with smooth transitions.","settings.switch.highContrast.label":"High contrast","settings.switch.highContrast.hint":"Raises foreground/background contrast.","settings.offset.label":"Judgement calibration","settings.offset.hint":"Nudge the rhythm judgement window if your hits feel early or late.","settings.offset.aria":"Judgement calibration offset (milliseconds)","settings.action.clear":"Clear all saved data","settings.action.reset":"Restore default settings","settings.action.done":"Done","settings.toast.cleared":"Saved data and settings cleared","settings.toast.reset":"Settings restored to default","settings.switch.on":"on","settings.switch.off":"off","hall.hero.eyebrow":"Echo Arcade · Modern era wing","hall.hero.sub":"PRISM ERA · 2010s — NOW","hall.hero.lead":"When games left the living room, moved into pockets, wrapped around wrists and covered the eyes, an entirely new set of bodily experiences was established. Prism Era collects three playable exhibits from that history: rhythm reaction, a spatial puzzle, and an honest desktop viewing deck.","hall.hero.cta.pulse":"Enter Pulse Corridor","hall.hero.cta.atrium":"Enter Prism Atrium","hall.hero.cta.halo":"Enter Halo Deck","hall.index.exhibits":"01 / EXHIBITS","hall.index.threads":"02 / THREADS","hall.index.timeline":"03 / TIMELINE","hall.index.catalog":"04 / CATALOG","hall.index.notes":"05 / NOTES","hall.section.exhibits.title":"Three playable exhibits","hall.section.exhibits.sub":"All original to this hall: no specific work is reimplemented, only the mature mechanics and quality standards of public works are borrowed.","hall.section.threads.title":"Four threads of this era","hall.section.threads.sub":"Touch-first, independent, service-based and immersive — together they decided what games became after 2010.","hall.section.timeline.title":"2010 — 2026 timeline","hall.section.timeline.sub":"A representative sample rather than a complete chronology. Years, platforms and makers follow official or primary sources.","hall.section.catalog.title":"Plain-text catalogue","hall.section.catalog.sub":"A way to read without graphics: a readable list of the exhibits and every historical entry.","hall.section.notes.title":"About this hall","hall.exhibit.go":"Enter exhibit →","hall.notice.original.title":"Originality statement: ","hall.notice.original.body":"The naming, writing, music, visuals, layout and levels of this hall are original works. They reference the mature mechanics and quality standards of public works, claim originality over no referenced work, and copy no unlicensed ROM, commercial game asset or brand visual.","hall.notice.halo.title":"About Halo Deck: ","hall.notice.halo.body":'This exhibit is a desktop interaction demo. It uses mouse dragging and keyboard look control, does not implement WebXR and does not support VR headsets. The deck offers a "detect this machine’s immersive VR support" button whose result comes from the browser’s real return value.',"hall.notice.sources.title":"Sources and limits: ","hall.notice.sources.body":"The timeline holds 24 entries; every link was verified reachable on 2026-10-21. This hall uses no image assets — all page graphics are drawn procedurally.","pulse.exhibit.no":"EXHIBIT 01","pulse.head.sub":"PULSE CORRIDOR · Rhythm reaction","pulse.mode.chart":"Chart mode","pulse.mode.drill":"Reaction drill","pulse.mode.hybrid":"Hybrid mode","pulse.setup.mode.title":"Choose a mode","pulse.setup.track.title":"Choose a track","pulse.setup.audio.title":"Playback settings","pulse.setup.track.hint":"Reaction drill needs no track.","pulse.setup.visual.label":"Visual beat mode (silent substitute)","pulse.setup.visual.hint":"No sound at all — the beat is carried by light instead of music.","pulse.setup.visual.aria":"Visual beat mode","pulse.setup.note.silent":"Visual beat mode is on: nothing will be played, and the beat is expressed by the contracting beat ring, the descending light band and the beat ruler at the top. Judgement precision matches the audio mode.","pulse.setup.note.muted":"Globally muted: no sound is produced, but the beat cues stay complete (beat ring + descending light band + beat ruler).","pulse.setup.note.default":"Audio is only created and started after you press Start (browsers require a user gesture). The volume is synthesised live; there are no audio files.","pulse.setup.start":"Start","pulse.setup.starting":"Preparing…","pulse.setup.keys":"Lane keys: ","pulse.setup.keys.esc":"pause","pulse.setup.keys.r":"restart","pulse.setup.best":"Best {score}","pulse.hud.score":"Score","pulse.hud.combo":"Combo","pulse.hud.accuracy":"Accuracy","pulse.hud.judge":"Judgement","pulse.action.pause":"Pause","pulse.action.resume":"Resume","pulse.action.restart":"Restart","pulse.pause.title":"Paused","pulse.pause.hint":"Press Esc or click the button below to continue.","pulse.pause.restart":"Restart run","pulse.result.title":"Run complete","pulse.result.drill.title":"Reaction drill complete","pulse.result.drill.desc":'Reaction drill is not scored — it focuses on the time from "read the cue" to "decide" to "act".',"pulse.result.score":"Score","pulse.result.maxCombo":"Max combo","pulse.result.accuracy":"Accuracy","pulse.result.perfectGreat":"Perfect / Great","pulse.result.goodMiss":"Good / Miss","pulse.result.best":"Best","pulse.result.cueCount":"Cues","pulse.result.hitRate":"Responded","pulse.result.median":"Median reaction","pulse.result.fastest":"Fastest","pulse.result.slowest":"Slowest","pulse.result.average":"Average","pulse.foot":"The beat is announced ahead of time by the descending light band: the moment the band reaches the judgement line is the beat.","atrium.exhibit.no":"EXHIBIT 02","atrium.head.sub":"PRISM ATRIUM · Spatial puzzle","atrium.hud.time":"Time","atrium.hud.motes":"Motes","atrium.hud.receivers":"Receivers","atrium.action.undo":"Undo","atrium.action.hint":"Hint","atrium.action.reset":"Reset","atrium.action.view":"Reset view","atrium.legend.cyan":"Cyan receiver","atrium.legend.magenta":"Magenta receiver","atrium.legend.splitter":"Splitter","atrium.help.move":"WASD / arrow keys to move","atrium.help.rotate":"Click an element or press E to rotate","atrium.help.tab":"Tab to cycle targets","atrium.help.view":"Drag to orbit · scroll to zoom","atrium.elem.mirror":"mirror","atrium.elem.splitter":"splitter","atrium.elem.dispersion":"dispersion prism","atrium.sel":"Selected: {name} (press E to rotate)","atrium.result.time":"Time","atrium.result.motes":"Motes","atrium.result.best":"Best time","atrium.result.rating":"Rating","atrium.result.again":"Play again","atrium.result.next":"Next level: {name}","atrium.result.toPulse":"Back to Pulse Corridor","atrium.toast.tooFar":"Too far — walk up to it before rotating","atrium.toast.noUndo":"Nothing left to undo","atrium.toast.undone":"Undid the last step","atrium.toast.hintUsedUp":"No hints left for this level (3 total)","atrium.toast.hintNone":"Every element is already on its recommended facing — the problem lies elsewhere","atrium.toast.reset":"Level reset","atrium.receiver.lit":"Lit","atrium.receiver.mismatch":"Wrong colour","atrium.receiver.dark":"Not lit","halo.exhibit.no":"EXHIBIT 03","halo.head.sub":"HALO DECK · Desktop viewing deck","halo.disclaimer.title":"Desktop interaction demo: ","halo.disclaimer.body":'This exhibit simulates head movement with mouse dragging and keyboard. It does not implement WebXR, does not support VR headsets, and has no stereoscopic rendering or hand tracking. It demonstrates an "interaction model for immersive exhibition", not a VR application.',"halo.panel.deviceTitle":"Device support for this exhibit:","halo.panel.deviceStatus":"Device support status","halo.panel.item.stereo":"Stereoscopic rendering / hand tracking: ","halo.panel.item.stereoValue":"Not implemented","halo.panel.item.input":"Interaction: ","halo.panel.item.inputValue":"Drag to look around · scroll to zoom · WASD to move","halo.panel.detect":"Detect this machine’s immersive VR support","halo.panel.detecting":"Detecting…","halo.panel.foot":"The exhibit labels quote public primary and official sources; follow the links on a card to read the original."},hr={zh:sh,en:rh},ea="zh";let ah=ea;function Nt(i,t){let n=(hr[ah]||hr[ea])[i];return n==null&&(n=hr[ea][i]),n==null&&(n=i),n}const oh="toast-root";function Xe(i,t="info",e=2600){const n=document.getElementById(oh);if(!n)return;const s=M("div.toast",{class:t,role:"status"},i);return n.appendChild(s),window.setTimeout(()=>{s.style.transition="opacity 240ms ease, transform 240ms ease",s.style.opacity="0",s.style.transform="translateY(8px)",window.setTimeout(()=>s.remove(),260)},e),s}const na=new Set;let ia=null;function jl(){const t=window.location.hash.replace(/^#/,"").split("?")[0]||"/";return t.startsWith("/")?t:`/${t}`}function lh(){return ia||jl()}function Zl(i){return na.add(i),()=>na.delete(i)}function Jl(i){const t=`#${i}`;if(window.location.hash===t){sa();return}window.location.hash=t}function sa(){const i=jl();if(i!==ia){ia=i;for(const t of na)try{t(i)}catch(e){console.error("[router] handler failed",e)}}}function ch(){window.addEventListener("hashchange",sa),sa()}const hh=[{path:"/",labelKey:"nav.hall",titleKey:"title.hall"},{path:"/pulse",labelKey:"nav.pulse",titleKey:"title.pulse"},{path:"/atrium",labelKey:"nav.atrium",titleKey:"title.atrium"},{path:"/halo",labelKey:"nav.halo",titleKey:"title.halo"}];function Ql(){return hh.map(i=>({path:i.path,label:Nt(i.labelKey),title:Nt(i.titleKey)}))}const uh=`
<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
  <defs>
    <linearGradient id="pe-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#B4432B"/>
      <stop offset="52%" stop-color="#2E6A5E"/>
      <stop offset="100%" stop-color="#2C5C8F"/>
    </linearGradient>
  </defs>
  <polygon points="16,3 29,26 3,26" fill="none" stroke="url(#pe-g)" stroke-width="1.7"/>
  <polygon points="16,3 16,26 3,26" fill="rgba(46,106,94,0.14)" stroke="rgba(46,106,94,0.55)" stroke-width="0.9"/>
  <polygon points="16,3 29,26 16,26" fill="rgba(180,67,43,0.12)" stroke="rgba(180,67,43,0.5)" stroke-width="0.9"/>
  <circle cx="16" cy="3" r="1.6" fill="#B4432B"/>
</svg>`;function dh(){const i=document.getElementById("site-header");ue(i);const t=M("nav.site-nav.ds-topbar__nav",{"aria-label":Nt("nav.aria")});for(const n of Ql())t.appendChild(M("a.ds-topbar__link",{href:`#${n.path}`,"data-nav":n.path},n.label));const e=M("button.btn.btn-sm.btn-ghost.ds-btn.ds-btn--ghost.ds-btn--sm",{type:"button","aria-haspopup":"dialog",id:"open-settings"},Nt("settings.open"));return e.addEventListener("click",ph),i.appendChild(M("a.brand.ds-topbar__brand",{href:"#/","aria-label":Nt("brand.aria")},M("span",{html:uh}),M("span.brand-text",{},M("span.brand-cn",{},Nt("brand.cn")),M("span.brand-en",{},Nt("brand.en"))))),i.appendChild(t),i.appendChild(M("div.header-actions",{},e)),i}function fh(){const i=document.getElementById("site-footer");ue(i),i.appendChild(M("div.footer-inner.ds-footer__row",{},M("div.footer-note",{},M("p",{},Nt("footer.note.1")),M("p",{},Nt("footer.note.2")),M("p",{},Nt("footer.note.3"))),M("div.footer-links.ds-footer__links",{},M("a",{href:"#/"},Nt("nav.hall")),M("a",{href:"#/pulse"},Nt("nav.pulse")),M("a",{href:"#/atrium"},Nt("nav.atrium")),M("a",{href:"#/halo"},Nt("nav.halo")))))}function ss(i,t,e){const n=Ge(),s=M("button.switch",{type:"button",role:"switch","aria-pressed":String(!!n[e]),"aria-label":i});return s.addEventListener("click",()=>{const r=s.getAttribute("aria-pressed")!=="true";s.setAttribute("aria-pressed",String(r)),Vs(e,r),Xe(`${i}：${Nt(r?"settings.switch.on":"settings.switch.off")}`)}),M("div.switch-row",{},M("span.switch-label",{},M("b",{},i),M("span",{},t)),s)}function ph(){const i=document.getElementById("modal-root");ue(i);const t=Ge(),e=M("span.mono",{},`${t.offsetMs>0?"+":""}${t.offsetMs} ms`),n=M("input.slider.ds-input",{type:"range",min:"-200",max:"200",step:"5",value:String(t.offsetMs),"aria-label":Nt("settings.offset.aria")});n.addEventListener("input",()=>{const u=Number(n.value);e.textContent=`${u>0?"+":""}${u} ms`,Vs("offsetMs",u)});const s=M("button.btn.btn-sm.ds-btn.ds-btn--sm",{type:"button"},Nt("settings.action.clear"));s.addEventListener("click",()=>{ih(),Ao(),Xe(Nt("settings.toast.cleared"),"warn"),h()});const r=M("button.btn.btn-sm.btn-ghost.ds-btn.ds-btn--ghost.ds-btn--sm",{type:"button"},Nt("settings.action.reset"));r.addEventListener("click",()=>{Ao(),h(),Xe(Nt("settings.toast.reset"))});const a=M("div.modal",{role:"dialog","aria-modal":"true","aria-label":Nt("settings.title")},M("h2.ds-h3",{style:{fontSize:"1.3rem"}},Nt("settings.title")),M("p.muted.ds-sm",{style:{fontSize:"0.86rem"}},Nt("settings.desc")),ss(Nt("settings.switch.muted.label"),Nt("settings.switch.muted.hint"),"muted"),ss(Nt("settings.switch.visualPulse.label"),Nt("settings.switch.visualPulse.hint"),"visualPulse"),ss(Nt("settings.switch.reducedMotion.label"),Nt("settings.switch.reducedMotion.hint"),"reducedMotion"),ss(Nt("settings.switch.highContrast.label"),Nt("settings.switch.highContrast.hint"),"highContrast"),M("div.switch-row",{},M("span.switch-label",{},M("b",{},Nt("settings.offset.label")),M("span",{},Nt("settings.offset.hint"))),M("span.ds-field",{style:{display:"flex",alignItems:"center",gap:"10px"}},n,e)),M("div",{style:{display:"flex",gap:"10px",marginTop:"22px",flexWrap:"wrap"}},s,r,M("button.btn.btn-sm.btn-primary.ds-btn.ds-btn--primary.ds-btn--sm",{type:"button",onclick:h},Nt("settings.action.done")))),o=M("div.modal-backdrop",{},a);o.addEventListener("click",u=>{u.target===o&&h()});const l=u=>{u.key==="Escape"&&h()};document.addEventListener("keydown",l);const c=qc(a);function h(){document.removeEventListener("keydown",l),c(),ue(i)}i.appendChild(o),a.querySelector("button")?.focus()}function mh(){dh(),fh(),Zl(i=>{const t=Ql().find(e=>e.path===i);document.title=t?t.title:Nt("title.default");for(const e of document.querySelectorAll("[data-nav]"))e.getAttribute("data-nav")===i?e.setAttribute("aria-current","page"):e.removeAttribute("aria-current")}),window.location.hash||Jl((lh()==="/","/"))}const Lo=[{id:"pulse",no:"EXHIBIT 01",name:"脉冲走廊",nameEn:"PULSE CORRIDOR",path:"/pulse",color:"#2E6A5E",soft:"rgba(46, 106, 94, 0.14)",kind:"节奏反应",desc:"四轨光带从远处滑来，节拍与你的手指对撞。曲子是现场合成的，谱面即乐谱，视听永不脱节。",meta:["节奏反应","键盘 / 触屏","三首程序化曲目"],note:"提供「视觉节拍」静音替代模式：不发出任何声音，节拍改由收缩节拍环、轨道脉冲与拍点标尺表达。"},{id:"atrium",name:"折光阁",nameEn:"PRISM ATRIUM",path:"/atrium",no:"EXHIBIT 02",color:"#B4432B",soft:"rgba(180, 67, 43, 0.12)",kind:"空间解谜",desc:"一座等距的玻璃中庭。转动反光板，让白光在立柱之间折返，劈成青与品红，分别落进接收环。",meta:["空间解谜","4 个关卡","撤销 / 提示 / 重置"],note:"进度、星级与最佳用时自动保存在本机；解谜可随时撤销、查看提示或重置当前关卡。"},{id:"halo",name:"光环台",nameEn:"HALO DECK",path:"/halo",no:"EXHIBIT 03",color:"#2C5C8F",soft:"rgba(44, 92, 143, 0.12)",kind:"沉浸展项",desc:"夜色中的一座棱镜庭院。拖拽环视四周，热点展签在你靠近时亮起，讲述当代沉浸式硬件的来路。",meta:["桌面环视","热点展签","WebXR 实测按钮"],note:"这是桌面端交互演示：用鼠标与键盘模拟头部转动，未接入 WebXR，不支持 VR 头显。页面提供本机 WebXR 支持的真实检测按钮。"}],gh=[{zh:"触屏化",en:"TOUCH",color:"#2E6A5E",text:"手机成为第一批真正的游戏主机。触屏没有摇杆与按键，设计师必须把操作重新想一遍：点、划、拖、长按。轻量、短局、一键即玩成为移动游戏的基本语法。"},{zh:"独立化",en:"INDIE",color:"#8A5A00",text:"数字发行让小团队绕开发行商与实体零售。一款由一人完成的作品可以在商店页上架，并被全球玩家看见——独立游戏从「小众品类」变成了主流供给的一部分。"},{zh:"服务化",en:"SERVICE",color:"#B4432B",text:"作品越来越像持续运营的服务：赛季、直播活动、创作者工坊与内购经济把「一次通关」改写成「长期在线」。游戏与运营的边界被彻底抹平。"},{zh:"沉浸化",en:"IMMERSIVE",color:"#5B3FA8",text:"头显把视角从屏幕搬进空间，六自由度定位与身体姿态成为新的输入方式。与此同时，WebXR、OpenXR 等开放标准让浏览器也能承载轻量的沉浸体验。"}],_h=[{value:"3",label:"件可玩展项"},{value:"24",label:"条史料条目"},{value:"3",label:"首程序化曲目"},{value:"4",label:"个解谜关卡"}],ur=[{year:2011,title:"Minecraft",titleZh:"我的世界",platform:"PC · Java / 移动 / 主机",creator:"Mojang",tag:"indie",fact:"2011 年公开发售的方块建造沙盒 Survival 模式，核心循环是采集—合成—建造。",why:"玩家自造目标与共享世界，把「游戏即平台」的可能性推到前所未有规模。",source:{label:"Minecraft 官网",url:"https://www.minecraft.net/en-us"}},{year:2013,title:"Papers, Please",titleZh:"层层递进",platform:"PC",creator:"Lucas Pope",tag:"indie",fact:"2013 年发布的独立游戏，玩家扮演边境检查员，依据不断更新的规章证件放行或拒绝入境。",why:"用极其克制的像素界面承载政治与伦理议程，确立「小体量表达大主题」的独立游戏范式。",source:{label:"官方站点",url:"https://papersplea.se/"}},{year:2014,title:"Monument Valley",titleZh:"纪念碑谷",platform:"iOS · Android",creator:"ustwo games",tag:"touch",fact:"2014 年上线的等距视角解谜游戏，以「不可能几何」构成空间谜题，并随 Monument Valley 2 扩展叙事。",why:"证明触屏设备可以承载以空间阅读为核心的体验，推动移动端美学的独立化。",source:{label:"官方站点",url:"https://www.monumentvalleygame.com/mv1"}},{year:2014,title:"Never Alone (Kisima Ingitchuna)",titleZh:"永不独行",platform:"PC · 主机 · iOS",creator:"Upper One Games",tag:"indie",fact:"2014 年发行的游戏，与阿拉斯加原住民社群共同参与叙事、角色与美术的创作。",why:"少数在商业发行阶段就落实原住民社群共同创作的电子游戏，改变了文化授权的实践标准。",source:{label:"官方站点",url:"https://neveralone.com/"}},{year:2015,title:"Undertale",titleZh:"传说之下",platform:"PC · 主机 · 移动",creator:"Toby Fox",tag:"indie",fact:"2015 年发行的角色扮演游戏，战斗可被「不攻击」化解，叙事会记录玩家的每一次选择。",why:"把「对系统规则的反抗」写进核心玩法，证明独立开发者可以重新设计 RPG 的对话结构。",source:{label:"官方站点",url:"https://undertale.jp/"}},{year:2016,title:"VR 硬件同年上市：Oculus Rift · HTC Vive · PlayStation VR",titleZh:"消费级虚拟现实元年",platform:"PC (Rift / Vive) · PS4 (PSVR)",creator:"Oculus / HTC / Sony",tag:"immersive",fact:"Oculus Rift 于 2016 年 3 月发货，HTC Vive 于 4 月发货，PlayStation VR 于 10 月上市；同年 Google 推出 Daydream 移动 VR 平台。",why:"头显从研究装置转入零售货架，六自由度定位与头显追踪第一次成为普通玩家的日常输入方式。",source:{label:"Oculus 发货公告",url:"https://www.meta.com/blog/oculus-rift-is-shipping/"},extraSources:[{label:"HTC Vive 发货报道",url:"https://www.engadget.com/2016-04-05/htc-vive-now-shipping.html"},{label:"PlayStation VR 上市报道",url:"https://techcrunch.com/2016/06/13/playstation-vr-is-arriving-october-13th-priced-at-399/"}]},{year:2016,title:"Pokémon GO",titleZh:"宝可梦 GO",platform:"iOS · Android",creator:"Niantic",tag:"touch",fact:"2016 年 7 月上线的移动端位置增强游戏，玩家借助 GPS 与现实地理收集生物。",why:"把「游戏地图」与物理世界合并，形成此后十年的位置游戏热潮与隐私议题。",source:{label:"官方站点",url:"https://pokemongo.com/"}},{year:2016,title:"Stardew Valley",titleZh:"星露谷物语",platform:"PC · 主机 · 移动",creator:"ConcernedApe",tag:"indie",fact:"2016 年初抢先体验发行的农场经营游戏，由一位独立开发者历时多年完成，长期保持更新。",why:"「小团队 + 持续更新 + 复古结构」的长销型独立产品样本，重塑了独立游戏的商业预期。",source:{label:"Steam 商店页",url:"https://store.steampowered.com/app/413150/Stardew_Valley/"}},{year:2017,title:"Nintendo Switch",titleZh:"任天堂 Switch",platform:"家用 / 掌机混合",creator:"Nintendo",tag:"hardware",fact:"2017 年 3 月 3 日发售的混合式主机，可手持亦可连接电视，2020 年推出 OLED 改款。",why:"在同一台设备上打通「客厅游戏机」与「掌机」的使用场景，改变了硬件的形态分类。",source:{label:"官方产品页",url:"https://www.nintendo.com/us/gaming-systems/switch/"}},{year:2017,title:"Hollow Knight",titleZh:"空洞骑士",platform:"PC · 主机",creator:"Team Cherry",tag:"indie",fact:"2017 年发售的手绘风格银河恶魔城游戏，手绘背景与非线性地图探索是其标志。",why:"独立团队在既有类型内部做到美术与关卡的高度统一，证明了类型内部的原创空间。",source:{label:"官方站点",url:"https://www.hollowknight.com/"}},{year:2018,title:"Celeste",titleZh:"蔚蓝",platform:"PC · 主机 · 移动",creator:"Maddy Makes Games / Extremely OK Games",tag:"indie",fact:"2018 年发行的精密平台跳跃游戏，辅以「 Assist Mode」等辅助选项降低操作门槛。",why:"把高难度挑战与无障碍辅助放进同一套设计，是当代独立游戏对「可及性」的正面回应。",source:{label:"官方站点",url:"https://celestegame.jp/"}},{year:2018,title:"Fortnite",titleZh:"堡垒之夜",platform:"全平台",creator:"Epic Games",tag:"service",fact:"2018 年 9 月大逃杀模式上线，随后推出内置创意工坊的皮肤与道具内购经济。",why:"把直播传播、跨平台与用户创作内容组合成可持续运营的现代发行体系。",source:{label:"官方站点",url:"https://www.fortnite.com/"}},{year:2018,title:"Beat Saber",titleZh:"光剑",platform:"VR (PC / 一体机)",creator:"Beat Games",tag:"immersive",fact:"2018 年发行的 VR 节奏游戏，以斩击光块的动作映射音乐节拍，并登陆主流 VR 平台。",why:"证明 VR 的独特性在于「身体参与的节奏反馈」，而非把平面游戏搬进头显。",source:{label:"官方站点",url:"https://beatsaber.com/"}},{year:2020,title:"Half-Life: Alyx",titleZh:"半条命：艾莉克斯",platform:"PC VR",creator:"Valve",tag:"immersive",fact:"2020 年 3 月发行的 VR 作品，为 Valve 的 Index 硬件与 SteamVR 生态定下体验基准。",why:"让 VR 的空间交互、手部物理与叙事节奏同时成立，长期被当作画质与交互的参照系。",source:{label:"Valve 官方页",url:"https://www.valvesoftware.com/en/games/halflifealyx"}},{year:2020,title:"PlayStation 5 / Xbox Series X|S",titleZh:"次世代主机",platform:"家用主机",creator:"Sony / Microsoft",tag:"hardware",fact:"两家公司的新主机于 2020 年 11 月同期上市，以 SSD 存储与更强调的音视频输出为核心差异。",why:"存储与算力成为主机竞争的主战场，也把「直接录屏分享」变成默认的社交功能。",source:{label:"PlayStation 5 官方页",url:"https://www.playstation.com/en-us/ps5/"}},{year:2020,title:"Oculus Quest 2",titleZh:"Quest 2",platform:"一体机 VR",creator:"Meta",tag:"immersive",fact:"2020 年 9 月发布的一体机 VR 头显，去除手柄外接线、采用 inside-out 追踪并大幅降低售价。",why:"把 VR 从「需要主机与显卡」降维成「一台独立设备」，是消费级 VR 普及的分水岭。",source:{label:"Meta 官方公告",url:"https://about.fb.com/news/2020/09/introducing-oculus-quest-2-the-next-generation-of-all-in-one-vr/"}},{year:2020,title:"Hades",titleZh:"哈迪斯",platform:"PC · 主机 · 移动",creator:"Supergiant Games",tag:"indie",fact:"2020 年 9 月发售后荣登年度多项奖项，采用「死亡即重开」的叙事与循环结构。",why:"以早期访问式的持续更新取代传统的一次性发售，验证了独立作品的迭代式发行。",source:{label:"官方站点",url:"https://www.supergiantgames.com/games/hades/"}},{year:2022,title:"Steam Deck",titleZh:"Steam Deck",platform:"掌机 PC",creator:"Valve",tag:"hardware",fact:"2022 年 2 月开卖的掌机，运行桌面 Linux 并兼容 Steam 库中的大量 Windows 游戏。",why:"把 PC 的兼容性与掌机的形态结合，重构了「在哪里玩」这个问题的答案集合。",source:{label:"官方站点",url:"https://www.steamdeck.com/en/"}},{year:2023,title:"PlayStation VR2",titleZh:"PlayStation VR2",platform:"PS5 VR",creator:"Sony",tag:"immersive",fact:"2023 年 2 月 22 日发售，主打头显显示、4 摄像头追踪与眼动追踪的组合。",why:"把主机生态与 VR 打通，说明消费级 VR 的竞争焦点已从「能不能玩」转向「视觉品质」。",source:{label:"PlayStation Blog",url:"https://blog.playstation.com/2022/11/02/playstation-vr2-launches-in-february-at-549-99/"}},{year:2023,title:"Meta Quest 3",titleZh:"Quest 3",platform:"一体机 MR/VR",creator:"Meta",tag:"immersive",fact:"2023 年 10 月发布的一体机头显，引入彩色透视相机以支持混合现实透视应用。",why:"混合现实透视成为一体机的默认能力，头显从「显示器」向「空间计算终端」靠拢。",source:{label:"Meta 官方公告",url:"https://about.fb.com/news/2023/09/meet-meta-quest-3-mixed-reality-headset/"}},{year:2024,title:"Apple Vision Pro",titleZh:"Apple Vision Pro",platform:"空间计算设备",creator:"Apple",tag:"immersive",fact:"2024 年 2 月 2 日在美国首发，配备双 micro-OLED 显示器与外部电池的目镜方案。",why:"把消费级 XR 的定位从游戏扩展到「空间计算平台」，重设了硬件与交互的想象边界。",source:{label:"Apple Newsroom",url:"https://www.apple.com/newsroom/2024/01/apple-vision-pro-available-in-the-us-on-february-2/"}},{year:2024,title:"Balatro",titleZh:"小丑牌",platform:"PC · 主机 · 移动",creator:"LocalThunk",tag:"indie",fact:"2024 年 2 月发行的牌类构筑独立游戏，以扑克牌型叠加大量乘算与经济规则形成组合爆炸。",why:"单人开发的作品在发行后获得远超体量的销量与讨论度，是当代独立游戏爆款结构的典型。",source:{label:"Steam 商店页",url:"https://store.steampowered.com/app/2379780/Balatro/"}},{year:2025,title:"Nintendo Switch 2",titleZh:"任天堂 Switch 2",platform:"家用 / 掌机混合",creator:"Nintendo",tag:"hardware",fact:"2025 年 6 月 5 日发售的 Switch 后继机型，配备更大 LCD 屏幕与磁吸式手柄配件。",why:"在移动端掌机与云游戏之间反复取舍后，混合形态仍被证明是主流消费路线。",source:{label:"官方产品页",url:"https://www.nintendo.com/us/gaming-systems/switch-2/"}},{year:2026,title:"WebXR Device API",titleZh:"WebXR 设备接口",platform:"开放 Web 平台",creator:"W3C / Khronos",tag:"immersive",fact:"WebXR 已成为 W3C 推荐的 Web 沉浸式接口规范，OpenXR 则为 C++ / OpenGL 侧提供跨厂商运行时。",why:"开放标准让浏览器成为轻量 XR 载体——也正是本展厅《光环台》所处的技术语境。",source:{label:"W3C WebXR 规范",url:"https://www.w3.org/TR/webxr/"}}],rs={touch:{label:"触屏化",color:"#2E6A5E"},indie:{label:"独立化",color:"#8A5A00"},service:{label:"服务化",color:"#B4432B"},immersive:{label:"沉浸化",color:"#5B3FA8"},hardware:{label:"硬件形态",color:"#2C5C8F"}};function ji(i,t=""){if(typeof window>"u"||typeof document>"u")return t;try{return getComputedStyle(document.documentElement).getPropertyValue(i).trim()||t}catch{return t}}function tc(i,t="sans-serif"){const e=ji(i,"");return e&&e.replace(/\s+/g," ").replace(/;+$/,"").trim()||t}function Qn(i,t=1,e="rgba(0,0,0,0)"){const s=ji(i,"").match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(!s)return e;let r,a,o;return s[1].length===3?(r=parseInt(s[1][0]+s[1][0],16),a=parseInt(s[1][1]+s[1][1],16),o=parseInt(s[1][2]+s[1][2],16)):(r=parseInt(s[1].slice(0,2),16),a=parseInt(s[1].slice(2,4),16),o=parseInt(s[1].slice(4,6),16)),`rgba(${r}, ${a}, ${o}, ${t})`}function vh(i){Js("hall"),ue(i);const t=[],e=(I,_,S,O)=>{const z=M("section.hall-section.wrap",{},M("div.section-head",{},M("div",{},M("span.section-index",{},I),M("h2",{},_),S?M("p",{},S):null)),O);return t.push(z),z},n=M("canvas.hero-canvas",{"aria-hidden":"true"}),s=M("section.hall-hero.ds-cover",{},n,M("div.hero-inner",{},M("span.hero-eyebrow.ds-cover__eyebrow",{},"回响电玩馆 · 现代时代分厅"),M("h1.hero-title.ds-cover__title",{},M("span.prism",{},"折光纪")),M("p.hero-sub.ds-caps",{},"PRISM ERA · 2010s — NOW"),M("p.hero-lead.ds-cover__lede",{},"当游戏离开客厅、进入口袋、缠上手腕、罩住双眼，一整套新的身体经验被建立起来。折光纪收集这段历史里的三件可玩展品：节奏反应、空间解谜，以及一座诚实的桌面观景台。"),M("div.hero-cta.ds-cover__actions",{},M("a.btn.btn-primary.ds-btn.ds-btn--primary",{href:"#/pulse","data-exhibit":"pulse",style:{"--prisma":"var(--prism-cyan)"}},"进入《脉冲走廊》"),M("a.btn.ds-btn.ds-btn--secondary",{href:"#/atrium","data-exhibit":"atrium"},"进入《折光阁》"),M("a.btn.btn-ghost.ds-btn.ds-btn--ghost",{href:"#/halo","data-exhibit":"halo"},"进入《光环台》")),M("div.hero-facts",{},_h.map(I=>M("div.hero-fact",{},M("b",{},I.value),M("span",{},I.label))))));i.appendChild(s);const r=Lo.map(I=>M("a.exhibit-card.panel.ds-work",{href:`#${I.path}`,"data-exhibit":I.id,style:{"--prisma":I.color,"--prisma-soft":I.soft}},M("span.exhibit-glow",{"aria-hidden":"true"}),M("span.exhibit-no",{},I.no),M("h3.exhibit-name.ds-work__title",{},I.name),M("span.exhibit-en.ds-work__meta",{},I.nameEn),M("p.exhibit-desc.ds-work__desc",{},I.desc),M("div.exhibit-meta",{},I.meta.map((_,S)=>M("span.tag.ds-tag",{class:S===0?"tag-cyan":""},_))),M("p.exhibit-note",{},I.note),M("span.exhibit-go",{},"进入展项 →")));i.appendChild(e("01 / EXHIBITS","三件可玩展品","全部为本厅原创：没有复刻任何具体作品，只借用了公开作品成熟的机制与品质标准。",M("div.exhibit-grid",{},r))),i.appendChild(e("02 / THREADS","这一时代的四条线索","触屏化、独立化、服务化、沉浸化——它们共同决定了 2010 年以后游戏长成的样子。",M("div.keyword-grid",{},gh.map(I=>M("div.keyword.panel",{style:{"--prisma":I.color}},M("h3",{},I.zh,M("em",{},I.en)),M("p",{},I.text))))));const a=[],o=M("ol.timeline",{},ur.map(I=>{const _=rs[I.tag]||rs.indie,S=M("li.tl-item",{style:{"--tl-color":_.color},"data-timeline-tag":I.tag,"data-timeline-year":String(I.year)},M("div.tl-year",{},String(I.year)," · ",_.label),M("h3.tl-title",{},I.title,I.titleZh?M("small",{},I.titleZh):null),M("p.tl-fact",{},I.fact),M("p.tl-why",{},`入馆理由：${I.why}`),M("p.tl-src",{},M("span.muted",{},"平台："),I.platform," · ",M("span.muted",{},"来源："),M("a",{href:I.source.url,target:"_blank",rel:"noopener noreferrer"},I.source.label),I.extraSources?M("span",{}," / ",I.extraSources.map((O,z)=>M("span",{},z>0?" / ":"",M("a",{href:O.url,target:"_blank",rel:"noopener noreferrer"},O.label)))):null));return a.push(S),S})),l=M("p.ds-xs.timeline-count",{"aria-live":"polite"}),c=[];let h="all",u="";const f=()=>{let I=0;for(const _ of a){const S=h==="all"||_.getAttribute("data-timeline-tag")===h,O=_.textContent||"",z=!u||O.toLowerCase().includes(u);S&&z?(_.removeAttribute("hidden"),I+=1):_.setAttribute("hidden","")}for(const _ of c)_.setAttribute("aria-pressed",String(_.getAttribute("data-filter")===h));l.textContent=`显示 ${I} / ${a.length} 条史料条目`},m=["all",...Object.keys(rs)],g=M("div.ds-filters.timeline-filters",{role:"group","aria-label":"按线索筛选时间轴"},m.map(I=>{const _=I==="all"?"全部":rs[I].label,S=M("button.ds-chip",{type:"button","aria-pressed":String(I==="all"),"data-filter":I},_);return S.addEventListener("click",()=>{h=I,f()}),c.push(S),S})),v=M("input.ds-input.timeline-search",{type:"search",id:"timeline-search",placeholder:"搜索标题、平台或关键词","aria-label":"搜索时间轴条目",autocomplete:"off"});v.addEventListener("input",()=>{u=v.value.trim().toLowerCase(),f()});const p=M("div.ds-field.timeline-search-field",{},M("label.ds-field__label",{for:"timeline-search"},"搜索条目"),v),d=[...new Set(ur.map(I=>I.year))].sort((I,_)=>I-_),b=[],y=M("nav.ds-rail.ds-rail--horizontal.timeline-rail",{"aria-label":"按年份跳转"},d.map(I=>{const _=M("button.ds-rail__item",{type:"button","data-year":String(I)},String(I));return _.addEventListener("click",()=>{const S=a.find(O=>O.getAttribute("data-timeline-year")===String(I)&&!O.hasAttribute("hidden"));for(const O of b)O.removeAttribute("aria-current");_.setAttribute("aria-current","true"),S&&S.scrollIntoView({block:"start",behavior:"auto"})}),b.push(_),_}));f(),i.appendChild(e("03 / TIMELINE","2010 — 2026 时间轴","代表性选样，而非编年全集。年份、平台与厂商信息均以官方或一手来源为准。",M("div.panel",{},y,g,p,l,o)));const w=M("ul.catalog-list",{},Lo.map(I=>M("li",{},M("b",{},I.no.split(" ")[1]),M("span",{},`${I.name} / ${I.nameEn} — ${I.kind}`))),ur.map(I=>M("li",{},M("b",{},String(I.year)),M("span",{},`${I.title} — ${I.platform}`))));i.appendChild(e("04 / CATALOG","纯文本目录","不使用图形界面的阅读方式：展项与全部史料条目的可读列表。",M("div.panel",{},w))),i.appendChild(e("05 / NOTES","关于本厅",null,M("div",{style:{display:"grid",gap:"16px"}},M("div.notice",{},M("span.notice-icon",{"aria-hidden":"true"},"◆"),M("p",{},M("b",{},"原创声明："),"本厅的命名、文案、音乐、视觉、布局与关卡均为原创作品，参考的是公开作品成熟的机制与品质标准，不声称原创任何参考作品，也不复制任何未授权 ROM、商业游戏资源或品牌视觉。")),M("div.notice",{},M("span.notice-icon",{"aria-hidden":"true"},"●"),M("p",{},M("b",{},"《光环台》说明："),"该展项是桌面端交互演示，使用鼠标拖拽与键盘模拟头部转动，未接入 WebXR，不支持 VR 头显。展台内提供「检测本机 WebXR 沉浸式 VR 支持」按钮，其结果来自浏览器真实返回值。")),M("div.notice",{},M("span.notice-icon",{"aria-hidden":"true"},"▲"),M("p",{},M("b",{},"来源与限制："),"时间轴共 24 条，全部链接已于 2026-10-21 核验可达；本厅未使用任何图片素材，页面图形均为程序化绘制。")))));const L=t.map((I,_)=>M("span.ds-indicator__dot",{"aria-current":_===0?"true":"false"})),R=M("div.ds-indicator.hall-indicator",{"aria-hidden":"true","data-visible":"true"},M("div.ds-indicator__dots",{},L),M("span.ds-indicator__chevron",{html:'<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>'}));i.appendChild(R);let A=null;if(typeof IntersectionObserver=="function"){A=new IntersectionObserver(I=>{for(const _ of I){if(!_.isIntersecting)continue;const S=t.indexOf(_.target);if(S<0)continue;L.forEach((z,X)=>{z.setAttribute("aria-current",String(X===S))});const O=S===t.length-1;R.setAttribute("data-visible",S===0||O?"true":"false"),R.setAttribute("data-state",O?"chevron":"dots")}},{rootMargin:"-45% 0px -45% 0px",threshold:0});for(const I of t)A.observe(I)}const U=xh(n);return()=>{U(),A&&A.disconnect()}}function xh(i){const t=i.getContext("2d");if(!t)return()=>{};const e=Ge();let n=0,s=0,r=1,a=0,o={x:.5,y:.5};const l=[],c=[ji("--ds-accent","#b4432b"),ji("--ds-jade","#2e6a5e"),ji("--ds-info","#2c5c8f")];function h(){const v=i.getBoundingClientRect();r=Math.min(window.devicePixelRatio||1,2),n=Math.max(1,Math.round(v.width)),s=Math.max(1,Math.round(v.height)),i.width=Math.round(n*r),i.height=Math.round(s*r),t.setTransform(r,0,0,r,0,0)}function u(){l.length=0;const v=Math.max(12,Math.min(30,Math.round(n/46)));for(let p=0;p<v;p+=1)l.push({x:Math.random(),y:Math.random(),s:8+Math.random()*30,r:Math.random()*Math.PI,vr:(Math.random()-.5)*.0016,vy:6e-5+Math.random()*22e-5,vx:(Math.random()-.5)*12e-5,hue:Math.random(),a:.06+Math.random()*.2,kind:Math.random()<.45?0:1})}function f(v){t.clearRect(0,0,n,s);const p=t.createRadialGradient(n*(.22+o.x*.2),s*.2,0,n*.6,s*.5,n*.9);p.addColorStop(0,Qn("--ds-accent",.07,"rgba(180,67,43,0.07)")),p.addColorStop(.55,Qn("--ds-jade",.05,"rgba(46,106,94,0.05)")),p.addColorStop(1,Qn("--ds-bg",0,"rgba(252,251,249,0)")),t.fillStyle=p,t.fillRect(0,0,n,s);for(const b of l){b.y-=b.vy,b.x+=b.vx,b.r+=b.vr,b.y<-.1&&(b.y=1.1,b.x=Math.random()),b.x<-.1&&(b.x=1.1),b.x>1.1&&(b.x=-.1);const y=b.x*n+(o.x-.5)*26*b.s*.06,w=b.y*s+(o.y-.5)*20*b.s*.06,L=b.s*(.7+o.x*.5),R=c[Math.min(c.length-1,Math.floor(b.hue*c.length))];t.save(),t.translate(y,w),t.rotate(b.r),t.strokeStyle=R,t.globalAlpha=b.a,t.fillStyle=R,t.globalAlpha=b.a*.18,t.lineWidth=1.1,t.beginPath(),b.kind===0?(t.moveTo(0,-L),t.lineTo(L*.86,L*.7),t.lineTo(-L*.86,L*.7),t.closePath()):t.rect(-L*.62,-L*.62,L*1.24,L*1.24),t.fill(),t.stroke(),t.restore()}const d=t.createLinearGradient(0,0,n,0);d.addColorStop(0,Qn("--ds-accent",0,"rgba(180,67,43,0)")),d.addColorStop(.5,Qn("--ds-ink-faint",.28,"rgba(110,101,94,0.28)")),d.addColorStop(1,Qn("--ds-info",0,"rgba(44,92,143,0)")),t.fillStyle=d,t.fillRect(0,s-1,n,1),a=window.requestAnimationFrame(f)}function m(v){const p=i.getBoundingClientRect();o.x=(v.clientX-p.left)/Math.max(1,p.width),o.y=(v.clientY-p.top)/Math.max(1,p.height)}function g(){o={x:.5,y:.5}}return h(),u(),window.addEventListener("resize",h),i.addEventListener("pointermove",m),i.addEventListener("pointerleave",g),e.reducedMotion?f():a=window.requestAnimationFrame(f),()=>{window.cancelAnimationFrame(a),window.removeEventListener("resize",h),i.removeEventListener("pointermove",m),i.removeEventListener("pointerleave",g)}}const Za=[0,3,5,7,10];function yh(i){const t=[];return i.forEach((e,n)=>{if(e)for(const s of e.trim().split(/\s+/)){if(!s)continue;const[r,a,o]=s.split(":"),l=Number(r),c=Number(a);!Number.isInteger(l)||l<0||l>3||Number.isFinite(c)&&t.push({id:`${n}-${l}-${c}`,bar:n,beat:c,lane:l,dur:o?Number(o):0,time:n*4+c})}}),t}function Mh(i,t){const e=60/t;return i.map(n=>({...n,t:n.time*e}))}function Ja(i){const t=Mh(yh(i.bars),i.bpm),e=i.bars.length*4;return{...i,notes:t,totalBeats:e,duration:e*(60/i.bpm),spb:60/i.bpm}}const Sh=Ja({id:"first-light",title:"启明",titleEn:"FIRST LIGHT",bpm:100,beatsPerBar:4,level:1,difficulty:"入门",color:"#4FE3D0",desc:"四分音符为主的双向级进，像第一缕光沿着四根轨道逐级点亮。",scale:Za,baseMidi:57,drums:"soft",progression:[0,0,0,0,3,3,3,3,4,4,2,2,0,3,4,0],bars:["","","0:0 1:1 2:2 3:3","3:0 2:1 1:2 0:3","0:0 1:1 2:2 3:3","0:0 2:1 1:2 3:3","0:0 1:0.5 2:1 3:1.5 0:2 1:2.5 2:3 3:3.5","0:0 1:1 2:2 3:3","3:0 2:1 1:2 0:3","0:0 2:0 1:1 3:1 0:2 2:2 1:3 3:3","0:0 1:1 2:2 3:3","0:0 1:0.5 2:1 3:1.5 2:2 1:2.5 0:3 3:3.5","0:0 1:1 2:2 3:3","0:0 2:1 1:2 3:3","3:0 2:1 1:2 0:3","0:0 1:0.5 2:1 3:1.5 0:2 1:2.5 2:3 3:3.5","0:0 1:1 2:2 3:3"],reactions:[{bar:5,beat:3.75,kind:"target",lane:2},{bar:9,beat:3.5,kind:"avoid",lane:1}]}),bh=Ja({id:"tide-glass",title:"潮汐",titleEn:"TIDE GLASS",bpm:124,beatsPerBar:4,level:2,difficulty:"进阶",color:"#FF5FA2",desc:"切分与八分音跑动并存，像玻璃潮汐在轨道之间来回折射。",scale:Za,baseMidi:55,drums:"shuffle",progression:[0,0,2,2,4,4,3,3,0,0,5,5,4,3,2,0,1,1,4,0],bars:["","0:0 2:1 1:2 3:3","0:0 1:0.5 2:1 3:1.5 2:2 1:2.5 0:3 3:3.5","3:0 2:0.5 1:1 0:1.5 1:2 2:2.5 3:3 3:3.5","0:0 0:0.5 2:1 2:1.5 1:2 1:2.5 3:3 3:3.5","0:0 1:1 2:1.5 3:2 0:2.5 1:3 2:3.5 3:3.5","3:0 2:0.5 1:1 0:1.5 3:2 2:2.5 1:3 0:3.5","0:0 1:0.5 0:1 2:1.5 1:2 3:2.5 2:3 3:3.5","0:0 2:1 3:2 1:3","3:0 1:1 2:2 0:3","0:0 1:0.5 2:1 3:1.5 0:2 2:2.5 1:3 3:3.5","3:0 2:0.5 1:1 0:1.5 1:2 0:2.5 3:3 2:3.5","0:0 1:1 2:2 3:3","0:0 0:0.5 1:1 1:1.5 2:2 2:2.5 3:3 3:3.5","3:0 3:0.5 2:1 2:1.5 1:2 1:2.5 0:3 0:3.5","1:0 2:0.5 3:1 0:1.5 1:2 2:2.5 3:3 0:3.5","0:0 1:1 2:2 3:3","0:0 2:0 1:1 3:1 0:2 2:2 1:3 3:3","0:0 1:0.5 2:1 3:1.5 2:2 1:2.5 0:3 3:3.5","0:0 1:1 2:2 3:3"],reactions:[{bar:4,beat:3.5,kind:"target",lane:1},{bar:8,beat:2.5,kind:"avoid",lane:3},{bar:13,beat:3.75,kind:"target",lane:0},{bar:17,beat:1.25,kind:"avoid",lane:2}]}),Eh=Ja({id:"prism-storm",title:"棱镜风暴",titleEn:"PRISM STORM",bpm:150,beatsPerBar:4,level:3,difficulty:"挑战",color:"#FFC46B",desc:"十六分音簇与长按交错，棱镜在最高密度下把光拆成三条轨道。",scale:Za,baseMidi:52,drums:"drive",progression:[0,0,2,2,4,4,1,1,3,3,0,0,2,4,3,1,0,2,4,4,3,2,1,0],bars:["","0:0 2:0.5 1:1 3:1.5 2:2 0:2.5 1:3 3:3.5","3:0 1:0.5 2:1 0:1.5 1:2 3:2.5 2:3 0:3.5","0:0 0:0.25 1:0.5 1:0.75 2:1 2:1.25 3:1.5 3:1.75 0:2 1:2.25 2:2.5 3:2.75 0:3 1:3.25 2:3.5 3:3.75","3:0 2:0.25 1:0.5 0:0.75 3:1 2:1.25 1:1.5 0:1.75 1:2 2:2.25 3:2.5 0:2.75 1:3 2:3.25 3:3.5 0:3.75","0:0 1:0.5 2:1 3:1.5 0:2 1:2.5 2:3 3:3.5","2:0 3:0.25 2:0.5 1:0.75 3:1 0:1.25 1:1.5 2:1.75 0:2 3:2.25 2:2.5 1:2.75 0:3 1:3.25 2:3.5 3:3.75","3:0 1:0.5 0:1 2:1.5 1:2 3:2.5 2:3 0:3.5","0:0 0:0.25 1:0.5 1:0.75 2:1 2:1.25 3:1.5 3:1.75 0:2 0:2.25 1:2.5 1:2.75 2:3 2:3.25 3:3.5 3:3.75","1:0 2:0.25 3:0.5 0:0.75 1:1 2:1.25 3:1.5 0:1.75 2:2 1:2.25 0:2.5 3:2.75 1:3 2:3.25 3:3.5 0:3.75","0:0 2:1 1:2 3:3","0:0 1:0.25 2:0.5 3:0.75 0:1 1:1.25 2:1.5 3:1.75 0:2 1:2.25 2:2.5 3:2.75 0:3 1:3.25 2:3.5 3:3.75","3:0 2:0.25 1:0.5 0:0.75 1:1 0:1.25 3:1.5 2:1.75 3:2 2:2.25 1:2.5 0:2.75 1:3 0:3.25 3:3.5 2:3.75","0:0 1:0.5 2:1 3:1.5 0:2 1:2.5 2:3 3:3.5","0:0 0:0.25 0:0.5 1:0.75 1:1 1:1.25 2:1.5 2:1.75 3:2 3:2.25 0:2.5 0:2.75 1:3 1:3.25 2:3.5 2:3.75","3:0 3:0.25 2:0.5 2:0.75 1:1 1:1.25 0:1.5 0:1.75 1:2 1:2.25 2:2.5 2:2.75 3:3 3:3.25 0:3.5 0:3.75","0:0 2:1 1:2 3:3","0:0 1:0.5 2:1 3:1.5 0:2 2:2.5 1:3 3:3.5","3:0 2:0.5 1:1 0:1.5 1:2 0:2.5 3:3 2:3.5","0:0 1:0.25 2:0.5 3:0.75 0:1 1:1.25 2:1.5 3:1.75 0:2 1:2.25 2:2.5 3:2.75 0:3 1:3.25 2:3.5 3:3.75","1:0 0:0.5 3:1 2:1.5 1:2 3:2.5 0:3 2:3.5","0:0 1:0.5 2:1 3:1.5 0:2 1:2.5 2:3 3:3.5","3:0 2:0.5 1:1 0:1.5 1:2 2:2.5 3:3 0:3.5","0:0 1:1 2:2 3:3"],reactions:[{bar:3,beat:3.5,kind:"target",lane:3},{bar:6,beat:1.75,kind:"avoid",lane:0},{bar:9,beat:2.5,kind:"target",lane:2},{bar:12,beat:3.25,kind:"avoid",lane:1},{bar:15,beat:.25,kind:"target",lane:0},{bar:18,beat:2.75,kind:"avoid",lane:3},{bar:21,beat:1.25,kind:"target",lane:1}]}),as=[Sh,bh,Eh],Fi={perfect:60,great:100,good:140},ti={perfect:1,great:.72,good:.4},dr=["◆","●","▲","■"],wh=["D / ←","F / ↓","J / ↑","K / →"],Th=440;function ei(i){return Th*Math.pow(2,(i-69)/12)}class Ah{constructor(){this.ctx=null,this.master=null,this.musicGain=null,this.sfxGain=null,this.delay=null,this.delayFeedback=null,this.noiseBuffer=null,this.ready=!1,this.muted=!1,this.failed=!1}get active(){return this.ready&&!this.muted&&this.ctx&&this.ctx.state==="running"}async unlock(){if(this.ready){if(this.ctx.state==="suspended")try{await this.ctx.resume()}catch{}return this.active}const t=window.AudioContext||window.webkitAudioContext;if(!t)return this.failed=!0,!1;try{this.ctx=new t;const e=this.ctx;if(this.master=e.createGain(),this.master.gain.value=.9,this.master.connect(e.destination),this.musicGain=e.createGain(),this.musicGain.gain.value=.72,this.musicGain.connect(this.master),this.sfxGain=e.createGain(),this.sfxGain.gain.value=.5,this.sfxGain.connect(this.master),this.delay=e.createDelay(1.2),this.delay.delayTime.value=.26,this.delayFeedback=e.createGain(),this.delayFeedback.gain.value=.26,this.delayWet=e.createGain(),this.delayWet.gain.value=.3,this.delay.connect(this.delayFeedback),this.delayFeedback.connect(this.delay),this.delay.connect(this.delayWet),this.delayWet.connect(this.master),this.noiseBuffer=this._makeNoise(1.2),this.ready=!0,e.state==="suspended")try{await e.resume()}catch{}return this.active}catch(e){return console.warn("[audio] 无法初始化 AudioContext，转为无声模式",e),this.failed=!0,this.ctx=null,!1}}setMuted(t){if(this.muted=t,this.master&&this.ctx){const e=this.ctx.currentTime;this.master.gain.cancelScheduledValues(e),this.master.gain.setTargetAtTime(t?0:.9,e,.04)}}suspend(){this.ctx&&this.ctx.state==="running"&&this.ctx.suspend().catch(()=>{})}resume(){this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{})}_makeNoise(t){const e=this.ctx,n=Math.floor(e.sampleRate*t),s=e.createBuffer(1,n,e.sampleRate),r=s.getChannelData(0);for(let a=0;a<n;a+=1)r[a]=(Math.random()*2-1)*(.7+Math.random()*.3);return s}_env(t,e,{attack:n=.005,decay:s=.2,peak:r=1,sustain:a=0,hold:o=0}){const l=t.gain;l.setValueAtTime(1e-4,e),l.exponentialRampToValueAtTime(Math.max(2e-4,r),e+n),o>0?(l.exponentialRampToValueAtTime(Math.max(2e-4,a||r*.6),e+n+o),l.exponentialRampToValueAtTime(1e-4,e+n+o+s)):l.exponentialRampToValueAtTime(1e-4,e+n+s)}kick(t,e=1){if(!this.active)return;const n=this.ctx,s=n.createOscillator(),r=n.createGain();s.type="sine",s.frequency.setValueAtTime(148,t),s.frequency.exponentialRampToValueAtTime(44,t+.11),this._env(r,t,{attack:.004,decay:.3,peak:.85*e}),s.connect(r),r.connect(this.musicGain),s.start(t),s.stop(t+.36)}snare(t,e=1){if(!this.active)return;const n=this.ctx,s=n.createBufferSource();s.buffer=this.noiseBuffer;const r=n.createBiquadFilter();r.type="bandpass",r.frequency.value=1900,r.Q.value=.9;const a=n.createGain();this._env(a,t,{attack:.002,decay:.16,peak:.32*e}),s.connect(r),r.connect(a),a.connect(this.musicGain),s.start(t),s.stop(t+.24)}hat(t,e=1,n=!1){if(!this.active)return;const s=this.ctx,r=s.createBufferSource();r.buffer=this.noiseBuffer;const a=s.createBiquadFilter();a.type="highpass",a.frequency.value=7200;const o=s.createGain();this._env(o,t,{attack:.001,decay:n?.16:.045,peak:.16*e}),r.connect(a),a.connect(o),o.connect(this.musicGain),r.start(t),r.stop(t+.3)}bass(t,e,n=.42,s=1){if(!this.active)return;const r=this.ctx,a=r.createOscillator(),o=r.createOscillator(),l=r.createBiquadFilter(),c=r.createGain();a.type="sawtooth",o.type="sine",a.frequency.value=e,o.frequency.value=e/2,l.type="lowpass",l.frequency.setValueAtTime(520,t),l.frequency.exponentialRampToValueAtTime(190,t+n),this._env(c,t,{attack:.012,decay:n*.6,peak:.3*s,hold:n*.3,sustain:.14*s}),a.connect(l),o.connect(l),l.connect(c),c.connect(this.musicGain),a.start(t),o.start(t),a.stop(t+n+.2),o.stop(t+n+.2)}pluck(t,e,n=.3,s=1){if(!this.active)return;const r=this.ctx,a=r.createOscillator(),o=r.createOscillator(),l=r.createBiquadFilter(),c=r.createGain();a.type="triangle",o.type="sawtooth",a.frequency.value=e,o.frequency.value=e*1.004,l.type="lowpass",l.frequency.setValueAtTime(4200,t),l.frequency.exponentialRampToValueAtTime(1300,t+n),this._env(c,t,{attack:.006,decay:n,peak:.3*s}),a.connect(l),o.connect(l),l.connect(c),c.connect(this.musicGain),c.connect(this.delay),a.start(t),o.start(t),a.stop(t+n+.15),o.stop(t+n+.15)}pad(t,e,n,s=1){if(!this.active)return;const r=this.ctx,a=r.createBiquadFilter(),o=r.createGain();a.type="lowpass",a.frequency.setValueAtTime(700,t),a.frequency.linearRampToValueAtTime(1500,t+n*.5),a.frequency.linearRampToValueAtTime(600,t+n),this._env(o,t,{attack:n*.28,decay:n*.4,peak:.09*s,hold:n*.35,sustain:.05*s}),a.connect(o),o.connect(this.musicGain);for(const l of e)for(const c of[-6,6]){const h=r.createOscillator();h.type="sawtooth",h.frequency.value=l,h.detune.value=c,h.connect(a),h.start(t),h.stop(t+n+.3)}}sfx(t){if(!this.active)return;const e=this.ctx,n=e.currentTime,s=e.createOscillator(),r=e.createGain(),a=e.createBiquadFilter();a.type="lowpass",a.frequency.value=6e3;const o={perfect:{f0:1180,f1:1760,dur:.16,peak:.2,type:"triangle"},great:{f0:940,f1:1180,dur:.12,peak:.16,type:"triangle"},good:{f0:700,f1:760,dur:.1,peak:.12,type:"triangle"},miss:{f0:220,f1:120,dur:.22,peak:.16,type:"sawtooth"},react:{f0:1500,f1:2100,dur:.1,peak:.16,type:"sine"},reactLate:{f0:420,f1:300,dur:.16,peak:.14,type:"square"}}[t]||{f0:800,f1:900,dur:.1,peak:.12,type:"triangle"};s.type=o.type,s.frequency.setValueAtTime(o.f0,n),s.frequency.exponentialRampToValueAtTime(Math.max(40,o.f1),n+o.dur),this._env(r,n,{attack:.003,decay:o.dur,peak:o.peak}),s.connect(a),a.connect(r),r.connect(this.sfxGain),s.start(n),s.stop(n+o.dur+.1)}}const fn=new Ah,Do={soft:[[0,"kick",1],[1,"snare",.75],[2,"kick",.85],[3,"snare",.75],[.5,"hat",.55],[1.5,"hat",.4],[2.5,"hat",.55],[3.5,"hat",.4]],shuffle:[[0,"kick",1],[.75,"hat",.5],[1,"snare",.85],[1.75,"kick",.6],[2,"kick",.9],[2.5,"snare",.7],[3,"snare",.8],[3.5,"hat",.5]],drive:[[0,"kick",1],[.5,"hat",.5],[.75,"kick",.62],[1,"snare",.9],[1.5,"hat",.4],[1.75,"kick",.55],[2,"kick",.92],[2.5,"hat",.5],[2.75,"kick",.62],[3,"snare",.95],[3.5,"hat",.45],[3.75,"hat",.35]]};class Rh{constructor(t){this.audio=t,this.timer=0,this.events=[],this.index=0,this.epoch=0,this.running=!1}buildEvents(t){const e=60/t.bpm,n=[],s=t.scale,r=t.baseMidi;for(const c of t.notes){const h=c.lane+c.bar,u=s[h%s.length],f=12*(Math.floor(h/s.length)%3);n.push({t:c.t,kind:"pluck",freq:ei(r+u+f),dur:Math.max(.18,(c.dur||0)*e||.26),gain:1})}const a=t.bars.length,o=t.progression;for(let c=0;c<a;c+=1){const h=o[c%o.length],u=r-12+s[h%s.length],f=c*4*e;n.push({t:f,kind:"bass",freq:ei(u),dur:e*1.6,gain:1}),n.push({t:f+e*2.5,kind:"bass",freq:ei(u+s[(h+2)%s.length]),dur:e*.9,gain:.7}),n.push({t:f,kind:"pad",freqs:[ei(u+12),ei(u+12+3),ei(u+12+7)],dur:e*4,gain:.9})}const l=Do[t.drums]||Do.soft;for(let c=0;c<a;c+=1){const h=c*4*e;for(const[u,f,m]of l)n.push({t:h+u*e,kind:f,gain:m})}return n.sort((c,h)=>c.t-h.t),n}start(t,e=0){if(this.stop(),!this.audio.active)return;this.events=this.buildEvents(t);let n=0;for(;n<this.events.length&&this.events[n].t<e;)n+=1;this.index=n,this.epoch=this.audio.ctx.currentTime-e,this.running=!0,this.timer=window.setInterval(()=>this.tick(),25)}tick(){if(!this.running||!this.audio.active)return;const e=this.audio.ctx.currentTime,s=e-this.epoch+.22;for(;this.index<this.events.length&&this.events[this.index].t<=s;){const r=this.events[this.index],a=Math.max(e+.005,this.epoch+r.t);this.fire(r,a),this.index+=1}}fire(t,e){const n=this.audio;switch(t.kind){case"pluck":n.pluck(e,t.freq,t.dur,t.gain);break;case"bass":n.bass(e,t.freq,t.dur,t.gain);break;case"pad":n.pad(e,t.freqs,t.dur,t.gain);break;case"kick":n.kick(e,t.gain);break;case"snare":n.snare(e,t.gain);break;case"hat":n.hat(e,t.gain,!1);break}}stop(){this.timer&&window.clearInterval(this.timer),this.timer=0,this.running=!1}}const Ch=["#4FE3D0","#FFC46B","#FF5FA2","#9D7BFF"],Ph={perfect:"极准",great:"很准",good:"尚可",miss:"失手"},fr=2400,Lh=1.55;let pr="",mr="";function gr(){return pr||(pr=tc("--ds-font-display",'"Space Grotesk", system-ui, sans-serif')),pr}function ni(){return mr||(mr=tc("--ds-font-mono",'"Space Mono", ui-monospace, monospace')),mr}function Dh(i){Js("pulse"),ue(i);const t=M("div.pulse-app");i.appendChild(t);const e={screen:"setup",mode:"chart",trackId:as[0].id},n={fns:[]};let s=null;function r(){ue(t),e.screen="setup";const o=Ge(),l=[{id:"chart",title:"谱面模式",en:"CHART",desc:"跟随曲目的主旋律敲击轨道，判定你的准度与连击。",color:"#4FE3D0"},{id:"drill",title:"反应训练",en:"REACTION",desc:"只做反应：提示出现后立刻按下对应轨道，系统统计你的反应时。",color:"#FFC46B"},{id:"hybrid",title:"混合模式",en:"HYBRID",desc:"谱面中穿插「应答靶」与「禁触靶」，一边跟拍一边反应。",color:"#FF5FA2"}].map(g=>M("button.mode-card",{type:"button","data-mode":g.id,"aria-pressed":String(e.mode===g.id),style:{"--mc":g.color},onclick:()=>{e.mode=g.id,r()}},M("span.mode-card-en",{},g.en),M("b",{},g.title),M("p",{},g.desc))),c=as.map(g=>{const v=jc(g.id);return M("button.track-row",{type:"button","data-track":g.id,"aria-pressed":String(e.trackId===g.id),style:{"--tc":g.color},disabled:e.mode==="drill",onclick:()=>{e.trackId=g.id,r()}},M("span.track-lv",{},`LV${g.level}`),M("span.track-info",{},M("b",{},`${g.title} / ${g.titleEn}`),M("span",{},g.desc)),M("span.track-meta",{},M("span.mono",{},`${g.bpm} BPM`),M("span.tag",{class:g.level===1?"tag-cyan":g.level===2?"tag-amber":"tag-magenta"},g.difficulty),v?M("span.mono.track-best",{},`最佳 ${v.bestScore}`):null))}),h=M("button.switch",{type:"button",role:"switch","aria-pressed":String(o.visualPulse),"aria-label":"视觉节拍模式"});h.addEventListener("click",()=>{const g=h.getAttribute("aria-pressed")!=="true";h.setAttribute("aria-pressed",String(g)),Vs("visualPulse",g),f()});const u=M("p.setup-note");function f(){const g=Ge();g.visualPulse?u.textContent="视觉节拍模式已开启：本次不产生任何声音，节拍由收缩节拍环、下行光带与顶部拍点标尺表达。判定精度与有声模式一致。":g.muted?u.textContent="当前为全局静音：不发出声音，但节拍提示仍然完整（收缩节拍环 + 下行光带 + 拍点标尺）。":u.textContent="点击「开始」后才会创建并启动音频（浏览器要求用户手势）。音量为程序化实时合成，无音频文件。"}f();const m=M("button.btn.btn-primary.btn-lg",{type:"button","data-control":"start","aria-label":"开始游戏"},"开始");m.addEventListener("click",async()=>{m.disabled=!0,m.textContent="准备中…",await a()}),t.appendChild(M("div.pulse-wrap",{},M("header.pulse-head",{},M("a.back-link",{href:"#/"},"← 返回展厅"),M("span.exhibit-no",{style:{color:"#2E6A5E"}},"EXHIBIT 01"),M("h1.ds-detail__title",{},"脉冲走廊"),M("p.pulse-sub",{},"PULSE CORRIDOR · 节奏反应")),M("div.pulse-setup",{"data-game-root":"pulse",tabindex:"0","aria-label":"脉冲走廊选单：选择模式、曲目与播放设置"},M("section.setup-block",{},M("h2.setup-h",{},"选择模式"),M("div.mode-grid",{},l)),M("section.setup-block",{},M("h2.setup-h",{},"选择曲目"),M("div.track-list",{},c),M("p.setup-hint",{},"反应训练模式不需要曲目。")),M("section.setup-block",{},M("h2.setup-h",{},"播放设置"),M("div.switch-row",{},M("span.switch-label",{},M("b",{},"视觉节拍模式（静音替代）"),M("span",{},"完全不发声，用视觉节拍代替音乐。")),h),M("p.setup-note",{},u.textContent),M("div.setup-actions",{},m,M("p.setup-keys",{},"轨道键：",M("kbd",{},"D"),M("kbd",{},"F"),M("kbd",{},"J"),M("kbd",{},"K")," 或方向键 ",M("kbd",{},"←"),M("kbd",{},"↓"),M("kbd",{},"↑"),M("kbd",{},"→")," · ",M("kbd",{},"Esc")," 暂停 · ",M("kbd",{},"R")," 重开"))))))}async function a(){const o=Ge(),l=o.visualPulse||o.muted;await Yl(),l||await fn.unlock()||(Xe("音频不可用，已切换为视觉节拍模式","warn"),Vs("visualPulse",!0)),fn.setMuted(o.muted);const c=as.find(m=>m.id===e.trackId)||as[0],h=M("canvas.pulse-canvas",{"aria-label":"节奏轨道画面"}),u=M("div.pulse-hud.ds-canvas-frame__hud.ds-canvas-frame__hud--top"),f=M("div.pulse-overlay");ue(t),e.screen="play",t.appendChild(M("div.pulse-wrap",{},M("header.pulse-head.pulse-head--compact",{},M("a.back-link",{href:"#/"},"← 返回展厅"),M("div.pulse-head-title",{},M("b",{},"脉冲走廊"),M("span",{},"PULSE CORRIDOR")),M("div.pulse-head-actions",{},M("button.btn.btn-sm",{type:"button",id:"pulse-pause","data-control":"pause"},"暂停"),M("button.btn.btn-sm.btn-ghost",{type:"button",id:"pulse-restart","data-control":"restart"},"重开"))),M("div.pulse-stage.ds-canvas-frame",{"data-game-root":"pulse","data-ds-theme":"dark",tabindex:"0","aria-label":"脉冲走廊游戏画面，方向键或 D F J K 敲击轨道"},h,u,f),M("p.pulse-foot",{},"节拍由「下行光带」提前预告：光带抵达判定线的那一刻就是节拍点。"))),s=new Ih({canvas:h,hud:u,overlay:f,track:c,mode:e.mode,onExit:()=>r()}),n.fns.push(()=>s.destroy()),s.begin(),Zs()}return r(),()=>{n.fns.forEach(o=>o()),n.fns.length=0,s&&s.destroy()}}class Ih{constructor({canvas:t,hud:e,overlay:n,track:s,mode:r,onExit:a}){this.canvas=t,this.ctx=t.getContext("2d"),this.hud=e,this.overlay=n,this.track=s,this.mode=r,this.onExit=a,this.scheduler=new Rh(fn),this.settings=Ge(),this.phase="countdown",this.startPerf=performance.now()+fr,this.pausedAt=0,this.pausedPerf=0,this.notes=s.notes.map(o=>({...o,judged:!1,result:null,hitAt:0})),this.judged={perfect:0,great:0,good:0,miss:0},this.combo=0,this.maxCombo=0,this.score=0,this.effects=[],this.laneFlash=[0,0,0,0],this.laneGlow=[0,0,0,0],this.lastJudge=null,this.lastJudgeAt=0,this.reactionTimes=[],this.reactionResults={hit:0,miss:0},this.cues=[],this.nextCueIndex=0,this.activeCue=null,this.finished=!1,this.lastBeatIndex=-1,this.raf=0,this.dpr=1,this.w=0,this.h=0,this.rootEl=t.closest("[data-game-root]"),this.lastLane=-1,this.presses=0,this.pauseBtn=document.getElementById("pulse-pause"),this.restartBtn=document.getElementById("pulse-restart"),this.pauseBtn?.addEventListener("click",()=>this.togglePause()),this.restartBtn?.addEventListener("click",()=>this.restart()),this.buildHud(),this.bindInput(),this.resize(),this.prepareCues(),this.loop=this.loop.bind(this),this.raf=window.requestAnimationFrame(this.loop)}prepareCues(){if(this.mode==="drill"){let t=1.6;const e=[0,1,2,3];for(let n=0;n<20;n+=1)this.cues.push({t,lane:e[(n*7+Math.floor(n/4))%4],kind:"target",done:!1}),t+=.95+n*37%110/100}else if(this.mode==="hybrid"){const t=60/this.track.bpm;for(const e of this.track.reactions)this.cues.push({t:e.bar*4*t+e.beat*t,lane:e.lane,kind:e.kind,done:!1})}this.cues.sort((t,e)=>t.t-e.t)}begin(){this.startPerf=performance.now()+fr,this.phase="countdown",this.lastLane=-1,this.presses=0,this.mode!=="drill"&&fn.active&&this.scheduler.start(this.track,0),this.updateHud(),this.syncPauseLabel(),this.publish(),this.focusGame()}publish(){qn({state:this.phase,route:"/pulse",chapter:this.mode==="drill"?"reaction-drill":this.track.id,score:Math.round(this.score),combo:this.combo,player:{lane:this.lastLane,presses:this.presses},extra:{mode:this.mode,bpm:this.track.bpm,maxCombo:this.maxCombo,judged:{...this.judged}}})}buildHud(){ue(this.hud),this.elScore=M("b.hud-score",{},"0"),this.elCombo=M("b.hud-combo",{},"0"),this.elAcc=M("b.hud-acc",{},"100.00%"),this.elJudge=M("span.hud-judge",{},""),this.elBar=M("i.hud-bar-fill"),this.elProgress=M("div.hud-progress",{},this.elBar),this.elCounts=M("div.hud-counts"),this.elMode=M("span.hud-mode",{},this.modeLabel()),this.hud.appendChild(M("div.hud-row",{},M("div.hud-block",{},M("label",{},"分数"),this.elScore),M("div.hud-block",{},M("label",{},"连击"),this.elCombo),M("div.hud-block",{},M("label",{},"准度"),this.elAcc),M("div.hud-block.hud-block--wide",{},M("label",{},"判定"),this.elJudge))),this.hud.appendChild(M("div.hud-row.hud-row--sub",{},this.elCounts,this.elMode)),this.hud.appendChild(this.elProgress)}modeLabel(){return this.mode==="drill"?"反应训练":this.mode==="hybrid"?"混合模式":"谱面模式"}updateHud(){this.elScore.textContent=String(Math.round(this.score)),this.elCombo.textContent=String(this.combo);const t=this.judged.perfect+this.judged.great+this.judged.good+this.judged.miss,e=t?(this.judged.perfect*ti.perfect+this.judged.great*ti.great+this.judged.good*ti.good)/t*100:100;this.elAcc.textContent=`${e.toFixed(2)}%`,this.elCounts.textContent="";for(const[s,r]of[["perfect","极准"],["great","很准"],["good","尚可"],["miss","失手"]])this.elCounts.appendChild(M("span.count-chip",{class:`count-${s}`},`${r} ${this.judged[s]}`));if(this.mode!=="chart"){const s=this.averageReaction();this.elCounts.appendChild(M("span.count-chip.count-react",{},`反应 ${this.reactionTimes.length?`${Math.round(s)} ms`:"—"}`))}const n=this.mode==="drill"?this.cues.length?this.nextCueIndex/this.cues.length:0:this.progressRatio();this.elBar.style.width=`${Math.max(0,Math.min(1,n))*100}%`,this.lastJudge&&performance.now()-this.lastJudgeAt<600?(this.elJudge.textContent=this.lastJudge,this.elJudge.dataset.kind=this.lastJudgeKind||""):this.lastJudge||(this.elJudge.textContent="")}averageReaction(){return this.reactionTimes.length?this.reactionTimes.reduce((t,e)=>t+e,0)/this.reactionTimes.length:0}progressRatio(){const t=this.track.duration||1;return Math.max(0,Math.min(1,this.chartTime()/t))}isGameFocused(){const t=this.rootEl;if(!t)return!1;const e=document.activeElement;return e===t||t.contains(e)}focusGame(){try{this.rootEl?.focus({preventScroll:!0})}catch{this.rootEl?.focus()}}bindInput(){this.onKeyDown=t=>{if(t.repeat||!this.isGameFocused())return;const e=t.code;if(e==="Escape"){t.preventDefault(),this.togglePause();return}if(e==="KeyR"){t.preventDefault(),this.restart();return}const n=Uh[e];n!=null&&(t.preventDefault(),this.hitLane(n))},window.addEventListener("keydown",this.onKeyDown),this.onPointerDown=t=>{if(this.focusGame(),this.phase==="countdown")return;const e=this.canvas.getBoundingClientRect(),n=t.clientX-e.left,s=this.laneAtX(n);s!=null&&(t.preventDefault(),this.hitLane(s))},this.canvas.addEventListener("pointerdown",this.onPointerDown)}laneAtX(t){const{laneWidth:e,x0:n}=this.layout(),s=Math.floor((t-n)/e);return s>=0&&s<=3?s:null}hitLane(t){if(this.phase!=="playing")return;const e=this.chartTime();if(this.laneGlow[t]=1,this.lastLane=t,this.presses+=1,this.publish(),this.activeCue){const a=this.activeCue,o=(e-a.t)*1e3;if(a.kind==="target"){if(t===a.lane&&o<=620){const l=Math.max(0,o);this.reactionTimes.push(l),this.reactionResults.hit+=1,this.effects.push({lane:t,kind:"react",t:performance.now()}),this.activeCue=null,a.done=!0,fn.sfx("react"),this.setJudge(l<180?"反应极快":l<320?"反应很快":"反应到了",l<180?"perfect":l<320?"great":"good"),this.updateHud();return}if(t===a.lane){this.reactionTimes.push(o),this.reactionResults.hit+=1,this.activeCue=null,a.done=!0,this.setJudge("反应偏慢","good"),this.updateHud();return}this.applyJudge("miss",t),this.effects.push({lane:t,kind:"miss",t:performance.now()});return}if(a.kind==="avoid"){if(t===a.lane){this.reactionResults.miss+=1,this.activeCue=null,a.done=!0,this.applyJudge("miss",t),this.effects.push({lane:t,kind:"miss",t:performance.now()}),this.setJudge("误触禁触靶","miss");return}return}}const n=(Ge().offsetMs||0)/1e3;let s=null,r=1/0;for(const a of this.notes){if(a.judged||a.lane!==t)continue;const o=a.t-(e-n),l=Math.abs(o);l<r&&l<=Fi.good/1e3&&(s=a,r=l)}if(!s){this.effects.push({lane:t,kind:"tap",t:performance.now()}),this.setJudge("空敲","miss");return}s.judged=!0,s.result=this.judgeBy(r),this.applyJudge(s.result,t),this.effects.push({lane:t,kind:s.result,t:performance.now()}),fn.sfx(s.result)}judgeBy(t){const e=t*1e3;return e<=Fi.perfect?"perfect":e<=Fi.great?"great":e<=Fi.good?"good":"miss"}applyJudge(t,e){if(this.judged[t]+=1,t==="miss")this.combo=0;else{this.combo+=1,this.maxCombo=Math.max(this.maxCombo,this.combo);const n={perfect:1e3,great:720,good:400}[t],s=Math.min(4,1+this.combo/50);this.score+=n*s}this.setJudge(Ph[t],t),this.updateHud()}setJudge(t,e){this.lastJudge=t,this.lastJudgeKind=e,this.lastJudgeAt=performance.now()}chartTime(){return this.phase==="paused"?this.pausedAt:this.phase==="countdown"?(performance.now()-this.startPerf)/1e3:this.phase==="ready"?-fr/1e3:(performance.now()-this.startPerf)/1e3}togglePause(){this.phase==="playing"||this.phase==="countdown"?(this.pausedAt=this.chartTime(),this.pausedFrom=this.phase,this.phase="paused",this.scheduler.stop(),fn.suspend(),this.showPauseOverlay(),this.syncPauseLabel(),this.publish()):this.phase==="paused"&&(this.phase=this.pausedFrom==="countdown"?"countdown":"playing",this.startPerf=performance.now()-this.pausedAt*1e3,this.scheduler.start(this.track,this.pausedAt),fn.resume(),this.clearOverlay(),this.focusGame(),this.syncPauseLabel(),this.publish())}syncPauseLabel(){this.pauseBtn&&(this.pauseBtn.textContent=this.phase==="paused"?"继续":"暂停",this.pauseBtn.setAttribute("aria-pressed",String(this.phase==="paused")))}restart(){this.phase="playing",this.startPerf=performance.now(),this.pausedAt=0,this.notes=this.track.notes.map(t=>({...t,judged:!1,result:null})),this.judged={perfect:0,great:0,good:0,miss:0},this.combo=0,this.maxCombo=0,this.score=0,this.effects=[],this.reactionTimes=[],this.reactionResults={hit:0,miss:0},this.cues=[],this.nextCueIndex=0,this.activeCue=null,this.finished=!1,this.lastLane=-1,this.presses=0,this.prepareCues(),this.scheduler.start(this.track,0),this.clearOverlay(),this.syncPauseLabel(),this.updateHud(),this.focusGame(),this.publish()}loop(){this.raf=window.requestAnimationFrame(this.loop);const t=this.chartTime();this.phase==="countdown"&&t>=0&&(this.phase="playing"),this.phase==="playing"&&(this.checkNotes(t),this.updateCues(t),this.checkFinish(t)),this.render(t),this.updateHud(),this.publish()}checkNotes(t){const e=(Ge().offsetMs||0)/1e3;for(const n of this.notes)n.judged||t-e>n.t+Fi.good/1e3&&(n.judged=!0,n.result="miss",this.applyJudge("miss",n.lane),this.effects.push({lane:n.lane,kind:"miss",t:performance.now()}),fn.sfx("miss"))}updateCues(t){if(this.mode!=="chart"&&(!this.activeCue&&this.nextCueIndex<this.cues.length&&t>=this.cues[this.nextCueIndex].t&&(this.activeCue=this.cues[this.nextCueIndex],this.nextCueIndex+=1,this.cueStart=t),this.activeCue)){const e=t-this.activeCue.t,n=this.activeCue.kind==="target"?.62:.75;e>n&&(this.activeCue.kind==="target"&&(this.reactionResults.miss+=1,this.setJudge("反应超时","miss")),this.activeCue=null)}}checkFinish(t){if(this.finished)return;if(this.mode==="drill"){this.nextCueIndex>=this.cues.length&&!this.activeCue&&(this.finished=!0,this.finish());return}const e=this.track.duration+.6;t>e&&(this.finished=!0,this.finish())}finish(){this.phase="results",this.scheduler.stop(),this.publish();const t=this.judged.perfect+this.judged.great+this.judged.good+this.judged.miss,e=t?(this.judged.perfect*ti.perfect+this.judged.great*ti.great+this.judged.good*ti.good)/t*100:0,n=this.rankFor(e);if(this.mode!=="drill"){const s=$c(this.track.id,{score:Math.round(this.score),maxCombo:this.maxCombo,accuracy:e,reactionMs:this.reactionTimes.length?Math.round(this.averageReaction()):null});this.showResults(n,e,s)}else this.showDrillResults()}rankFor(t){return t>=98?{mark:"S",cls:"rank-s"}:t>=94?{mark:"A",cls:"rank-a"}:t>=88?{mark:"B",cls:"rank-b"}:t>=78?{mark:"C",cls:"rank-c"}:{mark:"D",cls:"rank-d"}}showResults(t,e,n){const s=M("div.pulse-result",{},M("div.result-rank",{class:t.cls},t.mark),M("h2",{},"演奏结束"),M("p.result-track",{},`${this.track.title} / ${this.track.titleEn}`),M("div.result-grid",{},this.resultItem("分数",String(Math.round(this.score))),this.resultItem("最大连击",String(this.maxCombo)),this.resultItem("准度",`${e.toFixed(2)}%`),this.resultItem("极准 / 很准",`${this.judged.perfect} / ${this.judged.great}`),this.resultItem("尚可 / 失手",`${this.judged.good} / ${this.judged.miss}`),this.resultItem("平均反应",this.reactionTimes.length?`${Math.round(this.averageReaction())} ms`:"本模式无反应项")),M("p.result-record",{},n.bestScore>=Math.round(this.score)?`本曲最佳成绩：${n.bestScore}`:`刷新最佳成绩！此前 ${n.bestScore} → 现在 ${n.bestScore}`),M("div.result-actions",{},M("button.btn.btn-primary",{type:"button",onclick:()=>this.restart()},"再来一次"),M("button.btn",{type:"button",onclick:()=>this.onExit()},"换一首 / 换模式"),M("a.btn.btn-ghost",{href:"#/"},"返回展厅")));this.showOverlay(s)}showDrillResults(){const t=[...this.reactionTimes].sort((c,h)=>c-h),e=t.length?t[Math.floor(t.length/2)]:0,n=t.length?t[0]:0,s=t.length?t[t.length-1]:0,r=this.reactionResults.hit,a=this.cues.length,o=e<=200?"优秀":e<=300?"良好":e<=430?"合格":"再练练",l=M("div.pulse-result",{},M("div.result-rank.rank-react",{},o),M("h2",{},"反应训练结束"),M("div.result-grid",{},this.resultItem("提示次数",String(a)),this.resultItem("成功响应",`${r} / ${a}`),this.resultItem("中位反应时",e?`${Math.round(e)} ms`:"—"),this.resultItem("最快",n?`${Math.round(n)} ms`:"—"),this.resultItem("最慢",s?`${Math.round(s)} ms`:"—"),this.resultItem("平均",t.length?`${Math.round(this.averageReaction())} ms`:"—")),M("p.result-record",{},"反应训练不计分，专注在「看准 → 判断 → 动手」这一段链路的时间。"),M("div.result-actions",{},M("button.btn.btn-primary",{type:"button",onclick:()=>this.restart()},"再练一次"),M("button.btn",{type:"button",onclick:()=>this.onExit()},"换个模式"),M("a.btn.btn-ghost",{href:"#/"},"返回展厅")));this.showOverlay(l)}resultItem(t,e){return M("div.result-item",{},M("label",{},t),M("b",{},e))}showOverlay(t){ue(this.overlay),this.overlay.appendChild(t),this.overlay.classList.add("is-active");const e=this.overlay.querySelector('button, a[href], [tabindex]:not([tabindex="-1"])');try{e?.focus?.({preventScroll:!0})}catch{e?.focus?.()}}clearOverlay(){ue(this.overlay),this.overlay.classList.remove("is-active"),this.focusGame()}showPauseOverlay(){const t=M("div.pulse-pause",{},M("h2",{},"已暂停"),M("p",{},"按 Esc 或点击下方按钮继续。"),M("div.result-actions",{},M("button.btn.btn-primary",{type:"button",onclick:()=>this.togglePause()},"继续"),M("button.btn",{type:"button",onclick:()=>this.restart()},"重新开始"),M("a.btn.btn-ghost",{href:"#/"},"返回展厅")));this.showOverlay(t)}resize(){const t=this.canvas.getBoundingClientRect();this.dpr=Math.min(window.devicePixelRatio||1,2),this.w=Math.max(1,Math.round(t.width)),this.h=Math.max(1,Math.round(t.height)),this.canvas.width=Math.round(this.w*this.dpr),this.canvas.height=Math.round(this.h*this.dpr),this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0)}layout(){const t=Math.max(52,Math.min(124,(this.w-36)/4)),e=(this.w-t*4)/2,n=this.h-Math.min(150,this.h*.2),s=74;return{laneWidth:t,x0:e,judgeY:n,top:s,highwayH:n-s}}render(t){const e=this.ctx,{w:n,h:s}=this;e.clearRect(0,0,n,s);const r=e.createLinearGradient(0,0,0,s);if(r.addColorStop(0,"#0a0f2c"),r.addColorStop(.55,"#070b1e"),r.addColorStop(1,"#04061a"),e.fillStyle=r,e.fillRect(0,0,n,s),this.phase==="countdown"){this.renderCountdown(t);return}const{laneWidth:a,x0:o,judgeY:l,top:c,highwayH:h}=this.layout(),u=Lh,f=60/this.track.bpm;e.fillStyle="rgba(8,13,36,0.55)",e.fillRect(o,c-10,a*4,h+20),e.strokeStyle="rgba(242,240,233,0.10)",e.lineWidth=1;for(let d=0;d<=4;d+=1){const b=o+a*d;e.beginPath(),e.moveTo(b,c-10),e.lineTo(b,l+10),e.stroke()}const m=t/f,g=Math.ceil(m-1e-4);for(let d=g;d<g+14;d+=1){const y=d*f-t;if(y>u*1.05||y<-.2)continue;const w=l-y/u*h,L=Math.max(0,1-y/(u*1.05))*.5,R=e.createLinearGradient(0,w-14,0,w+14);R.addColorStop(0,"rgba(79,227,208,0)"),R.addColorStop(.5,`rgba(79,227,208,${L.toFixed(3)})`),R.addColorStop(1,"rgba(79,227,208,0)"),e.fillStyle=R,e.fillRect(o,w-14,a*4,28)}e.strokeStyle="rgba(242,240,233,0.16)";for(let d=g;d<g+14;d+=1){const y=d*f-t;if(y>u*1.05||y<-.2)continue;const w=l-y/u*h;e.beginPath(),e.moveTo(o-10,w),e.lineTo(o-2,w),e.moveTo(o+a*4+2,w),e.lineTo(o+a*4+10,w),e.stroke()}for(const d of this.notes){if(d.judged&&d.result!=="miss"||d.judged&&d.result==="miss"&&d.t<t-.6)continue;const b=d.t-t;if(b>u||b<-.25)continue;const y=l-b/u*h,w=o+d.lane*a,L=b<0?Math.max(0,1+b/.25):1,R=.82+.18*Math.max(0,1-Math.abs(b)/u);this.drawNote(e,w,y,a,d.lane,R,L,d.judged)}const v=e.createLinearGradient(o,0,o+a*4,0);v.addColorStop(0,"rgba(79,227,208,0.15)"),v.addColorStop(.5,"rgba(242,240,233,0.85)"),v.addColorStop(1,"rgba(255,95,162,0.15)"),e.fillStyle=v,e.fillRect(o,l-1.5,a*4,3),e.font=`600 12px ${ni()}`,e.textAlign="center",e.textBaseline="middle";for(let d=0;d<4;d+=1){const b=o+a*(d+.5),y=this.laneGlow[d];e.fillStyle=`rgba(242,240,233,${(.26+y*.6).toFixed(3)})`,e.fillText(dr[d],b,l+24),e.fillStyle=`rgba(242,240,233,${(.18+y*.5).toFixed(3)})`,e.font=`500 10px ${ni()}`,e.fillText(wh[d],b,l+44),e.font=`600 12px ${ni()}`}this.renderMetronome(e,t,f,l),this.renderRuler(e,t,f,o,a*4),this.activeCue&&this.renderCue(e,this.activeCue,t,o,a,l,c,h);const p=performance.now();this.effects=this.effects.filter(d=>p-d.t<460);for(const d of this.effects){const b=(p-d.t)/460,y=o+d.lane*a+a/2,w=10+b*46,L=1-b,R=d.kind==="miss"?"255,107,129":d.kind==="react"?"157,123,255":d.kind==="tap"?"242,240,233":d.kind==="perfect"?"79,227,208":d.kind==="great"?"255,196,107":"157,123,255";e.strokeStyle=`rgba(${R},${L.toFixed(3)})`,e.lineWidth=2.4*(1-b)+.6,e.beginPath(),e.arc(y,l,w,0,Math.PI*2),e.stroke()}for(let d=0;d<4;d+=1)this.laneGlow[d]=Math.max(0,this.laneGlow[d]-.045)}drawNote(t,e,n,s,r,a,o,l){const c=Ch[r],h=s*.7*a,u=20*a,f=e+s/2,m=n;t.save(),t.globalAlpha=o*(l?.25:1),t.shadowColor=c,t.shadowBlur=l?0:18;const g=t.createLinearGradient(f-h/2,m,f+h/2,m);g.addColorStop(0,`${c}33`),g.addColorStop(.5,`${c}ee`),g.addColorStop(1,`${c}33`),t.fillStyle=g,Io(t,f-h/2,m-u/2,h,u,7),t.fill(),t.shadowBlur=0,t.strokeStyle=c,t.lineWidth=1.4,Io(t,f-h/2,m-u/2,h,u,7),t.stroke(),t.fillStyle="#06091f",t.font=`700 12px ${gr()}`,t.textAlign="center",t.textBaseline="middle",t.fillText(dr[r],f,m+.5),t.restore()}renderMetronome(t,e,n,s){const r=(e%n+n)%n/n,a=this.w/2,o=s-96,l=this.settings.visualPulse?1.25:1,c=(66-r*36)*l,h=22*l;t.save(),t.strokeStyle=`rgba(79,227,208,${(.2+(1-r)*.6).toFixed(3)})`,t.lineWidth=2,t.beginPath(),t.arc(a,o,c,0,Math.PI*2),t.stroke(),t.strokeStyle="rgba(242,240,233,0.34)",t.lineWidth=1,t.beginPath(),t.arc(a,o,h,0,Math.PI*2),t.stroke();const u=Math.round(e/n),f=1-r;t.fillStyle=`rgba(255,196,107,${f.toFixed(3)})`,t.beginPath(),t.arc(a,o,5.5,0,Math.PI*2),t.fill(),t.fillStyle="rgba(242,240,233,0.4)",t.font=`500 10px ${ni()}`,t.textAlign="center",t.fillText(`BEAT ${u+1}`,a,o+h+18),t.restore()}renderRuler(t,e,n,s,r){const o=Math.ceil(e/n);t.save(),t.strokeStyle="rgba(242,240,233,0.08)",t.lineWidth=1,t.beginPath(),t.moveTo(s,26+.5),t.lineTo(s+r,26+.5),t.stroke();for(let l=o;l<o+9;l+=1){const h=l*n-e;if(h<-.1)continue;const u=s+r-h/(n*8)*r;if(u<s-4||u>s+r+4)continue;const f=l%4===0;t.strokeStyle=f?"rgba(255,196,107,0.8)":"rgba(242,240,233,0.35)",t.lineWidth=f?2:1,t.beginPath(),t.moveTo(u,26-(f?12:7)),t.lineTo(u,26+(f?12:7)),t.stroke()}t.restore()}renderCue(t,e,n,s,r,a,o,l){const c=n-e.t,h=e.kind==="target"?.62:.75,u=Math.max(0,Math.min(1,c/h)),f=s+e.lane*r+r/2,m=o+70,g=e.kind==="target"?"255,196,107":"255,95,162";t.save(),t.strokeStyle=`rgba(${g},${(.9-u*.5).toFixed(3)})`,t.lineWidth=2.5,t.beginPath(),t.arc(f,m,16+u*40,0,Math.PI*2),t.stroke(),t.strokeStyle=`rgba(${g},0.35)`,t.lineWidth=1.2,t.beginPath(),t.arc(f,m,12,0,Math.PI*2),t.stroke(),t.fillStyle=`rgba(${g},0.95)`,t.font=`700 15px ${gr()}`,t.textAlign="center",t.textBaseline="middle",t.fillText(e.kind==="target"?dr[e.lane]:"×",f,m),t.fillStyle=`rgba(${g},0.85)`,t.font=`600 10px ${ni()}`,t.fillText(e.kind==="target"?"按此轨":"别按此轨",f,m+42),t.restore()}renderCountdown(t){const e=this.ctx,n=-t,{w:s,h:r}=this;e.fillStyle="rgba(4,6,26,0.6)",e.fillRect(0,0,s,r);const a=Math.ceil(n/.8),o=1-n%.8/.8;e.save(),e.textAlign="center",e.textBaseline="middle",e.fillStyle="#f2f0e9",e.font=`700 72px ${gr()}`,e.fillText(String(Math.max(1,a)),s/2,r/2-20),e.fillStyle="rgba(79,227,208,0.9)",e.font=`600 13px ${ni()}`,e.fillText("READY",s/2,r/2+34),e.strokeStyle="rgba(79,227,208,0.55)",e.lineWidth=3,e.beginPath(),e.arc(s/2,r/2-20,58,-Math.PI/2,-Math.PI/2+Math.PI*2*o),e.stroke(),e.restore()}destroy(){window.cancelAnimationFrame(this.raf),this.scheduler.stop(),qn({state:"idle",route:"/pulse",chapter:null}),window.removeEventListener("keydown",this.onKeyDown),this.canvas.removeEventListener("pointerdown",this.onPointerDown),this.onResize&&window.removeEventListener("resize",this.onResize)}}const Uh={KeyD:0,KeyF:1,KeyJ:2,KeyK:3,ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3};function Io(i,t,e,n,s,r){const a=Math.min(r,n/2,s/2);i.beginPath(),i.moveTo(t+a,e),i.arcTo(t+n,e,t+n,e+s,a),i.arcTo(t+n,e+s,t,e+s,a),i.arcTo(t,e+s,t,e,a),i.arcTo(t,e,t+n,e,a),i.closePath()}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Qa="169",Mi={ROTATE:0,DOLLY:1,PAN:2},vi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Nh=0,Uo=1,Fh=2,ec=1,Oh=2,dn=3,Ln=0,Re=1,je=2,Rn=0,Si=1,he=2,No=3,Fo=4,Bh=5,Hn=100,kh=101,zh=102,Hh=103,Gh=104,Vh=200,Wh=201,Xh=202,qh=203,ra=204,aa=205,Yh=206,Kh=207,$h=208,jh=209,Zh=210,Jh=211,Qh=212,tu=213,eu=214,oa=0,la=1,ca=2,Ti=3,ha=4,ua=5,da=6,fa=7,nc=0,nu=1,iu=2,Cn=0,su=1,ru=2,au=3,ou=4,lu=5,cu=6,hu=7,ic=300,Ai=301,Ri=302,pa=303,ma=304,Qs=306,ga=1e3,Vn=1001,_a=1002,Ue=1003,uu=1004,os=1005,Ze=1006,_r=1007,Wn=1008,_n=1009,sc=1010,rc=1011,Zi=1012,to=1013,Yn=1014,sn=1015,Ji=1016,eo=1017,no=1018,Ci=1020,ac=35902,oc=1021,lc=1022,Qe=1023,cc=1024,hc=1025,bi=1026,Pi=1027,io=1028,so=1029,uc=1030,ro=1031,ao=1033,Us=33776,Ns=33777,Fs=33778,Os=33779,va=35840,xa=35841,ya=35842,Ma=35843,Sa=36196,ba=37492,Ea=37496,wa=37808,Ta=37809,Aa=37810,Ra=37811,Ca=37812,Pa=37813,La=37814,Da=37815,Ia=37816,Ua=37817,Na=37818,Fa=37819,Oa=37820,Ba=37821,Bs=36492,ka=36494,za=36495,dc=36283,Ha=36284,Ga=36285,Va=36286,du=3200,fu=3201,fc=0,pu=1,An="",He="srgb",Dn="srgb-linear",oo="display-p3",tr="display-p3-linear",Ws="linear",re="srgb",Xs="rec709",qs="p3",ii=7680,Oo=519,mu=512,gu=513,_u=514,pc=515,vu=516,xu=517,yu=518,Mu=519,Bo=35044,ko="300 es",pn=2e3,Ys=2001;class jn{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const s=this._listeners[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}}const ye=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],ks=Math.PI/180,Wa=180/Math.PI;function Qi(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(ye[i&255]+ye[i>>8&255]+ye[i>>16&255]+ye[i>>24&255]+"-"+ye[t&255]+ye[t>>8&255]+"-"+ye[t>>16&15|64]+ye[t>>24&255]+"-"+ye[e&63|128]+ye[e>>8&255]+"-"+ye[e>>16&255]+ye[e>>24&255]+ye[n&255]+ye[n>>8&255]+ye[n>>16&255]+ye[n>>24&255]).toLowerCase()}function Ae(i,t,e){return Math.max(t,Math.min(e,i))}function Su(i,t){return(i%t+t)%t}function vr(i,t,e){return(1-e)*i+e*t}function Oi(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Le(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const bu={DEG2RAD:ks};class St{constructor(t=0,e=0){St.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Ae(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ut{constructor(t,e,n,s,r,a,o,l,c){Ut.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){const h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],m=n[5],g=n[8],v=s[0],p=s[3],d=s[6],b=s[1],y=s[4],w=s[7],L=s[2],R=s[5],A=s[8];return r[0]=a*v+o*b+l*L,r[3]=a*p+o*y+l*R,r[6]=a*d+o*w+l*A,r[1]=c*v+h*b+u*L,r[4]=c*p+h*y+u*R,r[7]=c*d+h*w+u*A,r[2]=f*v+m*b+g*L,r[5]=f*p+m*y+g*R,r[8]=f*d+m*w+g*A,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*a-o*c,f=o*l-h*r,m=c*r-a*l,g=e*u+n*f+s*m;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return t[0]=u*v,t[1]=(s*c-h*n)*v,t[2]=(o*n-s*a)*v,t[3]=f*v,t[4]=(h*e-s*l)*v,t[5]=(s*r-o*e)*v,t[6]=m*v,t[7]=(n*l-c*e)*v,t[8]=(a*e-n*r)*v,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(xr.makeScale(t,e)),this}rotate(t){return this.premultiply(xr.makeRotation(-t)),this}translate(t,e){return this.premultiply(xr.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const xr=new Ut;function mc(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Ks(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Eu(){const i=Ks("canvas");return i.style.display="block",i}const zo={};function zs(i){i in zo||(zo[i]=!0,console.warn(i))}function wu(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function Tu(i){const t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Au(i){const t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const Ho=new Ut().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Go=new Ut().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Bi={[Dn]:{transfer:Ws,primaries:Xs,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i,fromReference:i=>i},[He]:{transfer:re,primaries:Xs,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[tr]:{transfer:Ws,primaries:qs,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.applyMatrix3(Go),fromReference:i=>i.applyMatrix3(Ho)},[oo]:{transfer:re,primaries:qs,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.convertSRGBToLinear().applyMatrix3(Go),fromReference:i=>i.applyMatrix3(Ho).convertLinearToSRGB()}},Ru=new Set([Dn,tr]),Yt={enabled:!0,_workingColorSpace:Dn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!Ru.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,t,e){if(this.enabled===!1||t===e||!t||!e)return i;const n=Bi[t].toReference,s=Bi[e].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,t){return this.convert(i,this._workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this._workingColorSpace)},getPrimaries:function(i){return Bi[i].primaries},getTransfer:function(i){return i===An?Ws:Bi[i].transfer},getLuminanceCoefficients:function(i,t=this._workingColorSpace){return i.fromArray(Bi[t].luminanceCoefficients)}};function Ei(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function yr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let si;class Cu{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{si===void 0&&(si=Ks("canvas")),si.width=t.width,si.height=t.height;const n=si.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=si}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Ks("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Ei(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Ei(e[n]/255)*255):e[n]=Ei(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Pu=0;class gc{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Pu++}),this.uuid=Qi(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Mr(s[a].image)):r.push(Mr(s[a]))}else r=Mr(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function Mr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Cu.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Lu=0;class Ee extends jn{constructor(t=Ee.DEFAULT_IMAGE,e=Ee.DEFAULT_MAPPING,n=Vn,s=Vn,r=Ze,a=Wn,o=Qe,l=_n,c=Ee.DEFAULT_ANISOTROPY,h=An){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Lu++}),this.uuid=Qi(),this.name="",this.source=new gc(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new St(0,0),this.repeat=new St(1,1),this.center=new St(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ut,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==ic)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ga:t.x=t.x-Math.floor(t.x);break;case Vn:t.x=t.x<0?0:1;break;case _a:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ga:t.y=t.y-Math.floor(t.y);break;case Vn:t.y=t.y<0?0:1;break;case _a:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Ee.DEFAULT_IMAGE=null;Ee.DEFAULT_MAPPING=ic;Ee.DEFAULT_ANISOTROPY=1;class te{constructor(t=0,e=0,n=0,s=1){te.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],h=l[4],u=l[8],f=l[1],m=l[5],g=l[9],v=l[2],p=l[6],d=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-v)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+v)<.1&&Math.abs(g+p)<.1&&Math.abs(c+m+d-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const y=(c+1)/2,w=(m+1)/2,L=(d+1)/2,R=(h+f)/4,A=(u+v)/4,U=(g+p)/4;return y>w&&y>L?y<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(y),s=R/n,r=A/n):w>L?w<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(w),n=R/s,r=U/s):L<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(L),n=A/r,s=U/r),this.set(n,s,r,e),this}let b=Math.sqrt((p-g)*(p-g)+(u-v)*(u-v)+(f-h)*(f-h));return Math.abs(b)<.001&&(b=1),this.x=(p-g)/b,this.y=(u-v)/b,this.z=(f-h)/b,this.w=Math.acos((c+m+d-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Du extends jn{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new te(0,0,t,e),this.scissorTest=!1,this.viewport=new te(0,0,t,e);const s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ze,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Ee(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new gc(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Kn extends Du{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class _c extends Ee{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ue,this.minFilter=Ue,this.wrapR=Vn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Iu extends Ee{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ue,this.minFilter=Ue,this.wrapR=Vn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class $n{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3];const f=r[a+0],m=r[a+1],g=r[a+2],v=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(o===1){t[e+0]=f,t[e+1]=m,t[e+2]=g,t[e+3]=v;return}if(u!==v||l!==f||c!==m||h!==g){let p=1-o;const d=l*f+c*m+h*g+u*v,b=d>=0?1:-1,y=1-d*d;if(y>Number.EPSILON){const L=Math.sqrt(y),R=Math.atan2(L,d*b);p=Math.sin(p*R)/L,o=Math.sin(o*R)/L}const w=o*b;if(l=l*p+f*w,c=c*p+m*w,h=h*p+g*w,u=u*p+v*w,p===1-o){const L=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=L,c*=L,h*=L,u*=L}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[a],f=r[a+1],m=r[a+2],g=r[a+3];return t[e]=o*g+h*u+l*m-c*f,t[e+1]=l*g+h*f+c*u-o*m,t[e+2]=c*g+h*m+o*f-l*u,t[e+3]=h*g-o*u-l*f-c*m,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),u=o(r/2),f=l(n/2),m=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=f*h*u+c*m*g,this._y=c*m*u-f*h*g,this._z=c*h*g+f*m*u,this._w=c*h*u-f*m*g;break;case"YXZ":this._x=f*h*u+c*m*g,this._y=c*m*u-f*h*g,this._z=c*h*g-f*m*u,this._w=c*h*u+f*m*g;break;case"ZXY":this._x=f*h*u-c*m*g,this._y=c*m*u+f*h*g,this._z=c*h*g+f*m*u,this._w=c*h*u-f*m*g;break;case"ZYX":this._x=f*h*u-c*m*g,this._y=c*m*u+f*h*g,this._z=c*h*g-f*m*u,this._w=c*h*u+f*m*g;break;case"YZX":this._x=f*h*u+c*m*g,this._y=c*m*u+f*h*g,this._z=c*h*g-f*m*u,this._w=c*h*u-f*m*g;break;case"XZY":this._x=f*h*u-c*m*g,this._y=c*m*u-f*h*g,this._z=c*h*g+f*m*u,this._w=c*h*u+f*m*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],u=e[10],f=n+o+u;if(f>0){const m=.5/Math.sqrt(f+1);this._w=.25/m,this._x=(h-l)*m,this._y=(r-c)*m,this._z=(a-s)*m}else if(n>o&&n>u){const m=2*Math.sqrt(1+n-o-u);this._w=(h-l)/m,this._x=.25*m,this._y=(s+a)/m,this._z=(r+c)/m}else if(o>u){const m=2*Math.sqrt(1+o-n-u);this._w=(r-c)/m,this._x=(s+a)/m,this._y=.25*m,this._z=(l+h)/m}else{const m=2*Math.sqrt(1+u-n-o);this._w=(a-s)/m,this._x=(r+c)/m,this._y=(l+h)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Ae(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*t._w+n*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const m=1-e;return this._w=m*a+e*this._w,this._x=m*n+e*this._x,this._y=m*s+e*this._y,this._z=m*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-e)*h)/c,f=Math.sin(e*h)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class C{constructor(t=0,e=0,n=0){C.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Vo.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Vo.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),h=2*(o*e-r*s),u=2*(r*n-a*e);return this.x=e+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Sr.copy(this).projectOnVector(t),this.sub(Sr)}reflect(t){return this.sub(Sr.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Ae(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Sr=new C,Vo=new $n;class Zn{constructor(t=new C(1/0,1/0,1/0),e=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Ye.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Ye.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=Ye.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,Ye):Ye.fromBufferAttribute(r,a),Ye.applyMatrix4(t.matrixWorld),this.expandByPoint(Ye);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),ls.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ls.copy(n.boundingBox)),ls.applyMatrix4(t.matrixWorld),this.union(ls)}const s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Ye),Ye.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(ki),cs.subVectors(this.max,ki),ri.subVectors(t.a,ki),ai.subVectors(t.b,ki),oi.subVectors(t.c,ki),yn.subVectors(ai,ri),Mn.subVectors(oi,ai),Un.subVectors(ri,oi);let e=[0,-yn.z,yn.y,0,-Mn.z,Mn.y,0,-Un.z,Un.y,yn.z,0,-yn.x,Mn.z,0,-Mn.x,Un.z,0,-Un.x,-yn.y,yn.x,0,-Mn.y,Mn.x,0,-Un.y,Un.x,0];return!br(e,ri,ai,oi,cs)||(e=[1,0,0,0,1,0,0,0,1],!br(e,ri,ai,oi,cs))?!1:(hs.crossVectors(yn,Mn),e=[hs.x,hs.y,hs.z],br(e,ri,ai,oi,cs))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Ye).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Ye).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(on[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),on[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),on[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),on[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),on[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),on[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),on[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),on[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(on),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const on=[new C,new C,new C,new C,new C,new C,new C,new C],Ye=new C,ls=new Zn,ri=new C,ai=new C,oi=new C,yn=new C,Mn=new C,Un=new C,ki=new C,cs=new C,hs=new C,Nn=new C;function br(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Nn.fromArray(i,r);const o=s.x*Math.abs(Nn.x)+s.y*Math.abs(Nn.y)+s.z*Math.abs(Nn.z),l=t.dot(Nn),c=e.dot(Nn),h=n.dot(Nn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const Uu=new Zn,zi=new C,Er=new C;class Ii{constructor(t=new C,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):Uu.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;zi.subVectors(t,this.center);const e=zi.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(zi,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Er.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(zi.copy(t.center).add(Er)),this.expandByPoint(zi.copy(t.center).sub(Er))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const ln=new C,wr=new C,us=new C,Sn=new C,Tr=new C,ds=new C,Ar=new C;class er{constructor(t=new C,e=new C(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ln)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=ln.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ln.copy(this.origin).addScaledVector(this.direction,e),ln.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){wr.copy(t).add(e).multiplyScalar(.5),us.copy(e).sub(t).normalize(),Sn.copy(this.origin).sub(wr);const r=t.distanceTo(e)*.5,a=-this.direction.dot(us),o=Sn.dot(this.direction),l=-Sn.dot(us),c=Sn.lengthSq(),h=Math.abs(1-a*a);let u,f,m,g;if(h>0)if(u=a*l-o,f=a*o-l,g=r*h,u>=0)if(f>=-g)if(f<=g){const v=1/h;u*=v,f*=v,m=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=r,u=Math.max(0,-(a*f+o)),m=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(a*f+o)),m=-u*u+f*(f+2*l)+c;else f<=-g?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-l),r),m=-u*u+f*(f+2*l)+c):f<=g?(u=0,f=Math.min(Math.max(-r,-l),r),m=f*(f+2*l)+c):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-l),r),m=-u*u+f*(f+2*l)+c);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),m=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(wr).addScaledVector(us,f),m}intersectSphere(t,e){ln.subVectors(t.center,this.origin);const n=ln.dot(this.direction),s=ln.dot(ln)-n*n,r=t.radius*t.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(t.min.x-f.x)*c,s=(t.max.x-f.x)*c):(n=(t.max.x-f.x)*c,s=(t.min.x-f.x)*c),h>=0?(r=(t.min.y-f.y)*h,a=(t.max.y-f.y)*h):(r=(t.max.y-f.y)*h,a=(t.min.y-f.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(t.min.z-f.z)*u,l=(t.max.z-f.z)*u):(o=(t.max.z-f.z)*u,l=(t.min.z-f.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,ln)!==null}intersectTriangle(t,e,n,s,r){Tr.subVectors(e,t),ds.subVectors(n,t),Ar.crossVectors(Tr,ds);let a=this.direction.dot(Ar),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Sn.subVectors(this.origin,t);const l=o*this.direction.dot(ds.crossVectors(Sn,ds));if(l<0)return null;const c=o*this.direction.dot(Tr.cross(Sn));if(c<0||l+c>a)return null;const h=-o*Sn.dot(Ar);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class jt{constructor(t,e,n,s,r,a,o,l,c,h,u,f,m,g,v,p){jt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,h,u,f,m,g,v,p)}set(t,e,n,s,r,a,o,l,c,h,u,f,m,g,v,p){const d=this.elements;return d[0]=t,d[4]=e,d[8]=n,d[12]=s,d[1]=r,d[5]=a,d[9]=o,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=f,d[3]=m,d[7]=g,d[11]=v,d[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new jt().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/li.setFromMatrixColumn(t,0).length(),r=1/li.setFromMatrixColumn(t,1).length(),a=1/li.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){const f=a*h,m=a*u,g=o*h,v=o*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=m+g*c,e[5]=f-v*c,e[9]=-o*l,e[2]=v-f*c,e[6]=g+m*c,e[10]=a*l}else if(t.order==="YXZ"){const f=l*h,m=l*u,g=c*h,v=c*u;e[0]=f+v*o,e[4]=g*o-m,e[8]=a*c,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=m*o-g,e[6]=v+f*o,e[10]=a*l}else if(t.order==="ZXY"){const f=l*h,m=l*u,g=c*h,v=c*u;e[0]=f-v*o,e[4]=-a*u,e[8]=g+m*o,e[1]=m+g*o,e[5]=a*h,e[9]=v-f*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){const f=a*h,m=a*u,g=o*h,v=o*u;e[0]=l*h,e[4]=g*c-m,e[8]=f*c+v,e[1]=l*u,e[5]=v*c+f,e[9]=m*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){const f=a*l,m=a*c,g=o*l,v=o*c;e[0]=l*h,e[4]=v-f*u,e[8]=g*u+m,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=m*u+g,e[10]=f-v*u}else if(t.order==="XZY"){const f=a*l,m=a*c,g=o*l,v=o*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=f*u+v,e[5]=a*h,e[9]=m*u-g,e[2]=g*u-m,e[6]=o*h,e[10]=v*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Nu,t,Fu)}lookAt(t,e,n){const s=this.elements;return ke.subVectors(t,e),ke.lengthSq()===0&&(ke.z=1),ke.normalize(),bn.crossVectors(n,ke),bn.lengthSq()===0&&(Math.abs(n.z)===1?ke.x+=1e-4:ke.z+=1e-4,ke.normalize(),bn.crossVectors(n,ke)),bn.normalize(),fs.crossVectors(ke,bn),s[0]=bn.x,s[4]=fs.x,s[8]=ke.x,s[1]=bn.y,s[5]=fs.y,s[9]=ke.y,s[2]=bn.z,s[6]=fs.z,s[10]=ke.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],m=n[13],g=n[2],v=n[6],p=n[10],d=n[14],b=n[3],y=n[7],w=n[11],L=n[15],R=s[0],A=s[4],U=s[8],I=s[12],_=s[1],S=s[5],O=s[9],z=s[13],X=s[2],j=s[6],G=s[10],Z=s[14],W=s[3],lt=s[7],ct=s[11],_t=s[15];return r[0]=a*R+o*_+l*X+c*W,r[4]=a*A+o*S+l*j+c*lt,r[8]=a*U+o*O+l*G+c*ct,r[12]=a*I+o*z+l*Z+c*_t,r[1]=h*R+u*_+f*X+m*W,r[5]=h*A+u*S+f*j+m*lt,r[9]=h*U+u*O+f*G+m*ct,r[13]=h*I+u*z+f*Z+m*_t,r[2]=g*R+v*_+p*X+d*W,r[6]=g*A+v*S+p*j+d*lt,r[10]=g*U+v*O+p*G+d*ct,r[14]=g*I+v*z+p*Z+d*_t,r[3]=b*R+y*_+w*X+L*W,r[7]=b*A+y*S+w*j+L*lt,r[11]=b*U+y*O+w*G+L*ct,r[15]=b*I+y*z+w*Z+L*_t,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],f=t[10],m=t[14],g=t[3],v=t[7],p=t[11],d=t[15];return g*(+r*l*u-s*c*u-r*o*f+n*c*f+s*o*m-n*l*m)+v*(+e*l*m-e*c*f+r*a*f-s*a*m+s*c*h-r*l*h)+p*(+e*c*u-e*o*m-r*a*u+n*a*m+r*o*h-n*c*h)+d*(-s*o*h-e*l*u+e*o*f+s*a*u-n*a*f+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],f=t[10],m=t[11],g=t[12],v=t[13],p=t[14],d=t[15],b=u*p*c-v*f*c+v*l*m-o*p*m-u*l*d+o*f*d,y=g*f*c-h*p*c-g*l*m+a*p*m+h*l*d-a*f*d,w=h*v*c-g*u*c+g*o*m-a*v*m-h*o*d+a*u*d,L=g*u*l-h*v*l-g*o*f+a*v*f+h*o*p-a*u*p,R=e*b+n*y+s*w+r*L;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/R;return t[0]=b*A,t[1]=(v*f*r-u*p*r-v*s*m+n*p*m+u*s*d-n*f*d)*A,t[2]=(o*p*r-v*l*r+v*s*c-n*p*c-o*s*d+n*l*d)*A,t[3]=(u*l*r-o*f*r-u*s*c+n*f*c+o*s*m-n*l*m)*A,t[4]=y*A,t[5]=(h*p*r-g*f*r+g*s*m-e*p*m-h*s*d+e*f*d)*A,t[6]=(g*l*r-a*p*r-g*s*c+e*p*c+a*s*d-e*l*d)*A,t[7]=(a*f*r-h*l*r+h*s*c-e*f*c-a*s*m+e*l*m)*A,t[8]=w*A,t[9]=(g*u*r-h*v*r-g*n*m+e*v*m+h*n*d-e*u*d)*A,t[10]=(a*v*r-g*o*r+g*n*c-e*v*c-a*n*d+e*o*d)*A,t[11]=(h*o*r-a*u*r-h*n*c+e*u*c+a*n*m-e*o*m)*A,t[12]=L*A,t[13]=(h*v*s-g*u*s+g*n*f-e*v*f-h*n*p+e*u*p)*A,t[14]=(g*o*s-a*v*s-g*n*l+e*v*l+a*n*p-e*o*p)*A,t[15]=(a*u*s-h*o*s+h*n*l-e*u*l-a*n*f+e*o*f)*A,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,u=o+o,f=r*c,m=r*h,g=r*u,v=a*h,p=a*u,d=o*u,b=l*c,y=l*h,w=l*u,L=n.x,R=n.y,A=n.z;return s[0]=(1-(v+d))*L,s[1]=(m+w)*L,s[2]=(g-y)*L,s[3]=0,s[4]=(m-w)*R,s[5]=(1-(f+d))*R,s[6]=(p+b)*R,s[7]=0,s[8]=(g+y)*A,s[9]=(p-b)*A,s[10]=(1-(f+v))*A,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let r=li.set(s[0],s[1],s[2]).length();const a=li.set(s[4],s[5],s[6]).length(),o=li.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],Ke.copy(this);const c=1/r,h=1/a,u=1/o;return Ke.elements[0]*=c,Ke.elements[1]*=c,Ke.elements[2]*=c,Ke.elements[4]*=h,Ke.elements[5]*=h,Ke.elements[6]*=h,Ke.elements[8]*=u,Ke.elements[9]*=u,Ke.elements[10]*=u,e.setFromRotationMatrix(Ke),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,s,r,a,o=pn){const l=this.elements,c=2*r/(e-t),h=2*r/(n-s),u=(e+t)/(e-t),f=(n+s)/(n-s);let m,g;if(o===pn)m=-(a+r)/(a-r),g=-2*a*r/(a-r);else if(o===Ys)m=-a/(a-r),g=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=pn){const l=this.elements,c=1/(e-t),h=1/(n-s),u=1/(a-r),f=(e+t)*c,m=(n+s)*h;let g,v;if(o===pn)g=(a+r)*u,v=-2*u;else if(o===Ys)g=r*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-m,l[2]=0,l[6]=0,l[10]=v,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const li=new C,Ke=new jt,Nu=new C(0,0,0),Fu=new C(1,1,1),bn=new C,fs=new C,ke=new C,Wo=new jt,Xo=new $n;class rn{constructor(t=0,e=0,n=0,s=rn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],m=s[10];switch(e){case"XYZ":this._y=Math.asin(Ae(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,m),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ae(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ae(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,m),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ae(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,m),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Ae(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-Ae(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,m),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Wo.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Wo,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Xo.setFromEuler(this),this.setFromQuaternion(Xo,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}rn.DEFAULT_ORDER="XYZ";class lo{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Ou=0;const qo=new C,ci=new $n,cn=new jt,ps=new C,Hi=new C,Bu=new C,ku=new $n,Yo=new C(1,0,0),Ko=new C(0,1,0),$o=new C(0,0,1),jo={type:"added"},zu={type:"removed"},hi={type:"childadded",child:null},Rr={type:"childremoved",child:null};class _e extends jn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ou++}),this.uuid=Qi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=_e.DEFAULT_UP.clone();const t=new C,e=new rn,n=new $n,s=new C(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new jt},normalMatrix:{value:new Ut}}),this.matrix=new jt,this.matrixWorld=new jt,this.matrixAutoUpdate=_e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=_e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new lo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return ci.setFromAxisAngle(t,e),this.quaternion.multiply(ci),this}rotateOnWorldAxis(t,e){return ci.setFromAxisAngle(t,e),this.quaternion.premultiply(ci),this}rotateX(t){return this.rotateOnAxis(Yo,t)}rotateY(t){return this.rotateOnAxis(Ko,t)}rotateZ(t){return this.rotateOnAxis($o,t)}translateOnAxis(t,e){return qo.copy(t).applyQuaternion(this.quaternion),this.position.add(qo.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Yo,t)}translateY(t){return this.translateOnAxis(Ko,t)}translateZ(t){return this.translateOnAxis($o,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(cn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?ps.copy(t):ps.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Hi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?cn.lookAt(Hi,ps,this.up):cn.lookAt(ps,Hi,this.up),this.quaternion.setFromRotationMatrix(cn),s&&(cn.extractRotation(s.matrixWorld),ci.setFromRotationMatrix(cn),this.quaternion.premultiply(ci.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(jo),hi.child=t,this.dispatchEvent(hi),hi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(zu),Rr.child=t,this.dispatchEvent(Rr),Rr.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),cn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),cn.multiply(t.parent.matrixWorld)),t.applyMatrix4(cn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(jo),hi.child=t,this.dispatchEvent(hi),hi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Hi,t,Bu),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Hi,ku,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),u=a(t.shapes),f=a(t.skeletons),m=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),m.length>0&&(n.animations=m),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}_e.DEFAULT_UP=new C(0,1,0);_e.DEFAULT_MATRIX_AUTO_UPDATE=!0;_e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const $e=new C,hn=new C,Cr=new C,un=new C,ui=new C,di=new C,Zo=new C,Pr=new C,Lr=new C,Dr=new C,Ir=new te,Ur=new te,Nr=new te;class Je{constructor(t=new C,e=new C,n=new C){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),$e.subVectors(t,e),s.cross($e);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){$e.subVectors(s,e),hn.subVectors(n,e),Cr.subVectors(t,e);const a=$e.dot($e),o=$e.dot(hn),l=$e.dot(Cr),c=hn.dot(hn),h=hn.dot(Cr),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const f=1/u,m=(c*l-o*h)*f,g=(a*h-o*l)*f;return r.set(1-m-g,g,m)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,un)===null?!1:un.x>=0&&un.y>=0&&un.x+un.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,un)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,un.x),l.addScaledVector(a,un.y),l.addScaledVector(o,un.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return Ir.setScalar(0),Ur.setScalar(0),Nr.setScalar(0),Ir.fromBufferAttribute(t,e),Ur.fromBufferAttribute(t,n),Nr.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Ir,r.x),a.addScaledVector(Ur,r.y),a.addScaledVector(Nr,r.z),a}static isFrontFacing(t,e,n,s){return $e.subVectors(n,e),hn.subVectors(t,e),$e.cross(hn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return $e.subVectors(this.c,this.b),hn.subVectors(this.a,this.b),$e.cross(hn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Je.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return Je.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return Je.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return Je.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Je.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let a,o;ui.subVectors(s,n),di.subVectors(r,n),Pr.subVectors(t,n);const l=ui.dot(Pr),c=di.dot(Pr);if(l<=0&&c<=0)return e.copy(n);Lr.subVectors(t,s);const h=ui.dot(Lr),u=di.dot(Lr);if(h>=0&&u<=h)return e.copy(s);const f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(ui,a);Dr.subVectors(t,r);const m=ui.dot(Dr),g=di.dot(Dr);if(g>=0&&m<=g)return e.copy(r);const v=m*c-l*g;if(v<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(di,o);const p=h*g-m*u;if(p<=0&&u-h>=0&&m-g>=0)return Zo.subVectors(r,s),o=(u-h)/(u-h+(m-g)),e.copy(s).addScaledVector(Zo,o);const d=1/(p+v+f);return a=v*d,o=f*d,e.copy(n).addScaledVector(ui,a).addScaledVector(di,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const vc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},En={h:0,s:0,l:0},ms={h:0,s:0,l:0};function Fr(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class Tt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=He){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Yt.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=Yt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Yt.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=Yt.workingColorSpace){if(t=Su(t,1),e=Ae(e,0,1),n=Ae(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Fr(a,r,t+1/3),this.g=Fr(a,r,t),this.b=Fr(a,r,t-1/3)}return Yt.toWorkingColorSpace(this,s),this}setStyle(t,e=He){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=He){const n=vc[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Ei(t.r),this.g=Ei(t.g),this.b=Ei(t.b),this}copyLinearToSRGB(t){return this.r=yr(t.r),this.g=yr(t.g),this.b=yr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=He){return Yt.fromWorkingColorSpace(Me.copy(this),t),Math.round(Ae(Me.r*255,0,255))*65536+Math.round(Ae(Me.g*255,0,255))*256+Math.round(Ae(Me.b*255,0,255))}getHexString(t=He){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Yt.workingColorSpace){Yt.fromWorkingColorSpace(Me.copy(this),e);const n=Me.r,s=Me.g,r=Me.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=Yt.workingColorSpace){return Yt.fromWorkingColorSpace(Me.copy(this),e),t.r=Me.r,t.g=Me.g,t.b=Me.b,t}getStyle(t=He){Yt.fromWorkingColorSpace(Me.copy(this),t);const e=Me.r,n=Me.g,s=Me.b;return t!==He?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(En),this.setHSL(En.h+t,En.s+e,En.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(En),t.getHSL(ms);const n=vr(En.h,ms.h,e),s=vr(En.s,ms.s,e),r=vr(En.l,ms.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Me=new Tt;Tt.NAMES=vc;let Hu=0;class Ui extends jn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Hu++}),this.uuid=Qi(),this.name="",this.type="Material",this.blending=Si,this.side=Ln,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ra,this.blendDst=aa,this.blendEquation=Hn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Tt(0,0,0),this.blendAlpha=0,this.depthFunc=Ti,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Oo,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ii,this.stencilZFail=ii,this.stencilZPass=ii,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Si&&(n.blending=this.blending),this.side!==Ln&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==ra&&(n.blendSrc=this.blendSrc),this.blendDst!==aa&&(n.blendDst=this.blendDst),this.blendEquation!==Hn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ti&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Oo&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ii&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ii&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ii&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(e){const r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Jt extends Ui{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Tt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new rn,this.combine=nc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const ce=new C,gs=new St;class tn{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Bo,this.updateRanges=[],this.gpuType=sn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)gs.fromBufferAttribute(this,e),gs.applyMatrix3(t),this.setXY(e,gs.x,gs.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ce.fromBufferAttribute(this,e),ce.applyMatrix3(t),this.setXYZ(e,ce.x,ce.y,ce.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ce.fromBufferAttribute(this,e),ce.applyMatrix4(t),this.setXYZ(e,ce.x,ce.y,ce.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ce.fromBufferAttribute(this,e),ce.applyNormalMatrix(t),this.setXYZ(e,ce.x,ce.y,ce.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ce.fromBufferAttribute(this,e),ce.transformDirection(t),this.setXYZ(e,ce.x,ce.y,ce.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Oi(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Le(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Oi(e,this.array)),e}setX(t,e){return this.normalized&&(e=Le(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Oi(e,this.array)),e}setY(t,e){return this.normalized&&(e=Le(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Oi(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Le(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Oi(e,this.array)),e}setW(t,e){return this.normalized&&(e=Le(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Le(e,this.array),n=Le(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Le(e,this.array),n=Le(n,this.array),s=Le(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=Le(e,this.array),n=Le(n,this.array),s=Le(s,this.array),r=Le(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Bo&&(t.usage=this.usage),t}}class xc extends tn{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class yc extends tn{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class ne extends tn{constructor(t,e,n){super(new Float32Array(t),e,n)}}let Gu=0;const We=new jt,Or=new _e,fi=new C,ze=new Zn,Gi=new Zn,me=new C;class Ne extends jn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Gu++}),this.uuid=Qi(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(mc(t)?yc:xc)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ut().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return We.makeRotationFromQuaternion(t),this.applyMatrix4(We),this}rotateX(t){return We.makeRotationX(t),this.applyMatrix4(We),this}rotateY(t){return We.makeRotationY(t),this.applyMatrix4(We),this}rotateZ(t){return We.makeRotationZ(t),this.applyMatrix4(We),this}translate(t,e,n){return We.makeTranslation(t,e,n),this.applyMatrix4(We),this}scale(t,e,n){return We.makeScale(t,e,n),this.applyMatrix4(We),this}lookAt(t){return Or.lookAt(t),Or.updateMatrix(),this.applyMatrix4(Or.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(fi).negate(),this.translate(fi.x,fi.y,fi.z),this}setFromPoints(t){const e=[];for(let n=0,s=t.length;n<s;n++){const r=t[n];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new ne(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Zn);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];ze.setFromBufferAttribute(r),this.morphTargetsRelative?(me.addVectors(this.boundingBox.min,ze.min),this.boundingBox.expandByPoint(me),me.addVectors(this.boundingBox.max,ze.max),this.boundingBox.expandByPoint(me)):(this.boundingBox.expandByPoint(ze.min),this.boundingBox.expandByPoint(ze.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ii);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(t){const n=this.boundingSphere.center;if(ze.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){const o=e[r];Gi.setFromBufferAttribute(o),this.morphTargetsRelative?(me.addVectors(ze.min,Gi.min),ze.expandByPoint(me),me.addVectors(ze.max,Gi.max),ze.expandByPoint(me)):(ze.expandByPoint(Gi.min),ze.expandByPoint(Gi.max))}ze.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)me.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(me));if(e)for(let r=0,a=e.length;r<a;r++){const o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)me.fromBufferAttribute(o,c),l&&(fi.fromBufferAttribute(t,c),me.add(fi)),s=Math.max(s,n.distanceToSquared(me))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new tn(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let U=0;U<n.count;U++)o[U]=new C,l[U]=new C;const c=new C,h=new C,u=new C,f=new St,m=new St,g=new St,v=new C,p=new C;function d(U,I,_){c.fromBufferAttribute(n,U),h.fromBufferAttribute(n,I),u.fromBufferAttribute(n,_),f.fromBufferAttribute(r,U),m.fromBufferAttribute(r,I),g.fromBufferAttribute(r,_),h.sub(c),u.sub(c),m.sub(f),g.sub(f);const S=1/(m.x*g.y-g.x*m.y);isFinite(S)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(u,-m.y).multiplyScalar(S),p.copy(u).multiplyScalar(m.x).addScaledVector(h,-g.x).multiplyScalar(S),o[U].add(v),o[I].add(v),o[_].add(v),l[U].add(p),l[I].add(p),l[_].add(p))}let b=this.groups;b.length===0&&(b=[{start:0,count:t.count}]);for(let U=0,I=b.length;U<I;++U){const _=b[U],S=_.start,O=_.count;for(let z=S,X=S+O;z<X;z+=3)d(t.getX(z+0),t.getX(z+1),t.getX(z+2))}const y=new C,w=new C,L=new C,R=new C;function A(U){L.fromBufferAttribute(s,U),R.copy(L);const I=o[U];y.copy(I),y.sub(L.multiplyScalar(L.dot(I))).normalize(),w.crossVectors(R,I);const S=w.dot(l[U])<0?-1:1;a.setXYZW(U,y.x,y.y,y.z,S)}for(let U=0,I=b.length;U<I;++U){const _=b[U],S=_.start,O=_.count;for(let z=S,X=S+O;z<X;z+=3)A(t.getX(z+0)),A(t.getX(z+1)),A(t.getX(z+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new tn(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let f=0,m=n.count;f<m;f++)n.setXYZ(f,0,0,0);const s=new C,r=new C,a=new C,o=new C,l=new C,c=new C,h=new C,u=new C;if(t)for(let f=0,m=t.count;f<m;f+=3){const g=t.getX(f+0),v=t.getX(f+1),p=t.getX(f+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,v),a.fromBufferAttribute(e,p),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,p),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let f=0,m=e.count;f<m;f+=3)s.fromBufferAttribute(e,f+0),r.fromBufferAttribute(e,f+1),a.fromBufferAttribute(e,f+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)me.fromBufferAttribute(t,e),me.normalize(),t.setXYZ(e,me.x,me.y,me.z)}toNonIndexed(){function t(o,l){const c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h);let m=0,g=0;for(let v=0,p=l.length;v<p;v++){o.isInterleavedBufferAttribute?m=l[v]*o.data.stride+o.offset:m=l[v]*h;for(let d=0;d<h;d++)f[g++]=c[m++]}return new tn(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Ne,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=t(l,n);e.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const f=c[h],m=t(f,n);l.push(m)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){const m=c[u];h.push(m.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const s=t.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],u=r[c];for(let f=0,m=u.length;f<m;f++)h.push(u[f].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Jo=new jt,Fn=new er,_s=new Ii,Qo=new C,vs=new C,xs=new C,ys=new C,Br=new C,Ms=new C,tl=new C,Ss=new C;class Mt extends _e{constructor(t=new Ne,e=new Jt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const o=this.morphTargetInfluences;if(r&&o){Ms.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(Br.fromBufferAttribute(u,t),a?Ms.addScaledVector(Br,h):Ms.addScaledVector(Br.sub(e),h))}e.add(Ms)}return e}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),_s.copy(n.boundingSphere),_s.applyMatrix4(r),Fn.copy(t.ray).recast(t.near),!(_s.containsPoint(Fn.origin)===!1&&(Fn.intersectSphere(_s,Qo)===null||Fn.origin.distanceToSquared(Qo)>(t.far-t.near)**2))&&(Jo.copy(r).invert(),Fn.copy(t.ray).applyMatrix4(Jo),!(n.boundingBox!==null&&Fn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Fn)))}_computeIntersections(t,e,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,m=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=f.length;g<v;g++){const p=f[g],d=a[p.materialIndex],b=Math.max(p.start,m.start),y=Math.min(o.count,Math.min(p.start+p.count,m.start+m.count));for(let w=b,L=y;w<L;w+=3){const R=o.getX(w),A=o.getX(w+1),U=o.getX(w+2);s=bs(this,d,t,n,c,h,u,R,A,U),s&&(s.faceIndex=Math.floor(w/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{const g=Math.max(0,m.start),v=Math.min(o.count,m.start+m.count);for(let p=g,d=v;p<d;p+=3){const b=o.getX(p),y=o.getX(p+1),w=o.getX(p+2);s=bs(this,a,t,n,c,h,u,b,y,w),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,v=f.length;g<v;g++){const p=f[g],d=a[p.materialIndex],b=Math.max(p.start,m.start),y=Math.min(l.count,Math.min(p.start+p.count,m.start+m.count));for(let w=b,L=y;w<L;w+=3){const R=w,A=w+1,U=w+2;s=bs(this,d,t,n,c,h,u,R,A,U),s&&(s.faceIndex=Math.floor(w/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{const g=Math.max(0,m.start),v=Math.min(l.count,m.start+m.count);for(let p=g,d=v;p<d;p+=3){const b=p,y=p+1,w=p+2;s=bs(this,a,t,n,c,h,u,b,y,w),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}}}function Vu(i,t,e,n,s,r,a,o){let l;if(t.side===Re?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===Ln,o),l===null)return null;Ss.copy(o),Ss.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(Ss);return c<e.near||c>e.far?null:{distance:c,point:Ss.clone(),object:i}}function bs(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,vs),i.getVertexPosition(l,xs),i.getVertexPosition(c,ys);const h=Vu(i,t,e,n,vs,xs,ys,tl);if(h){const u=new C;Je.getBarycoord(tl,vs,xs,ys,u),s&&(h.uv=Je.getInterpolatedAttribute(s,o,l,c,u,new St)),r&&(h.uv1=Je.getInterpolatedAttribute(r,o,l,c,u,new St)),a&&(h.normal=Je.getInterpolatedAttribute(a,o,l,c,u,new C),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new C,materialIndex:0};Je.getNormal(vs,xs,ys,f.normal),h.face=f,h.barycoord=u}return h}class be extends Ne{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let f=0,m=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,s,a,2),g("x","z","y",1,-1,t,n,-e,s,a,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new ne(c,3)),this.setAttribute("normal",new ne(h,3)),this.setAttribute("uv",new ne(u,2));function g(v,p,d,b,y,w,L,R,A,U,I){const _=w/A,S=L/U,O=w/2,z=L/2,X=R/2,j=A+1,G=U+1;let Z=0,W=0;const lt=new C;for(let ct=0;ct<G;ct++){const _t=ct*S-z;for(let Vt=0;Vt<j;Vt++){const Kt=Vt*_-O;lt[v]=Kt*b,lt[p]=_t*y,lt[d]=X,c.push(lt.x,lt.y,lt.z),lt[v]=0,lt[p]=0,lt[d]=R>0?1:-1,h.push(lt.x,lt.y,lt.z),u.push(Vt/A),u.push(1-ct/U),Z+=1}}for(let ct=0;ct<U;ct++)for(let _t=0;_t<A;_t++){const Vt=f+_t+j*ct,Kt=f+_t+j*(ct+1),q=f+(_t+1)+j*(ct+1),Q=f+(_t+1)+j*ct;l.push(Vt,Kt,Q),l.push(Kt,q,Q),W+=6}o.addGroup(m,W,I),m+=W,f+=Z}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new be(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Li(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function we(i){const t={};for(let e=0;e<i.length;e++){const n=Li(i[e]);for(const s in n)t[s]=n[s]}return t}function Wu(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Mc(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Yt.workingColorSpace}const Xu={clone:Li,merge:we};var qu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Yu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class vn extends Ui{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=qu,this.fragmentShader=Yu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Li(t.uniforms),this.uniformsGroups=Wu(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Sc extends _e{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new jt,this.projectionMatrix=new jt,this.projectionMatrixInverse=new jt,this.coordinateSystem=pn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const wn=new C,el=new St,nl=new St;class Ie extends Sc{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Wa*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(ks*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Wa*2*Math.atan(Math.tan(ks*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){wn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(wn.x,wn.y).multiplyScalar(-t/wn.z),wn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(wn.x,wn.y).multiplyScalar(-t/wn.z)}getViewSize(t,e){return this.getViewBounds(t,el,nl),e.subVectors(nl,el)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(ks*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const pi=-90,mi=1;class Ku extends _e{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Ie(pi,mi,t,e);s.layers=this.layers,this.add(s);const r=new Ie(pi,mi,t,e);r.layers=this.layers,this.add(r);const a=new Ie(pi,mi,t,e);a.layers=this.layers,this.add(a);const o=new Ie(pi,mi,t,e);o.layers=this.layers,this.add(o);const l=new Ie(pi,mi,t,e);l.layers=this.layers,this.add(l);const c=new Ie(pi,mi,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(const c of e)this.remove(c);if(t===pn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Ys)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),m=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,a),t.setRenderTarget(n,2,s),t.render(e,o),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(u,f,m),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class bc extends Ee{constructor(t,e,n,s,r,a,o,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:Ai,super(t,e,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class $u extends Kn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new bc(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:Ze}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new be(5,5,5),r=new vn({name:"CubemapFromEquirect",uniforms:Li(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Re,blending:Rn});r.uniforms.tEquirect.value=e;const a=new Mt(s,r),o=e.minFilter;return e.minFilter===Wn&&(e.minFilter=Ze),new Ku(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,n,s){const r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}}const kr=new C,ju=new C,Zu=new Ut;class Tn{constructor(t=new C(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=kr.subVectors(n,e).cross(ju.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(kr),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||Zu.getNormalMatrix(t),s=this.coplanarPoint(kr).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const On=new Ii,Es=new C;class co{constructor(t=new Tn,e=new Tn,n=new Tn,s=new Tn,r=new Tn,a=new Tn){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=pn){const n=this.planes,s=t.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],h=s[5],u=s[6],f=s[7],m=s[8],g=s[9],v=s[10],p=s[11],d=s[12],b=s[13],y=s[14],w=s[15];if(n[0].setComponents(l-r,f-c,p-m,w-d).normalize(),n[1].setComponents(l+r,f+c,p+m,w+d).normalize(),n[2].setComponents(l+a,f+h,p+g,w+b).normalize(),n[3].setComponents(l-a,f-h,p-g,w-b).normalize(),n[4].setComponents(l-o,f-u,p-v,w-y).normalize(),e===pn)n[5].setComponents(l+o,f+u,p+v,w+y).normalize();else if(e===Ys)n[5].setComponents(o,u,v,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),On.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),On.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(On)}intersectsSprite(t){return On.center.set(0,0,0),On.radius=.7071067811865476,On.applyMatrix4(t.matrixWorld),this.intersectsSphere(On)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(Es.x=s.normal.x>0?t.max.x:t.min.x,Es.y=s.normal.y>0?t.max.y:t.min.y,Es.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Es)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Ec(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Ju(i){const t=new WeakMap;function e(o,l){const c=o.array,h=o.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,h),o.onUploadCallback();let m;if(c instanceof Float32Array)m=i.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?m=i.HALF_FLOAT:m=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=i.SHORT;else if(c instanceof Uint32Array)m=i.UNSIGNED_INT;else if(c instanceof Int32Array)m=i.INT;else if(c instanceof Int8Array)m=i.BYTE;else if(c instanceof Uint8Array)m=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((m,g)=>m.start-g.start);let f=0;for(let m=1;m<u.length;m++){const g=u[f],v=u[m];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++f,u[f]=v)}u.length=f+1;for(let m=0,g=u.length;m<g;m++){const v=u[m];i.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}class ts extends Ne{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,u=t/o,f=e/l,m=[],g=[],v=[],p=[];for(let d=0;d<h;d++){const b=d*f-a;for(let y=0;y<c;y++){const w=y*u-r;g.push(w,-b,0),v.push(0,0,1),p.push(y/o),p.push(1-d/l)}}for(let d=0;d<l;d++)for(let b=0;b<o;b++){const y=b+c*d,w=b+c*(d+1),L=b+1+c*(d+1),R=b+1+c*d;m.push(y,w,R),m.push(w,L,R)}this.setIndex(m),this.setAttribute("position",new ne(g,3)),this.setAttribute("normal",new ne(v,3)),this.setAttribute("uv",new ne(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ts(t.width,t.height,t.widthSegments,t.heightSegments)}}var Qu=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,td=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ed=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,nd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,id=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,sd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,rd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,ad=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,od=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,ld=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,cd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,hd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,ud=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,dd=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,fd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,pd=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,md=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,gd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,_d=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,vd=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,xd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,yd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Md=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Sd=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,bd=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Ed=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,wd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Td=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Ad=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Rd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Cd="gl_FragColor = linearToOutputTexel( gl_FragColor );",Pd=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Ld=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Dd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Id=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Ud=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Nd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Fd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Od=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Bd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,kd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,zd=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Hd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Gd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Vd=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Wd=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Xd=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,qd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Yd=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Kd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,$d=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,jd=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Zd=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Jd=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Qd=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,tf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ef=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,nf=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,sf=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,rf=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,af=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,of=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,lf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,cf=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,hf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,uf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,df=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ff=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,pf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,mf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,gf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,_f=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,vf=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,xf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,yf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Mf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Sf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,bf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Ef=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,wf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Tf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Af=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Rf=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Cf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Pf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Lf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Df=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,If=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Uf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Nf=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Ff=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Of=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Bf=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,kf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,zf=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Hf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Gf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Vf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Wf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Xf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,qf=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Yf=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Kf=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,$f=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,jf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Zf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Jf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Qf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,tp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ep=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,np=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ip=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,sp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,rp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,ap=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,op=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,lp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,cp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,hp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,up=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,dp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,fp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,pp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,gp=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_p=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,vp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,yp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Mp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Sp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Ep=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Tp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ap=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Rp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Cp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Pp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Lp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Dp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,It={alphahash_fragment:Qu,alphahash_pars_fragment:td,alphamap_fragment:ed,alphamap_pars_fragment:nd,alphatest_fragment:id,alphatest_pars_fragment:sd,aomap_fragment:rd,aomap_pars_fragment:ad,batching_pars_vertex:od,batching_vertex:ld,begin_vertex:cd,beginnormal_vertex:hd,bsdfs:ud,iridescence_fragment:dd,bumpmap_pars_fragment:fd,clipping_planes_fragment:pd,clipping_planes_pars_fragment:md,clipping_planes_pars_vertex:gd,clipping_planes_vertex:_d,color_fragment:vd,color_pars_fragment:xd,color_pars_vertex:yd,color_vertex:Md,common:Sd,cube_uv_reflection_fragment:bd,defaultnormal_vertex:Ed,displacementmap_pars_vertex:wd,displacementmap_vertex:Td,emissivemap_fragment:Ad,emissivemap_pars_fragment:Rd,colorspace_fragment:Cd,colorspace_pars_fragment:Pd,envmap_fragment:Ld,envmap_common_pars_fragment:Dd,envmap_pars_fragment:Id,envmap_pars_vertex:Ud,envmap_physical_pars_fragment:Xd,envmap_vertex:Nd,fog_vertex:Fd,fog_pars_vertex:Od,fog_fragment:Bd,fog_pars_fragment:kd,gradientmap_pars_fragment:zd,lightmap_pars_fragment:Hd,lights_lambert_fragment:Gd,lights_lambert_pars_fragment:Vd,lights_pars_begin:Wd,lights_toon_fragment:qd,lights_toon_pars_fragment:Yd,lights_phong_fragment:Kd,lights_phong_pars_fragment:$d,lights_physical_fragment:jd,lights_physical_pars_fragment:Zd,lights_fragment_begin:Jd,lights_fragment_maps:Qd,lights_fragment_end:tf,logdepthbuf_fragment:ef,logdepthbuf_pars_fragment:nf,logdepthbuf_pars_vertex:sf,logdepthbuf_vertex:rf,map_fragment:af,map_pars_fragment:of,map_particle_fragment:lf,map_particle_pars_fragment:cf,metalnessmap_fragment:hf,metalnessmap_pars_fragment:uf,morphinstance_vertex:df,morphcolor_vertex:ff,morphnormal_vertex:pf,morphtarget_pars_vertex:mf,morphtarget_vertex:gf,normal_fragment_begin:_f,normal_fragment_maps:vf,normal_pars_fragment:xf,normal_pars_vertex:yf,normal_vertex:Mf,normalmap_pars_fragment:Sf,clearcoat_normal_fragment_begin:bf,clearcoat_normal_fragment_maps:Ef,clearcoat_pars_fragment:wf,iridescence_pars_fragment:Tf,opaque_fragment:Af,packing:Rf,premultiplied_alpha_fragment:Cf,project_vertex:Pf,dithering_fragment:Lf,dithering_pars_fragment:Df,roughnessmap_fragment:If,roughnessmap_pars_fragment:Uf,shadowmap_pars_fragment:Nf,shadowmap_pars_vertex:Ff,shadowmap_vertex:Of,shadowmask_pars_fragment:Bf,skinbase_vertex:kf,skinning_pars_vertex:zf,skinning_vertex:Hf,skinnormal_vertex:Gf,specularmap_fragment:Vf,specularmap_pars_fragment:Wf,tonemapping_fragment:Xf,tonemapping_pars_fragment:qf,transmission_fragment:Yf,transmission_pars_fragment:Kf,uv_pars_fragment:$f,uv_pars_vertex:jf,uv_vertex:Zf,worldpos_vertex:Jf,background_vert:Qf,background_frag:tp,backgroundCube_vert:ep,backgroundCube_frag:np,cube_vert:ip,cube_frag:sp,depth_vert:rp,depth_frag:ap,distanceRGBA_vert:op,distanceRGBA_frag:lp,equirect_vert:cp,equirect_frag:hp,linedashed_vert:up,linedashed_frag:dp,meshbasic_vert:fp,meshbasic_frag:pp,meshlambert_vert:mp,meshlambert_frag:gp,meshmatcap_vert:_p,meshmatcap_frag:vp,meshnormal_vert:xp,meshnormal_frag:yp,meshphong_vert:Mp,meshphong_frag:Sp,meshphysical_vert:bp,meshphysical_frag:Ep,meshtoon_vert:wp,meshtoon_frag:Tp,points_vert:Ap,points_frag:Rp,shadow_vert:Cp,shadow_frag:Pp,sprite_vert:Lp,sprite_frag:Dp},nt={common:{diffuse:{value:new Tt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ut},alphaMap:{value:null},alphaMapTransform:{value:new Ut},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ut}},envmap:{envMap:{value:null},envMapRotation:{value:new Ut},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ut}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ut}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ut},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ut},normalScale:{value:new St(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ut},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ut}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ut}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ut}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Tt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Tt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ut},alphaTest:{value:0},uvTransform:{value:new Ut}},sprite:{diffuse:{value:new Tt(16777215)},opacity:{value:1},center:{value:new St(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ut},alphaMap:{value:null},alphaMapTransform:{value:new Ut},alphaTest:{value:0}}},en={basic:{uniforms:we([nt.common,nt.specularmap,nt.envmap,nt.aomap,nt.lightmap,nt.fog]),vertexShader:It.meshbasic_vert,fragmentShader:It.meshbasic_frag},lambert:{uniforms:we([nt.common,nt.specularmap,nt.envmap,nt.aomap,nt.lightmap,nt.emissivemap,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.fog,nt.lights,{emissive:{value:new Tt(0)}}]),vertexShader:It.meshlambert_vert,fragmentShader:It.meshlambert_frag},phong:{uniforms:we([nt.common,nt.specularmap,nt.envmap,nt.aomap,nt.lightmap,nt.emissivemap,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.fog,nt.lights,{emissive:{value:new Tt(0)},specular:{value:new Tt(1118481)},shininess:{value:30}}]),vertexShader:It.meshphong_vert,fragmentShader:It.meshphong_frag},standard:{uniforms:we([nt.common,nt.envmap,nt.aomap,nt.lightmap,nt.emissivemap,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.roughnessmap,nt.metalnessmap,nt.fog,nt.lights,{emissive:{value:new Tt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:It.meshphysical_vert,fragmentShader:It.meshphysical_frag},toon:{uniforms:we([nt.common,nt.aomap,nt.lightmap,nt.emissivemap,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.gradientmap,nt.fog,nt.lights,{emissive:{value:new Tt(0)}}]),vertexShader:It.meshtoon_vert,fragmentShader:It.meshtoon_frag},matcap:{uniforms:we([nt.common,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.fog,{matcap:{value:null}}]),vertexShader:It.meshmatcap_vert,fragmentShader:It.meshmatcap_frag},points:{uniforms:we([nt.points,nt.fog]),vertexShader:It.points_vert,fragmentShader:It.points_frag},dashed:{uniforms:we([nt.common,nt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:It.linedashed_vert,fragmentShader:It.linedashed_frag},depth:{uniforms:we([nt.common,nt.displacementmap]),vertexShader:It.depth_vert,fragmentShader:It.depth_frag},normal:{uniforms:we([nt.common,nt.bumpmap,nt.normalmap,nt.displacementmap,{opacity:{value:1}}]),vertexShader:It.meshnormal_vert,fragmentShader:It.meshnormal_frag},sprite:{uniforms:we([nt.sprite,nt.fog]),vertexShader:It.sprite_vert,fragmentShader:It.sprite_frag},background:{uniforms:{uvTransform:{value:new Ut},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:It.background_vert,fragmentShader:It.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ut}},vertexShader:It.backgroundCube_vert,fragmentShader:It.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:It.cube_vert,fragmentShader:It.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:It.equirect_vert,fragmentShader:It.equirect_frag},distanceRGBA:{uniforms:we([nt.common,nt.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:It.distanceRGBA_vert,fragmentShader:It.distanceRGBA_frag},shadow:{uniforms:we([nt.lights,nt.fog,{color:{value:new Tt(0)},opacity:{value:1}}]),vertexShader:It.shadow_vert,fragmentShader:It.shadow_frag}};en.physical={uniforms:we([en.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ut},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ut},clearcoatNormalScale:{value:new St(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ut},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ut},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ut},sheen:{value:0},sheenColor:{value:new Tt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ut},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ut},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ut},transmissionSamplerSize:{value:new St},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ut},attenuationDistance:{value:0},attenuationColor:{value:new Tt(0)},specularColor:{value:new Tt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ut},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ut},anisotropyVector:{value:new St},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ut}}]),vertexShader:It.meshphysical_vert,fragmentShader:It.meshphysical_frag};const ws={r:0,b:0,g:0},Bn=new rn,Ip=new jt;function Up(i,t,e,n,s,r,a){const o=new Tt(0);let l=r===!0?0:1,c,h,u=null,f=0,m=null;function g(b){let y=b.isScene===!0?b.background:null;return y&&y.isTexture&&(y=(b.backgroundBlurriness>0?e:t).get(y)),y}function v(b){let y=!1;const w=g(b);w===null?d(o,l):w&&w.isColor&&(d(w,1),y=!0);const L=i.xr.getEnvironmentBlendMode();L==="additive"?n.buffers.color.setClear(0,0,0,1,a):L==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function p(b,y){const w=g(y);w&&(w.isCubeTexture||w.mapping===Qs)?(h===void 0&&(h=new Mt(new be(1,1,1),new vn({name:"BackgroundCubeMaterial",uniforms:Li(en.backgroundCube.uniforms),vertexShader:en.backgroundCube.vertexShader,fragmentShader:en.backgroundCube.fragmentShader,side:Re,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(L,R,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),Bn.copy(y.backgroundRotation),Bn.x*=-1,Bn.y*=-1,Bn.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(Bn.y*=-1,Bn.z*=-1),h.material.uniforms.envMap.value=w,h.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Ip.makeRotationFromEuler(Bn)),h.material.toneMapped=Yt.getTransfer(w.colorSpace)!==re,(u!==w||f!==w.version||m!==i.toneMapping)&&(h.material.needsUpdate=!0,u=w,f=w.version,m=i.toneMapping),h.layers.enableAll(),b.unshift(h,h.geometry,h.material,0,0,null)):w&&w.isTexture&&(c===void 0&&(c=new Mt(new ts(2,2),new vn({name:"BackgroundMaterial",uniforms:Li(en.background.uniforms),vertexShader:en.background.vertexShader,fragmentShader:en.background.fragmentShader,side:Ln,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=w,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=Yt.getTransfer(w.colorSpace)!==re,w.matrixAutoUpdate===!0&&w.updateMatrix(),c.material.uniforms.uvTransform.value.copy(w.matrix),(u!==w||f!==w.version||m!==i.toneMapping)&&(c.material.needsUpdate=!0,u=w,f=w.version,m=i.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null))}function d(b,y){b.getRGB(ws,Mc(i)),n.buffers.color.setClear(ws.r,ws.g,ws.b,y,a)}return{getClearColor:function(){return o},setClearColor:function(b,y=1){o.set(b),l=y,d(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(b){l=b,d(o,l)},render:v,addToRenderList:p}}function Np(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null);let r=s,a=!1;function o(_,S,O,z,X){let j=!1;const G=u(z,O,S);r!==G&&(r=G,c(r.object)),j=m(_,z,O,X),j&&g(_,z,O,X),X!==null&&t.update(X,i.ELEMENT_ARRAY_BUFFER),(j||a)&&(a=!1,w(_,S,O,z),X!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(X).buffer))}function l(){return i.createVertexArray()}function c(_){return i.bindVertexArray(_)}function h(_){return i.deleteVertexArray(_)}function u(_,S,O){const z=O.wireframe===!0;let X=n[_.id];X===void 0&&(X={},n[_.id]=X);let j=X[S.id];j===void 0&&(j={},X[S.id]=j);let G=j[z];return G===void 0&&(G=f(l()),j[z]=G),G}function f(_){const S=[],O=[],z=[];for(let X=0;X<e;X++)S[X]=0,O[X]=0,z[X]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:S,enabledAttributes:O,attributeDivisors:z,object:_,attributes:{},index:null}}function m(_,S,O,z){const X=r.attributes,j=S.attributes;let G=0;const Z=O.getAttributes();for(const W in Z)if(Z[W].location>=0){const ct=X[W];let _t=j[W];if(_t===void 0&&(W==="instanceMatrix"&&_.instanceMatrix&&(_t=_.instanceMatrix),W==="instanceColor"&&_.instanceColor&&(_t=_.instanceColor)),ct===void 0||ct.attribute!==_t||_t&&ct.data!==_t.data)return!0;G++}return r.attributesNum!==G||r.index!==z}function g(_,S,O,z){const X={},j=S.attributes;let G=0;const Z=O.getAttributes();for(const W in Z)if(Z[W].location>=0){let ct=j[W];ct===void 0&&(W==="instanceMatrix"&&_.instanceMatrix&&(ct=_.instanceMatrix),W==="instanceColor"&&_.instanceColor&&(ct=_.instanceColor));const _t={};_t.attribute=ct,ct&&ct.data&&(_t.data=ct.data),X[W]=_t,G++}r.attributes=X,r.attributesNum=G,r.index=z}function v(){const _=r.newAttributes;for(let S=0,O=_.length;S<O;S++)_[S]=0}function p(_){d(_,0)}function d(_,S){const O=r.newAttributes,z=r.enabledAttributes,X=r.attributeDivisors;O[_]=1,z[_]===0&&(i.enableVertexAttribArray(_),z[_]=1),X[_]!==S&&(i.vertexAttribDivisor(_,S),X[_]=S)}function b(){const _=r.newAttributes,S=r.enabledAttributes;for(let O=0,z=S.length;O<z;O++)S[O]!==_[O]&&(i.disableVertexAttribArray(O),S[O]=0)}function y(_,S,O,z,X,j,G){G===!0?i.vertexAttribIPointer(_,S,O,X,j):i.vertexAttribPointer(_,S,O,z,X,j)}function w(_,S,O,z){v();const X=z.attributes,j=O.getAttributes(),G=S.defaultAttributeValues;for(const Z in j){const W=j[Z];if(W.location>=0){let lt=X[Z];if(lt===void 0&&(Z==="instanceMatrix"&&_.instanceMatrix&&(lt=_.instanceMatrix),Z==="instanceColor"&&_.instanceColor&&(lt=_.instanceColor)),lt!==void 0){const ct=lt.normalized,_t=lt.itemSize,Vt=t.get(lt);if(Vt===void 0)continue;const Kt=Vt.buffer,q=Vt.type,Q=Vt.bytesPerElement,mt=q===i.INT||q===i.UNSIGNED_INT||lt.gpuType===to;if(lt.isInterleavedBufferAttribute){const ht=lt.data,Lt=ht.stride,Et=lt.offset;if(ht.isInstancedInterleavedBuffer){for(let Bt=0;Bt<W.locationSize;Bt++)d(W.location+Bt,ht.meshPerAttribute);_.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ht.meshPerAttribute*ht.count)}else for(let Bt=0;Bt<W.locationSize;Bt++)p(W.location+Bt);i.bindBuffer(i.ARRAY_BUFFER,Kt);for(let Bt=0;Bt<W.locationSize;Bt++)y(W.location+Bt,_t/W.locationSize,q,ct,Lt*Q,(Et+_t/W.locationSize*Bt)*Q,mt)}else{if(lt.isInstancedBufferAttribute){for(let ht=0;ht<W.locationSize;ht++)d(W.location+ht,lt.meshPerAttribute);_.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=lt.meshPerAttribute*lt.count)}else for(let ht=0;ht<W.locationSize;ht++)p(W.location+ht);i.bindBuffer(i.ARRAY_BUFFER,Kt);for(let ht=0;ht<W.locationSize;ht++)y(W.location+ht,_t/W.locationSize,q,ct,_t*Q,_t/W.locationSize*ht*Q,mt)}}else if(G!==void 0){const ct=G[Z];if(ct!==void 0)switch(ct.length){case 2:i.vertexAttrib2fv(W.location,ct);break;case 3:i.vertexAttrib3fv(W.location,ct);break;case 4:i.vertexAttrib4fv(W.location,ct);break;default:i.vertexAttrib1fv(W.location,ct)}}}}b()}function L(){U();for(const _ in n){const S=n[_];for(const O in S){const z=S[O];for(const X in z)h(z[X].object),delete z[X];delete S[O]}delete n[_]}}function R(_){if(n[_.id]===void 0)return;const S=n[_.id];for(const O in S){const z=S[O];for(const X in z)h(z[X].object),delete z[X];delete S[O]}delete n[_.id]}function A(_){for(const S in n){const O=n[S];if(O[_.id]===void 0)continue;const z=O[_.id];for(const X in z)h(z[X].object),delete z[X];delete O[_.id]}}function U(){I(),a=!0,r!==s&&(r=s,c(r.object))}function I(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:U,resetDefaultState:I,dispose:L,releaseStatesOfGeometry:R,releaseStatesOfProgram:A,initAttributes:v,enableAttribute:p,disableUnusedAttributes:b}}function Fp(i,t,e){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function a(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function o(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let m=0;for(let g=0;g<u;g++)m+=h[g];e.update(m,n,1)}function l(c,h,u,f){if(u===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let g=0;g<c.length;g++)a(c[g],h[g],f[g]);else{m.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let g=0;for(let v=0;v<u;v++)g+=h[v];for(let v=0;v<f.length;v++)e.update(g,n,f[v])}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Op(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const A=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(A){return!(A!==Qe&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const U=A===Ji&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(A!==_n&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==sn&&!U)}function l(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=e.logarithmicDepthBuffer===!0,f=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control");if(f===!0){const A=t.get("EXT_clip_control");A.clipControlEXT(A.LOWER_LEFT_EXT,A.ZERO_TO_ONE_EXT)}const m=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),y=i.getParameter(i.MAX_VARYING_VECTORS),w=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),L=g>0,R=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:f,maxTextures:m,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:p,maxAttributes:d,maxVertexUniforms:b,maxVaryings:y,maxFragmentUniforms:w,vertexTextures:L,maxSamples:R}}function Bp(i){const t=this;let e=null,n=0,s=!1,r=!1;const a=new Tn,o=new Ut,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const m=u.length!==0||f||n!==0||s;return s=f,n=u.length,m},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){e=h(u,f,0)},this.setState=function(u,f,m){const g=u.clippingPlanes,v=u.clipIntersection,p=u.clipShadows,d=i.get(u);if(!s||g===null||g.length===0||r&&!p)r?h(null):c();else{const b=r?0:n,y=b*4;let w=d.clippingState||null;l.value=w,w=h(g,f,y,m);for(let L=0;L!==y;++L)w[L]=e[L];d.clippingState=w,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,f,m,g){const v=u!==null?u.length:0;let p=null;if(v!==0){if(p=l.value,g!==!0||p===null){const d=m+v*4,b=f.matrixWorldInverse;o.getNormalMatrix(b),(p===null||p.length<d)&&(p=new Float32Array(d));for(let y=0,w=m;y!==v;++y,w+=4)a.copy(u[y]).applyMatrix4(b,o),a.normal.toArray(p,w),p[w+3]=a.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,p}}function kp(i){let t=new WeakMap;function e(a,o){return o===pa?a.mapping=Ai:o===ma&&(a.mapping=Ri),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===pa||o===ma)if(t.has(a)){const l=t.get(a).texture;return e(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new $u(l.height);return c.fromEquirectangularTexture(i,a),t.set(a,c),a.addEventListener("dispose",s),e(c.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class wc extends Sc{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const xi=4,il=[.125,.215,.35,.446,.526,.582],Gn=20,zr=new wc,sl=new Tt;let Hr=null,Gr=0,Vr=0,Wr=!1;const zn=(1+Math.sqrt(5))/2,gi=1/zn,rl=[new C(-zn,gi,0),new C(zn,gi,0),new C(-gi,0,zn),new C(gi,0,zn),new C(0,zn,-gi),new C(0,zn,gi),new C(-1,1,-1),new C(1,1,-1),new C(-1,1,1),new C(1,1,1)];class al{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){Hr=this._renderer.getRenderTarget(),Gr=this._renderer.getActiveCubeFace(),Vr=this._renderer.getActiveMipmapLevel(),Wr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=cl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ll(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Hr,Gr,Vr),this._renderer.xr.enabled=Wr,t.scissorTest=!1,Ts(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ai||t.mapping===Ri?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Hr=this._renderer.getRenderTarget(),Gr=this._renderer.getActiveCubeFace(),Vr=this._renderer.getActiveMipmapLevel(),Wr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Ze,minFilter:Ze,generateMipmaps:!1,type:Ji,format:Qe,colorSpace:Dn,depthBuffer:!1},s=ol(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ol(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=zp(r)),this._blurMaterial=Hp(r,t,e)}return s}_compileMaterial(t){const e=new Mt(this._lodPlanes[0],t);this._renderer.compile(e,zr)}_sceneToCubeUV(t,e,n,s){const o=new Ie(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(sl),h.toneMapping=Cn,h.autoClear=!1;const m=new Jt({name:"PMREM.Background",side:Re,depthWrite:!1,depthTest:!1}),g=new Mt(new be,m);let v=!1;const p=t.background;p?p.isColor&&(m.color.copy(p),t.background=null,v=!0):(m.color.copy(sl),v=!0);for(let d=0;d<6;d++){const b=d%3;b===0?(o.up.set(0,l[d],0),o.lookAt(c[d],0,0)):b===1?(o.up.set(0,0,l[d]),o.lookAt(0,c[d],0)):(o.up.set(0,l[d],0),o.lookAt(0,0,c[d]));const y=this._cubeSize;Ts(s,b*y,d>2?y:0,y,y),h.setRenderTarget(s),v&&h.render(g,o),h.render(t,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=f,h.autoClear=u,t.background=p}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===Ai||t.mapping===Ri;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=cl()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ll());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new Mt(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;const l=this._cubeSize;Ts(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,zr)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=rl[(s-r-1)%rl.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Mt(this._lodPlanes[s],c),f=c.uniforms,m=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*m):2*Math.PI/(2*Gn-1),v=r/g,p=isFinite(r)?1+Math.floor(h*v):Gn;p>Gn&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Gn}`);const d=[];let b=0;for(let A=0;A<Gn;++A){const U=A/v,I=Math.exp(-U*U/2);d.push(I),A===0?b+=I:A<p&&(b+=2*I)}for(let A=0;A<d.length;A++)d[A]=d[A]/b;f.envMap.value=t.texture,f.samples.value=p,f.weights.value=d,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:y}=this;f.dTheta.value=g,f.mipInt.value=y-n;const w=this._sizeLods[s],L=3*w*(s>y-xi?s-y+xi:0),R=4*(this._cubeSize-w);Ts(e,L,R,3*w,2*w),l.setRenderTarget(e),l.render(u,zr)}}function zp(i){const t=[],e=[],n=[];let s=i;const r=i-xi+1+il.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let l=1/o;a>i-xi?l=il[a-i+xi-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],m=6,g=6,v=3,p=2,d=1,b=new Float32Array(v*g*m),y=new Float32Array(p*g*m),w=new Float32Array(d*g*m);for(let R=0;R<m;R++){const A=R%3*2/3-1,U=R>2?0:-1,I=[A,U,0,A+2/3,U,0,A+2/3,U+1,0,A,U,0,A+2/3,U+1,0,A,U+1,0];b.set(I,v*g*R),y.set(f,p*g*R);const _=[R,R,R,R,R,R];w.set(_,d*g*R)}const L=new Ne;L.setAttribute("position",new tn(b,v)),L.setAttribute("uv",new tn(y,p)),L.setAttribute("faceIndex",new tn(w,d)),t.push(L),s>xi&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function ol(i,t,e){const n=new Kn(i,t,e);return n.texture.mapping=Qs,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ts(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Hp(i,t,e){const n=new Float32Array(Gn),s=new C(0,1,0);return new vn({name:"SphericalGaussianBlur",defines:{n:Gn,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:ho(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Rn,depthTest:!1,depthWrite:!1})}function ll(){return new vn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ho(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Rn,depthTest:!1,depthWrite:!1})}function cl(){return new vn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ho(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Rn,depthTest:!1,depthWrite:!1})}function ho(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Gp(i){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===pa||l===ma,h=l===Ai||l===Ri;if(c||h){let u=t.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return e===null&&(e=new al(i)),u=c?e.fromEquirectangular(o,u):e.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture;if(u!==void 0)return u.texture;{const m=o.image;return c&&m&&m.height>0||h&&m&&s(m)?(e===null&&(e=new al(i)),u=c?e.fromEquirectangular(o):e.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function s(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function Vp(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&zs("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Wp(i,t,e,n){const s={},r=new WeakMap;function a(u){const f=u.target;f.index!==null&&t.remove(f.index);for(const g in f.attributes)t.remove(f.attributes[g]);for(const g in f.morphAttributes){const v=f.morphAttributes[g];for(let p=0,d=v.length;p<d;p++)t.remove(v[p])}f.removeEventListener("dispose",a),delete s[f.id];const m=r.get(f);m&&(t.remove(m),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,e.memory.geometries--}function o(u,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,e.memory.geometries++),f}function l(u){const f=u.attributes;for(const g in f)t.update(f[g],i.ARRAY_BUFFER);const m=u.morphAttributes;for(const g in m){const v=m[g];for(let p=0,d=v.length;p<d;p++)t.update(v[p],i.ARRAY_BUFFER)}}function c(u){const f=[],m=u.index,g=u.attributes.position;let v=0;if(m!==null){const b=m.array;v=m.version;for(let y=0,w=b.length;y<w;y+=3){const L=b[y+0],R=b[y+1],A=b[y+2];f.push(L,R,R,A,A,L)}}else if(g!==void 0){const b=g.array;v=g.version;for(let y=0,w=b.length/3-1;y<w;y+=3){const L=y+0,R=y+1,A=y+2;f.push(L,R,R,A,A,L)}}else return;const p=new(mc(f)?yc:xc)(f,1);p.version=v;const d=r.get(u);d&&t.remove(d),r.set(u,p)}function h(u){const f=r.get(u);if(f){const m=u.index;m!==null&&f.version<m.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function Xp(i,t,e){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,m){i.drawElements(n,m,r,f*a),e.update(m,n,1)}function c(f,m,g){g!==0&&(i.drawElementsInstanced(n,m,r,f*a,g),e.update(m,n,g))}function h(f,m,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,m,0,r,f,0,g);let p=0;for(let d=0;d<g;d++)p+=m[d];e.update(p,n,1)}function u(f,m,g,v){if(g===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let d=0;d<f.length;d++)c(f[d]/a,m[d],v[d]);else{p.multiDrawElementsInstancedWEBGL(n,m,0,r,f,0,v,0,g);let d=0;for(let b=0;b<g;b++)d+=m[b];for(let b=0;b<v.length;b++)e.update(d,n,v[b])}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function qp(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Yp(i,t,e){const n=new WeakMap,s=new te;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(o);if(f===void 0||f.count!==u){let _=function(){U.dispose(),n.delete(o),o.removeEventListener("dispose",_)};var m=_;f!==void 0&&f.texture.dispose();const g=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,p=o.morphAttributes.color!==void 0,d=o.morphAttributes.position||[],b=o.morphAttributes.normal||[],y=o.morphAttributes.color||[];let w=0;g===!0&&(w=1),v===!0&&(w=2),p===!0&&(w=3);let L=o.attributes.position.count*w,R=1;L>t.maxTextureSize&&(R=Math.ceil(L/t.maxTextureSize),L=t.maxTextureSize);const A=new Float32Array(L*R*4*u),U=new _c(A,L,R,u);U.type=sn,U.needsUpdate=!0;const I=w*4;for(let S=0;S<u;S++){const O=d[S],z=b[S],X=y[S],j=L*R*4*S;for(let G=0;G<O.count;G++){const Z=G*I;g===!0&&(s.fromBufferAttribute(O,G),A[j+Z+0]=s.x,A[j+Z+1]=s.y,A[j+Z+2]=s.z,A[j+Z+3]=0),v===!0&&(s.fromBufferAttribute(z,G),A[j+Z+4]=s.x,A[j+Z+5]=s.y,A[j+Z+6]=s.z,A[j+Z+7]=0),p===!0&&(s.fromBufferAttribute(X,G),A[j+Z+8]=s.x,A[j+Z+9]=s.y,A[j+Z+10]=s.z,A[j+Z+11]=X.itemSize===4?s.w:1)}}f={count:u,texture:U,size:new St(L,R)},n.set(o,f),o.addEventListener("dispose",_)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let g=0;for(let p=0;p<c.length;p++)g+=c[p];const v=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",v),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function Kp(i,t,e,n){let s=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);if(s.get(u)!==c&&(t.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return u}function a(){s=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}class Tc extends Ee{constructor(t,e,n,s,r,a,o,l,c,h=bi){if(h!==bi&&h!==Pi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===bi&&(n=Yn),n===void 0&&h===Pi&&(n=Ci),super(null,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:Ue,this.minFilter=l!==void 0?l:Ue,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const Ac=new Ee,hl=new Tc(1,1),Rc=new _c,Cc=new Iu,Pc=new bc,ul=[],dl=[],fl=new Float32Array(16),pl=new Float32Array(9),ml=new Float32Array(4);function Ni(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=ul[s];if(r===void 0&&(r=new Float32Array(s),ul[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function fe(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function pe(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function nr(i,t){let e=dl[t];e===void 0&&(e=new Int32Array(t),dl[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function $p(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function jp(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(fe(e,t))return;i.uniform2fv(this.addr,t),pe(e,t)}}function Zp(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(fe(e,t))return;i.uniform3fv(this.addr,t),pe(e,t)}}function Jp(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(fe(e,t))return;i.uniform4fv(this.addr,t),pe(e,t)}}function Qp(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(fe(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),pe(e,t)}else{if(fe(e,n))return;ml.set(n),i.uniformMatrix2fv(this.addr,!1,ml),pe(e,n)}}function tm(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(fe(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),pe(e,t)}else{if(fe(e,n))return;pl.set(n),i.uniformMatrix3fv(this.addr,!1,pl),pe(e,n)}}function em(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(fe(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),pe(e,t)}else{if(fe(e,n))return;fl.set(n),i.uniformMatrix4fv(this.addr,!1,fl),pe(e,n)}}function nm(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function im(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(fe(e,t))return;i.uniform2iv(this.addr,t),pe(e,t)}}function sm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(fe(e,t))return;i.uniform3iv(this.addr,t),pe(e,t)}}function rm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(fe(e,t))return;i.uniform4iv(this.addr,t),pe(e,t)}}function am(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function om(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(fe(e,t))return;i.uniform2uiv(this.addr,t),pe(e,t)}}function lm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(fe(e,t))return;i.uniform3uiv(this.addr,t),pe(e,t)}}function cm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(fe(e,t))return;i.uniform4uiv(this.addr,t),pe(e,t)}}function hm(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(hl.compareFunction=pc,r=hl):r=Ac,e.setTexture2D(t||r,s)}function um(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Cc,s)}function dm(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Pc,s)}function fm(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Rc,s)}function pm(i){switch(i){case 5126:return $p;case 35664:return jp;case 35665:return Zp;case 35666:return Jp;case 35674:return Qp;case 35675:return tm;case 35676:return em;case 5124:case 35670:return nm;case 35667:case 35671:return im;case 35668:case 35672:return sm;case 35669:case 35673:return rm;case 5125:return am;case 36294:return om;case 36295:return lm;case 36296:return cm;case 35678:case 36198:case 36298:case 36306:case 35682:return hm;case 35679:case 36299:case 36307:return um;case 35680:case 36300:case 36308:case 36293:return dm;case 36289:case 36303:case 36311:case 36292:return fm}}function mm(i,t){i.uniform1fv(this.addr,t)}function gm(i,t){const e=Ni(t,this.size,2);i.uniform2fv(this.addr,e)}function _m(i,t){const e=Ni(t,this.size,3);i.uniform3fv(this.addr,e)}function vm(i,t){const e=Ni(t,this.size,4);i.uniform4fv(this.addr,e)}function xm(i,t){const e=Ni(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function ym(i,t){const e=Ni(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function Mm(i,t){const e=Ni(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function Sm(i,t){i.uniform1iv(this.addr,t)}function bm(i,t){i.uniform2iv(this.addr,t)}function Em(i,t){i.uniform3iv(this.addr,t)}function wm(i,t){i.uniform4iv(this.addr,t)}function Tm(i,t){i.uniform1uiv(this.addr,t)}function Am(i,t){i.uniform2uiv(this.addr,t)}function Rm(i,t){i.uniform3uiv(this.addr,t)}function Cm(i,t){i.uniform4uiv(this.addr,t)}function Pm(i,t,e){const n=this.cache,s=t.length,r=nr(e,s);fe(n,r)||(i.uniform1iv(this.addr,r),pe(n,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||Ac,r[a])}function Lm(i,t,e){const n=this.cache,s=t.length,r=nr(e,s);fe(n,r)||(i.uniform1iv(this.addr,r),pe(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||Cc,r[a])}function Dm(i,t,e){const n=this.cache,s=t.length,r=nr(e,s);fe(n,r)||(i.uniform1iv(this.addr,r),pe(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Pc,r[a])}function Im(i,t,e){const n=this.cache,s=t.length,r=nr(e,s);fe(n,r)||(i.uniform1iv(this.addr,r),pe(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||Rc,r[a])}function Um(i){switch(i){case 5126:return mm;case 35664:return gm;case 35665:return _m;case 35666:return vm;case 35674:return xm;case 35675:return ym;case 35676:return Mm;case 5124:case 35670:return Sm;case 35667:case 35671:return bm;case 35668:case 35672:return Em;case 35669:case 35673:return wm;case 5125:return Tm;case 36294:return Am;case 36295:return Rm;case 36296:return Cm;case 35678:case 36198:case 36298:case 36306:case 35682:return Pm;case 35679:case 36299:case 36307:return Lm;case 35680:case 36300:case 36308:case 36293:return Dm;case 36289:case 36303:case 36311:case 36292:return Im}}class Nm{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=pm(e.type)}}class Fm{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Um(e.type)}}class Om{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(t,e[o.id],n)}}}const Xr=/(\w+)(\])?(\[|\.)?/g;function gl(i,t){i.seq.push(t),i.map[t.id]=t}function Bm(i,t,e){const n=i.name,s=n.length;for(Xr.lastIndex=0;;){const r=Xr.exec(n),a=Xr.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){gl(e,c===void 0?new Nm(o,i,t):new Fm(o,i,t));break}else{let u=e.map[o];u===void 0&&(u=new Om(o),gl(e,u)),e=u}}}class Hs{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);Bm(r,a,this)}}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){const o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const a=t[s];a.id in e&&n.push(a)}return n}}function _l(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const km=37297;let zm=0;function Hm(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}function Gm(i){const t=Yt.getPrimaries(Yt.workingColorSpace),e=Yt.getPrimaries(i);let n;switch(t===e?n="":t===qs&&e===Xs?n="LinearDisplayP3ToLinearSRGB":t===Xs&&e===qs&&(n="LinearSRGBToLinearDisplayP3"),i){case Dn:case tr:return[n,"LinearTransferOETF"];case He:case oo:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function vl(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const a=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+Hm(i.getShaderSource(t),a)}else return s}function Vm(i,t){const e=Gm(t);return`vec4 ${i}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function Wm(i,t){let e;switch(t){case su:e="Linear";break;case ru:e="Reinhard";break;case au:e="Cineon";break;case ou:e="ACESFilmic";break;case cu:e="AgX";break;case hu:e="Neutral";break;case lu:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const As=new C;function Xm(){Yt.getLuminanceCoefficients(As);const i=As.x.toFixed(4),t=As.y.toFixed(4),e=As.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function qm(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ki).join(`
`)}function Ym(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Km(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Ki(i){return i!==""}function xl(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function yl(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const $m=/^[ \t]*#include +<([\w\d./]+)>/gm;function Xa(i){return i.replace($m,Zm)}const jm=new Map;function Zm(i,t){let e=It[t];if(e===void 0){const n=jm.get(t);if(n!==void 0)e=It[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Xa(e)}const Jm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ml(i){return i.replace(Jm,Qm)}function Qm(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Sl(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function tg(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===ec?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===Oh?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===dn&&(t="SHADOWMAP_TYPE_VSM"),t}function eg(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ai:case Ri:t="ENVMAP_TYPE_CUBE";break;case Qs:t="ENVMAP_TYPE_CUBE_UV";break}return t}function ng(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Ri:t="ENVMAP_MODE_REFRACTION";break}return t}function ig(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case nc:t="ENVMAP_BLENDING_MULTIPLY";break;case nu:t="ENVMAP_BLENDING_MIX";break;case iu:t="ENVMAP_BLENDING_ADD";break}return t}function sg(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function rg(i,t,e,n){const s=i.getContext(),r=e.defines;let a=e.vertexShader,o=e.fragmentShader;const l=tg(e),c=eg(e),h=ng(e),u=ig(e),f=sg(e),m=qm(e),g=Ym(r),v=s.createProgram();let p,d,b=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Ki).join(`
`),p.length>0&&(p+=`
`),d=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Ki).join(`
`),d.length>0&&(d+=`
`)):(p=[Sl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ki).join(`
`),d=[Sl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Cn?"#define TONE_MAPPING":"",e.toneMapping!==Cn?It.tonemapping_pars_fragment:"",e.toneMapping!==Cn?Wm("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",It.colorspace_pars_fragment,Vm("linearToOutputTexel",e.outputColorSpace),Xm(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Ki).join(`
`)),a=Xa(a),a=xl(a,e),a=yl(a,e),o=Xa(o),o=xl(o,e),o=yl(o,e),a=Ml(a),o=Ml(o),e.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,p=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,d=["#define varying in",e.glslVersion===ko?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===ko?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const y=b+p+a,w=b+d+o,L=_l(s,s.VERTEX_SHADER,y),R=_l(s,s.FRAGMENT_SHADER,w);s.attachShader(v,L),s.attachShader(v,R),e.index0AttributeName!==void 0?s.bindAttribLocation(v,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function A(S){if(i.debug.checkShaderErrors){const O=s.getProgramInfoLog(v).trim(),z=s.getShaderInfoLog(L).trim(),X=s.getShaderInfoLog(R).trim();let j=!0,G=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(j=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,L,R);else{const Z=vl(s,L,"vertex"),W=vl(s,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+S.name+`
Material Type: `+S.type+`

Program Info Log: `+O+`
`+Z+`
`+W)}else O!==""?console.warn("THREE.WebGLProgram: Program Info Log:",O):(z===""||X==="")&&(G=!1);G&&(S.diagnostics={runnable:j,programLog:O,vertexShader:{log:z,prefix:p},fragmentShader:{log:X,prefix:d}})}s.deleteShader(L),s.deleteShader(R),U=new Hs(s,v),I=Km(s,v)}let U;this.getUniforms=function(){return U===void 0&&A(this),U};let I;this.getAttributes=function(){return I===void 0&&A(this),I};let _=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return _===!1&&(_=s.getProgramParameter(v,km)),_},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=zm++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=L,this.fragmentShader=R,this}let ag=0;class og{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new lg(t),e.set(t,n)),n}}class lg{constructor(t){this.id=ag++,this.code=t,this.usedTimes=0}}function cg(i,t,e,n,s,r,a){const o=new lo,l=new og,c=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.reverseDepthBuffer,m=s.vertexTextures;let g=s.precision;const v={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(_){return c.add(_),_===0?"uv":`uv${_}`}function d(_,S,O,z,X){const j=z.fog,G=X.geometry,Z=_.isMeshStandardMaterial?z.environment:null,W=(_.isMeshStandardMaterial?e:t).get(_.envMap||Z),lt=W&&W.mapping===Qs?W.image.height:null,ct=v[_.type];_.precision!==null&&(g=s.getMaxPrecision(_.precision),g!==_.precision&&console.warn("THREE.WebGLProgram.getParameters:",_.precision,"not supported, using",g,"instead."));const _t=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,Vt=_t!==void 0?_t.length:0;let Kt=0;G.morphAttributes.position!==void 0&&(Kt=1),G.morphAttributes.normal!==void 0&&(Kt=2),G.morphAttributes.color!==void 0&&(Kt=3);let q,Q,mt,ht;if(ct){const Pe=en[ct];q=Pe.vertexShader,Q=Pe.fragmentShader}else q=_.vertexShader,Q=_.fragmentShader,l.update(_),mt=l.getVertexShaderID(_),ht=l.getFragmentShaderID(_);const Lt=i.getRenderTarget(),Et=X.isInstancedMesh===!0,Bt=X.isBatchedMesh===!0,Zt=!!_.map,kt=!!_.matcap,P=!!W,Fe=!!_.aoMap,Ft=!!_.lightMap,Ht=!!_.bumpMap,At=!!_.normalMap,ie=!!_.displacementMap,Pt=!!_.emissiveMap,T=!!_.metalnessMap,x=!!_.roughnessMap,B=_.anisotropy>0,K=_.clearcoat>0,J=_.dispersion>0,Y=_.iridescence>0,vt=_.sheen>0,it=_.transmission>0,ut=B&&!!_.anisotropyMap,Gt=K&&!!_.clearcoatMap,tt=K&&!!_.clearcoatNormalMap,dt=K&&!!_.clearcoatRoughnessMap,Rt=Y&&!!_.iridescenceMap,Ct=Y&&!!_.iridescenceThicknessMap,ft=vt&&!!_.sheenColorMap,Ot=vt&&!!_.sheenRoughnessMap,Dt=!!_.specularMap,ee=!!_.specularColorMap,D=!!_.specularIntensityMap,at=it&&!!_.transmissionMap,V=it&&!!_.thicknessMap,$=!!_.gradientMap,st=!!_.alphaMap,ot=_.alphaTest>0,zt=!!_.alphaHash,le=!!_.extensions;let Ce=Cn;_.toneMapped&&(Lt===null||Lt.isXRRenderTarget===!0)&&(Ce=i.toneMapping);const Wt={shaderID:ct,shaderType:_.type,shaderName:_.name,vertexShader:q,fragmentShader:Q,defines:_.defines,customVertexShaderID:mt,customFragmentShaderID:ht,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:g,batching:Bt,batchingColor:Bt&&X._colorsTexture!==null,instancing:Et,instancingColor:Et&&X.instanceColor!==null,instancingMorph:Et&&X.morphTexture!==null,supportsVertexTextures:m,outputColorSpace:Lt===null?i.outputColorSpace:Lt.isXRRenderTarget===!0?Lt.texture.colorSpace:Dn,alphaToCoverage:!!_.alphaToCoverage,map:Zt,matcap:kt,envMap:P,envMapMode:P&&W.mapping,envMapCubeUVHeight:lt,aoMap:Fe,lightMap:Ft,bumpMap:Ht,normalMap:At,displacementMap:m&&ie,emissiveMap:Pt,normalMapObjectSpace:At&&_.normalMapType===pu,normalMapTangentSpace:At&&_.normalMapType===fc,metalnessMap:T,roughnessMap:x,anisotropy:B,anisotropyMap:ut,clearcoat:K,clearcoatMap:Gt,clearcoatNormalMap:tt,clearcoatRoughnessMap:dt,dispersion:J,iridescence:Y,iridescenceMap:Rt,iridescenceThicknessMap:Ct,sheen:vt,sheenColorMap:ft,sheenRoughnessMap:Ot,specularMap:Dt,specularColorMap:ee,specularIntensityMap:D,transmission:it,transmissionMap:at,thicknessMap:V,gradientMap:$,opaque:_.transparent===!1&&_.blending===Si&&_.alphaToCoverage===!1,alphaMap:st,alphaTest:ot,alphaHash:zt,combine:_.combine,mapUv:Zt&&p(_.map.channel),aoMapUv:Fe&&p(_.aoMap.channel),lightMapUv:Ft&&p(_.lightMap.channel),bumpMapUv:Ht&&p(_.bumpMap.channel),normalMapUv:At&&p(_.normalMap.channel),displacementMapUv:ie&&p(_.displacementMap.channel),emissiveMapUv:Pt&&p(_.emissiveMap.channel),metalnessMapUv:T&&p(_.metalnessMap.channel),roughnessMapUv:x&&p(_.roughnessMap.channel),anisotropyMapUv:ut&&p(_.anisotropyMap.channel),clearcoatMapUv:Gt&&p(_.clearcoatMap.channel),clearcoatNormalMapUv:tt&&p(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:dt&&p(_.clearcoatRoughnessMap.channel),iridescenceMapUv:Rt&&p(_.iridescenceMap.channel),iridescenceThicknessMapUv:Ct&&p(_.iridescenceThicknessMap.channel),sheenColorMapUv:ft&&p(_.sheenColorMap.channel),sheenRoughnessMapUv:Ot&&p(_.sheenRoughnessMap.channel),specularMapUv:Dt&&p(_.specularMap.channel),specularColorMapUv:ee&&p(_.specularColorMap.channel),specularIntensityMapUv:D&&p(_.specularIntensityMap.channel),transmissionMapUv:at&&p(_.transmissionMap.channel),thicknessMapUv:V&&p(_.thicknessMap.channel),alphaMapUv:st&&p(_.alphaMap.channel),vertexTangents:!!G.attributes.tangent&&(At||B),vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,pointsUvs:X.isPoints===!0&&!!G.attributes.uv&&(Zt||st),fog:!!j,useFog:_.fog===!0,fogExp2:!!j&&j.isFogExp2,flatShading:_.flatShading===!0,sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:f,skinning:X.isSkinnedMesh===!0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:Vt,morphTextureStride:Kt,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&O.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ce,decodeVideoTexture:Zt&&_.map.isVideoTexture===!0&&Yt.getTransfer(_.map.colorSpace)===re,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===je,flipSided:_.side===Re,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:le&&_.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(le&&_.extensions.multiDraw===!0||Bt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Wt.vertexUv1s=c.has(1),Wt.vertexUv2s=c.has(2),Wt.vertexUv3s=c.has(3),c.clear(),Wt}function b(_){const S=[];if(_.shaderID?S.push(_.shaderID):(S.push(_.customVertexShaderID),S.push(_.customFragmentShaderID)),_.defines!==void 0)for(const O in _.defines)S.push(O),S.push(_.defines[O]);return _.isRawShaderMaterial===!1&&(y(S,_),w(S,_),S.push(i.outputColorSpace)),S.push(_.customProgramCacheKey),S.join()}function y(_,S){_.push(S.precision),_.push(S.outputColorSpace),_.push(S.envMapMode),_.push(S.envMapCubeUVHeight),_.push(S.mapUv),_.push(S.alphaMapUv),_.push(S.lightMapUv),_.push(S.aoMapUv),_.push(S.bumpMapUv),_.push(S.normalMapUv),_.push(S.displacementMapUv),_.push(S.emissiveMapUv),_.push(S.metalnessMapUv),_.push(S.roughnessMapUv),_.push(S.anisotropyMapUv),_.push(S.clearcoatMapUv),_.push(S.clearcoatNormalMapUv),_.push(S.clearcoatRoughnessMapUv),_.push(S.iridescenceMapUv),_.push(S.iridescenceThicknessMapUv),_.push(S.sheenColorMapUv),_.push(S.sheenRoughnessMapUv),_.push(S.specularMapUv),_.push(S.specularColorMapUv),_.push(S.specularIntensityMapUv),_.push(S.transmissionMapUv),_.push(S.thicknessMapUv),_.push(S.combine),_.push(S.fogExp2),_.push(S.sizeAttenuation),_.push(S.morphTargetsCount),_.push(S.morphAttributeCount),_.push(S.numDirLights),_.push(S.numPointLights),_.push(S.numSpotLights),_.push(S.numSpotLightMaps),_.push(S.numHemiLights),_.push(S.numRectAreaLights),_.push(S.numDirLightShadows),_.push(S.numPointLightShadows),_.push(S.numSpotLightShadows),_.push(S.numSpotLightShadowsWithMaps),_.push(S.numLightProbes),_.push(S.shadowMapType),_.push(S.toneMapping),_.push(S.numClippingPlanes),_.push(S.numClipIntersection),_.push(S.depthPacking)}function w(_,S){o.disableAll(),S.supportsVertexTextures&&o.enable(0),S.instancing&&o.enable(1),S.instancingColor&&o.enable(2),S.instancingMorph&&o.enable(3),S.matcap&&o.enable(4),S.envMap&&o.enable(5),S.normalMapObjectSpace&&o.enable(6),S.normalMapTangentSpace&&o.enable(7),S.clearcoat&&o.enable(8),S.iridescence&&o.enable(9),S.alphaTest&&o.enable(10),S.vertexColors&&o.enable(11),S.vertexAlphas&&o.enable(12),S.vertexUv1s&&o.enable(13),S.vertexUv2s&&o.enable(14),S.vertexUv3s&&o.enable(15),S.vertexTangents&&o.enable(16),S.anisotropy&&o.enable(17),S.alphaHash&&o.enable(18),S.batching&&o.enable(19),S.dispersion&&o.enable(20),S.batchingColor&&o.enable(21),_.push(o.mask),o.disableAll(),S.fog&&o.enable(0),S.useFog&&o.enable(1),S.flatShading&&o.enable(2),S.logarithmicDepthBuffer&&o.enable(3),S.reverseDepthBuffer&&o.enable(4),S.skinning&&o.enable(5),S.morphTargets&&o.enable(6),S.morphNormals&&o.enable(7),S.morphColors&&o.enable(8),S.premultipliedAlpha&&o.enable(9),S.shadowMapEnabled&&o.enable(10),S.doubleSided&&o.enable(11),S.flipSided&&o.enable(12),S.useDepthPacking&&o.enable(13),S.dithering&&o.enable(14),S.transmission&&o.enable(15),S.sheen&&o.enable(16),S.opaque&&o.enable(17),S.pointsUvs&&o.enable(18),S.decodeVideoTexture&&o.enable(19),S.alphaToCoverage&&o.enable(20),_.push(o.mask)}function L(_){const S=v[_.type];let O;if(S){const z=en[S];O=Xu.clone(z.uniforms)}else O=_.uniforms;return O}function R(_,S){let O;for(let z=0,X=h.length;z<X;z++){const j=h[z];if(j.cacheKey===S){O=j,++O.usedTimes;break}}return O===void 0&&(O=new rg(i,S,_,r),h.push(O)),O}function A(_){if(--_.usedTimes===0){const S=h.indexOf(_);h[S]=h[h.length-1],h.pop(),_.destroy()}}function U(_){l.remove(_)}function I(){l.dispose()}return{getParameters:d,getProgramCacheKey:b,getUniforms:L,acquireProgram:R,releaseProgram:A,releaseShaderCache:U,programs:h,dispose:I}}function hg(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function ug(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function bl(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function El(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(u,f,m,g,v,p){let d=i[t];return d===void 0?(d={id:u.id,object:u,geometry:f,material:m,groupOrder:g,renderOrder:u.renderOrder,z:v,group:p},i[t]=d):(d.id=u.id,d.object=u,d.geometry=f,d.material=m,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=v,d.group=p),t++,d}function o(u,f,m,g,v,p){const d=a(u,f,m,g,v,p);m.transmission>0?n.push(d):m.transparent===!0?s.push(d):e.push(d)}function l(u,f,m,g,v,p){const d=a(u,f,m,g,v,p);m.transmission>0?n.unshift(d):m.transparent===!0?s.unshift(d):e.unshift(d)}function c(u,f){e.length>1&&e.sort(u||ug),n.length>1&&n.sort(f||bl),s.length>1&&s.sort(f||bl)}function h(){for(let u=t,f=i.length;u<f;u++){const m=i[u];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:h,sort:c}}function dg(){let i=new WeakMap;function t(n,s){const r=i.get(n);let a;return r===void 0?(a=new El,i.set(n,[a])):s>=r.length?(a=new El,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function fg(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new C,color:new Tt};break;case"SpotLight":e={position:new C,direction:new C,color:new Tt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new C,color:new Tt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new C,skyColor:new Tt,groundColor:new Tt};break;case"RectAreaLight":e={color:new Tt,position:new C,halfWidth:new C,halfHeight:new C};break}return i[t.id]=e,e}}}function pg(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new St};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new St};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new St,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let mg=0;function gg(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function _g(i){const t=new fg,e=pg(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new C);const s=new C,r=new jt,a=new jt;function o(c){let h=0,u=0,f=0;for(let I=0;I<9;I++)n.probe[I].set(0,0,0);let m=0,g=0,v=0,p=0,d=0,b=0,y=0,w=0,L=0,R=0,A=0;c.sort(gg);for(let I=0,_=c.length;I<_;I++){const S=c[I],O=S.color,z=S.intensity,X=S.distance,j=S.shadow&&S.shadow.map?S.shadow.map.texture:null;if(S.isAmbientLight)h+=O.r*z,u+=O.g*z,f+=O.b*z;else if(S.isLightProbe){for(let G=0;G<9;G++)n.probe[G].addScaledVector(S.sh.coefficients[G],z);A++}else if(S.isDirectionalLight){const G=t.get(S);if(G.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){const Z=S.shadow,W=e.get(S);W.shadowIntensity=Z.intensity,W.shadowBias=Z.bias,W.shadowNormalBias=Z.normalBias,W.shadowRadius=Z.radius,W.shadowMapSize=Z.mapSize,n.directionalShadow[m]=W,n.directionalShadowMap[m]=j,n.directionalShadowMatrix[m]=S.shadow.matrix,b++}n.directional[m]=G,m++}else if(S.isSpotLight){const G=t.get(S);G.position.setFromMatrixPosition(S.matrixWorld),G.color.copy(O).multiplyScalar(z),G.distance=X,G.coneCos=Math.cos(S.angle),G.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),G.decay=S.decay,n.spot[v]=G;const Z=S.shadow;if(S.map&&(n.spotLightMap[L]=S.map,L++,Z.updateMatrices(S),S.castShadow&&R++),n.spotLightMatrix[v]=Z.matrix,S.castShadow){const W=e.get(S);W.shadowIntensity=Z.intensity,W.shadowBias=Z.bias,W.shadowNormalBias=Z.normalBias,W.shadowRadius=Z.radius,W.shadowMapSize=Z.mapSize,n.spotShadow[v]=W,n.spotShadowMap[v]=j,w++}v++}else if(S.isRectAreaLight){const G=t.get(S);G.color.copy(O).multiplyScalar(z),G.halfWidth.set(S.width*.5,0,0),G.halfHeight.set(0,S.height*.5,0),n.rectArea[p]=G,p++}else if(S.isPointLight){const G=t.get(S);if(G.color.copy(S.color).multiplyScalar(S.intensity),G.distance=S.distance,G.decay=S.decay,S.castShadow){const Z=S.shadow,W=e.get(S);W.shadowIntensity=Z.intensity,W.shadowBias=Z.bias,W.shadowNormalBias=Z.normalBias,W.shadowRadius=Z.radius,W.shadowMapSize=Z.mapSize,W.shadowCameraNear=Z.camera.near,W.shadowCameraFar=Z.camera.far,n.pointShadow[g]=W,n.pointShadowMap[g]=j,n.pointShadowMatrix[g]=S.shadow.matrix,y++}n.point[g]=G,g++}else if(S.isHemisphereLight){const G=t.get(S);G.skyColor.copy(S.color).multiplyScalar(z),G.groundColor.copy(S.groundColor).multiplyScalar(z),n.hemi[d]=G,d++}}p>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=nt.LTC_FLOAT_1,n.rectAreaLTC2=nt.LTC_FLOAT_2):(n.rectAreaLTC1=nt.LTC_HALF_1,n.rectAreaLTC2=nt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const U=n.hash;(U.directionalLength!==m||U.pointLength!==g||U.spotLength!==v||U.rectAreaLength!==p||U.hemiLength!==d||U.numDirectionalShadows!==b||U.numPointShadows!==y||U.numSpotShadows!==w||U.numSpotMaps!==L||U.numLightProbes!==A)&&(n.directional.length=m,n.spot.length=v,n.rectArea.length=p,n.point.length=g,n.hemi.length=d,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.pointShadow.length=y,n.pointShadowMap.length=y,n.spotShadow.length=w,n.spotShadowMap.length=w,n.directionalShadowMatrix.length=b,n.pointShadowMatrix.length=y,n.spotLightMatrix.length=w+L-R,n.spotLightMap.length=L,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=A,U.directionalLength=m,U.pointLength=g,U.spotLength=v,U.rectAreaLength=p,U.hemiLength=d,U.numDirectionalShadows=b,U.numPointShadows=y,U.numSpotShadows=w,U.numSpotMaps=L,U.numLightProbes=A,n.version=mg++)}function l(c,h){let u=0,f=0,m=0,g=0,v=0;const p=h.matrixWorldInverse;for(let d=0,b=c.length;d<b;d++){const y=c[d];if(y.isDirectionalLight){const w=n.directional[u];w.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(p),u++}else if(y.isSpotLight){const w=n.spot[m];w.position.setFromMatrixPosition(y.matrixWorld),w.position.applyMatrix4(p),w.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(p),m++}else if(y.isRectAreaLight){const w=n.rectArea[g];w.position.setFromMatrixPosition(y.matrixWorld),w.position.applyMatrix4(p),a.identity(),r.copy(y.matrixWorld),r.premultiply(p),a.extractRotation(r),w.halfWidth.set(y.width*.5,0,0),w.halfHeight.set(0,y.height*.5,0),w.halfWidth.applyMatrix4(a),w.halfHeight.applyMatrix4(a),g++}else if(y.isPointLight){const w=n.point[f];w.position.setFromMatrixPosition(y.matrixWorld),w.position.applyMatrix4(p),f++}else if(y.isHemisphereLight){const w=n.hemi[v];w.direction.setFromMatrixPosition(y.matrixWorld),w.direction.transformDirection(p),v++}}}return{setup:o,setupView:l,state:n}}function wl(i){const t=new _g(i),e=[],n=[];function s(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function a(h){n.push(h)}function o(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function vg(i){let t=new WeakMap;function e(s,r=0){const a=t.get(s);let o;return a===void 0?(o=new wl(i),t.set(s,[o])):r>=a.length?(o=new wl(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}class xg extends Ui{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=du,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class yg extends Ui{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const Mg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Sg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function bg(i,t,e){let n=new co;const s=new St,r=new St,a=new te,o=new xg({depthPacking:fu}),l=new yg,c={},h=e.maxTextureSize,u={[Ln]:Re,[Re]:Ln,[je]:je},f=new vn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new St},radius:{value:4}},vertexShader:Mg,fragmentShader:Sg}),m=f.clone();m.defines.HORIZONTAL_PASS=1;const g=new Ne;g.setAttribute("position",new tn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Mt(g,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ec;let d=this.type;this.render=function(R,A,U){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||R.length===0)return;const I=i.getRenderTarget(),_=i.getActiveCubeFace(),S=i.getActiveMipmapLevel(),O=i.state;O.setBlending(Rn),O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const z=d!==dn&&this.type===dn,X=d===dn&&this.type!==dn;for(let j=0,G=R.length;j<G;j++){const Z=R[j],W=Z.shadow;if(W===void 0){console.warn("THREE.WebGLShadowMap:",Z,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;s.copy(W.mapSize);const lt=W.getFrameExtents();if(s.multiply(lt),r.copy(W.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/lt.x),s.x=r.x*lt.x,W.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/lt.y),s.y=r.y*lt.y,W.mapSize.y=r.y)),W.map===null||z===!0||X===!0){const _t=this.type!==dn?{minFilter:Ue,magFilter:Ue}:{};W.map!==null&&W.map.dispose(),W.map=new Kn(s.x,s.y,_t),W.map.texture.name=Z.name+".shadowMap",W.camera.updateProjectionMatrix()}i.setRenderTarget(W.map),i.clear();const ct=W.getViewportCount();for(let _t=0;_t<ct;_t++){const Vt=W.getViewport(_t);a.set(r.x*Vt.x,r.y*Vt.y,r.x*Vt.z,r.y*Vt.w),O.viewport(a),W.updateMatrices(Z,_t),n=W.getFrustum(),w(A,U,W.camera,Z,this.type)}W.isPointLightShadow!==!0&&this.type===dn&&b(W,U),W.needsUpdate=!1}d=this.type,p.needsUpdate=!1,i.setRenderTarget(I,_,S)};function b(R,A){const U=t.update(v);f.defines.VSM_SAMPLES!==R.blurSamples&&(f.defines.VSM_SAMPLES=R.blurSamples,m.defines.VSM_SAMPLES=R.blurSamples,f.needsUpdate=!0,m.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new Kn(s.x,s.y)),f.uniforms.shadow_pass.value=R.map.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(A,null,U,f,v,null),m.uniforms.shadow_pass.value=R.mapPass.texture,m.uniforms.resolution.value=R.mapSize,m.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(A,null,U,m,v,null)}function y(R,A,U,I){let _=null;const S=U.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(S!==void 0)_=S;else if(_=U.isPointLight===!0?l:o,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const O=_.uuid,z=A.uuid;let X=c[O];X===void 0&&(X={},c[O]=X);let j=X[z];j===void 0&&(j=_.clone(),X[z]=j,A.addEventListener("dispose",L)),_=j}if(_.visible=A.visible,_.wireframe=A.wireframe,I===dn?_.side=A.shadowSide!==null?A.shadowSide:A.side:_.side=A.shadowSide!==null?A.shadowSide:u[A.side],_.alphaMap=A.alphaMap,_.alphaTest=A.alphaTest,_.map=A.map,_.clipShadows=A.clipShadows,_.clippingPlanes=A.clippingPlanes,_.clipIntersection=A.clipIntersection,_.displacementMap=A.displacementMap,_.displacementScale=A.displacementScale,_.displacementBias=A.displacementBias,_.wireframeLinewidth=A.wireframeLinewidth,_.linewidth=A.linewidth,U.isPointLight===!0&&_.isMeshDistanceMaterial===!0){const O=i.properties.get(_);O.light=U}return _}function w(R,A,U,I,_){if(R.visible===!1)return;if(R.layers.test(A.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&_===dn)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse,R.matrixWorld);const z=t.update(R),X=R.material;if(Array.isArray(X)){const j=z.groups;for(let G=0,Z=j.length;G<Z;G++){const W=j[G],lt=X[W.materialIndex];if(lt&&lt.visible){const ct=y(R,lt,I,_);R.onBeforeShadow(i,R,A,U,z,ct,W),i.renderBufferDirect(U,null,z,ct,R,W),R.onAfterShadow(i,R,A,U,z,ct,W)}}}else if(X.visible){const j=y(R,X,I,_);R.onBeforeShadow(i,R,A,U,z,j,null),i.renderBufferDirect(U,null,z,j,R,null),R.onAfterShadow(i,R,A,U,z,j,null)}}const O=R.children;for(let z=0,X=O.length;z<X;z++)w(O[z],A,U,I,_)}function L(R){R.target.removeEventListener("dispose",L);for(const U in c){const I=c[U],_=R.target.uuid;_ in I&&(I[_].dispose(),delete I[_])}}}const Eg={[oa]:la,[ca]:da,[ha]:fa,[Ti]:ua,[la]:oa,[da]:ca,[fa]:ha,[ua]:Ti};function wg(i){function t(){let D=!1;const at=new te;let V=null;const $=new te(0,0,0,0);return{setMask:function(st){V!==st&&!D&&(i.colorMask(st,st,st,st),V=st)},setLocked:function(st){D=st},setClear:function(st,ot,zt,le,Ce){Ce===!0&&(st*=le,ot*=le,zt*=le),at.set(st,ot,zt,le),$.equals(at)===!1&&(i.clearColor(st,ot,zt,le),$.copy(at))},reset:function(){D=!1,V=null,$.set(-1,0,0,0)}}}function e(){let D=!1,at=!1,V=null,$=null,st=null;return{setReversed:function(ot){at=ot},setTest:function(ot){ot?mt(i.DEPTH_TEST):ht(i.DEPTH_TEST)},setMask:function(ot){V!==ot&&!D&&(i.depthMask(ot),V=ot)},setFunc:function(ot){if(at&&(ot=Eg[ot]),$!==ot){switch(ot){case oa:i.depthFunc(i.NEVER);break;case la:i.depthFunc(i.ALWAYS);break;case ca:i.depthFunc(i.LESS);break;case Ti:i.depthFunc(i.LEQUAL);break;case ha:i.depthFunc(i.EQUAL);break;case ua:i.depthFunc(i.GEQUAL);break;case da:i.depthFunc(i.GREATER);break;case fa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}$=ot}},setLocked:function(ot){D=ot},setClear:function(ot){st!==ot&&(i.clearDepth(ot),st=ot)},reset:function(){D=!1,V=null,$=null,st=null}}}function n(){let D=!1,at=null,V=null,$=null,st=null,ot=null,zt=null,le=null,Ce=null;return{setTest:function(Wt){D||(Wt?mt(i.STENCIL_TEST):ht(i.STENCIL_TEST))},setMask:function(Wt){at!==Wt&&!D&&(i.stencilMask(Wt),at=Wt)},setFunc:function(Wt,Pe,an){(V!==Wt||$!==Pe||st!==an)&&(i.stencilFunc(Wt,Pe,an),V=Wt,$=Pe,st=an)},setOp:function(Wt,Pe,an){(ot!==Wt||zt!==Pe||le!==an)&&(i.stencilOp(Wt,Pe,an),ot=Wt,zt=Pe,le=an)},setLocked:function(Wt){D=Wt},setClear:function(Wt){Ce!==Wt&&(i.clearStencil(Wt),Ce=Wt)},reset:function(){D=!1,at=null,V=null,$=null,st=null,ot=null,zt=null,le=null,Ce=null}}}const s=new t,r=new e,a=new n,o=new WeakMap,l=new WeakMap;let c={},h={},u=new WeakMap,f=[],m=null,g=!1,v=null,p=null,d=null,b=null,y=null,w=null,L=null,R=new Tt(0,0,0),A=0,U=!1,I=null,_=null,S=null,O=null,z=null;const X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let j=!1,G=0;const Z=i.getParameter(i.VERSION);Z.indexOf("WebGL")!==-1?(G=parseFloat(/^WebGL (\d)/.exec(Z)[1]),j=G>=1):Z.indexOf("OpenGL ES")!==-1&&(G=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),j=G>=2);let W=null,lt={};const ct=i.getParameter(i.SCISSOR_BOX),_t=i.getParameter(i.VIEWPORT),Vt=new te().fromArray(ct),Kt=new te().fromArray(_t);function q(D,at,V,$){const st=new Uint8Array(4),ot=i.createTexture();i.bindTexture(D,ot),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let zt=0;zt<V;zt++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(at,0,i.RGBA,1,1,$,0,i.RGBA,i.UNSIGNED_BYTE,st):i.texImage2D(at+zt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,st);return ot}const Q={};Q[i.TEXTURE_2D]=q(i.TEXTURE_2D,i.TEXTURE_2D,1),Q[i.TEXTURE_CUBE_MAP]=q(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Q[i.TEXTURE_2D_ARRAY]=q(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Q[i.TEXTURE_3D]=q(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),r.setClear(1),a.setClear(0),mt(i.DEPTH_TEST),r.setFunc(Ti),Ft(!1),Ht(Uo),mt(i.CULL_FACE),P(Rn);function mt(D){c[D]!==!0&&(i.enable(D),c[D]=!0)}function ht(D){c[D]!==!1&&(i.disable(D),c[D]=!1)}function Lt(D,at){return h[D]!==at?(i.bindFramebuffer(D,at),h[D]=at,D===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=at),D===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=at),!0):!1}function Et(D,at){let V=f,$=!1;if(D){V=u.get(at),V===void 0&&(V=[],u.set(at,V));const st=D.textures;if(V.length!==st.length||V[0]!==i.COLOR_ATTACHMENT0){for(let ot=0,zt=st.length;ot<zt;ot++)V[ot]=i.COLOR_ATTACHMENT0+ot;V.length=st.length,$=!0}}else V[0]!==i.BACK&&(V[0]=i.BACK,$=!0);$&&i.drawBuffers(V)}function Bt(D){return m!==D?(i.useProgram(D),m=D,!0):!1}const Zt={[Hn]:i.FUNC_ADD,[kh]:i.FUNC_SUBTRACT,[zh]:i.FUNC_REVERSE_SUBTRACT};Zt[Hh]=i.MIN,Zt[Gh]=i.MAX;const kt={[Vh]:i.ZERO,[Wh]:i.ONE,[Xh]:i.SRC_COLOR,[ra]:i.SRC_ALPHA,[Zh]:i.SRC_ALPHA_SATURATE,[$h]:i.DST_COLOR,[Yh]:i.DST_ALPHA,[qh]:i.ONE_MINUS_SRC_COLOR,[aa]:i.ONE_MINUS_SRC_ALPHA,[jh]:i.ONE_MINUS_DST_COLOR,[Kh]:i.ONE_MINUS_DST_ALPHA,[Jh]:i.CONSTANT_COLOR,[Qh]:i.ONE_MINUS_CONSTANT_COLOR,[tu]:i.CONSTANT_ALPHA,[eu]:i.ONE_MINUS_CONSTANT_ALPHA};function P(D,at,V,$,st,ot,zt,le,Ce,Wt){if(D===Rn){g===!0&&(ht(i.BLEND),g=!1);return}if(g===!1&&(mt(i.BLEND),g=!0),D!==Bh){if(D!==v||Wt!==U){if((p!==Hn||y!==Hn)&&(i.blendEquation(i.FUNC_ADD),p=Hn,y=Hn),Wt)switch(D){case Si:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case he:i.blendFunc(i.ONE,i.ONE);break;case No:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Fo:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case Si:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case he:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case No:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Fo:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}d=null,b=null,w=null,L=null,R.set(0,0,0),A=0,v=D,U=Wt}return}st=st||at,ot=ot||V,zt=zt||$,(at!==p||st!==y)&&(i.blendEquationSeparate(Zt[at],Zt[st]),p=at,y=st),(V!==d||$!==b||ot!==w||zt!==L)&&(i.blendFuncSeparate(kt[V],kt[$],kt[ot],kt[zt]),d=V,b=$,w=ot,L=zt),(le.equals(R)===!1||Ce!==A)&&(i.blendColor(le.r,le.g,le.b,Ce),R.copy(le),A=Ce),v=D,U=!1}function Fe(D,at){D.side===je?ht(i.CULL_FACE):mt(i.CULL_FACE);let V=D.side===Re;at&&(V=!V),Ft(V),D.blending===Si&&D.transparent===!1?P(Rn):P(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),r.setFunc(D.depthFunc),r.setTest(D.depthTest),r.setMask(D.depthWrite),s.setMask(D.colorWrite);const $=D.stencilWrite;a.setTest($),$&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),ie(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?mt(i.SAMPLE_ALPHA_TO_COVERAGE):ht(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ft(D){I!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),I=D)}function Ht(D){D!==Nh?(mt(i.CULL_FACE),D!==_&&(D===Uo?i.cullFace(i.BACK):D===Fh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ht(i.CULL_FACE),_=D}function At(D){D!==S&&(j&&i.lineWidth(D),S=D)}function ie(D,at,V){D?(mt(i.POLYGON_OFFSET_FILL),(O!==at||z!==V)&&(i.polygonOffset(at,V),O=at,z=V)):ht(i.POLYGON_OFFSET_FILL)}function Pt(D){D?mt(i.SCISSOR_TEST):ht(i.SCISSOR_TEST)}function T(D){D===void 0&&(D=i.TEXTURE0+X-1),W!==D&&(i.activeTexture(D),W=D)}function x(D,at,V){V===void 0&&(W===null?V=i.TEXTURE0+X-1:V=W);let $=lt[V];$===void 0&&($={type:void 0,texture:void 0},lt[V]=$),($.type!==D||$.texture!==at)&&(W!==V&&(i.activeTexture(V),W=V),i.bindTexture(D,at||Q[D]),$.type=D,$.texture=at)}function B(){const D=lt[W];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function K(){try{i.compressedTexImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function J(){try{i.compressedTexImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Y(){try{i.texSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function vt(){try{i.texSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function it(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ut(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Gt(){try{i.texStorage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function tt(){try{i.texStorage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function dt(){try{i.texImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Rt(){try{i.texImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ct(D){Vt.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),Vt.copy(D))}function ft(D){Kt.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),Kt.copy(D))}function Ot(D,at){let V=l.get(at);V===void 0&&(V=new WeakMap,l.set(at,V));let $=V.get(D);$===void 0&&($=i.getUniformBlockIndex(at,D.name),V.set(D,$))}function Dt(D,at){const $=l.get(at).get(D);o.get(at)!==$&&(i.uniformBlockBinding(at,$,D.__bindingPointIndex),o.set(at,$))}function ee(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),c={},W=null,lt={},h={},u=new WeakMap,f=[],m=null,g=!1,v=null,p=null,d=null,b=null,y=null,w=null,L=null,R=new Tt(0,0,0),A=0,U=!1,I=null,_=null,S=null,O=null,z=null,Vt.set(0,0,i.canvas.width,i.canvas.height),Kt.set(0,0,i.canvas.width,i.canvas.height),s.reset(),r.reset(),a.reset()}return{buffers:{color:s,depth:r,stencil:a},enable:mt,disable:ht,bindFramebuffer:Lt,drawBuffers:Et,useProgram:Bt,setBlending:P,setMaterial:Fe,setFlipSided:Ft,setCullFace:Ht,setLineWidth:At,setPolygonOffset:ie,setScissorTest:Pt,activeTexture:T,bindTexture:x,unbindTexture:B,compressedTexImage2D:K,compressedTexImage3D:J,texImage2D:dt,texImage3D:Rt,updateUBOMapping:Ot,uniformBlockBinding:Dt,texStorage2D:Gt,texStorage3D:tt,texSubImage2D:Y,texSubImage3D:vt,compressedTexSubImage2D:it,compressedTexSubImage3D:ut,scissor:Ct,viewport:ft,reset:ee}}function Tl(i,t,e,n){const s=Tg(n);switch(e){case oc:return i*t;case cc:return i*t;case hc:return i*t*2;case io:return i*t/s.components*s.byteLength;case so:return i*t/s.components*s.byteLength;case uc:return i*t*2/s.components*s.byteLength;case ro:return i*t*2/s.components*s.byteLength;case lc:return i*t*3/s.components*s.byteLength;case Qe:return i*t*4/s.components*s.byteLength;case ao:return i*t*4/s.components*s.byteLength;case Us:case Ns:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Fs:case Os:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case xa:case Ma:return Math.max(i,16)*Math.max(t,8)/4;case va:case ya:return Math.max(i,8)*Math.max(t,8)/2;case Sa:case ba:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Ea:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case wa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ta:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Aa:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Ra:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Ca:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Pa:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case La:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Da:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Ia:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Ua:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Na:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Fa:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Oa:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Ba:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Bs:case ka:case za:return Math.ceil(i/4)*Math.ceil(t/4)*16;case dc:case Ha:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Ga:case Va:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Tg(i){switch(i){case _n:case sc:return{byteLength:1,components:1};case Zi:case rc:case Ji:return{byteLength:2,components:1};case eo:case no:return{byteLength:2,components:4};case Yn:case to:case sn:return{byteLength:4,components:1};case ac:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function Ag(i,t,e,n,s,r,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new St,h=new WeakMap;let u;const f=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,x){return m?new OffscreenCanvas(T,x):Ks("canvas")}function v(T,x,B){let K=1;const J=Pt(T);if((J.width>B||J.height>B)&&(K=B/Math.max(J.width,J.height)),K<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const Y=Math.floor(K*J.width),vt=Math.floor(K*J.height);u===void 0&&(u=g(Y,vt));const it=x?g(Y,vt):u;return it.width=Y,it.height=vt,it.getContext("2d").drawImage(T,0,0,Y,vt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+Y+"x"+vt+")."),it}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),T;return T}function p(T){return T.generateMipmaps&&T.minFilter!==Ue&&T.minFilter!==Ze}function d(T){i.generateMipmap(T)}function b(T,x,B,K,J=!1){if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let Y=x;if(x===i.RED&&(B===i.FLOAT&&(Y=i.R32F),B===i.HALF_FLOAT&&(Y=i.R16F),B===i.UNSIGNED_BYTE&&(Y=i.R8)),x===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(Y=i.R8UI),B===i.UNSIGNED_SHORT&&(Y=i.R16UI),B===i.UNSIGNED_INT&&(Y=i.R32UI),B===i.BYTE&&(Y=i.R8I),B===i.SHORT&&(Y=i.R16I),B===i.INT&&(Y=i.R32I)),x===i.RG&&(B===i.FLOAT&&(Y=i.RG32F),B===i.HALF_FLOAT&&(Y=i.RG16F),B===i.UNSIGNED_BYTE&&(Y=i.RG8)),x===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(Y=i.RG8UI),B===i.UNSIGNED_SHORT&&(Y=i.RG16UI),B===i.UNSIGNED_INT&&(Y=i.RG32UI),B===i.BYTE&&(Y=i.RG8I),B===i.SHORT&&(Y=i.RG16I),B===i.INT&&(Y=i.RG32I)),x===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(Y=i.RGB8UI),B===i.UNSIGNED_SHORT&&(Y=i.RGB16UI),B===i.UNSIGNED_INT&&(Y=i.RGB32UI),B===i.BYTE&&(Y=i.RGB8I),B===i.SHORT&&(Y=i.RGB16I),B===i.INT&&(Y=i.RGB32I)),x===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(Y=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(Y=i.RGBA16UI),B===i.UNSIGNED_INT&&(Y=i.RGBA32UI),B===i.BYTE&&(Y=i.RGBA8I),B===i.SHORT&&(Y=i.RGBA16I),B===i.INT&&(Y=i.RGBA32I)),x===i.RGB&&B===i.UNSIGNED_INT_5_9_9_9_REV&&(Y=i.RGB9_E5),x===i.RGBA){const vt=J?Ws:Yt.getTransfer(K);B===i.FLOAT&&(Y=i.RGBA32F),B===i.HALF_FLOAT&&(Y=i.RGBA16F),B===i.UNSIGNED_BYTE&&(Y=vt===re?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT_4_4_4_4&&(Y=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(Y=i.RGB5_A1)}return(Y===i.R16F||Y===i.R32F||Y===i.RG16F||Y===i.RG32F||Y===i.RGBA16F||Y===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Y}function y(T,x){let B;return T?x===null||x===Yn||x===Ci?B=i.DEPTH24_STENCIL8:x===sn?B=i.DEPTH32F_STENCIL8:x===Zi&&(B=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Yn||x===Ci?B=i.DEPTH_COMPONENT24:x===sn?B=i.DEPTH_COMPONENT32F:x===Zi&&(B=i.DEPTH_COMPONENT16),B}function w(T,x){return p(T)===!0||T.isFramebufferTexture&&T.minFilter!==Ue&&T.minFilter!==Ze?Math.log2(Math.max(x.width,x.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?x.mipmaps.length:1}function L(T){const x=T.target;x.removeEventListener("dispose",L),A(x),x.isVideoTexture&&h.delete(x)}function R(T){const x=T.target;x.removeEventListener("dispose",R),I(x)}function A(T){const x=n.get(T);if(x.__webglInit===void 0)return;const B=T.source,K=f.get(B);if(K){const J=K[x.__cacheKey];J.usedTimes--,J.usedTimes===0&&U(T),Object.keys(K).length===0&&f.delete(B)}n.remove(T)}function U(T){const x=n.get(T);i.deleteTexture(x.__webglTexture);const B=T.source,K=f.get(B);delete K[x.__cacheKey],a.memory.textures--}function I(T){const x=n.get(T);if(T.depthTexture&&T.depthTexture.dispose(),T.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(x.__webglFramebuffer[K]))for(let J=0;J<x.__webglFramebuffer[K].length;J++)i.deleteFramebuffer(x.__webglFramebuffer[K][J]);else i.deleteFramebuffer(x.__webglFramebuffer[K]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[K])}else{if(Array.isArray(x.__webglFramebuffer))for(let K=0;K<x.__webglFramebuffer.length;K++)i.deleteFramebuffer(x.__webglFramebuffer[K]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let K=0;K<x.__webglColorRenderbuffer.length;K++)x.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[K]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const B=T.textures;for(let K=0,J=B.length;K<J;K++){const Y=n.get(B[K]);Y.__webglTexture&&(i.deleteTexture(Y.__webglTexture),a.memory.textures--),n.remove(B[K])}n.remove(T)}let _=0;function S(){_=0}function O(){const T=_;return T>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),_+=1,T}function z(T){const x=[];return x.push(T.wrapS),x.push(T.wrapT),x.push(T.wrapR||0),x.push(T.magFilter),x.push(T.minFilter),x.push(T.anisotropy),x.push(T.internalFormat),x.push(T.format),x.push(T.type),x.push(T.generateMipmaps),x.push(T.premultiplyAlpha),x.push(T.flipY),x.push(T.unpackAlignment),x.push(T.colorSpace),x.join()}function X(T,x){const B=n.get(T);if(T.isVideoTexture&&At(T),T.isRenderTargetTexture===!1&&T.version>0&&B.__version!==T.version){const K=T.image;if(K===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Kt(B,T,x);return}}e.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+x)}function j(T,x){const B=n.get(T);if(T.version>0&&B.__version!==T.version){Kt(B,T,x);return}e.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+x)}function G(T,x){const B=n.get(T);if(T.version>0&&B.__version!==T.version){Kt(B,T,x);return}e.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+x)}function Z(T,x){const B=n.get(T);if(T.version>0&&B.__version!==T.version){q(B,T,x);return}e.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+x)}const W={[ga]:i.REPEAT,[Vn]:i.CLAMP_TO_EDGE,[_a]:i.MIRRORED_REPEAT},lt={[Ue]:i.NEAREST,[uu]:i.NEAREST_MIPMAP_NEAREST,[os]:i.NEAREST_MIPMAP_LINEAR,[Ze]:i.LINEAR,[_r]:i.LINEAR_MIPMAP_NEAREST,[Wn]:i.LINEAR_MIPMAP_LINEAR},ct={[mu]:i.NEVER,[Mu]:i.ALWAYS,[gu]:i.LESS,[pc]:i.LEQUAL,[_u]:i.EQUAL,[yu]:i.GEQUAL,[vu]:i.GREATER,[xu]:i.NOTEQUAL};function _t(T,x){if(x.type===sn&&t.has("OES_texture_float_linear")===!1&&(x.magFilter===Ze||x.magFilter===_r||x.magFilter===os||x.magFilter===Wn||x.minFilter===Ze||x.minFilter===_r||x.minFilter===os||x.minFilter===Wn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,W[x.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,W[x.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,W[x.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,lt[x.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,lt[x.minFilter]),x.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,ct[x.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Ue||x.minFilter!==os&&x.minFilter!==Wn||x.type===sn&&t.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){const B=t.get("EXT_texture_filter_anisotropic");i.texParameterf(T,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function Vt(T,x){let B=!1;T.__webglInit===void 0&&(T.__webglInit=!0,x.addEventListener("dispose",L));const K=x.source;let J=f.get(K);J===void 0&&(J={},f.set(K,J));const Y=z(x);if(Y!==T.__cacheKey){J[Y]===void 0&&(J[Y]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,B=!0),J[Y].usedTimes++;const vt=J[T.__cacheKey];vt!==void 0&&(J[T.__cacheKey].usedTimes--,vt.usedTimes===0&&U(x)),T.__cacheKey=Y,T.__webglTexture=J[Y].texture}return B}function Kt(T,x,B){let K=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(K=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(K=i.TEXTURE_3D);const J=Vt(T,x),Y=x.source;e.bindTexture(K,T.__webglTexture,i.TEXTURE0+B);const vt=n.get(Y);if(Y.version!==vt.__version||J===!0){e.activeTexture(i.TEXTURE0+B);const it=Yt.getPrimaries(Yt.workingColorSpace),ut=x.colorSpace===An?null:Yt.getPrimaries(x.colorSpace),Gt=x.colorSpace===An||it===ut?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Gt);let tt=v(x.image,!1,s.maxTextureSize);tt=ie(x,tt);const dt=r.convert(x.format,x.colorSpace),Rt=r.convert(x.type);let Ct=b(x.internalFormat,dt,Rt,x.colorSpace,x.isVideoTexture);_t(K,x);let ft;const Ot=x.mipmaps,Dt=x.isVideoTexture!==!0,ee=vt.__version===void 0||J===!0,D=Y.dataReady,at=w(x,tt);if(x.isDepthTexture)Ct=y(x.format===Pi,x.type),ee&&(Dt?e.texStorage2D(i.TEXTURE_2D,1,Ct,tt.width,tt.height):e.texImage2D(i.TEXTURE_2D,0,Ct,tt.width,tt.height,0,dt,Rt,null));else if(x.isDataTexture)if(Ot.length>0){Dt&&ee&&e.texStorage2D(i.TEXTURE_2D,at,Ct,Ot[0].width,Ot[0].height);for(let V=0,$=Ot.length;V<$;V++)ft=Ot[V],Dt?D&&e.texSubImage2D(i.TEXTURE_2D,V,0,0,ft.width,ft.height,dt,Rt,ft.data):e.texImage2D(i.TEXTURE_2D,V,Ct,ft.width,ft.height,0,dt,Rt,ft.data);x.generateMipmaps=!1}else Dt?(ee&&e.texStorage2D(i.TEXTURE_2D,at,Ct,tt.width,tt.height),D&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,tt.width,tt.height,dt,Rt,tt.data)):e.texImage2D(i.TEXTURE_2D,0,Ct,tt.width,tt.height,0,dt,Rt,tt.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){Dt&&ee&&e.texStorage3D(i.TEXTURE_2D_ARRAY,at,Ct,Ot[0].width,Ot[0].height,tt.depth);for(let V=0,$=Ot.length;V<$;V++)if(ft=Ot[V],x.format!==Qe)if(dt!==null)if(Dt){if(D)if(x.layerUpdates.size>0){const st=Tl(ft.width,ft.height,x.format,x.type);for(const ot of x.layerUpdates){const zt=ft.data.subarray(ot*st/ft.data.BYTES_PER_ELEMENT,(ot+1)*st/ft.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,V,0,0,ot,ft.width,ft.height,1,dt,zt,0,0)}x.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,V,0,0,0,ft.width,ft.height,tt.depth,dt,ft.data,0,0)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,V,Ct,ft.width,ft.height,tt.depth,0,ft.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Dt?D&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,V,0,0,0,ft.width,ft.height,tt.depth,dt,Rt,ft.data):e.texImage3D(i.TEXTURE_2D_ARRAY,V,Ct,ft.width,ft.height,tt.depth,0,dt,Rt,ft.data)}else{Dt&&ee&&e.texStorage2D(i.TEXTURE_2D,at,Ct,Ot[0].width,Ot[0].height);for(let V=0,$=Ot.length;V<$;V++)ft=Ot[V],x.format!==Qe?dt!==null?Dt?D&&e.compressedTexSubImage2D(i.TEXTURE_2D,V,0,0,ft.width,ft.height,dt,ft.data):e.compressedTexImage2D(i.TEXTURE_2D,V,Ct,ft.width,ft.height,0,ft.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Dt?D&&e.texSubImage2D(i.TEXTURE_2D,V,0,0,ft.width,ft.height,dt,Rt,ft.data):e.texImage2D(i.TEXTURE_2D,V,Ct,ft.width,ft.height,0,dt,Rt,ft.data)}else if(x.isDataArrayTexture)if(Dt){if(ee&&e.texStorage3D(i.TEXTURE_2D_ARRAY,at,Ct,tt.width,tt.height,tt.depth),D)if(x.layerUpdates.size>0){const V=Tl(tt.width,tt.height,x.format,x.type);for(const $ of x.layerUpdates){const st=tt.data.subarray($*V/tt.data.BYTES_PER_ELEMENT,($+1)*V/tt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,$,tt.width,tt.height,1,dt,Rt,st)}x.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,tt.width,tt.height,tt.depth,dt,Rt,tt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Ct,tt.width,tt.height,tt.depth,0,dt,Rt,tt.data);else if(x.isData3DTexture)Dt?(ee&&e.texStorage3D(i.TEXTURE_3D,at,Ct,tt.width,tt.height,tt.depth),D&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,tt.width,tt.height,tt.depth,dt,Rt,tt.data)):e.texImage3D(i.TEXTURE_3D,0,Ct,tt.width,tt.height,tt.depth,0,dt,Rt,tt.data);else if(x.isFramebufferTexture){if(ee)if(Dt)e.texStorage2D(i.TEXTURE_2D,at,Ct,tt.width,tt.height);else{let V=tt.width,$=tt.height;for(let st=0;st<at;st++)e.texImage2D(i.TEXTURE_2D,st,Ct,V,$,0,dt,Rt,null),V>>=1,$>>=1}}else if(Ot.length>0){if(Dt&&ee){const V=Pt(Ot[0]);e.texStorage2D(i.TEXTURE_2D,at,Ct,V.width,V.height)}for(let V=0,$=Ot.length;V<$;V++)ft=Ot[V],Dt?D&&e.texSubImage2D(i.TEXTURE_2D,V,0,0,dt,Rt,ft):e.texImage2D(i.TEXTURE_2D,V,Ct,dt,Rt,ft);x.generateMipmaps=!1}else if(Dt){if(ee){const V=Pt(tt);e.texStorage2D(i.TEXTURE_2D,at,Ct,V.width,V.height)}D&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,dt,Rt,tt)}else e.texImage2D(i.TEXTURE_2D,0,Ct,dt,Rt,tt);p(x)&&d(K),vt.__version=Y.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function q(T,x,B){if(x.image.length!==6)return;const K=Vt(T,x),J=x.source;e.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+B);const Y=n.get(J);if(J.version!==Y.__version||K===!0){e.activeTexture(i.TEXTURE0+B);const vt=Yt.getPrimaries(Yt.workingColorSpace),it=x.colorSpace===An?null:Yt.getPrimaries(x.colorSpace),ut=x.colorSpace===An||vt===it?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ut);const Gt=x.isCompressedTexture||x.image[0].isCompressedTexture,tt=x.image[0]&&x.image[0].isDataTexture,dt=[];for(let $=0;$<6;$++)!Gt&&!tt?dt[$]=v(x.image[$],!0,s.maxCubemapSize):dt[$]=tt?x.image[$].image:x.image[$],dt[$]=ie(x,dt[$]);const Rt=dt[0],Ct=r.convert(x.format,x.colorSpace),ft=r.convert(x.type),Ot=b(x.internalFormat,Ct,ft,x.colorSpace),Dt=x.isVideoTexture!==!0,ee=Y.__version===void 0||K===!0,D=J.dataReady;let at=w(x,Rt);_t(i.TEXTURE_CUBE_MAP,x);let V;if(Gt){Dt&&ee&&e.texStorage2D(i.TEXTURE_CUBE_MAP,at,Ot,Rt.width,Rt.height);for(let $=0;$<6;$++){V=dt[$].mipmaps;for(let st=0;st<V.length;st++){const ot=V[st];x.format!==Qe?Ct!==null?Dt?D&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,st,0,0,ot.width,ot.height,Ct,ot.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,st,Ot,ot.width,ot.height,0,ot.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Dt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,st,0,0,ot.width,ot.height,Ct,ft,ot.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,st,Ot,ot.width,ot.height,0,Ct,ft,ot.data)}}}else{if(V=x.mipmaps,Dt&&ee){V.length>0&&at++;const $=Pt(dt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,at,Ot,$.width,$.height)}for(let $=0;$<6;$++)if(tt){Dt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,dt[$].width,dt[$].height,Ct,ft,dt[$].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,Ot,dt[$].width,dt[$].height,0,Ct,ft,dt[$].data);for(let st=0;st<V.length;st++){const zt=V[st].image[$].image;Dt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,st+1,0,0,zt.width,zt.height,Ct,ft,zt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,st+1,Ot,zt.width,zt.height,0,Ct,ft,zt.data)}}else{Dt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,Ct,ft,dt[$]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,Ot,Ct,ft,dt[$]);for(let st=0;st<V.length;st++){const ot=V[st];Dt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,st+1,0,0,Ct,ft,ot.image[$]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,st+1,Ot,Ct,ft,ot.image[$])}}}p(x)&&d(i.TEXTURE_CUBE_MAP),Y.__version=J.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function Q(T,x,B,K,J,Y){const vt=r.convert(B.format,B.colorSpace),it=r.convert(B.type),ut=b(B.internalFormat,vt,it,B.colorSpace);if(!n.get(x).__hasExternalTextures){const tt=Math.max(1,x.width>>Y),dt=Math.max(1,x.height>>Y);J===i.TEXTURE_3D||J===i.TEXTURE_2D_ARRAY?e.texImage3D(J,Y,ut,tt,dt,x.depth,0,vt,it,null):e.texImage2D(J,Y,ut,tt,dt,0,vt,it,null)}e.bindFramebuffer(i.FRAMEBUFFER,T),Ht(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,J,n.get(B).__webglTexture,0,Ft(x)):(J===i.TEXTURE_2D||J>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,K,J,n.get(B).__webglTexture,Y),e.bindFramebuffer(i.FRAMEBUFFER,null)}function mt(T,x,B){if(i.bindRenderbuffer(i.RENDERBUFFER,T),x.depthBuffer){const K=x.depthTexture,J=K&&K.isDepthTexture?K.type:null,Y=y(x.stencilBuffer,J),vt=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,it=Ft(x);Ht(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,it,Y,x.width,x.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,it,Y,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,Y,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,vt,i.RENDERBUFFER,T)}else{const K=x.textures;for(let J=0;J<K.length;J++){const Y=K[J],vt=r.convert(Y.format,Y.colorSpace),it=r.convert(Y.type),ut=b(Y.internalFormat,vt,it,Y.colorSpace),Gt=Ft(x);B&&Ht(x)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Gt,ut,x.width,x.height):Ht(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Gt,ut,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,ut,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ht(T,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,T),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(x.depthTexture).__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),X(x.depthTexture,0);const K=n.get(x.depthTexture).__webglTexture,J=Ft(x);if(x.depthTexture.format===bi)Ht(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,K,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,K,0);else if(x.depthTexture.format===Pi)Ht(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,K,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,K,0);else throw new Error("Unknown depthTexture format")}function Lt(T){const x=n.get(T),B=T.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==T.depthTexture){const K=T.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),K){const J=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,K.removeEventListener("dispose",J)};K.addEventListener("dispose",J),x.__depthDisposeCallback=J}x.__boundDepthTexture=K}if(T.depthTexture&&!x.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");ht(x.__webglFramebuffer,T)}else if(B){x.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(e.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[K]),x.__webglDepthbuffer[K]===void 0)x.__webglDepthbuffer[K]=i.createRenderbuffer(),mt(x.__webglDepthbuffer[K],T,!1);else{const J=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Y=x.__webglDepthbuffer[K];i.bindRenderbuffer(i.RENDERBUFFER,Y),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,Y)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),mt(x.__webglDepthbuffer,T,!1);else{const K=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,J=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,J),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,J)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Et(T,x,B){const K=n.get(T);x!==void 0&&Q(K.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&Lt(T)}function Bt(T){const x=T.texture,B=n.get(T),K=n.get(x);T.addEventListener("dispose",R);const J=T.textures,Y=T.isWebGLCubeRenderTarget===!0,vt=J.length>1;if(vt||(K.__webglTexture===void 0&&(K.__webglTexture=i.createTexture()),K.__version=x.version,a.memory.textures++),Y){B.__webglFramebuffer=[];for(let it=0;it<6;it++)if(x.mipmaps&&x.mipmaps.length>0){B.__webglFramebuffer[it]=[];for(let ut=0;ut<x.mipmaps.length;ut++)B.__webglFramebuffer[it][ut]=i.createFramebuffer()}else B.__webglFramebuffer[it]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){B.__webglFramebuffer=[];for(let it=0;it<x.mipmaps.length;it++)B.__webglFramebuffer[it]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(vt)for(let it=0,ut=J.length;it<ut;it++){const Gt=n.get(J[it]);Gt.__webglTexture===void 0&&(Gt.__webglTexture=i.createTexture(),a.memory.textures++)}if(T.samples>0&&Ht(T)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let it=0;it<J.length;it++){const ut=J[it];B.__webglColorRenderbuffer[it]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[it]);const Gt=r.convert(ut.format,ut.colorSpace),tt=r.convert(ut.type),dt=b(ut.internalFormat,Gt,tt,ut.colorSpace,T.isXRRenderTarget===!0),Rt=Ft(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,Rt,dt,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+it,i.RENDERBUFFER,B.__webglColorRenderbuffer[it])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),mt(B.__webglDepthRenderbuffer,T,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Y){e.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),_t(i.TEXTURE_CUBE_MAP,x);for(let it=0;it<6;it++)if(x.mipmaps&&x.mipmaps.length>0)for(let ut=0;ut<x.mipmaps.length;ut++)Q(B.__webglFramebuffer[it][ut],T,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+it,ut);else Q(B.__webglFramebuffer[it],T,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+it,0);p(x)&&d(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(vt){for(let it=0,ut=J.length;it<ut;it++){const Gt=J[it],tt=n.get(Gt);e.bindTexture(i.TEXTURE_2D,tt.__webglTexture),_t(i.TEXTURE_2D,Gt),Q(B.__webglFramebuffer,T,Gt,i.COLOR_ATTACHMENT0+it,i.TEXTURE_2D,0),p(Gt)&&d(i.TEXTURE_2D)}e.unbindTexture()}else{let it=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(it=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(it,K.__webglTexture),_t(it,x),x.mipmaps&&x.mipmaps.length>0)for(let ut=0;ut<x.mipmaps.length;ut++)Q(B.__webglFramebuffer[ut],T,x,i.COLOR_ATTACHMENT0,it,ut);else Q(B.__webglFramebuffer,T,x,i.COLOR_ATTACHMENT0,it,0);p(x)&&d(it),e.unbindTexture()}T.depthBuffer&&Lt(T)}function Zt(T){const x=T.textures;for(let B=0,K=x.length;B<K;B++){const J=x[B];if(p(J)){const Y=T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,vt=n.get(J).__webglTexture;e.bindTexture(Y,vt),d(Y),e.unbindTexture()}}}const kt=[],P=[];function Fe(T){if(T.samples>0){if(Ht(T)===!1){const x=T.textures,B=T.width,K=T.height;let J=i.COLOR_BUFFER_BIT;const Y=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,vt=n.get(T),it=x.length>1;if(it)for(let ut=0;ut<x.length;ut++)e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ut,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ut,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,vt.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,vt.__webglFramebuffer);for(let ut=0;ut<x.length;ut++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(J|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(J|=i.STENCIL_BUFFER_BIT)),it){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,vt.__webglColorRenderbuffer[ut]);const Gt=n.get(x[ut]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Gt,0)}i.blitFramebuffer(0,0,B,K,0,0,B,K,J,i.NEAREST),l===!0&&(kt.length=0,P.length=0,kt.push(i.COLOR_ATTACHMENT0+ut),T.depthBuffer&&T.resolveDepthBuffer===!1&&(kt.push(Y),P.push(Y),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,P)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,kt))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),it)for(let ut=0;ut<x.length;ut++){e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ut,i.RENDERBUFFER,vt.__webglColorRenderbuffer[ut]);const Gt=n.get(x[ut]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ut,i.TEXTURE_2D,Gt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,vt.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&l){const x=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function Ft(T){return Math.min(s.maxSamples,T.samples)}function Ht(T){const x=n.get(T);return T.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function At(T){const x=a.render.frame;h.get(T)!==x&&(h.set(T,x),T.update())}function ie(T,x){const B=T.colorSpace,K=T.format,J=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||B!==Dn&&B!==An&&(Yt.getTransfer(B)===re?(K!==Qe||J!==_n)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),x}function Pt(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=O,this.resetTextureUnits=S,this.setTexture2D=X,this.setTexture2DArray=j,this.setTexture3D=G,this.setTextureCube=Z,this.rebindTextures=Et,this.setupRenderTarget=Bt,this.updateRenderTargetMipmap=Zt,this.updateMultisampleRenderTarget=Fe,this.setupDepthRenderbuffer=Lt,this.setupFrameBufferTexture=Q,this.useMultisampledRTT=Ht}function Rg(i,t){function e(n,s=An){let r;const a=Yt.getTransfer(s);if(n===_n)return i.UNSIGNED_BYTE;if(n===eo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===no)return i.UNSIGNED_SHORT_5_5_5_1;if(n===ac)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===sc)return i.BYTE;if(n===rc)return i.SHORT;if(n===Zi)return i.UNSIGNED_SHORT;if(n===to)return i.INT;if(n===Yn)return i.UNSIGNED_INT;if(n===sn)return i.FLOAT;if(n===Ji)return i.HALF_FLOAT;if(n===oc)return i.ALPHA;if(n===lc)return i.RGB;if(n===Qe)return i.RGBA;if(n===cc)return i.LUMINANCE;if(n===hc)return i.LUMINANCE_ALPHA;if(n===bi)return i.DEPTH_COMPONENT;if(n===Pi)return i.DEPTH_STENCIL;if(n===io)return i.RED;if(n===so)return i.RED_INTEGER;if(n===uc)return i.RG;if(n===ro)return i.RG_INTEGER;if(n===ao)return i.RGBA_INTEGER;if(n===Us||n===Ns||n===Fs||n===Os)if(a===re)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Us)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ns)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Fs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Os)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Us)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ns)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Fs)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Os)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===va||n===xa||n===ya||n===Ma)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===va)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===xa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ya)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ma)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Sa||n===ba||n===Ea)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Sa||n===ba)return a===re?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Ea)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===wa||n===Ta||n===Aa||n===Ra||n===Ca||n===Pa||n===La||n===Da||n===Ia||n===Ua||n===Na||n===Fa||n===Oa||n===Ba)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===wa)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ta)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Aa)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ra)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ca)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Pa)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===La)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Da)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ia)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ua)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Na)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Fa)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Oa)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ba)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Bs||n===ka||n===za)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Bs)return a===re?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ka)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===za)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===dc||n===Ha||n===Ga||n===Va)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Bs)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ha)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ga)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Va)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ci?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}class Cg extends Ie{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class ge extends _e{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Pg={type:"move"};class qr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ge,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ge,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ge,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const v of t.hand.values()){const p=e.getJointPose(v,n),d=this._getHandJoint(c,v);p!==null&&(d.matrix.fromArray(p.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=p.radius),d.visible=p!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),m=.02,g=.005;c.inputState.pinching&&f>m+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&f<=m-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Pg)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new ge;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const Lg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Dg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Ig{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const s=new Ee,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new vn({vertexShader:Lg,fragmentShader:Dg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Mt(new ts(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Ug extends jn{constructor(t,e){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,m=null,g=null;const v=new Ig,p=e.getContextAttributes();let d=null,b=null;const y=[],w=[],L=new St;let R=null;const A=new Ie;A.layers.enable(1),A.viewport=new te;const U=new Ie;U.layers.enable(2),U.viewport=new te;const I=[A,U],_=new Cg;_.layers.enable(1),_.layers.enable(2);let S=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let Q=y[q];return Q===void 0&&(Q=new qr,y[q]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(q){let Q=y[q];return Q===void 0&&(Q=new qr,y[q]=Q),Q.getGripSpace()},this.getHand=function(q){let Q=y[q];return Q===void 0&&(Q=new qr,y[q]=Q),Q.getHandSpace()};function z(q){const Q=w.indexOf(q.inputSource);if(Q===-1)return;const mt=y[Q];mt!==void 0&&(mt.update(q.inputSource,q.frame,c||a),mt.dispatchEvent({type:q.type,data:q.inputSource}))}function X(){s.removeEventListener("select",z),s.removeEventListener("selectstart",z),s.removeEventListener("selectend",z),s.removeEventListener("squeeze",z),s.removeEventListener("squeezestart",z),s.removeEventListener("squeezeend",z),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",j);for(let q=0;q<y.length;q++){const Q=w[q];Q!==null&&(w[q]=null,y[q].disconnect(Q))}S=null,O=null,v.reset(),t.setRenderTarget(d),m=null,f=null,u=null,s=null,b=null,Kt.stop(),n.isPresenting=!1,t.setPixelRatio(R),t.setSize(L.width,L.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){o=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return f!==null?f:m},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(d=t.getRenderTarget(),s.addEventListener("select",z),s.addEventListener("selectstart",z),s.addEventListener("selectend",z),s.addEventListener("squeeze",z),s.addEventListener("squeezestart",z),s.addEventListener("squeezeend",z),s.addEventListener("end",X),s.addEventListener("inputsourceschange",j),p.xrCompatible!==!0&&await e.makeXRCompatible(),R=t.getPixelRatio(),t.getSize(L),s.renderState.layers===void 0){const Q={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,e,Q),s.updateRenderState({baseLayer:m}),t.setPixelRatio(1),t.setSize(m.framebufferWidth,m.framebufferHeight,!1),b=new Kn(m.framebufferWidth,m.framebufferHeight,{format:Qe,type:_n,colorSpace:t.outputColorSpace,stencilBuffer:p.stencil})}else{let Q=null,mt=null,ht=null;p.depth&&(ht=p.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,Q=p.stencil?Pi:bi,mt=p.stencil?Ci:Yn);const Lt={colorFormat:e.RGBA8,depthFormat:ht,scaleFactor:r};u=new XRWebGLBinding(s,e),f=u.createProjectionLayer(Lt),s.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),b=new Kn(f.textureWidth,f.textureHeight,{format:Qe,type:_n,depthTexture:new Tc(f.textureWidth,f.textureHeight,mt,void 0,void 0,void 0,void 0,void 0,void 0,Q),stencilBuffer:p.stencil,colorSpace:t.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Kt.setContext(s),Kt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function j(q){for(let Q=0;Q<q.removed.length;Q++){const mt=q.removed[Q],ht=w.indexOf(mt);ht>=0&&(w[ht]=null,y[ht].disconnect(mt))}for(let Q=0;Q<q.added.length;Q++){const mt=q.added[Q];let ht=w.indexOf(mt);if(ht===-1){for(let Et=0;Et<y.length;Et++)if(Et>=w.length){w.push(mt),ht=Et;break}else if(w[Et]===null){w[Et]=mt,ht=Et;break}if(ht===-1)break}const Lt=y[ht];Lt&&Lt.connect(mt)}}const G=new C,Z=new C;function W(q,Q,mt){G.setFromMatrixPosition(Q.matrixWorld),Z.setFromMatrixPosition(mt.matrixWorld);const ht=G.distanceTo(Z),Lt=Q.projectionMatrix.elements,Et=mt.projectionMatrix.elements,Bt=Lt[14]/(Lt[10]-1),Zt=Lt[14]/(Lt[10]+1),kt=(Lt[9]+1)/Lt[5],P=(Lt[9]-1)/Lt[5],Fe=(Lt[8]-1)/Lt[0],Ft=(Et[8]+1)/Et[0],Ht=Bt*Fe,At=Bt*Ft,ie=ht/(-Fe+Ft),Pt=ie*-Fe;if(Q.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(Pt),q.translateZ(ie),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Lt[10]===-1)q.projectionMatrix.copy(Q.projectionMatrix),q.projectionMatrixInverse.copy(Q.projectionMatrixInverse);else{const T=Bt+ie,x=Zt+ie,B=Ht-Pt,K=At+(ht-Pt),J=kt*Zt/x*T,Y=P*Zt/x*T;q.projectionMatrix.makePerspective(B,K,J,Y,T,x),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function lt(q,Q){Q===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(Q.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let Q=q.near,mt=q.far;v.texture!==null&&(v.depthNear>0&&(Q=v.depthNear),v.depthFar>0&&(mt=v.depthFar)),_.near=U.near=A.near=Q,_.far=U.far=A.far=mt,(S!==_.near||O!==_.far)&&(s.updateRenderState({depthNear:_.near,depthFar:_.far}),S=_.near,O=_.far);const ht=q.parent,Lt=_.cameras;lt(_,ht);for(let Et=0;Et<Lt.length;Et++)lt(Lt[Et],ht);Lt.length===2?W(_,A,U):_.projectionMatrix.copy(A.projectionMatrix),ct(q,_,ht)};function ct(q,Q,mt){mt===null?q.matrix.copy(Q.matrixWorld):(q.matrix.copy(mt.matrixWorld),q.matrix.invert(),q.matrix.multiply(Q.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(Q.projectionMatrix),q.projectionMatrixInverse.copy(Q.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Wa*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return _},this.getFoveation=function(){if(!(f===null&&m===null))return l},this.setFoveation=function(q){l=q,f!==null&&(f.fixedFoveation=q),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=q)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(_)};let _t=null;function Vt(q,Q){if(h=Q.getViewerPose(c||a),g=Q,h!==null){const mt=h.views;m!==null&&(t.setRenderTargetFramebuffer(b,m.framebuffer),t.setRenderTarget(b));let ht=!1;mt.length!==_.cameras.length&&(_.cameras.length=0,ht=!0);for(let Et=0;Et<mt.length;Et++){const Bt=mt[Et];let Zt=null;if(m!==null)Zt=m.getViewport(Bt);else{const P=u.getViewSubImage(f,Bt);Zt=P.viewport,Et===0&&(t.setRenderTargetTextures(b,P.colorTexture,f.ignoreDepthValues?void 0:P.depthStencilTexture),t.setRenderTarget(b))}let kt=I[Et];kt===void 0&&(kt=new Ie,kt.layers.enable(Et),kt.viewport=new te,I[Et]=kt),kt.matrix.fromArray(Bt.transform.matrix),kt.matrix.decompose(kt.position,kt.quaternion,kt.scale),kt.projectionMatrix.fromArray(Bt.projectionMatrix),kt.projectionMatrixInverse.copy(kt.projectionMatrix).invert(),kt.viewport.set(Zt.x,Zt.y,Zt.width,Zt.height),Et===0&&(_.matrix.copy(kt.matrix),_.matrix.decompose(_.position,_.quaternion,_.scale)),ht===!0&&_.cameras.push(kt)}const Lt=s.enabledFeatures;if(Lt&&Lt.includes("depth-sensing")){const Et=u.getDepthInformation(mt[0]);Et&&Et.isValid&&Et.texture&&v.init(t,Et,s.renderState)}}for(let mt=0;mt<y.length;mt++){const ht=w[mt],Lt=y[mt];ht!==null&&Lt!==void 0&&Lt.update(ht,Q,c||a)}_t&&_t(q,Q),Q.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Q}),g=null}const Kt=new Ec;Kt.setAnimationLoop(Vt),this.setAnimationLoop=function(q){_t=q},this.dispose=function(){}}}const kn=new rn,Ng=new jt;function Fg(i,t){function e(p,d){p.matrixAutoUpdate===!0&&p.updateMatrix(),d.value.copy(p.matrix)}function n(p,d){d.color.getRGB(p.fogColor.value,Mc(i)),d.isFog?(p.fogNear.value=d.near,p.fogFar.value=d.far):d.isFogExp2&&(p.fogDensity.value=d.density)}function s(p,d,b,y,w){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(p,d):d.isMeshToonMaterial?(r(p,d),u(p,d)):d.isMeshPhongMaterial?(r(p,d),h(p,d)):d.isMeshStandardMaterial?(r(p,d),f(p,d),d.isMeshPhysicalMaterial&&m(p,d,w)):d.isMeshMatcapMaterial?(r(p,d),g(p,d)):d.isMeshDepthMaterial?r(p,d):d.isMeshDistanceMaterial?(r(p,d),v(p,d)):d.isMeshNormalMaterial?r(p,d):d.isLineBasicMaterial?(a(p,d),d.isLineDashedMaterial&&o(p,d)):d.isPointsMaterial?l(p,d,b,y):d.isSpriteMaterial?c(p,d):d.isShadowMaterial?(p.color.value.copy(d.color),p.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(p,d){p.opacity.value=d.opacity,d.color&&p.diffuse.value.copy(d.color),d.emissive&&p.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(p.map.value=d.map,e(d.map,p.mapTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,e(d.alphaMap,p.alphaMapTransform)),d.bumpMap&&(p.bumpMap.value=d.bumpMap,e(d.bumpMap,p.bumpMapTransform),p.bumpScale.value=d.bumpScale,d.side===Re&&(p.bumpScale.value*=-1)),d.normalMap&&(p.normalMap.value=d.normalMap,e(d.normalMap,p.normalMapTransform),p.normalScale.value.copy(d.normalScale),d.side===Re&&p.normalScale.value.negate()),d.displacementMap&&(p.displacementMap.value=d.displacementMap,e(d.displacementMap,p.displacementMapTransform),p.displacementScale.value=d.displacementScale,p.displacementBias.value=d.displacementBias),d.emissiveMap&&(p.emissiveMap.value=d.emissiveMap,e(d.emissiveMap,p.emissiveMapTransform)),d.specularMap&&(p.specularMap.value=d.specularMap,e(d.specularMap,p.specularMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest);const b=t.get(d),y=b.envMap,w=b.envMapRotation;y&&(p.envMap.value=y,kn.copy(w),kn.x*=-1,kn.y*=-1,kn.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(kn.y*=-1,kn.z*=-1),p.envMapRotation.value.setFromMatrix4(Ng.makeRotationFromEuler(kn)),p.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=d.reflectivity,p.ior.value=d.ior,p.refractionRatio.value=d.refractionRatio),d.lightMap&&(p.lightMap.value=d.lightMap,p.lightMapIntensity.value=d.lightMapIntensity,e(d.lightMap,p.lightMapTransform)),d.aoMap&&(p.aoMap.value=d.aoMap,p.aoMapIntensity.value=d.aoMapIntensity,e(d.aoMap,p.aoMapTransform))}function a(p,d){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,d.map&&(p.map.value=d.map,e(d.map,p.mapTransform))}function o(p,d){p.dashSize.value=d.dashSize,p.totalSize.value=d.dashSize+d.gapSize,p.scale.value=d.scale}function l(p,d,b,y){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.size.value=d.size*b,p.scale.value=y*.5,d.map&&(p.map.value=d.map,e(d.map,p.uvTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,e(d.alphaMap,p.alphaMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest)}function c(p,d){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.rotation.value=d.rotation,d.map&&(p.map.value=d.map,e(d.map,p.mapTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,e(d.alphaMap,p.alphaMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest)}function h(p,d){p.specular.value.copy(d.specular),p.shininess.value=Math.max(d.shininess,1e-4)}function u(p,d){d.gradientMap&&(p.gradientMap.value=d.gradientMap)}function f(p,d){p.metalness.value=d.metalness,d.metalnessMap&&(p.metalnessMap.value=d.metalnessMap,e(d.metalnessMap,p.metalnessMapTransform)),p.roughness.value=d.roughness,d.roughnessMap&&(p.roughnessMap.value=d.roughnessMap,e(d.roughnessMap,p.roughnessMapTransform)),d.envMap&&(p.envMapIntensity.value=d.envMapIntensity)}function m(p,d,b){p.ior.value=d.ior,d.sheen>0&&(p.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),p.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(p.sheenColorMap.value=d.sheenColorMap,e(d.sheenColorMap,p.sheenColorMapTransform)),d.sheenRoughnessMap&&(p.sheenRoughnessMap.value=d.sheenRoughnessMap,e(d.sheenRoughnessMap,p.sheenRoughnessMapTransform))),d.clearcoat>0&&(p.clearcoat.value=d.clearcoat,p.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(p.clearcoatMap.value=d.clearcoatMap,e(d.clearcoatMap,p.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,e(d.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(p.clearcoatNormalMap.value=d.clearcoatNormalMap,e(d.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Re&&p.clearcoatNormalScale.value.negate())),d.dispersion>0&&(p.dispersion.value=d.dispersion),d.iridescence>0&&(p.iridescence.value=d.iridescence,p.iridescenceIOR.value=d.iridescenceIOR,p.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(p.iridescenceMap.value=d.iridescenceMap,e(d.iridescenceMap,p.iridescenceMapTransform)),d.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=d.iridescenceThicknessMap,e(d.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),d.transmission>0&&(p.transmission.value=d.transmission,p.transmissionSamplerMap.value=b.texture,p.transmissionSamplerSize.value.set(b.width,b.height),d.transmissionMap&&(p.transmissionMap.value=d.transmissionMap,e(d.transmissionMap,p.transmissionMapTransform)),p.thickness.value=d.thickness,d.thicknessMap&&(p.thicknessMap.value=d.thicknessMap,e(d.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=d.attenuationDistance,p.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(p.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(p.anisotropyMap.value=d.anisotropyMap,e(d.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=d.specularIntensity,p.specularColor.value.copy(d.specularColor),d.specularColorMap&&(p.specularColorMap.value=d.specularColorMap,e(d.specularColorMap,p.specularColorMapTransform)),d.specularIntensityMap&&(p.specularIntensityMap.value=d.specularIntensityMap,e(d.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,d){d.matcap&&(p.matcap.value=d.matcap)}function v(p,d){const b=t.get(d).light;p.referencePosition.value.setFromMatrixPosition(b.matrixWorld),p.nearDistance.value=b.shadow.camera.near,p.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Og(i,t,e,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,y){const w=y.program;n.uniformBlockBinding(b,w)}function c(b,y){let w=s[b.id];w===void 0&&(g(b),w=h(b),s[b.id]=w,b.addEventListener("dispose",p));const L=y.program;n.updateUBOMapping(b,L);const R=t.render.frame;r[b.id]!==R&&(f(b),r[b.id]=R)}function h(b){const y=u();b.__bindingPointIndex=y;const w=i.createBuffer(),L=b.__size,R=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,w),i.bufferData(i.UNIFORM_BUFFER,L,R),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,y,w),w}function u(){for(let b=0;b<o;b++)if(a.indexOf(b)===-1)return a.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(b){const y=s[b.id],w=b.uniforms,L=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,y);for(let R=0,A=w.length;R<A;R++){const U=Array.isArray(w[R])?w[R]:[w[R]];for(let I=0,_=U.length;I<_;I++){const S=U[I];if(m(S,R,I,L)===!0){const O=S.__offset,z=Array.isArray(S.value)?S.value:[S.value];let X=0;for(let j=0;j<z.length;j++){const G=z[j],Z=v(G);typeof G=="number"||typeof G=="boolean"?(S.__data[0]=G,i.bufferSubData(i.UNIFORM_BUFFER,O+X,S.__data)):G.isMatrix3?(S.__data[0]=G.elements[0],S.__data[1]=G.elements[1],S.__data[2]=G.elements[2],S.__data[3]=0,S.__data[4]=G.elements[3],S.__data[5]=G.elements[4],S.__data[6]=G.elements[5],S.__data[7]=0,S.__data[8]=G.elements[6],S.__data[9]=G.elements[7],S.__data[10]=G.elements[8],S.__data[11]=0):(G.toArray(S.__data,X),X+=Z.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,O,S.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(b,y,w,L){const R=b.value,A=y+"_"+w;if(L[A]===void 0)return typeof R=="number"||typeof R=="boolean"?L[A]=R:L[A]=R.clone(),!0;{const U=L[A];if(typeof R=="number"||typeof R=="boolean"){if(U!==R)return L[A]=R,!0}else if(U.equals(R)===!1)return U.copy(R),!0}return!1}function g(b){const y=b.uniforms;let w=0;const L=16;for(let A=0,U=y.length;A<U;A++){const I=Array.isArray(y[A])?y[A]:[y[A]];for(let _=0,S=I.length;_<S;_++){const O=I[_],z=Array.isArray(O.value)?O.value:[O.value];for(let X=0,j=z.length;X<j;X++){const G=z[X],Z=v(G),W=w%L,lt=W%Z.boundary,ct=W+lt;w+=lt,ct!==0&&L-ct<Z.storage&&(w+=L-ct),O.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=w,w+=Z.storage}}}const R=w%L;return R>0&&(w+=L-R),b.__size=w,b.__cache={},this}function v(b){const y={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(y.boundary=4,y.storage=4):b.isVector2?(y.boundary=8,y.storage=8):b.isVector3||b.isColor?(y.boundary=16,y.storage=12):b.isVector4?(y.boundary=16,y.storage=16):b.isMatrix3?(y.boundary=48,y.storage=48):b.isMatrix4?(y.boundary=64,y.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),y}function p(b){const y=b.target;y.removeEventListener("dispose",p);const w=a.indexOf(y.__bindingPointIndex);a.splice(w,1),i.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function d(){for(const b in s)i.deleteBuffer(s[b]);a=[],s={},r={}}return{bind:l,update:c,dispose:d}}class Lc{constructor(t={}){const{canvas:e=Eu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=t;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;const m=new Uint32Array(4),g=new Int32Array(4);let v=null,p=null;const d=[],b=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=He,this.toneMapping=Cn,this.toneMappingExposure=1;const y=this;let w=!1,L=0,R=0,A=null,U=-1,I=null;const _=new te,S=new te;let O=null;const z=new Tt(0);let X=0,j=e.width,G=e.height,Z=1,W=null,lt=null;const ct=new te(0,0,j,G),_t=new te(0,0,j,G);let Vt=!1;const Kt=new co;let q=!1,Q=!1;const mt=new jt,ht=new jt,Lt=new C,Et=new te,Bt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Zt=!1;function kt(){return A===null?Z:1}let P=n;function Fe(E,N){return e.getContext(E,N)}try{const E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Qa}`),e.addEventListener("webglcontextlost",$,!1),e.addEventListener("webglcontextrestored",st,!1),e.addEventListener("webglcontextcreationerror",ot,!1),P===null){const N="webgl2";if(P=Fe(N,E),P===null)throw Fe(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let Ft,Ht,At,ie,Pt,T,x,B,K,J,Y,vt,it,ut,Gt,tt,dt,Rt,Ct,ft,Ot,Dt,ee,D;function at(){Ft=new Vp(P),Ft.init(),Dt=new Rg(P,Ft),Ht=new Op(P,Ft,t,Dt),At=new wg(P),Ht.reverseDepthBuffer&&At.buffers.depth.setReversed(!0),ie=new qp(P),Pt=new hg,T=new Ag(P,Ft,At,Pt,Ht,Dt,ie),x=new kp(y),B=new Gp(y),K=new Ju(P),ee=new Np(P,K),J=new Wp(P,K,ie,ee),Y=new Kp(P,J,K,ie),Ct=new Yp(P,Ht,T),tt=new Bp(Pt),vt=new cg(y,x,B,Ft,Ht,ee,tt),it=new Fg(y,Pt),ut=new dg,Gt=new vg(Ft),Rt=new Up(y,x,B,At,Y,f,l),dt=new bg(y,Y,Ht),D=new Og(P,ie,Ht,At),ft=new Fp(P,Ft,ie),Ot=new Xp(P,Ft,ie),ie.programs=vt.programs,y.capabilities=Ht,y.extensions=Ft,y.properties=Pt,y.renderLists=ut,y.shadowMap=dt,y.state=At,y.info=ie}at();const V=new Ug(y,P);this.xr=V,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){const E=Ft.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=Ft.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(E){E!==void 0&&(Z=E,this.setSize(j,G,!1))},this.getSize=function(E){return E.set(j,G)},this.setSize=function(E,N,k=!0){if(V.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}j=E,G=N,e.width=Math.floor(E*Z),e.height=Math.floor(N*Z),k===!0&&(e.style.width=E+"px",e.style.height=N+"px"),this.setViewport(0,0,E,N)},this.getDrawingBufferSize=function(E){return E.set(j*Z,G*Z).floor()},this.setDrawingBufferSize=function(E,N,k){j=E,G=N,Z=k,e.width=Math.floor(E*k),e.height=Math.floor(N*k),this.setViewport(0,0,E,N)},this.getCurrentViewport=function(E){return E.copy(_)},this.getViewport=function(E){return E.copy(ct)},this.setViewport=function(E,N,k,H){E.isVector4?ct.set(E.x,E.y,E.z,E.w):ct.set(E,N,k,H),At.viewport(_.copy(ct).multiplyScalar(Z).round())},this.getScissor=function(E){return E.copy(_t)},this.setScissor=function(E,N,k,H){E.isVector4?_t.set(E.x,E.y,E.z,E.w):_t.set(E,N,k,H),At.scissor(S.copy(_t).multiplyScalar(Z).round())},this.getScissorTest=function(){return Vt},this.setScissorTest=function(E){At.setScissorTest(Vt=E)},this.setOpaqueSort=function(E){W=E},this.setTransparentSort=function(E){lt=E},this.getClearColor=function(E){return E.copy(Rt.getClearColor())},this.setClearColor=function(){Rt.setClearColor.apply(Rt,arguments)},this.getClearAlpha=function(){return Rt.getClearAlpha()},this.setClearAlpha=function(){Rt.setClearAlpha.apply(Rt,arguments)},this.clear=function(E=!0,N=!0,k=!0){let H=0;if(E){let F=!1;if(A!==null){const et=A.texture.format;F=et===ao||et===ro||et===so}if(F){const et=A.texture.type,rt=et===_n||et===Yn||et===Zi||et===Ci||et===eo||et===no,pt=Rt.getClearColor(),gt=Rt.getClearAlpha(),bt=pt.r,wt=pt.g,xt=pt.b;rt?(m[0]=bt,m[1]=wt,m[2]=xt,m[3]=gt,P.clearBufferuiv(P.COLOR,0,m)):(g[0]=bt,g[1]=wt,g[2]=xt,g[3]=gt,P.clearBufferiv(P.COLOR,0,g))}else H|=P.COLOR_BUFFER_BIT}N&&(H|=P.DEPTH_BUFFER_BIT,P.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),k&&(H|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",$,!1),e.removeEventListener("webglcontextrestored",st,!1),e.removeEventListener("webglcontextcreationerror",ot,!1),ut.dispose(),Gt.dispose(),Pt.dispose(),x.dispose(),B.dispose(),Y.dispose(),ee.dispose(),D.dispose(),vt.dispose(),V.dispose(),V.removeEventListener("sessionstart",xo),V.removeEventListener("sessionend",yo),In.stop()};function $(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function st(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const E=ie.autoReset,N=dt.enabled,k=dt.autoUpdate,H=dt.needsUpdate,F=dt.type;at(),ie.autoReset=E,dt.enabled=N,dt.autoUpdate=k,dt.needsUpdate=H,dt.type=F}function ot(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function zt(E){const N=E.target;N.removeEventListener("dispose",zt),le(N)}function le(E){Ce(E),Pt.remove(E)}function Ce(E){const N=Pt.get(E).programs;N!==void 0&&(N.forEach(function(k){vt.releaseProgram(k)}),E.isShaderMaterial&&vt.releaseShaderCache(E))}this.renderBufferDirect=function(E,N,k,H,F,et){N===null&&(N=Bt);const rt=F.isMesh&&F.matrixWorld.determinant()<0,pt=Oc(E,N,k,H,F);At.setMaterial(H,rt);let gt=k.index,bt=1;if(H.wireframe===!0){if(gt=J.getWireframeAttribute(k),gt===void 0)return;bt=2}const wt=k.drawRange,xt=k.attributes.position;let $t=wt.start*bt,se=(wt.start+wt.count)*bt;et!==null&&($t=Math.max($t,et.start*bt),se=Math.min(se,(et.start+et.count)*bt)),gt!==null?($t=Math.max($t,0),se=Math.min(se,gt.count)):xt!=null&&($t=Math.max($t,0),se=Math.min(se,xt.count));const ae=se-$t;if(ae<0||ae===1/0)return;ee.setup(F,H,pt,k,gt);let Oe,Xt=ft;if(gt!==null&&(Oe=K.get(gt),Xt=Ot,Xt.setIndex(Oe)),F.isMesh)H.wireframe===!0?(At.setLineWidth(H.wireframeLinewidth*kt()),Xt.setMode(P.LINES)):Xt.setMode(P.TRIANGLES);else if(F.isLine){let yt=H.linewidth;yt===void 0&&(yt=1),At.setLineWidth(yt*kt()),F.isLineSegments?Xt.setMode(P.LINES):F.isLineLoop?Xt.setMode(P.LINE_LOOP):Xt.setMode(P.LINE_STRIP)}else F.isPoints?Xt.setMode(P.POINTS):F.isSprite&&Xt.setMode(P.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)Xt.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Ft.get("WEBGL_multi_draw"))Xt.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const yt=F._multiDrawStarts,ve=F._multiDrawCounts,qt=F._multiDrawCount,qe=gt?K.get(gt).bytesPerElement:1,Jn=Pt.get(H).currentProgram.getUniforms();for(let Be=0;Be<qt;Be++)Jn.setValue(P,"_gl_DrawID",Be),Xt.render(yt[Be]/qe,ve[Be])}else if(F.isInstancedMesh)Xt.renderInstances($t,ae,F.count);else if(k.isInstancedBufferGeometry){const yt=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,ve=Math.min(k.instanceCount,yt);Xt.renderInstances($t,ae,ve)}else Xt.render($t,ae)};function Wt(E,N,k){E.transparent===!0&&E.side===je&&E.forceSinglePass===!1?(E.side=Re,E.needsUpdate=!0,ns(E,N,k),E.side=Ln,E.needsUpdate=!0,ns(E,N,k),E.side=je):ns(E,N,k)}this.compile=function(E,N,k=null){k===null&&(k=E),p=Gt.get(k),p.init(N),b.push(p),k.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(p.pushLight(F),F.castShadow&&p.pushShadow(F))}),E!==k&&E.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(p.pushLight(F),F.castShadow&&p.pushShadow(F))}),p.setupLights();const H=new Set;return E.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const et=F.material;if(et)if(Array.isArray(et))for(let rt=0;rt<et.length;rt++){const pt=et[rt];Wt(pt,k,F),H.add(pt)}else Wt(et,k,F),H.add(et)}),b.pop(),p=null,H},this.compileAsync=function(E,N,k=null){const H=this.compile(E,N,k);return new Promise(F=>{function et(){if(H.forEach(function(rt){Pt.get(rt).currentProgram.isReady()&&H.delete(rt)}),H.size===0){F(E);return}setTimeout(et,10)}Ft.get("KHR_parallel_shader_compile")!==null?et():setTimeout(et,10)})};let Pe=null;function an(E){Pe&&Pe(E)}function xo(){In.stop()}function yo(){In.start()}const In=new Ec;In.setAnimationLoop(an),typeof self<"u"&&In.setContext(self),this.setAnimationLoop=function(E){Pe=E,V.setAnimationLoop(E),E===null?In.stop():In.start()},V.addEventListener("sessionstart",xo),V.addEventListener("sessionend",yo),this.render=function(E,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),V.enabled===!0&&V.isPresenting===!0&&(V.cameraAutoUpdate===!0&&V.updateCamera(N),N=V.getCamera()),E.isScene===!0&&E.onBeforeRender(y,E,N,A),p=Gt.get(E,b.length),p.init(N),b.push(p),ht.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),Kt.setFromProjectionMatrix(ht),Q=this.localClippingEnabled,q=tt.init(this.clippingPlanes,Q),v=ut.get(E,d.length),v.init(),d.push(v),V.enabled===!0&&V.isPresenting===!0){const et=y.xr.getDepthSensingMesh();et!==null&&sr(et,N,-1/0,y.sortObjects)}sr(E,N,0,y.sortObjects),v.finish(),y.sortObjects===!0&&v.sort(W,lt),Zt=V.enabled===!1||V.isPresenting===!1||V.hasDepthSensing()===!1,Zt&&Rt.addToRenderList(v,E),this.info.render.frame++,q===!0&&tt.beginShadows();const k=p.state.shadowsArray;dt.render(k,E,N),q===!0&&tt.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=v.opaque,F=v.transmissive;if(p.setupLights(),N.isArrayCamera){const et=N.cameras;if(F.length>0)for(let rt=0,pt=et.length;rt<pt;rt++){const gt=et[rt];So(H,F,E,gt)}Zt&&Rt.render(E);for(let rt=0,pt=et.length;rt<pt;rt++){const gt=et[rt];Mo(v,E,gt,gt.viewport)}}else F.length>0&&So(H,F,E,N),Zt&&Rt.render(E),Mo(v,E,N);A!==null&&(T.updateMultisampleRenderTarget(A),T.updateRenderTargetMipmap(A)),E.isScene===!0&&E.onAfterRender(y,E,N),ee.resetDefaultState(),U=-1,I=null,b.pop(),b.length>0?(p=b[b.length-1],q===!0&&tt.setGlobalState(y.clippingPlanes,p.state.camera)):p=null,d.pop(),d.length>0?v=d[d.length-1]:v=null};function sr(E,N,k,H){if(E.visible===!1)return;if(E.layers.test(N.layers)){if(E.isGroup)k=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(N);else if(E.isLight)p.pushLight(E),E.castShadow&&p.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||Kt.intersectsSprite(E)){H&&Et.setFromMatrixPosition(E.matrixWorld).applyMatrix4(ht);const rt=Y.update(E),pt=E.material;pt.visible&&v.push(E,rt,pt,k,Et.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||Kt.intersectsObject(E))){const rt=Y.update(E),pt=E.material;if(H&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Et.copy(E.boundingSphere.center)):(rt.boundingSphere===null&&rt.computeBoundingSphere(),Et.copy(rt.boundingSphere.center)),Et.applyMatrix4(E.matrixWorld).applyMatrix4(ht)),Array.isArray(pt)){const gt=rt.groups;for(let bt=0,wt=gt.length;bt<wt;bt++){const xt=gt[bt],$t=pt[xt.materialIndex];$t&&$t.visible&&v.push(E,rt,$t,k,Et.z,xt)}}else pt.visible&&v.push(E,rt,pt,k,Et.z,null)}}const et=E.children;for(let rt=0,pt=et.length;rt<pt;rt++)sr(et[rt],N,k,H)}function Mo(E,N,k,H){const F=E.opaque,et=E.transmissive,rt=E.transparent;p.setupLightsView(k),q===!0&&tt.setGlobalState(y.clippingPlanes,k),H&&At.viewport(_.copy(H)),F.length>0&&es(F,N,k),et.length>0&&es(et,N,k),rt.length>0&&es(rt,N,k),At.buffers.depth.setTest(!0),At.buffers.depth.setMask(!0),At.buffers.color.setMask(!0),At.setPolygonOffset(!1)}function So(E,N,k,H){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[H.id]===void 0&&(p.state.transmissionRenderTarget[H.id]=new Kn(1,1,{generateMipmaps:!0,type:Ft.has("EXT_color_buffer_half_float")||Ft.has("EXT_color_buffer_float")?Ji:_n,minFilter:Wn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Yt.workingColorSpace}));const et=p.state.transmissionRenderTarget[H.id],rt=H.viewport||_;et.setSize(rt.z,rt.w);const pt=y.getRenderTarget();y.setRenderTarget(et),y.getClearColor(z),X=y.getClearAlpha(),X<1&&y.setClearColor(16777215,.5),y.clear(),Zt&&Rt.render(k);const gt=y.toneMapping;y.toneMapping=Cn;const bt=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),p.setupLightsView(H),q===!0&&tt.setGlobalState(y.clippingPlanes,H),es(E,k,H),T.updateMultisampleRenderTarget(et),T.updateRenderTargetMipmap(et),Ft.has("WEBGL_multisampled_render_to_texture")===!1){let wt=!1;for(let xt=0,$t=N.length;xt<$t;xt++){const se=N[xt],ae=se.object,Oe=se.geometry,Xt=se.material,yt=se.group;if(Xt.side===je&&ae.layers.test(H.layers)){const ve=Xt.side;Xt.side=Re,Xt.needsUpdate=!0,bo(ae,k,H,Oe,Xt,yt),Xt.side=ve,Xt.needsUpdate=!0,wt=!0}}wt===!0&&(T.updateMultisampleRenderTarget(et),T.updateRenderTargetMipmap(et))}y.setRenderTarget(pt),y.setClearColor(z,X),bt!==void 0&&(H.viewport=bt),y.toneMapping=gt}function es(E,N,k){const H=N.isScene===!0?N.overrideMaterial:null;for(let F=0,et=E.length;F<et;F++){const rt=E[F],pt=rt.object,gt=rt.geometry,bt=H===null?rt.material:H,wt=rt.group;pt.layers.test(k.layers)&&bo(pt,N,k,gt,bt,wt)}}function bo(E,N,k,H,F,et){E.onBeforeRender(y,N,k,H,F,et),E.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),F.onBeforeRender(y,N,k,H,E,et),F.transparent===!0&&F.side===je&&F.forceSinglePass===!1?(F.side=Re,F.needsUpdate=!0,y.renderBufferDirect(k,N,H,F,E,et),F.side=Ln,F.needsUpdate=!0,y.renderBufferDirect(k,N,H,F,E,et),F.side=je):y.renderBufferDirect(k,N,H,F,E,et),E.onAfterRender(y,N,k,H,F,et)}function ns(E,N,k){N.isScene!==!0&&(N=Bt);const H=Pt.get(E),F=p.state.lights,et=p.state.shadowsArray,rt=F.state.version,pt=vt.getParameters(E,F.state,et,N,k),gt=vt.getProgramCacheKey(pt);let bt=H.programs;H.environment=E.isMeshStandardMaterial?N.environment:null,H.fog=N.fog,H.envMap=(E.isMeshStandardMaterial?B:x).get(E.envMap||H.environment),H.envMapRotation=H.environment!==null&&E.envMap===null?N.environmentRotation:E.envMapRotation,bt===void 0&&(E.addEventListener("dispose",zt),bt=new Map,H.programs=bt);let wt=bt.get(gt);if(wt!==void 0){if(H.currentProgram===wt&&H.lightsStateVersion===rt)return wo(E,pt),wt}else pt.uniforms=vt.getUniforms(E),E.onBeforeCompile(pt,y),wt=vt.acquireProgram(pt,gt),bt.set(gt,wt),H.uniforms=pt.uniforms;const xt=H.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(xt.clippingPlanes=tt.uniform),wo(E,pt),H.needsLights=kc(E),H.lightsStateVersion=rt,H.needsLights&&(xt.ambientLightColor.value=F.state.ambient,xt.lightProbe.value=F.state.probe,xt.directionalLights.value=F.state.directional,xt.directionalLightShadows.value=F.state.directionalShadow,xt.spotLights.value=F.state.spot,xt.spotLightShadows.value=F.state.spotShadow,xt.rectAreaLights.value=F.state.rectArea,xt.ltc_1.value=F.state.rectAreaLTC1,xt.ltc_2.value=F.state.rectAreaLTC2,xt.pointLights.value=F.state.point,xt.pointLightShadows.value=F.state.pointShadow,xt.hemisphereLights.value=F.state.hemi,xt.directionalShadowMap.value=F.state.directionalShadowMap,xt.directionalShadowMatrix.value=F.state.directionalShadowMatrix,xt.spotShadowMap.value=F.state.spotShadowMap,xt.spotLightMatrix.value=F.state.spotLightMatrix,xt.spotLightMap.value=F.state.spotLightMap,xt.pointShadowMap.value=F.state.pointShadowMap,xt.pointShadowMatrix.value=F.state.pointShadowMatrix),H.currentProgram=wt,H.uniformsList=null,wt}function Eo(E){if(E.uniformsList===null){const N=E.currentProgram.getUniforms();E.uniformsList=Hs.seqWithValue(N.seq,E.uniforms)}return E.uniformsList}function wo(E,N){const k=Pt.get(E);k.outputColorSpace=N.outputColorSpace,k.batching=N.batching,k.batchingColor=N.batchingColor,k.instancing=N.instancing,k.instancingColor=N.instancingColor,k.instancingMorph=N.instancingMorph,k.skinning=N.skinning,k.morphTargets=N.morphTargets,k.morphNormals=N.morphNormals,k.morphColors=N.morphColors,k.morphTargetsCount=N.morphTargetsCount,k.numClippingPlanes=N.numClippingPlanes,k.numIntersection=N.numClipIntersection,k.vertexAlphas=N.vertexAlphas,k.vertexTangents=N.vertexTangents,k.toneMapping=N.toneMapping}function Oc(E,N,k,H,F){N.isScene!==!0&&(N=Bt),T.resetTextureUnits();const et=N.fog,rt=H.isMeshStandardMaterial?N.environment:null,pt=A===null?y.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Dn,gt=(H.isMeshStandardMaterial?B:x).get(H.envMap||rt),bt=H.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,wt=!!k.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),xt=!!k.morphAttributes.position,$t=!!k.morphAttributes.normal,se=!!k.morphAttributes.color;let ae=Cn;H.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(ae=y.toneMapping);const Oe=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,Xt=Oe!==void 0?Oe.length:0,yt=Pt.get(H),ve=p.state.lights;if(q===!0&&(Q===!0||E!==I)){const Ve=E===I&&H.id===U;tt.setState(H,E,Ve)}let qt=!1;H.version===yt.__version?(yt.needsLights&&yt.lightsStateVersion!==ve.state.version||yt.outputColorSpace!==pt||F.isBatchedMesh&&yt.batching===!1||!F.isBatchedMesh&&yt.batching===!0||F.isBatchedMesh&&yt.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&yt.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&yt.instancing===!1||!F.isInstancedMesh&&yt.instancing===!0||F.isSkinnedMesh&&yt.skinning===!1||!F.isSkinnedMesh&&yt.skinning===!0||F.isInstancedMesh&&yt.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&yt.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&yt.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&yt.instancingMorph===!1&&F.morphTexture!==null||yt.envMap!==gt||H.fog===!0&&yt.fog!==et||yt.numClippingPlanes!==void 0&&(yt.numClippingPlanes!==tt.numPlanes||yt.numIntersection!==tt.numIntersection)||yt.vertexAlphas!==bt||yt.vertexTangents!==wt||yt.morphTargets!==xt||yt.morphNormals!==$t||yt.morphColors!==se||yt.toneMapping!==ae||yt.morphTargetsCount!==Xt)&&(qt=!0):(qt=!0,yt.__version=H.version);let qe=yt.currentProgram;qt===!0&&(qe=ns(H,N,F));let Jn=!1,Be=!1,rr=!1;const oe=qe.getUniforms(),xn=yt.uniforms;if(At.useProgram(qe.program)&&(Jn=!0,Be=!0,rr=!0),H.id!==U&&(U=H.id,Be=!0),Jn||I!==E){Ht.reverseDepthBuffer?(mt.copy(E.projectionMatrix),Tu(mt),Au(mt),oe.setValue(P,"projectionMatrix",mt)):oe.setValue(P,"projectionMatrix",E.projectionMatrix),oe.setValue(P,"viewMatrix",E.matrixWorldInverse);const Ve=oe.map.cameraPosition;Ve!==void 0&&Ve.setValue(P,Lt.setFromMatrixPosition(E.matrixWorld)),Ht.logarithmicDepthBuffer&&oe.setValue(P,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&oe.setValue(P,"isOrthographic",E.isOrthographicCamera===!0),I!==E&&(I=E,Be=!0,rr=!0)}if(F.isSkinnedMesh){oe.setOptional(P,F,"bindMatrix"),oe.setOptional(P,F,"bindMatrixInverse");const Ve=F.skeleton;Ve&&(Ve.boneTexture===null&&Ve.computeBoneTexture(),oe.setValue(P,"boneTexture",Ve.boneTexture,T))}F.isBatchedMesh&&(oe.setOptional(P,F,"batchingTexture"),oe.setValue(P,"batchingTexture",F._matricesTexture,T),oe.setOptional(P,F,"batchingIdTexture"),oe.setValue(P,"batchingIdTexture",F._indirectTexture,T),oe.setOptional(P,F,"batchingColorTexture"),F._colorsTexture!==null&&oe.setValue(P,"batchingColorTexture",F._colorsTexture,T));const ar=k.morphAttributes;if((ar.position!==void 0||ar.normal!==void 0||ar.color!==void 0)&&Ct.update(F,k,qe),(Be||yt.receiveShadow!==F.receiveShadow)&&(yt.receiveShadow=F.receiveShadow,oe.setValue(P,"receiveShadow",F.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(xn.envMap.value=gt,xn.flipEnvMap.value=gt.isCubeTexture&&gt.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&N.environment!==null&&(xn.envMapIntensity.value=N.environmentIntensity),Be&&(oe.setValue(P,"toneMappingExposure",y.toneMappingExposure),yt.needsLights&&Bc(xn,rr),et&&H.fog===!0&&it.refreshFogUniforms(xn,et),it.refreshMaterialUniforms(xn,H,Z,G,p.state.transmissionRenderTarget[E.id]),Hs.upload(P,Eo(yt),xn,T)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(Hs.upload(P,Eo(yt),xn,T),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&oe.setValue(P,"center",F.center),oe.setValue(P,"modelViewMatrix",F.modelViewMatrix),oe.setValue(P,"normalMatrix",F.normalMatrix),oe.setValue(P,"modelMatrix",F.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const Ve=H.uniformsGroups;for(let or=0,zc=Ve.length;or<zc;or++){const To=Ve[or];D.update(To,qe),D.bind(To,qe)}}return qe}function Bc(E,N){E.ambientLightColor.needsUpdate=N,E.lightProbe.needsUpdate=N,E.directionalLights.needsUpdate=N,E.directionalLightShadows.needsUpdate=N,E.pointLights.needsUpdate=N,E.pointLightShadows.needsUpdate=N,E.spotLights.needsUpdate=N,E.spotLightShadows.needsUpdate=N,E.rectAreaLights.needsUpdate=N,E.hemisphereLights.needsUpdate=N}function kc(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return L},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(E,N,k){Pt.get(E.texture).__webglTexture=N,Pt.get(E.depthTexture).__webglTexture=k;const H=Pt.get(E);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=k===void 0,H.__autoAllocateDepthBuffer||Ft.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,N){const k=Pt.get(E);k.__webglFramebuffer=N,k.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(E,N=0,k=0){A=E,L=N,R=k;let H=!0,F=null,et=!1,rt=!1;if(E){const gt=Pt.get(E);if(gt.__useDefaultFramebuffer!==void 0)At.bindFramebuffer(P.FRAMEBUFFER,null),H=!1;else if(gt.__webglFramebuffer===void 0)T.setupRenderTarget(E);else if(gt.__hasExternalTextures)T.rebindTextures(E,Pt.get(E.texture).__webglTexture,Pt.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const xt=E.depthTexture;if(gt.__boundDepthTexture!==xt){if(xt!==null&&Pt.has(xt)&&(E.width!==xt.image.width||E.height!==xt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");T.setupDepthRenderbuffer(E)}}const bt=E.texture;(bt.isData3DTexture||bt.isDataArrayTexture||bt.isCompressedArrayTexture)&&(rt=!0);const wt=Pt.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(wt[N])?F=wt[N][k]:F=wt[N],et=!0):E.samples>0&&T.useMultisampledRTT(E)===!1?F=Pt.get(E).__webglMultisampledFramebuffer:Array.isArray(wt)?F=wt[k]:F=wt,_.copy(E.viewport),S.copy(E.scissor),O=E.scissorTest}else _.copy(ct).multiplyScalar(Z).floor(),S.copy(_t).multiplyScalar(Z).floor(),O=Vt;if(At.bindFramebuffer(P.FRAMEBUFFER,F)&&H&&At.drawBuffers(E,F),At.viewport(_),At.scissor(S),At.setScissorTest(O),et){const gt=Pt.get(E.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+N,gt.__webglTexture,k)}else if(rt){const gt=Pt.get(E.texture),bt=N||0;P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,gt.__webglTexture,k||0,bt)}U=-1},this.readRenderTargetPixels=function(E,N,k,H,F,et,rt){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let pt=Pt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&rt!==void 0&&(pt=pt[rt]),pt){At.bindFramebuffer(P.FRAMEBUFFER,pt);try{const gt=E.texture,bt=gt.format,wt=gt.type;if(!Ht.textureFormatReadable(bt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ht.textureTypeReadable(wt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=E.width-H&&k>=0&&k<=E.height-F&&P.readPixels(N,k,H,F,Dt.convert(bt),Dt.convert(wt),et)}finally{const gt=A!==null?Pt.get(A).__webglFramebuffer:null;At.bindFramebuffer(P.FRAMEBUFFER,gt)}}},this.readRenderTargetPixelsAsync=async function(E,N,k,H,F,et,rt){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let pt=Pt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&rt!==void 0&&(pt=pt[rt]),pt){const gt=E.texture,bt=gt.format,wt=gt.type;if(!Ht.textureFormatReadable(bt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ht.textureTypeReadable(wt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(N>=0&&N<=E.width-H&&k>=0&&k<=E.height-F){At.bindFramebuffer(P.FRAMEBUFFER,pt);const xt=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,xt),P.bufferData(P.PIXEL_PACK_BUFFER,et.byteLength,P.STREAM_READ),P.readPixels(N,k,H,F,Dt.convert(bt),Dt.convert(wt),0);const $t=A!==null?Pt.get(A).__webglFramebuffer:null;At.bindFramebuffer(P.FRAMEBUFFER,$t);const se=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await wu(P,se,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,xt),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,et),P.deleteBuffer(xt),P.deleteSync(se),et}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,N=null,k=0){E.isTexture!==!0&&(zs("WebGLRenderer: copyFramebufferToTexture function signature has changed."),N=arguments[0]||null,E=arguments[1]);const H=Math.pow(2,-k),F=Math.floor(E.image.width*H),et=Math.floor(E.image.height*H),rt=N!==null?N.x:0,pt=N!==null?N.y:0;T.setTexture2D(E,0),P.copyTexSubImage2D(P.TEXTURE_2D,k,0,0,rt,pt,F,et),At.unbindTexture()},this.copyTextureToTexture=function(E,N,k=null,H=null,F=0){E.isTexture!==!0&&(zs("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,E=arguments[1],N=arguments[2],F=arguments[3]||0,k=null);let et,rt,pt,gt,bt,wt;k!==null?(et=k.max.x-k.min.x,rt=k.max.y-k.min.y,pt=k.min.x,gt=k.min.y):(et=E.image.width,rt=E.image.height,pt=0,gt=0),H!==null?(bt=H.x,wt=H.y):(bt=0,wt=0);const xt=Dt.convert(N.format),$t=Dt.convert(N.type);T.setTexture2D(N,0),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,N.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,N.unpackAlignment);const se=P.getParameter(P.UNPACK_ROW_LENGTH),ae=P.getParameter(P.UNPACK_IMAGE_HEIGHT),Oe=P.getParameter(P.UNPACK_SKIP_PIXELS),Xt=P.getParameter(P.UNPACK_SKIP_ROWS),yt=P.getParameter(P.UNPACK_SKIP_IMAGES),ve=E.isCompressedTexture?E.mipmaps[F]:E.image;P.pixelStorei(P.UNPACK_ROW_LENGTH,ve.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,ve.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,pt),P.pixelStorei(P.UNPACK_SKIP_ROWS,gt),E.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,F,bt,wt,et,rt,xt,$t,ve.data):E.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,F,bt,wt,ve.width,ve.height,xt,ve.data):P.texSubImage2D(P.TEXTURE_2D,F,bt,wt,et,rt,xt,$t,ve),P.pixelStorei(P.UNPACK_ROW_LENGTH,se),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,ae),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Oe),P.pixelStorei(P.UNPACK_SKIP_ROWS,Xt),P.pixelStorei(P.UNPACK_SKIP_IMAGES,yt),F===0&&N.generateMipmaps&&P.generateMipmap(P.TEXTURE_2D),At.unbindTexture()},this.copyTextureToTexture3D=function(E,N,k=null,H=null,F=0){E.isTexture!==!0&&(zs("WebGLRenderer: copyTextureToTexture3D function signature has changed."),k=arguments[0]||null,H=arguments[1]||null,E=arguments[2],N=arguments[3],F=arguments[4]||0);let et,rt,pt,gt,bt,wt,xt,$t,se;const ae=E.isCompressedTexture?E.mipmaps[F]:E.image;k!==null?(et=k.max.x-k.min.x,rt=k.max.y-k.min.y,pt=k.max.z-k.min.z,gt=k.min.x,bt=k.min.y,wt=k.min.z):(et=ae.width,rt=ae.height,pt=ae.depth,gt=0,bt=0,wt=0),H!==null?(xt=H.x,$t=H.y,se=H.z):(xt=0,$t=0,se=0);const Oe=Dt.convert(N.format),Xt=Dt.convert(N.type);let yt;if(N.isData3DTexture)T.setTexture3D(N,0),yt=P.TEXTURE_3D;else if(N.isDataArrayTexture||N.isCompressedArrayTexture)T.setTexture2DArray(N,0),yt=P.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,N.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,N.unpackAlignment);const ve=P.getParameter(P.UNPACK_ROW_LENGTH),qt=P.getParameter(P.UNPACK_IMAGE_HEIGHT),qe=P.getParameter(P.UNPACK_SKIP_PIXELS),Jn=P.getParameter(P.UNPACK_SKIP_ROWS),Be=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,ae.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,ae.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,gt),P.pixelStorei(P.UNPACK_SKIP_ROWS,bt),P.pixelStorei(P.UNPACK_SKIP_IMAGES,wt),E.isDataTexture||E.isData3DTexture?P.texSubImage3D(yt,F,xt,$t,se,et,rt,pt,Oe,Xt,ae.data):N.isCompressedArrayTexture?P.compressedTexSubImage3D(yt,F,xt,$t,se,et,rt,pt,Oe,ae.data):P.texSubImage3D(yt,F,xt,$t,se,et,rt,pt,Oe,Xt,ae),P.pixelStorei(P.UNPACK_ROW_LENGTH,ve),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,qt),P.pixelStorei(P.UNPACK_SKIP_PIXELS,qe),P.pixelStorei(P.UNPACK_SKIP_ROWS,Jn),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Be),F===0&&N.generateMipmaps&&P.generateMipmap(yt),At.unbindTexture()},this.initRenderTarget=function(E){Pt.get(E).__webglFramebuffer===void 0&&T.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?T.setTextureCube(E,0):E.isData3DTexture?T.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?T.setTexture2DArray(E,0):T.setTexture2D(E,0),At.unbindTexture()},this.resetState=function(){L=0,R=0,A=null,At.reset(),ee.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return pn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=t===oo?"display-p3":"srgb",e.unpackColorSpace=Yt.workingColorSpace===tr?"display-p3":"srgb"}}class uo{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Tt(t),this.density=e}clone(){return new uo(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class fo{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new Tt(t),this.near=e,this.far=n}clone(){return new fo(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Dc extends _e{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new rn,this.environmentIntensity=1,this.environmentRotation=new rn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class Bg extends Ee{constructor(t=null,e=1,n=1,s,r,a,o,l,c=Ue,h=Ue,u,f){super(null,a,o,l,c,h,s,r,u,f),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Al extends tn{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const _i=new jt,Rl=new jt,Rs=[],Cl=new Zn,kg=new jt,Vi=new Mt,Wi=new Ii;class zg extends Mt{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Al(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,kg)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Zn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,_i),Cl.copy(t.boundingBox).applyMatrix4(_i),this.boundingBox.union(Cl)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ii),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,_i),Wi.copy(t.boundingSphere).applyMatrix4(_i),this.boundingSphere.union(Wi)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(t,e){const n=this.matrixWorld,s=this.count;if(Vi.geometry=this.geometry,Vi.material=this.material,Vi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Wi.copy(this.boundingSphere),Wi.applyMatrix4(n),t.ray.intersectsSphere(Wi)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,_i),Rl.multiplyMatrices(n,_i),Vi.matrixWorld=Rl,Vi.raycast(t,Rs);for(let a=0,o=Rs.length;a<o;a++){const l=Rs[a];l.instanceId=r,l.object=this,e.push(l)}Rs.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new Al(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Bg(new Float32Array(s*this.count),s,this.count,io,sn));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Ic extends Ui{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Tt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const $s=new C,js=new C,Pl=new jt,Xi=new er,Cs=new Ii,Yr=new C,Ll=new C;class Hg extends _e{constructor(t=new Ne,e=new Ic){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)$s.fromBufferAttribute(e,s-1),js.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=$s.distanceTo(js);t.setAttribute("lineDistance",new ne(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Cs.copy(n.boundingSphere),Cs.applyMatrix4(s),Cs.radius+=r,t.ray.intersectsSphere(Cs)===!1)return;Pl.copy(s).invert(),Xi.copy(t.ray).applyMatrix4(Pl);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const m=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let v=m,p=g-1;v<p;v+=c){const d=h.getX(v),b=h.getX(v+1),y=Ps(this,t,Xi,l,d,b);y&&e.push(y)}if(this.isLineLoop){const v=h.getX(g-1),p=h.getX(m),d=Ps(this,t,Xi,l,v,p);d&&e.push(d)}}else{const m=Math.max(0,a.start),g=Math.min(f.count,a.start+a.count);for(let v=m,p=g-1;v<p;v+=c){const d=Ps(this,t,Xi,l,v,v+1);d&&e.push(d)}if(this.isLineLoop){const v=Ps(this,t,Xi,l,g-1,m);v&&e.push(v)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Ps(i,t,e,n,s,r){const a=i.geometry.attributes.position;if($s.fromBufferAttribute(a,s),js.fromBufferAttribute(a,r),e.distanceSqToSegment($s,js,Yr,Ll)>n)return;Yr.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(Yr);if(!(l<t.near||l>t.far))return{distance:l,point:Ll.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}const Dl=new C,Il=new C;class Gg extends Hg{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Dl.fromBufferAttribute(e,s),Il.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Dl.distanceTo(Il);t.setAttribute("lineDistance",new ne(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class po extends Ee{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class ir extends Ne{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);const r=[],a=[],o=[],l=[],c=new C,h=new St;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,f=3;u<=e;u++,f+=3){const m=n+u/e*s;c.x=t*Math.cos(m),c.y=t*Math.sin(m),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[f]/t+1)/2,h.y=(a[f+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new ne(a,3)),this.setAttribute("normal",new ne(o,3)),this.setAttribute("uv",new ne(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ir(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class mn extends Ne{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const h=[],u=[],f=[],m=[];let g=0;const v=[],p=n/2;let d=0;b(),a===!1&&(t>0&&y(!0),e>0&&y(!1)),this.setIndex(h),this.setAttribute("position",new ne(u,3)),this.setAttribute("normal",new ne(f,3)),this.setAttribute("uv",new ne(m,2));function b(){const w=new C,L=new C;let R=0;const A=(e-t)/n;for(let U=0;U<=r;U++){const I=[],_=U/r,S=_*(e-t)+t;for(let O=0;O<=s;O++){const z=O/s,X=z*l+o,j=Math.sin(X),G=Math.cos(X);L.x=S*j,L.y=-_*n+p,L.z=S*G,u.push(L.x,L.y,L.z),w.set(j,A,G).normalize(),f.push(w.x,w.y,w.z),m.push(z,1-_),I.push(g++)}v.push(I)}for(let U=0;U<s;U++)for(let I=0;I<r;I++){const _=v[I][U],S=v[I+1][U],O=v[I+1][U+1],z=v[I][U+1];t>0&&(h.push(_,S,z),R+=3),e>0&&(h.push(S,O,z),R+=3)}c.addGroup(d,R,0),d+=R}function y(w){const L=g,R=new St,A=new C;let U=0;const I=w===!0?t:e,_=w===!0?1:-1;for(let O=1;O<=s;O++)u.push(0,p*_,0),f.push(0,_,0),m.push(.5,.5),g++;const S=g;for(let O=0;O<=s;O++){const X=O/s*l+o,j=Math.cos(X),G=Math.sin(X);A.x=I*G,A.y=p*_,A.z=I*j,u.push(A.x,A.y,A.z),f.push(0,_,0),R.x=j*.5+.5,R.y=G*.5*_+.5,m.push(R.x,R.y),g++}for(let O=0;O<s;O++){const z=L+O,X=S+O;w===!0?h.push(X,X+1,z):h.push(X+1,X,z),U+=3}c.addGroup(d,U,w===!0?1:2),d+=U}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new mn(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class mo extends mn{constructor(t=1,e=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new mo(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class go extends Ne{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};const r=[],a=[];o(s),c(n),h(),this.setAttribute("position",new ne(r,3)),this.setAttribute("normal",new ne(r.slice(),3)),this.setAttribute("uv",new ne(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(b){const y=new C,w=new C,L=new C;for(let R=0;R<e.length;R+=3)m(e[R+0],y),m(e[R+1],w),m(e[R+2],L),l(y,w,L,b)}function l(b,y,w,L){const R=L+1,A=[];for(let U=0;U<=R;U++){A[U]=[];const I=b.clone().lerp(w,U/R),_=y.clone().lerp(w,U/R),S=R-U;for(let O=0;O<=S;O++)O===0&&U===R?A[U][O]=I:A[U][O]=I.clone().lerp(_,O/S)}for(let U=0;U<R;U++)for(let I=0;I<2*(R-U)-1;I++){const _=Math.floor(I/2);I%2===0?(f(A[U][_+1]),f(A[U+1][_]),f(A[U][_])):(f(A[U][_+1]),f(A[U+1][_+1]),f(A[U+1][_]))}}function c(b){const y=new C;for(let w=0;w<r.length;w+=3)y.x=r[w+0],y.y=r[w+1],y.z=r[w+2],y.normalize().multiplyScalar(b),r[w+0]=y.x,r[w+1]=y.y,r[w+2]=y.z}function h(){const b=new C;for(let y=0;y<r.length;y+=3){b.x=r[y+0],b.y=r[y+1],b.z=r[y+2];const w=p(b)/2/Math.PI+.5,L=d(b)/Math.PI+.5;a.push(w,1-L)}g(),u()}function u(){for(let b=0;b<a.length;b+=6){const y=a[b+0],w=a[b+2],L=a[b+4],R=Math.max(y,w,L),A=Math.min(y,w,L);R>.9&&A<.1&&(y<.2&&(a[b+0]+=1),w<.2&&(a[b+2]+=1),L<.2&&(a[b+4]+=1))}}function f(b){r.push(b.x,b.y,b.z)}function m(b,y){const w=b*3;y.x=t[w+0],y.y=t[w+1],y.z=t[w+2]}function g(){const b=new C,y=new C,w=new C,L=new C,R=new St,A=new St,U=new St;for(let I=0,_=0;I<r.length;I+=9,_+=6){b.set(r[I+0],r[I+1],r[I+2]),y.set(r[I+3],r[I+4],r[I+5]),w.set(r[I+6],r[I+7],r[I+8]),R.set(a[_+0],a[_+1]),A.set(a[_+2],a[_+3]),U.set(a[_+4],a[_+5]),L.copy(b).add(y).add(w).divideScalar(3);const S=p(L);v(R,_+0,b,S),v(A,_+2,y,S),v(U,_+4,w,S)}}function v(b,y,w,L){L<0&&b.x===1&&(a[y]=b.x-1),w.x===0&&w.z===0&&(a[y]=L/2/Math.PI+.5)}function p(b){return Math.atan2(b.z,-b.x)}function d(b){return Math.atan2(-b.y,Math.sqrt(b.x*b.x+b.z*b.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new go(t.vertices,t.indices,t.radius,t.details)}}class Pn extends go{constructor(t=1,e=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Pn(t.radius,t.detail)}}class gn extends Ne{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new C,f=new C,m=[],g=[],v=[],p=[];for(let d=0;d<=n;d++){const b=[],y=d/n;let w=0;d===0&&a===0?w=.5/e:d===n&&l===Math.PI&&(w=-.5/e);for(let L=0;L<=e;L++){const R=L/e;u.x=-t*Math.cos(s+R*r)*Math.sin(a+y*o),u.y=t*Math.cos(a+y*o),u.z=t*Math.sin(s+R*r)*Math.sin(a+y*o),g.push(u.x,u.y,u.z),f.copy(u).normalize(),v.push(f.x,f.y,f.z),p.push(R+w,1-y),b.push(c++)}h.push(b)}for(let d=0;d<n;d++)for(let b=0;b<e;b++){const y=h[d][b+1],w=h[d][b],L=h[d+1][b],R=h[d+1][b+1];(d!==0||a>0)&&m.push(y,w,R),(d!==n-1||l<Math.PI)&&m.push(w,L,R)}this.setIndex(m),this.setAttribute("position",new ne(g,3)),this.setAttribute("normal",new ne(v,3)),this.setAttribute("uv",new ne(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new gn(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class nn extends Ne{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);const a=[],o=[],l=[],c=[],h=new C,u=new C,f=new C;for(let m=0;m<=n;m++)for(let g=0;g<=s;g++){const v=g/s*r,p=m/n*Math.PI*2;u.x=(t+e*Math.cos(p))*Math.cos(v),u.y=(t+e*Math.cos(p))*Math.sin(v),u.z=e*Math.sin(p),o.push(u.x,u.y,u.z),h.x=t*Math.cos(v),h.y=t*Math.sin(v),f.subVectors(u,h).normalize(),l.push(f.x,f.y,f.z),c.push(g/s),c.push(m/n)}for(let m=1;m<=n;m++)for(let g=1;g<=s;g++){const v=(s+1)*m+g-1,p=(s+1)*(m-1)+g-1,d=(s+1)*(m-1)+g,b=(s+1)*m+g;a.push(v,p,b),a.push(p,d,b)}this.setIndex(a),this.setAttribute("position",new ne(o,3)),this.setAttribute("normal",new ne(l,3)),this.setAttribute("uv",new ne(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new nn(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}}class Se extends Ui{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Tt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Tt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=fc,this.normalScale=new St(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new rn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class _o extends _e{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Tt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class Uc extends _o{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(_e.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Tt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const Kr=new jt,Ul=new C,Nl=new C;class Nc{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new St(512,512),this.map=null,this.mapPass=null,this.matrix=new jt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new co,this._frameExtents=new St(1,1),this._viewportCount=1,this._viewports=[new te(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;Ul.setFromMatrixPosition(t.matrixWorld),e.position.copy(Ul),Nl.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Nl),e.updateMatrixWorld(),Kr.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Kr),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Kr)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const Fl=new jt,qi=new C,$r=new C;class Vg extends Nc{constructor(){super(new Ie(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new St(4,2),this._viewportCount=6,this._viewports=[new te(2,1,1,1),new te(0,1,1,1),new te(3,1,1,1),new te(1,1,1,1),new te(3,0,1,1),new te(1,0,1,1)],this._cubeDirections=[new C(1,0,0),new C(-1,0,0),new C(0,0,1),new C(0,0,-1),new C(0,1,0),new C(0,-1,0)],this._cubeUps=[new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,0,1),new C(0,0,-1)]}updateMatrices(t,e=0){const n=this.camera,s=this.matrix,r=t.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),qi.setFromMatrixPosition(t.matrixWorld),n.position.copy(qi),$r.copy(n.position),$r.add(this._cubeDirections[e]),n.up.copy(this._cubeUps[e]),n.lookAt($r),n.updateMatrixWorld(),s.makeTranslation(-qi.x,-qi.y,-qi.z),Fl.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Fl)}}class $i extends _o{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Vg}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}}class Wg extends Nc{constructor(){super(new wc(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class qa extends _o{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(_e.DEFAULT_UP),this.updateMatrix(),this.target=new _e,this.shadow=new Wg}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class Xg{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Ol(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const e=Ol();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}}function Ol(){return performance.now()}const Bl=new jt;class qg{constructor(t,e,n=0,s=1/0){this.ray=new er(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new lo,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Bl.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Bl),this}intersectObject(t,e=!0,n=[]){return Ya(t,this,n,e),n.sort(kl),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)Ya(t[s],this,n,e);return n.sort(kl),n}}function kl(i,t){return i.distance-t.distance}function Ya(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let a=0,o=r.length;a<o;a++)Ya(r[a],t,e,!0)}}class zl{constructor(t=1,e=0,n=0){return this.radius=t,this.phi=e,this.theta=n,this}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(Ae(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class Yg extends Gg{constructor(t=10,e=10,n=4473924,s=8947848){n=new Tt(n),s=new Tt(s);const r=e/2,a=t/e,o=t/2,l=[],c=[];for(let f=0,m=0,g=-o;f<=e;f++,g+=a){l.push(-o,0,g,o,0,g),l.push(g,0,-o,g,0,o);const v=f===r?n:s;v.toArray(c,m),m+=3,v.toArray(c,m),m+=3,v.toArray(c,m),m+=3,v.toArray(c,m),m+=3}const h=new Ne;h.setAttribute("position",new ne(l,3)),h.setAttribute("color",new ne(c,3));const u=new Ic({vertexColors:!0,toneMapped:!1});super(h,u),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class Kg extends jn{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Qa}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Qa);const Hl={type:"change"},vo={type:"start"},Fc={type:"end"},Ls=new er,Gl=new Tn,$g=Math.cos(70*bu.DEG2RAD),de=new C,De=2*Math.PI,Qt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},jr=1e-6;class jg extends Kg{constructor(t,e=null){super(t,e),this.state=Qt.NONE,this.enabled=!0,this.target=new C,this.cursor=new C,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Mi.ROTATE,MIDDLE:Mi.DOLLY,RIGHT:Mi.PAN},this.touches={ONE:vi.ROTATE,TWO:vi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new C,this._lastQuaternion=new $n,this._lastTargetPosition=new C,this._quat=new $n().setFromUnitVectors(t.up,new C(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new zl,this._sphericalDelta=new zl,this._scale=1,this._panOffset=new C,this._rotateStart=new St,this._rotateEnd=new St,this._rotateDelta=new St,this._panStart=new St,this._panEnd=new St,this._panDelta=new St,this._dollyStart=new St,this._dollyEnd=new St,this._dollyDelta=new St,this._dollyDirection=new C,this._mouse=new St,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Jg.bind(this),this._onPointerDown=Zg.bind(this),this._onPointerUp=Qg.bind(this),this._onContextMenu=a0.bind(this),this._onMouseWheel=n0.bind(this),this._onKeyDown=i0.bind(this),this._onTouchStart=s0.bind(this),this._onTouchMove=r0.bind(this),this._onMouseDown=t0.bind(this),this._onMouseMove=e0.bind(this),this._interceptControlDown=o0.bind(this),this._interceptControlUp=l0.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Hl),this.update(),this.state=Qt.NONE}update(t=null){const e=this.object.position;de.copy(e).sub(this.target),de.applyQuaternion(this._quat),this._spherical.setFromVector3(de),this.autoRotate&&this.state===Qt.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=De:n>Math.PI&&(n-=De),s<-Math.PI?s+=De:s>Math.PI&&(s-=De),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(de.setFromSpherical(this._spherical),de.applyQuaternion(this._quatInverse),e.copy(this.target).add(de),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){const o=de.length();a=this._clampDistance(o*this._scale);const l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){const o=new C(this._mouse.x,this._mouse.y,0);o.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;const c=new C(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=de.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Ls.origin.copy(this.object.position),Ls.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ls.direction))<$g?this.object.lookAt(this.target):(Gl.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ls.intersectPlane(Gl,this.target))))}else if(this.object.isOrthographicCamera){const a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>jr||8*(1-this._lastQuaternion.dot(this.object.quaternion))>jr||this._lastTargetPosition.distanceToSquared(this.target)>jr?(this.dispatchEvent(Hl),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?De/60*this.autoRotateSpeed*t:De/60/60*this.autoRotateSpeed}_getZoomScale(t){const e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){de.setFromMatrixColumn(e,0),de.multiplyScalar(-t),this._panOffset.add(de)}_panUp(t,e){this.screenSpacePanning===!0?de.setFromMatrixColumn(e,1):(de.setFromMatrixColumn(e,0),de.crossVectors(this.object.up,de)),de.multiplyScalar(t),this._panOffset.add(de)}_pan(t,e){const n=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;de.copy(s).sub(this.target);let r=de.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(De*this._rotateDelta.x/e.clientHeight),this._rotateUp(De*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateUp(De*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateUp(-De*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateLeft(De*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateLeft(-De*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{const n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(De*this._rotateDelta.x/e.clientHeight),this._rotateUp(De*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const a=(t.pageX+e.x)*.5,o=(t.pageY+e.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new St,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){const e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){const e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function Zg(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i)))}function Jg(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function Qg(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Fc),this.state=Qt.NONE;break;case 1:const t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function t0(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Mi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=Qt.DOLLY;break;case Mi.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=Qt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=Qt.ROTATE}break;case Mi.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=Qt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=Qt.PAN}break;default:this.state=Qt.NONE}this.state!==Qt.NONE&&this.dispatchEvent(vo)}function e0(i){switch(this.state){case Qt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case Qt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case Qt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function n0(i){this.enabled===!1||this.enableZoom===!1||this.state!==Qt.NONE||(i.preventDefault(),this.dispatchEvent(vo),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Fc))}function i0(i){this.enabled===!1||this.enablePan===!1||this._handleKeyDown(i)}function s0(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case vi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=Qt.TOUCH_ROTATE;break;case vi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=Qt.TOUCH_PAN;break;default:this.state=Qt.NONE}break;case 2:switch(this.touches.TWO){case vi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=Qt.TOUCH_DOLLY_PAN;break;case vi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=Qt.TOUCH_DOLLY_ROTATE;break;default:this.state=Qt.NONE}break;default:this.state=Qt.NONE}this.state!==Qt.NONE&&this.dispatchEvent(vo)}function r0(i){switch(this._trackPointer(i),this.state){case Qt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case Qt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case Qt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case Qt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=Qt.NONE}}function a0(i){this.enabled!==!1&&i.preventDefault()}function o0(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function l0(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const c0=[{x:1,y:0,name:"东"},{x:0,y:1,name:"南"},{x:-1,y:0,name:"西"},{x:0,y:-1,name:"北"}],h0=["斜杠 /","反斜杠 \\"],u0=["东","南","西","北"],Yi={W:{key:"W",label:"白光",hex:"#F2F0E9"},C:{key:"C",label:"青光",hex:"#4FE3D0"},M:{key:"M",label:"品红光",hex:"#FF5FA2"}},Xn=[{id:"corridor",index:1,name:"回廊",nameEn:"CORRIDOR",subtitle:"教学 · 移动与旋转",brief:"青色光从灯塔射出，被反光板挡住时什么也不会发生。走到反光板旁，让它斜过来，光才能拐弯。",objective:"把光送进青色接收环。",width:7,height:7,player:{x:1,y:5},terrain:[".......","..#....",".......",".......","..#....",".......","......."],elements:[{id:"e1",type:"emitter",x:1,y:3,dir:0,color:"C"},{id:"m1",type:"mirror",x:4,y:3,rot:1,solution:0},{id:"r1",type:"receiver",x:4,y:1,color:"C"}],motes:[[5,1],[5,5]]},{id:"fork",index:2,name:"分流",nameEn:"FORK",subtitle:"进阶 · 色散与分光",brief:"白光经过色散棱镜会裂成两种颜色：直行的一束、拐弯的一束。分光镜则把一束复制成两束，送给不同的接收环。",objective:"同时点亮三个接收环：两个青光、一个品红光。",width:9,height:9,player:{x:1,y:7},terrain:[".........",".......#.",".........",".........",".........",".........","#........",".......#.","........."],elements:[{id:"e1",type:"emitter",x:1,y:4,dir:0,color:"W"},{id:"d1",type:"dispersion",x:3,y:4,rot:0,solution:1},{id:"m1",type:"mirror",x:6,y:4,rot:1,solution:0},{id:"s1",type:"splitter",x:6,y:2,rot:0,solution:2},{id:"m2",type:"mirror",x:5,y:2,rot:1,solution:0},{id:"r1",type:"receiver",x:5,y:5,color:"M"},{id:"s2",type:"splitter",x:3,y:6,rot:0,solution:0},{id:"r2",type:"receiver",x:6,y:6,color:"C"},{id:"r3",type:"receiver",x:3,y:8,color:"C"}],motes:[[8,3],[1,7],[7,8]]},{id:"cadence",index:3,name:"时序",nameEn:"CADENCE",subtitle:"进阶 · 浮台与余辉",brief:"光栅门需要余辉压板供电：踩上压板后，它会亮 15 秒。趁这段时间跑过浮台、调整反光板。",objective:"在余辉窗口内点亮接收环。",width:9,height:9,player:{x:1,y:6},terrain:["........#",".........","..#......","..... ...","...... ..","...... ..",".........",".........","..#......"],elements:[{id:"e1",type:"emitter",x:1,y:4,dir:0,color:"C"},{id:"g1",type:"gate",x:5,y:4,link:"p1"},{id:"p1",type:"plate",x:2,y:6,link:"g1",duration:15e3},{id:"m1",type:"mirror",x:7,y:4,rot:1,solution:0},{id:"r1",type:"receiver",x:7,y:2,color:"C"},{id:"pl1",type:"platform",x:6,y:5,path:[[6,5],[6,3]],period:6e3}],motes:[[3,2],[8,6],[5,0]]},{id:"chorus",index:4,name:"合奏",nameEn:"CHORUS",subtitle:"挑战 · 三束同奏",brief:"三座灯塔同时发声，一座色散棱镜负责把白光拆成两色，一道光栅门由远处的压板供电。逐一调好，剩下的交给光。",objective:"点亮全部四个接收环，并回收三枚光点。",width:11,height:9,player:{x:1,y:7},terrain:["..........#",".........#.","...........","...........","..........#","...........","...........","#..........","..........#"],elements:[{id:"e1",type:"emitter",x:1,y:1,dir:0,color:"C"},{id:"m1",type:"mirror",x:7,y:1,rot:0,solution:1},{id:"e2",type:"emitter",x:1,y:3,dir:0,color:"W"},{id:"d1",type:"dispersion",x:3,y:3,rot:0,solution:1},{id:"m2",type:"mirror",x:9,y:3,rot:0,solution:1},{id:"e3",type:"emitter",x:1,y:5,dir:0,color:"M"},{id:"m3",type:"mirror",x:5,y:5,rot:1,solution:0},{id:"r1",type:"receiver",x:7,y:5,color:"C"},{id:"r2",type:"receiver",x:9,y:7,color:"M"},{id:"r3",type:"receiver",x:3,y:7,color:"C"},{id:"r4",type:"receiver",x:5,y:0,color:"M"},{id:"g1",type:"gate",x:3,y:5,link:"p1"},{id:"p1",type:"plate",x:8,y:7,link:"g1",duration:15e3}],motes:[[7,0],[2,7],[8,5]]}],d0=[{0:3,3:0,2:1,1:2},{0:1,1:0,3:2,2:3}];function f0(i,t){return d0[t===0?0:1][i]}const yi=new Set(["mirror","splitter","dispersion"]);class p0{constructor(t){this.level=t,this.cellMap=new Map;for(const e of t.elements)this.cellMap.set(`${e.x},${e.y}`,e);this.moteCells=new Map(t.motes.map(([e,n],s)=>[`${e},${n}`,s])),this.undoStack=[],this.reset()}elementAt(t,e){return this.cellMap.get(`${t},${e}`)||null}terrainAt(t,e){const n=this.level.terrain[e];return n==null?" ":n[t]??" "}isInside(t,e){return t>=0&&e>=0&&t<this.level.width&&e<this.level.height}isWalkable(t,e){if(!this.isInside(t,e)||this.terrainAt(t,e)!==".")return!1;const n=this.elementAt(t,e);return n&&n.type==="gate"?!this.isGateOpen(n):!0}isGateOpen(t){const e=this.level.elements.find(s=>s.id===t.link&&s.type==="plate");return e?(this.plateUntil[e.id]||0)>this.now():!0}now(){return performance.now()}reset(){this.rots={};for(const t of this.level.elements)yi.has(t.type)&&(this.rots[t.id]=t.rot);this.player={x:this.level.player.x,y:this.level.player.y},this.collected=new Set,this.plateUntil={},this.undoStack=[],this.startedAt=0,this.elapsed=0}snapshot(){return{rots:{...this.rots},player:{...this.player},collected:Array.from(this.collected),plateUntil:{...this.plateUntil}}}restore(t){this.rots={...t.rots},this.player={...t.player},this.collected=new Set(t.collected),this.plateUntil={...t.plateUntil}}pushUndo(){this.undoStack.push(this.snapshot()),this.undoStack.length>60&&this.undoStack.shift()}undo(){const t=this.undoStack.pop();return t?(this.restore(t),!0):!1}canUndo(){return this.undoStack.length>0}canRotate(t){const e=this.level.elements.find(s=>s.id===t);if(!e||!yi.has(e.type))return!1;const n=this.player;return n.x===e.x&&n.y===e.y?!0:Math.abs(n.x-e.x)+Math.abs(n.y-e.y)===1}rotate(t,e=0){const n=this.level.elements.find(s=>s.id===t);return!n||!yi.has(n.type)||!this.canRotate(t)?!1:(this.pushUndo(),n.type==="mirror"?this.rots[t]=this.rots[t]===0?1:0:this.rots[t]=(this.rots[t]+(e===0?1:3))%4,!0)}move(t,e){const n=this.player.x+t,s=this.player.y+e;if(!this.isWalkable(n,s))return!1;this.pushUndo(),this.player.x=n,this.player.y=s;const r=`${n},${s}`;this.moteCells.has(r)&&this.collected.add(r);const a=this.elementAt(n,s);return a&&a.type==="plate"&&(this.plateUntil[a.id]=this.now()+(a.duration||12e3)),!0}computeLight(){const t=this.level,e=[],n=new Set,s=new Set,r=new Map,a=t.elements.filter(l=>l.type==="emitter").map(l=>({x:l.x,y:l.y,dir:l.dir,color:l.color||"W",visited:new Set,from:l.id}));let o=0;for(;a.length&&o<400;){o+=1;const l=a.shift();let{x:c,y:h,dir:u,color:f}=l,m=0;for(;m<240;){m+=1;const g=c0[u],v=c+g.x,p=h+g.y;if(!this.isInside(v,p)){e.push({x1:c,y1:h,x2:v,y2:p,color:f,dir:u,edge:!0});break}const d=`${v},${p},${u},${f}`;if(l.visited.has(d)||(l.visited.add(d),e.push({x1:c,y1:h,x2:v,y2:p,color:f,dir:u}),c=v,h=p,this.terrainAt(c,h)==="#"))break;const y=this.elementAt(c,h);if(y){if(y.type==="gate"){if(!this.isGateOpen(y))break;continue}if(y.type==="receiver"){y.color===f?(n.add(y.id),r.has(y.id)||r.set(y.id,[]),r.get(y.id).push({x:c,y:h,color:f})):s.add(y.id);break}if(y.type==="mirror"){u=f0(u,this.rots[y.id]??y.rot);continue}if(y.type==="splitter"){const w=this.rots[y.id]??y.rot;w!==u&&a.push({x:c,y:h,dir:w,color:f,visited:new Set(l.visited),from:l.from});continue}if(y.type==="dispersion"){const w=this.rots[y.id]??y.rot,L=f==="W"?"C":f;f=f==="W"?"M":f,w!==u&&a.push({x:c,y:h,dir:w,color:L,visited:new Set(l.visited),from:l.from});continue}}}}return{segs:e,lit:n,mismatch:s,paths:r}}receivers(){return this.level.elements.filter(t=>t.type==="receiver")}isComplete(t=this.computeLight()){const e=this.receivers();return e.length?e.every(n=>t.lit.has(n.id)):!1}findHint(){for(const t of this.level.elements)if(yi.has(t.type)&&t.solution!=null&&(this.rots[t.id]??t.rot)!==t.solution)return t;return null}platformCell(t,e){const n=t.path||[[t.x,t.y]];if(n.length===1)return{x:n[0][0],y:n[0][1]};const s=t.period||6e3,r=e%s/s;1/(n.length-1+1);const o=(r<.5?r/.5:(1-r)/.5)*(n.length-1),l=Math.floor(o),c=Math.min(n.length-1,l+1),h=o-l;return{x:n[l][0]+(n[c][0]-n[l][0])*h,y:n[l][1]+(n[c][1]-n[l][1])*h}}}const m0={W:.5,C:.56,M:.44},g0=3;function _0(i){Js("atrium"),ue(i);const t=M("div.atrium-wrap");i.appendChild(t);const e=M("div.atrium-stage.ds-canvas-frame",{"data-game-root":"atrium","data-ds-theme":"dark",tabindex:"0","aria-label":"折光阁光路解谜画面，WASD 或方向键移动光标，E 旋转元件"}),n=M("div.atrium-hud"),s=M("div.atrium-overlay");e.appendChild(n),e.appendChild(s);const r=M("header.atrium-head",{},M("a.back-link",{href:"#/"},"← 返回展厅"),M("div.atrium-head-main",{},M("span.exhibit-no",{style:{color:"#B4432B"}},"EXHIBIT 02"),M("h1.ds-detail__title",{},"折光阁"),M("p.pulse-sub",{},"PRISM ATRIUM · 空间解谜")));t.appendChild(r),t.appendChild(e);const a=Zc(),o=Xn.some(h=>h.id===a.current)?a.current:Xn[0].id;let l=null;function c(h){l&&(l.destroy(),l=null);const u=Xn.find(f=>f.id===h)||Xn[0];Jc(u.id),l=new v0({stage:e,hud:n,overlay:s,level:u,onLevelChange:c})}return c(o),Zs(),requestAnimationFrame(()=>l?.focusGame()),()=>{l&&l.destroy()}}class v0{constructor({stage:t,hud:e,overlay:n,level:s,onLevelChange:r}){this.stage=t,this.hud=e,this.overlay=n,this.level=s,this.onLevelChange=r,this.rootEl=t,this.presses=0,this.state=new p0(s),this.selectedId=null,this.hintTarget=null,this.hintUntil=0,this.riding=null,this.complete=!1,this.startedAt=performance.now(),this.elapsed=0,this.moveAnim=null,this.raf=0,this.initThree(),this.buildLevel(),this.buildHud(),this.bindInput(),this.refreshLight(),this.loop=this.loop.bind(this),this.raf=window.requestAnimationFrame(this.loop),this.publish()}publish(){const t=this.state?.player||{x:0,y:0};qn({state:this.complete?"solved":"playing",route:"/atrium",chapter:this.level.id,score:this.state?.collected?.size??0,player:{x:t.x,y:t.y,presses:this.presses},extra:{level:this.level.id,levelName:this.level.name,selected:this.selectedId,collected:this.state?.collected?.size??0,total:this.level.motes.length,elapsedMs:Math.round(this.elapsed)}})}isGameFocused(){const t=this.rootEl;if(!t)return!1;const e=document.activeElement;return e===t||t.contains(e)}focusGame(){try{this.rootEl?.focus({preventScroll:!0})}catch{this.rootEl?.focus()}}initThree(){const t=this.level.width,e=this.level.height;this.scene=new Dc,this.scene.fog=new fo(461598,24,72),this.camera=new Ie(46,1,.1,120);const n=(t+e)*.66+3.6;this.camera.position.set(n*.66,n*.76,n*.66),this.renderer=new Lc({antialias:!0,alpha:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.renderer.setClearColor(329754,0),this.stage.insertBefore(this.renderer.domElement,this.stage.firstChild),this.renderer.domElement.classList.add("atrium-canvas"),this.controls=new jg(this.camera,this.renderer.domElement),this.controls.enableDamping=!0,this.controls.dampingFactor=.09,this.controls.minPolarAngle=Math.PI*.08,this.controls.maxPolarAngle=Math.PI*.46,this.controls.minDistance=6,this.controls.maxDistance=34,this.controls.target.set(0,0,0),this.controls.enablePan=!1;const s=new Uc(3494031,329754,.75);this.scene.add(s);const r=new qa(16777215,.85);r.position.set(7,13,5),this.scene.add(r);const a=new qa(7330047,.35);a.position.set(-8,6,-7),this.scene.add(a),this.playerLight=new $i(5235664,1.7,8,2),this.scene.add(this.playerLight),this.root=new ge,this.scene.add(this.root),this.beamGroup=new ge,this.root.add(this.beamGroup),this.tileTexture=x0(),this.dispersionTexture=y0(),this.gateTexture=M0(),this.onResize=()=>this.resize(),window.addEventListener("resize",this.onResize),this.resize()}worldOf(t,e){return new C(t-(this.level.width-1)/2,0,e-(this.level.height-1)/2)}buildLevel(){const t=this.level,e=[],n=[];for(let m=0;m<t.height;m+=1)for(let g=0;g<t.width;g+=1){const v=t.terrain[m][g];v==="."?e.push([g,m]):v==="#"&&n.push([g,m])}const s=new ts(1,1);s.rotateX(-Math.PI/2);const r=new Se({map:this.tileTexture,roughness:.82,metalness:.12,emissive:new Tt(660019),emissiveIntensity:.8});this.tileMesh=new zg(s,r,e.length);const a=new jt;e.forEach(([m,g],v)=>{const p=this.worldOf(m,g);a.makeTranslation(p.x,0,p.z),this.tileMesh.setMatrixAt(v,a)}),this.tileMesh.instanceMatrix.needsUpdate=!0,this.root.add(this.tileMesh);const o=new Se({color:1318222,roughness:.6,metalness:.35,emissive:461858,emissiveIntensity:.6}),l=new Jt({color:5235664,transparent:!0,opacity:.4});for(const[m,g]of n){const v=this.worldOf(m,g),p=new Mt(new be(.9,2.1,.9),o);p.position.set(v.x,1.05,v.z),this.root.add(p);const d=new Mt(new be(.94,.05,.94),l);d.position.set(v.x,2.08,v.z),this.root.add(d)}this.elementMeshes=new Map,this.moteMeshes=[],this.platformMeshes=[];for(const m of t.elements){const g=this.makeElement(m);g&&(g.userData.elementId=m.id,g.userData.type=m.type,this.elementMeshes.set(m.id,g),this.root.add(g))}for(const[m,g]of t.motes){const v=this.worldOf(m,g),p=new ge,d=new Mt(new Pn(.13),new Jt({color:16761963})),b=new Mt(new gn(.2,12,10),new Jt({color:16761963,transparent:!0,opacity:.22,blending:he,depthWrite:!1}));p.add(d,b),p.position.set(v.x,.5,v.z),p.userData.cell=`${m},${g}`,this.root.add(p),this.moteMeshes.push(p)}this.playerGroup=new ge;const c=new Mt(new Pn(.28),new Se({color:10482666,roughness:.18,metalness:.6,emissive:1933175,emissiveIntensity:1.1}));c.position.y=.42;const h=new Mt(new gn(.12,14,12),new Jt({color:16777215}));h.position.y=.42;const u=new Mt(new nn(.36,.018,8,28),new Jt({color:5235664,transparent:!0,opacity:.6,blending:he,depthWrite:!1}));u.rotation.x=-Math.PI/2,u.position.y=.04,this.playerGroup.add(c,h,u),this.playerInner=h,this.playerRing=u;const f=this.worldOf(this.state.player.x,this.state.player.y);this.playerGroup.position.set(f.x,0,f.z),this.root.add(this.playerGroup),this.hintRing=new Mt(new nn(.5,.03,8,30),new Jt({color:16761963,transparent:!0,opacity:.9,blending:he,depthWrite:!1})),this.hintRing.rotation.x=-Math.PI/2,this.hintRing.visible=!1,this.root.add(this.hintRing),this.selRing=new Mt(new nn(.46,.022,8,30),new Jt({color:15921385,transparent:!0,opacity:.75,blending:he,depthWrite:!1})),this.selRing.rotation.x=-Math.PI/2,this.selRing.visible=!1,this.root.add(this.selRing)}makeElement(t){const e=this.worldOf(t.x,t.y);if(t.type==="emitter"){const n=new ge,s=new Mt(new mn(.2,.28,.5,14),new Se({color:1713238,roughness:.4,metalness:.7,emissive:659760}));s.position.y=.25;const r=new Mt(new mo(.17,.4,14),new Jt({color:Yi[t.color]?.hex||16777215}));return r.rotation.z=-Math.PI/2,r.position.set(.3,.55,0),n.add(s,r),n.position.set(e.x,0,e.z),n.rotation.y=-t.dir*(Math.PI/2),n}if(t.type==="mirror"){const n=new ge,s=new Mt(new be(1.16,.78,.14),new Se({color:12575999,roughness:.06,metalness:.95,emissive:3107752,emissiveIntensity:.85}));s.position.y=.58;const r=new Mt(new be(1.3,.9,.05),new Jt({color:5235664,transparent:!0,opacity:.42,blending:he,depthWrite:!1}));r.position.set(0,.58,-.1);const a=new Mt(new nn(.5,.028,8,4),new Jt({color:9433828,transparent:!0,opacity:.75}));a.rotation.x=Math.PI/2,a.position.y=.12;const o=new Mt(new mn(.1,.17,.28,12),new Se({color:2240622,metalness:.85,roughness:.28}));return o.position.y=.14,n.add(s,r,a,o),n.position.set(e.x,0,e.z),n.rotation.y=this.state.rots[t.id]===0?Math.PI/4:-Math.PI/4,n}if(t.type==="splitter"||t.type==="dispersion"){const n=new ge,s=t.type==="splitter"?new Se({color:13624319,roughness:.1,metalness:.7,emissive:2771584,emissiveIntensity:.9}):new Se({map:this.dispersionTexture,roughness:.12,metalness:.6,emissive:16777215,emissiveMap:this.dispersionTexture,emissiveIntensity:1.1}),r=new Mt(new Pn(.36),s);r.position.y=.55;const a=new Mt(new gn(.44,14,12),new Jt({color:t.type==="splitter"?10320895:16736162,transparent:!0,opacity:.16,blending:he,depthWrite:!1}));a.position.y=.55;const o=new Mt(new mn(.09,.13,.22,10),new Se({color:1713238,metalness:.8,roughness:.35}));o.position.y=.11,n.add(r,a,o),n.position.set(e.x,0,e.z),n.userData.core=r;const l=new Mt(new be(.5,.04,.07),new Jt({color:t.type==="splitter"?10320895:5235664,transparent:!0,opacity:.85}));l.position.set(.3,.55,0);const c=new ge;return c.position.y=0,c.add(l),n.add(c),n.userData.armPivot=c,n}if(t.type==="receiver"){const n=new ge,s=Yi[t.color]?.hex||16777215,r=new Mt(new nn(.32,.055,10,32),new Se({color:s,emissive:s,emissiveIntensity:.5,roughness:.3,metalness:.6}));r.rotation.x=-Math.PI/2,r.position.y=.16;const a=new Mt(new ir(.28,28),new Jt({color:s,transparent:!0,opacity:.12,blending:he,depthWrite:!1}));a.rotation.x=-Math.PI/2,a.position.y=.14;const o=new Mt(new gn(.42,14,12),new Jt({color:s,transparent:!0,opacity:0,blending:he,depthWrite:!1}));return o.position.y=.2,n.add(r,a,o),n.position.set(e.x,0,e.z),n.userData.ring=r,n.userData.disc=a,n.userData.halo=o,n}if(t.type==="gate"){const n=new ge,s=new Mt(new be(.94,1,.08),new Jt({map:this.gateTexture,transparent:!0,opacity:.8,blending:he,depthWrite:!1,side:je}));s.position.y=.5;const r=new Mt(new be(.98,.05,.12),new Jt({color:16736162,transparent:!0,opacity:.75}));return r.position.y=1.02,n.add(s,r),n.position.set(e.x,0,e.z),n.userData.bars=s,n.userData.frame=r,n}if(t.type==="plate"){const n=new ge,s=new Mt(new mn(.34,.34,.07,24),new Se({color:1713238,roughness:.5,metalness:.5,emissive:659760}));s.position.y=.05;const r=new Mt(new nn(.3,.028,8,28),new Jt({color:16736162,transparent:!0,opacity:.45,blending:he,depthWrite:!1}));return r.rotation.x=-Math.PI/2,r.position.y=.1,n.add(s,r),n.position.set(e.x,0,e.z),n.userData.ring=r,n}if(t.type==="platform"){const n=new ge,s=new Mt(new be(.94,.12,.94),new Se({color:1779032,roughness:.45,metalness:.6,emissive:791616,emissiveIntensity:.8}));s.position.y=.06;const r=new Mt(new be(.98,.03,.98),new Jt({color:10320895,transparent:!0,opacity:.75,blending:he,depthWrite:!1}));r.position.y=.13,n.add(s,r);const a=this.worldOf(t.x,t.y);return n.position.set(a.x,0,a.z),this.platformMeshes.push({el:t,group:n}),n}return null}buildHud(){ue(this.hud),this.hud.classList.add("atrium-hud"),this.tabs=M("div.atrium-tabs");for(const t of Xn){const e=nh(t.id);this.tabs.appendChild(M("button.atrium-tab",{type:"button","data-level":t.id,"aria-pressed":String(t.id===this.level.id),class:e?"is-done":"",onclick:()=>this.onLevelChange(t.id)},M("b",{},`LV${t.index}`),M("span",{},t.name),e?M("i",{title:"已通关"},"★"):null))}this.elTime=M("b.hud-value",{},"00:00"),this.elMotes=M("b.hud-value",{},"0 / 0"),this.elReceivers=M("div.receiver-status"),this.btnUndo=M("button.btn.btn-sm",{type:"button","data-control":"undo",onclick:()=>this.doUndo()},"撤销"),this.btnHint=M("button.btn.btn-sm",{type:"button","data-control":"hint",onclick:()=>this.doHint()},"提示"),this.btnReset=M("button.btn.btn-sm.btn-ghost",{type:"button","data-control":"restart",onclick:()=>this.doReset()},"重置"),this.btnView=M("button.btn.btn-sm.btn-ghost",{type:"button","data-control":"view",onclick:()=>this.resetView()},"视角复位"),this.hud.appendChild(M("div.atrium-hud-top",{},this.tabs,M("div.atrium-hud-stats",{},M("div.hud-stat",{},M("label",{},"用时"),this.elTime),M("div.hud-stat",{},M("label",{},"光点"),this.elMotes),M("div.hud-stat.hud-stat--wide",{},M("label",{},"接收环"),this.elReceivers)))),this.hud.appendChild(M("div.atrium-hud-bottom.ds-canvas-frame__hud",{},M("div.hud-actions",{},this.btnUndo,this.btnHint,this.btnReset,this.btnView),M("div.hud-legend.ds-diagram",{},Zr("#4FE3D0","青光接收环"),Zr("#FF5FA2","品红光接收环"),Zr("#9D7BFF","分光镜")))),this.stage.appendChild(M("div.atrium-help",{},M("span",{},"WASD / 方向键 移动"),M("span",{},"点击元件或按 E 旋转"),M("span",{},"Tab 切换目标"),M("span",{},"拖拽 旋转视角 · 滚轮 缩放")))}updateHud(){this.elTime.textContent=is(this.elapsed);const t=this.level.motes.length;this.elMotes.textContent=`${this.state.collected.size} / ${t}`,this.btnUndo.disabled=!this.state.canUndo();const e=this.light;ue(this.elReceivers);for(const n of this.state.receivers()){const s=e.lit.has(n.id),r=e.mismatch.has(n.id),a=Yi[n.color]?.hex||"#fff";this.elReceivers.appendChild(M("span.rev-chip",{class:s?"is-lit":r?"is-bad":"",style:{"--rc":a},title:s?"已点亮":r?"颜色不符":"未点亮"},s?"●":r?"✕":"○"))}}bindInput(){this.onKeyDown=t=>{if(t.metaKey||t.ctrlKey||t.altKey||!this.isGameFocused())return;const e=t.code,n={KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]};if(n[e]){t.preventDefault(),this.presses+=1,this.tryMove(n[e][0],n[e][1]);return}if(e==="KeyE"||e==="Space"||e==="Enter"){this.selectedId&&(t.preventDefault(),this.presses+=1,this.tryRotate(this.selectedId));return}e==="Tab"&&(t.preventDefault(),this.presses+=1,this.cycleSelection())},window.addEventListener("keydown",this.onKeyDown),this.pointerDown=null,this.onPointerDown=t=>{this.focusGame(),this.pointerDown={x:t.clientX,y:t.clientY}},this.onPointerUp=t=>{if(!this.pointerDown)return;const e=t.clientX-this.pointerDown.x,n=t.clientY-this.pointerDown.y;this.pointerDown=null,!(Math.hypot(e,n)>6)&&this.pickElement(t)},this.renderer.domElement.addEventListener("pointerdown",this.onPointerDown),this.renderer.domElement.addEventListener("pointerup",this.onPointerUp)}pickElement(t){const e=this.renderer.domElement.getBoundingClientRect(),n=new St((t.clientX-e.left)/e.width*2-1,-((t.clientY-e.top)/e.height)*2+1),s=new qg;s.setFromCamera(n,this.camera);const r=s.intersectObjects(this.root.children,!0);for(const a of r){let o=a.object;for(;o&&!o.userData.elementId;)o=o.parent;if(o&&o.userData.elementId){const l=o.userData.elementId;this.selectedId=l,this.updateSelRing(),this.tryRotate(l);return}}}tryMove(t,e){if(!(this.complete||!this.state.move(t,e))){this.riding=null;for(const{el:s}of this.platformMeshes){const r=this.state.platformCell(s,performance.now());Math.round(r.x)===this.state.player.x&&Math.round(r.y)===this.state.player.y&&(this.riding=s.id)}this.moveAnim={from:this.playerGroup.position.clone(),to:this.worldOf(this.state.player.x,this.state.player.y),t0:performance.now()},this.refreshLight(),this.updateHud(),this.publish()}}tryRotate(t){if(this.complete)return;const e=this.level.elements.find(n=>n.id===t);if(!(!e||!yi.has(e.type))){if(!this.state.canRotate(t)){Xe("离得太远了 —— 走到它旁边再旋转","warn");return}this.state.rotate(t),this.refreshLight(),this.updateHud(),this.updateSelRing(),this.publish()}}cycleSelection(){const t=this.level.elements.filter(s=>yi.has(s.type));if(!t.length)return;const e=t.findIndex(s=>s.id===this.selectedId);this.selectedId=t[(e+1)%t.length].id,this.updateSelRing();const n=t[(e+1)%t.length];Xe(`已选中：${n.type==="mirror"?"反光板":n.type==="splitter"?"分光镜":"色散棱镜"}（按 E 旋转）`),this.publish()}updateSelRing(){if(!this.selectedId){this.selRing.visible=!1;return}const t=this.level.elements.find(n=>n.id===this.selectedId);if(!t){this.selRing.visible=!1;return}const e=this.worldOf(t.x,t.y);this.selRing.position.set(e.x,.08,e.z),this.selRing.visible=!0}doUndo(){if(!this.state.undo()){Xe("没有可撤销的操作了");return}this.riding=null,this.syncMeshes(),this.refreshLight(),this.updateHud(),this.publish(),Xe("已撤销上一步")}doHint(){if(this.complete)return;if(eh(this.level.id)>=g0){Xe("本关提示次数已用完（3 次）","warn");return}const e=this.state.findHint();if(!e){Xe("当前所有元件都已在推荐朝向上——问题可能在别处","warn");return}th(this.level.id),this.hintTarget=e,this.hintUntil=performance.now()+9e3,this.selectedId=e.id,this.updateSelRing();const n=this.worldOf(e.x,e.y);this.hintRing.position.set(n.x,.1,n.z),this.hintRing.visible=!0;const s=e.type==="mirror"?h0[e.solution]:`朝${u0[e.solution]}分光`;Xe(`提示：把这块${e.type==="mirror"?"反光板":e.type==="splitter"?"分光镜":"色散棱镜"}转成「${s}」`,"good",5200),this.updateHud()}doReset(){this.state.reset(),this.riding=null,this.complete=!1,this.startedAt=performance.now(),this.elapsed=0,this.moveAnim=null,this.hintTarget=null,this.hintRing.visible=!1,this.syncMeshes(),this.refreshLight(),this.updateHud(),this.clearOverlay(),this.publish(),Xe("本关已重置")}resetView(){const t=this.level.width,e=this.level.height,n=(t+e)*.66+3.6;this.camera.position.set(n*.66,n*.76,n*.66),this.controls.target.set(0,0,0),this.controls.update()}refreshLight(){this.light=this.state.computeLight(),this.buildBeams(this.light),!this.complete&&this.state.isComplete(this.light)&&this.onComplete()}buildBeams(t){for(;this.beamGroup.children.length;){const n=this.beamGroup.children.pop();n.geometry?.dispose?.(),n.material?.dispose?.()}const e=new Jt({color:16777215,transparent:!0,opacity:.22,blending:he,depthWrite:!1});for(const n of t.segs){const s=this.worldOf(n.x1,n.y1),r=this.worldOf(n.x2,n.y2),a=s.clone().add(r).multiplyScalar(.5),o=s.distanceTo(r),l=m0[n.color]??.5,c=Yi[n.color]?.hex||16777215,h=new Mt(new be(o,.16,.16),e.clone());h.material.color=new Tt(c),h.position.set(a.x,l,a.z),h.rotation.y=-n.dir*(Math.PI/2),this.beamGroup.add(h);const u=new Mt(new be(o,.05,.05),new Jt({color:new Tt(c),transparent:!0,opacity:.9,blending:he,depthWrite:!1}));u.position.set(a.x,l,a.z),u.rotation.y=-n.dir*(Math.PI/2),this.beamGroup.add(u)}}syncMeshes(){for(const e of this.level.elements){const n=this.elementMeshes.get(e.id);if(n){if(e.type==="mirror")n.rotation.y=this.state.rots[e.id]===0?Math.PI/4:-Math.PI/4;else if(e.type==="splitter"||e.type==="dispersion"){const s=this.state.rots[e.id]??0;n.userData.armPivot&&(n.userData.armPivot.rotation.y=-s*(Math.PI/2))}}}const t=this.worldOf(this.state.player.x,this.state.player.y);this.playerGroup.position.set(t.x,0,t.z);for(const e of this.moteMeshes)e.visible=!this.state.collected.has(e.userData.cell)}onComplete(){this.complete=!0;const t=this.state.collected.size,e=this.level.motes.length,n=Qc(this.level.id,{timeMs:Math.round(this.elapsed),motes:t,totalMotes:e}),s=n.stars,r=Xn.findIndex(l=>l.id===this.level.id),a=Xn[r+1];this.publish();const o=M("div.atrium-result",{},M("div.result-stars",{},"★".repeat(s)+"☆".repeat(Math.max(0,3-s))),M("h2",{},`${this.level.name} 已完成`),M("p.result-track",{},`${this.level.nameEn} · 用时 ${is(this.elapsed)}`),M("div.result-grid",{},Ds("用时",is(this.elapsed)),Ds("光点",`${t} / ${e}`),Ds("最佳用时",is(n.timeMs)),Ds("评级",`${s} 星`)),M("div.result-actions",{},a?M("button.btn.btn-primary",{type:"button",onclick:()=>this.onLevelChange(a.id)},`下一关：${a.name}`):M("a.btn.btn-primary",{href:"#/pulse"},"回到《脉冲走廊》"),M("button.btn",{type:"button",onclick:()=>this.doReset()},"再玩一次"),M("a.btn.btn-ghost",{href:"#/"},"返回展厅")));this.showOverlay(o)}showOverlay(t){ue(this.overlay),this.overlay.appendChild(t),this.overlay.classList.add("is-active");const e=this.overlay.querySelector('button, a[href], [tabindex]:not([tabindex="-1"])');try{e?.focus?.({preventScroll:!0})}catch{e?.focus?.()}}clearOverlay(){ue(this.overlay),this.overlay.classList.remove("is-active"),this.focusGame()}loop(){this.raf=window.requestAnimationFrame(this.loop);const t=performance.now();if(this.complete||(this.elapsed=t-this.startedAt),this.moveAnim){const n=Math.min(1,(t-this.moveAnim.t0)/140),s=1-Math.pow(1-n,3);this.playerGroup.position.lerpVectors(this.moveAnim.from,this.moveAnim.to,s),n>=1&&(this.moveAnim=null)}for(const{el:n,group:s}of this.platformMeshes){const r=this.state.platformCell(n,t),a=this.worldOf(r.x,r.y);s.position.set(a.x,0,a.z),this.riding===n.id&&(this.state.player.x=Math.round(r.x),this.state.player.y=Math.round(r.y),this.playerGroup.position.set(a.x,0,a.z))}const e=Math.sin(t/520)*.05;this.playerInner.position.y=.42+e,this.playerRing.rotation.z+=.004,this.playerLight.position.set(this.playerGroup.position.x,.9,this.playerGroup.position.z),this.playerLight.intensity=1.4+Math.sin(t/300)*.25;for(const n of this.level.elements){const s=this.elementMeshes.get(n.id);if(s){if((n.type==="splitter"||n.type==="dispersion")&&s.userData.core&&(s.userData.core.rotation.y+=.012,s.userData.core.rotation.x+=.006),n.type==="receiver"){const r=this.light?.lit.has(n.id),a=this.light?.mismatch.has(n.id);if(s.userData.halo){const o=r?.34:a?.18:0;s.userData.halo.material.opacity+=(o-s.userData.halo.material.opacity)*.12,s.userData.halo.material.color.set(a&&!r?16739201:Yi[n.color]?.hex||16777215)}if(s.userData.ring){const o=r?1.3+Math.sin(t/260)*.5:.5;s.userData.ring.material.emissiveIntensity=o}if(s.userData.disc){const o=r?.55:.1;s.userData.disc.material.opacity+=(o-s.userData.disc.material.opacity)*.12}}if(n.type==="gate"){const r=this.state.isGateOpen(n),a=r?-.9:.5;s.userData.bars.position.y+=(a-s.userData.bars.position.y)*.1,s.userData.bars.material.opacity=r?.18:.8,s.userData.frame.material.opacity=r?.2:.75}if(n.type==="plate"){const r=this.state.plateUntil[n.id]||0,a=Math.max(0,r-t),o=a>0,l=s.userData.ring;if(o){const c=n.duration||12e3,h=a/c;l.scale.setScalar(.4+h*.85),l.material.opacity=.4+.5*h,l.material.color.set(16761963)}else l.scale.setScalar(1),l.material.opacity=.4,l.material.color.set(16736162)}}}for(const n of this.moteMeshes)n.visible&&(n.rotation.y+=.02,n.position.y=.5+Math.sin(t/620+n.position.x)*.08);if(this.hintRing.visible){const n=1+Math.sin(t/240)*.12;this.hintRing.scale.setScalar(n),this.hintRing.material.opacity=.55+Math.sin(t/240)*.35,t>this.hintUntil&&(this.hintRing.visible=!1)}this.selRing.visible&&(this.selRing.material.opacity=.45+Math.sin(t/320)*.25),this.controls.update(),this.renderer.render(this.scene,this.camera),this.updateHud()}resize(){const t=this.stage.getBoundingClientRect(),e=Math.max(1,Math.round(t.width)),n=Math.max(1,Math.round(t.height));this.renderer.setSize(e,n,!1),this.camera.aspect=e/n,this.camera.updateProjectionMatrix()}destroy(){window.cancelAnimationFrame(this.raf),window.removeEventListener("resize",this.onResize),window.removeEventListener("keydown",this.onKeyDown),this.renderer.domElement.removeEventListener("pointerdown",this.onPointerDown),this.renderer.domElement.removeEventListener("pointerup",this.onPointerUp),this.controls.dispose(),this.scene.traverse(t=>{t.geometry?.dispose?.(),Array.isArray(t.material)?t.material.forEach(e=>e.dispose()):t.material?.dispose?.()}),this.renderer.dispose(),qn({state:"idle",route:"/atrium",chapter:null})}}function Zr(i,t){return M("span.legend-item",{},M("i",{style:{background:i}}),t)}function Ds(i,t){return M("div.result-item",{},M("label",{},i),M("b",{},t))}function x0(){const i=document.createElement("canvas");i.width=64,i.height=64;const t=i.getContext("2d");t.fillStyle="#1a265f",t.fillRect(0,0,64,64);const e=t.createLinearGradient(0,0,0,64);e.addColorStop(0,"rgba(79,227,208,0.16)"),e.addColorStop(.5,"rgba(20,29,78,0)"),e.addColorStop(1,"rgba(157,123,255,0.12)"),t.fillStyle=e,t.fillRect(0,0,64,64),t.strokeStyle="rgba(150,185,255,0.42)",t.lineWidth=2,t.strokeRect(1.5,1.5,61,61);const n=new po(i);return n.colorSpace=He,n.anisotropy=4,n}function y0(){const i=document.createElement("canvas");i.width=64,i.height=64;const t=i.getContext("2d"),e=t.createLinearGradient(0,0,64,64);e.addColorStop(0,"#4fe3d0"),e.addColorStop(.5,"#ffffff"),e.addColorStop(1,"#ff5fa2"),t.fillStyle=e,t.fillRect(0,0,64,64);const n=new po(i);return n.colorSpace=He,n}function M0(){const i=document.createElement("canvas");i.width=64,i.height=64;const t=i.getContext("2d");t.clearRect(0,0,64,64),t.strokeStyle="rgba(255,95,162,0.85)",t.lineWidth=3;for(let n=0;n<=64;n+=16)t.beginPath(),t.moveTo(n,0),t.lineTo(n,64),t.moveTo(0,n),t.lineTo(64,n),t.stroke();const e=new po(i);return e.colorSpace=He,e}const Vl=[{id:"hs-2016",title:"2016 · 头显走出实验室",body:"Oculus Rift 于 2016 年 3 月发货，HTC Vive 于 4 月发货，PlayStation VR 于 10 月上市。三款头显同年进入零售货架，六自由度定位第一次成为普通玩家的日常输入方式。",source:{label:"Oculus 发货公告",url:"https://www.meta.com/blog/oculus-rift-is-shipping/"},extra:[{label:"HTC Vive 发货报道",url:"https://www.engadget.com/2016-04-05/htc-vive-now-shipping.html"},{label:"PSVR 上市报道",url:"https://techcrunch.com/2016/06/13/playstation-vr-is-arriving-october-13th-priced-at-399/"}],pos:[-7.5,2.6,-5],color:"#4FE3D0"},{id:"hs-2020",title:"2020 · 一体机拆掉门槛",body:"Quest 2 采用 inside-out 追踪，取消手柄外接线并大幅降低售价，让 VR 从「需要主机与显卡」变成「一台独立设备」。同年 Half-Life: Alyx 为画质与交互定下长期参照。",source:{label:"Meta Quest 2 公告",url:"https://about.fb.com/news/2020/09/introducing-oculus-quest-2-the-next-generation-of-all-in-one-vr/"},extra:[{label:"Half-Life: Alyx",url:"https://www.valvesoftware.com/en/games/halflifealyx"}],pos:[0,3.4,-9],color:"#FFC46B"},{id:"hs-2023",title:"2023 · 透视改变头显的定位",body:"Quest 3 引入彩色透视相机，把混合现实透视变成一体机的默认能力；PlayStation VR2 则用头显显示与眼动追踪把消费级 VR 的竞争焦点推向视觉品质。",source:{label:"Meta Quest 3 公告",url:"https://about.fb.com/news/2023/09/meet-meta-quest-3-mixed-reality-headset/"},extra:[{label:"PlayStation VR2",url:"https://blog.playstation.com/2022/11/02/playstation-vr2-launches-in-february-at-549-99/"}],pos:[7.8,2.2,-4.5],color:"#FF5FA2"},{id:"hs-2024",title:"2024 · 空间计算设备登场",body:"Apple Vision Pro 于 2024 年 2 月在美国首发，把消费级 XR 的叙事从「游戏设备」扩展到「空间计算平台」，重设了硬件与交互的想象边界。",source:{label:"Apple Newsroom",url:"https://www.apple.com/newsroom/2024/01/apple-vision-pro-available-in-the-us-on-february-2/"},pos:[9.5,1.4,3.5],color:"#9D7BFF"},{id:"hs-webxr",title:"开放标准 · 浏览器里的沉浸式",body:"WebXR 已成为 W3C 推荐的 Web 沉浸式接口规范。它让网页也能承载轻量的 XR 体验 —— 也正是本展项所处的技术语境：本页使用普通 WebGL 渲染，并不属于 WebXR 会话。",source:{label:"W3C WebXR 规范",url:"https://www.w3.org/TR/webxr/"},pos:[-9.2,1.8,4.5],color:"#5AA9FF"},{id:"hs-2011",title:"回望 · 从方块到头显",body:"2011 年 Minecraft 让「玩家自己造世界」成为主流想象；到 2020 年代，沉浸式硬件让身体本身成为输入设备。展馆里这两条线索的交汇点，正是当代独立游戏的实验场。",source:{label:"Minecraft 官网",url:"https://www.minecraft.net/en-us"},pos:[0,5.2,6.5],color:"#F2F0E9"}];function S0(i){Js("halo"),ue(i);const t=M("div.halo-stage.ds-canvas-frame",{"data-game-root":"halo","data-ds-theme":"dark",tabindex:"0","aria-label":"光环台夜景棱镜庭，拖拽环视、WASD 移动、点击热点查看展签"}),e=M("div.halo-overlay"),n=M("div.halo-panel"),s=M("div.halo-wrap",{},M("header.halo-head",{},M("a.back-link",{href:"#/"},"← 返回展厅"),M("div.halo-head-main",{},M("span.exhibit-no",{style:{color:"#2C5C8F"}},"EXHIBIT 03"),M("h1.ds-detail__title",{},"光环台"),M("p.pulse-sub",{},"HALO DECK · 沉浸展项（桌面交互演示）"))),M("div.halo-disclaimer",{role:"note"},M("span.notice-icon",{"aria-hidden":"true"},"◆"),M("p",{},M("b",{},"桌面端交互演示："),"本展项用鼠标拖拽与键盘模拟头部转动，未接入 WebXR，不支持 VR 头显，也没有立体渲染与手柄追踪。它是「沉浸式展陈的交互模型」演示，而不是 VR 应用。")),M("div.halo-body",{},t,e),n);i.appendChild(s);const r=new b0({host:t,overlay:e,panel:n});return Zs(),requestAnimationFrame(()=>r.focusGame()),()=>r.destroy()}class b0{constructor({host:t,overlay:e,panel:n}){this.host=t,this.overlay=e,this.panel=n,this.rootEl=t,this.presses=0,this.yaw=0,this.pitch=.03,this.pos=new C(0,2.4,15),this.velocity=new C,this.keys=new Set,this.activeHotspot=null,this.raf=0,this.clock=new Xg,this.initThree(),this.buildScene(),this.buildPanel(),this.bindInput(),this.loop=this.loop.bind(this),this.raf=window.requestAnimationFrame(this.loop),this.publish()}publish(){const t=this.activeHotspot?.hs?.id??null;qn({state:t?"reading":"exploring",route:"/halo",chapter:t,score:0,player:{x:Math.round(this.pos.x*100)/100,z:Math.round(this.pos.z*100)/100,yaw:Math.round(this.yaw*1e3)/1e3,presses:this.presses},extra:{hotspot:t,hotspots:Vl.length}})}isGameFocused(){const t=this.rootEl;if(!t)return!1;const e=document.activeElement;return e===t||t.contains(e)}focusGame(){try{this.rootEl?.focus({preventScroll:!0})}catch{this.rootEl?.focus()}}initThree(){this.scene=new Dc,this.scene.fog=new uo(660016,.0085),this.camera=new Ie(62,1,.1,400),this.renderer=new Lc({antialias:!0,alpha:!1}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.renderer.setClearColor(329754,1),this.renderer.domElement.classList.add("halo-canvas"),this.host.appendChild(this.renderer.domElement),this.scene.add(new Uc(3823004,329754,.85));const t=new qa(16777215,.7);t.position.set(8,16,6),this.scene.add(t);const e=new $i(10320895,90,60,2);e.position.set(0,6,-8),this.scene.add(e);const n=new $i(5235664,70,55,2);n.position.set(-10,4,4),this.scene.add(n);const s=new $i(16736162,60,50,2);s.position.set(10,3.5,-2),this.scene.add(s),this.onResize=()=>this.resize(),window.addEventListener("resize",this.onResize),this.resize()}buildScene(){const t=new gn(180,32,24),e=new vn({side:Re,depthWrite:!1,uniforms:{top:{value:new Tt(659504)},mid:{value:new Tt(1313082)},bottom:{value:new Tt(329754)}},vertexShader:`
        varying float vH;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vH = normalize(position).y;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,fragmentShader:`
        uniform vec3 top; uniform vec3 mid; uniform vec3 bottom;
        varying float vH;
        void main() {
          float h = clamp(vH * 0.5 + 0.5, 0.0, 1.0);
          vec3 c = h < 0.5 ? mix(bottom, mid, h * 2.0) : mix(mid, top, (h - 0.5) * 2.0);
          gl_FragColor = vec4(c, 1.0);
        }`});this.scene.add(new Mt(t,e));const n=new Mt(new ir(120,64),new Se({color:660016,roughness:.22,metalness:.85,emissive:462632,emissiveIntensity:.9}));n.rotation.x=-Math.PI/2,n.position.y=-1.6,this.scene.add(n);const s=new Yg(160,64,2768762,1450575);s.position.y=-1.58,s.material.transparent=!0,s.material.opacity=.55,this.scene.add(s),this.shards=[];const r=new Pn(1,0);for(let u=0;u<46;u+=1){const f=new Se({color:[5235664,16736162,10320895,16761963][u%4],roughness:.1,metalness:.7,emissive:[1928036,7020354,3810680,7031324][u%4],emissiveIntensity:1.5,transparent:!0,opacity:.95}),m=new Mt(r,f),v=u<26?4+Math.random()*12:16+Math.random()*22,p=u/46*Math.PI*2+Math.random()*.5;m.position.set(Math.cos(p)*v,-.4+Math.random()*8.5,Math.sin(p)*v);const d=.45+Math.random()*1.6;m.scale.setScalar(d),m.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3),this.scene.add(m),this.shards.push({mesh:m,spin:(Math.random()-.5)*.006,bob:Math.random()*Math.PI*2,base:m.position.y})}const a=new ge,o=new Mt(new Pn(2.4,0),new Se({color:9427199,roughness:.05,metalness:.9,emissive:2776988,emissiveIntensity:1.2,transparent:!0,opacity:.92}));o.position.y=5.2;const l=new Mt(new gn(3.4,20,16),new Jt({color:5235664,transparent:!0,opacity:.08,blending:he,depthWrite:!1}));l.position.y=5.2;for(let u=0;u<3;u+=1){const f=new Mt(new nn(3.6+u*1.1,.035,8,60),new Jt({color:[5235664,16736162,10320895][u],transparent:!0,opacity:.5,blending:he,depthWrite:!1}));f.rotation.x=Math.PI/2+(u-1)*.28,f.position.y=5.2,a.add(f)}const c=new Mt(new mn(.9,2.1,5.4,8),new Se({color:1186888,roughness:.4,metalness:.7,emissive:660016,emissiveIntensity:.9}));c.position.y=2.7,a.add(o,l,c),this.scene.add(a),this.monolith=a,this.monolithCore=o;const h=new $i(8380671,120,46,2);h.position.set(0,5.2,0),this.scene.add(h);for(let u=0;u<9;u+=1){const f=u/9*Math.PI*2,m=34+Math.random()*16,g=new Mt(new mn(.5,1.1,26,12,1,!0),new Jt({color:[5235664,16736162,10320895][u%3],transparent:!0,opacity:.09,blending:he,depthWrite:!1,side:je}));g.position.set(Math.cos(f)*m,11,Math.sin(f)*m),this.scene.add(g)}this.hotspotMeshes=[];for(const u of Vl){const f=new ge,m=new Mt(new nn(.44,.035,10,34),new Jt({color:new Tt(u.color),transparent:!0,opacity:.85,blending:he,depthWrite:!1})),g=new Mt(new Pn(.2),new Jt({color:new Tt(u.color)})),v=new Mt(new gn(.62,14,12),new Jt({color:new Tt(u.color),transparent:!0,opacity:.12,blending:he,depthWrite:!1}));f.add(m,g,v),f.position.set(...u.pos),this.scene.add(f),this.hotspotMeshes.push({hs:u,group:f,ring:m,core:g,halo:v})}}buildPanel(){ue(this.panel);const t=M("div.device-status");this.statusEl=t;const e=M("button.btn.btn-sm",{type:"button","data-control":"detect-vr"},"检测本机 WebXR 沉浸式 VR 支持");e.addEventListener("click",async()=>{e.disabled=!0,e.textContent="检测中…";const n=await E0();e.disabled=!1,e.textContent="重新检测本机 WebXR 沉浸式 VR 支持",t.textContent="",t.appendChild(M("p",{class:`device-line ${n.supported?"is-yes":"is-no"}`},M("b",{},"浏览器是否提供 immersive-vr 会话："),n.supported?"提供":n.reason==="no-xr"?"未提供（navigator.xr 不存在）":"不提供")),t.appendChild(M("p",{class:"device-line"},M("b",{},"本展项的设备支持："),"桌面端交互演示（不支持 VR 头显）")),t.appendChild(M("p",{class:"device-note"},"检测结果仅反映浏览器是否暴露 WebXR 能力，与本展项的实现无关：本页用普通 WebGL 渲染，没有创建 immersive-vr 会话，也没有立体渲染与手柄追踪。真正的设备支持需要按 ",M("a",{href:"https://www.w3.org/TR/webxr/",target:"_blank",rel:"noopener noreferrer"},"W3C WebXR 规范")," 实现会话、参考空间与立体呈现。"))}),this.panel.appendChild(M("div.halo-panel-inner",{},M("h2",{},"设备支持状态"),M("ul.device-list",{},M("li",{},M("b",{},"展项类型："),"桌面端交互演示"),M("li",{},M("b",{},"VR 头显支持："),"不支持"),M("li",{},M("b",{},"立体渲染 / 手柄追踪："),"未实现"),M("li",{},M("b",{},"交互方式："),"鼠标拖拽环视 · 滚轮变焦 · WASD 移动")),t,M("div.halo-panel-actions",{},e),M("p.halo-panel-foot",{},"展签内容引自公开的一手与官方来源，点击卡片中的链接可前往原文。")))}bindInput(){this.dragging=!1,this.lastPointer={x:0,y:0},this.onPointerDown=t=>{this.focusGame(),this.dragging=!0,this.lastPointer={x:t.clientX,y:t.clientY},this.renderer.domElement.setPointerCapture?.(t.pointerId),this.renderer.domElement.classList.add("is-grabbing")},this.onPointerMove=t=>{if(!this.dragging)return;const e=t.clientX-this.lastPointer.x,n=t.clientY-this.lastPointer.y;this.lastPointer={x:t.clientX,y:t.clientY},this.yaw-=e*.0042,this.pitch-=n*.0034,this.pitch=Math.max(-1.15,Math.min(1.05,this.pitch))},this.onPointerUp=t=>{this.dragging=!1,this.renderer.domElement.releasePointerCapture?.(t.pointerId),this.renderer.domElement.classList.remove("is-grabbing")},this.onWheel=t=>{t.preventDefault(),this.camera.fov=Math.max(32,Math.min(88,this.camera.fov+Math.sign(t.deltaY)*3)),this.camera.updateProjectionMatrix()},this.onKeyDown=t=>{t.metaKey||t.ctrlKey||t.altKey||this.isGameFocused()&&["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(t.code)&&(t.preventDefault(),this.presses+=1,this.keys.add(t.code),this.publish())},this.onKeyUp=t=>this.keys.delete(t.code),this.renderer.domElement.addEventListener("pointerdown",this.onPointerDown),window.addEventListener("pointermove",this.onPointerMove),window.addEventListener("pointerup",this.onPointerUp),this.renderer.domElement.addEventListener("wheel",this.onWheel,{passive:!1}),window.addEventListener("keydown",this.onKeyDown),window.addEventListener("keyup",this.onKeyUp)}updateMovement(t){const n=new C(-Math.sin(this.yaw),0,-Math.cos(this.yaw)),s=new C(Math.cos(this.yaw),0,-Math.sin(this.yaw)),r=new C;(this.keys.has("KeyW")||this.keys.has("ArrowUp"))&&r.add(n),(this.keys.has("KeyS")||this.keys.has("ArrowDown"))&&r.sub(n),(this.keys.has("KeyD")||this.keys.has("ArrowRight"))&&r.add(s),(this.keys.has("KeyA")||this.keys.has("ArrowLeft"))&&r.sub(s),r.lengthSq()>0&&r.normalize().multiplyScalar(7.5),this.velocity.lerp(r,Math.min(1,t*7)),this.pos.addScaledVector(this.velocity,t),this.pos.y=2.4+Math.sin(this.clock.elapsedTime*1.2)*.07;const a=Math.hypot(this.pos.x,this.pos.z);a>26&&(this.pos.x=this.pos.x/a*26,this.pos.z=this.pos.z/a*26)}updateHotspots(){const t=new C(0,0,-1).applyQuaternion(this.camera.quaternion);let e=null,n=Math.cos(.36);for(const s of this.hotspotMeshes){const r=new C(...s.hs.pos).sub(this.camera.position),a=r.length();r.normalize();const o=r.dot(t);s.ring.rotation.z+=.006,s.core.rotation.y+=.01,s.halo.scale.setScalar(1+Math.sin(this.clock.elapsedTime*1.6+s.hs.pos[0])*.1),s.ring.material.opacity=.35+Math.sin(this.clock.elapsedTime*1.6+s.hs.pos[2])*.2,!(a>46)&&o>n&&(n=o,e=s)}e!==this.activeHotspot&&(this.activeHotspot=e,this.renderHotspotCard(),this.publish()),e&&this.positionCard(e)}positionCard(t){const e=this.overlay.querySelector(".halo-card");if(!e)return;const n=new C(...t.hs.pos).project(this.camera),s=this.host.getBoundingClientRect(),r=(n.x*.5+.5)*s.width,a=(-n.y*.5+.5)*s.height;e.style.left=`${Math.max(12,Math.min(s.width-12,r))}px`,e.style.top=`${Math.max(12,Math.min(s.height-12,a))}px`}renderHotspotCard(){if(ue(this.overlay),!this.activeHotspot)return;const t=this.activeHotspot.hs,e=M("div.halo-card",{},M("span.halo-card-dot",{style:{background:t.color}}),M("h3",{},t.title),M("p",{},t.body),M("div.halo-card-src",{},M("a",{href:t.source.url,target:"_blank",rel:"noopener noreferrer"},`来源：${t.source.label}`),t.extra?M("span",{}," / ",t.extra.map((n,s)=>M("span",{},s>0?" / ":"",M("a",{href:n.url,target:"_blank",rel:"noopener noreferrer"},n.label)))):null));this.overlay.appendChild(e)}loop(){this.raf=window.requestAnimationFrame(this.loop);const t=Math.min(.05,this.clock.getDelta());this.updateMovement(t),this.camera.position.copy(this.pos),this.camera.rotation.set(0,0,0,"YXZ"),this.camera.rotation.y=this.yaw,this.camera.rotation.x=this.pitch,this.monolith&&(this.monolith.rotation.y=this.clock.elapsedTime*.06,this.monolithCore&&(this.monolithCore.rotation.y=-this.clock.elapsedTime*.18,this.monolithCore.position.y=5.2+Math.sin(this.clock.elapsedTime*.8)*.22));for(const e of this.shards)e.mesh.rotation.y+=e.spin,e.mesh.rotation.x+=e.spin*.6,e.mesh.position.y=e.base+Math.sin(this.clock.elapsedTime*.6+e.bob)*.4;this.updateHotspots(),this.renderer.render(this.scene,this.camera)}resize(){const t=this.host.getBoundingClientRect(),e=Math.max(1,Math.round(t.width)),n=Math.max(1,Math.round(t.height));this.renderer.setSize(e,n,!1),this.camera.aspect=e/n,this.camera.updateProjectionMatrix()}destroy(){window.cancelAnimationFrame(this.raf),window.removeEventListener("resize",this.onResize),window.removeEventListener("pointermove",this.onPointerMove),window.removeEventListener("pointerup",this.onPointerUp),window.removeEventListener("keydown",this.onKeyDown),window.removeEventListener("keyup",this.onKeyUp),this.renderer.domElement.removeEventListener("pointerdown",this.onPointerDown),this.renderer.domElement.removeEventListener("wheel",this.onWheel),this.scene.traverse(t=>{t.geometry?.dispose?.(),Array.isArray(t.material)?t.material.forEach(e=>e.dispose()):t.material?.dispose?.()}),this.renderer.dispose(),qn({state:"idle",route:"/halo",chapter:null})}}async function E0(){if(!("xr"in navigator)||!navigator.xr)return{supported:!1,reason:"no-xr"};try{const i=await navigator.xr.isSessionSupported("immersive-vr");return{supported:!!i,reason:i?"ok":"unsupported"}}catch(i){return{supported:!1,reason:"error",error:i}}}const Jr={"/":vh,"/pulse":Dh,"/atrium":_0,"/halo":S0},Qr=document.getElementById("main");let Is=null;function w0(i){if(Is){try{Is()}catch(e){console.error("[app] 卸载上一个视图失败",e)}Is=null}ue(Qr);const t=Jr[i]||Jr["/"];if(!Jr[i]){Jl("/");return}qn({route:i,state:"idle"});try{Is=t(Qr)||null,Zs()}catch(e){console.error("[app] 视图挂载失败",e),Qr.appendChild(Object.assign(document.createElement("div"),{className:"wrap hall-section",textContent:"展项加载失败，请返回展厅重试。"}))}}function Wl(){Ro(Ge()),wi.on("settings:change",i=>Ro(i)),Yl(),mh(),Zl(w0),ch(),window.addEventListener("error",i=>{console.error("[app] 未捕获错误",i.error||i.message)}),window.addEventListener("unhandledrejection",i=>{console.error("[app] 未处理的 Promise 拒绝",i.reason)})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Wl,{once:!0}):Wl();
