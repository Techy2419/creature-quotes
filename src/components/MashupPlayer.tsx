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
  const quoteGainNodeRef = useRef<GainNode | null>(null);

  const canPlay = selectedAnimal && selectedQuote.trim().length > 0;

  // Set up the Web Audio Manager when component mounts
  useEffect(() => {
    audioManagerRef.current = getAudioManager();
    audioManagerRef.current.init();

    return () => {
      // Stop all audio when component unmounts - prevents memory leaks
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
   * Convert the audio URL into an AudioBuffer that Web Audio API can work with
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
   * Play an AudioBuffer with Web Audio API - gives us precise timing control
   */
  const playAudioBuffer = (
    buffer: AudioBuffer,
    options: {
      startTime?: number;
      offset?: number;
      duration?: number;
      volume?: number;
      onEnded?: () => void;
    } = {},
    isQuote: boolean = false
  ): AudioBufferSourceNode | null => {
    if (!audioManagerRef.current) return null;
    const { source, gainNode } = audioManagerRef.current.playBuffer(buffer, options);
    activeSourcesRef.current.push(source);
    
    // Store the quote's gain node so we can duck it during word replacements
    if (isQuote) {
      quoteGainNodeRef.current = gainNode;
    }
    
    return source;
  };

  const playMashup = async () => {
    if (!canPlay || !selectedAnimal || !audioManagerRef.current) return;

    // Make sure AudioContext is running - browsers suspend it until user interaction
    await audioManagerRef.current.resume();

    setIsLoading(true);
    setIsPlaying(true);
    
    // Clean the quote text - remove extra spaces and ensure it's a valid string
    let cleanQuote = selectedQuote.trim().replace(/\s+/g, ' ');
    
    // Defensive check - make sure nothing weird got prepended to the quote
    // Sometimes empty quotes or edge cases can cause issues
    if (!cleanQuote || cleanQuote.length === 0) {
      console.error("Empty quote detected!");
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }
    
    // Log the exact quote being sent to TTS for debugging
    console.log("Original quote:", selectedQuote);
    console.log("Cleaned quote being sent to TTS:", cleanQuote);
    console.log("Quote starts with:", cleanQuote[0]);
    
    const quoteWords = cleanQuote.split(/\s+/);
    setWords(quoteWords);
    const replaceIndices = getRandomIndices(quoteWords.length);
    setReplacedIndices(replaceIndices);
    setCurrentWordIndex(-1);
    setShowExplosion(false);

    console.log("Words to replace at indices:", replaceIndices);

    let quoteBuffer: AudioBuffer | null = null;
    let animalBuffer: AudioBuffer | null = null;
    let quoteAudioUrl: string | null = null;
    let animalAudioUrl: string | null = null;

    try {
      // Generate both TTS and SFX at the same time to speed things up
      // Make sure we send the cleaned quote, not the original
      const [quoteUrl, animalUrl] = await Promise.all([
        generateTTS(cleanQuote),
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

      // Stop any currently playing audio before loading new buffers
      // This prevents old audio from playing over new audio
      if (audioManagerRef.current) {
        audioManagerRef.current.stopAll();
      }

      // Convert the audio URLs into AudioBuffers so we can schedule them precisely
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

      // Log the audio buffer details for debugging
      console.log("Quote audio buffer loaded:");
      console.log("  Duration:", quoteBuffer.duration, "seconds");
      console.log("  Sample rate:", quoteBuffer.sampleRate);
      console.log("  Number of channels:", quoteBuffer.numberOfChannels);

      setIsLoading(false);

      const audioManager = audioManagerRef.current;
      const startTime = audioManager.getCurrentTime();

      // Start with a quick animal sound to set the mood
      if (animalBuffer) {
        playAudioBuffer(animalBuffer, {
          startTime,
          duration: 0.8,
          volume: 0.8,
        });
      }

      // Play the quote after the intro sound, with a small gap
      const quoteStartTime = startTime + 0.8 + 0.3; // 800ms sound + 300ms gap
      const quoteDuration = quoteBuffer.duration;

      // Play the quote and store its gain node for volume control
      playAudioBuffer(quoteBuffer, {
        startTime: quoteStartTime,
        volume: 1.0,
        onEnded: () => {
          // Done playing the quote
        },
      }, true); // Mark this as the quote audio

      // Figure out how long each word should be highlighted based on actual audio length
      const wordDuration = quoteDuration / quoteWords.length;

      // Schedule all the word replacements upfront using Web Audio API's precise timing
      // This way the gain changes happen at exactly the right moment
      if (quoteGainNodeRef.current && animalBuffer && replaceIndices.length > 0) {
        const currentAudioTime = audioManager.getCurrentTime();
        console.log("Scheduling word replacements. Quote starts at:", quoteStartTime, "Current time:", currentAudioTime);
        console.log("Quote duration:", quoteDuration, "Word count:", quoteWords.length, "Word duration:", wordDuration);
        
        // Use exponential ramp for smoother volume transitions instead of instant changes
        const rampTime = 0.05; // 50ms ramp time for smooth transitions
        
        replaceIndices.forEach((i) => {
          const wordStartTime = quoteStartTime + i * wordDuration;
          const wordEndTime = wordStartTime + wordDuration;
          
          // Make sure we're scheduling in the future
          if (wordStartTime > currentAudioTime) {
            console.log(`Replacing word ${i} "${quoteWords[i]}" at time ${wordStartTime} (word: "${quoteWords[i]}")`);
            
            // Duck the quote audio volume way down - use exponential ramp for smooth transition
            quoteGainNodeRef.current!.gain.setValueAtTime(1.0, wordStartTime - rampTime);
            quoteGainNodeRef.current!.gain.exponentialRampToValueAtTime(0.1, wordStartTime);
            
            // Play the animal sound at full volume - this replaces the word
            playAudioBuffer(animalBuffer, {
              startTime: wordStartTime,
              duration: Math.min(wordDuration, animalBuffer.duration, 1.5), // Match word duration or cap at 1.5s
              volume: 1.0,
            });
            
            // Restore quote audio volume after the word - smooth ramp back up
            quoteGainNodeRef.current!.gain.setValueAtTime(0.1, wordEndTime - rampTime);
            quoteGainNodeRef.current!.gain.exponentialRampToValueAtTime(1.0, wordEndTime);
          } else {
            console.warn(`Word ${i} start time ${wordStartTime} is in the past! Skipping.`);
          }
        });
      } else {
        console.log("Word replacement not scheduled. Gain node:", !!quoteGainNodeRef.current, "Animal buffer:", !!animalBuffer, "Indices:", replaceIndices.length);
      }

      // Sync the word highlighting with the audio playback
      for (let i = 0; i < quoteWords.length; i++) {
        const wordStartTime = quoteStartTime + i * wordDuration;
        const currentTime = audioManager.getCurrentTime();
        const delay = Math.max(0, (wordStartTime - currentTime) * 1000);

        await sleep(delay);
        setCurrentWordIndex(i);
        
        if (replaceIndices.includes(i) && animalBuffer) {
          // This word gets replaced with an animal sound - show the explosion effect
          setExplosionWord(quoteWords[i]);
          setShowExplosion(true);
          
          await sleep(wordDuration * 1000 + 200);
          setShowExplosion(false);
        } else {
          await sleep(wordDuration * 1000);
        }
      }

      // Wait for the quote audio to actually finish playing
      const quoteEndTime = quoteStartTime + quoteDuration;
      const waitTime = Math.max(0, (quoteEndTime - audioManager.getCurrentTime()) * 1000);
      await sleep(waitTime);

      // End with another animal sound for a nice finish
      if (animalBuffer) {
        const finalStartTime = quoteEndTime + 0.2; // Small gap before the outro
        playAudioBuffer(animalBuffer, {
          startTime: finalStartTime,
          duration: 0.6,
          volume: 0.8,
        });

        // Wait for the outro sound to finish before we're done
        const finalEndTime = finalStartTime + 0.6;
        const finalWaitTime = Math.max(0, (finalEndTime - audioManager.getCurrentTime()) * 1000);
        await sleep(finalWaitTime);
      }

      // Free up the blob URLs we created
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
    // Kill all audio sources immediately
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
