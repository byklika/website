import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default [
  // Base JS recommendations
  js.configs.recommended,

  // TypeScript (type-aware rules are intentionally off for speed)
  ...tseslint.configs.recommended,

  // Astro + Astro-in-TS support
  ...astro.configs.recommended,

  {
    ignores: ['dist/', '.astro/', 'node_modules/']
  },

  {
    files: ['**/*.astro'],
    rules: {
      // Let Prettier handle formatting concerns
      'astro/no-set-html-directive': 'off'
    }
  }
	,
	// Node/config files (ESM configs still use process/env; Tailwind config uses require())
	{
		files: ['astro.config.mjs', 'tailwind.config.mjs', 'scripts/**/*.mjs', 'eslint.config.js'],
		languageOptions: {
			globals: {
				process: 'readonly',
				console: 'readonly',
				require: 'readonly',
				module: 'readonly'
			}
		},
		rules: {
			'no-undef': 'off',
			'@typescript-eslint/no-require-imports': 'off'
		}
	}
];
