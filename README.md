# 🎬 Creature Quotes

The wildest audio remix app that blends random animal sounds with iconic movie quotes for hilariously absurd mashups! Choose your creature (lion roars, dog barks, cat meows) and pair it with legendary lines from The Terminator, Star Wars, The Dark Knight, and more.

## 🎯 How It Works

1. **Pick a Creature** - Select from 6 animals (cow, cat, dog, lion, duck, pig)
2. **Enter a Quote** - Type your own quote or use a random movie quote
3. **Mash It Up!** - The app generates:
   - Text-to-speech audio of your quote
   - Animal sound effects
   - A synchronized mashup with visual word highlighting
   - Explosion effects when animal sounds replace words

The app uses AI to generate realistic TTS and animal sounds, then mixes them together with precise timing using Web Audio API.

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Vite** - Build tool

### Backend
- **Supabase** - Edge Functions (Deno runtime)

### Audio
- **Web Audio API** - Audio mixing and playback
- **ElevenLabs API** - Text-to-speech and sound effects generation

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

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Features

- 🦁 6 different animals with unique sounds
- 🎬 30+ iconic movie quotes
- 🔊 Real-time audio mixing
- ✨ Visual word highlighting
- 💥 Explosion effects
- 🎲 Random quote generator
- 🌪️ Chaos mode (random animal + quote)

