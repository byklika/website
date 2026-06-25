import type { CollectionEntry } from 'astro:content';
import { blogCategoryFallback, blogReadingTimeWpm } from '~/data/blogArticleContract';
import { blogPostHref, resolveBlogEntryId } from '~/lib/blog-card';
import { resolveBlogEntryImageSlug } from '~/lib/blog-image';

/** Frontmatter fields consumed by article detail layout (Iteration 2+). */
export type BlogArticleFrontmatter = CollectionEntry<'blog'>['data'];

/**
 * Display category: explicit `category`, else first tag, else `"Blog"`.
 */
export function resolveBlogCategory(category: string | undefined, tags: string[]): string {
  if (category?.trim()) return category.trim();
  if (tags.length > 0) return tags[0];
  return blogCategoryFallback;
}

/**
 * Reading time in minutes — uses frontmatter when set, else word-count heuristic.
 * Strips common MDX/HTML markup before counting words.
 */
export function computeReadingTimeMinutes(body: string, overrideMinutes?: number): number {
  if (overrideMinutes != null && overrideMinutes > 0) {
    return Math.floor(overrideMinutes);
  }

  const plain = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_[\]()!`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = plain ? plain.split(' ').length : 0;
  return Math.max(1, Math.ceil(words / blogReadingTimeWpm));
}

/**
 * Resolve up to two related posts for the article footer grid.
 *
 * Priority:
 * 1. Explicit `relatedSlugs` (preserve order, skip missing/draft/current).
 * 2. Auto-pick published posts excluding current — prefer same category, then shared tags.
 */
export function resolveRelatedPosts(
  currentSlug: string,
  allPosts: CollectionEntry<'blog'>[],
  options: {
    relatedSlugs?: string[];
    category?: string;
    tags?: string[];
    limit?: number;
  } = {}
): CollectionEntry<'blog'>[] {
  const limit = options.limit ?? 2;
  const published = allPosts.filter((p) => !p.data.draft && p.id !== currentSlug);

  if (options.relatedSlugs?.length) {
    const bySlug = new Map(published.map((p) => [p.id, p]));
    const picked: CollectionEntry<'blog'>[] = [];
    for (const slug of options.relatedSlugs) {
      const entryId = resolveBlogEntryId(slug, allPosts);
      if (!entryId || entryId === currentSlug) continue;
      const post = bySlug.get(entryId);
      if (post) picked.push(post);
      if (picked.length >= limit) break;
    }
    return picked;
  }

  const displayCategory = resolveBlogCategory(options.category, options.tags ?? []);
  const tagSet = new Set(options.tags ?? []);

  const scored = published
    .map((post) => {
      const postCategory = resolveBlogCategory(post.data.category, post.data.tags);
      let score = 0;
      if (postCategory === displayCategory) score += 2;
      for (const tag of post.data.tags) {
        if (tagSet.has(tag)) score += 1;
      }
      return { post, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.post.data.pubDate.getTime() - a.post.data.pubDate.getTime();
    });

  return scored.slice(0, limit).map(({ post }) => post);
}

/** Spanish long date for article meta row (standalone: `9 junio 2026`). */
export function formatBlogArticleDate(date: Date): string {
  return date.toLocaleDateString('es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/** Compact Spanish date for index cards — keeps category + date on one line. */
export function formatBlogCardDate(date: Date): string {
  return date
    .toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    .replace(/\./g, '');
}

/** Meta reading-time label (standalone: `5 min de lectura`). */
export function formatReadingTimeLabel(minutes: number): string {
  return `${minutes} min de lectura`;
}

/** Compact related-card cell for article footer (real post or placeholder). */
export type BlogRelatedDisplayCard = {
  slug: string;
  category: string;
  title: string;
  /** Set when the slug resolves to a published post. */
  href?: string;
  imageSlug?: string;
  imageAlt?: string;
};

/**
 * Up to two related cards: resolved posts first, then design placeholders
 * (excluding current slug and already-selected entries).
 */
export function resolveRelatedDisplayCards(
  currentSlug: string,
  relatedPosts: CollectionEntry<'blog'>[],
  placeholders: { slug: string; category: string; title: string }[]
): BlogRelatedDisplayCard[] {
  const cards: BlogRelatedDisplayCard[] = relatedPosts.map((post) => {
    const imageSlug = resolveBlogEntryImageSlug(post);
    return {
      slug: post.id,
      category: resolveBlogCategory(post.data.category, post.data.tags),
      title: post.data.title,
      href: blogPostHref(post.id),
      ...(imageSlug ? { imageSlug } : {}),
      ...(post.data.cardImageAlt ? { imageAlt: post.data.cardImageAlt } : {})
    };
  });

  const usedSlugs = new Set([currentSlug, ...cards.map((c) => c.slug)]);

  for (const placeholder of placeholders) {
    if (cards.length >= 2) break;
    if (usedSlugs.has(placeholder.slug)) continue;
    cards.push({ ...placeholder });
    usedSlugs.add(placeholder.slug);
  }

  return cards.slice(0, 2);
}
