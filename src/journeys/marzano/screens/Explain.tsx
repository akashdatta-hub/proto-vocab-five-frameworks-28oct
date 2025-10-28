import React, { useState } from 'react';
import { AudioButton } from '../../../components/AudioButton';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { getVoiceLang } from '../../../lib/tts';
import { triggerConfetti, playSuccessSound } from '../../../lib/confetti';
import { marzanoContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface ExplainScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const ExplainScreen: React.FC<ExplainScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [showFeedback, setShowFeedback] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const content = marzanoContent[word.id as keyof typeof marzanoContent].explain;

  const handleAudioPlay = () => {
    const voiceLang = getVoiceLang();
    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'tts_speak',
      meta: { stepId: 'explain', text: content.definition, voiceLang },
    });
  };

  const handleContinue = () => {
    if (completed) return;

    setCompleted(true);
    setShowFeedback(true);

    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'explain', attempt: 1 },
    });

    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'explain', correct: true, attempts: 1 },
    });

    triggerConfetti();
    playSuccessSound();

    setTimeout(() => {
      onComplete({
        stepId: 'explain',
        correct: true,
        skipped: false,
        attempts: 1,
        timeSpent: Date.now() - startTime,
      });
    }, 2000);
  };

  const handleSkip = () => {
    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'explain' },
    });

    onComplete({
      stepId: 'explain',
      correct: false,
      skipped: true,
      attempts: 0,
      timeSpent: Date.now() - startTime,
    });
  };

  return (
    <div className="card animate-fade-in step-explain text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">📚</span>
          Step 1: Explain
        </h2>
        <p className="text-gray-700 mb-6">
          Read the definition carefully to understand what "{word.english}" means.
        </p>

        <div className="mb-6 animate-bounce-in">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <p className="text-lg leading-relaxed">{content.definition}</p>
          </div>
        </div>

        <div className="mb-6">
          <AudioButton
            text={content.definition}
            label="Listen to definition"
            onPlay={handleAudioPlay}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={handleSkip} className="btn-secondary" disabled={completed}>
            Skip
          </button>
          <button
            onClick={handleContinue}
            className={`btn-primary ${completed ? '' : 'animate-pulse-gentle'}`}
            disabled={completed}
          >
            I Understand
          </button>
        </div>
      </div>

      {showFeedback && (
        <FeedbackToast
          message="Great! Now let's practice using this word!"
          type="success"
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
};
