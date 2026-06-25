#!/usr/bin/env node
/**
 * Verify documentation links and agent smoke-test file targets.
 *
 * Usage: pnpm docs:check
 *
 * Checks:
 *  - Required entry points, topic guides, and contracts exist
 *  - Relative markdown links in docs/ resolve to real files
 *  - Agent smoke scenarios (DOCUMENTATION.md Iteration 5) point at existing paths
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Paths that must exist for the doc set to be complete. */
const REQUIRED_PATHS = [
  '.cursor/rules/byklika-website.md',
  '.claude/CLAUDE.md',
  'README.md',
  '.github/pull_request_template.md',
  'docs/AI-README.md',
  'docs/workplan-template.md',
  'docs/workplans/README.md',
  'docs/blog-content.md',
  'docs/blog-images.md',
  'docs/seo-geo.md',
  'docs/experiments.md',
  'docs/analytics.md',
  'docs/contact-forms.md',
  'docs/deployment.md',
  'docs/smoke-test.md',
  'src/content.config.ts',
  'src/data/seoOnPageContract.ts',
  'src/data/seoSchemaContract.ts',
  'src/data/seoIndexingPolicy.ts',
  'src/data/geoEntityContract.ts',
  'src/data/blogImageContract.ts',
  'src/data/blogArticleContract.ts',
  'src/data/blogPlaceholders.ts',
  'src/data/contactSheetContract.ts',
  'src/data/siteNav.ts',
  'src/lib/seo/schema.ts',
  'src/components/seo/JsonLd.astro',
  'src/lib/experiments/nav-nosotras-label.ts',
  'src/lib/experiments/constants.ts',
  'src/lib/analytics/bus.ts',
  'src/lib/contactFormPayload.ts',
  'astro.config.mjs',
  'vercel.json'
];

/** Markdown files scanned for broken relative links (Byklika docs only). */
const LINK_SCAN_ROOTS = ['docs', '.cursor/rules', '.claude'];

/** Agent smoke scenarios — DOCUMENTATION.md §5.2 */
const AGENT_SMOKE = [
  {
    id: 1,
    prompt: 'Add a new blog post in diseño instruccional',
    guides: ['docs/blog-content.md'],
    targets: ['src/content.config.ts'],
    guideMustMention: ['content.config.ts', 'diseno-instruccional']
  },
  {
    id: 2,
    prompt: 'Change the homepage SEO title',
    guides: ['docs/seo-geo.md', 'docs/AI-README.md'],
    targets: ['src/data/seoOnPageContract.ts'],
    guideMustMention: ['seoOnPageContract.ts', 'seoPageMeta'],
    targetsMustNotBePrimary: {
      file: 'src/pages/index.astro',
      forbiddenPatterns: [/formatSeoTitle\s*\(\s*['"]klika/i, /title:\s*['"]klika e/i]
    }
  },
  {
    id: 3,
    prompt: 'Add hero image for a new article',
    guides: ['docs/blog-images.md'],
    targets: ['src/data/blogImageContract.ts', 'scripts/optimize-blog-images.sh'],
    guideMustMention: ['optimize:blog', 'blogImageContract.ts']
  },
  {
    id: 4,
    prompt: 'Add JSON-LD for a new page type',
    guides: ['docs/seo-geo.md'],
    targets: ['src/lib/seo/schema.ts', 'src/components/seo/JsonLd.astro'],
    guideMustMention: ['schema.ts', 'JsonLd.astro']
  },
  {
    id: 5,
    prompt: 'Change Nosotras nav label via experiment',
    guides: ['docs/experiments.md'],
    targets: ['src/lib/experiments/nav-nosotras-label.ts', 'src/lib/experiments/constants.ts'],
    guideMustMention: ['nav-nosotras-label', 'NAV_NOSOTRAS_FLAG_KEY']
  },
  {
    id: 6,
    prompt: 'Track a button click in GA4',
    guides: ['docs/analytics.md'],
    targets: ['src/lib/analytics/types.ts', 'src/lib/analytics/bus.ts'],
    guideMustMention: ['publish(', 'AnalyticsEventMap']
  },
  {
    id: 7,
    prompt: 'Update contact sheet copy',
    guides: ['docs/contact-forms.md', 'docs/AI-README.md'],
    targets: ['src/data/contactSheetContract.ts'],
    guideMustMention: ['contactSheetContract.ts'],
    guideMustMentionByFile: {
      'docs/contact-forms.md': ['contactSheetCopy']
    }
  }
];

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function collectMarkdownFiles(dirRel) {
  const abs = path.join(ROOT, dirRel);
  if (!fs.existsSync(abs)) return [];

  const out = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) out.push(path.relative(ROOT, full));
    }
  };
  walk(abs);
  return out;
}

function extractMarkdownLinks(content) {
  const links = [];
  const regex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push({ text: match[1], href: match[2].trim() });
  }
  return links;
}

function shouldSkipLink(href) {
  if (!href || href.startsWith('#')) return true;
  if (/^(https?:|mailto:|tel:)/i.test(href)) return true;
  // Site routes, not repo files
  if (href.startsWith('/blog/') || href === '/blog/') return true;
  return false;
}

function isRepoRootRelative(pathPart) {
  if (
    pathPart.startsWith('docs/') ||
    pathPart.startsWith('src/') ||
    pathPart.startsWith('.github/') ||
    pathPart.startsWith('.cursor/') ||
    pathPart.startsWith('examples/')
  ) {
    return true;
  }
  return ['GEO.md', 'README.md', 'DOCUMENTATION.md'].includes(pathPart);
}

function resolveMarkdownLink(fromFileRel, href) {
  const [pathPart] = href.split('#');
  if (!pathPart) return null;

  if (isRepoRootRelative(pathPart)) {
    return path.normalize(pathPart);
  }

  const fromDir = path.dirname(fromFileRel);
  return path.normalize(path.join(fromDir, pathPart));
}

function checkRequiredPaths(errors) {
  for (const rel of REQUIRED_PATHS) {
    if (!exists(rel)) {
      errors.push(`Missing required path: ${rel}`);
    }
  }
}

function checkMarkdownLinks(errors) {
  const files = LINK_SCAN_ROOTS.flatMap(collectMarkdownFiles);
  files.push('README.md');

  for (const file of files) {
    const content = read(file);
    for (const { href } of extractMarkdownLinks(content)) {
      if (shouldSkipLink(href)) continue;
      const target = resolveMarkdownLink(file, href);
      if (!target) continue;
      if (!exists(target)) {
        errors.push(`Broken link in ${file}: (${href}) → ${target}`);
      }
    }
  }
}

function checkAgentSmoke(errors, passes) {
  for (const scenario of AGENT_SMOKE) {
    let ok = true;

    for (const guide of scenario.guides) {
      if (!exists(guide)) {
        errors.push(`Smoke #${scenario.id}: missing guide ${guide}`);
        ok = false;
        continue;
      }
      const text = read(guide);
      for (const needle of scenario.guideMustMention ?? []) {
        if (!text.includes(needle)) {
          errors.push(`Smoke #${scenario.id}: ${guide} does not mention "${needle}"`);
          ok = false;
        }
      }
      const byFile = scenario.guideMustMentionByFile?.[guide];
      if (byFile) {
        for (const needle of byFile) {
          if (!text.includes(needle)) {
            errors.push(`Smoke #${scenario.id}: ${guide} does not mention "${needle}"`);
            ok = false;
          }
        }
      }
    }

    for (const target of scenario.targets) {
      if (!exists(target)) {
        errors.push(`Smoke #${scenario.id}: missing target ${target}`);
        ok = false;
      }
    }

    const guard = scenario.targetsMustNotBePrimary;
    if (guard && exists(guard.file)) {
      const text = read(guard.file);
      for (const pattern of guard.forbiddenPatterns) {
        if (pattern.test(text)) {
          errors.push(
            `Smoke #${scenario.id}: ${guard.file} appears to hardcode SEO title (expected seoOnPageContract.ts)`
          );
          ok = false;
        }
      }
    }

    if (ok) {
      passes.push(`Smoke #${scenario.id}: ${scenario.prompt}`);
    }
  }
}

function main() {
  const errors = [];
  const passes = [];

  checkRequiredPaths(errors);
  checkMarkdownLinks(errors);
  checkAgentSmoke(errors, passes);

  console.log('docs:check — Byklika documentation validation\n');

  if (passes.length) {
    console.log(`Agent smoke file targets (${passes.length}/${AGENT_SMOKE.length}):`);
    for (const line of passes) console.log(`  ✓ ${line}`);
    console.log('');
  }

  if (errors.length) {
    console.error(`Failed with ${errors.length} error(s):`);
    for (const err of errors) console.error(`  ✗ ${err}`);
    process.exit(1);
  }

  console.log('All documentation checks passed.');
}

main();
