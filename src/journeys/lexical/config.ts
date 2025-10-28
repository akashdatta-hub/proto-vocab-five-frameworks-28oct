export const steps = [
  { id: 'form', label: 'Form', skill: 'listening' },
  { id: 'meaning', label: 'Meaning', skill: 'reading' },
  { id: 'use', label: 'Use', skill: 'reading' },
  { id: 'associations', label: 'Associations', skill: 'reading' },
  { id: 'morphology', label: 'Morphology', skill: 'writing' },
  { id: 'nuances', label: 'Nuances', skill: 'reading' },
];

type WordId = 'river' | 'festival' | 'harvest';

export const lexicalContent: Record<WordId, {
  form: { letters: string[]; targetWord: string };
  meaning: { definitions: { id: string; text: string; isCorrect: boolean }[] };
  use: { sentences: { id: string; context: string; text: string; isCorrect: boolean }[] };
  associations: { words: string[]; relatedWords: string[] };
  morphology: { baseWord: string; derivedForm: string; sentence: string };
  nuances: { sentences: { id: string; text: string; usage: string; isAcceptable: boolean }[] };
}> = {
  river: {
    form: {
      letters: ['r', 'i', 'v', 'e', 'r'],
      targetWord: 'river',
    },
    meaning: {
      definitions: [
        { id: 'a', text: 'A large natural stream of flowing water', isCorrect: true },
        { id: 'b', text: 'A type of mountain peak', isCorrect: false },
        { id: 'c', text: 'A man-made building structure', isCorrect: false },
      ],
    },
    use: {
      sentences: [
        { id: 'a', context: 'Formal', text: 'The river provides essential water resources.', isCorrect: true },
        { id: 'b', context: 'Informal', text: 'Let\'s go play by the river!', isCorrect: true },
        { id: 'c', context: 'Wrong', text: 'I wore my river to school today.', isCorrect: false },
      ],
    },
    associations: {
      words: ['water', 'flow', 'stream', 'ocean', 'mountain', 'building'],
      relatedWords: ['water', 'flow', 'stream', 'ocean'],
    },
    morphology: {
      baseWord: 'river',
      derivedForm: 'riverside',
      sentence: 'We walked along the _____ path.',
    },
    nuances: {
      sentences: [
        { id: 'a', text: 'The river flows to the ocean.', usage: 'Literal', isAcceptable: true },
        { id: 'b', text: 'A river of people flowed through the streets.', usage: 'Figurative', isAcceptable: true },
        { id: 'c', text: 'The river sang a song.', usage: 'Incorrect personification', isAcceptable: false },
      ],
    },
  },
  festival: {
    form: {
      letters: ['f', 'e', 's', 't', 'i', 'v', 'a', 'l'],
      targetWord: 'festival',
    },
    meaning: {
      definitions: [
        { id: 'a', text: 'A celebration or series of events with entertainment', isCorrect: true },
        { id: 'b', text: 'A type of writing tool', isCorrect: false },
        { id: 'c', text: 'A weather condition', isCorrect: false },
      ],
    },
    use: {
      sentences: [
        { id: 'a', context: 'Formal', text: 'The annual festival commemorates our cultural heritage.', isCorrect: true },
        { id: 'b', context: 'Informal', text: 'The festival was so much fun!', isCorrect: true },
        { id: 'c', context: 'Wrong', text: 'I cut paper with my festival.', isCorrect: false },
      ],
    },
    associations: {
      words: ['celebration', 'music', 'dance', 'tradition', 'pencil', 'rain'],
      relatedWords: ['celebration', 'music', 'dance', 'tradition'],
    },
    morphology: {
      baseWord: 'festival',
      derivedForm: 'festive',
      sentence: 'The decorations created a _____ atmosphere.',
    },
    nuances: {
      sentences: [
        { id: 'a', text: 'We attended the music festival.', usage: 'Literal', isAcceptable: true },
        { id: 'b', text: 'It was a festival of colors.', usage: 'Figurative', isAcceptable: true },
        { id: 'c', text: 'The festival walked to the market.', usage: 'Nonsensical', isAcceptable: false },
      ],
    },
  },
  harvest: {
    form: {
      letters: ['h', 'a', 'r', 'v', 'e', 's', 't'],
      targetWord: 'harvest',
    },
    meaning: {
      definitions: [
        { id: 'a', text: 'The process of gathering ripe crops', isCorrect: true },
        { id: 'b', text: 'A type of vehicle', isCorrect: false },
        { id: 'c', text: 'A school subject', isCorrect: false },
      ],
    },
    use: {
      sentences: [
        { id: 'a', context: 'Formal', text: 'The harvest yield was excellent this year.', isCorrect: true },
        { id: 'b', context: 'Informal', text: 'Time to harvest the vegetables!', isCorrect: true },
        { id: 'c', context: 'Wrong', text: 'I drove my harvest to town.', isCorrect: false },
      ],
    },
    associations: {
      words: ['crops', 'gather', 'farmers', 'autumn', 'car', 'book'],
      relatedWords: ['crops', 'gather', 'farmers', 'autumn'],
    },
    morphology: {
      baseWord: 'harvest',
      derivedForm: 'harvester',
      sentence: 'The _____ collected all the wheat.',
    },
    nuances: {
      sentences: [
        { id: 'a', text: 'We harvest the rice in October.', usage: 'Literal', isAcceptable: true },
        { id: 'b', text: 'She harvested the benefits of hard work.', usage: 'Figurative', isAcceptable: true },
        { id: 'c', text: 'The harvest is very tall and green.', usage: 'Category error', isAcceptable: false },
      ],
    },
  },
};
