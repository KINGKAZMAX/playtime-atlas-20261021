/**
 * shell.ts — 展厅外壳：导览、展项、年表、展柜、史料台账。
 *
 * 展厅的叙事纪律（对应 TASK.md 诚信红线）：
 * - 所有历史陈述都挂来源角标，角标链接到可访问 URL。
 * - 顶部与展项内常驻「本地单机」声明，不出现任何「多人在线」误导表述。
 * - 展项中的玩法参数一律标注为本厅原创设计，不与史实混排。
 */

import { clear, el } from '../core/dom';
import { audio } from '../core/audio';
import { createDefenseView, type DefenseView } from '../games/defense/view';
import { createHandheldView, type HandheldView } from '../games/handheld/view';
import { SOURCES, TIER_LABEL, sourceChip, sourceChipEl } from '../data/sources';
import { INTRO_PARAGRAPHS, SHOWCASE, TIMELINE } from '../data/timeline';
import { createHeroCanvas } from './heroCanvas';

export interface Shell {
  root: HTMLElement;
  getDefenseView(): DefenseView;
  getHandheldView(): HandheldView;
  destroy(): void;
}

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: 'intro', label: '导览' },
  { id: 'exhibits', label: '可玩展项' },
  { id: 'timeline', label: '年代年表' },
  { id: 'showcase', label: '硬件与服务' },
  { id: 'sources', label: '史料与授权' },
];

function factList(facts: Array<{ text: string; src: string[] }>): HTMLElement {
  const ul = el('ul', { class: 'facts' });
  for (const f of facts) {
    const li = el('li', { class: 'facts__item' });
    li.append(document.createTextNode(f.text));
    for (const s of f.src) {
      const chip = sourceChipEl(s);
      if (chip) li.append(chip);
    }
    ul.append(li);
  }
  return ul;
}

export function createShell(mount: HTMLElement): Shell {
  const heroCanvas = el('canvas', {
    class: 'hero__canvas',
    role: 'img',
    'aria-label': '程序化生成的点阵灯塔与连接节点装饰画面',
  }) as HTMLCanvasElement;

  // ── 头部 ──
  const nav = el('nav', { class: 'shell__nav', 'aria-label': '展厅导航' });
  for (const s of SECTIONS) {
    const a = el('a', { class: 'shell__navlink', href: `#${s.id}`, text: s.label });
    nav.append(a);
  }

  const toggleSources = el('button', {
    class: 'btn btn--ghost btn--sm',
    type: 'button',
    text: '高亮全部来源角标',
    'aria-pressed': 'false',
  }) as HTMLButtonElement;

  const header = el('header', { class: 'shell__head' }, [
    el('div', { class: 'brand' }, [
      el('p', { class: 'brand__eyebrow', text: 'PLAYTIME ATLAS · 年代展厅 · 2000s' }),
      el('h1', { class: 'brand__title', text: '联机曙光' }),
      el('p', { class: 'brand__en', text: 'LINK DAWN' }),
      el('p', { class: 'brand__sub', text: '2000 – 2009 · PC · 掌机 · 联机' }),
    ]),
    el('div', { class: 'hero' }, [heroCanvas]),
    nav,
  ]);

  // ── 诚信横幅 ──
  const notice = el('div', { class: 'notice', role: 'note' }, [
    el('p', { class: 'notice__title', text: '⚑ 本展厅为本地单机体验' }),
    el('p', {
      class: 'notice__body',
      html:
        '页面内<b>没有任何联网对战功能</b>：没有服务器、没有真人匹配、没有账号登录。' +
        '展项 A 中名为「灰烬协议」的对手是<b>由本机程序控制的 AI</b>，面板上有常驻标识；' +
        '展项 B 全部内容在浏览器内离线运行。' +
        '本展厅所说的「联机」，指的是<b>该年代的历史主题</b>，而非本产品的运行方式。',
    }),
  ]);

  // ── 导览 ──
  const introGrid = el('div', { class: 'intro__grid' });
  for (const p of INTRO_PARAGRAPHS) {
    const card = el('article', { class: 'intro__card' }, [
      el('h3', { class: 'intro__kicker', text: p.kicker }),
      el('p', { class: 'intro__text', html: p.html }),
    ]);
    introGrid.append(card);
  }
  const introSection = el('section', { class: 'section', id: 'intro' }, [
    el('h2', { class: 'section__title', text: '展厅导览' }),
    el('p', { class: 'section__lead', text: '这一段十年的关键词不是"更真实的画面"，而是"连接"——主机接上网络，掌机装下触摸屏，玩家开始同时是玩家和内容生产者。' }),
    introGrid,
  ]);

  // ── 展项 ──
  const defenseView: DefenseView = createDefenseView();
  const handheldView: HandheldView = createHandheldView();

  const tabDefense = el('button', {
    class: 'tab is-active',
    type: 'button',
    role: 'tab',
    'aria-selected': 'true',
    'data-tab': 'defense',
    text: '展项 A · 灯塔协议 BEACON PROTOCOL',
  }) as HTMLButtonElement;
  const tabHandheld = el('button', {
    class: 'tab',
    type: 'button',
    role: 'tab',
    'aria-selected': 'false',
    'data-tab': 'handheld',
    text: '展项 B · 口袋回声 POCKET ECHO',
  }) as HTMLButtonElement;

  const panelDefense = el('div', { class: 'tabpanel is-active', role: 'tabpanel', 'data-panel': 'defense' }, [
    el('div', { class: 'exhibit__head' }, [
      el('div', {}, [
        el('h3', { class: 'exhibit__title', text: '灯塔协议 / BEACON PROTOCOL' }),
        el('p', {
          class: 'exhibit__desc',
          text: '微型策略防守。两条航道、一座灯塔、四种可升级设施；对面是本机 AI「灰烬协议」。',
        }),
      ]),
      el('span', { class: 'chip chip--local', text: '本地单机 · AI 对手' }),
    ]),
    el('div', { class: 'exhibit__body' }, [defenseView.root]),
    el('p', {
      class: 'exhibit__foot',
      text: '说明：本作的规则、塔种数值、敌人构成与「灰烬协议」的行为全部为本展厅原创设计，不是任何商业作品的数据或机制复刻。',
    }),
  ]);

  const panelHandheld = el('div', { class: 'tabpanel', role: 'tabpanel', 'data-panel': 'handheld', hidden: true }, [
    el('div', { class: 'exhibit__head' }, [
      el('div', {}, [
        el('h3', { class: 'exhibit__title', text: '口袋回声 / POCKET ECHO' }),
        el('p', {
          class: 'exhibit__desc',
          text: '掌机风冒险区域。双屏结构、点阵取景、三枚回声碎片与一位会在对话里讲史料的记录员。',
        }),
      ]),
      el('span', { class: 'chip chip--local', text: '本地单机 · 离线运行' }),
    ]),
    el('div', { class: 'exhibit__body' }, [handheldView.root]),
    el('p', {
      class: 'exhibit__foot',
      text: '说明：掌机外壳造型、地图、角色、碎片与机关全部为本展厅原创设计；对话中引用的历史陈述附有来源角标，可点开核对。',
    }),
  ]);

  const tabs = el('div', { class: 'tabs', role: 'tablist', 'aria-label': '可玩展项切换' }, [tabDefense, tabHandheld]);
  const exhibitsSection = el('section', { class: 'section', id: 'exhibits' }, [
    el('h2', { class: 'section__title', text: '可玩展项' }),
    el('p', {
      class: 'section__lead',
      text: '两件完全原创的可玩作品。都支持鼠标、触屏与键盘三条操作路径，进度保存在本机。',
    }),
    tabs,
    panelDefense,
    panelHandheld,
  ]);

  const activate = (which: 'defense' | 'handheld'): void => {
    const isDef = which === 'defense';
    tabDefense.classList.toggle('is-active', isDef);
    tabHandheld.classList.toggle('is-active', !isDef);
    tabDefense.setAttribute('aria-selected', String(isDef));
    tabHandheld.setAttribute('aria-selected', String(!isDef));
    panelDefense.classList.toggle('is-active', isDef);
    panelHandheld.classList.toggle('is-active', !isDef);
    panelDefense.hidden = !isDef;
    panelHandheld.hidden = isDef;
    defenseView.setActive(isDef);
    handheldView.setActive(!isDef);
    audio.play('tick');
  };
  tabDefense.addEventListener('click', () => activate('defense'));
  tabHandheld.addEventListener('click', () => activate('handheld'));

  // ── 年表 ──
  const timelineList = el('ol', { class: 'timeline' });
  for (const y of TIMELINE) {
    const item = el('li', { class: 'timeline__year' }, [
      el('div', { class: 'timeline__head' }, [
        el('span', { class: 'timeline__num', text: String(y.year) }),
        el('p', { class: 'timeline__headline', text: y.headline }),
      ]),
      el('div', { class: 'timeline__cols' }, [
        el('div', { class: 'timeline__col' }, [el('h4', { class: 'timeline__coltitle', text: '主机' }), factList(y.hardware)]),
        el('div', { class: 'timeline__col' }, [el('h4', { class: 'timeline__coltitle', text: '掌机' }), factList(y.handheld)]),
        el('div', { class: 'timeline__col' }, [el('h4', { class: 'timeline__coltitle', text: '联机服务' }), factList(y.online)]),
        el('div', { class: 'timeline__col' }, [el('h4', { class: 'timeline__coltitle', text: '作品' }), factList(y.works)]),
      ]),
    ]);
    timelineList.append(item);
  }
  const timelineSection = el('section', { class: 'section', id: 'timeline' }, [
    el('h2', { class: 'section__title', text: '年代年表 2000 – 2009' }),
    el('p', {
      class: 'section__lead',
      html: '<b>代表性选样，非编年全集。</b>每一格只做事实陈述，并附可点击的来源角标；角标指向厂商官网或维基百科条目。',
    }),
    timelineList,
  ]);

  // ── 展柜 ──
  const cards = el('div', { class: 'cards' });
  for (const c of SHOWCASE) {
    const card = el('article', { class: 'card', 'data-kind': c.kind }, [
      el('div', { class: 'card__top' }, [
        el('span', { class: 'card__kind', text: c.kind }),
        el('span', { class: 'card__year', text: c.year }),
      ]),
      el('h3', { class: 'card__name', text: c.name }),
      el('p', { class: 'card__en', text: c.en }),
      el('p', { class: 'card__spec', text: c.spec }),
      el('p', { class: 'card__sig', text: c.significance }),
    ]);
    const srcRow = el('p', { class: 'card__src' });
    for (const s of c.src) {
      const chip = sourceChipEl(s);
      if (chip) srcRow.append(chip);
    }
    card.append(srcRow);
    cards.append(card);
  }
  const showcaseSection = el('section', { class: 'section', id: 'showcase' }, [
    el('h2', { class: 'section__title', text: '硬件与服务展柜' }),
    el('p', {
      class: 'section__lead',
      text: '展柜只使用文字与程序化图形，不使用任何厂商 Logo、官方截图或受版权保护的配图。',
    }),
    cards,
  ]);

  // ── 史料台账 ──
  const srcList = el('ul', { class: 'srclist' });
  for (const s of SOURCES) {
    const li = el('li', { class: 'srclist__item' }, [
      el('span', { class: `srclist__tier srclist__tier--${s.tier}`, text: TIER_LABEL[s.tier] }),
      el('a', { class: 'srclist__link', href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.title }),
      el('span', { class: 'srclist__topic', text: s.topic }),
      el('span', { class: 'srclist__date', text: `核对于 ${s.checked}` }),
    ]);
    srcList.append(li);
  }

  const sourceStats = el('p', { class: 'section__lead' });
  const officialCount = SOURCES.filter((s) => s.tier === 'official').length;
  sourceStats.innerHTML =
    `共 <b>${SOURCES.length}</b> 条来源，其中一手官方来源 <b>${officialCount}</b> 条、次级百科来源 <b>${SOURCES.length - officialCount}</b> 条。` +
    `全部 URL 已于 2026-10-21 抽样验证可达。<b>引用 ≠ 授权</b>：本展厅不复用这些站点的图片、字体、商标或任何受版权保护的素材。`;

  const sourcesSection = el('section', { class: 'section', id: 'sources' }, [
    el('h2', { class: 'section__title', text: '史料与授权' }),
    sourceStats,
    el('div', { class: 'legend' }, [
      el('span', { class: 'legend__item' }, [el('i', { class: 'srcdemo', html: sourceChip('nin-hist') }), el('span', { text: '一手 · 官方来源角标' })]),
      el('span', { class: 'legend__item' }, [el('i', { class: 'srcdemo', html: sourceChip('wp-gba') }), el('span', { text: '次级 · 百科来源角标' })]),
    ]),
    srcList,
    el('div', { class: 'notice notice--soft' }, [
      el('p', {
        class: 'notice__body',
        html:
          '<b>关于文案中的「多人在线」：</b>' +
          '年表与展柜中出现的「大规模多人在线」「多人在线战斗竞技」等表述，' +
          '是<b>对 2000 年代具体作品与类型的历史描述</b>（例如《World of Warcraft》《League of Legends》所属的类型），' +
          '每一条都附有来源角标。<b>它们描述的是史料，不是本展厅的运行方式</b>；' +
          '本展厅自身没有任何联机对战功能。',
      }),
    ]),
    el('div', { class: 'notice notice--soft' }, [
      el('p', {
        class: 'notice__body',
        html:
          '<b>本展厅的制作与授权声明：</b>' +
          '展厅中的两件展项（<b>《灯塔协议》</b>、<b>《口袋回声》</b>）的<b>名称、世界观、角色、地图、规则、数值、美术、点阵字体与音效均为本展厅原创</b>，' +
          '由程序化绘制与合成生成，不包含任何 ROM、商业游戏素材、品牌 Logo、商标字体或第三方美术资源。' +
          '展项参考的是<b>公开可考的机制类型</b>（格子建造与升级循环、掌机双屏与点阵取景、在线服务的账号化形态），' +
          '不复制任何具体作品，也<b>不声称原创任何参考作品</b>。' +
          '史料部分只做事实陈述并附来源链接，未使用受版权保护的配图。' +
          '本页所有交互均为<b>本地单机</b>，不连接任何服务器。',
      }),
    ]),
  ]);

  // ── 页脚 ──
  const footer = el('footer', { class: 'shell__foot' }, [
    el('p', { text: '联机曙光 LINK DAWN · 2000s 可玩展厅 · 任务 11-era-online' }),
    el('p', { class: 'shell__footnote', text: '静态子站，无运行时依赖，无在线接口；可嵌入 GitHub Pages 任意子路径。' }),
  ]);

  // ── 组装 ──
  const root = el('div', { class: 'shell' }, [
    header,
    notice,
    el('main', { class: 'shell__main' }, [introSection, exhibitsSection, timelineSection, showcaseSection, sourcesSection]),
    footer,
  ]);
  clear(mount);
  mount.append(root);

  const stopHero = createHeroCanvas(heroCanvas);

  // 来源角标高亮
  toggleSources.addEventListener('click', () => {
    const on = root.classList.toggle('show-sources');
    toggleSources.setAttribute('aria-pressed', String(on));
    toggleSources.textContent = on ? '关闭来源高亮' : '高亮全部来源角标';
  });

  // 初始状态
  defenseView.setActive(true);
  handheldView.setActive(false);

  // 平滑滚动
  for (const a of Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))) {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return {
    root,
    getDefenseView: () => defenseView,
    getHandheldView: () => handheldView,
    destroy(): void {
      stopHero();
      defenseView.destroy();
      handheldView.destroy();
    },
  };
}
