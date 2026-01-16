# Creature Quotes - Project Analysis

## Overview
A fun audio remix app that combines animal sounds with movie quotes. The app generates text-to-speech for quotes and sound effects for animals, then plays them in a sequential mashup with visual word highlighting and explosion effects.

## Current Architecture

### Frontend Stack
- **React 18.3.1** - UI framework
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool & dev server
- **Tailwind CSS 3.4.17** - Styling
- **shadcn/ui** - UI component library (Radix UI primitives)
- **React Router DOM 6.30.1** - Routing
- **Lucide React** - Icons

### Backend Stack
- **Supabase** - Backend-as-a-Service
  - Edge Functions (Deno runtime)
  - Only 2 functions:
    - `elevenlabs-tts` - Text-to-speech generation
    - `elevenlabs-sfx` - Sound effects generation

### AI Services
- **ElevenLabs API** - For both TTS and SFX generation
  - TTS: Converts movie quotes to speech
  - SFX: Generates animal sounds from prompts

### Audio Playback
- **HTML5 Audio API** (simple, no Web Audio API)
- Sequential playback:
  1. Initial animal sound (800ms)
  2. Full quote TTS with word-by-word highlighting
  3. Animal sounds overlay on randomly selected words (with explosion effect)
  4. Final animal sound (600ms)

### Key Components

#### `MashupPlayer.tsx`
- Main audio playback controller
- Generates TTS and SFX in parallel
- Manages word-by-word animation
- Randomly selects 1-2 words to replace with animal sounds
- Uses simple `Audio` elements (no mixing)

#### `CassetteTape.tsx`
- Visual cassette tape UI
- Shows spinning reels when playing
- Displays quote text and current word
- Animated tape strip between reels

#### `WordDisplay.tsx`
- Shows quote words with highlighting
- Indicates past/current/future words
- Highlights replaced words

#### `ExplosionEffect.tsx`
- Full-screen animation when animal sound replaces a word
- Shows "POW!" text and animal icon

### Data Structure

#### Animals (`animalSounds.ts`)
- 6 animals: Cow, Cat, Dog, Lion, Duck, Pig
- Each has: icon, colors, SFX prompt, voice settings

#### Quotes (`movieQuotes.ts`)
- 34 quotes from movies, TV shows, web series
- Includes classics like Terminator, Star Wars, Outer Banks

### User Flow
1. User selects an animal (from 6 options)
2. User enters/selects a movie quote
3. Clicks "MASH IT UP!"
4. App generates TTS and SFX in parallel
5. Plays sequential mashup with visual effects
6. Can randomize quote or use "CHAOS MODE" (random animal + quote)

## What Was Removed (Compared to Previous Version)

### Removed Components
- ❌ `gemini-director` Edge Function - AI director for intelligent audio composition
- ❌ `runtimeEngine.ts` - Web Audio API mixing engine
- ❌ `audioMixer.ts` - Audio mixing utilities
- ❌ `audioAnalyzer.ts` - Audio analysis for gaps/silence
- ❌ Web Audio API - No real-time audio processing
- ❌ Audio effects (reverb, distortion, echo, filters)
- ❌ Semantic reasoning for sound placement

### Current Limitations
- No intelligent sound placement (random word selection)
- No audio mixing (sequential playback only)
- No audio effects or processing
- Simple timing estimation (400ms per word)
- No gap detection or semantic alignment

## Current Tech Stack Summary

**Frontend:**
- React, TypeScript, Tailwind CSS, shadcn/ui, Vite, Lucide React

**Backend:**
- Supabase Edge Functions (Deno)

**AI:**
- ElevenLabs (TTS + SFX)

**Audio:**
- HTML5 Audio API (simple playback)

## Strengths
✅ Simple and straightforward architecture
✅ Fast parallel audio generation
✅ Engaging visual effects (explosions, word highlighting)
✅ Clean UI with retro cassette tape design
✅ No complex audio processing overhead

## Potential Improvements
- Add Web Audio API for real mixing (overlapping sounds)
- Better timing detection (use audio duration instead of estimates)
- More sophisticated word selection (not just random)
- Audio effects (reverb, pitch shifting)
- Save/share mashups
- More animals and quotes
