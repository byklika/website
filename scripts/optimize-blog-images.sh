#!/usr/bin/env sh
# Regenerate responsive blog image derivatives.
# Usage: optimize-blog-images.sh [entry-id]
#   entry-id e.g. onboarding-que-funciona
#   Omit entry-id to process every *-original.png under src/assets/images/blog/
#
# Master (not served): src/assets/images/blog/{entryId}-original.png
# Served derivatives:   public/images/blog/{entryId}-{width}w.{avif,webp,jpg}
#
# Widths: 400 640 960 1280 — keep in sync with blogImageWidths in src/data/blogImageContract.ts
#
# Requires:
#   - cwebp (e.g. brew install webp)
#   - magick (ImageMagick with AVIF write support, e.g. brew install imagemagick)

set -eu
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
BLOG_ASSETS="${ROOT}/src/assets/images/blog"
OUT_ROOT="${ROOT}/public/images/blog"

WEBP_Q=70
JPEG_Q=76
AVIF_Q=50
WIDTHS="400 640 960 1280"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp not found. Install WebP tools (e.g. brew install webp)." >&2
  exit 1
fi

if ! command -v magick >/dev/null 2>&1; then
  echo "magick not found. Install ImageMagick (e.g. brew install imagemagick)." >&2
  exit 1
fi

process_entry() {
  entry_id="$1"
  src="${BLOG_ASSETS}/${entry_id}-original.png"
  out_dir="${OUT_ROOT}/$(dirname -- "$entry_id")"
  base="${OUT_ROOT}/${entry_id}"

  if [ ! -f "$src" ]; then
    echo "Missing source image: $src" >&2
    return 1
  fi

  mkdir -p "$out_dir"

  for w in $WIDTHS; do
    magick "$src" -resize "${w}x" -strip -quality "$AVIF_Q" "${base}-${w}w.avif"
    echo "Wrote ${base}-${w}w.avif"
  done

  for w in $WIDTHS; do
    cwebp -quiet -q "$WEBP_Q" -resize "$w" 0 "$src" -o "${base}-${w}w.webp"
    echo "Wrote ${base}-${w}w.webp"
  done

  for w in $WIDTHS; do
    magick "$src" -resize "${w}x" -strip -quality "$JPEG_Q" "${base}-${w}w.jpg"
    echo "Wrote ${base}-${w}w.jpg"
  done
}

if [ "$#" -gt 0 ]; then
  process_entry "$1"
  exit 0
fi

if [ ! -d "$BLOG_ASSETS" ]; then
  echo "No blog masters directory: $BLOG_ASSETS" >&2
  exit 1
fi

masters="$(find "$BLOG_ASSETS" -name '*-original.png' | sort)"
if [ -z "$masters" ]; then
  echo "No *-original.png masters found under $BLOG_ASSETS" >&2
  exit 1
fi

echo "$masters" | while IFS= read -r src; do
  rel="${src#"${BLOG_ASSETS}/"}"
  entry_id="${rel%-original.png}"
  process_entry "$entry_id"
done
