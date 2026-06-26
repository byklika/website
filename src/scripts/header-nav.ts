import { publish } from '~/lib/analytics/bus';
import { normalizeNavNosotrasLabel } from '~/lib/experiments/nav-nosotras-label';

type HeaderNavExperimentConfig = {
  flagKey: string;
  fallback: string;
  growthbookEnabled: boolean;
};

function readExperimentConfig(): HeaderNavExperimentConfig {
  const el = document.getElementById('header-nav-experiment');
  if (!el?.textContent) {
    return {
      flagKey: '',
      fallback: 'Nosotras',
      growthbookEnabled: false
    };
  }
  return JSON.parse(el.textContent) as HeaderNavExperimentConfig;
}

function getNosotrasLinks(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-nav-nosotras-label="true"]'));
}

function applyNosotrasLabel(label: string): void {
  getNosotrasLinks().forEach((link) => {
    link.textContent = label;
    link.setAttribute('data-nav-label-shown', label);
  });
}

const HOMEPAGE_SECTION_IDS = ['inicio', 'metodologia', 'servicios', 'nosotras'] as const;

/** Read static `--site-header-height` from CSS (72px). */
function getSiteHeaderHeightPx(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--site-header-height')
    .trim();
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return 72;
  if (raw.endsWith('rem')) {
    return value * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
  return value;
}

/** Highlight nav link for the section currently in view (homepage hash targets only). */
function initNavScrollSpy(header: HTMLElement): () => void {
  if (window.location.pathname !== '/') return () => {};

  const linksBySection = new Map<string, HTMLAnchorElement[]>();
  header.querySelectorAll<HTMLAnchorElement>('a[data-nav-section]').forEach((link) => {
    const id = link.dataset.navSection;
    if (!id) return;
    const group = linksBySection.get(id) ?? [];
    group.push(link);
    linksBySection.set(id, group);
  });

  if (linksBySection.size === 0) return () => {};

  let activeId = '';

  const setActive = (id: string) => {
    if (id === activeId) return;
    activeId = id;
    linksBySection.forEach((anchors, sectionId) => {
      const on = sectionId === id;
      anchors.forEach((anchor) => {
        anchor.classList.toggle('is-section-active', on);
        if (on) anchor.setAttribute('aria-current', 'true');
        else anchor.removeAttribute('aria-current');
      });
    });
  };

  const measure = () => {
    const offset = getSiteHeaderHeightPx() + 16;
    let current: (typeof HOMEPAGE_SECTION_IDS)[number] = HOMEPAGE_SECTION_IDS[0];

    for (const id of HOMEPAGE_SECTION_IDS) {
      const section = document.getElementById(id);
      if (!section) continue;
      if (section.getBoundingClientRect().top <= offset) current = id;
    }

    setActive(current);
  };

  let rafId = 0;
  const scheduleMeasure = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      measure();
    });
  };

  window.addEventListener('scroll', scheduleMeasure, { passive: true });
  window.addEventListener('resize', scheduleMeasure, { passive: true });

  return scheduleMeasure;
}

export function initHeaderNav(): void {
  const cfg = readExperimentConfig();
  const header = document.getElementById('homeHeader');
  /** GrowthBook `Result.key` for the experiment arm (`"0"` = control, `"1"` … = treatments). */
  let navVariant = '0';
  let applied = false;

  function syncNosotrasLabelFromGrowthBook(): void {
    if (applied) return;
    if (!cfg.growthbookEnabled) return;

    const gb = window.growthbook;
    if (!gb || typeof gb.evalFeature !== 'function') return;

    const fr = gb.evalFeature(cfg.flagKey);
    const label = normalizeNavNosotrasLabel(fr.value, cfg.fallback);
    navVariant = fr.experimentResult?.key ?? '0';
    applyNosotrasLabel(label);
    applied = true;
    header?.setAttribute('data-nav-nosotras-label-synced', 'true');
  }

  function trackNavClick(event: Event): void {
    const target =
      event.target instanceof Element
        ? event.target.closest('[data-nav-nosotras-label="true"]')
        : null;
    if (!target) return;
    publish({
      name: 'nav_item_click',
      params: {
        experiment_key: cfg.flagKey,
        variant: navVariant,
        label_shown:
          target.getAttribute('data-nav-label-shown') || target.textContent?.trim() || cfg.fallback,
        href: '/#nosotras'
      }
    });
  }

  function onScroll(): void {
    header?.classList.toggle('scrolled', window.scrollY > 20);
  }

  if (cfg.growthbookEnabled) {
    window.addEventListener('growthbook:ready', syncNosotrasLabelFromGrowthBook, { once: true });
    if (window.growthbook && typeof window.growthbook.evalFeature === 'function') {
      syncNosotrasLabelFromGrowthBook();
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  const scheduleNavLayout = header ? initNavScrollSpy(header) : () => {};
  if (header) {
    scheduleNavLayout();
  }

  document.addEventListener('click', trackNavClick, { capture: true });

  const scrollToHashTarget = (hash: string, behavior: ScrollBehavior = 'auto') => {
    const id = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!id) return;
    const target = document.getElementById(id);
    if (!target || !header) return;
    target.scrollIntoView({ behavior, block: 'start' });
  };

  const mobileMenu = header?.querySelector('details');
  header?.querySelectorAll<HTMLAnchorElement>('a[href^="/#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      mobileMenu?.removeAttribute('open');

      const url = new URL(link.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;

      e.preventDefault();
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scrollToHashTarget(url.hash, prefersReduced ? 'auto' : 'smooth');
      history.pushState(null, '', url.hash);
      scheduleNavLayout();
    });
  });

  const initialHash = window.location.hash;
  if (initialHash) {
    requestAnimationFrame(() => {
      scrollToHashTarget(initialHash);
      scheduleNavLayout();
    });
  }

  onScroll();
}
