import { geoEntityContract } from '~/data/geoEntityContract';

function absoluteUrl(origin: string, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalized, origin).href;
}

/** Build `/llms.txt` body from the GEO entity contract. */
export function buildLlmsTxt(origin: string): string {
  const lines: string[] = [
    `# ${geoEntityContract.brandName}`,
    '',
    `> ${geoEntityContract.tagline}`,
    '',
    '## Quiénes somos',
    geoEntityContract.whoWeAre,
    '',
    '## Qué hacemos',
    geoEntityContract.whatWeDo,
    '',
    '## Servicios principales',
    ...geoEntityContract.primaryServices.map((service) => `- ${service}`),
    '',
    '## Páginas clave',
    ...geoEntityContract.keyPages.map(
      ({ label, path }) => `- ${label}: ${absoluteUrl(origin, path)}`
    ),
    '',
    '## Blog (artículos publicados)',
    ...geoEntityContract.indexableBlogPostPaths.map((path) => `- ${absoluteUrl(origin, path)}`),
    '',
    '## Contacto',
    geoEntityContract.contactEmail,
    '',
    '## Cómo citar',
    geoEntityContract.preferredCitation,
    '',
    '## Idioma y mercado',
    'Español (Argentina). Diseño instruccional y e‑learning para equipos educativos y organizaciones.',
    ''
  ];

  return lines.join('\n');
}
