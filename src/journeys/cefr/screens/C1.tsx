import React, { useState } from 'react';
import { WritePad } from '../../../components/WritePad';
import { AudioButton } from '../../../components/AudioButton';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { getVoiceLang } from '../../../lib/tts';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { cefrContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface C1ScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const C1Screen: React.FC<C1ScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const content = cefrContent[word.id as keyof typeof cefrContent].C1;

  const validateSentence = (text: string): { valid: boolean; reason?: string } => {
    const normalized = text.trim().toLowerCase();

    if (normalized.length === 0) {
      return { valid: false, reason: 'Please write a sentence.' };
    }

    if (!normalized.includes(word.english.toLowerCase())) {
      return { valid: false, reason: `Your sentence must include the word "${word.english}".` };
    }

    const words = normalized.split(/\s+/);
    if (words.length < 5) {
      return { valid: false, reason: 'Please write a longer sentence (at least 5 words).' };
    }

    // Check for valid context using collocations
    const hasValidContext = content.allowedCollocations.some((collocation) =>
      normalized.includes(collocation.toLowerCase())
    );

    if (!hasValidContext) {
      return {
        valid: true,
        reason:
          'Good sentence! For more natural usage, try phrases like: ' +
          content.allowedCollocations.slice(0, 2).join(', '),
      };
    }

    return { valid: true };
  };

  const handleSubmit = () => {
    if (!answer.trim() || completed) return;

    const validation = validateSentence(answer);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'C1', sentenceLength: answer.trim().length, attempt: newAttempts },
    });

    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'C1', correct: validation.valid, attempts: newAttempts },
    });

    if (validation.valid) {
      setCompleted(true);
      setFeedbackMessage(
        validation.reason || 'Excellent! You wrote a flexible, natural sentence! 🎉'
      );
      setFeedbackType('success');
      setShowFeedback(true);

      // Celebration effects
      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'C1',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 3) {
      setCompleted(true);
      setFeedbackMessage(
        validation.reason || 'Good effort! Keep practicing to improve your writing.'
      );
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        onComplete({
          stepId: 'C1',
          correct: false,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 3000);
    } else {
      setFeedbackMessage(
        `${validation.reason} ${3 - newAttempts} ${3 - newAttempts === 1 ? 'try' : 'tries'} left.`
      );
      setFeedbackType('error');
      setShowFeedback(true);

      // Error feedback
      playErrorSound();
    }
  };

  const handleSkip = () => {
    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'C1' },
    });

    onComplete({
      stepId: 'C1',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  const handlePlayback = () => {
    const voiceLang = getVoiceLang();
    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'tts_speak',
      meta: { stepId: 'C1', text: answer, voiceLang },
    });
  };

  return (
    <div className="card animate-fade-in step-c1 text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">💪</span>
          C1: Flexible Use
        </h2>
        <p className="text-gray-700 mb-6">
          {content.prompt}
        </p>

        <div className="mb-6 animate-bounce-in">
          <WritePad
            value={answer}
            onChange={setAnswer}
            placeholder={`Write about a ${word.english}...`}
            disabled={completed}
            label="Your description"
            maxLength={200}
            rows={4}
          />
        </div>

        {answer.trim().length > 0 && (
          <div className="mb-6">
            <AudioButton
              text={answer}
              label="Listen to your sentence"
              onPlay={handlePlayback}
            />
          </div>
        )}

        <div className="mb-4 text-sm text-gray-600">
          <p>💡 Tip: Try using phrases like:</p>
          <ul className="list-disc list-inside ml-2 mt-1">
            {content.allowedCollocations.map((collocation) => (
              <li key={collocation}>{collocation}</li>
            ))}
          </ul>
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
