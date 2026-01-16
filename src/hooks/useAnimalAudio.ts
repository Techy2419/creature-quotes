import { useCallback, useRef } from "react";

export const useAnimalAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback((audioUrl: string, duration?: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Kill whatever's playing right now
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioUrl);
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;

      const timeout = duration ? setTimeout(() => {
        audio.pause();
        resolve();
      }, duration) : null;

      audio.onended = () => {
        if (timeout) clearTimeout(timeout);
        resolve();
      };

      audio.onerror = () => {
        if (timeout) clearTimeout(timeout);
        // Resolve instead of reject so the app doesn't crash if audio fails
        console.warn("Audio failed to load, continuing...");
        resolve();
      };

      audio.play().catch(() => {
        console.warn("Audio play failed, continuing...");
        resolve();
      });
    });
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return { playSound, stop };
};
