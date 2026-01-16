export interface MovieQuote {
  id: string;
  quote: string;
  source: string;
  type: "movie" | "tv" | "webseries";
}

export const movieQuotes: MovieQuote[] = [
  // Classic Movies
  { id: "1", quote: "I'll be back.", source: "The Terminator", type: "movie" },
  { id: "2", quote: "May the Force be with you.", source: "Star Wars", type: "movie" },
  { id: "3", quote: "Here's looking at you, kid.", source: "Casablanca", type: "movie" },
  { id: "4", quote: "You talking to me?", source: "Taxi Driver", type: "movie" },
  { id: "5", quote: "Life is like a box of chocolates.", source: "Forrest Gump", type: "movie" },
  { id: "6", quote: "I see dead people.", source: "The Sixth Sense", type: "movie" },
  { id: "7", quote: "Why so serious?", source: "The Dark Knight", type: "movie" },
  { id: "8", quote: "To infinity and beyond!", source: "Toy Story", type: "movie" },
  { id: "9", quote: "You can't handle the truth!", source: "A Few Good Men", type: "movie" },
  { id: "10", quote: "I'm the king of the world!", source: "Titanic", type: "movie" },
  { id: "11", quote: "There's no place like home.", source: "The Wizard of Oz", type: "movie" },
  { id: "12", quote: "Say hello to my little friend!", source: "Scarface", type: "movie" },
  { id: "13", quote: "You shall not pass!", source: "Lord of the Rings", type: "movie" },
  { id: "14", quote: "I am Groot.", source: "Guardians of the Galaxy", type: "movie" },
  { id: "15", quote: "Hasta la vista, baby.", source: "Terminator 2", type: "movie" },
  
  // Outer Banks
  { id: "16", quote: "Pogues for life!", source: "Outer Banks", type: "webseries" },
  { id: "17", quote: "We're Pogues, and our mission is to have a good time.", source: "Outer Banks", type: "webseries" },
  { id: "18", quote: "Paradise on Earth is gonna be a Pogue life.", source: "Outer Banks", type: "webseries" },
  { id: "19", quote: "Once a Pogue, always a Pogue.", source: "Outer Banks", type: "webseries" },
  { id: "20", quote: "I'd rather die doing something I love than live doing nothing.", source: "Outer Banks", type: "webseries" },
  { id: "21", quote: "That's what I'm talking about!", source: "Outer Banks", type: "webseries" },
  { id: "22", quote: "Full Kook.", source: "Outer Banks", type: "webseries" },
  
  // TV Shows
  { id: "23", quote: "Winter is coming.", source: "Game of Thrones", type: "tv" },
  { id: "24", quote: "I am the one who knocks!", source: "Breaking Bad", type: "tv" },
  { id: "25", quote: "How you doin'?", source: "Friends", type: "tv" },
  { id: "26", quote: "That's what she said.", source: "The Office", type: "tv" },
  { id: "27", quote: "Bazinga!", source: "The Big Bang Theory", type: "tv" },
  { id: "28", quote: "Suit up!", source: "How I Met Your Mother", type: "tv" },
  { id: "29", quote: "I've made a huge mistake.", source: "Arrested Development", type: "tv" },
  { id: "30", quote: "Cool. Cool cool cool.", source: "Community", type: "tv" },
  
  // More Web Series
  { id: "31", quote: "You're my person.", source: "Grey's Anatomy", type: "tv" },
  { id: "32", quote: "This is the way.", source: "The Mandalorian", type: "webseries" },
  { id: "33", quote: "I have spoken.", source: "The Mandalorian", type: "webseries" },
  { id: "34", quote: "In the end, we only regret the chances we didn't take.", source: "Outer Banks", type: "webseries" },
];

export const getRandomQuote = (): MovieQuote => {
  const randomIndex = Math.floor(Math.random() * movieQuotes.length);
  return movieQuotes[randomIndex];
};
