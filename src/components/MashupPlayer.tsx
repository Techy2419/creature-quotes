import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AnimalSound, animalSounds, getRandomAnimal } from "@/data/animalSounds";
import { CassetteTape } from "./CassetteTape";
import { WordDisplay } from "./WordDisplay";
import { ExplosionEffect } from "./ExplosionEffect";
import { getAudioManager, WebAudioManager } from "@/utils/webAudio";

interface MashupPlayerProps {
  selectedAnimal: AnimalSound | null;
  selectedQuote: string;
  onRandomize: () => void;
  onChaosMode: () => void;
  isChaosMode?: boolean; // Flag to indicate chaos mode is active
  onChaosModeComplete?: () => void; // Callback when chaos mode playback finishes
  onChaosSelections?: (selections: Array<{ index: number; animal: AnimalSound }>) => void; // Callback to pass chaos selections to parent
}

interface MashupParts {
  before: string;
  replacedWord: string;
  after: string;
  wordIndex: number;
}

export const MashupPlayer = ({
  selectedAnimal,
  selectedQuote,
  onRandomize,
  onChaosMode,
  isChaosMode = false,
  onChaosModeComplete,
  onChaosSelections,
}: MashupPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [replacedIndices, setReplacedIndices] = useState<number[]>([]);
  const [showExplosion, setShowExplosion] = useState(false);
  const [explosionWord, setExplosionWord] = useState("");
  const [explosionAnimal, setExplosionAnimal] = useState<AnimalSound | null>(null);
  const [chaosSelections, setChaosSelections] = useState<Array<{ index: number; animal: AnimalSound }>>([]);

  const audioManagerRef = useRef<WebAudioManager | null>(null);
  const animalBufferCache = useRef<Map<string, AudioBuffer>>(new Map());
  const ttsUrlsRef = useRef<string[]>([]);

  // In chaos mode, selectedAnimal can be null initially (Gemini picks the animals)
  // In normal mode, we need selectedAnimal to be set
  const canPlay = selectedQuote.trim().length > 0 && (isChaosMode || selectedAnimal);

  useEffect(() => {
    audioManagerRef.current = getAudioManager();
    audioManagerRef.current.init();

    return () => {
      stopPlayback(true);
    };
  }, []);

  /** --- GEMINI Word Selection --- */
  // Calls our edge function to get Gemini to pick which word to replace
  const getWordIndexToReplace = async (quote: string, animalName: string): Promise<number | null> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-word-select`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ quote, animalName }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error("Gemini API failed");
      }

      const data = await response.json();
      const index = data.index;
      
      if (typeof index !== "number" || index < 0) {
        throw new Error("Invalid index from Gemini");
      }

      return index;
    } catch (error) {
      // Fallback to middle word if Gemini fails - better than nothing
      const wordsArr = quote.split(/\s+/);
      const fallbackIndex = wordsArr.length ? Math.floor(wordsArr.length / 2) : null;
      return fallbackIndex;
    }
  };

  /** --- Split Quote --- */
  // Splits the quote into before/after parts based on which word we're replacing
  const createMashupParts = (quote: string, wordIndex: number): MashupParts | null => {
    const wordsArr = quote.split(/\s+/);
    if (!wordsArr.length) return null;
    if (wordIndex < 0 || wordIndex >= wordsArr.length) wordIndex = Math.floor(wordsArr.length / 2);

    return {
      before: wordsArr.slice(0, wordIndex).join(" "),
      replacedWord: wordsArr[wordIndex],
      after: wordsArr.slice(wordIndex + 1).join(" "),
      wordIndex,
    };
  };

  /** --- Get Multiple Word Indices + Animal Sounds for Chaos Mode (using Gemini) --- */
  // Chaos mode: Gemini picks multiple words AND which animal sound to use for each
  // Way cooler than normal mode where we just pick one word
  const getChaosSelections = async (quote: string, quoteWords: string[]): Promise<Array<{ index: number; animal: AnimalSound }>> => {
    if (quoteWords.length <= 2) {
      // Too short for chaos mode, just use fallback
      const fallbackAnimal = selectedAnimal || getRandomAnimal();
      return [{ index: Math.floor(quoteWords.length / 2), animal: fallbackAnimal }];
    }
    
    try {
      // Get list of available animal names to send to Gemini
      const availableAnimals = animalSounds.map(a => a.name);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chaos-select`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            quote,
            availableAnimals,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error("Gemini Chaos API failed");
      }

      const data = await response.json();
      const selections = data.selections || [];
      
      if (!Array.isArray(selections) || selections.length < 2) {
        throw new Error("Invalid selections from Gemini");
      }

      // Map animal names from Gemini response to actual AnimalSound objects
      const mappedSelections: Array<{ index: number; animal: AnimalSound }> = [];
      for (const sel of selections) {
        const animal = animalSounds.find(a => a.name === sel.animal);
        if (animal && sel.index >= 0 && sel.index < quoteWords.length) {
          mappedSelections.push({ index: sel.index, animal });
        }
      }

      if (mappedSelections.length < 2) {
        throw new Error("Not enough valid selections");
      }

      // Sort by index so we process them in order
      mappedSelections.sort((a, b) => a.index - b.index);

      return mappedSelections;
    } catch (error) {
      // Fallback: use random selection if Gemini fails
      const numReplacements = Math.min(
        Math.floor(Math.random() * 3) + 2,
        Math.floor(quoteWords.length / 2)
      );
      
      const fallbackAnimal = selectedAnimal || getRandomAnimal();
      // Blacklist common words that aren't fun to replace (articles, prepositions, etc)
      const blacklist = new Set(["the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "with", "for", "from"]);
      const candidates = quoteWords
        .map((w, i) => ({
          word: w.replace(/[^\w]/g, "").toLowerCase(),
          index: i,
        }))
        .filter(({ word }) => word.length > 2 && !blacklist.has(word))
        .map(({ index }) => index);
      
      // Use candidates if we have enough, otherwise just use all words
      const pool = candidates.length >= numReplacements ? candidates : quoteWords.map((_, i) => i);
      const fallbackSelections: Array<{ index: number; animal: AnimalSound }> = [];
      const usedIndices = new Set<number>();
      
      // Randomly pick words until we have enough
      while (fallbackSelections.length < numReplacements && pool.length > 0) {
        const randomIdx = Math.floor(Math.random() * pool.length);
        const wordIndex = pool.splice(randomIdx, 1)[0];
        if (!usedIndices.has(wordIndex)) {
          // Use same animal for all fallback selections (simpler than picking different ones)
          fallbackSelections.push({ index: wordIndex, animal: fallbackAnimal });
          usedIndices.add(wordIndex);
        }
      }
      
      fallbackSelections.sort((a, b) => a.index - b.index);
      return fallbackSelections;
    }
  };

  /** --- ElevenLabs TTS --- */
  // Generates text-to-speech audio using ElevenLabs API via our edge function
  const generateTTS = async (text: string, animal: AnimalSound): Promise<string | null> => {
    if (!text.trim()) return null;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: text.trim(),
            voiceId: "ssKAEhdevSPzKs37U6qX",
            modelId: "eleven_turbo_v2_5",
            voiceSettings: {
              stability: animal.voiceSettings.stability,
              similarity_boost: animal.voiceSettings.similarity_boost,
              style: 0.5,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) throw new Error("TTS generation failed");
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      ttsUrlsRef.current.push(audioUrl); // Track for cleanup later
      return audioUrl;
    } catch (error) {
      return null;
    }
  };

  /** --- Load AudioBuffer --- */
  // Loads audio from URL and converts it to AudioBuffer for Web Audio API
  const loadAudioBuffer = async (url: string): Promise<AudioBuffer | null> => {
    if (!audioManagerRef.current) return null;
    try {
      return await audioManagerRef.current.loadAudio(url);
    } catch (error) {
      return null;
    }
  };

  /** --- Play Buffer with Web Audio API --- */
  // Plays an AudioBuffer and waits for it to finish
  const playAudioBuffer = async (
    buffer: AudioBuffer,
    { startTime, offset, duration, volume }: { startTime?: number; offset?: number; duration?: number; volume?: number } = {}
  ): Promise<void> => {
    if (!audioManagerRef.current) return;
    const audioManager = audioManagerRef.current;
    const now = audioManager.getCurrentTime();
    const sTime = startTime ?? now;
    const dur = duration ?? buffer.duration;

    const { source } = audioManager.playBuffer(buffer, { startTime: sTime, offset: offset ?? 0, duration: dur, volume: volume ?? 1.0 });
    await new Promise(resolve => setTimeout(resolve, dur * 1000));
  };

  /** --- Play Buffer with Word Highlighting (synchronized) --- */
  // Plays audio AND highlights words at the same time - keeps them in sync
  const playAudioBufferWithHighlighting = async (
    buffer: AudioBuffer,
    wordStart: number,
    wordEnd: number,
    { startTime, offset, duration, volume }: { startTime?: number; offset?: number; duration?: number; volume?: number } = {}
  ): Promise<void> => {
    if (!audioManagerRef.current) return;
    const audioManager = audioManagerRef.current;
    const now = audioManager.getCurrentTime();
    const sTime = startTime ?? now;
    const dur = duration ?? buffer.duration;

    // Start playing audio immediately
    audioManager.playBuffer(buffer, { startTime: sTime, offset: offset ?? 0, duration: dur, volume: volume ?? 1.0 });

    // Highlight words simultaneously while audio plays - calculate timing per word
    const wordCount = wordEnd - wordStart;
    if (wordCount > 0) {
      const perWordMs = (dur / wordCount) * 1000;
      for (let i = wordStart; i < wordEnd; i++) {
        setCurrentWordIndex(i);
        await new Promise(resolve => setTimeout(resolve, perWordMs));
      }
    } else {
      // No words to highlight, just wait for audio to finish
      await new Promise(resolve => setTimeout(resolve, dur * 1000));
    }
  };

  /** --- Play Animal Sound (cached) --- */
  // Plays animal sound files - caches them so we don't reload every time
  const playAnimalSound = async (soundUrl: string, maxDuration?: number): Promise<void> => {
    if (!audioManagerRef.current) return;

    // Check cache first - way faster than loading every time
    let buffer = animalBufferCache.current.get(soundUrl);
    if (!buffer) {
      buffer = await loadAudioBuffer(soundUrl);
      if (!buffer) return;
      animalBufferCache.current.set(soundUrl, buffer);
    }

    // Play full sound by default, or cap at maxDuration if provided (like duck sounds)
    const duration = maxDuration ? Math.min(maxDuration, buffer.duration) : buffer.duration;
    await playAudioBuffer(buffer, { duration, volume: 1 });
  };

  /** --- Highlight words in sync with TTS --- */
  // Highlights words one by one based on audio duration - keeps it synced
  const highlightWords = async (start: number, end: number, bufferDuration: number) => {
    const count = end - start;
    if (count <= 0) return;
    const perWordMs = (bufferDuration / count) * 1000;
    for (let i = start; i < end; i++) {
      setCurrentWordIndex(i);
      await new Promise(r => setTimeout(r, perWordMs));
    }
  };

  /** --- Stop Playback & Cleanup --- */
  // Stops all audio and cleans up blob URLs to prevent memory leaks
  const stopPlayback = (cleanupOnly = false) => {
    if (audioManagerRef.current) audioManagerRef.current.stopAll();
    // Revoke blob URLs so browser can free up memory
    ttsUrlsRef.current.forEach(URL.revokeObjectURL);
    ttsUrlsRef.current = [];

    if (!cleanupOnly) {
      setIsPlaying(false);
      setIsGenerating(false);
      setShowExplosion(false);
      setCurrentWordIndex(-1);
      setWords([]);
      setReplacedIndices([]);
    }
  };

  /** --- Chaos Mode Playback (Multiple Animal Sounds Interleaved) --- */
  // This is where the magic happens - plays multiple animal sounds throughout the quote
  // Each replacement gets its own animal sound (picked by Gemini)
  const playChaosMashup = async (
    quoteWords: string[], 
    selections: Array<{ index: number; animal: AnimalSound }>
  ) => {
    if (!audioManagerRef.current || selections.length === 0) return;
    
    const replacementIndices = selections.map(s => s.index);
    setReplacedIndices(replacementIndices);
    
    // Build segments: text chunks BETWEEN replacements (not including replaced words)
    // Structure: [segment before first replacement] -> [animal] -> [segment between replacements] -> [animal] -> ... -> [final segment]
    const segments: Array<{ text: string; startWord: number; endWord: number; afterReplaceIndex?: number }> = [];
    
    // Add segment before first replacement (if any words before first replacement)
    if (replacementIndices[0] > 0) {
      const segmentText = quoteWords.slice(0, replacementIndices[0]).join(" ");
      segments.push({
        text: segmentText,
        startWord: 0,
        endWord: replacementIndices[0],
      });
    }
    
    // Add segments between consecutive replacements
    for (let i = 0; i < replacementIndices.length - 1; i++) {
      const currentReplace = replacementIndices[i];
      const nextReplace = replacementIndices[i + 1];
      const segmentStart = currentReplace + 1;
      const segmentEnd = nextReplace;
      
      if (segmentEnd > segmentStart) {
        const segmentText = quoteWords.slice(segmentStart, segmentEnd).join(" ");
        segments.push({
          text: segmentText,
          startWord: segmentStart,
          endWord: segmentEnd,
          afterReplaceIndex: currentReplace,
        });
      }
    }
    
    // Add final segment after last replacement
    const lastReplaceIndex = replacementIndices[replacementIndices.length - 1];
    if (lastReplaceIndex + 1 < quoteWords.length) {
      const finalSegmentText = quoteWords.slice(lastReplaceIndex + 1).join(" ");
      segments.push({
        text: finalSegmentText,
        startWord: lastReplaceIndex + 1,
        endWord: quoteWords.length,
        afterReplaceIndex: lastReplaceIndex,
      });
    }
    
    // Generate TTS for all segments in parallel (only non-empty segments)
    // Doing this in parallel saves a lot of time
    const segmentPromises = segments.map(async (seg, idx) => {
      if (!seg.text.trim()) {
        return null;
      }
      try {
        // Use the first animal's voice for TTS (or selectedAnimal if available)
        const ttsAnimal = selectedAnimal || selections[0]?.animal || getRandomAnimal();
        const url = await generateTTS(seg.text, ttsAnimal);
        return url;
      } catch (error) {
        return null;
      }
    });
    const segmentUrls = await Promise.all(segmentPromises);
    
    setIsGenerating(false);
    setIsPlaying(true);
    
    // Playback sequence: segment -> animal -> segment -> animal -> ... -> segment
    let segmentIdx = 0;
    
    // Play initial segment (before first replacement) if exists
    if (replacementIndices[0] > 0 && segmentIdx < segments.length) {
      const segment = segments[segmentIdx];
      const segmentUrl = segmentUrls[segmentIdx];
      
      if (segmentUrl && segment.text.trim()) {
        try {
          const buffer = await loadAudioBuffer(segmentUrl);
          if (buffer) {
            await playAudioBufferWithHighlighting(buffer, segment.startWord, segment.endWord);
          }
        } catch (error) {
          // Silently fail - better than crashing
        }
        URL.revokeObjectURL(segmentUrl);
      }
      segmentIdx++;
    }
    
    // Play each replacement with its following segment
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      const replaceIndex = selection.index;
      const animal = selection.animal;
      
      // Get duration limit for this specific animal (duck sounds are shorter)
      const duckMaxDuration = animal.id === 'duck' ? 0.5 : undefined;
      
      // Play animal sound at replacement point (using the specific animal for this replacement)
      setCurrentWordIndex(replaceIndex);
      setExplosionWord(quoteWords[replaceIndex]);
      setExplosionAnimal(animal); // Set the correct animal for explosion effect
      setShowExplosion(true);
      await playAnimalSound(animal.soundUrl, duckMaxDuration);
      setShowExplosion(false);
      setExplosionAnimal(null);
      setCurrentWordIndex(-1); // Clear highlight after explosion
      
      // Play segment after this replacement (could be between replacements or final segment)
      // Check all remaining segments to find one that comes after this replacement
      while (segmentIdx < segments.length) {
        const segment = segments[segmentIdx];
        const segmentUrl = segmentUrls[segmentIdx];
        
        // Check if this segment comes after the current replacement
        // Segments have afterReplaceIndex set to the replacement they follow
        if (segment.afterReplaceIndex === replaceIndex && segmentUrl && segment.text.trim()) {
          try {
            const buffer = await loadAudioBuffer(segmentUrl);
            if (buffer) {
              await playAudioBufferWithHighlighting(buffer, segment.startWord, segment.endWord);
            }
          } catch (error) {
            // Silently fail
          }
          URL.revokeObjectURL(segmentUrl);
          segmentIdx++;
          break; // Found and played the segment, move to next replacement
        } else if (segment.afterReplaceIndex !== undefined && segment.afterReplaceIndex < replaceIndex) {
          // Skip segments that should have been played earlier (safety check)
          segmentIdx++;
        } else {
          // This segment belongs to a future replacement, stop checking
          break;
        }
      }
    }
    
    // Safety: Play any remaining segments (shouldn't happen, but just in case)
    while (segmentIdx < segments.length) {
      const segment = segments[segmentIdx];
      const segmentUrl = segmentUrls[segmentIdx];
      
      if (segmentUrl && segment.text.trim()) {
        try {
          const buffer = await loadAudioBuffer(segmentUrl);
          if (buffer) {
            await playAudioBufferWithHighlighting(buffer, segment.startWord, segment.endWord);
          }
        } catch (error) {
          // Silently fail
        }
        URL.revokeObjectURL(segmentUrl);
      }
      segmentIdx++;
    }
    
    // Reset state
    setIsPlaying(false);
    setIsGenerating(false);
    setCurrentWordIndex(-1);
    setTimeout(() => {
      setWords([]);
      setReplacedIndices([]);
    }, 1000);
  };

  /** --- Main Mashup Playback --- */
  // Main function that handles both normal and chaos mode playback
  const playMashup = async () => {
    if (!canPlay || !audioManagerRef.current) return;
    // In chaos mode, selectedAnimal can be null (Gemini will choose)
    // In normal mode, we need selectedAnimal
    if (!isChaosMode && !selectedAnimal) return;
    await audioManagerRef.current.resume();

    setIsGenerating(true);
    setWords([]);
    setCurrentWordIndex(-1);
    setReplacedIndices([]);
    setShowExplosion(false);

    const cleanQuote = selectedQuote.trim().replace(/\s+/g, " ");
    const quoteWords = cleanQuote.split(/\s+/);
    setWords(quoteWords);

    try {
      // CHAOS MODE: Multiple random replacements throughout quote (with Gemini-selected animals)
      if (isChaosMode) {
        const chaosSelections = await getChaosSelections(cleanQuote, quoteWords);
        
        // Store selections for UI display and notify parent
        setChaosSelections(chaosSelections);
        if (onChaosSelections) {
          onChaosSelections(chaosSelections);
        }
        
        await playChaosMashup(quoteWords, chaosSelections);
        // Reset chaos mode after completion
        if (onChaosModeComplete) {
          setTimeout(() => onChaosModeComplete(), 500);
        }
        return;
      }

      // NORMAL MODE: Single word replacement
      const wordIndex = await getWordIndexToReplace(cleanQuote, selectedAnimal.name);
      if (wordIndex === null) throw new Error("No word index selected");

      const parts = createMashupParts(cleanQuote, wordIndex);
      if (!parts) throw new Error("Failed to split quote");

      setReplacedIndices([parts.wordIndex]);

      // Generate TTS in parallel
      const [beforeUrl, afterUrl] = await Promise.all([
        parts.before ? generateTTS(parts.before, selectedAnimal) : Promise.resolve(null),
        parts.after ? generateTTS(parts.after, selectedAnimal) : Promise.resolve(null),
      ]);

      setIsGenerating(false);
      setIsPlaying(true);

      // Sequence playback - play animal sound first
      const duckMaxDuration = selectedAnimal.id === 'duck' ? 0.5: undefined;
      await playAnimalSound(selectedAnimal.soundUrl, duckMaxDuration);

      if (beforeUrl) {
        const beforeBuffer = await loadAudioBuffer(beforeUrl);
        if (beforeBuffer) {
          // Play audio and highlight words simultaneously
          await playAudioBufferWithHighlighting(beforeBuffer, 0, parts.wordIndex);
        }
      }

      // Explosion + animal replacement - show the POW effect and play animal sound
      setCurrentWordIndex(parts.wordIndex);
      setExplosionWord(parts.replacedWord);
      setExplosionAnimal(selectedAnimal);
      setShowExplosion(true);
      await playAnimalSound(selectedAnimal.soundUrl, duckMaxDuration);
      setShowExplosion(false);
      setExplosionAnimal(null);

      if (afterUrl) {
        const afterBuffer = await loadAudioBuffer(afterUrl);
        if (afterBuffer) {
          // Play audio and highlight words simultaneously
          await playAudioBufferWithHighlighting(afterBuffer, parts.wordIndex + 1, quoteWords.length);
        }
      }

      // End with animal sound
      await playAnimalSound(selectedAnimal.soundUrl, duckMaxDuration);

    } catch (error) {
      // Reset chaos mode on error
      if (isChaosMode && onChaosModeComplete) {
        onChaosModeComplete();
      }
    } finally {
      // Only reset state if NOT in chaos mode (chaos mode handles its own cleanup)
      // This prevents double cleanup which would cause issues
      if (!isChaosMode) {
        setIsPlaying(false);
        setIsGenerating(false);
        setCurrentWordIndex(-1);
        setTimeout(() => {
          setWords([]);
          setReplacedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="space-y-6">
      <CassetteTape
        isPlaying={isPlaying}
        animalIcon={selectedAnimal?.icon}
        quoteText={selectedQuote || undefined}
        currentWord={words[currentWordIndex]}
      />

      {words.length > 0 && (
        <WordDisplay
          words={words}
          currentIndex={currentWordIndex}
          replacedIndices={replacedIndices}
          isExplosion={showExplosion}
        />
      )}

      {showExplosion && explosionAnimal && (
        <ExplosionEffect
          word={explosionWord}
          animalIcon={explosionAnimal.icon}
          onComplete={() => {}}
        />
      )}

      {/* Show Gemini-selected animals in chaos mode */}
      {isChaosMode && chaosSelections.length > 0 && words.length > 0 && (
        <div className="p-4 bg-muted rounded-lg border-2 border-dashed border-primary/30">
          <p className="text-sm font-mono text-muted-foreground mb-2">
            🌪️ <strong>Chaos Mode:</strong> Gemini selected these animals:
          </p>
          <div className="flex flex-wrap gap-2">
            {chaosSelections.map((sel, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-primary/20"
                title={`Word ${sel.index + 1}: "${words[sel.index] || '...'}" → ${sel.animal.name}`}
              >
                <img src={sel.animal.icon} alt={sel.animal.name} className="w-6 h-6" />
                <span className="text-xs font-mono text-foreground">
                  {sel.animal.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button
          data-play-button
          onClick={isPlaying ? () => stopPlayback(false) : playMashup}
          disabled={(!canPlay && !isPlaying) || isGenerating}
          className={cn(
            "w-full py-4 px-6 rounded-xl font-display text-xl transition-all",
            "border-4 border-foreground shadow-[4px_4px_0_hsl(var(--foreground))]",
            "hover:scale-[1.02] hover:rotate-1 active:scale-[0.98] active:shadow-[2px_2px_0_hsl(var(--foreground))]",
            "flex items-center justify-center gap-3",
            isPlaying
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:rotate-0"
          )}
        >
          {isGenerating ? (
            <>
              <span className="text-2xl animate-spin">⏳</span>
              GENERATING...
            </>
          ) : isPlaying ? (
            <>
              <span className="text-2xl">⏹️</span>
              STOP!
            </>
          ) : (
            <>
              <span className="text-2xl">▶️</span>
              MASH IT UP!
            </>
          )}
        </button>

        <div className="flex gap-3">
          <button
            onClick={onRandomize}
            disabled={isPlaying || isGenerating}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg font-mono font-bold transition-all",
              "bg-secondary text-secondary-foreground",
              "border-2 border-foreground shadow-[2px_2px_0_hsl(var(--foreground))]",
              "hover:scale-105 hover:-rotate-1 active:scale-95",
              "flex items-center justify-center gap-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <span className="text-xl">🔀</span>
            Random Quote
          </button>

          <button
            onClick={onChaosMode}
            disabled={isPlaying || isGenerating}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg font-mono font-bold transition-all",
              "bg-accent text-accent-foreground",
              "border-2 border-foreground shadow-[2px_2px_0_hsl(var(--foreground))]",
              "hover:scale-105 hover:rotate-1 active:scale-95",
              "flex items-center justify-center gap-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <span className="text-xl">✨</span>
            CHAOS MODE
          </button>
        </div>
      </div>

      {!canPlay && !isPlaying && !isGenerating && (
        <p className="text-center font-mono text-sm text-muted-foreground animate-pulse">
          ↑ Select an animal and enter a quote to create your mashup! ↑
        </p>
      )}
    </div>
  );
};
