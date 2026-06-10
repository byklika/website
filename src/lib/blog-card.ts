import type { CollectionEntry } from 'astro:content';
import type { BlogPlaceholderEntry } from '~/data/blogPlaceholders';
import { resolveBlogEntryImageSlug } from '~/lib/blog-image';

/** Display category when frontmatter `category` and tags are absent. */
export const BLOG_DEFAULT_CATEGORY = 'Blog';

/**
 * Slug for the category folder under `src/content/blog/`.
 * Example: "Diseño instruccional" → `diseno-instruccional`
 */
export function categoryFolderSlug(category: string): string {
  return category
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Public URL for a blog entry (`entry.id` includes the category folder). */
export function blogPostHref(entryId: string): string {
  return `/blog/${entryId.replace(/^\/+|\/+$/g, '')}/`;
}

/**
 * Resolve a frontmatter `relatedSlugs` value or bare filename to a collection entry id.
 * Accepts `diseno-instruccional/post-slug`, `post-slug`, or full `entry.id`.
 */
export function resolveBlogEntryId(
  slugOrId: string,
  posts: CollectionEntry<'blog'>[]
): string | undefined {
  const normalized = slugOrId.replace(/^\/+|\/+$/g, '');
  const byId = new Map(posts.map((post) => [post.id, post.id]));

  if (byId.has(normalized)) return normalized;

  const suffixMatch = posts.find(
    (post) => post.id === normalized || post.id.endsWith(`/${normalized}`)
  );
  return suffixMatch?.id;
}
/**
 * Resolve card/list category from content:
 * `data.category` (when Product adds frontmatter) → first tag → {@link BLOG_DEFAULT_CATEGORY}.
 */
export function resolveBlogCategory(data: CollectionEntry<'blog'>['data']): string {
  return data.category ?? data.tags[0] ?? BLOG_DEFAULT_CATEGORY;
}

/**
 * Map a content entry to {@link BlogArticleCard} props.
 *
 * Field mapping:
 *   `entry.id` → `slug` (includes category folder, e.g. `diseno-instruccional/post-slug`)
 *   `data.title` → `title`
 *   `data.description` → `description`
 *   `data.pubDate` → `pubDate`
 *   `data.tags` → `tags`
 *   `resolveBlogCategory(data)` → `category`
 *   `blogPostHref(entry.id)` → `href`
 *   `resolveBlogEntryImageSlug(entry)` → `imageSlug` when derivatives exist
 *   `data.cardImageAlt` → `imageAlt` when set
 */
export function blogEntryToCardProps(
  entry: CollectionEntry<'blog'>
): BlogPlaceholderEntry & { href: string; imageSlug?: string } {
  const imageSlug = resolveBlogEntryImageSlug(entry);

  return {
    slug: entry.id,
    category: resolveBlogCategory(entry.data),
    title: entry.data.title,
    description: entry.data.description ?? '',
    tags: entry.data.tags,
    pubDate: entry.data.pubDate,
    href: blogPostHref(entry.id),
    ...(imageSlug ? { imageSlug } : {}),
    ...(entry.data.cardImageAlt ? { imageAlt: entry.data.cardImageAlt } : {})
  };
}
