import { getCollection } from 'astro:content';
import type { BlogPlaceholderEntry } from '~/data/blogPlaceholders';
import { blogPlaceholders } from '~/data/blogPlaceholders';
import { blogEntryToCardProps } from '~/lib/blog-card';
import { resolveBlogImageSlug } from '~/lib/blog-image';

function matchesPlaceholderSlug(entryId: string, placeholderSlug: string): boolean {
  return entryId === placeholderSlug || entryId.endsWith(`/${placeholderSlug}`);
}

export type BlogIndexCardProps = BlogPlaceholderEntry & {
  href?: string;
  imageSlug?: string;
};

/** Published index cards in placeholder order — shared by index route and LCP head. */
export async function getBlogIndexCards(): Promise<BlogIndexCardProps[]> {
  const publishedByPlaceholderSlug = new Map(
    (await getCollection('blog', ({ data }) => !data.draft))
      .filter((entry) =>
        blogPlaceholders.some((placeholder) => matchesPlaceholderSlug(entry.id, placeholder.slug))
      )
      .map((entry) => {
        const placeholder = blogPlaceholders.find((p) => matchesPlaceholderSlug(entry.id, p.slug))!;
        return [placeholder.slug, entry] as const;
      })
  );

  return blogPlaceholders.map((placeholder) => {
    const entry = publishedByPlaceholderSlug.get(placeholder.slug);
    return entry ? blogEntryToCardProps(entry) : placeholder;
  });
}

/** First card image bundle id when derivatives exist — used for LCP preload on `/blog/`. */
export function firstBlogIndexLcpImageSlug(cards: BlogIndexCardProps[]): string | undefined {
  const first = cards[0];
  if (!first) return undefined;
  const slug = first.imageSlug ?? first.heroImageSlug;
  return slug ? resolveBlogImageSlug(slug) : undefined;
}
