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
      event.target instanceof Element ? event.target.closest('[data-nav-nosotras-label="true"]') : null;
    if (!target) return;
    publish({
      name: 'nav_item_click',
      params: {
        experiment_key: cfg.flagKey,
        variant: navVariant,
        label_shown:
          target.getAttribute('data-nav-label-shown') || target.textContent?.trim() || cfg.fallback,
        href: '/nosotras'
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
  document.addEventListener('click', trackNavClick, { capture: true });
  onScroll();
}
