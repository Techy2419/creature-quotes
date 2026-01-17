// Animal sound config - each animal has its own voice settings and sound file
export interface AnimalSound {
  id: string;
  name: string;
  icon: string;
  backgroundColor: string;
  accentColor: string;
  sfxPrompt: string; // Not used anymore but keeping it for reference
  soundUrl: string; // Local MP3 file path in public/sounds/
  voiceSettings: {
    stability: number; // How consistent the voice is (0-1)
    similarity_boost: number; // How much it sounds like the original voice (0-1)
  };
}

export const animalSounds: AnimalSound[] = [
  {
    id: "cow",
    name: "Cow",
    icon: "https://img.icons8.com/external-victoruler-linear-colour-victoruler/64/external-cow-farming-victoruler-linear-colour-victoruler-1.png",
    backgroundColor: "#FFE5DC",
    accentColor: "#FF6B35",
    sfxPrompt: "cow mooing loudly on a farm",
    soundUrl: "/sounds/cow.mp3",
    voiceSettings: { stability: 0.3, similarity_boost: 0.4 },
  },
  {
    id: "cat",
    name: "Cat",
    icon: "https://img.icons8.com/keek/100/cat.png",
    backgroundColor: "#FFF8E1",
    accentColor: "#F7B801",
    sfxPrompt: "cat meowing cute domestic cat sound",
    soundUrl: "/sounds/cat.mp3",
    voiceSettings: { stability: 0.7, similarity_boost: 0.8 },
  },
  {
    id: "dog",
    name: "Dog",
    icon: "https://img.icons8.com/plasticine/50/dog.png",
    backgroundColor: "#E1F5FE",
    accentColor: "#00B4D8",
    sfxPrompt: "dog barking excitedly friendly dog bark",
    soundUrl: "/sounds/dog.mp3",
    voiceSettings: { stability: 0.5, similarity_boost: 0.9 },
  },
  {
    id: "lion",
    name: "Lion",
    icon: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-lion-animal-flaticons-lineal-color-flat-icons-3.png",
    backgroundColor: "#FFE0B2",
    accentColor: "#FB8500",
    sfxPrompt: "lion roaring powerful jungle king roar",
    soundUrl: "/sounds/lion.mp3",
    voiceSettings: { stability: 0.2, similarity_boost: 0.3 },
  },
  {
    id: "duck",
    name: "Duck",
    icon: "https://img.icons8.com/plasticine/100/duck.png",
    backgroundColor: "#E0F7FA",
    accentColor: "#90E0EF",
    sfxPrompt: "duck quacking funny cartoon duck quack",
    soundUrl: "/sounds/duck.mp3",
    voiceSettings: { stability: 0.8, similarity_boost: 0.7 },
  },
  {
    id: "pig",
    name: "Pig",
    icon: "https://img.icons8.com/external-bearicons-outline-color-bearicons/64/external-Pig-chinese-new-year-bearicons-outline-color-bearicons.png",
    backgroundColor: "#FCE4EC",
    accentColor: "#E63946",
    sfxPrompt: "pig snorting and oinking farm pig sound",
    soundUrl: "/sounds/pig.mp3",
    voiceSettings: { stability: 0.4, similarity_boost: 0.6 },
  },
];

// Pick a random animal - useful for chaos mode fallbacks
export const getRandomAnimal = (): AnimalSound => {
  const randomIndex = Math.floor(Math.random() * animalSounds.length);
  return animalSounds[randomIndex];
};
