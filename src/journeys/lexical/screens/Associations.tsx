import React, { useState } from 'react';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { lexicalContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface AssociationsScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const AssociationsScreen: React.FC<AssociationsScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);

  const content = lexicalContent[word.id as keyof typeof lexicalContent].associations;
  const correctWords = new Set(content.relatedWords);

  const handleToggle = (wordItem: string) => {
    if (completed) return;

    setSelectedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordItem)) {
        newSet.delete(wordItem);
      } else {
        newSet.add(wordItem);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    if (selectedWords.size === 0 || completed) return;

    // Check if selected words match the correct related words
    const allCorrectSelected = Array.from(correctWords).every(w => selectedWords.has(w));
    const noIncorrectSelected = Array.from(selectedWords).every(w => correctWords.has(w));
    const correct = allCorrectSelected && noIncorrectSelected;

    const newAttempts = attempts + 1;

    setAttempts(newAttempts);
    setIsCorrect(correct);
    setShowFeedback(true);

    log({
      framework: 'lexical',
      wordId: word.id,
      event: 'answer_submit',
      meta: {
        stepId: 'associations',
        correct,
        attempts: newAttempts,
        selectedWords: Array.from(selectedWords),
        correctWords: Array.from(correctWords),
      },
    });

    if (correct) {
      playSuccessSound();
      triggerConfetti();
      setCompleted(true);

      setTimeout(() => {
        onComplete({
          stepId: 'associations',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else {
      playErrorSound();

      if (newAttempts >= 3) {
        setTimeout(() => {
          setCompleted(true);
          setTimeout(() => {
            onComplete({
              stepId: 'associations',
              correct: false,
              skipped: false,
              attempts: newAttempts,
              timeSpent: Date.now() - startTime,
            });
          }, 2000);
        }, 1500);
      } else {
        setTimeout(() => {
          setShowFeedback(false);
        }, 1500);
      }
    }
  };

  const handleSkip = () => {
    log({
      framework: 'lexical',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'associations' },
    });

    onComplete({
      stepId: 'associations',
      correct: false,
      skipped: true,
      attempts: 0,
      timeSpent: Date.now() - startTime,
    });
  };

  return (
    <div className="card animate-fade-in step-associations text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">🔗</span>
          Associations: Select Related Words
        </h2>
        <p className="text-gray-700 mb-6">
          Which words are related to <strong className="text-orange-600">{word.english}</strong>? Select all that apply.
        </p>

        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {content.words.map((wordItem) => {
              const isSelected = selectedWords.has(wordItem);
              const showAsCorrect = showFeedback && isCorrect && isSelected;
              const showAsIncorrect = showFeedback && !isCorrect && attempts >= 3;

              return (
                <button
                  key={wordItem}
                  onClick={() => handleToggle(wordItem)}
                  disabled={completed}
                  className={`p-4 rounded-lg border-2 font-medium text-center transition-all ${
                    showAsCorrect
                      ? 'bg-green-50 border-green-500 text-green-900'
                      : showAsIncorrect && correctWords.has(wordItem)
                      ? 'bg-green-50 border-green-500 text-green-900'
                      : showAsIncorrect && isSelected && !correctWords.has(wordItem)
                      ? 'bg-red-50 border-red-500 text-red-900'
                      : isSelected
                      ? 'bg-orange-600 border-orange-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900 hover:border-orange-400 hover:bg-orange-50'
                  } ${completed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {wordItem}
                </button>
              );
            })}
          </div>
        </div>

        {showFeedback && (
          <FeedbackToast
            type={isCorrect ? 'success' : 'error'}
            message={
              isCorrect
                ? 'Excellent! You identified all related words correctly.'
                : attempts >= 3
                ? `The related words were: ${Array.from(correctWords).join(', ')}`
                : 'Not quite. Think about which words are semantically related.'
            }
          />
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Attempts: {attempts}/3 | Selected: {selectedWords.size}
          </div>
          <div className="flex gap-3">
            <button onClick={handleSkip} className="btn-secondary" disabled={completed}>
              Skip
            </button>
            <button
              onClick={handleSubmit}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedWords.size > 0 && !completed
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={selectedWords.size === 0 || completed}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
