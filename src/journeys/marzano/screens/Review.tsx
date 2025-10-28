import React, { useState } from 'react';
import { ChoiceGrid } from '../../../components/ChoiceGrid';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { marzanoContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface ReviewScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [questionAttempts, setQuestionAttempts] = useState<Record<string, number>>({});

  const content = marzanoContent[word.id as keyof typeof marzanoContent].review;
  const currentQuestion = content.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === content.questions.length - 1;

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const validateCurrentAnswer = (): boolean => {
    const userAnswer = answers[currentQuestion.id]?.trim().toLowerCase();

    if (currentQuestion.type === 'choice') {
      return userAnswer === currentQuestion.correctId;
    } else if (currentQuestion.type === 'fill') {
      return userAnswer === currentQuestion.correctAnswer?.toLowerCase();
    }
    return false;
  };

  const handleSubmit = () => {
    const currentAnswer = answers[currentQuestion.id];
    if (!currentAnswer?.trim() || completed) return;

    const isCorrect = validateCurrentAnswer();
    const newAttempts = attempts + 1;
    const currentQAttempts = (questionAttempts[currentQuestion.id] || 0) + 1;

    setAttempts(newAttempts);
    setQuestionAttempts((prev) => ({
      ...prev,
      [currentQuestion.id]: currentQAttempts,
    }));

    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'answer_submit',
      meta: {
        stepId: 'review',
        questionId: currentQuestion.id,
        answer: currentAnswer,
        attempt: newAttempts,
        questionAttempt: currentQAttempts,
      },
    });

    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'answer_result',
      meta: {
        stepId: 'review',
        questionId: currentQuestion.id,
        correct: isCorrect,
        attempts: newAttempts,
        questionAttempt: currentQAttempts,
      },
    });

    if (isCorrect) {
      setFeedbackMessage('Correct!');
      setFeedbackType('success');
      setShowFeedback(true);
      playSuccessSound();

      setTimeout(() => {
        setShowFeedback(false);
        if (isLastQuestion) {
          // All questions completed successfully
          setCompleted(true);
          triggerConfetti();

          setTimeout(() => {
            onComplete({
              stepId: 'review',
              correct: true,
              skipped: false,
              attempts: newAttempts,
              timeSpent: Date.now() - startTime,
            });
          }, 1500);
        } else {
          // Move to next question
          setCurrentQuestionIndex((prev) => prev + 1);
        }
      }, 1000);
    } else if (currentQAttempts >= 3) {
      // Failed this question after 3 attempts
      const correctAnswerText = currentQuestion.type === 'choice'
        ? currentQuestion.options?.find((opt) => opt.id === currentQuestion.correctId)?.label
        : currentQuestion.correctAnswer;

      setFeedbackMessage(`The correct answer is: ${correctAnswerText}`);
      setFeedbackType('info');
      setShowFeedback(true);

      setTimeout(() => {
        setShowFeedback(false);
        if (isLastQuestion) {
          // Completed all questions (with some failures)
          setCompleted(true);

          setTimeout(() => {
            onComplete({
              stepId: 'review',
              correct: false,
              skipped: false,
              attempts: newAttempts,
              timeSpent: Date.now() - startTime,
            });
          }, 1500);
        } else {
          // Move to next question
          setCurrentQuestionIndex((prev) => prev + 1);
        }
      }, 2000);
    } else {
      setFeedbackMessage(
        `Not quite. ${3 - currentQAttempts} ${3 - currentQAttempts === 1 ? 'try' : 'tries'} left for this question.`
      );
      setFeedbackType('error');
      setShowFeedback(true);
      playErrorSound();

      // Clear the answer for retry
      if (currentQuestion.type === 'choice') {
        setAnswers((prev) => {
          const newAnswers = { ...prev };
          delete newAnswers[currentQuestion.id];
          return newAnswers;
        });
      }
    }
  };

  const handleSkip = () => {
    log({
      framework: 'marzano',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'review' },
    });

    onComplete({
      stepId: 'review',
      correct: false,
      skipped: true,
      attempts,
      timeSpent: Date.now() - startTime,
    });
  };

  const renderQuestion = () => {
    if (currentQuestion.type === 'choice') {
      const choices = currentQuestion.options?.map((opt) => ({
        id: opt.id,
        label: opt.label,
      })) || [];

      return (
        <div className="mb-6 animate-bounce-in">
          <p className="text-lg mb-4 font-medium">{currentQuestion.question}</p>
          <ChoiceGrid
            choices={choices}
            selectedId={answers[currentQuestion.id] || null}
            correctId={null}
            onSelect={handleAnswerChange}
            disabled={completed}
            columns={1}
          />
        </div>
      );
    } else if (currentQuestion.type === 'fill') {
      return (
        <div className="mb-6 animate-bounce-in">
          <p className="text-lg mb-4 font-medium">{currentQuestion.question}</p>
          <input
            type="text"
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            disabled={completed}
            placeholder="Type your answer..."
            className="input-field"
            aria-label="Your answer"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card animate-fade-in step-review text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">📝</span>
          Step 6: Review
        </h2>
        <p className="text-gray-700 mb-6">
          Answer all questions to review your understanding of "{word.english}".
        </p>

        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {content.questions.length}
          </div>
          <div className="flex gap-1">
            {content.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`w-3 h-3 rounded-full ${
                  idx === currentQuestionIndex
                    ? 'bg-green-600'
                    : idx < currentQuestionIndex
                    ? 'bg-green-400'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          {renderQuestion()}
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={handleSkip} className="btn-secondary" disabled={completed}>
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className={`btn-primary ${!answers[currentQuestion.id]?.trim() || completed ? '' : 'animate-pulse-gentle'}`}
            disabled={!answers[currentQuestion.id]?.trim() || completed}
          >
            {isLastQuestion ? 'Finish' : 'Next'}
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
