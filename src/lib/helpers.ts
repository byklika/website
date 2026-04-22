/**
 * Joins CSS class names, omitting falsy values (undefined, null, false, "").
 */
export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(' ');
}
