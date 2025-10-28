import React, { useState } from 'react';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { nationContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface LanguageScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const LanguageScreen: React.FC<LanguageScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const content = nationContent[word.id as keyof typeof nationContent].language;

  React.useEffect(() => {
    setAvailableLetters([...content.scrambledWord]);
  }, [content.scrambledWord]);

  const handleLetterClick = (letter: string, index: number) => {
    if (completed) return;
    setSelectedLetters([...selectedLetters, letter]);
    setAvailableLetters(availableLetters.filter((_, i) => i !== index));
  };

  const handleRemoveLetter = (index: number) => {
    if (completed) return;
    const letter = selectedLetters[index];
    setAvailableLetters([...availableLetters, letter]);
    setSelectedLetters(selectedLetters.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    if (completed) return;
    setSelectedLetters([]);
    setAvailableLetters([...content.scrambledWord]);
  };

  const handleSubmit = () => {
    if (selectedLetters.length === 0 || completed) return;

    const answer = selectedLetters.join('').toLowerCase();
    const isCorrect = answer === content.targetWord.toLowerCase();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    log({
      framework: 'nation',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'language', answer, attempt: newAttempts },
    });

    log({
      framework: 'nation',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'language', correct: isCorrect, attempts: newAttempts },
    });

    if (isCorrect) {
      setCompleted(true);
      setFeedbackMessage('Excellent! You unscrambled the word correctly! 🎉');
      setFeedbackType('success');
      setShowFeedback(true);

      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'language',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 3) {
      setCompleted(true);
      setSelectedLetters(content.targetWord.split(''));
      setAvailableLetters([]);
      setFeedbackMessage(`The correct word is: ${content.targetWord}`);
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        onComplete({
          stepId: 'language',
          correct: false,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 3000);
    } else {
      setFeedbackMessage(`Not quite. ${3 - newAttempts} ${3 - newAttempts === 1 ? 'try' : 'tries'} left.`);
      setFeedbackType('error');
      setShowFeedback(true);
      playErrorSound();
    }
  };

  const handleSkip = () => {
    log({
      framework: 'nation',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'language' },
    });

    onComplete({
      stepId: 'language',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  return (
    <div className="card animate-fade-in step-language text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">🔤</span>
          Language Focus: Unscramble
        </h2>
        <p className="text-gray-700 mb-6">
          Unscramble the letters to form the word "{word.english}".
        </p>

        <div className="mb-6 animate-bounce-in">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your word:</label>
            <div className="min-h-[60px] p-3 bg-yellow-50 border-2 border-yellow-400 rounded-lg flex flex-wrap gap-2">
              {selectedLetters.length === 0 ? (
                <span className="text-gray-400 self-center">Click letters below to build the word</span>
              ) : (
                selectedLetters.map((letter, index) => (
                  <button
                    key={index}
                    onClick={() => handleRemoveLetter(index)}
                    className="px-4 py-2 bg-yellow-500 text-white text-xl font-bold rounded-lg hover:bg-yellow-600 transition-colors"
                    disabled={completed}
                  >
                    {letter}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Available letters:</label>
            <div className="min-h-[60px] p-3 bg-gray-50 border-2 border-gray-300 rounded-lg flex flex-wrap gap-2">
              {availableLetters.length === 0 ? (
                <span className="text-gray-400 self-center">All letters used</span>
              ) : (
                availableLetters.map((letter, index) => (
                  <button
                    key={index}
                    onClick={() => handleLetterClick(letter, index)}
                    className="px-4 py-2 bg-gray-200 text-gray-900 text-xl font-bold rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={completed}
                  >
                    {letter}
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedLetters.length > 0 && !completed && (
            <button onClick={handleReset} className="btn-secondary mb-4">
              Reset
            </button>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={handleSkip} className="btn-secondary" disabled={completed}>
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className={`btn-primary ${selectedLetters.length === 0 || completed ? '' : 'animate-pulse-gentle'}`}
            disabled={selectedLetters.length === 0 || completed}
          >
            Submit
          </button>
        </div>
      </div>

      {showFeedback && (
        <FeedbackToast
          message={feedbackMessage}
          type={feedbackType}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
};
