import React, { useState } from 'react';
import { AudioButton } from '../../../components/AudioButton';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { getVoiceLang } from '../../../lib/tts';
import { playSuccessSound } from '../../../lib/confetti';
import { lexicalContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface FormScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const FormScreen: React.FC<FormScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [understood, setUnderstood] = useState(false);
  const [startTime] = useState(Date.now());

  const content = lexicalContent[word.id as keyof typeof lexicalContent].form;

  const handleContinue = () => {
    setUnderstood(true);

    log({
      framework: 'lexical',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'form' },
    });

    playSuccessSound();

    setTimeout(() => {
      onComplete({
        stepId: 'form',
        correct: true,
        skipped: false,
        attempts: 1,
        timeSpent: Date.now() - startTime,
      });
    }, 1000);
  };

  const handleSkip = () => {
    log({
      framework: 'lexical',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'form' },
    });

    onComplete({
      stepId: 'form',
      correct: false,
      skipped: true,
      attempts: 0,
      timeSpent: Date.now() - startTime,
    });
  };

  const handlePlayback = () => {
    const voiceLang = getVoiceLang();
    log({
      framework: 'lexical',
      wordId: word.id,
      event: 'tts_speak',
      meta: { stepId: 'form', text: word.english, voiceLang },
    });
  };

  return (
    <div className="card animate-fade-in step-form text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">🔤</span>
          Form: Word Recognition
        </h2>
        <p className="text-gray-700 mb-6">
          Learn how to recognize and say "{word.english}" correctly.
        </p>

        <div className="mb-6 animate-bounce-in">
          <div className="p-6 bg-orange-50 border-2 border-orange-400 rounded-lg text-center">
            <div className="mb-4">
              <p className="text-6xl font-bold text-orange-700 mb-2">{word.english}</p>
              <p className="text-2xl text-gray-600">({word.telugu.script})</p>
            </div>

            <div className="mb-4">
              <AudioButton
                text={word.english}
                label="Listen to pronunciation"
                onPlay={handlePlayback}
              />
            </div>

            <div className="flex gap-2 justify-center mb-4">
              {content.letters.map((letter, index) => (
                <div
                  key={index}
                  className="w-12 h-12 bg-white border-2 border-orange-500 rounded-lg flex items-center justify-center text-xl font-bold text-orange-700"
                >
                  {letter}
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-600">
              This word has {content.letters.length} letters
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={handleSkip} className="btn-secondary" disabled={understood}>
            Skip
          </button>
          <button
            onClick={handleContinue}
            className={`btn-primary ${understood ? '' : 'animate-pulse-gentle'}`}
            disabled={understood}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
