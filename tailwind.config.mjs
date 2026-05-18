import typography from '@tailwindcss/typography';
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      screens: {
        /** Extra desktop tiers (default `xl`/`2xl` remain 1280 / 1536) */
        '3xl': '1920px',
        '4xl': '2560px'
      },
      colors: {
        klika: {
          moss: '#4A6741',
          moss2: '#628A57',
          coral: '#F26A3A',
          cream: '#F2F5EE',
          dark: '#1E2A1A',
          white: '#ffffff',

          // one-off/supporting tones found in the HTML sketch
          ink: '#3a4a36',
          sage: '#4a5a45',
          mist: '#eaefe3',
          sand: '#d4c5b0',
          muted: '#9aab94',
          muted2: '#8aa082',
          coralHover: '#e05a28'
        }
      },
      fontFamily: {
        /** System stack until self-hosted webfonts ship from `src` (avoids missing-font fallbacks). */
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['ui-serif', 'Georgia', 'serif'],
        mitr: ['Mitr', 'sans-serif']
      },
      borderRadius: {
        pill: '99px'
      },
      backgroundImage: {
        'klika-hero': 'linear-gradient(135deg, #F2F5EE 0%, #eaefe3 100%)'
      },
      boxShadow: {
        nav: '0 2px 16px rgba(0,0,0,0.15)',
        card: '0 8px 32px rgba(30,42,26,0.08)',
        cardHover: '0 16px 48px rgba(30,42,26,0.14)',
        btnPrimary: '0 4px 14px rgba(242,106,58,0.28)',
        btnPrimaryHover: '0 8px 24px rgba(242,106,58,0.38)',
        heroImage: '0 24px 60px rgba(30,42,26,0.14)',
        heroImage2xl: '0 28px 72px rgba(30,42,26,0.12)',
        cardXl: '0 20px 56px rgba(30,42,26,0.1)'
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        morphBlob: {
          '0%': { borderRadius: '61% 39% 52% 48%/44% 58% 42% 56%' },
          '33%': { borderRadius: '42% 58% 37% 63%/60% 40% 58% 40%' },
          '66%': { borderRadius: '55% 45% 65% 35%/35% 65% 44% 56%' },
          '100%': { borderRadius: '61% 39% 52% 48%/44% 58% 42% 56%' }
        }
      },
      animation: {
        fadeUp: 'fadeUp 900ms ease both',
        marquee: 'marquee 22s linear infinite',
        morphBlob: 'morphBlob 14s ease-in-out infinite'
      }
    }
  },
  plugins: [typography, daisyui],
  daisyui: {
    /** Blog uses Daisy components with `data-theme="light"` only — drop unused theme CSS. */
    themes: ['light']
  }
};
