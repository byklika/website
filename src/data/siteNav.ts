export type SiteNavItem =
  | { kind: 'link'; href: string; label: string }
  | { kind: 'contact-sheet'; label: string };

/**
 * Primary nav — MVP scroll targets on the homepage (`#inicio`, `#metodologia`, …).
 * Standalone routes under `src/pages/{servicios,metodologia,nosotras}/` remain for a future revamp.
 */
export const siteNavItems: SiteNavItem[] = [
  { kind: 'link', href: '/#inicio', label: 'Inicio' },
  { kind: 'link', href: '/#metodologia', label: 'Metodología' },
  { kind: 'link', href: '/#servicios', label: 'Servicios' },
  { kind: 'link', href: '/#nosotras', label: 'Nosotras' },
  { kind: 'link', href: '/blog/', label: 'Blog' }
];

/** Header primary nav (desktop + mobile). */
export const headerNavItems: SiteNavItem[] = siteNavItems.map((item) =>
  item.kind === 'link' && item.href === '/#inicio' ? { ...item, label: 'Inicio' } : item
);
