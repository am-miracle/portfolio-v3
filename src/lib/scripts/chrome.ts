// persistent UI that survives client-side navigation: preloader, curtain, cursor, menu, clocks, nav indicator. */
import { gsap, finePointer, getLenis, reducedMotion } from './motion';

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [
  ...root.querySelectorAll<T>(sel),
];

export function runPreloader(): Promise<void> {
  const el = $('[data-preloader]');
  const returning = document.documentElement.classList.contains('is-returning');
  if (!el || returning || getComputedStyle(el).display === 'none') {
    el?.remove();
    return Promise.resolve();
  }
  sessionStorage.setItem('mj:loaded', '1');

  if (reducedMotion) {
    el.remove();
    return Promise.resolve();
  }

  const count = $('[data-pl-count]', el)!;
  const bar = $('[data-pl-bar]', el)!;
  const chars = $$('[data-pl-char]', el);
  const slabs = $$('[data-pl-slab]', el);
  const progress = { v: 0 };
  getLenis()?.stop();

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        el.remove();
        getLenis()?.start();
      },
    });
    tl.from(chars, { yPercent: 110, stagger: 0.05, duration: 0.9 })
      .to(
        progress,
        {
          v: 100,
          duration: 1.8,
          ease: 'snap',
          onUpdate: () => {
            count.textContent = String(Math.round(progress.v)).padStart(3, '0');
            bar.style.transform = `scaleX(${progress.v / 100})`;
          },
        },
        0.1,
      )
      // wait for fonts so the hero doesn't reflow under the reveal
      .add(() => {
        tl.pause();
        document.fonts.ready.then(() => tl.resume());
      })
      .to(chars, { yPercent: -110, stagger: 0.03, duration: 0.6, ease: 'expo.in' })
      .to(slabs, { scaleY: 1, stagger: 0.06, duration: 0.6, ease: 'expo.inOut' }, '<0.2')
      .add(() => {
        el.style.background = 'transparent';
        $$(':scope > :not(:last-child)', el).forEach((c) => c.remove());
        resolve();
      })
      .to(slabs, { yPercent: -100, stagger: 0.06, duration: 0.8, ease: 'expo.inOut' });
  });
}


const labels: Record<string, string> = { '/': 'Home', '/about': 'About', '/projects': 'Projects', '/blog': 'Blog' };

function labelFor(url: URL) {
  const path = url.pathname.replace(/\/$/, '') || '/';
  if (labels[path]) return labels[path];
  if (path.startsWith('/blog/')) return 'Reading';
  return 'Lost?';
}

export function curtainIn(url: URL): Promise<void> {
  const root = $('[data-curtain]');
  if (!root || reducedMotion) return Promise.resolve();
  const slabs = $$('[data-curtain-slab]', root).filter((s) => s.offsetParent !== null);
  const label = $('[data-curtain-label]', root)!;
  label.textContent = labelFor(url);
  root.style.pointerEvents = 'auto';
  gsap.killTweensOf([slabs, label]);
  return new Promise((resolve) => {
    gsap
      .timeline({ onComplete: resolve })
      .set(slabs, { transformOrigin: 'top', scaleY: 0 })
      .to(slabs, { scaleY: 1, duration: 0.55, stagger: { each: 0.05, from: 'random' }, ease: 'expo.inOut' })
      .fromTo(label, { y: 0, yPercent: 110, rotate: 4, autoAlpha: 1 }, { yPercent: 0, rotate: -2, duration: 0.5 }, '-=0.2');
  });
}

export function curtainOut(): Promise<void> {
  const root = $('[data-curtain]');
  if (!root || reducedMotion) return Promise.resolve();
  const slabs = $$('[data-curtain-slab]', root);
  const label = $('[data-curtain-label]', root)!;
  return new Promise((resolve) => {
    gsap
      .timeline({
        onComplete: () => {
          root.style.pointerEvents = 'none';
          resolve();
        },
      })
      .to(label, { yPercent: -110, rotate: 0, duration: 0.45, ease: 'expo.in' })
      .set(label, { autoAlpha: 0 })
      .set(slabs, { transformOrigin: 'bottom' })
      .to(slabs, { scaleY: 0, duration: 0.6, stagger: { each: 0.05, from: 'random' }, ease: 'expo.inOut' }, '-=0.1');
  });
}

export function initCursor() {
  const root = $('[data-cursor-root]');
  if (!root || !finePointer || reducedMotion || root.dataset.ready) return;
  root.dataset.ready = '1';
  root.classList.remove('hidden');
  gsap.set(root, { autoAlpha: 0 });

  const dot = $('[data-cursor-dot]', root)!;
  const ring = $('[data-cursor-ring]', root)!;
  const label = $('[data-cursor-label]', root)!;
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'none' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'none' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'expo.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'expo.out' });

  let active: Element | null = null;

  // only take over from the native cursor once a mouse actually moves
  window.addEventListener(
    'pointermove',
    () => {
      document.documentElement.classList.add('has-cursor');
      gsap.to(root, { autoAlpha: 1, duration: 0.3 });
    },
    { once: true },
  );

  window.addEventListener(
    'pointermove',
    (e) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    },
    { passive: true },
  );

  document.addEventListener('pointerover', (e) => {
    const target = (e.target as Element).closest('a, button, [data-cursor], input, textarea, label');
    if (target === active) return;
    active = target;
    if (!target) {
      gsap.to(ring, { width: 40, height: 40, backgroundColor: 'transparent', rotate: 0, duration: 0.5 });
      gsap.to(label, { scale: 0, duration: 0.3 });
      gsap.to(dot, { scale: 1, duration: 0.3 });
      return;
    }
    const text = (target as HTMLElement).dataset.cursor;
    const isField = target.matches('input, textarea');
    if (isField) {
      gsap.to(ring, { width: 6, height: 34, backgroundColor: '#d7ff3e', rotate: 0, duration: 0.4 });
      gsap.to(dot, { scale: 0, duration: 0.2 });
      return;
    }
    if (text) {
      label.textContent = text;
      gsap.to(ring, { width: 92, height: 92, backgroundColor: '#d7ff3e', rotate: -8, duration: 0.6 });
      gsap.to(label, { scale: 1, duration: 0.4, delay: 0.05 });
    } else {
      gsap.to(ring, { width: 64, height: 64, backgroundColor: 'transparent', rotate: 45, duration: 0.5 });
      gsap.to(label, { scale: 0, duration: 0.2 });
    }
    gsap.to(dot, { scale: 0, duration: 0.2 });
  });

  document.addEventListener('pointerdown', () => gsap.to(ring, { scale: 0.8, duration: 0.2 }));
  document.addEventListener('pointerup', () => gsap.to(ring, { scale: 1, duration: 0.4 }));
  document.documentElement.addEventListener('pointerleave', () => gsap.to(root, { autoAlpha: 0, duration: 0.3 }));
  document.documentElement.addEventListener('pointerenter', () => gsap.to(root, { autoAlpha: 1, duration: 0.3 }));
}

// call after a swap so the cursor doesn't stay stuck in a hover state. */
export function resetCursor() {
  const ring = $('[data-cursor-ring]');
  const label = $('[data-cursor-label]');
  const dot = $('[data-cursor-dot]');
  if (!ring) return;
  gsap.to(ring, { width: 40, height: 40, backgroundColor: 'transparent', rotate: 0, duration: 0.4 });
  gsap.to([label, dot], { scale: (i) => (i === 0 ? 0 : 1), duration: 0.3 });
}

let menuOpen = false;
let lastFocus: HTMLElement | null = null;

export function initMenu() {
  const menu = $('[data-menu]');
  if (!menu || menu.dataset.ready) return;
  menu.dataset.ready = '1';
  const items = $$('[data-menu-item]', menu);

  const setExpanded = (v: boolean) =>
    $$('[data-menu-open]').forEach((b) => b.setAttribute('aria-expanded', String(v)));

  const open = () => {
    if (menuOpen) return;
    menuOpen = true;
    lastFocus = document.activeElement as HTMLElement;
    setExpanded(true);
    getLenis()?.stop();
    gsap.set(menu, { visibility: 'visible' });
    gsap
      .timeline()
      .fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' })
      .fromTo(items, { yPercent: 120, rotate: 3 }, { yPercent: 0, rotate: 0, stagger: 0.06, duration: 0.9 }, '-=0.35');
    $('[data-menu-close]', menu)?.focus();
  };

  const close = (instant = false) => {
    if (!menuOpen) return;
    menuOpen = false;
    setExpanded(false);
    getLenis()?.start();
    const done = () => gsap.set(menu, { visibility: 'hidden' });
    if (instant) {
      gsap.set(menu, { clipPath: 'inset(0% 0% 100% 0%)' });
      done();
    } else {
      gsap.to(menu, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.7, ease: 'expo.inOut', onComplete: done });
    }
    lastFocus?.focus?.();
  };

  document.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t.closest('[data-menu-open]')) open();
    else if (t.closest('[data-menu-close], [data-menu-link]')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab' && menuOpen) {
      const f = $$<HTMLElement>('a, button', menu);
      const first = f[0]!;
      const last = f[f.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  // links navigate while the curtain covers the screen, so close without animating
  document.addEventListener('astro:before-swap', () => close(true));
}

export const isMenuOpen = () => menuOpen;


let clockTimer = 0;
export function initClock() {
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' });
  const tick = () => $$('[data-clock]').forEach((c) => (c.textContent = fmt.format(new Date())));
  tick();
  window.clearInterval(clockTimer);
  clockTimer = window.setInterval(tick, 15_000);
}

export function updateNav(animate = true) {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const links = $$<HTMLAnchorElement>('[data-nav-link]');
  const indicator = $('[data-nav-indicator]');
  let current: HTMLAnchorElement | undefined;
  links.forEach((a) => {
    const href = a.getAttribute('href')!;
    const on = path === href || path.startsWith(href + '/');
    a.toggleAttribute('aria-current', on);
    a.classList.toggle('!text-paper', on);
    if (on) current = a;
  });
  if (!indicator) return;
  if (!current) {
    gsap.to(indicator, { width: 0, duration: animate ? 0.5 : 0 });
    return;
  }
  const list = indicator.parentElement!.getBoundingClientRect();
  const r = current.getBoundingClientRect();
  gsap.to(indicator, { x: r.left - list.left + 16, width: r.width - 32, duration: animate ? 0.9 : 0, ease: 'expo.inOut' });
}

export function initScrollProgress() {
  const bar = $('[data-scroll-progress]');
  const pct = $('[data-scroll-percent]');
  if (!bar || bar.dataset.ready) return;
  bar.dataset.ready = '1';
  const setBar = gsap.quickSetter(bar, 'scaleY');
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(scrollY / max, 1) : 0;
    setBar(p);
    if (pct) pct.textContent = String(Math.round(p * 100)).padStart(3, '0');
  };
  gsap.ticker.add(update);
}
