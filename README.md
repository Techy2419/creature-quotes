# 🎬 Creature Quotes v2.0.0

The wildest audio remix app that blends random animal sounds with iconic movie quotes for hilariously absurd mashups! Choose your creature (lion roars, dog barks, cat meows) and pair it with legendary lines from The Terminator, Star Wars, The Dark Knight, and more.

## 🆕 What's New in v2.0.0

- **🌪️ Chaos Mode** - Gemini AI selects multiple words AND which animal sounds to use for each replacement
- **🎯 Smart Word Selection** - Gemini AI picks the funniest words to replace (both normal and chaos mode)
- **🎨 Enhanced UI** - Visual indicators showing which animals Gemini selected in chaos mode
- **🔊 Improved Audio** - All audio uses Web Audio API for precise timing and mixing
- **📝 Better Code Quality** - Cleaned up console logs and improved code comments

## 🎯 How It Works

### Normal Mode
1. **Pick a Creature** - Select from 6 animals (cow, cat, dog, lion, duck, pig)
2. **Enter a Quote** - Type your own quote or use a random movie quote
3. **Mash It Up!** - The app:
   - Uses **Gemini AI** to pick the funniest word to replace (fast, < 1 second)
   - Generates TTS for the quote parts using **ElevenLabs Turbo** (2-3 seconds)
   - Plays real animal sounds from local files (instant playback)
   - Creates a synchronized mashup: Animal → Quote Part 1 → Animal → Quote Part 2 → Animal
   - Shows visual word highlighting and explosion effects

### Chaos Mode 🌪️
1. **Click Chaos Mode** - Randomly selects a quote
2. **Gemini AI Magic** - Gemini picks 2-4 words to replace AND which animal sound to use for each
3. **Multi-Animal Mashup** - Each replacement gets its own animal sound, creating a wild interleaved audio experience
4. **Visual Feedback** - UI shows which animals Gemini selected for each word

**Total generation time: 3-4 seconds** (vs 10-20 seconds before) 🚀

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Vite** - Build tool

### Backend
- **Supabase** - Edge Functions (Deno runtime)

### AI & Audio
- **Gemini 2.5 Flash Lite** - Smart word selection (< 1 second, stable model)
  - Normal mode: Selects one word to replace
  - Chaos mode: Selects multiple words AND which animal sound to use for each
- **ElevenLabs Turbo v2.5** - Fast text-to-speech generation (2-3 seconds)
- **Local MP3 files** - Animal sounds hosted locally (instant playback, no network delays)
- **Web Audio API** - Precise audio mixing and playback (all sounds use Web Audio API)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

### Supabase Edge Function Secrets

Set the following secrets in your Supabase project (Dashboard → Edge Functions → Secrets):

```
GEMINI_API_KEY=your_gemini_api_key  # Required for smart word selection (normal & chaos mode)
ELEVENLABS_API_KEY=your_elevenlabs_api_key  # Required for TTS generation
```

### Deploy Edge Functions

Deploy the following edge functions to Supabase:

```bash
# Deploy Gemini word selection (normal mode)
supabase functions deploy gemini-word-select

# Deploy Gemini chaos selection (chaos mode - selects multiple words + animals)
supabase functions deploy gemini-chaos-select

# Deploy ElevenLabs TTS
supabase functions deploy elevenlabs-tts
```

### Animal Sound Files

Add MP3 files to `public/sounds/` directory:
- `cow.mp3`, `cat.mp3`, `dog.mp3`, `lion.mp3`, `duck.mp3`, `pig.mp3`

See `public/sounds/README.md` for details on where to get sound files.

**Note:** If sound files are missing, the app will log warnings and continue playback without animal sounds.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Features

- 🦁 6 different animals with unique sounds
- 🎬 95+ iconic movie quotes (MCU, Harry Potter, Outer Banks, Stranger Things, and more)
- 🔊 Real-time audio mixing with Web Audio API
- ✨ Visual word highlighting synchronized with audio
- 💥 Explosion effects with correct animal icons
- 🎲 Random quote generator (avoids duplicates)
- 🌪️ **Chaos Mode** - Gemini AI selects multiple words AND animals for maximum chaos
- 🎯 Smart word selection using Gemini AI (avoids articles/prepositions)
- ⚡ Fast generation (3-4 seconds total)

