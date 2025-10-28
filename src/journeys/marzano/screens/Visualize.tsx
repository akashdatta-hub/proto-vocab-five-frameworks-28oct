import React, { useState } from 'react';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { marzanoContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface VisualizeScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const VisualizeScreen: React.FC<VisualizeScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const content = marzanoContent[word.id as keyof typeof marzanoContent].visualize;

  const toggleIcon = (icon: string) => {
    if (completed) return;
    setSelectedIcons((prev) =>
      prev.includes(icon) ? prev.filter((x) => x !== icon) : [...prev, icon]
    );
  };

  const handleSubmit = () => {
    if (selectedIcons.length === 0 || completed) return;

    const correctSelections = selectedIcons.filter((icon) => content.requiredIcons.includes(icon));
    const isCorrect = correctSelections.length === content.requiredIcons.length &&
                      selectedIcons.length === content.requiredIcons.length;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'visualize', selected: selectedIcons, attempt: newAttempts },
    });

    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'visualize', correct: isCorrect, attempts: newAttempts },
    });

    if (isCorrect) {
      setCompleted(true);
      setFeedbackMessage('Excellent! You visualized the word perfectly!');
      setFeedbackType('success');
      setShowFeedback(true);

      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'visualize',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 3) {
      setCompleted(true);
      setFeedbackMessage(
        `The correct icons are: ${content.requiredIcons.join(', ')}. Good thinking!`
      );
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        onComplete({
          stepId: 'visualize',
          correct: false,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 3000);
    } else {
      setFeedbackMessage(
        `Not quite. Think about which images best represent "${word.english}"! ${3 - newAttempts} ${3 - newAttempts === 1 ? 'try' : 'tries'} left.`
      );
      setFeedbackType('error');
      setShowFeedback(true);
      setSelectedIcons([]);

      playErrorSound();
    }
  };

  const handleSkip = () => {
    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'visualize' },
    });

    onComplete({
      stepId: 'visualize',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  return (
    <div className="card animate-fade-in step-visualize text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">🎨</span>
          Step 3: Visualize
        </h2>
        <p className="text-gray-700 mb-6">
          Select the icons that best represent the meaning of "{word.english}".
        </p>

        <div className="mb-6 grid grid-cols-3 gap-3 animate-bounce-in">
          {content.allIcons.map((icon) => {
            const isSelected = selectedIcons.includes(icon);
            return (
              <button
                key={icon}
                onClick={() => toggleIcon(icon)}
                disabled={completed}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  isSelected
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white border-gray-300 hover:border-green-400'
                } disabled:opacity-50`}
              >
                {icon}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={handleSkip} className="btn-secondary" disabled={completed}>
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className={`btn-primary ${selectedIcons.length === 0 || completed ? '' : 'animate-pulse-gentle'}`}
            disabled={selectedIcons.length === 0 || completed}
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
