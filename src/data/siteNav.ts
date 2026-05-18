export type SiteNavItem =
  | { kind: 'link'; href: string; label: string }
  | { kind: 'contact-sheet'; label: string };

/** Primary navigation links used in desktop and mobile header menus. */
export const siteNavItems: SiteNavItem[] = [
  { kind: 'link', href: '/', label: 'Home' },
  { kind: 'link', href: '/servicios', label: 'Servicios' },
  { kind: 'link', href: '/como-trabajamos', label: 'Cómo trabajamos' },
  { kind: 'link', href: '/nosotras', label: 'Nosotras' },
  { kind: 'link', href: '/blog', label: 'Blog' }
];

/** Header primary nav (desktop + mobile); blog hidden until launch. */
export const headerNavItems = siteNavItems.filter(
  (item) => !(item.kind === 'link' && item.href === '/blog')
);
