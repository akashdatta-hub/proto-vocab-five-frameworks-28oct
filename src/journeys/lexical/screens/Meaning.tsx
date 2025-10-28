import React, { useState } from 'react';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { ChoiceGrid } from '../../../components/ChoiceGrid';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { lexicalContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface MeaningScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const MeaningScreen: React.FC<MeaningScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);

  const content = lexicalContent[word.id as keyof typeof lexicalContent].meaning;
  const correctDefinition = content.definitions.find(d => d.isCorrect);

  const handleSelect = (id: string) => {
    if (completed) return;
    setSelectedId(id);
  };

  const handleSubmit = () => {
    if (!selectedId || completed) return;

    const selected = content.definitions.find(d => d.id === selectedId);
    const correct = selected?.isCorrect || false;
    const newAttempts = attempts + 1;

    setAttempts(newAttempts);
    setIsCorrect(correct);
    setShowFeedback(true);

    log({
      framework: 'lexical',
      wordId: word.id,
      event: 'answer_submit',
      meta: {
        stepId: 'meaning',
        correct,
        attempts: newAttempts,
        selectedId,
      },
    });

    if (correct) {
      playSuccessSound();
      triggerConfetti();
      setCompleted(true);

      setTimeout(() => {
        onComplete({
          stepId: 'meaning',
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
              stepId: 'meaning',
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
          setSelectedId(null);
        }, 1500);
      }
    }
  };

  const handleSkip = () => {
    log({
      framework: 'lexical',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'meaning' },
    });

    onComplete({
      stepId: 'meaning',
      correct: false,
      skipped: true,
      attempts: 0,
      timeSpent: Date.now() - startTime,
    });
  };

  const choices = content.definitions.map(def => ({
    id: def.id,
    label: def.text,
  }));

  return (
    <div className="card animate-fade-in step-meaning text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">📖</span>
          Meaning: Select the Correct Definition
        </h2>
        <p className="text-gray-700 mb-6">
          Which definition best describes the word <strong className="text-orange-600">{word.english}</strong>?
        </p>

        <div className="mb-6">
          <ChoiceGrid
            choices={choices}
            selectedId={selectedId}
            correctId={showFeedback && isCorrect ? selectedId : null}
            onSelect={handleSelect}
            disabled={completed}
            columns={1}
          />
        </div>

        {showFeedback && (
          <FeedbackToast
            type={isCorrect ? 'success' : 'error'}
            message={
              isCorrect
                ? 'Excellent! That\'s the correct definition.'
                : attempts >= 3
                ? `The correct answer was: "${correctDefinition?.text}"`
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
                selectedId && !completed
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!selectedId || completed}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
