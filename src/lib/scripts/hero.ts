import { gsap, ScrollTrigger, SplitText, reducedMotion } from './motion';
import type { PortraitHandle } from './portrait';

const canUseWebGL = () => {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
};

const onIdle = (fn: () => void) => {
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 2500 });
  else globalThis.setTimeout(fn, 1200);
};

export function initHero(): { play: () => void; destroy: () => void } | null {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return null;

  const stage = hero.querySelector<HTMLElement>('[data-portrait]');
  const fallback = stage?.querySelector<HTMLImageElement>('img');
  let portrait: PortraitHandle | null = null;
  let destroyed = false;
  let played = false;

  const ctx = gsap.context(() => {});

  if (stage && !reducedMotion && window.matchMedia('(min-width: 768px)').matches && canUseWebGL()) {
    onIdle(() => {
      import('./portrait').then(({ createPortrait }) => {
        if (destroyed) return;
        portrait = createPortrait(stage, {
          color: stage.dataset.color!,
          depth: stage.dataset.depth!,
          reducedMotion,
          onReady: () => fallback && gsap.to(fallback, { autoAlpha: 0, duration: 0.4 }),
        });
        if (played) portrait.intro();

        // scroll away → the figure disintegrates
        ctx.add(() => {
          ScrollTrigger.create({
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (st) => portrait?.setExplode(st.progress * 1.25),
          });
        });
      });
    });
  }

  const play = () => {
    if (played) return;
    played = true;
    portrait?.intro();
    if (reducedMotion) {
      gsap.set(hero.querySelectorAll('[data-reveal]'), { opacity: 1 });
      return;
    }
    ctx.add(() => {
      const title = hero.querySelector('[data-hero-title]');
      const split = title ? SplitText.create(title, { type: 'lines,words', linesClass: 'split-line', wordsClass: 'split-word' }) : null;
      const tl = gsap.timeline({ defaults: { duration: 1.2 } });
      tl.from('[data-hero-bg] > *', { yPercent: 60, opacity: 0, stagger: 0.08, duration: 1.8 }, 0)
        .from(split?.words ?? [], { yPercent: 120, rotate: 6, stagger: 0.05 }, 0.3)
        .fromTo(hero.querySelectorAll('[data-reveal]'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.07 }, 0.5)
        .from('[data-hero-strip] > *', { yPercent: 100, stagger: 0.1, duration: 1.3, ease: 'expo.out' }, 0.7)
        .from('[data-hero-bar]', { scaleX: 0, transformOrigin: 'left', duration: 1.6, ease: 'expo.inOut' }, 0.6);

      // giant background name drifts on scroll
      gsap.to('[data-hero-bg]', {
        xPercent: -12,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.matchMedia().add('(min-width: 1024px)', () => {
        gsap.to('[data-hero-side]', {
          y: -120,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: '60% top', scrub: true },
        });
      });
    });
  };

  return {
    play,
    destroy() {
      destroyed = true;
      portrait?.destroy();
      ctx.revert();
    },
  };
}
