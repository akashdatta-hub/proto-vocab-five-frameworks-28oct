import React, { useState } from 'react';
import { WritePad } from '../../../components/WritePad';
import { AudioButton } from '../../../components/AudioButton';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { getVoiceLang } from '../../../lib/tts';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { nationContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface OutputScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const OutputScreen: React.FC<OutputScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const content = nationContent[word.id as keyof typeof nationContent].output;

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

    // Check if sentence uses at least 2 words from word bank
    const usedBankWords = content.wordBank.filter((bankWord) =>
      normalized.includes(bankWord.toLowerCase())
    );
    if (usedBankWords.length < 2) {
      return {
        valid: false,
        reason: 'Please use at least 2 words from the word bank.',
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
      framework: 'nation',
      wordId: word.id,
      event: 'answer_submit',
      meta: { stepId: 'output', sentenceLength: answer.trim().length, attempt: newAttempts },
    });

    log({
      framework: 'nation',
      wordId: word.id,
      event: 'answer_result',
      meta: { stepId: 'output', correct: validation.valid, attempts: newAttempts },
    });

    if (validation.valid) {
      setCompleted(true);
      setFeedbackMessage('Great sentence! You used the word effectively! 🎉');
      setFeedbackType('success');
      setShowFeedback(true);

      triggerConfetti();
      playSuccessSound();

      setTimeout(() => {
        onComplete({
          stepId: 'output',
          correct: true,
          skipped: false,
          attempts: newAttempts,
          timeSpent: Date.now() - startTime,
        });
      }, 2000);
    } else if (newAttempts >= 3) {
      setCompleted(true);
      setFeedbackMessage(
        validation.reason || 'Good effort! Keep practicing your writing.'
      );
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        onComplete({
          stepId: 'output',
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
      playErrorSound();
    }
  };

  const handleSkip = () => {
    log({
      framework: 'nation',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'output' },
    });

    onComplete({
      stepId: 'output',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  const handlePlayback = () => {
    const voiceLang = getVoiceLang();
    log({
      framework: 'nation',
      wordId: word.id,
      event: 'tts_speak',
      meta: { stepId: 'output', text: answer, voiceLang },
    });
  };

  const insertWord = (word: string) => {
    if (completed) return;
    const newAnswer = answer.trim() + (answer.trim() ? ' ' : '') + word;
    setAnswer(newAnswer);
  };

  return (
    <div className="card animate-fade-in step-output text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">✍️</span>
          Output: Write a Sentence
        </h2>
        <p className="text-gray-700 mb-6">
          {content.prompt}
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Word Bank:</label>
          <div className="flex flex-wrap gap-2 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            {content.wordBank.map((bankWord) => (
              <button
                key={bankWord}
                onClick={() => insertWord(bankWord)}
                className="px-3 py-1 bg-yellow-200 text-gray-900 rounded-lg hover:bg-yellow-300 transition-colors text-sm font-medium"
                disabled={completed}
              >
                {bankWord}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 animate-bounce-in">
          <WritePad
            value={answer}
            onChange={setAnswer}
            placeholder={`Write a sentence using "${word.english}" and words from the word bank...`}
            disabled={completed}
            label="Your sentence"
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
