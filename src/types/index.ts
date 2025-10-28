// Core word data types
export interface Word {
  id: string;
  english: string;
  ipa: string;
  telugu: {
    script: string;
    transliteration: string;
  };
  definition: string;
  examples: string[];
  morphology?: {
    root?: string;
    derivedForms?: string[];
  };
}

// Analytics event types
export interface AnalyticsEvent {
  ts: number;
  userId: string;
  framework: string;
  wordId: string;
  event: string;
  meta?: Record<string, unknown>;
}

// Journey step configuration
export interface JourneyStep {
  id: string;
  label: string;
  skill: 'listening' | 'reading' | 'writing';
}

// Session state for tracking progress
export interface SessionState {
  currentFramework: string;
  currentWord: string;
  currentStep: number;
  attempts: number;
  skipped: boolean;
  correct: boolean;
  startTime: number;
}

// Step result for mastery calculation
export interface StepResult {
  stepId: string;
  correct: boolean;
  skipped: boolean;
  attempts: number;
  timeSpent: number;
}

// Complete word result
export interface WordResult {
  wordId: string;
  framework: string;
  steps: StepResult[];
  mastery: boolean;
  completedAt: number;
}

// Framework comparison data
export interface FrameworkComparison {
  framework: string;
  totalSteps: number;
  correctSteps: number;
  skippedSteps: number;
  averageAttempts: number;
  totalTime: number;
}
