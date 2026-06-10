/** @type {import('lint-staged').Config} */
export default {
  '*.{js,jsx,ts,tsx,mjs,cjs,json,yml,yaml,md,mdx,css,scss,astro}': (files) => {
    const toFormat = files.filter((file) => !file.endsWith('src/data/blogPlaceholders.ts'));
    return toFormat.map((file) => `prettier --write ${file}`);
  }
};
