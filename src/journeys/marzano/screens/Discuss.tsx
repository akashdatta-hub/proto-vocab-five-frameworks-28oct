import React, { useState } from 'react';
import { ChoiceGrid } from '../../../components/ChoiceGrid';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { marzanoContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface DiscussScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const DiscussScreen: React.FC<DiscussScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [showExplanation, setShowExplanation] = useState(false);

  const content = marzanoContent[word.id as keyof typeof marzanoContent].discuss;
  const correctExplanation = content.explanations.find((ex) => ex.isCorrect);

  const handleSubmit = () => {
    if (!selectedId || completed) return;

    const selected = content.explanations.find((ex) => ex.id === selectedId);
    const isCorrect = selected?.isCorrect || false;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'discuss', answer: selectedId, attempt: newAttempts },
    });

    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'discuss', correct: isCorrect, attempts: newAttempts },
    });

    if (isCorrect) {
      setCompleted(true);
      setFeedbackMessage('Excellent! You chose the best explanation!');
      setFeedbackType('success');
      setShowFeedback(true);

      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'discuss',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 2) {
      setShowExplanation(true);
      setFeedbackMessage(content.rationale);
      setFeedbackType('info');
      setShowFeedback(true);

      if (newAttempts >= 3) {
        setCompleted(true);
        setTimeout(() => {
          onComplete({
            stepId: 'discuss',
            correct: false,
            skipped: false,
            attempts: newAttempts,
            timeSpent: Date.now() - startTime,
          });
        }, 3000);
      } else {
        setSelectedId(null);
      }
    } else {
      setFeedbackMessage(
        `Not quite. Think about which student explains "${word.english}" correctly! ${3 - newAttempts} ${3 - newAttempts === 1 ? 'try' : 'tries'} left.`
      );
      setFeedbackType('error');
      setShowFeedback(true);
      setSelectedId(null);

      playErrorSound();
    }
  };

  const handleSkip = () => {
    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'discuss' },
    });

    onComplete({
      stepId: 'discuss',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  const choices = content.explanations.map((ex) => ({
    id: ex.id,
    label: `${ex.student}: "${ex.text}"`,
  }));

  return (
    <div className="card animate-fade-in step-discuss text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">💬</span>
          Step 5: Discuss
        </h2>
        <p className="text-gray-700 mb-6">
          Read each student's explanation and choose the one that correctly explains "{word.english}".
        </p>

        {showExplanation && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg animate-bounce-in">
            <p className="font-semibold mb-2">💡 Hint:</p>
            <p className="text-sm">{content.rationale}</p>
          </div>
        )}

        <div className="mb-6 animate-bounce-in">
          <ChoiceGrid
            choices={choices}
            selectedId={selectedId}
            correctId={completed ? correctExplanation?.id : null}
            onSelect={setSelectedId}
            disabled={completed}
            columns={1}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={handleSkip} className="btn-secondary" disabled={completed}>
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className={`btn-primary ${!selectedId || completed ? '' : 'animate-pulse-gentle'}`}
            disabled={!selectedId || completed}
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
