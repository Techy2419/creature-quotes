import { useCallback, useRef } from "react";
import { AnimalSound } from "@/data/animalSounds";

export const useSpeechSynthesis = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakWithElevenLabs = async (text: string): Promise<void> => {
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

      if (!response.ok) {
        throw new Error("TTS generation failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return new Promise((resolve) => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audio.play().catch(() => resolve());
      });
    } catch (error) {
      console.warn("ElevenLabs TTS failed, falling back to browser speech", error);
      // Fallback to browser speech synthesis
      return fallbackSpeak(text);
    }
  };

  const fallbackSpeak = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) utterance.voice = englishVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      
      window.speechSynthesis.speak(utterance);
    });
  };

  const speakWord = useCallback((word: string, _animal: AnimalSound): Promise<void> => {
    // Use ElevenLabs TTS with the specified voice
    return speakWithElevenLabs(word);
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return { speakWord, cancel };
};
