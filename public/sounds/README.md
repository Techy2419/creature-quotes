# Animal Sound Files

This directory should contain MP3 files for animal sounds used in the mashup player.

## Required Files

Add the following MP3 files to this directory:

- `cow.mp3` - Cow mooing sound
- `cat.mp3` - Cat meowing sound
- `dog.mp3` - Dog barking sound
- `lion.mp3` - Lion roaring sound
- `duck.mp3` - Duck quacking sound
- `pig.mp3` - Pig oinking/snorting sound

## Where to Get Sound Files

You can download free animal sound effects from:

- **Mixkit** - https://mixkit.co/free-sound-effects/animals/
- **Zapsplat** - https://www.zapsplat.com/sound-effect-category/animals/
- **Freesound** - https://freesound.org/browse/tags/animals/

## File Requirements

- Format: MP3
- Duration: 0.5-2 seconds recommended
- Quality: 44.1kHz, 128kbps or higher
- Size: Keep files small (< 500KB each) for fast loading

## Notes

- If a sound file is missing, the app will log a warning and continue playback without that animal sound
- The app uses Web Audio API to play these sounds, so they can be stopped/paused properly
- Files are served from the `public` directory, so they're accessible at `/sounds/filename.mp3`
