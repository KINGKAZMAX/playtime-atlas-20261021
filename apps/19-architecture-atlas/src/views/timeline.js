/**
 * Era timeline — a horizontally scrollable axis of periods.
 * Selecting an era filters the map and the catalog.
 */

import { el, clear } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { ERAS } from '../data/taxonomy.js';
import { countForEra, setEra, getFilters } from '../core/filters.js';

export function renderTimeline(host) {
  const wrap = el('div.timeline-wrap');
  const scroller = el('div.timeline-scroll', { tabindex: '0', role: 'group', 'aria-label': t('timeline.title') });
  const track = el('div.timeline');
  const marks = el('div.timeline-marks', { 'aria-hidden': 'true' });

  function paint() {
    const filters = getFilters();
    clear(track);
    for (const era of ERAS) {
      const count = countForEra(era.id);
      const col = el('button.era-col', {
        type: 'button',
        'aria-pressed': String(filters.era === era.id),
        'aria-label': `${era.nameZh} · ${era.nameEn} · ${t('timeline.entries', { n: count })}`,
        on: { click: () => setEra(era.id) },
      }, [
        el('span.era-label', { text: era.nameZh }),
        el('span.era-range', { text: era.range }),
        el('span.era-name', { text: era.nameEn }),
        el('span.era-count', { text: count ? t('timeline.entries', { n: count }) : '—' }),
      ]);
      track.append(col);
    }
    clear(marks);
    for (let i = 0; i < 26; i += 1) {
      marks.append(el('i', { style: { left: `${(i / 25) * 100}%` } }));
    }
  }

  scroller.append(track);
  wrap.append(scroller, marks);
  host.append(wrap);
  paint();
  return { paint };
}
