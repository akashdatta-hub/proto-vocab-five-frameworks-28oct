export const steps = [
  { id: 'A1', label: 'Recognize', skill: 'listening' },
  { id: 'A2', label: 'Reproduce', skill: 'writing' },
  { id: 'B1', label: 'Control', skill: 'reading' },
  { id: 'B2', label: 'Context', skill: 'reading' },
  { id: 'C1', label: 'Flex', skill: 'writing' },
  { id: 'C2', label: 'Create', skill: 'writing' },
];

type WordId = 'river' | 'festival' | 'harvest';

export const cefrContent: Record<WordId, {
  A1: { images: { id: string; label: string }[]; correctId: string };
  A2: { targetWord: string };
  B1: { sentence: string; wordBank: string[]; correctAnswer: string };
  B2: { paragraphs: { id: string; text: string; isCorrect: boolean }[]; explanation: string };
  C1: { prompt: string; allowedCollocations: string[] };
  C2: { prompt: string };
}> = {
  river: {
    A1: {
      images: [
        { id: 'river', label: '🌊 Flowing water' },
        { id: 'mountain', label: '⛰️ Mountain' },
        { id: 'tree', label: '🌳 Tree' },
        { id: 'house', label: '🏠 House' },
      ],
      correctId: 'river',
    },
    A2: {
      targetWord: 'river',
    },
    B1: {
      sentence: 'The _____ flows through the valley carrying fresh water to the villages.',
      wordBank: ['river', 'road', 'wind'],
      correctAnswer: 'river',
    },
    B2: {
      paragraphs: [
        {
          id: 'correct',
          text: 'The mighty river winds through the landscape, providing water for crops and a home for fish. Villages along its banks have thrived for centuries.',
          isCorrect: true,
        },
        {
          id: 'incorrect',
          text: 'The river walked to the market yesterday to buy vegetables. It was very hot and the river drank some water.',
          isCorrect: false,
        },
      ],
      explanation: 'Rivers are natural water bodies that flow, not living things that walk or drink!',
    },
    C1: {
      prompt: 'Describe a river near your village or town',
      allowedCollocations: ['river flows', 'river bank', 'across the river', 'river water'],
    },
    C2: {
      prompt: 'Create a poetic title or caption about a river',
    },
  },
  festival: {
    A1: {
      images: [
        { id: 'festival', label: '🎉 Celebration with people' },
        { id: 'school', label: '🏫 School building' },
        { id: 'food', label: '🍽️ Food' },
        { id: 'book', label: '📚 Book' },
      ],
      correctId: 'festival',
    },
    A2: {
      targetWord: 'festival',
    },
    B1: {
      sentence: 'The village celebrates a colorful _____ every year with music, dance, and special foods.',
      wordBank: ['festival', 'meeting', 'lesson'],
      correctAnswer: 'festival',
    },
    B2: {
      paragraphs: [
        {
          id: 'correct',
          text: 'During the annual festival, families gather to celebrate their traditions. The streets fill with music, colorful decorations, and the aroma of special dishes.',
          isCorrect: true,
        },
        {
          id: 'incorrect',
          text: 'I used my festival to write my homework. The festival was very sharp and had blue ink.',
          isCorrect: false,
        },
      ],
      explanation: 'A festival is a celebration or event, not a writing tool!',
    },
    C1: {
      prompt: 'Describe your favorite festival celebration',
      allowedCollocations: ['celebrate festival', 'festival celebration', 'during the festival', 'festival season'],
    },
    C2: {
      prompt: 'Create a creative title about a festival',
    },
  },
  harvest: {
    A1: {
      images: [
        { id: 'harvest', label: '🌾 Gathering crops' },
        { id: 'rain', label: '🌧️ Rain' },
        { id: 'market', label: '🏪 Market' },
        { id: 'school', label: '🎒 School' },
      ],
      correctId: 'harvest',
    },
    A2: {
      targetWord: 'harvest',
    },
    B1: {
      sentence: 'Farmers work hard during the _____ season to gather all the ripe crops from their fields.',
      wordBank: ['harvest', 'planting', 'sleeping'],
      correctAnswer: 'harvest',
    },
    B2: {
      paragraphs: [
        {
          id: 'correct',
          text: 'The harvest season brings both hard work and joy. Farmers gather their crops after months of care, celebrating the fruits of their labor.',
          isCorrect: true,
        },
        {
          id: 'incorrect',
          text: 'My harvest is red and has four wheels. I drive my harvest to school every day.',
          isCorrect: false,
        },
      ],
      explanation: 'Harvest refers to gathering crops, not a vehicle!',
    },
    C1: {
      prompt: 'Describe the harvest season in a farming village',
      allowedCollocations: ['harvest season', 'harvest crops', 'harvest time', 'good harvest'],
    },
    C2: {
      prompt: 'Create an imaginative caption about harvest',
    },
  },
};
