import React, { useState } from 'react';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { lexicalContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface MorphologyScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const MorphologyScreen: React.FC<MorphologyScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [inputValue, setInputValue] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);

  const content = lexicalContent[word.id as keyof typeof lexicalContent].morphology;

  const handleSubmit = () => {
    if (!inputValue.trim() || completed) return;

    const correct = inputValue.trim().toLowerCase() === content.derivedForm.toLowerCase();
    const newAttempts = attempts + 1;

    setAttempts(newAttempts);
    setIsCorrect(correct);
    setShowFeedback(true);

    log({
      framework: 'lexical',
      wordId: word.id,
      event: 'answer_submit',
      meta: {
        stepId: 'morphology',
        correct,
        attempts: newAttempts,
        inputValue: inputValue.trim(),
        expectedValue: content.derivedForm,
      },
    });

    if (correct) {
      playSuccessSound();
      triggerConfetti();
      setCompleted(true);

      setTimeout(() => {
        onComplete({
          stepId: 'morphology',
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
              stepId: 'morphology',
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
      meta: { stepId: 'morphology' },
    });

    onComplete({
      stepId: 'morphology',
      correct: false,
      skipped: true,
      attempts: 0,
      timeSpent: Date.now() - startTime,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !completed && inputValue.trim()) {
      handleSubmit();
    }
  };

  return (
    <div className="card animate-fade-in step-morphology text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">🔤</span>
          Morphology: Fill in the Derived Form
        </h2>
        <p className="text-gray-700 mb-6">
          Complete the sentence using a word derived from <strong className="text-orange-600">{content.baseWord}</strong>.
        </p>

        <div className="mb-6">
          <div className="p-6 bg-orange-50 border-2 border-orange-300 rounded-lg">
            <p className="text-xl text-gray-900 mb-4 text-center">
              {content.sentence.split('_____')[0]}
              <span className="inline-block min-w-[200px] border-b-4 border-orange-400 mx-2 align-bottom">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={completed}
                  className="w-full bg-transparent text-center text-orange-700 font-bold text-xl outline-none"
                  placeholder="Type here"
                  autoFocus
                />
              </span>
              {content.sentence.split('_____')[1]}
            </p>
          </div>

          {attempts >= 2 && !completed && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Hint:</strong> Form a word from "{content.baseWord}"
              </p>
            </div>
          )}
        </div>

        {showFeedback && (
          <FeedbackToast
            type={isCorrect ? 'success' : 'error'}
            message={
              isCorrect
                ? `Perfect! "${content.derivedForm}" is correct.`
                : attempts >= 3
                ? `The correct answer was "${content.derivedForm}"`
                : 'Not quite. Try again!'
            }
          />
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Attempts: {attempts}/3
          </div>
          <div className="flex gap-3">
            <button onClick={handleSkip} className="btn-secondary" disabled={completed}>
              Skip
            </button>
            <button
              onClick={handleSubmit}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                inputValue.trim() && !completed
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!inputValue.trim() || completed}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
