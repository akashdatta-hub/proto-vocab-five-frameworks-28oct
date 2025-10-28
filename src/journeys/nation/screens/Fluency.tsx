import React, { useState, useEffect } from 'react';
import { ChoiceGrid } from '../../../components/ChoiceGrid';
import { AudioButton } from '../../../components/AudioButton';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { getVoiceLang } from '../../../lib/tts';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { nationContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface FluencyScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const FluencyScreen: React.FC<FluencyScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [correctId, setCorrectId] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [readingTime, setReadingTime] = useState(0);

  const content = nationContent[word.id as keyof typeof nationContent].fluency;

  useEffect(() => {
    if (!showQuestion) {
      const timer = setTimeout(() => {
        setShowQuestion(true);
        setReadingTime(Date.now() - startTime);
      }, 10000); // 10 seconds to read

      return () => clearTimeout(timer);
    }
  }, [showQuestion, startTime]);

  const handleSubmit = () => {
    if (!selectedId || correctId !== null) return;

    const isCorrect = selectedId === content.correctId;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    log({
      framework: 'nation',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'fluency', answer: selectedId, attempt: newAttempts, readingTime },
    });

    log({
      framework: 'nation',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'fluency', correct: isCorrect, attempts: newAttempts },
    });

    if (isCorrect) {
      setCorrectId(content.correctId);
      setFeedbackMessage('Perfect! You understood the passage quickly! 🎉');
      setFeedbackType('success');
      setShowFeedback(true);

      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'fluency',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 3) {
      setCorrectId(content.correctId);
      setFeedbackMessage('The correct answer is highlighted above.');
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        onComplete({
          stepId: 'fluency',
          correct: false,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 3000);
    } else {
      setFeedbackMessage(`Not quite. ${3 - newAttempts} ${3 - newAttempts === 1 ? 'try' : 'tries'} left.`);
      setFeedbackType('error');
      setShowFeedback(true);
      setSelectedId(null);
      playErrorSound();
    }
  };

  const handleSkip = () => {
    log({
      framework: 'nation',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'fluency' },
    });

    onComplete({
      stepId: 'fluency',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  const handleShowQuestion = () => {
    setShowQuestion(true);
    setReadingTime(Date.now() - startTime);
  };

  const handlePlayback = () => {
    const voiceLang = getVoiceLang();
    log({
      framework: 'nation',
      wordId: word.id,
      event: 'tts_speak',
      meta: { stepId: 'fluency', text: content.fastStory, voiceLang },
    });
  };

  const choices = content.options.map((opt) => ({ id: opt.id, label: opt.label }));

  return (
    <div className="card animate-fade-in step-fluency text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">⚡</span>
          Fluency: Quick Comprehension
        </h2>

        {!showQuestion ? (
          <>
            <p className="text-gray-700 mb-6">
              Read this passage quickly. You'll have 10 seconds, then answer a question.
            </p>
            <div className="mb-6 animate-bounce-in">
              <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg mb-4">
                <p className="text-lg leading-relaxed">{content.fastStory}</p>
              </div>
              <AudioButton
                text={content.fastStory}
                label="Listen to passage"
                onPlay={handlePlayback}
              />
            </div>
            <div className="text-center">
              <button onClick={handleShowQuestion} className="btn-secondary">
                I'm Ready for the Question
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-700 mb-6">{content.question}</p>
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
          </>
        )}
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
