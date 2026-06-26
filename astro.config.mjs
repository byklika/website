// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { getBlogSitemapLastmodByPath } from './src/lib/seo/sitemap-lastmod.mjs';

const blogSitemapLastmod = getBlogSitemapLastmodByPath();

// https://astro.build/config
export default defineConfig({
  // Used for canonical URLs and Open Graph absolute links. Override per deploy with PUBLIC_SITE_URL.
  site: process.env.PUBLIC_SITE_URL || 'https://byklika.com',
  // Aligns with SEO_INDEXABLE_* paths, blogPostHref, and BaseLayout canonicals (GEO.md Iteration 1).
  trailingSlash: 'always',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        // Hash-only URLs are not routable pages; drafts never reach the build.
        if (page.includes('#')) return false;
        // Fetchable HTML fragments — not public landing pages.
        if (page.includes('/partials/')) return false;
        return true;
      },
      serialize(item) {
        const pathname = new URL(item.url).pathname;
        const lastmod = blogSitemapLastmod.get(pathname);
        if (lastmod) {
          return { ...item, lastmod };
        }
        return item;
      }
    })
  ]
});
