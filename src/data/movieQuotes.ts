export interface MovieQuote {
  id: string;
  quote: string;
  source: string;
  type: "movie" | "tv" | "webseries";
}

export const movieQuotes: MovieQuote[] = [
  // The classics - everyone knows these
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
  
  // Outer Banks quotes - had to include these
  { id: "16", quote: "Pogues for life!", source: "Outer Banks", type: "webseries" },
  { id: "17", quote: "We're Pogues, and our mission is to have a good time.", source: "Outer Banks", type: "webseries" },
  { id: "18", quote: "Paradise on Earth is gonna be a Pogue life.", source: "Outer Banks", type: "webseries" },
  { id: "19", quote: "Once a Pogue, always a Pogue.", source: "Outer Banks", type: "webseries" },
  { id: "20", quote: "I'd rather die doing something I love than live doing nothing.", source: "Outer Banks", type: "webseries" },
  { id: "21", quote: "That's what I'm talking about!", source: "Outer Banks", type: "webseries" },
  { id: "22", quote: "Full Kook.", source: "Outer Banks", type: "webseries" },
  
  // TV show quotes - some real bangers here
  { id: "23", quote: "Winter is coming.", source: "Game of Thrones", type: "tv" },
  { id: "24", quote: "I am the one who knocks!", source: "Breaking Bad", type: "tv" },
  { id: "25", quote: "How you doin'?", source: "Friends", type: "tv" },
  { id: "26", quote: "That's what she said.", source: "The Office", type: "tv" },
  { id: "27", quote: "Bazinga!", source: "The Big Bang Theory", type: "tv" },
  { id: "28", quote: "Suit up!", source: "How I Met Your Mother", type: "tv" },
  { id: "29", quote: "I've made a huge mistake.", source: "Arrested Development", type: "tv" },
  { id: "30", quote: "Cool. Cool cool cool.", source: "Community", type: "tv" },
  
  // More shows and web series
  { id: "31", quote: "You're my person.", source: "Grey's Anatomy", type: "tv" },
  { id: "32", quote: "This is the way.", source: "The Mandalorian", type: "webseries" },
  { id: "33", quote: "I have spoken.", source: "The Mandalorian", type: "webseries" },
  { id: "34", quote: "In the end, we only regret the chances we didn't take.", source: "Outer Banks", type: "webseries" },
  
  // More classic movie quotes - longer ones
  { id: "35", quote: "I'm going to make him an offer he can't refuse.", source: "The Godfather", type: "movie" },
  { id: "36", quote: "Frankly, my dear, I don't give a damn.", source: "Gone with the Wind", type: "movie" },
  { id: "37", quote: "I feel the need, the need for speed!", source: "Top Gun", type: "movie" },
  { id: "38", quote: "Houston, we have a problem.", source: "Apollo 13", type: "movie" },
  { id: "39", quote: "You had me at hello.", source: "Jerry Maguire", type: "movie" },
  { id: "40", quote: "Keep your friends close, but your enemies closer.", source: "The Godfather Part II", type: "movie" },
  { id: "41", quote: "The first rule of Fight Club is you do not talk about Fight Club.", source: "Fight Club", type: "movie" },
  { id: "42", quote: "I'm the one who has to die when it's time for me to die.", source: "Pulp Fiction", type: "movie" },
  { id: "43", quote: "We'll always have Paris.", source: "Casablanca", type: "movie" },
  { id: "44", quote: "I see now that the circumstances of one's birth are irrelevant.", source: "The Matrix", type: "movie" },
  { id: "45", quote: "I'll have what she's having.", source: "When Harry Met Sally", type: "movie" },
  { id: "46", quote: "You complete me.", source: "Jerry Maguire", type: "movie" },
  { id: "47", quote: "Nobody puts Baby in a corner.", source: "Dirty Dancing", type: "movie" },
  { id: "48", quote: "I'm king of the world!", source: "Titanic", type: "movie" },
  { id: "49", quote: "Gentlemen, you can't fight in here! This is the War Room!", source: "Dr. Strangelove", type: "movie" },
  { id: "50", quote: "I'm walking here! I'm walking here!", source: "Midnight Cowboy", type: "movie" },
  { id: "51", quote: "My name is Inigo Montoya. You killed my father. Prepare to die.", source: "The Princess Bride", type: "movie" },
  { id: "52", quote: "There's no crying in baseball!", source: "A League of Their Own", type: "movie" },
  { id: "53", quote: "It's not what you look like when you're doing what you're doing.", source: "Titanic", type: "movie" },
  { id: "54", quote: "I love the smell of napalm in the morning.", source: "Apocalypse Now", type: "movie" },
  { id: "55", quote: "May the Force be with you always.", source: "Star Wars", type: "movie" },
  { id: "56", quote: "I'm going to need a bigger boat.", source: "Jaws", type: "movie" },
  { id: "57", quote: "E.T. phone home.", source: "E.T. the Extra-Terrestrial", type: "movie" },
  { id: "58", quote: "You're gonna need a bigger boat.", source: "Jaws", type: "movie" },
  { id: "59", quote: "I'm the Dude. So that's what you call me.", source: "The Big Lebowski", type: "movie" },
  { id: "60", quote: "Here's Johnny!", source: "The Shining", type: "movie" },
  { id: "61", quote: "You can't handle the truth!", source: "A Few Good Men", type: "movie" },
  { id: "62", quote: "I'll be back, and next time it won't be so easy.", source: "The Terminator", type: "movie" },
  { id: "63", quote: "Do or do not. There is no try.", source: "Star Wars", type: "movie" },
  { id: "64", quote: "The name's Bond. James Bond.", source: "Dr. No", type: "movie" },
  { id: "65", quote: "I see dead people walking around like regular people.", source: "The Sixth Sense", type: "movie" },
  
  // More TV show quotes - longer ones
  { id: "66", quote: "I am not in danger, Skyler. I am the danger.", source: "Breaking Bad", type: "tv" },
  { id: "67", quote: "It's not a lie if you believe it.", source: "Seinfeld", type: "tv" },
  { id: "68", quote: "I'm not superstitious, but I am a little stitious.", source: "The Office", type: "tv" },
  { id: "69", quote: "That's what she said!", source: "The Office", type: "tv" },
  { id: "70", quote: "Challenge accepted!", source: "How I Met Your Mother", type: "tv" },
  { id: "71", quote: "I have always depended on the kindness of strangers.", source: "A Streetcar Named Desire", type: "movie" },
  { id: "72", quote: "I don't know half of you half as well as I should like.", source: "Lord of the Rings", type: "movie" },
  { id: "73", quote: "The only way out is through.", source: "Inception", type: "movie" },
  { id: "74", quote: "I could've been a contender.", source: "On the Waterfront", type: "movie" },
  { id: "75", quote: "I'm mad as hell, and I'm not going to take this anymore!", source: "Network", type: "movie" },
  { id: "76", quote: "Carpe diem. Seize the day, boys.", source: "Dead Poets Society", type: "movie" },
  { id: "77", quote: "I'm going to make him an offer he can't refuse.", source: "The Godfather", type: "movie" },
  { id: "78", quote: "Fasten your seatbelts. It's going to be a bumpy night.", source: "All About Eve", type: "movie" },
  { id: "79", quote: "You had me at hello, but you lost me at goodbye.", source: "Jerry Maguire", type: "movie" },
  { id: "80", quote: "I'm having an old friend for dinner.", source: "The Silence of the Lambs", type: "movie" },
  { id: "81", quote: "I'll be right here waiting for you.", source: "E.T. the Extra-Terrestrial", type: "movie" },
  { id: "82", quote: "I feel like we're in a really expensive therapy session.", source: "The Avengers", type: "movie" },
  { id: "83", quote: "I'm just a girl, standing in front of a boy, asking him to love her.", source: "Notting Hill", type: "movie" },
  { id: "84", quote: "I see now that the circumstances of one's birth are irrelevant.", source: "The Matrix", type: "movie" },
  { id: "85", quote: "I am Iron Man. The truth is, I am Iron Man.", source: "Iron Man", type: "movie" },
  { id: "86", quote: "I don't want to survive. I want to live.", source: "12 Years a Slave", type: "movie" },
  { id: "87", quote: "I'll be back, and this time, I'm bringing my friends.", source: "The Terminator", type: "movie" },
  { id: "88", quote: "You can't change the past, but you can learn from it.", source: "The Lion King", type: "movie" },
  { id: "89", quote: "I'm the one who knocks, not the one who gets knocked.", source: "Breaking Bad", type: "tv" },
  { id: "90", quote: "Winter is coming, and we must prepare for the long night.", source: "Game of Thrones", type: "tv" },
  { id: "91", quote: "I have spoken, and what I say goes.", source: "The Mandalorian", type: "webseries" },
  { id: "92", quote: "This is the way we do things around here.", source: "The Mandalorian", type: "webseries" },
  { id: "93", quote: "I'd rather be a Pogue than a Kook any day.", source: "Outer Banks", type: "webseries" },
  { id: "94", quote: "We're Pogues, and we stick together no matter what.", source: "Outer Banks", type: "webseries" },
  { id: "95", quote: "The only way to get through this is together.", source: "Stranger Things", type: "tv" },
  { id: "96", quote: "I'm not going to let you face this alone.", source: "Stranger Things", type: "tv" },
  { id: "97", quote: "Friends don't lie, and we're definitely friends.", source: "Stranger Things", type: "tv" },
  { id: "98", quote: "I have a feeling we're not in Kansas anymore.", source: "The Wizard of Oz", type: "movie" },
  { id: "99", quote: "There's no place like home, and home is where the heart is.", source: "The Wizard of Oz", type: "movie" },
  { id: "100", quote: "I'll get you, my pretty, and your little dog too!", source: "The Wizard of Oz", type: "movie" },
];

export const getRandomQuote = (): MovieQuote => {
  const randomIndex = Math.floor(Math.random() * movieQuotes.length);
  return movieQuotes[randomIndex];
};
