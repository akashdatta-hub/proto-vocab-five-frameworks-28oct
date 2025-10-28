import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Stepper } from '../../components/Stepper';
import { SoundToggle } from '../../components/SoundToggle';
import { FeedbackButton } from '../../components/FeedbackButton';
import { FeedbackPanel } from '../../components/FeedbackPanel';
import { useAnalytics } from '../../hooks/useAnalytics';
import wordsData from '../../data/words.json';
import { steps } from './config';
import { A1Screen } from './screens/A1';
import { A2Screen } from './screens/A2';
import { B1Screen } from './screens/B1';
import { B2Screen } from './screens/B2';
import { C1Screen } from './screens/C1';
import { C2Screen } from './screens/C2';
import type { StepResult } from '../../types';

export const CEFRJourney: React.FC = () => {
  const { word: wordId } = useParams<{ word: string }>();
  const { log } = useAnalytics();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepResults, setStepResults] = useState<StepResult[]>([]);
  const [showComplete, setShowComplete] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const word = wordsData.find((w) => w.id === wordId);

  useEffect(() => {
    if (!word) return;

    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'step_view',
      meta: { stepId: steps[currentStep].id, stepIndex: currentStep },
    });
  }, [currentStep, word, log]);

  if (!word) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Word not found</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const handleStepComplete = (result: StepResult) => {
    setStepResults((prev) => [...prev, result]);
    setCompletedSteps((prev) => [...prev, currentStep]);

    log({
      framework: 'cefr',
      wordId: word.id,
      event: 'complete_word',
      meta: { stepId: result.stepId, correct: result.correct, skipped: result.skipped },
    });

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setShowComplete(true);
    }
  };

  if (showComplete) {
    const totalSteps = stepResults.length;
    const correctSteps = stepResults.filter((r) => r.correct && !r.skipped).length;
    const mastery = totalSteps > 0 && correctSteps / totalSteps >= 0.8;
    const c1Result = stepResults.find((r) => r.stepId === 'C1');
    const passedC1 = c1Result?.correct && !c1Result?.skipped;

    const skillScores = {
      listening: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
      writing: { correct: 0, total: 0 },
    };

    stepResults.forEach((result, idx) => {
      const step = steps[idx];
      if (step && step.skill in skillScores) {
        const skill = step.skill as keyof typeof skillScores;
        skillScores[skill].total += 1;
        if (result.correct && !result.skipped) {
          skillScores[skill].correct += 1;
        }
      }
    });

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {mastery && passedC1 ? '🎉' : '👍'} Journey Complete!
            </h1>
            <p className="text-xl text-gray-700">
              You've finished CEFR journey for "{word.english}"
            </p>
          </div>

          <div className="card mb-6">
            <h2 className="text-2xl font-semibold mb-4">Results</h2>
            <div className="text-lg mb-4">
              Score: {correctSteps} / {totalSteps} steps completed correctly
            </div>
            <div className="mb-6">
              {mastery && passedC1 ? (
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 text-green-900">
                  <strong>Mastery achieved!</strong> You demonstrated excellent proficiency across
                  CEFR levels A1-C2.
                </div>
              ) : (
                <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-4 text-blue-900">
                  <strong>Good effort!</strong> Keep practicing to improve your language level.
                </div>
              )}
            </div>

            <div className="space-y-2 mb-6">
              <h3 className="font-semibold mb-2">Skill Breakdown</h3>
              {Object.entries(skillScores).map(([skill, scores]) => {
                if (scores.total === 0) return null;
                const percentage = (scores.correct / scores.total) * 100;
                return (
                  <div key={skill} className="flex items-center gap-3">
                    <span className="capitalize font-medium w-24">{skill}:</span>
                    <div className="flex-1 progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {scores.correct}/{scores.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link to="/" className="btn-primary">
              Home
            </Link>
            <Link to="/compare" className="btn-secondary">
              View Comparison
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stepComponents = [
    <A1Screen key="A1" word={word} onComplete={(result) => handleStepComplete(result)} />,
    <A2Screen key="A2" word={word} onComplete={(result) => handleStepComplete(result)} />,
    <B1Screen key="B1" word={word} onComplete={(result) => handleStepComplete(result)} />,
    <B2Screen key="B2" word={word} onComplete={(result) => handleStepComplete(result)} />,
    <C1Screen key="C1" word={word} onComplete={(result) => handleStepComplete(result)} />,
    <C2Screen key="C2" word={word} onComplete={(result) => handleStepComplete(result)} />,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <SoundToggle />
      <FeedbackButton onClick={() => setFeedbackOpen(true)} />
      <FeedbackPanel
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        framework="cefr"
        wordId={word.id}
        stepId={steps[currentStep].id}
        stepLabel={steps[currentStep].label}
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">CEFR Ladder Journey</h1>
          <p className="text-gray-600">
            Learning "{word.english}" ({word.telugu.script})
          </p>
        </div>

        <Stepper steps={steps} currentStep={currentStep} completedSteps={completedSteps} />

        <div className="mt-8">{stepComponents[currentStep]}</div>
      </div>
    </div>
  );
};
