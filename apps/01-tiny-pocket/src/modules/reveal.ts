/**
 * Scroll behaviour: section reveal, number count-up, index-rail scroll spy
 * and the reading-progress bar.
 */
import { SAMPLES } from '../content';

/* ------------------------------------------------------------------ *
 * Reveal + count-up
 * ------------------------------------------------------------------ */

function animateCount(el: HTMLElement): void {
  const target = Number(el.dataset.countup ?? '0');
  const decimals = Number(el.dataset.countupDecimals ?? (Number.isInteger(target) ? 0 : 1));
  const duration = 1100;
  const start = performance.now();

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * eased).toFixed(decimals);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target.toFixed(decimals);
  };
  requestAnimationFrame(step);
}

export function initReveal(): void {
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>('[data-reveal], .reveal, [data-countup]'),
  );
  // every second spec row / faq item gets a small stagger
  const specRows = Array.from(document.querySelectorAll<HTMLElement>('.spec-row'));
  specRows.forEach((row, i) => {
    row.classList.add('reveal');
    row.dataset.delay = String(i % 3);
  });
  const faqItems = Array.from(document.querySelectorAll<HTMLElement>('.faq-item'));
  faqItems.forEach((item, i) => {
    item.classList.add('reveal');
    item.dataset.delay = String(i % 3);
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add('is-in');
        if (el.dataset.countup !== undefined) {
          animateCount(el);
          io.unobserve(el);
        } else {
          io.unobserve(el);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  for (const node of nodes) io.observe(node);
}

/* ------------------------------------------------------------------ *
 * Rail scroll spy + progress
 * ------------------------------------------------------------------ */

export function initRail(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-rail-target]'));
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>('[data-section][data-rail-label]'),
  );
  const bar = document.getElementById('rail-progress-bar');
  const hudNum = document.getElementById('hud-num');
  const hudName = document.getElementById('hud-name');

  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (bar) bar.style.height = `${(pct * 100).toFixed(1)}%`;

    // active section = the last one whose top has passed the viewport middle
    const marker = window.innerHeight * 0.38;
    let activeIndex = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= marker) activeIndex = i;
    }
    const active = sections[activeIndex];
    if (!active) return;

    const id = active.dataset.section ?? '';
    for (const link of links) {
      link.classList.toggle('is-active', link.dataset.railTarget === id);
    }
    if (hudNum) hudNum.textContent = String(activeIndex).padStart(2, '0');
    if (hudName) hudName.textContent = active.dataset.railLabel ?? '';
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // smooth in-page navigation that also respects the fixed top bar
  for (const link of links) {
    link.addEventListener('click', (e) => {
      const target = document.getElementById(link.dataset.railTarget ?? '');
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  }
}

/* ------------------------------------------------------------------ *
 * Top bar state
 * ------------------------------------------------------------------ */

export function initTopbar(): void {
  const bar = document.getElementById('topbar');
  if (!bar) return;
  const onScroll = () => {
    bar.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ------------------------------------------------------------------ *
 * Keyboard: left/right moves the sample selection
 * ------------------------------------------------------------------ */

export function initSampleKeyboard(onStep: (delta: number) => void): void {
  document.addEventListener('keydown', (e) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === 'ArrowRight') {
      onStep(1);
    } else if (e.key === 'ArrowLeft') {
      onStep(-1);
    }
  });
  void SAMPLES;
}
