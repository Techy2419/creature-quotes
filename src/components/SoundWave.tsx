import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SoundWaveProps {
  isPlaying: boolean;
}

export const SoundWave = ({ isPlaying }: SoundWaveProps) => {
  const [heights, setHeights] = useState<number[]>(Array(16).fill(4));

  useEffect(() => {
    if (!isPlaying) {
      setHeights(Array(16).fill(4));
      return;
    }

    const interval = setInterval(() => {
      setHeights(prev => prev.map(() => Math.random() * 28 + 4));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex items-center justify-center gap-[3px] h-10">
      {heights.map((height, i) => (
        <div
          key={i}
          className={cn(
            "w-2 rounded-full transition-all duration-100",
            isPlaying 
              ? i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-secondary" : "bg-accent"
              : "bg-neutral-600"
          )}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
};
