/** @type {import('prettier').Config} */
export default {
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'none',
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  astroAllowShorthand: true,
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro'
      }
    }
  ]
};
