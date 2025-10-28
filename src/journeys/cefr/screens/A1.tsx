import React, { useState } from 'react';
import { AudioButton } from '../../../components/AudioButton';
import { HintChip } from '../../../components/HintChip';
import { ChoiceGrid } from '../../../components/ChoiceGrid';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { getVoiceLang } from '../../../lib/tts';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { cefrContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface A1ScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const A1Screen: React.FC<A1ScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [correctId, setCorrectId] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [hintShown, setHintShown] = useState(false);

  const content = cefrContent[word.id as keyof typeof cefrContent].A1;

  const handleAudioPlay = () => {
    const voiceLang = getVoiceLang();
    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'tts_speak',
      meta: { stepId: 'A1', text: word.english, voiceLang },
    });
  };

  const handleHintToggle = (isOpen: boolean) => {
    if (isOpen && !hintShown) {
      setHintShown(true);
      log({
        framework: 'cefr',
        wordId: word.id,
        event: 'hint_toggle',
        meta: { stepId: 'A1', action: 'open' },
      });
    }
  };

  const handleSelect = (id: string) => {
    if (correctId !== null) return;
    setSelectedId(id);
  };

  const handleSubmit = () => {
    if (!selectedId || correctId !== null) return;

    const isCorrect = selectedId === content.correctId;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'A1', answer: selectedId, attempt: newAttempts },
    });

    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'A1', correct: isCorrect, attempts: newAttempts },
    });

    if (isCorrect) {
      setCorrectId(content.correctId);
      setFeedbackMessage('Excellent! You recognized the word correctly! 🎉');
      setFeedbackType('success');
      setShowFeedback(true);

      // Celebration effects
      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'A1',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 3) {
      setCorrectId(content.correctId);
      const correctImage = content.images.find((img) => img.id === content.correctId);
      setFeedbackMessage(`The correct answer is "${correctImage?.label}". Let's move on!`);
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        onComplete({
          stepId: 'A1',
          correct: false,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 3000);
    } else {
      setFeedbackMessage(`Not quite! You have ${3 - newAttempts} more ${3 - newAttempts === 1 ? 'try' : 'tries'}.`);
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
      meta: { stepId: 'A1' },
    });

    onComplete({
      stepId: 'A1',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  const choices = content.images.map((img) => ({ id: img.id, label: img.label }));

  return (
    <div className="card animate-fade-in step-a1 text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="text-3xl">👂</span>
          A1: Recognize
        </h2>
        <p className="text-gray-700 mb-6">Listen to the word and select what it represents.</p>

        <div className="mb-6 text-center animate-bounce-in">
          <div className="inline-block p-4 bg-blue-50 rounded-xl">
            <AudioButton text={word.english} onPlay={handleAudioPlay} />
          </div>
          <div className="mt-4">
            <HintChip
              teluguScript={word.telugu.script}
              transliteration={word.telugu.transliteration}
              onToggle={handleHintToggle}
            />
          </div>
        </div>

        <div className="mb-6">
          <ChoiceGrid
            choices={choices}
            selectedId={selectedId}
            correctId={correctId}
            onSelect={handleSelect}
            disabled={correctId !== null}
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
