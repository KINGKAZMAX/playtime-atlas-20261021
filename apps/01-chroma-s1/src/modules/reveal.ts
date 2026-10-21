/**
 * Scroll behaviour: section reveal, number count-up, index-rail scroll spy
 * and the reading-progress bar.
 */
import { SAMPLES } from '../content';
import { animateIn } from './motion';

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

  // stagger the spec rows and FAQ entries
  for (const [selector, attr] of [
    ['.spec-row', 'spec'],
    ['.faq-item', 'faq'],
  ] as const) {
    document.querySelectorAll<HTMLElement>(selector).forEach((row, i) => {
      row.classList.add('reveal');
      row.dataset.delay = String(i % 6);
      void attr;
    });
  }

  const revealed = new WeakSet<Element>();

  const reveal = (el: HTMLElement) => {
    if (revealed.has(el)) return;
    revealed.add(el);

    if (el.dataset.countup !== undefined) {
      animateCount(el);
      return;
    }
    const delay = Number(el.dataset.delay ?? 0) * 60;
    animateIn(
      el,
      [
        { opacity: 0, transform: 'translateY(22px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 700, delay },
    );
  };

  // IntersectionObserver is the primary trigger; a scroll/resize pass is kept
  // as a fallback so elements are still revealed when observers do not fire.
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target as HTMLElement);
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
  );
  for (const node of nodes) io.observe(node);

  const sweep = () => {
    for (const node of nodes) {
      if (revealed.has(node)) continue;
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) reveal(node);
    }
  };
  window.addEventListener('scroll', sweep, { passive: true });
  window.addEventListener('resize', sweep);
  sweep();
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

    // active section = the last one whose top has passed the viewport marker
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

  // in-page navigation that accounts for the fixed top bar
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
    if (e.key === 'ArrowRight') onStep(1);
    else if (e.key === 'ArrowLeft') onStep(-1);
  });
  void SAMPLES;
}
