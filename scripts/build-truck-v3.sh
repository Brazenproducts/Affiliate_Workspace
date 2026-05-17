#!/bin/bash
# Build v3 YouTube Short — multi-brand credible roundup
set -e

VDIR="/home/ubuntu/.openclaw/workspace/videos"
IMGDIR="$VDIR/images"
AUDIO="$VDIR/truck-accessories-v3-voiceover.mp3"
OUTPUT="$VDIR/best-truck-accessories-v3.mp4"

DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$AUDIO")
echo "Audio duration: ${DURATION}s"

# 6 slides timed to voiceover:
# 1. Bartact seat covers (0-7s) "Starting with seat covers. Bartact..."
# 2. Tonneau covers (7-13s) "Tonneau covers keep your gear dry..."
# 3. Carli Suspension (13-20s) "For suspension, Carli is the gold standard..."
# 4. WARN Winch (20-26s) "A WARN winch is a must..."
# 5. Method Race Wheels (26-31s) "Method Race Wheels..."
# 6. Floor mats (31-37s) "Floor mats, WeatherTech..."

IMAGES=(
  "bartact-seat-cover.jpg"
  "71fUeKtSoiL.jpg"
  "carli-suspension.jpg"
  "warn-winch.jpg"
  "method-wheels.jpg"
  "61qHT5VB3NL.jpg"
)

LABELS=(
  "BARTACT SEAT COVERS"
  "TONNEAU COVERS"
  "CARLI SUSPENSION"
  "WARN WINCH"
  "METHOD RACE WHEELS"
  "FLOOR MATS"
)

DURATIONS=(7.0 6.0 7.0 6.0 5.0 5.8)

NUM_IMAGES=${#IMAGES[@]}
echo "$NUM_IMAGES slides"

INPUTS=""
FC=""
for i in "${!IMAGES[@]}"; do
  DUR=${DURATIONS[$i]}
  INPUTS="$INPUTS -loop 1 -t $DUR -i $IMGDIR/${IMAGES[$i]}"
  FC="${FC}[$i:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='1.0+0.08*on/(25*${DUR})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=25*${DUR}:s=1080x1920:fps=25,drawtext=text='${LABELS[$i]}':fontsize=56:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-120:font=Sans[v$i]; "
done

XFADE_DUR="0.5"
OFFSET=$(echo "${DURATIONS[0]} - $XFADE_DUR" | bc -l)
FC="${FC}[v0][v1]xfade=transition=fade:duration=$XFADE_DUR:offset=$OFFSET[xf1]; "
for ((i=2; i<NUM_IMAGES; i++)); do
  PREV=$((i-1))
  OFFSET=$(echo "$OFFSET + ${DURATIONS[$i-1]} - $XFADE_DUR" | bc -l)
  FC="${FC}[xf$PREV][v$i]xfade=transition=fade:duration=$XFADE_DUR:offset=$OFFSET[xf$i]; "
done
LAST=$((NUM_IMAGES-1))
FC="${FC}[xf$LAST]null[outv]"

echo "Building video..."
ffmpeg -y $INPUTS -i "$AUDIO" \
  -filter_complex "$FC" \
  -map "[outv]" -map "${NUM_IMAGES}:a" \
  -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  -shortest \
  "$OUTPUT" 2>&1 | tail -5

if [ -f "$OUTPUT" ]; then
  SIZE=$(du -h "$OUTPUT" | cut -f1)
  DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUTPUT")
  echo "✓ Output: $OUTPUT ($SIZE, ${DUR}s)"
else
  echo "✗ Build failed"
fi
