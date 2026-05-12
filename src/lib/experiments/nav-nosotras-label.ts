import { siteNavItems } from '~/data/siteNav';

export type NavNosotrasLabelPayload = {
  label: string;
  variation: string;
};

export function getNavNosotrasLabelFallback(): NavNosotrasLabelPayload {
  const row = siteNavItems.find((i): i is { kind: 'link'; href: string; label: string } => i.kind === 'link' && i.href === '/nosotras');
  return {
    label: row?.label ?? 'Nosotras',
    variation: 'control'
  };
}

export function normalizeNavNosotrasPayload(raw: unknown, fallback: NavNosotrasLabelPayload): NavNosotrasLabelPayload {
  if (!raw || typeof raw !== 'object') return fallback;
  const o = raw as Record<string, unknown>;
  const label = o.label;
  const variation = o.variation;
  if (typeof label !== 'string' || !label.trim()) return fallback;
  if (typeof variation !== 'string' || !variation.trim()) return fallback;
  return { label: label.trim(), variation: variation.trim() };
}
