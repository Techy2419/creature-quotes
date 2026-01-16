import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AnimalSound } from "@/data/animalSounds";
import { CassetteTape } from "./CassetteTape";
import { WordDisplay } from "./WordDisplay";
import { ExplosionEffect } from "./ExplosionEffect";
import { getAudioManager, WebAudioManager } from "@/utils/webAudio";

interface MashupPlayerProps {
  selectedAnimal: AnimalSound | null;
  selectedQuote: string;
  onRandomize: () => void;
  onChaosMode: () => void;
}

export const MashupPlayer = ({
  selectedAnimal,
  selectedQuote,
  onRandomize,
  onChaosMode,
}: MashupPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [replacedIndices, setReplacedIndices] = useState<number[]>([]);
  const [showExplosion, setShowExplosion] = useState(false);
  const [explosionWord, setExplosionWord] = useState("");
  const audioManagerRef = useRef<WebAudioManager | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const canPlay = selectedAnimal && selectedQuote.trim().length > 0;

  // Initialize Web Audio Manager
  useEffect(() => {
    audioManagerRef.current = getAudioManager();
    audioManagerRef.current.init();

    return () => {
      // Cleanup on unmount
      if (audioManagerRef.current) {
        audioManagerRef.current.stopAll();
      }
    };
  }, []);

  const getRandomIndices = (wordCount: number): number[] => {
    if (wordCount <= 2) return [Math.floor(Math.random() * wordCount)];
    const count = Math.min(Math.floor(Math.random() * 2) + 1, wordCount - 1);
    const indices: number[] = [];
    while (indices.length < count) {
      const idx = Math.floor(Math.random() * wordCount);
      if (!indices.includes(idx)) {
        indices.push(idx);
      }
    }
    return indices.sort((a, b) => a - b);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const generateTTS = async (text: string): Promise<string | null> => {
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
            text,
            voiceId: "ssKAEhdevSPzKs37U6qX" 
          }),
        }
      );

      if (!response.ok) throw new Error("TTS generation failed");
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error("TTS generation failed:", error);
      return null;
    }
  };

  const generateAnimalSound = async (sfxPrompt: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-sfx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt: sfxPrompt, duration: 2 }),
        }
      );

      if (!response.ok) throw new Error("SFX generation failed");
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error("SFX generation failed:", error);
      return null;
    }
  };

  /**
   * Load audio buffer from URL using Web Audio API
   */
  const loadAudioBuffer = async (url: string): Promise<AudioBuffer | null> => {
    if (!audioManagerRef.current) return null;
    try {
      return await audioManagerRef.current.loadAudio(url);
    } catch (error) {
      console.error("Failed to load audio buffer:", error);
      return null;
    }
  };

  /**
   * Play audio buffer with Web Audio API
   */
  const playAudioBuffer = (
    buffer: AudioBuffer,
    options: {
      startTime?: number;
      offset?: number;
      duration?: number;
      volume?: number;
      onEnded?: () => void;
    } = {}
  ): AudioBufferSourceNode | null => {
    if (!audioManagerRef.current) return null;
    const source = audioManagerRef.current.playBuffer(buffer, options);
    activeSourcesRef.current.push(source);
    return source;
  };

  const playMashup = async () => {
    if (!canPlay || !selectedAnimal || !audioManagerRef.current) return;

    // Resume AudioContext if suspended (required after user interaction)
    await audioManagerRef.current.resume();

    setIsLoading(true);
    setIsPlaying(true);
    
    const quoteWords = selectedQuote.trim().split(/\s+/);
    setWords(quoteWords);
    const replaceIndices = getRandomIndices(quoteWords.length);
    setReplacedIndices(replaceIndices);
    setCurrentWordIndex(-1);
    setShowExplosion(false);

    let quoteBuffer: AudioBuffer | null = null;
    let animalBuffer: AudioBuffer | null = null;
    let quoteAudioUrl: string | null = null;
    let animalAudioUrl: string | null = null;

    try {
      // Generate all audio upfront in parallel for speed
      const [quoteUrl, animalUrl] = await Promise.all([
        generateTTS(selectedQuote),
        generateAnimalSound(selectedAnimal.sfxPrompt)
      ]);

      quoteAudioUrl = quoteUrl;
      animalAudioUrl = animalUrl;

      if (!quoteAudioUrl) {
        console.error("Failed to generate quote audio");
        setIsPlaying(false);
        setIsLoading(false);
        return;
      }

      // Load audio buffers using Web Audio API
      const [quoteBuf, animalBuf] = await Promise.all([
        loadAudioBuffer(quoteAudioUrl),
        animalAudioUrl ? loadAudioBuffer(animalAudioUrl) : Promise.resolve(null),
      ]);

      quoteBuffer = quoteBuf;
      animalBuffer = animalBuf;

      if (!quoteBuffer) {
        console.error("Failed to load quote audio buffer");
        setIsPlaying(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);

      const audioManager = audioManagerRef.current;
      const startTime = audioManager.getCurrentTime();

      // 1. Play initial animal sound (800ms)
      if (animalBuffer) {
        playAudioBuffer(animalBuffer, {
          startTime,
          duration: 0.8,
          volume: 0.8,
        });
      }

      // 2. Play the full quote starting after initial sound + gap
      const quoteStartTime = startTime + 0.8 + 0.3; // 800ms sound + 300ms gap
      const quoteDuration = quoteBuffer.duration;

      playAudioBuffer(quoteBuffer, {
        startTime: quoteStartTime,
        volume: 1.0,
        onEnded: () => {
          // Quote finished
        },
      });

      // Calculate word timing based on actual audio duration
      const wordDuration = quoteDuration / quoteWords.length;

      // Animate through words synchronized with audio
      for (let i = 0; i < quoteWords.length; i++) {
        const wordStartTime = quoteStartTime + i * wordDuration;
        const currentTime = audioManager.getCurrentTime();
        const delay = Math.max(0, (wordStartTime - currentTime) * 1000);

        await sleep(delay);
        setCurrentWordIndex(i);
        
        if (replaceIndices.includes(i) && animalBuffer) {
          // Show explosion and play animal sound overlay
          setExplosionWord(quoteWords[i]);
          setShowExplosion(true);
          
          // Play animal sound overlay at the same time as the word
          playAudioBuffer(animalBuffer, {
            startTime: wordStartTime,
            duration: Math.min(1.5, animalBuffer.duration), // Max 1.5 seconds
            volume: 0.9,
          });
          
          await sleep(wordDuration * 1000 + 200);
          setShowExplosion(false);
        } else {
          await sleep(wordDuration * 1000);
        }
      }

      // Wait for quote to finish
      const quoteEndTime = quoteStartTime + quoteDuration;
      const waitTime = Math.max(0, (quoteEndTime - audioManager.getCurrentTime()) * 1000);
      await sleep(waitTime);

      // 3. Final animal sound (600ms) after a short gap
      if (animalBuffer) {
        const finalStartTime = quoteEndTime + 0.2; // 200ms gap
        playAudioBuffer(animalBuffer, {
          startTime: finalStartTime,
          duration: 0.6,
          volume: 0.8,
        });

        // Wait for final sound to finish
        const finalEndTime = finalStartTime + 0.6;
        const finalWaitTime = Math.max(0, (finalEndTime - audioManager.getCurrentTime()) * 1000);
        await sleep(finalWaitTime);
      }

      // Cleanup URLs
      if (quoteAudioUrl) URL.revokeObjectURL(quoteAudioUrl);
      if (animalAudioUrl) URL.revokeObjectURL(animalAudioUrl);

    } catch (error) {
      console.error("Playback error:", error);
    } finally {
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentWordIndex(-1);
      await sleep(1500);
      setWords([]);
      setReplacedIndices([]);
    }
  };

  const stopPlayback = () => {
    // Stop all Web Audio API sources
    if (audioManagerRef.current) {
      audioManagerRef.current.stopAll();
    }
    activeSourcesRef.current = [];
    
    setIsPlaying(false);
    setIsLoading(false);
    setShowExplosion(false);
    setCurrentWordIndex(-1);
    setWords([]);
    setReplacedIndices([]);
  };

  return (
    <div className="space-y-6">
      <CassetteTape
        isPlaying={isPlaying}
        animalIcon={selectedAnimal?.icon}
        quoteText={selectedQuote || undefined}
        currentWord={words[currentWordIndex]}
      />

      {/* Word display area */}
      {words.length > 0 && (
        <WordDisplay
          words={words}
          currentIndex={currentWordIndex}
          replacedIndices={replacedIndices}
          isExplosion={showExplosion}
        />
      )}

      {/* Explosion effect */}
      {showExplosion && selectedAnimal && (
        <ExplosionEffect
          word={explosionWord}
          animalIcon={selectedAnimal.icon}
          onComplete={() => {}}
        />
      )}

      {/* Controls */}
      <div className="flex flex-col gap-4">
        {/* Main play button */}
        <button
          onClick={isPlaying ? stopPlayback : playMashup}
          disabled={(!canPlay && !isPlaying) || isLoading}
          data-play-button
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
          {isLoading ? (
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

        {/* Secondary buttons */}
        <div className="flex gap-3">
          <button
            onClick={onRandomize}
            disabled={isPlaying || isLoading}
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
            disabled={isPlaying || isLoading}
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

      {!canPlay && !isPlaying && (
        <p className="text-center font-mono text-sm text-muted-foreground animate-pulse">
          ↑ Select an animal and enter a quote to create your mashup! ↑
        </p>
      )}
    </div>
  );
};
