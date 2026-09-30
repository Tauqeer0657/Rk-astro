/** Aurora motion engine — one observer for reveals + stagger, one rAF-throttled
 *  scroll handler. Re-runs on Astro view transitions. ~1.5 KB minified. */

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function reveals() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal], [data-stagger]');
  if (reduce()) { els.forEach((e) => e.classList.add('is-in')); return; }

  /* The entrance is a keyframe animation with fill-mode: both, so its end
     state (`transform: none`) keeps winning over any :hover transform on
     the same element. Drop the animation once it has played — this is what
     the live site's `.reveal.is-done` rule does. */
  const settle = (el: Element) => el.classList.add('is-done');

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.add('is-in');
        io.unobserve(el);

        // a [data-stagger] animates its children, not itself
        const animated: Element[] = el.hasAttribute('data-stagger')
          ? [...el.children]
          : [el];
        for (const a of animated) {
          a.addEventListener('animationend', () => settle(a), { once: true });
        }
        // belt and braces: if animationend never fires (element hidden,
        // tab backgrounded), settle anyway once the longest run is over
        setTimeout(() => animated.forEach(settle), 1300 + 180 * 7 + 200);
      }
    },
    /* threshold MUST stay 0.
       A percentage threshold is a fraction of the *element*, so anything
       taller than viewport/threshold can never reach it and would never
       animate in. /blog's card grid is 6260px on a phone: at the old 0.12
       only 10.6% of it could ever be on screen, so all 11 cards stayed at
       opacity 0 forever. The trigger point is tuned with rootMargin, which
       is relative to the viewport and therefore height-independent. */
    { rootMargin: '0px 0px -12% 0px', threshold: 0 }
  );

  for (const el of els) {
    /* A [data-stagger] taller than the screen can't animate as one unit —
       its lower cards would play off-screen and be over before you reached
       them. Observe the cards individually so each arrives as you scroll. */
    if (el.hasAttribute('data-stagger') && el.getBoundingClientRect().height > innerHeight) {
      for (const child of el.children) io.observe(child);
    } else {
      io.observe(el);
    }
  }
}

function counters() {
  const wraps = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!wraps.length) return;

  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || '';
    if (reduce()) { el.textContent = target + suffix; return; }
    const dur = 1500;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { run(e.target as HTMLElement); io.unobserve(e.target); }
  }, { threshold: 0.4 });
  wraps.forEach((w) => io.observe(w));
}

function header() {
  const h = document.querySelector<HTMLElement>('[data-header]');
  const bar = document.querySelector<HTMLElement>('.readbar');
  if (!h && !bar) return;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      h?.classList.toggle('is-stuck', y > 40);
      if (bar) {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.setProperty('--p', String(max > 0 ? Math.min(1, y / max) : 0));
      }
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function drawer() {
  const open = document.querySelector<HTMLElement>('[data-drawer-open]');
  const close = document.querySelector('[data-drawer-close]');
  const panel = document.querySelector<HTMLElement>('[data-drawer]');
  const scrim = document.querySelector<HTMLElement>('[data-drawer-overlay]');
  if (!panel) return;

  const set = (on: boolean) => {
    panel.classList.toggle('is-open', on);
    scrim?.classList.toggle('is-open', on);
    panel.toggleAttribute('inert', !on);   // also blocks tabbing into a closed panel
    document.body.style.overflow = on ? 'hidden' : '';
    open?.setAttribute('aria-expanded', String(on));
    // send focus somewhere useful, and give it back when the panel closes
    if (on) (panel.querySelector<HTMLElement>('[data-drawer-close], a'))?.focus();
    else open?.focus();
  };

  open?.addEventListener('click', () => set(true));
  close?.addEventListener('click', () => set(false));
  scrim?.addEventListener('click', () => set(false));
  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) set(false);
  });
  panel.toggleAttribute('inert', !panel.classList.contains('is-open'));
}

function year() {
  document.querySelectorAll('[data-year]').forEach((e) => (e.textContent = String(new Date().getFullYear())));
}

export function init() { reveals(); counters(); header(); drawer(); year(); }

init();
document.addEventListener('astro:after-swap', init);
