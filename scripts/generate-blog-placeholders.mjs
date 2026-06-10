#!/usr/bin/env node
/**
 * Regenerate `blogPlaceholders` in `src/data/blogPlaceholders.ts` from MDX frontmatter.
 *
 * Usage: pnpm generate:blog-placeholders
 *
 * - Scans all MD/MDX under `src/content/blog/` (skips `draft: true`)
 * - Sorts entries by `pubDate` descending
 * - Sets `heroImageSlug` when image derivatives exist (see `resolveImageSlug`)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const PUBLIC_BLOG = path.join(ROOT, 'public/images/blog');
const OUT_FILE = path.join(ROOT, 'src/data/blogPlaceholders.ts');

/** @param {string} entryId */
function blogImageBundleExists(entryId) {
  const normalized = entryId.replace(/^\/+|\/+$/g, '');
  return fs.existsSync(path.join(PUBLIC_BLOG, `${normalized}-960w.webp`));
}

/** @param {string} imagePath */
function parseBlogImageSlugFromPath(imagePath) {
  const normalized = imagePath
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '');
  const withoutPrefix = normalized.replace(/^images\/blog\//, '').replace(/^\/images\/blog\//, '');
  const slug = withoutPrefix.replace(/-\d+w\.(avif|webp|jpg)$/i, '').replace(/^\/+|\/+$/g, '');
  return slug || undefined;
}

/** @param {string} entryId @param {string | undefined} heroImage */
function resolveImageSlug(entryId, heroImage) {
  if (heroImage) {
    const fromPath = parseBlogImageSlugFromPath(heroImage);
    if (fromPath && blogImageBundleExists(fromPath)) return fromPath;
  }
  if (blogImageBundleExists(entryId)) return entryId;
  const basename = entryId.split('/').pop();
  if (basename && blogImageBundleExists(basename)) return basename;
  return undefined;
}

/** @param {string} raw */
function unquote(raw) {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/** @param {string} content */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  /** @type {Record<string, unknown>} */
  const data = {};
  /** @type {string | null} */
  let arrayKey = null;

  for (const line of match[1].split('\n')) {
    const arrayItem = line.match(/^\s+-\s+(.+)$/);
    if (arrayItem && arrayKey) {
      /** @type {string[]} */ (data[arrayKey]).push(unquote(arrayItem[1]));
      continue;
    }

    const keyValue = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!keyValue) continue;

    const [, key, rawValue] = keyValue;
    arrayKey = null;

    if (rawValue === '') {
      data[key] = [];
      arrayKey = key;
      continue;
    }

    if (rawValue === 'true' || rawValue === 'false') {
      data[key] = rawValue === 'true';
      continue;
    }

    data[key] = unquote(rawValue);
  }

  return data;
}

/** @param {string | Date} value */
function parsePubDate(value) {
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const parsed = new Date(String(value));
  return parsed;
}

/** @param {string} value */
function escapeTsString(value) {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/** @param {Date} date */
function formatPubDateLiteral(date) {
  return `new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()})`;
}

/** @param {string} dir */
function collectMdxFiles(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectMdxFiles(abs));
    else if (/\.(md|mdx)$/.test(entry.name)) files.push(abs);
  }
  return files;
}

/** @typedef {{ slug: string, entryId: string, category: string, title: string, description: string, tags: string[], pubDate: Date, imageAlt?: string, heroImageSlug?: string }} PlaceholderEntry */

function buildPlaceholderEntries() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error('Blog content directory not found:', BLOG_DIR);
    process.exit(1);
  }

  /** @type {PlaceholderEntry[]} */
  const entries = [];

  for (const file of collectMdxFiles(BLOG_DIR)) {
    const fm = parseFrontmatter(fs.readFileSync(file, 'utf8'));
    if (fm.draft === true) continue;

    const entryId = path
      .relative(BLOG_DIR, file)
      .replace(/\.(md|mdx)$/, '')
      .replace(/\\/g, '/');
    const slug = entryId.split('/').pop() ?? entryId;
    const pubDate = parsePubDate(fm.pubDate ?? '');
    if (Number.isNaN(pubDate.getTime())) {
      console.warn(`Skipping ${entryId}: invalid or missing pubDate`);
      continue;
    }

    /** @type {string[]} */
    const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : [];
    const category = String(fm.category ?? tags[0] ?? 'Blog');
    const heroImageSlug = resolveImageSlug(
      entryId,
      fm.heroImage ? String(fm.heroImage) : undefined
    );

    /** @type {PlaceholderEntry} */
    const entry = {
      slug,
      entryId,
      category,
      title: String(fm.title ?? slug),
      description: String(fm.description ?? ''),
      tags,
      pubDate
    };

    if (fm.cardImageAlt) entry.imageAlt = String(fm.cardImageAlt);
    if (heroImageSlug) entry.heroImageSlug = heroImageSlug;

    entries.push(entry);
  }

  return entries.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

/** @param {PlaceholderEntry[]} entries */
function formatPlaceholderArray(entries) {
  if (!entries.length) return '[]';

  const objects = entries.map((entry) => {
    /** @type {string[]} */
    const props = [
      `    slug: ${escapeTsString(entry.slug)},`,
      `    category: ${escapeTsString(entry.category)},`,
      `    title: ${escapeTsString(entry.title)},`,
      `    description:`,
      `      ${escapeTsString(entry.description)},`,
      `    tags: [${entry.tags.map((tag) => escapeTsString(tag)).join(', ')}],`,
      `    pubDate: ${formatPubDateLiteral(entry.pubDate)},`
    ];

    if (entry.heroImageSlug) {
      props.push(`    heroImageSlug: ${escapeTsString(entry.heroImageSlug)},`);
    }
    if (entry.imageAlt) {
      props.push(`    imageAlt: ${escapeTsString(entry.imageAlt)}`);
    }

    props[props.length - 1] = props[props.length - 1].replace(/,$/, '');

    return `  {\n${props.join('\n')}\n  }`;
  });

  return `[\n${objects.join(',\n')}\n]`;
}

function buildOutputFile(entries) {
  return `/**
 * Blog index — placeholder dataset and design contracts (Iteration 1).
 *
 * \`blogPlaceholders\` is generated from MDX frontmatter — run \`pnpm generate:blog-placeholders\`.
 * Entries are ordered by \`pubDate\` descending.
 *
 * Source of truth for in-scope markup: \`Klika Blog - standalone.html\` line 180
 * (\`<main class="page">\` only):
 *   - \`<header class="blog-head">\` — H1 + lead
 *   - \`<section class="grid">\` — \`<article class="card">\` cells
 *   - \`<section class="cta-banner">\` — bottom CTA
 *
 * Primary touchpoints:
 *   - \`src/pages/blog/index.astro\`
 *   - \`src/components/blog/BlogArticleCard.astro\`
 *   - \`src/components/blog/BlogIndexSection.astro\`
 *   - \`scripts/generate-blog-placeholders.mjs\` — regenerates this file
 */

/** Placeholder article shape — mirrors standalone card fields until real posts ship. */
export type BlogPlaceholderEntry = {
  /** URL segment when a post exists; placeholders have no live detail pages yet. */
  slug: string;
  /** Standalone \`data-tema\` / \`.cat\` */
  category: string;
  /** Standalone \`.card-title\` */
  title: string;
  /** Card summary — same field as MDX frontmatter \`description\`. */
  description: string;
  /** Standalone \`.card-tag\` values */
  tags: string[];
  /** Standalone \`.date\` — stored as Date for locale formatting in components */
  pubDate: Date;
  /** Standalone \`.ph-text\` caption on image placeholder */
  imageAlt?: string;
  /**
   * Responsive image bundle id (basename only, no extension) when placeholders
   * should show real photos before MDX posts exist — same shape as \`entry.id\`.
   */
  heroImageSlug?: string;
};

/** Blog index intro copy from \`<header class="blog-head">\`. */
export const blogIndexIntro = {
  title: 'Blog',
  lead: 'Ideas, recursos y reflexiones sobre e-learning y diseño instruccional.'
} as const;

/** CTA banner copy from \`<section class="cta-banner">\`. */
export const blogIndexCta = {
  title: '¿Querés recibir las novedades primero?',
  description: 'Escribinos y te avisamos cuando publiquemos nuevos artículos.',
  /** Design uses "Contactanos"; align with site-wide label in Iteration 3 if Product decides. */
  buttonLabel: 'Contactanos'
} as const;

/**
 * Blog index cards — generated from MDX under src/content/blog/, pubDate DESC.
 * Regenerate: \`pnpm generate:blog-placeholders\`
 */
export const blogPlaceholders: BlogPlaceholderEntry[] = ${formatPlaceholderArray(entries)};
`;
}

const entries = buildPlaceholderEntries();
fs.writeFileSync(OUT_FILE, buildOutputFile(entries), 'utf8');

console.log(`Wrote ${entries.length} placeholder(s) to ${path.relative(ROOT, OUT_FILE)}`);
for (const entry of entries) {
  console.log(`  - ${entry.entryId} (${entry.pubDate.toISOString().slice(0, 10)})`);
}
