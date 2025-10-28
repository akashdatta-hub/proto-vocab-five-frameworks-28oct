export const steps = [
  { id: 'explain', label: 'Explain', skill: 'reading' },
  { id: 'restate', label: 'Restate', skill: 'writing' },
  { id: 'visualize', label: 'Visualize', skill: 'reading' },
  { id: 'engage', label: 'Engage', skill: 'reading' },
  { id: 'discuss', label: 'Discuss', skill: 'reading' },
  { id: 'review', label: 'Review', skill: 'writing' },
];

type WordId = 'river' | 'festival' | 'harvest';

export const marzanoContent: Record<WordId, {
  explain: { definition: string };
  restate: { prompt: string; keyWords: string[] };
  visualize: { requiredIcons: string[]; allIcons: string[] };
  engage: { examples: { id: string; text: string; isCorrect: boolean }[] };
  discuss: { explanations: { id: string; student: string; text: string; isCorrect: boolean }[]; rationale: string };
  review: { questions: { id: string; type: string; question: string; options?: { id: string; label: string }[]; correctId?: string; correctAnswer?: string }[] };
}> = {
  river: {
    explain: {
      definition: 'A river is a large natural stream of water that flows in a channel to the sea, a lake, or another river.',
    },
    restate: {
      prompt: 'In your own words, what is a river?',
      keyWords: ['water', 'flows', 'stream'],
    },
    visualize: {
      requiredIcons: ['water', 'flow'],
      allIcons: ['water', 'flow', 'boat', 'tree', 'house', 'sun'],
    },
    engage: {
      examples: [
        { id: 'ex1', text: 'The river flows through the valley.', isCorrect: true },
        { id: 'ex2', text: 'We crossed the river on a bridge.', isCorrect: true },
        { id: 'ex3', text: 'I drank the river for breakfast.', isCorrect: false },
      ],
    },
    discuss: {
      explanations: [
        {
          id: 'a',
          student: 'Student A',
          text: 'A river is moving water that goes to the ocean or lake.',
          isCorrect: true,
        },
        {
          id: 'b',
          student: 'Student B',
          text: 'A river is a type of building where people live.',
          isCorrect: false,
        },
      ],
      rationale: 'Student A correctly identifies that a river is flowing water, while Student B confuses it with a structure.',
    },
    review: {
      questions: [
        {
          id: 'q1',
          type: 'choice',
          question: 'What is a river?',
          options: [
            { id: 'a', label: 'A flowing body of water' },
            { id: 'b', label: 'A type of tree' },
            { id: 'c', label: 'A mountain' },
          ],
          correctId: 'a',
        },
        {
          id: 'q2',
          type: 'fill',
          question: 'Complete: The _____ flows to the sea.',
          correctAnswer: 'river',
        },
        {
          id: 'q3',
          type: 'choice',
          question: 'Rivers carry...',
          options: [
            { id: 'a', label: 'Water' },
            { id: 'b', label: 'Fire' },
            { id: 'c', label: 'Rocks only' },
          ],
          correctId: 'a',
        },
      ],
    },
  },
  festival: {
    explain: {
      definition: 'A festival is a special celebration or series of events, often with music, food, and entertainment.',
    },
    restate: {
      prompt: 'In your own words, what is a festival?',
      keyWords: ['celebration', 'special', 'event'],
    },
    visualize: {
      requiredIcons: ['people', 'music'],
      allIcons: ['people', 'music', 'food', 'dance', 'book', 'rain'],
    },
    engage: {
      examples: [
        { id: 'ex1', text: 'We celebrate a festival every year with music and dance.', isCorrect: true },
        { id: 'ex2', text: 'The festival had colorful decorations.', isCorrect: true },
        { id: 'ex3', text: 'I used my festival to write my homework.', isCorrect: false },
      ],
    },
    discuss: {
      explanations: [
        {
          id: 'a',
          student: 'Student A',
          text: 'A festival is a special celebration with fun activities.',
          isCorrect: true,
        },
        {
          id: 'b',
          student: 'Student B',
          text: 'A festival is a tool for cutting paper.',
          isCorrect: false,
        },
      ],
      rationale: 'Student A correctly describes a festival as a celebration, while Student B confuses it with scissors.',
    },
    review: {
      questions: [
        {
          id: 'q1',
          type: 'choice',
          question: 'What is a festival?',
          options: [
            { id: 'a', label: 'A celebration' },
            { id: 'b', label: 'A tool' },
            { id: 'c', label: 'A building' },
          ],
          correctId: 'a',
        },
        {
          id: 'q2',
          type: 'fill',
          question: 'Complete: We celebrate a _____ every year.',
          correctAnswer: 'festival',
        },
        {
          id: 'q3',
          type: 'choice',
          question: 'Festivals usually have...',
          options: [
            { id: 'a', label: 'Music and dancing' },
            { id: 'b', label: 'Silence and darkness' },
            { id: 'c', label: 'Nothing' },
          ],
          correctId: 'a',
        },
      ],
    },
  },
  harvest: {
    explain: {
      definition: 'Harvest is the process of gathering ripe crops from the fields.',
    },
    restate: {
      prompt: 'In your own words, what is harvest?',
      keyWords: ['gathering', 'crops', 'fields'],
    },
    visualize: {
      requiredIcons: ['crops', 'farmer'],
      allIcons: ['crops', 'farmer', 'field', 'basket', 'car', 'book'],
    },
    engage: {
      examples: [
        { id: 'ex1', text: 'Farmers harvest the crops in autumn.', isCorrect: true },
        { id: 'ex2', text: 'The harvest was good this year.', isCorrect: true },
        { id: 'ex3', text: 'I drove my harvest to school.', isCorrect: false },
      ],
    },
    discuss: {
      explanations: [
        {
          id: 'a',
          student: 'Student A',
          text: 'Harvest means collecting ripe crops from the farm.',
          isCorrect: true,
        },
        {
          id: 'b',
          student: 'Student B',
          text: 'Harvest is a type of vehicle with four wheels.',
          isCorrect: false,
        },
      ],
      rationale: 'Student A correctly explains harvest as collecting crops, while Student B confuses it with a car.',
    },
    review: {
      questions: [
        {
          id: 'q1',
          type: 'choice',
          question: 'What is harvest?',
          options: [
            { id: 'a', label: 'Gathering crops' },
            { id: 'b', label: 'Planting seeds' },
            { id: 'c', label: 'Building houses' },
          ],
          correctId: 'a',
        },
        {
          id: 'q2',
          type: 'fill',
          question: 'Complete: Farmers _____ crops in autumn.',
          correctAnswer: 'harvest',
        },
        {
          id: 'q3',
          type: 'choice',
          question: 'When do farmers usually harvest?',
          options: [
            { id: 'a', label: 'When crops are ripe' },
            { id: 'b', label: 'During planting' },
            { id: 'c', label: 'Never' },
          ],
          correctId: 'a',
        },
      ],
    },
  },
};
