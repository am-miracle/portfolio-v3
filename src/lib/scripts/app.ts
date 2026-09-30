import type { TransitionBeforePreparationEvent } from 'astro:transitions/client';
import { ScrollTrigger, getLenis, initSmoothScroll, scrollToTarget } from './motion';
import {
  runPreloader,
  curtainIn,
  curtainOut,
  resetCursor,
  initCursor,
  initMenu,
  initClock,
  updateNav,
  initScrollProgress,
} from './chrome';

let teardown: (() => void) | null = null;
let firstLoad = true;
let activeLoad = 0;

type Teardown = () => void;

const loadPageScripts = async () => {
  const effectsPromise = import('./effects');
  const heroPromise = document.querySelector('[data-hero]') ? import('./hero') : Promise.resolve(null);
  const [effects, hero] = await Promise.all([effectsPromise, heroPromise]);
  return { effects, hero };
};

async function onPageLoad() {
  const loadId = ++activeLoad;
  initSmoothScroll();
  initCursor();
  initMenu();
  initScrollProgress();
  initClock();

  teardown?.();
  let heroHandle: { play: () => void; destroy: () => void } | null = null;
  let stopEffects: Teardown = () => {};
  teardown = () => {
    stopEffects();
    heroHandle?.destroy();
  };

  if (firstLoad) {
    firstLoad = false;
    updateNav(false);
    await runPreloader();
  } else {
    updateNav(true);
  }

  const { effects, hero } = await loadPageScripts();
  if (loadId !== activeLoad) return;
  heroHandle = hero?.initHero() ?? null;
  stopEffects = effects.initEffects();
  heroHandle?.play();
  ScrollTrigger.refresh();

  // honour #hash targets after a navigation, e.g. /#contact
  if (location.hash.length > 1) {
    const el = document.querySelector(decodeURIComponent(location.hash));
    if (el) requestAnimationFrame(() => scrollToTarget(el as HTMLElement, true));
  }
}

document.addEventListener('astro:before-preparation', (e) => {
  const ev = e as TransitionBeforePreparationEvent;
  const load = ev.loader;
  ev.loader = async () => {
    await Promise.all([curtainIn(ev.to), load()]);
  };
});

document.addEventListener('astro:after-swap', () => {
  if (document.querySelector('[data-cursor-root][data-ready]')) document.documentElement.classList.add('has-cursor');
  getLenis()?.scrollTo(0, { immediate: true, force: true });
});

let navigated = false;
document.addEventListener('astro:page-load', () => {
  resetCursor();
  const reveal = navigated ? curtainOut() : Promise.resolve();
  navigated = true;
  return Promise.all([onPageLoad(), reveal]);
});

// same-page hash links (e.g. "Let's talk" on the home page) → smooth scroll
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
  if (!a || a.target === '_blank') return;
  const url = new URL(a.href);
  if (url.pathname !== location.pathname || !url.hash) return;
  const el = document.querySelector(url.hash);
  if (!el) return;
  e.preventDefault();
  history.replaceState(null, '', url.hash);
  scrollToTarget(el as HTMLElement, true);
});

document.addEventListener('click', (e) => {
  if ((e.target as Element).closest('[data-to-top]')) scrollToTarget(0);
});
