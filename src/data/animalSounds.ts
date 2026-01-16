export interface AnimalSound {
  id: string;
  name: string;
  icon: string;
  backgroundColor: string;
  accentColor: string;
  sfxPrompt: string;
  voiceSettings: {
    rate: number;
    pitch: number;
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
    voiceSettings: { rate: 0.6, pitch: 0.3 },
  },
  {
    id: "cat",
    name: "Cat",
    icon: "https://img.icons8.com/keek/100/cat.png",
    backgroundColor: "#FFF8E1",
    accentColor: "#F7B801",
    sfxPrompt: "cat meowing cute domestic cat sound",
    voiceSettings: { rate: 1.0, pitch: 1.8 },
  },
  {
    id: "dog",
    name: "Dog",
    icon: "https://img.icons8.com/plasticine/50/dog.png",
    backgroundColor: "#E1F5FE",
    accentColor: "#00B4D8",
    sfxPrompt: "dog barking excitedly friendly dog bark",
    voiceSettings: { rate: 1.5, pitch: 1.2 },
  },
  {
    id: "lion",
    name: "Lion",
    icon: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-lion-animal-flaticons-lineal-color-flat-icons-3.png",
    backgroundColor: "#FFE0B2",
    accentColor: "#FB8500",
    sfxPrompt: "lion roaring powerful jungle king roar",
    voiceSettings: { rate: 0.7, pitch: 0.2 },
  },
  {
    id: "duck",
    name: "Duck",
    icon: "https://img.icons8.com/plasticine/100/duck.png",
    backgroundColor: "#E0F7FA",
    accentColor: "#90E0EF",
    sfxPrompt: "duck quacking funny cartoon duck quack",
    voiceSettings: { rate: 1.3, pitch: 1.9 },
  },
  {
    id: "pig",
    name: "Pig",
    icon: "https://img.icons8.com/external-bearicons-outline-color-bearicons/64/external-Pig-chinese-new-year-bearicons-outline-color-bearicons.png",
    backgroundColor: "#FCE4EC",
    accentColor: "#E63946",
    sfxPrompt: "pig snorting and oinking farm pig sound",
    voiceSettings: { rate: 0.8, pitch: 0.9 },
  },
];

export const getRandomAnimal = (): AnimalSound => {
  const randomIndex = Math.floor(Math.random() * animalSounds.length);
  return animalSounds[randomIndex];
};
