import { cn } from "@/lib/utils";
import { useState } from "react";

interface QuoteSelectorProps {
  customQuote: string;
  onCustomQuoteChange: (quote: string) => void;
  onFetchRandomQuote: () => void;
  isFetching: boolean;
}

export const QuoteSelector = ({
  customQuote,
  onCustomQuoteChange,
  onFetchRandomQuote,
  isFetching,
}: QuoteSelectorProps) => {
  return (
    <div className="space-y-4">
      {/* Custom quote input */}
      <div className="space-y-2">
        <textarea
          value={customQuote}
          onChange={(e) => onCustomQuoteChange(e.target.value)}
          placeholder="Type your own quote here... or click Random Quote!"
          className={cn(
            "w-full h-24 p-4 rounded-lg resize-none",
            "bg-card border-4 border-foreground",
            "font-mono text-sm text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            "shadow-[3px_3px_0_hsl(var(--foreground))]"
          )}
          maxLength={200}
        />
        <div className="flex justify-between items-center">
          <button
            onClick={onFetchRandomQuote}
            disabled={isFetching}
            className={cn(
              "py-2 px-4 rounded-lg font-mono font-bold text-sm transition-all",
              "bg-secondary text-secondary-foreground",
              "border-2 border-foreground shadow-[2px_2px_0_hsl(var(--foreground))]",
              "hover:scale-105 hover:-rotate-1 active:scale-95",
              "flex items-center gap-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <img src="https://img.icons8.com/fluency/48/shuffle.png" alt="Random" className="w-5 h-5" />
            {isFetching ? "Loading..." : "Random Movie Quote"}
          </button>
          <span className="text-xs text-muted-foreground font-mono">
            {customQuote.length}/200
          </span>
        </div>
      </div>
    </div>
  );
};
