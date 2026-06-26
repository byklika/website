/**
 * Tailwind `screens` — single source for HTML `sizes=` attrs and other non-class breakpoints.
 * Keep `3xl` / `4xl` in sync with `tailwind.config.mjs` `theme.extend.screens`.
 * Defaults (`sm`–`2xl`) match Tailwind v4 built-ins.
 */
export const tailwindScreens = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
  '4xl': '2560px'
} as const;

export type TailwindScreen = keyof typeof tailwindScreens;

/** Build a `(min-width: …)` fragment for responsive `sizes` attributes. */
export function minWidthScreen(screen: TailwindScreen): string {
  return `(min-width: ${tailwindScreens[screen]})`;
}
