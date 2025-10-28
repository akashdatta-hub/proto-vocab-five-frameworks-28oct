import React, { useState } from 'react';
import { WritePad } from '../../../components/WritePad';
import { AudioButton } from '../../../components/AudioButton';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { getVoiceLang } from '../../../lib/tts';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { cefrContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface C2ScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const C2Screen: React.FC<C2ScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const content = cefrContent[word.id as keyof typeof cefrContent].C2;

  const validateCreation = (text: string): { valid: boolean; reason?: string } => {
    const normalized = text.trim().toLowerCase();

    if (normalized.length === 0) {
      return { valid: false, reason: 'Please write something creative.' };
    }

    if (!normalized.includes(word.english.toLowerCase())) {
      return { valid: false, reason: `Your creation must include the word "${word.english}".` };
    }

    const words = normalized.split(/\s+/);
    if (words.length < 3) {
      return { valid: false, reason: 'Please write at least 3 words.' };
    }

    return { valid: true };
  };

  const handleSubmit = () => {
    if (!answer.trim() || completed) return;

    const validation = validateCreation(answer);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'C2', creationLength: answer.trim().length, attempt: newAttempts },
    });

    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'C2', correct: validation.valid, attempts: newAttempts },
    });

    if (validation.valid) {
      setCompleted(true);
      setFeedbackMessage('Outstanding! Your creative expression is beautiful! 🎉');
      setFeedbackType('success');
      setShowFeedback(true);

      // Celebration effects
      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'C2',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 3) {
      setCompleted(true);
      setFeedbackMessage(
        validation.reason || 'Good effort! Keep practicing your creative writing.'
      );
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        onComplete({
          stepId: 'C2',
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
      meta: { stepId: 'C2' },
    });

    onComplete({
      stepId: 'C2',
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
      meta: { stepId: 'C2', text: answer, voiceLang },
    });
  };

  return (
    <div className="card animate-fade-in step-c2 text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">✨</span>
          C2: Create & Abstract
        </h2>
        <p className="text-gray-700 mb-6">
          {content.prompt}
        </p>

        <div className="mb-6 animate-bounce-in">
          <WritePad
            value={answer}
            onChange={setAnswer}
            placeholder={`Create something poetic or creative about "${word.english}"...`}
            disabled={completed}
            label="Your creative work"
            maxLength={150}
            rows={3}
          />
        </div>

        {answer.trim().length > 0 && (
          <div className="mb-6">
            <AudioButton
              text={answer}
              label="Listen to your creation"
              onPlay={handlePlayback}
            />
          </div>
        )}

        <div className="mb-4 text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
          <p className="font-semibold mb-1">💡 Be creative!</p>
          <p>Think of metaphors, poetry, or abstract ideas. There's no single right answer - express yourself!</p>
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
