// declarative, data-attribute driven page effects. Everything here is created inside a gsap.context and reverted on navigation
import { Flip } from 'gsap/Flip';
import { gsap, ScrollTrigger, SplitText, finePointer, reducedMotion, getLenis } from './motion';

gsap.registerPlugin(Flip);

type Cleanup = () => void;

const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [
  ...root.querySelectorAll<T>(sel),
];

// split headings into masked words that rise into place. Elements inside [data-hero] are left for the hero timeline
function splitReveals() {
  $$('[data-split]').forEach((el) => {
    if (el.closest('[data-hero]')) return;
    SplitText.create(el, {
      type: 'lines,words',
      linesClass: 'split-line',
      wordsClass: 'split-word',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.words, {
          yPercent: 115,
          rotate: 4,
          stagger: 0.035,
          duration: 1.2,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
    });
  });
}

function fadeReveals() {
  ScrollTrigger.batch('[data-reveal]:not([data-hero] [data-reveal])', {
    start: 'top 90%',
    once: true,
    onEnter: (els) =>
      gsap.fromTo(
        els,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 1.1, overwrite: true },
      ),
  });

  $$('[data-reveal-clip]').forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } },
    );
    const img = el.querySelector('img');
    if (img) gsap.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
}

function parallax() {
  $$('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '0.2');
    gsap.to(el, {
      yPercent: -100 * speed,
      ease: 'none',
      scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

//  word-by-word ink-in as you scroll through a big statement. */
function scrubText() {
  $$('[data-scrub-text]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', wordsClass: 'split-word', aria: 'none' });
    gsap.fromTo(
      split.words,
      { opacity: 0.12 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
      },
    );
  });
}

/** Marquee rows whose speed and direction follow scroll velocity. */
function marquees(): Cleanup {
  const rows = $$('[data-marquee]');
  const tweens = rows.map((row) => {
    const dir = row.dataset.marquee === 'reverse' ? 1 : -1;
    const track = row.firstElementChild as HTMLElement;
    return gsap.fromTo(
      track,
      { xPercent: dir === -1 ? 0 : -50 },
      { xPercent: dir === -1 ? -50 : 0, duration: parseFloat(row.dataset.speed || '28'), ease: 'none', repeat: -1 },
    );
  });
  if (!tweens.length) return () => {};
  let skew = 0;
  const update = () => {
    const v = getLenis()?.velocity ?? 0;
    const boost = 1 + Math.min(Math.abs(v) / 6, 5);
    const sign = v < -0.5 ? -1 : 1;
    tweens.forEach((t) => {
      gsap.to(t, { timeScale: boost * sign, duration: 0.4, overwrite: true });
    });
    skew += (gsap.utils.clamp(-8, 8, v * 0.35) - skew) * 0.12;
    rows.forEach((r) => (r.style.transform = `skewX(${-skew}deg)`));
  };
  gsap.ticker.add(update);
  return () => gsap.ticker.remove(update);
}

/** Pinned horizontal track (desktop only). */
function horizontal() {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    $$('[data-hscroll]').forEach((section) => {
      const track = section.querySelector<HTMLElement>('[data-hscroll-track]');
      const bar = section.querySelector<HTMLElement>('[data-hscroll-bar]');
      if (!track) return;
      const distance = () => track.scrollWidth - innerWidth + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rail') || '0') + 48;
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (st) => bar && gsap.set(bar, { scaleX: st.progress }),
        },
      });
      // cards lean with the scroll
      $$('[data-hcard]', track).forEach((card) => {
        gsap.fromTo(
          card,
          { rotate: 4, y: 60 },
          {
            rotate: 0,
            y: 0,
            ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'center center', scrub: true },
          },
        );
      });
    });
  });
  return () => mm.revert();
}

/** Sticky stacked cards that shrink and darken as the next one lands. */
function stack() {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => stackCards());
  return () => mm.revert();
}

function stackCards() {
  $$('[data-stack]').forEach((wrap) => {
    const cards = $$('[data-stack-card]', wrap);
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      gsap.to(card, {
        scale: 0.9 + i * 0.015,
        rotate: i % 2 ? 1.5 : -1.5,
        filter: 'brightness(0.7) saturate(0.8)',
        ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true },
      });
    });
  });
}

function magnetic(): Cleanup {
  if (!finePointer) return () => {};
  const offs: Cleanup[] = [];
  $$('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.35)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.35)' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    offs.push(() => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    });
  });
  return () => offs.forEach((f) => f());
}

function tilt(): Cleanup {
  if (!finePointer) return () => {};
  const offs: Cleanup[] = [];
  $$('[data-tilt]').forEach((el) => {
    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 12);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    offs.push(() => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    });
  });
  return () => offs.forEach((f) => f());
}

/** A floating preview image that trails the pointer over list rows. */
function hoverReveal(): Cleanup {
  if (!finePointer) return () => {};
  const offs: Cleanup[] = [];
  $$('[data-hover-list]').forEach((list) => {
    const float = list.querySelector<HTMLElement>('[data-hover-float]');
    const img = float?.querySelector('img');
    if (!float || !img) return;
    gsap.set(float, { scale: 0.4, autoAlpha: 0 });
    const xTo = gsap.quickTo(float, 'x', { duration: 0.7, ease: 'expo.out' });
    const yTo = gsap.quickTo(float, 'y', { duration: 0.7, ease: 'expo.out' });
    const rTo = gsap.quickTo(float, 'rotate', { duration: 0.9, ease: 'expo.out' });
    let lastX = 0;
    const move = (e: PointerEvent) => {
      const r = list.getBoundingClientRect();
      const x = e.clientX - r.left;
      xTo(x);
      yTo(e.clientY - r.top);
      rTo(gsap.utils.clamp(-14, 14, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    };
    const enterRow = (e: Event) => {
      const row = (e.target as Element).closest<HTMLElement>('[data-hover-src]');
      if (!row) return;
      if (img.getAttribute('src') !== row.dataset.hoverSrc) img.src = row.dataset.hoverSrc!;
      gsap.to(float, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)' });
    };
    const leave = () => gsap.to(float, { scale: 0.4, autoAlpha: 0, duration: 0.35 });
    list.addEventListener('pointermove', move);
    list.addEventListener('pointerover', enterRow);
    list.addEventListener('pointerleave', leave);
    offs.push(() => {
      list.removeEventListener('pointermove', move);
      list.removeEventListener('pointerover', enterRow);
      list.removeEventListener('pointerleave', leave);
    });
  });
  return () => offs.forEach((f) => f());
}

function counters() {
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count!);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end,
      duration: 2,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = Math.round(obj.v).toString()),
    });
  });
}

function wordmark() {
  $$('[data-wordmark]').forEach((el) => {
    gsap.fromTo(
      el.children,
      { yPercent: 100 },
      {
        yPercent: 0,
        stagger: { each: 0.06, from: 'center' },
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
      },
    );
  });
}

/** Filterable grid with FLIP transitions. */
function filters(): Cleanup {
  const offs: Cleanup[] = [];
  $$('[data-filter-root]').forEach((root) => {
    const buttons = $$<HTMLButtonElement>('[data-filter]', root);
    const items = $$('[data-filter-item]', root);
    const count = root.querySelector('[data-filter-count]');
    const onClick = (e: Event) => {
      const btn = (e.target as Element).closest<HTMLButtonElement>('[data-filter]');
      if (!btn) return;
      const f = btn.dataset.filter!;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const state = Flip.getState(items);
      let shown = 0;
      items.forEach((it) => {
        const on = f === 'all' || it.dataset.filterItem === f;
        it.classList.toggle('hidden', !on);
        if (on) shown++;
      });
      if (count) count.textContent = String(shown).padStart(2, '0');
      Flip.from(state, {
        duration: reducedMotion ? 0 : 0.9,
        ease: 'expo.inOut',
        stagger: 0.03,
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.8, rotate: -4 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.7 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.8, rotate: 4, duration: 0.5 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    };
    root.addEventListener('click', onClick);
    offs.push(() => root.removeEventListener('click', onClick));
  });
  return () => offs.forEach((f) => f());
}

/** Accordion rows (experience) with animated height. */
function accordions(): Cleanup {
  const offs: Cleanup[] = [];
  $$('[data-accordion]').forEach((row) => {
    const btn = row.querySelector<HTMLButtonElement>('[data-accordion-btn]');
    const panel = row.querySelector<HTMLElement>('[data-accordion-panel]');
    if (!btn || !panel) return;
    const toggle = () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      row.toggleAttribute('data-open', open);
      gsap.to(panel, {
        height: open ? 'auto' : 0,
        duration: 0.7,
        ease: 'expo.inOut',
        onComplete: () => ScrollTrigger.refresh(),
      });
    };
    btn.addEventListener('click', toggle);
    offs.push(() => btn.removeEventListener('click', toggle));
  });
  return () => offs.forEach((f) => f());
}

function contactForm(): Cleanup {
  const form = document.querySelector<HTMLFormElement>('[data-contact]');
  if (!form) return () => {};
  const msg = form.querySelector<HTMLTextAreaElement>('textarea');
  const out = form.querySelector('[data-count-left]');
  const status = document.querySelector<HTMLElement>('[data-contact-status]');
  if (status && location.search.includes('success')) status.hidden = false;
  const onInput = () => out && msg && (out.textContent = String(msg.maxLength - msg.value.length));
  msg?.addEventListener('input', onInput);
  return () => msg?.removeEventListener('input', onInput);
}

/** Run every effect for the current page. Returns a teardown for the next navigation. */
export function initEffects(): Cleanup {
  const cleanups: Cleanup[] = [];
  const ctx = gsap.context(() => {
    cleanups.push(filters(), accordions(), contactForm());
    if (reducedMotion) {
      gsap.set('[data-reveal]', { opacity: 1 });
      return;
    }
    splitReveals();
    fadeReveals();
    parallax();
    scrubText();
    counters();
    wordmark();
    cleanups.push(marquees(), horizontal(), stack(), magnetic(), tilt(), hoverReveal());
  });
  return () => {
    cleanups.forEach((f) => f());
    ctx.revert();
  };
}
