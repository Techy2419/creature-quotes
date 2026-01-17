// Movie quote data - all quotes are at least 4 words (removed shorter ones)
export interface MovieQuote {
  id: string;
  quote: string;
  source: string;
  type: "movie" | "tv" | "webseries";
}

export const movieQuotes: MovieQuote[] = [
  // MCU - Marvel Cinematic Universe (25 quotes)
  // Added a bunch of these because they're iconic and work great for mashups
  { id: "1", quote: "I am Iron Man.", source: "Iron Man", type: "movie" },
  { id: "2", quote: "I can do this all day.", source: "Captain America: The First Avenger", type: "movie" },
  { id: "3", quote: "That's my secret, Captain. I'm always angry.", source: "The Avengers", type: "movie" },
  { id: "4", quote: "We have a Hulk.", source: "The Avengers", type: "movie" },
  { id: "5", quote: "I'm with you until the end of the line.", source: "Captain America: The Winter Soldier", type: "movie" },
  { id: "6", quote: "I am Steve Rogers.", source: "Captain America: The First Avenger", type: "movie" },
  { id: "7", quote: "Dread it, run from it, destiny arrives all the same.", source: "Avengers: Infinity War", type: "movie" },
  { id: "8", quote: "I don't feel so good.", source: "Avengers: Infinity War", type: "movie" },
  { id: "9", quote: "I love you three thousand.", source: "Avengers: Endgame", type: "movie" },
  { id: "10", quote: "And I am Iron Man.", source: "Avengers: Endgame", type: "movie" },
  { id: "11", quote: "We're in the endgame now.", source: "Avengers: Infinity War", type: "movie" },
  { id: "12", quote: "With great power comes great responsibility.", source: "Spider-Man", type: "movie" },
  { id: "13", quote: "I'm just a friendly neighborhood Spider-Man.", source: "Spider-Man: Homecoming", type: "movie" },
  { id: "14", quote: "I don't want to go.", source: "Avengers: Infinity War", type: "movie" },
  { id: "15", quote: "You should have gone for the head.", source: "Avengers: Infinity War", type: "movie" },
  { id: "16", quote: "The hardest choices require the strongest wills.", source: "Avengers: Infinity War", type: "movie" },
  { id: "17", quote: "I can't control their fear, only my own.", source: "Captain America: Civil War", type: "movie" },
  { id: "18", quote: "This is the fight of our lives.", source: "Avengers: Endgame", type: "movie" },
  { id: "19", quote: "Let me put this on you.", source: "Avengers: Endgame", type: "movie" },
  { id: "20", quote: "I'm going to make him an offer he can't refuse.", source: "The Avengers", type: "movie" },
  { id: "21", quote: "We're the Avengers, we can bust arms dealers all the live long day.", source: "The Avengers", type: "movie" },
  { id: "22", quote: "There was an idea to bring together a group of remarkable people.", source: "The Avengers", type: "movie" },
  { id: "23", quote: "I'm not looking for forgiveness, and I'm way past asking permission.", source: "Avengers: Endgame", type: "movie" },
  { id: "24", quote: "I don't want to kill anyone. I don't enjoy it.", source: "The Avengers", type: "movie" },
  { id: "25", quote: "You're not the guy to make the sacrifice play, to lay down on a wire.", source: "The Avengers", type: "movie" },
  
  // Harry Potter (15 quotes)
  { id: "26", quote: "It does not do to dwell on dreams and forget to live.", source: "Harry Potter and the Philosopher's Stone", type: "movie" },
  { id: "27", quote: "Happiness can be found even in the darkest of times.", source: "Harry Potter and the Prisoner of Azkaban", type: "movie" },
  { id: "28", quote: "It is our choices that show what we truly are.", source: "Harry Potter and the Chamber of Secrets", type: "movie" },
  { id: "29", quote: "After all this time? Always.", source: "Harry Potter and the Deathly Hallows", type: "movie" },
  { id: "30", quote: "I solemnly swear that I am up to no good.", source: "Harry Potter and the Prisoner of Azkaban", type: "movie" },
  { id: "31", quote: "You're a wizard, Harry.", source: "Harry Potter and the Philosopher's Stone", type: "movie" },
  { id: "32", quote: "It takes a great deal of bravery to stand up to our enemies.", source: "Harry Potter and the Philosopher's Stone", type: "movie" },
  { id: "33", quote: "The ones that love us never really leave us.", source: "Harry Potter and the Prisoner of Azkaban", type: "movie" },
  { id: "34", quote: "We've all got both light and dark inside us.", source: "Harry Potter and the Order of the Phoenix", type: "movie" },
  { id: "35", quote: "I am what I am, an' I'm not ashamed.", source: "Harry Potter and the Goblet of Fire", type: "movie" },
  { id: "36", quote: "It is the unknown we fear when we look upon death.", source: "Harry Potter and the Half-Blood Prince", type: "movie" },
  { id: "37", quote: "Do not pity the dead, Harry. Pity the living.", source: "Harry Potter and the Deathly Hallows", type: "movie" },
  { id: "38", quote: "Words are, in my not so humble opinion, our most inexhaustible source of magic.", source: "Harry Potter and the Deathly Hallows", type: "movie" },
  { id: "39", quote: "You're just as sane as I am.", source: "Harry Potter and the Order of the Phoenix", type: "movie" },
  { id: "40", quote: "It is important to fight and fight again and keep fighting.", source: "Harry Potter and the Order of the Phoenix", type: "movie" },
  
  // Outer Banks (10 quotes)
  { id: "41", quote: "Pogues for life, that's how we roll.", source: "Outer Banks", type: "webseries" },
  { id: "42", quote: "We're Pogues, and our mission is to have a good time.", source: "Outer Banks", type: "webseries" },
  { id: "43", quote: "Paradise on Earth is gonna be a Pogue life.", source: "Outer Banks", type: "webseries" },
  { id: "44", quote: "Once a Pogue, always a Pogue, no matter what.", source: "Outer Banks", type: "webseries" },
  { id: "45", quote: "I'd rather die doing something I love than live doing nothing.", source: "Outer Banks", type: "webseries" },
  { id: "46", quote: "That's what I'm talking about right there!", source: "Outer Banks", type: "webseries" },
  { id: "47", quote: "In the end, we only regret the chances we didn't take.", source: "Outer Banks", type: "webseries" },
  { id: "48", quote: "We stick together no matter what happens.", source: "Outer Banks", type: "webseries" },
  { id: "49", quote: "I'd rather be a Pogue than a Kook any day.", source: "Outer Banks", type: "webseries" },
  { id: "50", quote: "We're Pogues, and we stick together no matter what.", source: "Outer Banks", type: "webseries" },
  
  // Stranger Things (15 quotes)
  { id: "51", quote: "The only way to get through this is together.", source: "Stranger Things", type: "tv" },
  { id: "52", quote: "I'm not going to let you face this alone.", source: "Stranger Things", type: "tv" },
  { id: "53", quote: "Friends don't lie, and we're definitely friends.", source: "Stranger Things", type: "tv" },
  { id: "54", quote: "Mornings are for coffee and contemplation.", source: "Stranger Things", type: "tv" },
  { id: "55", quote: "You're going to take on the whole army by yourself?", source: "Stranger Things", type: "tv" },
  { id: "56", quote: "I'm going to my grave and I'm taking you with me.", source: "Stranger Things", type: "tv" },
  { id: "57", quote: "We're all in this together, no matter what happens.", source: "Stranger Things", type: "tv" },
  { id: "58", quote: "The world is turning upside down.", source: "Stranger Things", type: "tv" },
  { id: "59", quote: "I'm going to find you, I promise.", source: "Stranger Things", type: "tv" },
  { id: "60", quote: "You can't spell America without Erica.", source: "Stranger Things", type: "tv" },
  { id: "61", quote: "I'm going to keep you safe, I promise.", source: "Stranger Things", type: "tv" },
  { id: "62", quote: "We need to stick together no matter what.", source: "Stranger Things", type: "tv" },
  { id: "63", quote: "The truth is stranger than fiction, and this is definitely strange.", source: "Stranger Things", type: "tv" },
  { id: "64", quote: "I'm not going to let anything happen to you.", source: "Stranger Things", type: "tv" },
  { id: "65", quote: "We're going to get through this together, I promise.", source: "Stranger Things", type: "tv" },
  
  // Classic Movies (20 quotes - all 4+ words)
  { id: "66", quote: "May the Force be with you.", source: "Star Wars", type: "movie" },
  { id: "67", quote: "Here's looking at you, kid.", source: "Casablanca", type: "movie" },
  { id: "68", quote: "You talking to me?", source: "Taxi Driver", type: "movie" },
  { id: "69", quote: "Life is like a box of chocolates.", source: "Forrest Gump", type: "movie" },
  { id: "70", quote: "I see dead people.", source: "The Sixth Sense", type: "movie" },
  { id: "71", quote: "You can't handle the truth!", source: "A Few Good Men", type: "movie" },
  { id: "72", quote: "I'm the king of the world!", source: "Titanic", type: "movie" },
  { id: "73", quote: "There's no place like home.", source: "The Wizard of Oz", type: "movie" },
  { id: "74", quote: "Say hello to my little friend!", source: "Scarface", type: "movie" },
  { id: "75", quote: "You shall not pass!", source: "Lord of the Rings", type: "movie" },
  { id: "76", quote: "Hasta la vista, baby.", source: "Terminator 2", type: "movie" },
  { id: "77", quote: "I'm going to make him an offer he can't refuse.", source: "The Godfather", type: "movie" },
  { id: "78", quote: "Frankly, my dear, I don't give a damn.", source: "Gone with the Wind", type: "movie" },
  { id: "79", quote: "I feel the need, the need for speed!", source: "Top Gun", type: "movie" },
  { id: "80", quote: "Houston, we have a problem.", source: "Apollo 13", type: "movie" },
  { id: "81", quote: "You had me at hello.", source: "Jerry Maguire", type: "movie" },
  { id: "82", quote: "Keep your friends close, but your enemies closer.", source: "The Godfather Part II", type: "movie" },
  { id: "83", quote: "The first rule of Fight Club is you do not talk about Fight Club.", source: "Fight Club", type: "movie" },
  { id: "84", quote: "Do or do not. There is no try.", source: "Star Wars", type: "movie" },
  { id: "85", quote: "I'm going to need a bigger boat.", source: "Jaws", type: "movie" },
  
  // More TV Shows (10 quotes - all 4+ words)
  { id: "86", quote: "I am the one who knocks!", source: "Breaking Bad", type: "tv" },
  { id: "87", quote: "That's what she said.", source: "The Office", type: "tv" },
  { id: "88", quote: "I've made a huge mistake.", source: "Arrested Development", type: "tv" },
  { id: "89", quote: "Cool. Cool cool cool.", source: "Community", type: "tv" },
  { id: "90", quote: "This is the way.", source: "The Mandalorian", type: "webseries" },
  { id: "91", quote: "I am not in danger, Skyler. I am the danger.", source: "Breaking Bad", type: "tv" },
  { id: "92", quote: "It's not a lie if you believe it.", source: "Seinfeld", type: "tv" },
  { id: "93", quote: "I'm not superstitious, but I am a little stitious.", source: "The Office", type: "tv" },
  { id: "94", quote: "I don't want to survive. I want to live.", source: "Breaking Bad", type: "tv" },
  { id: "95", quote: "The only way out is through.", source: "The Office", type: "tv" },
];

// Track last quote to avoid showing the same one twice in a row
let lastQuoteId: string | null = null;

// Pick a random quote, but try to avoid the same one twice in a row
export const getRandomQuote = (): MovieQuote => {
  let quote: MovieQuote;
  let attempts = 0;
  
  // Try to avoid same quote twice in a row (max 5 attempts)
  // After 5 attempts, just return whatever we got - better than infinite loop
  do {
    const randomIndex = Math.floor(Math.random() * movieQuotes.length);
    quote = movieQuotes[randomIndex];
    attempts++;
  } while (quote.id === lastQuoteId && movieQuotes.length > 1 && attempts < 5);
  
  lastQuoteId = quote.id;
  return quote;
};
