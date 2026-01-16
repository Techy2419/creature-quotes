import { useState, useCallback, useEffect } from "react";
import { AnimalSound, animalSounds, getRandomAnimal } from "@/data/animalSounds";
import { getRandomQuote } from "@/data/movieQuotes";
import { AnimalCard } from "@/components/AnimalCard";
import { QuoteSelector } from "@/components/QuoteSelector";
import { MashupPlayer } from "@/components/MashupPlayer";

const Index = () => {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalSound | null>(null);
  const [customQuote, setCustomQuote] = useState("");
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);

  // Preload voices on mount
  useEffect(() => {
    window.speechSynthesis.getVoices();
    // Some browsers need this event
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  const handleAnimalClick = (animal: AnimalSound) => {
    setSelectedAnimal(animal);
    // No preview sound on click - will be generated on mashup
  };

  const fetchRandomQuote = useCallback(async () => {
    setIsFetchingQuote(true);
    try {
      // Use local quotes as fallback since API might have CORS issues
      const quote = getRandomQuote();
      setCustomQuote(quote.quote);
    } catch (error) {
      console.error("Failed to fetch quote:", error);
      const quote = getRandomQuote();
      setCustomQuote(quote.quote);
    } finally {
      setIsFetchingQuote(false);
    }
  }, []);

  const handleRandomize = useCallback(() => {
    const quote = getRandomQuote();
    setCustomQuote(quote.quote);
  }, []);

  const handleChaosMode = useCallback(() => {
    const randomAnimal = getRandomAnimal();
    const randomQuote = getRandomQuote();
    setSelectedAnimal(randomAnimal);
    setCustomQuote(randomQuote.quote);
    
    // Auto-play after a short delay
    setTimeout(() => {
      const playButton = document.querySelector('[data-play-button]') as HTMLButtonElement;
      if (playButton && !playButton.disabled) {
        playButton.click();
      }
    }, 300);
  }, []);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-6xl text-foreground text-shadow-retro mb-2">
            CREATURE<span className="text-primary">QUOTES</span>
          </h1>
          <p className="font-mono text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            Mix animal sounds with movie quotes for 
            <span className="text-accent font-bold"> absurdly hilarious </span>
            audio chaos!
          </p>
        </header>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left column - Selection */}
          <div className="space-y-6">
            {/* Animal selector */}
            <section className="bg-card p-6 rounded-xl border-4 border-foreground shadow-[4px_4px_0_hsl(var(--foreground))]">
              <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                <img src="https://img.icons8.com/fluency/48/speaker.png" alt="Speaker" className="w-7 h-7" />
                Pick Your Creature
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {animalSounds.map((animal, index) => (
                  <AnimalCard
                    key={animal.id}
                    animal={animal}
                    isSelected={selectedAnimal?.id === animal.id}
                    onClick={() => handleAnimalClick(animal)}
                    index={index}
                  />
                ))}
              </div>
            </section>

            {/* Quote selector */}
            <section className="bg-card p-6 rounded-xl border-4 border-foreground shadow-[4px_4px_0_hsl(var(--foreground))]">
              <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                <img src="https://img.icons8.com/fluency/48/movie.png" alt="Movie" className="w-7 h-7" />
                Enter Your Quote
              </h2>
              <QuoteSelector
                customQuote={customQuote}
                onCustomQuoteChange={setCustomQuote}
                onFetchRandomQuote={fetchRandomQuote}
                isFetching={isFetchingQuote}
              />
            </section>
          </div>

          {/* Right column - Player */}
          <div className="lg:sticky lg:top-8 h-fit">
            <section className="bg-card p-6 rounded-xl border-4 border-foreground shadow-[4px_4px_0_hsl(var(--foreground))]">
              <h2 className="font-display text-xl text-foreground mb-6 flex items-center gap-2">
                <img src="https://img.icons8.com/fluency/48/headphones.png" alt="Headphones" className="w-7 h-7" />
                Your Mashup
              </h2>
              <MashupPlayer
                selectedAnimal={selectedAnimal}
                selectedQuote={customQuote}
                onRandomize={handleRandomize}
                onChaosMode={handleChaosMode}
              />
            </section>

            {/* Fun tips */}
            <div className="mt-6 p-4 bg-muted rounded-lg border-4 border-dashed border-muted-foreground/30">
              <p className="font-mono text-xs text-muted-foreground text-center">
                <img src="https://img.icons8.com/fluency/48/idea.png" alt="Tip" className="w-5 h-5 inline mr-1" />
                <strong>Pro tip:</strong> Try combining a lion with 
                "There's no place like home" for maximum absurdity!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            Made with <img src="https://img.icons8.com/fluency/48/musical-notes.png" alt="Music" className="w-4 h-4 inline" /> and questionable humor • 
            <span className="text-primary"> No animals were harmed </span>
            in the making of these mashups
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
