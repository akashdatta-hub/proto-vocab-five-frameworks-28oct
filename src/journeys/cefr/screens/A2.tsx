import React, { useState } from 'react';
import { AudioButton } from '../../../components/AudioButton';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { getVoiceLang } from '../../../lib/tts';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { cefrContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface A2ScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const A2Screen: React.FC<A2ScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const content = cefrContent[word.id as keyof typeof cefrContent].A2;

  const handleAudioPlay = () => {
    const voiceLang = getVoiceLang();
    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'tts_speak',
      meta: { stepId: 'A2', text: word.english, voiceLang },
    });
  };

  const handleSubmit = () => {
    if (!answer.trim() || completed) return;

    const normalizedAnswer = answer.trim().toLowerCase();
    const isCorrect = normalizedAnswer === content.targetWord.toLowerCase();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'A2', answer: normalizedAnswer, attempt: newAttempts },
    });

    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'A2', correct: isCorrect, attempts: newAttempts },
    });

    if (isCorrect) {
      setCompleted(true);
      setFeedbackMessage('Perfect! You spelled the word correctly! 🎉');
      setFeedbackType('success');
      setShowFeedback(true);

      // Celebration effects
      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'A2',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 3) {
      setCompleted(true);
      setFeedbackMessage(`The correct spelling is "${content.targetWord}". Great effort!`);
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        onComplete({
          stepId: 'A2',
          correct: false,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 3000);
    } else {
      setFeedbackMessage(`Not quite. Try again! ${3 - newAttempts} ${3 - newAttempts === 1 ? 'try' : 'tries'} left.`);
      setFeedbackType('error');
      setShowFeedback(true);
      setAnswer('');

      // Error feedback
      playErrorSound();
    }
  };

  const handleSkip = () => {
    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'A2' },
    });

    onComplete({
      stepId: 'A2',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  return (
    <div className="card animate-fade-in step-a2 text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">✍️</span>
          A2: Reproduce
        </h2>
        <p className="text-gray-700 mb-6">
          Listen to the word and type it correctly.
        </p>

        <div className="mb-6 text-center animate-bounce-in">
          <div className="inline-block p-4 bg-blue-50 rounded-xl">
            <AudioButton text={word.english} onPlay={handleAudioPlay} />
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={completed}
            placeholder="Type the word..."
            className="input-field text-lg"
            aria-label="Type the word"
            autoFocus
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={handleSkip} className="btn-secondary" disabled={completed}>
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className={`btn-primary ${!answer.trim() || completed ? '' : 'animate-pulse-gentle'}`}
            disabled={!answer.trim() || completed}
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
