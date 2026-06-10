/** Allowed characters in CSS `object-position` values (keeps frontmatter safe for inline CSS vars). */
const OBJECT_POSITION_PATTERN = /^[\w\s%.-]+$/;

export type HeroImagePositionInput =
  | string
  | {
      mobile?: string;
      desktop?: string;
    };

export type ResolvedHeroImagePosition = {
  mobile: string;
  desktop?: string;
};

export function sanitizeObjectPosition(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !OBJECT_POSITION_PATTERN.test(trimmed)) return undefined;
  return trimmed;
}

/**
 * Resolve article hero crop anchors for `object-position`.
 * Shorthand string → desktop override; mobile stays `center` unless set explicitly.
 */
export function resolveHeroImagePosition(
  input: HeroImagePositionInput | undefined
): ResolvedHeroImagePosition | undefined {
  if (input == null) return undefined;

  if (typeof input === 'string') {
    const desktop = sanitizeObjectPosition(input);
    return desktop ? { mobile: 'center', desktop } : undefined;
  }

  const mobile = sanitizeObjectPosition(input.mobile) ?? 'center';
  const desktop = sanitizeObjectPosition(input.desktop);

  if (mobile === 'center' && !desktop) return undefined;

  return desktop ? { mobile, desktop } : { mobile };
}
