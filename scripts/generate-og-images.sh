#!/usr/bin/env bash
# Dựng ảnh Open Graph 1200×630 cho VI/EN từ brand assets có sẵn:
# icon public/icons/kim-tai-app-icon.png + bảng màu thương hiệu trong globals.css.
# Yêu cầu ImageMagick 7 và font hệ thống hỗ trợ tiếng Việt (Arial trên macOS).
set -euo pipefail

cd "$(dirname "$0")/.."

ICON="public/icons/kim-tai-app-icon.png"
OUT_DIR="public/images/og"
BACKGROUND="#102a24"
CREAM="#f6f1e8"
GOLD="#d6b668"
TITLE_FONT="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
BODY_FONT="/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
[ -f "$TITLE_FONT" ] || TITLE_FONT="/Library/Fonts/Arial Bold.ttf"
[ -f "$BODY_FONT" ] || BODY_FONT="/Library/Fonts/Arial Unicode.ttf"

mkdir -p "$OUT_DIR"

rounded_icon_base="$(mktemp -t kim-tai-og-icon)"
rounded_icon="${rounded_icon_base}.png"
trap 'rm -f "$rounded_icon_base" "$rounded_icon"' EXIT

magick "$ICON" -resize 300x300 \
  \( -size 300x300 xc:none -draw "roundrectangle 0,0,299,299,48,48" \) \
  -compose DstIn -composite "$rounded_icon"

generate() {
  local output="$1" tagline="$2"
  magick -size 1200x630 "xc:${BACKGROUND}" \
    \( -size 1200x10 "xc:${GOLD}" \) -geometry +0+620 -composite \
    "$rounded_icon" -geometry +96+165 -composite \
    -font "$TITLE_FONT" -pointsize 78 -fill "$CREAM" \
    -annotate +466+280 "Kim Tài" \
    -font "$TITLE_FONT" -pointsize 44 -fill "$GOLD" \
    -annotate +470+348 "Tick Vàng Online" \
    -font "$BODY_FONT" -pointsize 30 -fill "$CREAM" \
    -annotate +470+430 "$tagline" \
    "$output"
}

generate "$OUT_DIR/kim-tai-og-vi.png" "Sổ vàng trong túi bạn"
generate "$OUT_DIR/kim-tai-og-en.png" "Your gold book, in your pocket"

magick identify "$OUT_DIR/kim-tai-og-vi.png" "$OUT_DIR/kim-tai-og-en.png"
