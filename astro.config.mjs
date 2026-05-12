// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // Used for canonical URLs and Open Graph absolute links. Override per deploy with PUBLIC_SITE_URL.
  site: process.env.PUBLIC_SITE_URL || 'https://byklika.com',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [mdx()]
});
