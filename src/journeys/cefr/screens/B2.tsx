import React, { useState } from 'react';
import { ChoiceGrid } from '../../../components/ChoiceGrid';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { cefrContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface B2ScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const B2Screen: React.FC<B2ScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [correctId, setCorrectId] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  const content = cefrContent[word.id as keyof typeof cefrContent].B2;

  const handleSubmit = () => {
    if (!selectedId || correctId !== null) return;

    const selectedParagraph = content.paragraphs.find((p) => p.id === selectedId);
    const isCorrect = selectedParagraph?.isCorrect === true;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'B2', answer: selectedId, attempt: newAttempts },
    });

    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'B2', correct: isCorrect, attempts: newAttempts },
    });

    if (isCorrect) {
      setCorrectId(content.paragraphs.find((p) => p.isCorrect)?.id || null);
      setFeedbackMessage('Great! You identified the correct usage! 🎉');
      setFeedbackType('success');
      setShowFeedback(true);

      // Celebration effects
      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'B2',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 3) {
      setCorrectId(content.paragraphs.find((p) => p.isCorrect)?.id || null);
      setFeedbackMessage(`Here's why: ${content.explanation}`);
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        onComplete({
          stepId: 'B2',
          correct: false,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 3000);
    } else {
      setFeedbackMessage(`Not quite right. ${3 - newAttempts} ${3 - newAttempts === 1 ? 'try' : 'tries'} left.`);
      setFeedbackType('error');
      setShowFeedback(true);
      setSelectedId(null);

      // Error feedback
      playErrorSound();
    }
  };

  const handleSkip = () => {
    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'B2' },
    });

    onComplete({
      stepId: 'B2',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  const choices = content.paragraphs.map((p) => ({ id: p.id, label: p.text }));

  return (
    <div className="card animate-fade-in step-b2 text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">📖</span>
          B2: Contextual Use
        </h2>
        <p className="text-gray-700 mb-6">
          Which paragraph uses the word "{word.english}" correctly?
        </p>

        <div className="mb-6 animate-bounce-in">
          <ChoiceGrid
            choices={choices}
            selectedId={selectedId}
            correctId={correctId}
            onSelect={setSelectedId}
            disabled={correctId !== null}
            columns={1}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={handleSkip} className="btn-secondary" disabled={correctId !== null}>
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className={`btn-primary ${!selectedId || correctId !== null ? '' : 'animate-pulse-gentle'}`}
            disabled={!selectedId || correctId !== null}
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
