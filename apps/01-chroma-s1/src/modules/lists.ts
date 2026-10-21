/**
 * Static list rendering: spec matrix, FAQ accordion, metric strip.
 */
import { FAQ, SPECS, STRIP_ITEMS, type SpecRow } from '../content';

/* ------------------------------------------------------------------ *
 * Metric strip
 * ------------------------------------------------------------------ */

export function renderStrip(track: HTMLElement): void {
  const make = () => {
    const frag = document.createDocumentFragment();
    for (const item of STRIP_ITEMS) {
      const span = document.createElement('span');
      span.className = 'strip__item';
      const label = document.createElement('span');
      label.textContent = item.label;
      const value = document.createElement(item.accent ? 'i' : 'b');
      value.textContent = item.value;
      span.append(label, value);
      frag.appendChild(span);
    }
    return frag;
  };
  // duplicated once so the marquee can loop seamlessly at -50%
  track.append(make(), make());
}

/* ------------------------------------------------------------------ *
 * Spec matrix
 * ------------------------------------------------------------------ */

export function renderSpecs(container: HTMLElement): void {
  SPECS.forEach((spec: SpecRow, index) => {
    const row = document.createElement('div');
    row.className = 'spec-row';
    row.dataset.reveal = '';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'spec-row__btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.id = `spec-btn-${index}`;

    const idx = document.createElement('span');
    idx.className = 'spec-row__idx';
    idx.textContent = String(index + 1).padStart(2, '0');

    const key = document.createElement('span');
    key.className = 'spec-row__key';
    key.textContent = spec.key;

    const val = document.createElement('span');
    val.className = 'spec-row__val';
    val.textContent = spec.value;

    const caret = document.createElement('span');
    caret.className = 'spec-row__caret';
    caret.setAttribute('aria-hidden', 'true');

    btn.append(idx, key, val, caret);

    const detail = document.createElement('div');
    detail.className = 'spec-row__detail';
    detail.id = `spec-detail-${index}`;
    detail.setAttribute('role', 'region');
    detail.setAttribute('aria-labelledby', btn.id);
    const inner = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = spec.detail;
    inner.appendChild(p);
    detail.appendChild(inner);

    btn.setAttribute('aria-controls', detail.id);
    btn.addEventListener('click', () => {
      const open = row.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });

    row.append(btn, detail);
    container.appendChild(row);
  });
}

/* ------------------------------------------------------------------ *
 * FAQ
 * ------------------------------------------------------------------ */

export function renderFaq(container: HTMLElement): void {
  FAQ.forEach((item, index) => {
    const wrap = document.createElement('div');
    wrap.className = 'faq-item';
    wrap.dataset.reveal = '';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'faq-item__btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.id = `faq-btn-${index}`;

    const q = document.createElement('span');
    q.className = 'faq-item__q';
    q.textContent = item.q;

    const icon = document.createElement('span');
    icon.className = 'faq-item__icon';
    icon.setAttribute('aria-hidden', 'true');

    btn.append(q, icon);

    const body = document.createElement('div');
    body.className = 'faq-item__body';
    body.id = `faq-body-${index}`;
    body.setAttribute('role', 'region');
    body.setAttribute('aria-labelledby', btn.id);
    const inner = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = item.a;
    inner.appendChild(p);
    body.appendChild(inner);

    btn.setAttribute('aria-controls', body.id);
    btn.addEventListener('click', () => {
      const open = wrap.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });

    wrap.append(btn, body);
    container.appendChild(wrap);
  });
}
