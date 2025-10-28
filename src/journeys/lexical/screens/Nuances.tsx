import React, { useState } from 'react';
import { FeedbackToast } from '../../../components/FeedbackToast';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { triggerConfetti, playSuccessSound, playErrorSound } from '../../../lib/confetti';
import { lexicalContent } from '../config';
import type { Word, StepResult } from '../../../types';

interface NuancesScreenProps {
  word: Word;
  onComplete: (result: StepResult) => void;
}

export const NuancesScreen: React.FC<NuancesScreenProps> = ({ word, onComplete }) => {
  const { log } = useAnalytics();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionAttempts, setQuestionAttempts] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<Set<number>>(new Set());

  const content = lexicalContent[word.id as keyof typeof lexicalContent].nuances;
  const currentQuestion = content.sentences[currentQuestionIndex];
  const currentAttempts = questionAttempts[currentQuestionIndex] || 0;

  const handleAnswer = (acceptable: boolean) => {
    if (completed || showFeedback) return;

    const correct = acceptable === currentQuestion.isAcceptable;
    const newAttempts = currentAttempts + 1;

    // Update attempts for current question
    const updatedAttempts = [...questionAttempts];
    updatedAttempts[currentQuestionIndex] = newAttempts;
    setQuestionAttempts(updatedAttempts);

    setIsCorrect(correct);
    setShowFeedback(true);

    log({
      framework: 'lexical',
      wordId: word.id,
      event: 'answer_submit',
      meta: {
        stepId: 'nuances',
        questionIndex: currentQuestionIndex,
        sentenceId: currentQuestion.id,
        correct,
        attempts: newAttempts,
        selectedAnswer: acceptable ? 'acceptable' : 'not_acceptable',
        correctAnswer: currentQuestion.isAcceptable ? 'acceptable' : 'not_acceptable',
      },
    });

    if (correct) {
      playSuccessSound();
      const newAnsweredCorrectly = new Set(answeredCorrectly);
      newAnsweredCorrectly.add(currentQuestionIndex);
      setAnsweredCorrectly(newAnsweredCorrectly);

      // Check if this was the last question
      if (currentQuestionIndex === content.sentences.length - 1) {
        triggerConfetti();
        setCompleted(true);

        setTimeout(() => {
          const totalAttempts = updatedAttempts.reduce((sum, att) => sum + att, 0);
          onComplete({
            stepId: 'nuances',
            correct: newAnsweredCorrectly.size === content.sentences.length,
            skipped: false,
            attempts: totalAttempts,
            timeSpent: Date.now() - startTime,
          });
        }, 2000);
      } else {
        // Move to next question
        setTimeout(() => {
          setShowFeedback(false);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, 1500);
      }
    } else {
      playErrorSound();

      if (newAttempts >= 3) {
        // Move to next question after 3 failed attempts
        setTimeout(() => {
          if (currentQuestionIndex === content.sentences.length - 1) {
            // Last question, complete the step
            setCompleted(true);
            setTimeout(() => {
              const totalAttempts = updatedAttempts.reduce((sum, att) => sum + att, 0);
              onComplete({
                stepId: 'nuances',
                correct: answeredCorrectly.size === content.sentences.length,
                skipped: false,
                attempts: totalAttempts,
                timeSpent: Date.now() - startTime,
              });
            }, 2000);
          } else {
            setShowFeedback(false);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          }
        }, 1500);
      } else {
        setTimeout(() => {
          setShowFeedback(false);
        }, 1500);
      }
    }
  };

  const handleSkip = () => {
    log({
      framework: 'lexical',
      wordId: word.id,
      event: 'step_skip',
      meta: { stepId: 'nuances' },
    });

    onComplete({
      stepId: 'nuances',
      correct: false,
      skipped: true,
      attempts: questionAttempts.reduce((sum, att) => sum + att, 0),
      timeSpent: Date.now() - startTime,
    });
  };

  return (
    <div className="card animate-fade-in step-nuances text-white">
      <div className="bg-white rounded-lg p-6 text-gray-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">🎯</span>
          Nuances: Judge Appropriateness of Usage
        </h2>
        <p className="text-gray-700 mb-6">
          Is this usage of <strong className="text-orange-600">{word.english}</strong> acceptable?
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {content.sentences.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index < currentQuestionIndex
                  ? answeredCorrectly.has(index)
                    ? 'bg-green-500'
                    : 'bg-red-300'
                  : index === currentQuestionIndex
                  ? 'bg-orange-600 ring-2 ring-orange-300'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="mb-6">
          <div className="p-6 bg-orange-50 border-2 border-orange-300 rounded-lg">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-3">
                {currentQuestion.usage}
              </span>
              <p className="text-xl text-gray-900 leading-relaxed">
                "{currentQuestion.text}"
              </p>
            </div>

            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => handleAnswer(true)}
                disabled={completed || showFeedback}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  completed || showFeedback
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Acceptable
              </button>
              <button
                onClick={() => handleAnswer(false)}
                disabled={completed || showFeedback}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  completed || showFeedback
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Not Acceptable
              </button>
            </div>
          </div>
        </div>

        {showFeedback && (
          <FeedbackToast
            type={isCorrect ? 'success' : 'error'}
            message={
              isCorrect
                ? 'Correct! Good judgment.'
                : currentAttempts >= 3
                ? `This usage is ${currentQuestion.isAcceptable ? 'acceptable' : 'not acceptable'}.`
                : 'Not quite. Try again!'
            }
          />
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1}/{content.sentences.length} | Attempts: {currentAttempts}/3
          </div>
          <div className="flex gap-3">
            <button onClick={handleSkip} className="btn-secondary" disabled={completed}>
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
