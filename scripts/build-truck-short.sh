#!/bin/bash
# Build a 9:16 vertical YouTube Short from product images + voiceover
set -e

VDIR="/home/ubuntu/.openclaw/workspace/videos"
IMGDIR="$VDIR/images"
AUDIO="$VDIR/truck-accessories-short-voiceover.mp3"
OUTPUT="$VDIR/best-truck-accessories-short.mp4"

# Get audio duration
DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$AUDIO")
echo "Audio duration: ${DURATION}s"

# Image order matching script segments:
# 1. Seat covers (71AJxAFaZqL) - "Starting with seat covers"
# 2. Tonneau covers (71fUeKtSoiL) - "tonneau covers"
# 3. Floor mats (61qHT5VB3NL) - "Floor mats"
# 4. Bed organizers (71LDXvYBaLL) - "Bed organizers"
# 5. Recovery gear (716yL7ENIjL) - "Recovery gear"
# 6. Dash cams (71qcGEEwGSL) - "Dash cam"
# 7. Phone mounts (61ICksnFZRL) - "phone mount"
# 8. Lift kits (71bRvuUJJhL) - "lift kit"

IMAGES=(
  "71AJxAFaZqL.jpg"
  "71fUeKtSoiL.jpg"
  "61qHT5VB3NL.jpg"
  "71LDXvYBaLL.jpg"
  "716yL7ENIjL.jpg"
  "71qcGEEwGSL.jpg"
  "61ICksnFZRL.jpg"
  "71bRvuUJJhL.jpg"
)

LABELS=(
  "SEAT COVERS"
  "TONNEAU COVERS"
  "FLOOR MATS"
  "BED ORGANIZERS"
  "RECOVERY GEAR"
  "DASH CAMS"
  "PHONE MOUNTS"
  "LIFT KITS"
)

NUM_IMAGES=${#IMAGES[@]}
# Each image gets equal time, ~5s each for 40s audio
SLIDE_DUR=$(echo "$DURATION / $NUM_IMAGES" | bc -l)
echo "Slide duration: ${SLIDE_DUR}s each, $NUM_IMAGES slides"

# Step 1: Prepare each image as 1080x1920 (9:16) with Ken Burns zoom + label
FILTER_COMPLEX=""
INPUTS=""
for i in "${!IMAGES[@]}"; do
  INPUTS="$INPUTS -loop 1 -t $SLIDE_DUR -i $IMGDIR/${IMAGES[$i]}"
done

# Build filter: scale each to fill 1080x1920, apply slow zoom, add text label, crossfade
FC=""
for i in "${!IMAGES[@]}"; do
  # Scale to fill 1080x1920 (crop center), then apply slow zoom (1.0 -> 1.08)
  ZOOM_START="1.0"
  ZOOM_END="1.08"
  FC="${FC}[$i:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='${ZOOM_START}+${ZOOM_END}*on/(25*${SLIDE_DUR})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=25*${SLIDE_DUR}:s=1080x1920:fps=25,drawtext=text='${LABELS[$i]}':fontsize=56:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-120:font=Sans[v$i]; "
done

# Crossfade between slides (0.5s transitions)
if [ $NUM_IMAGES -eq 1 ]; then
  FC="${FC}[v0]null[outv]"
else
  XFADE_DUR="0.5"
  # First crossfade
  OFFSET=$(echo "$SLIDE_DUR - $XFADE_DUR" | bc -l)
  FC="${FC}[v0][v1]xfade=transition=fade:duration=$XFADE_DUR:offset=$OFFSET[xf1]; "
  for ((i=2; i<NUM_IMAGES; i++)); do
    PREV_OFFSET=$OFFSET
    OFFSET=$(echo "$PREV_OFFSET + $SLIDE_DUR - $XFADE_DUR" | bc -l)
    PREV=$((i-1))
    FC="${FC}[xf$PREV][v$i]xfade=transition=fade:duration=$XFADE_DUR:offset=$OFFSET[xf$i]; "
  done
  LAST=$((NUM_IMAGES-1))
  FC="${FC}[xf$LAST]null[outv]"
fi

echo "Building video..."
ffmpeg -y $INPUTS -i "$AUDIO" \
  -filter_complex "$FC" \
  -map "[outv]" -map "${NUM_IMAGES}:a" \
  -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  -shortest \
  "$OUTPUT" 2>&1 | tail -20

echo ""
if [ -f "$OUTPUT" ]; then
  SIZE=$(du -h "$OUTPUT" | cut -f1)
  DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUTPUT")
  echo "✓ Output: $OUTPUT ($SIZE, ${DUR}s)"
else
  echo "✗ Build failed"
fi
