import { cn } from "@/lib/utils";

interface WordDisplayProps {
  words: string[];
  currentIndex: number;
  replacedIndices: number[];
  isExplosion: boolean;
}

export const WordDisplay = ({ words, currentIndex, replacedIndices, isExplosion }: WordDisplayProps) => {
  return (
    <div className="min-h-[80px] flex flex-wrap items-center justify-center gap-2 p-4 bg-card rounded-lg border-2 border-foreground">
      {words.map((word, index) => {
        const isReplaced = replacedIndices.includes(index);
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        return (
          <span
            key={index}
            className={cn(
              "font-mono text-lg md:text-xl transition-all duration-300",
              isFuture && "opacity-30",
              isPast && !isReplaced && "opacity-100",
              isPast && isReplaced && "text-primary font-bold animate-pulse",
              isCurrent && !isExplosion && "animate-word-appear font-bold scale-110",
              isCurrent && isExplosion && "text-accent font-bold scale-125"
            )}
          >
            {word}
          </span>
        );
      })}
      {currentIndex === -1 && words.length === 0 && (
        <span className="text-muted-foreground italic">Your quote will appear here...</span>
      )}
    </div>
  );
};
