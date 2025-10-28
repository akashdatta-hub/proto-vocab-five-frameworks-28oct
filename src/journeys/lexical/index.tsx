import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Stepper } from '../../components/Stepper';
import { FeedbackButton } from '../../components/FeedbackButton';
import { FeedbackPanel } from '../../components/FeedbackPanel';
import { useAnalytics } from '../../hooks/useAnalytics';
import wordsData from '../../data/words.json';
import { steps } from './config';
import { FormScreen } from './screens/Form';
import { MeaningScreen } from './screens/Meaning';
import { UseScreen } from './screens/Use';
import { AssociationsScreen } from './screens/Associations';
import { MorphologyScreen } from './screens/Morphology';
import { NuancesScreen } from './screens/Nuances';
import type { Word, StepResult } from '../../types';

export const LexicalJourney: React.FC = () => {
  const { word: wordParam } = useParams<{ word: string }>();
  const { log } = useAnalytics();

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepResults, setStepResults] = useState<StepResult[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const word = wordsData.find((w) => w.id === wordParam) as Word;

  useEffect(() => {
    if (!word) return;

    log({
      framework: 'lexical',
      wordId: word.id,
      event: 'journey_start',
      meta: { totalSteps: steps.length },
    });
  }, [word, log]);

  const handleStepComplete = (result: StepResult) => {
    const newResults = [...stepResults, result];
    setStepResults(newResults);
    setCompletedSteps([...completedSteps, currentStep]);

    log({
      framework: 'lexical',
      wordId: word.id,
      event: 'step_complete',
      meta: {
        stepId: result.stepId,
        stepIndex: currentStep,
        correct: result.correct,
        skipped: result.skipped,
        attempts: result.attempts,
        timeSpent: result.timeSpent,
      },
    });

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const correctCount = newResults.filter((r) => r.correct).length;
      const totalSteps = newResults.length;
      const accuracyPercent = (correctCount / totalSteps) * 100;
      const masteryAchieved = result.stepId === 'nuances' && accuracyPercent >= 80;

      log({
        framework: 'lexical',
        wordId: word.id,
        event: 'journey_complete',
        meta: {
          correctCount,
          totalSteps,
          accuracyPercent: Math.round(accuracyPercent),
          masteryAchieved,
        },
      });

      setShowCompletion(true);
    }
  };

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

  if (showCompletion) {
    const correctSteps = stepResults.filter((r) => r.correct && !r.skipped).length;
    const totalSteps = stepResults.length;
    const mastery = totalSteps > 0 && correctSteps / totalSteps >= 0.8;
    const nuancesResult = stepResults.find((r) => r.stepId === 'nuances');
    const passedNuances = nuancesResult?.correct && !nuancesResult?.skipped;

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
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {mastery && passedNuances ? '🎉' : '👍'} Journey Complete!
            </h1>
            <p className="text-xl text-gray-700">
              You've finished the Lexical Approach journey for "{word.english}"
            </p>
          </div>

          <div className="card mb-6">
            <h2 className="text-2xl font-semibold mb-4">Results</h2>
            <div className="text-lg mb-4">
              Score: {correctSteps} / {totalSteps} steps completed correctly
            </div>
            <div className="mb-6">
              {mastery && passedNuances ? (
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 text-green-900">
                  <strong>Mastery achieved!</strong> You demonstrated deep understanding of this
                  word's form, meaning, use, and nuances!
                </div>
              ) : (
                <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-4 text-blue-900">
                  <strong>Good effort!</strong> Keep exploring all aspects of vocabulary.
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
    <FormScreen key="form" word={word} onComplete={(result) => handleStepComplete(result)} />,
    <MeaningScreen key="meaning" word={word} onComplete={(result) => handleStepComplete(result)} />,
    <UseScreen key="use" word={word} onComplete={(result) => handleStepComplete(result)} />,
    <AssociationsScreen key="associations" word={word} onComplete={(result) => handleStepComplete(result)} />,
    <MorphologyScreen key="morphology" word={word} onComplete={(result) => handleStepComplete(result)} />,
    <NuancesScreen key="nuances" word={word} onComplete={(result) => handleStepComplete(result)} />,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8">
      <FeedbackButton onClick={() => setFeedbackOpen(true)} />
      <FeedbackPanel
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        framework="lexical"
        wordId={word.id}
        stepId={steps[currentStep].id}
        stepLabel={steps[currentStep].label}
      />
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Lexical Approach Journey
          </h1>
          <p className="text-gray-600 text-center">
            Master "{word.english}" through deep vocabulary analysis
          </p>
        </div>

        <Stepper steps={steps} currentStep={currentStep} completedSteps={completedSteps} />

        <div className="mt-8">{stepComponents[currentStep]}</div>
      </div>
    </div>
  );
};
