export const steps = [
  { id: 'input', label: 'Input', skill: 'listening' },
  { id: 'language', label: 'Language', skill: 'reading' },
  { id: 'output', label: 'Output', skill: 'writing' },
  { id: 'fluency', label: 'Fluency', skill: 'reading' },
];

type WordId = 'river' | 'festival' | 'harvest';

export const nationContent: Record<WordId, {
  input: { story: string; options: string[]; correctSentenceIndex: number };
  language: { scrambledWord: string[]; targetWord: string };
  output: { prompt: string; wordBank: string[] };
  fluency: { fastStory: string; question: string; options: { id: string; label: string }[]; correctId: string };
}> = {
  river: {
    input: {
      story: 'A body of water flows through our valley. Many fish live there. People get fresh water from it every day. Villages are built nearby because water is important for life.',
      options: [
        'The river flows through the green valley.',
        'The road flows through the green valley.',
        'The mountain flows through the green valley.',
        'The festival flows through the green valley.',
      ],
      correctSentenceIndex: 0,
    },
    language: {
      scrambledWord: ['r', 'i', 'v', 'e', 'r'],
      targetWord: 'river',
    },
    output: {
      prompt: 'Use the word "river" to describe something near your village',
      wordBank: ['river', 'flows', 'water', 'village', 'through'],
    },
    fluency: {
      fastStory: 'The river flows through the valley. Fish swim in the clear water. People use the river every day.',
      question: 'Complete: The _____ flows through the valley.',
      options: [
        { id: 'a', label: 'river' },
        { id: 'b', label: 'mountain' },
        { id: 'c', label: 'road' },
      ],
      correctId: 'a',
    },
  },
  festival: {
    input: {
      story: 'Every year, our village has a big celebration with music, dance, and special food. Families gather together and children are very happy. People wear colorful clothes and everyone enjoys the day.',
      options: [
        'Every year, our village celebrates a colorful festival.',
        'Every year, our village celebrates a colorful river.',
        'Every year, our village celebrates a colorful harvest.',
        'Every year, our village celebrates a colorful mountain.',
      ],
      correctSentenceIndex: 0,
    },
    language: {
      scrambledWord: ['f', 'e', 's', 't', 'i', 'v', 'a', 'l'],
      targetWord: 'festival',
    },
    output: {
      prompt: 'Use the word "festival" to describe your favorite celebration',
      wordBank: ['festival', 'celebrate', 'music', 'dance', 'special'],
    },
    fluency: {
      fastStory: 'The festival brings joy to everyone. People sing and dance. Special foods are prepared for the festival.',
      question: 'Complete: We celebrate a _____ every year.',
      options: [
        { id: 'a', label: 'festival' },
        { id: 'b', label: 'homework' },
        { id: 'c', label: 'building' },
      ],
      correctId: 'a',
    },
  },
  harvest: {
    input: {
      story: 'Farmers work in the fields to gather crops when they are ripe. This season is very busy and important. Good weather helps them collect all the crops. Everyone works hard during this time.',
      options: [
        'Farmers harvest the crops when they are ripe.',
        'Farmers festival the crops when they are ripe.',
        'Farmers river the crops when they are ripe.',
        'Farmers celebrate the crops when they are ripe.',
      ],
      correctSentenceIndex: 0,
    },
    language: {
      scrambledWord: ['h', 'a', 'r', 'v', 'e', 's', 't'],
      targetWord: 'harvest',
    },
    output: {
      prompt: 'Use the word "harvest" to describe farming work',
      wordBank: ['harvest', 'farmers', 'crops', 'gather', 'fields'],
    },
    fluency: {
      fastStory: 'The harvest brings food for everyone. Farmers work from morning to evening. A good harvest means enough food.',
      question: 'Complete: Farmers _____ the crops in autumn.',
      options: [
        { id: 'a', label: 'harvest' },
        { id: 'b', label: 'destroy' },
        { id: 'c', label: 'ignore' },
      ],
      correctId: 'a',
    },
  },
};
