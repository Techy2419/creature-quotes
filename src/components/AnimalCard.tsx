import { AnimalSound } from "@/data/animalSounds";
import { cn } from "@/lib/utils";

interface AnimalCardProps {
  animal: AnimalSound;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export const AnimalCard = ({ animal, isSelected, onClick, index }: AnimalCardProps) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: animal.backgroundColor,
        borderColor: animal.accentColor,
        animationDelay: `${index * 0.08}s`,
      }}
      className={cn(
        "relative p-3 md:p-4 rounded-lg transition-all duration-200",
        "border-4 border-foreground",
        "hover:scale-105 hover:-rotate-2 active:scale-95",
        "flex flex-col items-center gap-2",
        "shadow-[3px_3px_0_hsl(var(--foreground))]",
        "animate-wobble-entrance",
        isSelected && "scale-105 ring-4 ring-yellow-400 glow-yellow",
        // Hand-drawn imperfect rotation
        index % 2 === 0 ? "rotate-1" : "-rotate-1"
      )}
    >
      <img 
        src={animal.icon} 
        alt={animal.name}
        className="w-16 h-16 md:w-20 md:h-20 object-contain"
        draggable={false}
      />
      <span 
        className="font-mono text-xs font-bold uppercase tracking-wide text-center"
        style={{ color: animal.accentColor }}
      >
        {animal.name}
      </span>
      {isSelected && (
        <div className="absolute -top-2 -right-2 animate-bounce-in">
          <img 
            src="https://img.icons8.com/fluency/48/sparkles.png" 
            alt="Selected"
            className="w-8 h-8"
          />
        </div>
      )}
    </button>
  );
};
