#!/bin/bash
# Build v2 YouTube Short — fixed per Mitch feedback
# - Bartact seat cover image (not generic)
# - No phone mounts, no dash cams
# - Added grab handles + WARN winch (using recovery gear image relabeled)
# - Timed to match voiceover segments
set -e

VDIR="/home/ubuntu/.openclaw/workspace/videos"
IMGDIR="$VDIR/images"
AUDIO="$VDIR/truck-accessories-v2-voiceover.mp3"
OUTPUT="$VDIR/best-truck-accessories-v2.mp4"

DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$AUDIO")
echo "Audio duration: ${DURATION}s"

# 7 slides timed to match voiceover segments:
# 1. Bartact seat covers (0-7s) "Starting with seat covers. Bartact makes the best..."
# 2. Tonneau covers (7-12s) "Tonneau covers keep your gear dry..."
# 3. Floor mats (12-17s) "Floor mats, WeatherTech or custom fit"
# 4. Bed organizers (17-22s) "Bed organizers make your truck bed..."
# 5. Recovery/WARN winch (22-28s) "Recovery gear, a WARN winch changes everything..."
# 6. Grab handles (28-33s) "Grab handles, Bartact paracord handles..."
# 7. Lift kits (33-40s) "And if you run off-road, a lift kit..."

IMAGES=(
  "bartact-seat-cover.jpg"
  "71fUeKtSoiL.jpg"
  "61qHT5VB3NL.jpg"
  "71LDXvYBaLL.jpg"
  "716yL7ENIjL.jpg"
  "bartact-grab-handles.jpg"
  "71bRvuUJJhL.jpg"
)

LABELS=(
  "BARTACT SEAT COVERS"
  "TONNEAU COVERS"
  "FLOOR MATS"
  "BED ORGANIZERS"
  "WARN WINCH"
  "GRAB HANDLES"
  "LIFT KITS"
)

# Custom durations to sync with voiceover
DURATIONS=(7.0 5.0 5.0 5.0 6.0 5.0 6.7)

NUM_IMAGES=${#IMAGES[@]}
echo "$NUM_IMAGES slides with custom timing"

# Build ffmpeg filter
INPUTS=""
FC=""
for i in "${!IMAGES[@]}"; do
  DUR=${DURATIONS[$i]}
  INPUTS="$INPUTS -loop 1 -t $DUR -i $IMGDIR/${IMAGES[$i]}"
  FC="${FC}[$i:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='1.0+0.08*on/(25*${DUR})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=25*${DUR}:s=1080x1920:fps=25,drawtext=text='${LABELS[$i]}':fontsize=56:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-120:font=Sans[v$i]; "
done

# Crossfade
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
  "$OUTPUT" 2>&1 | tail -10

if [ -f "$OUTPUT" ]; then
  SIZE=$(du -h "$OUTPUT" | cut -f1)
  DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUTPUT")
  echo "✓ Output: $OUTPUT ($SIZE, ${DUR}s)"
else
  echo "✗ Build failed"
fi
