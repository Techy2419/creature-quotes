import { cn } from "@/lib/utils";

interface ExplosionEffectProps {
  word: string;
  animalIcon: string;
  onComplete: () => void;
}

export const ExplosionEffect = ({ word, animalIcon, onComplete }: ExplosionEffectProps) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      onAnimationEnd={onComplete}
    >
      {/* POW! burst background */}
      <div className="absolute animate-explosion-burst">
        <svg viewBox="0 0 200 200" className="w-80 h-80">
          <polygon 
            points="100,10 120,80 190,80 135,120 155,190 100,150 45,190 65,120 10,80 80,80" 
            fill="url(#explosion-gradient)"
            className="drop-shadow-lg"
          />
          <defs>
            <radialGradient id="explosion-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE135" />
              <stop offset="50%" stopColor="#FF6B35" />
              <stop offset="100%" stopColor="#E63946" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* POW! text */}
      <div className="absolute animate-explosion-text">
        <span 
          className="font-display text-6xl md:text-8xl text-white"
          style={{
            textShadow: "4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000"
          }}
        >
          POW!
        </span>
      </div>

      {/* Animal icon bouncing */}
      <div className="absolute mt-32 animate-bounce-animal">
        <img 
          src={animalIcon} 
          alt="Animal" 
          className="w-24 h-24 md:w-32 md:h-32"
        />
      </div>

      {/* Replaced word */}
      <div className="absolute mt-56 animate-fade-in-up">
        <span 
          className="font-mono text-2xl md:text-3xl font-bold bg-black/80 text-white px-4 py-2 rounded-lg"
        >
          "{word}"
        </span>
      </div>
    </div>
  );
};
