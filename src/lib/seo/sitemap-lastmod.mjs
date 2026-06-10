/**
 * Blog `lastmod` map for `@astrojs/sitemap` serialize (GEO.md Iteration 2).
 * Uses `updatedDate` when set, else `pubDate` from MDX frontmatter.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const BLOG_CONTENT_DIR = path.join(REPO_ROOT, 'src/content/blog');

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
function parseFrontmatterDates(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  /** @type {Record<string, string>} */
  const data = {};
  for (const line of match[1].split('\n')) {
    const keyValue = line.match(/^([A-Za-z0-9_]+):\s*(.+)$/);
    if (!keyValue) continue;
    const [, key, rawValue] = keyValue;
    if (key === 'pubDate' || key === 'updatedDate') {
      data[key] = unquote(rawValue);
    }
    if (key === 'draft' && unquote(rawValue) === 'true') {
      data.draft = 'true';
    }
  }
  return data;
}

/** @param {string} dateLike */
function toIsoLastmod(dateLike) {
  const parsed = new Date(dateLike);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

/** @param {string} dir */
function collectMdxFiles(dir) {
  /** @type {string[]} */
  const files = [];
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectMdxFiles(abs));
    else if (/\.(md|mdx)$/.test(entry.name)) files.push(abs);
  }
  return files;
}

/**
 * Map blog article pathnames (`/blog/{entryId}/`) to ISO `lastmod` strings.
 * @returns {Map<string, string>}
 */
export function getBlogSitemapLastmodByPath() {
  /** @type {Map<string, string>} */
  const byPath = new Map();

  for (const file of collectMdxFiles(BLOG_CONTENT_DIR)) {
    const fm = parseFrontmatterDates(fs.readFileSync(file, 'utf8'));
    if (fm.draft === 'true') continue;

    const entryId = path
      .relative(BLOG_CONTENT_DIR, file)
      .replace(/\.(md|mdx)$/, '')
      .replace(/\\/g, '/');
    const pathname = `/blog/${entryId}/`;
    const lastmod = toIsoLastmod(fm.updatedDate ?? fm.pubDate ?? '');
    if (lastmod) byPath.set(pathname, lastmod);
  }

  return byPath;
}
