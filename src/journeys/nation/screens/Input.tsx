import React, { useState } from 'react';
import { AudioButton } from '../../../components/AudioButton';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { getVoiceLang } from '../../../lib/tts';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { nationContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface InputScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const InputScreen: React.FC<InputScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

  const content = nationContent[word.id as keyof typeof nationContent].input;

  const handleSubmit = () => {
    if (selectedIndex === null || correctIndex !== null) return;

    const isCorrect = selectedIndex === content.correctSentenceIndex;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    log({
      framework: 'nation',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'input', answer: selectedIndex, attempt: newAttempts },
    });

    log({
      framework: 'nation',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'input', correct: isCorrect, attempts: newAttempts },
    });

    if (isCorrect) {
      setCorrectIndex(content.correctSentenceIndex);
      setFeedbackMessage('Perfect! You found the correct sentence! 🎉');
      setFeedbackType('success');
      setShowFeedback(true);

      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'input',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 3) {
      setCorrectIndex(content.correctSentenceIndex);
      setFeedbackMessage('The correct sentence is highlighted above.');
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        onComplete({
          stepId: 'input',
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
      setSelectedIndex(null);
      playErrorSound();
    }
  };

  const handleSkip = () => {
    log({
      framework: 'nation',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'input' },
    });

    onComplete({
      stepId: 'input',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  const handlePlayback = (text: string) => {
    const voiceLang = getVoiceLang();
    log({
      framework: 'nation',
      wordId: word.id,
      event: 'tts_speak',
      meta: { stepId: 'input', text, voiceLang },
    });
  };

  return (
    <div className="card animate-fade-in step-input text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">👂</span>
          Input: Listen & Read
        </h2>
        <p className="text-gray-700 mb-4">
          Listen to the story and identify which sentence uses "{word.english}" correctly.
        </p>

        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <div className="flex items-start gap-3 mb-2">
            <AudioButton
              text={content.story}
              label="Listen to the story"
              onPlay={() => handlePlayback(content.story)}
            />
          </div>
          <p className="text-gray-700 leading-relaxed">
            {content.story}
          </p>
        </div>

        <p className="text-gray-700 mb-3 font-medium">
          Which sentence uses "{word.english}" correctly?
        </p>

        <div className="mb-6 animate-bounce-in">
          <div className="space-y-4">
            {content.options.map((sentence, index) => {
              const isSelected = selectedIndex === index;
              const isCorrectSentence = correctIndex === index;
              const isWrongSelection = correctIndex !== null && selectedIndex === index && !isCorrectSentence;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    isCorrectSentence
                      ? 'bg-green-100 border-green-500'
                      : isWrongSelection
                      ? 'bg-red-100 border-red-500'
                      : isSelected
                      ? 'bg-yellow-100 border-yellow-500'
                      : 'bg-gray-50 border-gray-300 hover:border-yellow-400'
                  }`}
                  onClick={() => {
                    if (correctIndex === null) {
                      setSelectedIndex(index);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <AudioButton
                      text={sentence}
                      label="Play sentence"
                      onPlay={() => handlePlayback(sentence)}
                      className="text-sm"
                    />
                    <p className="flex-1 text-lg">{sentence}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={handleSkip} className="btn-secondary" disabled={correctIndex !== null}>
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className={`btn-primary ${selectedIndex === null || correctIndex !== null ? '' : 'animate-pulse-gentle'}`}
            disabled={selectedIndex === null || correctIndex !== null}
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
