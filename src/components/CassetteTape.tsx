import { cn } from "@/lib/utils";
import { SoundWave } from "./SoundWave";

interface CassetteTapeProps {
  isPlaying: boolean;
  animalIcon?: string;
  quoteText?: string;
  currentWord?: string;
}

export const CassetteTape = ({ isPlaying, animalIcon, quoteText, currentWord }: CassetteTapeProps) => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Main cassette body with realistic gradient */}
      <div className="bg-gradient-to-b from-neutral-700 via-neutral-600 to-neutral-800 rounded-xl p-6 border-4 border-neutral-900 shadow-[4px_4px_0_hsl(var(--foreground))]">
        {/* Top label area */}
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg p-4 mb-4 border-2 border-neutral-900">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-lg text-neutral-900">REMIX TAPE</span>
            {animalIcon ? (
              <img src={animalIcon} alt="Animal" className="w-10 h-10 object-contain" />
            ) : (
              <img src="https://img.icons8.com/fluency/48/speaker.png" alt="Speaker" className="w-8 h-8" />
            )}
          </div>
          <div className="h-12 overflow-hidden">
            <p className="font-mono text-xs text-neutral-700 line-clamp-2">
              {quoteText || "Select an animal and a quote to create your mashup!"}
            </p>
            {currentWord && (
              <p className="font-mono text-sm font-bold text-primary mt-1 animate-pulse">
                → {currentWord}
              </p>
            )}
          </div>
        </div>

        {/* Tape reels section */}
        <div className="flex justify-center gap-12 py-4 relative">
          {/* Tape film between reels - animated */}
          <div className="absolute top-1/2 left-1/4 right-1/4 h-3 -translate-y-1/2 z-0 overflow-hidden rounded">
            <div className={cn(
              "w-full h-full bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 bg-[length:20px_100%]",
              isPlaying && "animate-tape-move"
            )} />
          </div>
          
          {/* Left reel */}
          <div className="relative z-10">
            <div
              className={cn(
                "w-16 h-16 rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700 border-4 border-neutral-500 relative",
                isPlaying && "animate-spin-slow"
              )}
            >
              {/* Outer tape ring */}
              <div className="absolute inset-1 rounded-full border-4 border-neutral-600/40" />
              {/* Inner tape ring */}
              <div className="absolute inset-3 rounded-full border-2 border-neutral-500/30" />
              {/* Center hub */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-200 to-amber-100 border-2 border-neutral-800 shadow-inner" />
              </div>
            </div>
          </div>

          {/* Right reel */}
          <div className="relative z-10">
            <div
              className={cn(
                "w-16 h-16 rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700 border-4 border-neutral-500 relative",
                isPlaying && "animate-spin-slow"
              )}
            >
              {/* Outer tape ring */}
              <div className="absolute inset-1 rounded-full border-4 border-neutral-600/40" />
              {/* Inner tape ring */}
              <div className="absolute inset-3 rounded-full border-2 border-neutral-500/30" />
              {/* Center hub */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-200 to-amber-100 border-2 border-neutral-800 shadow-inner" />
              </div>
            </div>
          </div>
        </div>

        {/* Waveform visualization */}
        <div className="bg-neutral-900 rounded-lg p-2 mx-4">
          <SoundWave isPlaying={isPlaying} />
        </div>

        {/* Bottom screws */}
        <div className="flex justify-between mt-4 px-2">
          <div className="w-4 h-4 rounded-full bg-neutral-500 border border-neutral-700 shadow-inner" />
          <div className="flex gap-2">
            <div className="w-8 h-2 bg-neutral-500 rounded" />
            <div className="w-8 h-2 bg-neutral-500 rounded" />
          </div>
          <div className="w-4 h-4 rounded-full bg-neutral-500 border border-neutral-700 shadow-inner" />
        </div>
      </div>
    </div>
  );
};
