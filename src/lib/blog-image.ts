/**
 * Responsive blog image helpers — `<picture>` + srcset (BLOG_IMAGES.md Iteration 3).
 *
 * Widths: keep in sync with `scripts/optimize-blog-images.sh` via {@link blogImageWidths}.
 *
 * `sizes` presets:
 *   - `card`    — index grid (BlogArticleCard)
 *   - `banner`  — full-bleed article hero (BlogArticleBanner)
 *   - `related` — two-column related grid (BlogRelatedCard)
 */
import fs from 'node:fs';
import path from 'node:path';
import type { CollectionEntry } from 'astro:content';
import {
  blogImagePublicBase,
  blogImageSizesPresets,
  blogImageWidths,
  type BlogImageSizesPreset,
  type BlogImageWidth
} from '~/data/blogImageContract';

export { blogImageWidths, blogImageSizesPresets };
export type { BlogImageSizesPreset, BlogImageWidth };

export type BlogImageExt = 'avif' | 'webp' | 'jpg';

/** Public URL prefix for a bundle id, e.g. `/images/blog/diseno-instruccional/foo`. */
export function blogImageBase(entryId: string): string {
  return blogImagePublicBase(entryId);
}

/** Middle width JPEG used as `<img src>` fallback inside `<picture>`. */
export const blogImageFallbackWidth: BlogImageWidth = 960;

export function buildSrcset(
  base: string,
  ext: BlogImageExt,
  widths: readonly number[] = blogImageWidths
): string {
  return widths.map((width) => `${base}-${width}w.${ext} ${width}w`).join(', ');
}

function resolveSizes(sizes: string | BlogImageSizesPreset): string {
  if (sizes in blogImageSizesPresets) {
    return blogImageSizesPresets[sizes as BlogImageSizesPreset];
  }
  return sizes;
}

export type BuildBlogPicturePropsInput = {
  /** Bundle id — blog `entry.id` or placeholder `heroImageSlug`. */
  slug: string;
  alt: string;
  sizes: string | BlogImageSizesPreset;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'auto' | 'sync';
  class?: string;
  fetchpriority?: 'high' | 'low' | 'auto';
};

export type BlogPictureProps = {
  sources: {
    avif: { type: 'image/avif'; srcSet: string; sizes: string };
    webp: { type: 'image/webp'; srcSet: string; sizes: string };
  };
  img: {
    src: string;
    srcSet: string;
    sizes: string;
    alt: string;
    loading?: 'eager' | 'lazy';
    decoding: 'async' | 'auto' | 'sync';
    class?: string;
    fetchpriority?: 'high' | 'low' | 'auto';
  };
};

/** Props for Astro `<picture>` markup — AVIF/WebP sources + JPEG fallback img. */
export function buildBlogPictureProps(input: BuildBlogPicturePropsInput): BlogPictureProps {
  const base = blogImageBase(input.slug);
  const sizes = resolveSizes(input.sizes);

  return {
    sources: {
      avif: {
        type: 'image/avif',
        srcSet: buildSrcset(base, 'avif'),
        sizes
      },
      webp: {
        type: 'image/webp',
        srcSet: buildSrcset(base, 'webp'),
        sizes
      }
    },
    img: {
      src: `${base}-${blogImageFallbackWidth}w.jpg`,
      srcSet: buildSrcset(base, 'jpg'),
      sizes,
      alt: input.alt,
      loading: input.loading,
      decoding: input.decoding ?? 'async',
      class: input.class,
      fetchpriority: input.fetchpriority
    }
  };
}

/** OG / social preview derivative for a bundle id. */
export function blogImageOgUrl(entryId: string): string {
  return `${blogImageBase(entryId)}-1920w.jpg`;
}

const publicBlogImagesDir = path.join(process.cwd(), 'public', 'images', 'blog');

/** Filesystem path for a derivative — build-time existence checks only. */
export function blogImageDerivativeFsPath(
  entryId: string,
  width: BlogImageWidth = blogImageFallbackWidth,
  ext: BlogImageExt = 'webp'
): string {
  return path.join(publicBlogImagesDir, `${entryId}-${width}w.${ext}`);
}

/** True when optimized derivatives exist for a bundle id. */
export function blogImageBundleExists(entryId: string): boolean {
  return fs.existsSync(blogImageDerivativeFsPath(entryId));
}

/** Return slug only when derivatives exist — avoids broken `<img>` when files are missing. */
export function resolveBlogImageSlug(slug?: string): string | undefined {
  if (!slug?.trim()) return undefined;
  const normalized = slug.trim().replace(/^\/+|\/+$/g, '');
  return blogImageBundleExists(normalized) ? normalized : undefined;
}

/**
 * Extract bundle id from a public blog image path or basename.
 * Accepts `/images/blog/foo`, `/images/blog/foo-960w.jpg`, or `foo-960w.webp`.
 */
export function parseBlogImageSlugFromPath(imagePath: string): string | undefined {
  const normalized = imagePath
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '');
  const withoutPrefix = normalized.replace(/^images\/blog\//, '').replace(/^\/images\/blog\//, '');
  const slug = withoutPrefix.replace(/-\d+w\.(avif|webp|jpg)$/i, '').replace(/^\/+|\/+$/g, '');
  return slug || undefined;
}

/** Hero/card bundle id — frontmatter override, else `entry.id` when derivatives exist. */
export function resolveBlogEntryImageSlug(entry: CollectionEntry<'blog'>): string | undefined {
  if (entry.data.heroImage) {
    const fromPath = parseBlogImageSlugFromPath(entry.data.heroImage);
    if (fromPath && blogImageBundleExists(fromPath)) return fromPath;
  }
  if (blogImageBundleExists(entry.id)) return entry.id;
  return undefined;
}
