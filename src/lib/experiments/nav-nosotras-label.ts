import { siteNavItems } from '~/data/siteNav';

/** Default Nosotras nav label from site config (SSR + GrowthBook fallback). */
export function getNavNosotrasLabelFallback(): string {
  const row = siteNavItems.find(
    (i): i is { kind: 'link'; href: string; label: string } =>
      i.kind === 'link' && i.href === '/#nosotras'
  );
  return row?.label ?? 'Nosotras';
}

/** Coerce GrowthBook `getFeatureValue` / `evalFeature().value` to a non-empty label string. */
export function normalizeNavNosotrasLabel(raw: unknown, fallback: string): string {
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return fallback;
}
