#!/usr/bin/env sh
# Regenerate responsive hero assets for the homepage.
# Master (not served): src/assets/images/hero/<name>-original.png
# Served derivatives: public/images/hero/<name>-{width}w.{avif,webp,jpg}
#
# Requires:
#   - cwebp (e.g. brew install webp)
#   - magick (ImageMagick with AVIF write support, e.g. brew install imagemagick)

set -eu
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
NAME="home-hero-instructional-design"
SRC="${ROOT}/src/assets/images/hero/${NAME}-original.png"
OUT_DIR="${ROOT}/public/images/hero"
BASE="${OUT_DIR}/${NAME}"

WEBP_Q=70
JPEG_Q=76
AVIF_Q=50
WIDTHS="480 640 960 1280"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp not found. Install WebP tools (e.g. brew install webp)." >&2
  exit 1
fi

if ! command -v magick >/dev/null 2>&1; then
  echo "magick not found. Install ImageMagick (e.g. brew install imagemagick)." >&2
  exit 1
fi

if [ ! -f "$SRC" ]; then
  echo "Missing source image: $SRC" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

for w in $WIDTHS; do
  magick "$SRC" -resize "${w}x" -strip -quality "$AVIF_Q" "${BASE}-${w}w.avif"
  echo "Wrote ${BASE}-${w}w.avif"
done

for w in $WIDTHS; do
  cwebp -quiet -q "$WEBP_Q" -resize "$w" 0 "$SRC" -o "${BASE}-${w}w.webp"
  echo "Wrote ${BASE}-${w}w.webp"
done

for w in $WIDTHS; do
  magick "$SRC" -resize "${w}x" -strip -quality "$JPEG_Q" "${BASE}-${w}w.jpg"
  echo "Wrote ${BASE}-${w}w.jpg"
done
