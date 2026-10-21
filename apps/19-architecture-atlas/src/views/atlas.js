/**
 * Region atlas — a schematic map of China with case markers.
 *
 * The outline is a low-fidelity trace (see data/taxonomy.js) and is labelled
 * as schematic in the legend. Markers sit at each building's approximate
 * published longitude and latitude, so relative positions are meaningful even
 * though the outline is not a survey boundary.
 */

import { el, svgEl, clear } from '../core/dom.js';
import { t, localName, otherName } from '../core/i18n.js';
import { CASES } from '../data/catalog.js';
import { REGIONS, CHINA_OUTLINE, HAINAN_OUTLINE, TAIWAN_OUTLINE, MAP_SIZE, project } from '../data/taxonomy.js';
import { countForRegion, filteredCases, setRegion, getFilters } from '../core/filters.js';

const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${project(p[0], p[1]).map((v) => v.toFixed(1)).join(' ')}`).join(' ') + ' Z';

export function renderAtlas(host, { onOpenCase }) {
  const wrap = el('div.atlas-grid');

  // ---------------- map ----------------
  const frame = el('div.map-frame');
  const svg = svgEl('svg', { viewBox: `0 0 ${MAP_SIZE.w} ${MAP_SIZE.h}`, role: 'img', 'aria-label': t('atlas.legend.hot') });

  svg.append(svgEl('path', { d: path(CHINA_OUTLINE), class: 'region-shape', 'data-region': 'all' }));
  svg.append(svgEl('path', { d: path(HAINAN_OUTLINE), class: 'region-shape', 'data-region': 'south' }));
  svg.append(svgEl('path', { d: path(TAIWAN_OUTLINE), class: 'region-shape', 'data-region': 'east' }));

  const markerGroup = svgEl('g', { class: 'markers' });
  svg.append(markerGroup);

  frame.append(svg);

  const legend = el('div.map-legend', {}, [
    el('span', { html: `<b>${t('atlas.legend')}</b>` }),
    el('span', { text: t('atlas.legend.hot') }),
    el('span', { text: t('atlas.legend.map') }),
  ]);
  frame.append(legend);

  // ---------------- region list ----------------
  const list = el('ul.region-list', { role: 'list' });

  function paint() {
    const filters = getFilters();
    const visible = new Set(filteredCases(filters).map((c) => c.id));

    clear(markerGroup);
    for (const item of CASES) {
      const [x, y] = project(item.lon, item.lat);
      const g = svgEl('g', {
        class: `hotspot${filters.region === item.region ? ' is-active' : ''}`,
        'data-region': item.region,
        tabindex: '0',
        role: 'button',
        'aria-label': t('atlas.hotspot', { name: localName(item), count: countForRegion(item.region) }),
      });
      g.append(svgEl('circle', { cx: x, cy: y, r: visible.has(item.id) ? 5.4 : 3.4 }));
      g.append(svgEl('title', { text: `${item.nameZh} · ${item.nameEn}` }));
      const activate = () => {
        setRegion(item.region);
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      g.addEventListener('click', activate);
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
      markerGroup.append(g);
    }

    for (const shape of svg.querySelectorAll('.region-shape')) {
      shape.classList.toggle('is-active', filters.region === shape.getAttribute('data-region'));
    }

    clear(list);
    const all = el('li');
    const allBtn = el('button', {
      type: 'button',
      'aria-pressed': String(!filters.region),
      on: { click: () => setRegion(null) },
    }, [
      el('span.r-name', { text: t('atlas.allRegions') }),
      el('span.r-en', { text: 'ALL' }),
      el('span.r-count', { text: String(filteredCases({ ...filters, region: null }).length) }),
    ]);
    all.append(allBtn);
    list.append(all);

    for (const r of REGIONS) {
      const li = el('li');
      li.append(el('button', {
        type: 'button',
        'aria-pressed': String(filters.region === r.id),
        on: { click: () => setRegion(r.id) },
      }, [
        el('span.r-name', { text: localName(r) }),
        el('span.r-en', { text: otherName(r).toUpperCase() }),
        el('span.r-count', { text: String(countForRegion(r.id)) }),
      ]));
      list.append(li);
    }
  }

  wrap.append(frame, list);
  host.append(wrap);
  paint();

  return { paint, onOpenCase };
}
