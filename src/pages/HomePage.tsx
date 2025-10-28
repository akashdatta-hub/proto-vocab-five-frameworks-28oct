import React from 'react';
import { Link } from 'react-router-dom';
import wordsData from '../data/words.json';

export const HomePage: React.FC = () => {
  const frameworks = [
    {
      id: 'blooms',
      name: "Bloom's Taxonomy",
      description: 'Progress through cognitive levels from Remember to Create',
      steps: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
      color: 'bg-purple-100 border-purple-400',
    },
    {
      id: 'cefr',
      name: 'CEFR Ladder',
      description: 'Climb language proficiency levels from A1 to C2',
      steps: ['Recognize', 'Reproduce', 'Control', 'Context', 'Flex', 'Create'],
      stepLabels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      color: 'bg-blue-100 border-blue-400',
    },
    {
      id: 'marzano',
      name: 'Marzano Six-Step',
      description: 'Build deep understanding through multimodal engagement',
      steps: ['Explain', 'Restate', 'Visualize', 'Engage', 'Discuss', 'Review'],
      color: 'bg-green-100 border-green-400',
    },
    {
      id: 'nation',
      name: "Nation's Four Strands",
      description: 'Balance input, language focus, output, and fluency',
      steps: ['Input', 'Language', 'Output', 'Fluency'],
      color: 'bg-yellow-100 border-yellow-400',
    },
    {
      id: 'lexical',
      name: 'Lexical Depth',
      description: 'Explore rich word knowledge from form to nuances',
      steps: ['Form', 'Meaning', 'Use', 'Associations', 'Morphology', 'Nuances'],
      color: 'bg-pink-100 border-pink-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Vocabulary Learning Journeys
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore five evidence-based frameworks for learning English vocabulary.
            Choose a word and a framework to begin your learning journey!
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Choose Your Learning Framework
          </h2>
          <div className="space-y-4">
            {frameworks.map((framework) => (
              <div
                key={framework.id}
                className={`card ${framework.color} border-2 hover:shadow-lg transition-all`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Framework Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{framework.name}</h3>
                    <p className="text-sm text-gray-700">{framework.description}</p>
                  </div>

                  {/* Step progression visualization */}
                  <div className="flex-1 md:px-4">
                    <div className="flex items-center justify-center gap-1">
                      {framework.steps.map((step, idx) => (
                        <React.Fragment key={step}>
                          <div className="flex-1 text-center max-w-[80px]">
                            <div className="w-9 h-9 mx-auto rounded-full bg-white border-2 border-gray-400 flex items-center justify-center text-xs font-semibold text-gray-700 mb-1">
                              {('stepLabels' in framework && framework.stepLabels)
                                ? framework.stepLabels[idx]
                                : idx + 1}
                            </div>
                            <div className="text-xs leading-tight font-medium text-gray-700 px-0.5">
                              {step}
                            </div>
                          </div>
                          {idx < framework.steps.length - 1 && (
                            <div className="w-4 h-0.5 bg-gray-400 flex-shrink-0" style={{ marginBottom: '24px' }} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex md:flex-col gap-2 md:w-48">
                    {wordsData.map((word) => (
                      <Link
                        key={word.id}
                        to={`/journey/${framework.id}/${word.id}`}
                        className="flex-1 md:flex-none btn-primary text-center text-sm py-2"
                      >
                        "{word.english}"
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center">
          <div className="inline-flex gap-4">
            <Link to="/compare" className="btn-secondary">
              View Comparison
            </Link>
            <Link to="/feedback" className="btn-secondary">
              View Feedback
            </Link>
            <Link to="/debug" className="btn-secondary">
              Debug Analytics
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
