import type { JourneyStep } from '../../types';

export const steps: JourneyStep[] = [
  { id: 'remember', label: 'Remember', skill: 'listening' },
  { id: 'understand', label: 'Understand', skill: 'reading' },
  { id: 'apply', label: 'Apply', skill: 'writing' },
  { id: 'analyze', label: 'Analyze', skill: 'reading' },
  { id: 'evaluate', label: 'Evaluate', skill: 'reading' },
  { id: 'create', label: 'Create', skill: 'writing' },
];

// Content data for each word
export const bloomsContent = {
  river: {
    remember: {
      choices: [
        { id: 'river', label: 'river' },
        { id: 'rain', label: 'rain' },
        { id: 'road', label: 'road' },
      ],
      correctId: 'river',
    },
    understand: {
      choices: [
        {
          id: 'correct',
          label: 'A large natural stream of water flowing to the sea, lake, or another river',
        },
        { id: 'wrong1', label: 'A man-made canal or waterway built for transportation' },
        { id: 'wrong2', label: 'A small pond where animals drink water' },
      ],
      correctId: 'correct',
    },
    apply: {
      sentence: 'The _____ flows through our village.',
      correctAnswer: 'river',
      wordBank: ['river', 'mountain', 'festival'],
    },
    analyze: {
      synonyms: ['stream', 'waterway'],
      notRelated: ['desert', 'mountain'],
      allWords: ['stream', 'waterway', 'desert', 'mountain'],
    },
    evaluate: {
      sentences: [
        {
          id: 'correct',
          text: 'The children played near the river bank, watching the water flow.',
          isCorrect: true,
        },
        {
          id: 'wrong1',
          text: 'We planted a river in our garden and watered it daily.',
          isCorrect: false,
        },
        {
          id: 'wrong2',
          text: 'The river spoke loudly and told us stories.',
          isCorrect: false,
        },
      ],
      explanation:
        'Rivers are bodies of water that flow, not things we plant or that can speak.',
    },
    create: {
      allowedCollocations: ['river bank', 'river flow', 'river water', 'cross river', 'near river'],
    },
  },
  festival: {
    remember: {
      choices: [
        { id: 'festival', label: 'festival' },
        { id: 'forest', label: 'forest' },
        { id: 'family', label: 'family' },
      ],
      correctId: 'festival',
    },
    understand: {
      choices: [
        {
          id: 'correct',
          label: 'A day or period of celebration for religious or cultural reasons',
        },
        { id: 'wrong1', label: 'A place where people gather to buy vegetables' },
        { id: 'wrong2', label: 'A type of food eaten during special occasions' },
      ],
      correctId: 'correct',
    },
    apply: {
      sentence: 'We celebrate Diwali, a _____ of lights.',
      correctAnswer: 'festival',
      wordBank: ['festival', 'harvest', 'river'],
    },
    analyze: {
      synonyms: ['celebration', 'ceremony'],
      notRelated: ['school', 'hospital'],
      allWords: ['celebration', 'ceremony', 'school', 'hospital'],
    },
    evaluate: {
      sentences: [
        {
          id: 'correct',
          text: 'During the festival, families gather to celebrate together with music and food.',
          isCorrect: true,
        },
        {
          id: 'wrong1',
          text: 'I wore my festival to school yesterday.',
          isCorrect: false,
        },
        {
          id: 'wrong2',
          text: 'The festival grew taller every day in the field.',
          isCorrect: false,
        },
      ],
      explanation: 'A festival is an event or celebration, not something you wear or that grows.',
    },
    create: {
      allowedCollocations: [
        'celebrate festival',
        'festival celebration',
        'festival time',
        'during festival',
        'festival day',
      ],
    },
  },
  harvest: {
    remember: {
      choices: [
        { id: 'harvest', label: 'harvest' },
        { id: 'happy', label: 'happy' },
        { id: 'hospital', label: 'hospital' },
      ],
      correctId: 'harvest',
    },
    understand: {
      choices: [
        {
          id: 'correct',
          label: 'The process or period of gathering crops from the fields',
        },
        { id: 'wrong1', label: 'A tool used to dig the soil' },
        { id: 'wrong2', label: 'A season when it rains heavily' },
      ],
      correctId: 'correct',
    },
    apply: {
      sentence: 'Farmers celebrate after a good _____.',
      correctAnswer: 'harvest',
      wordBank: ['harvest', 'festival', 'river'],
    },
    analyze: {
      synonyms: ['crop', 'gathering'],
      notRelated: ['planting', 'rain'],
      allWords: ['crop', 'gathering', 'planting', 'rain'],
    },
    evaluate: {
      sentences: [
        {
          id: 'correct',
          text: 'The harvest season brings joy to farmers who worked hard all year.',
          isCorrect: true,
        },
        {
          id: 'wrong1',
          text: 'We swam in the harvest on a hot summer day.',
          isCorrect: false,
        },
        {
          id: 'wrong2',
          text: 'The harvest sang songs and danced at the party.',
          isCorrect: false,
        },
      ],
      explanation:
        'Harvest refers to gathering crops, not a place to swim or something that can sing.',
    },
    create: {
      allowedCollocations: [
        'harvest time',
        'harvest season',
        'good harvest',
        'harvest crops',
        'after harvest',
      ],
    },
  },
};
