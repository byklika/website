import {
  normalizeNavNosotrasPayload,
  type NavNosotrasLabelPayload
} from '~/lib/experiments/nav-nosotras-label';

type HeaderNavExperimentConfig = {
  flagKey: string;
  fallback: NavNosotrasLabelPayload;
  growthbookEnabled: boolean;
};

function readExperimentConfig(): HeaderNavExperimentConfig {
  const el = document.getElementById('header-nav-experiment');
  if (!el?.textContent) {
    return {
      flagKey: '',
      fallback: { label: 'Nosotras', variation: 'control' },
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

export function initHeaderNav(): void {
  const cfg = readExperimentConfig();
  const header = document.getElementById('homeHeader');
  let navVariant = cfg.fallback.variation;
  let applied = false;

  function syncNosotrasLabelFromGrowthBook(): void {
    if (applied) return;
    if (!cfg.growthbookEnabled) return;

    const gb = window.growthbook;
    if (!gb || typeof gb.getFeatureValue !== 'function') return;

    const raw = gb.getFeatureValue(cfg.flagKey, cfg.fallback);
    const payload = normalizeNavNosotrasPayload(raw, cfg.fallback);
    if (import.meta.env.DEV) {
      const rawObj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
      const rawLooksValid =
        rawObj &&
        typeof rawObj.label === 'string' &&
        rawObj.label.trim() &&
        typeof rawObj.variation === 'string' &&
        rawObj.variation.trim();
      console.debug('[nav-nosotras-label] GrowthBook payload', {
        raw,
        normalized: payload,
        /** If true, GB already returned usable strings; normalize still clones/trims. */
        rawHadLabelAndVariationKeys: Boolean(rawLooksValid),
        /** True when normalize changed the effective label or variation vs raw. */
        normalizeChangedResult:
          !rawObj ||
          payload.label !== String(rawObj.label ?? '').trim() ||
          payload.variation !== String(rawObj.variation ?? '').trim()
      });
    }
    navVariant = payload.variation;
    applyNosotrasLabel(payload.label);
    applied = true;
    header?.setAttribute('data-nav-nosotras-label-synced', 'true');
  }

  function trackNavClick(event: Event): void {
    const target =
      event.target instanceof Element ? event.target.closest('[data-nav-nosotras-label="true"]') : null;
    if (!target || typeof window.gtag !== 'function') return;
    window.gtag('event', 'nav_item_click', {
      experiment_key: cfg.flagKey,
      variant: navVariant,
      label_shown:
        target.getAttribute('data-nav-label-shown') || target.textContent?.trim() || cfg.fallback.label,
      href: '/nosotras'
    });
  }

  function onScroll(): void {
    header?.classList.toggle('scrolled', window.scrollY > 20);
  }

  if (cfg.growthbookEnabled) {
    window.addEventListener('growthbook:ready', syncNosotrasLabelFromGrowthBook, { once: true });
    if (window.growthbook && typeof window.growthbook.getFeatureValue === 'function') {
      syncNosotrasLabelFromGrowthBook();
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('click', trackNavClick, { capture: true });
  onScroll();
}
