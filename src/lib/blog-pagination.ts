import type { CollectionEntry } from 'astro:content';

export const BLOG_PAGE_SIZE = 10;

export function blogListPath(page: number): string {
  if (page <= 1) return '/blog/';
  return `/blog/page/${page}/`;
}

export function paginateBlogPosts(
  sortedPosts: CollectionEntry<'blog'>[],
  currentPage: number
): {
  data: CollectionEntry<'blog'>[];
  currentPage: number;
  lastPage: number;
  url: { prev: string | undefined; next: string | undefined };
} {
  const lastPage = Math.max(1, Math.ceil(sortedPosts.length / BLOG_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, Math.floor(currentPage) || 1), lastPage);
  const start = (safePage - 1) * BLOG_PAGE_SIZE;
  const data = sortedPosts.slice(start, start + BLOG_PAGE_SIZE);

  return {
    data,
    currentPage: safePage,
    lastPage,
    url: {
      prev: safePage > 1 ? blogListPath(safePage - 1) : undefined,
      next: safePage < lastPage ? blogListPath(safePage + 1) : undefined
    }
  };
}
