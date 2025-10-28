export type Thumb = "up" | "down" | null;
export type Difficulty = "easy" | "medium" | "difficult" | null;

export type FeedbackItem = {
  id: string;                 // uuid
  ts: number;                 // timestamp (ms)
  sessionId: string;          // anon session uuid
  userId: string;             // anon user uuid
  framework: string;          // "blooms" | "cefr" | "marzano" | "nation" | "lexical"
  wordId: string;             // "river" | "festival" | "harvest"
  stepId: string;             // framework-specific step id
  stepLabel: string;          // human-readable
  thumb: Thumb;               // up/down/null
  include: boolean | null;    // Include this type of question?
  difficulty: Difficulty;     // easy/medium/difficult/null
  comment: string;            // optional
  meta?: Record<string, unknown>; // future-safe
};

// Simple UUID generator
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get or create anonymous session/user IDs
let sessionId: string | null = null;
let userId: string | null = null;

export function getSessionId(): string {
  if (!sessionId) {
    sessionId = sessionStorage.getItem('pvf_session_id');
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem('pvf_session_id', sessionId);
    }
  }
  return sessionId;
}

export function getUserId(): string {
  if (!userId) {
    userId = localStorage.getItem('pvf_user_id');
    if (!userId) {
      userId = generateUUID();
      localStorage.setItem('pvf_user_id', userId);
    }
  }
  return userId;
}

// Create a new feedback item
export function createFeedbackItem(params: {
  framework: string;
  wordId: string;
  stepId: string;
  stepLabel: string;
  thumb: Thumb;
  include: boolean | null;
  difficulty: Difficulty;
  comment: string;
  meta?: Record<string, unknown>;
}): FeedbackItem {
  return {
    id: generateUUID(),
    ts: Date.now(),
    sessionId: getSessionId(),
    userId: getUserId(),
    ...params,
  };
}
