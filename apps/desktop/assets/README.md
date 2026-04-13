# Icons

Place two .ico files here before building:

- `icon-connected.ico` — shown when the agent is connected to Supabase Realtime
- `icon-disconnected.ico` — shown when disconnected or connecting

## Quick way to generate icons

1. Create a 256x256 PNG (e.g. a green power symbol for connected, grey for disconnected)
2. Convert to .ico using https://convertio.co/png-ico/ or ImageMagick:
   `magick input.png -resize 256x256 output.ico`

## Minimum size
16x16 is the minimum — Windows displays tray icons at 16x16 or 32x32.
A multi-size .ico with 16, 32, 48, and 256px frames works best.
