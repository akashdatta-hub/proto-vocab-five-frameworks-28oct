# Feedback Layer Specification

## Purpose
This layer allows **stakeholders** (educators, researchers, designers) to provide feedback on individual steps of vocabulary journeys. It is **not** for learners. The system is anonymous and uses localStorage only, with export/import capabilities for aggregating feedback across sessions.

## User Experience

### Feedback Panel (Right Sidebar)
- **Trigger**: Clicking a feedback button (💬 icon) visible on all journey screens
- **Location**: Slides in from the right side of the screen
- **Visibility**: Always available during any step of any framework journey
- **Accessibility**:
  - Focus trap when open
  - Keyboard navigation (Tab, Shift+Tab)
  - Escape key to close
  - ARIA labels for screen readers

### Feedback Form Controls
1. **Thumbs Rating**: Up or Down (mutually exclusive buttons)
2. **Include Question**: "Include this type of question?" (checkbox)
3. **Difficulty**: Easy | Medium | Difficult (radio buttons)
4. **Comment**: Optional free-text field (textarea)

### Admin Dashboard
- **Route**: `/feedback`
- **Features**:
  - Filter by framework, word, step, thumb, difficulty
  - Stats cards showing totals and percentages
  - Multiple chart visualizations
  - Table of all feedback responses
  - Export (download JSON), Import (upload JSON), Reset (clear all)

## Data Model

### FeedbackItem Type
```typescript
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
```

### Anonymous Tracking
- **Session ID**: Generated once per browser session (sessionStorage)
- **User ID**: Generated once per browser (localStorage)
- **Purpose**: Track patterns without identifying individuals
- **Privacy**: No personal information collected

## Storage

### localStorage Key
```typescript
const KEY = "pvf_feedback_v1";
```

### Storage Operations
```typescript
// Load all feedback
export const loadFeedback = (): FeedbackItem[] => {...}

// Save feedback array
export const saveFeedback = (items: FeedbackItem[]): void => {...}

// Merge feedback (deduplicates by id)
export const mergeFeedback = (current: FeedbackItem[], incoming: FeedbackItem[]): FeedbackItem[] => {...}

// Add single item
export const addFeedbackItem = (item: FeedbackItem): void => {...}

// Clear all feedback
export const clearFeedback = (): void => {...}

// Export to JSON string
export const exportFeedback = (): string => {...}

// Import from JSON string (merges with existing)
export const importFeedback = (jsonString: string): { success: boolean; count: number; error?: string } => {...}
```

## Components

### FeedbackButton
- **File**: `/src/components/FeedbackButton.tsx`
- **Purpose**: Trigger button to open feedback panel
- **Appearance**: 💬 icon, always visible
- **Props**: `onClick: () => void`

### FeedbackPanel
- **File**: `/src/components/FeedbackPanel.tsx`
- **Purpose**: Right sidebar modal for capturing feedback
- **Props**:
  - `isOpen: boolean`
  - `onClose: () => void`
  - `framework: string`
  - `wordId: string`
  - `stepId: string`
  - `stepLabel: string`
- **Features**:
  - Focus trap
  - Escape key handling
  - Analytics logging (feedback_open, feedback_close, feedback_submit)
  - Creates FeedbackItem on save

### FeedbackControls
- **File**: `/src/components/FeedbackControls.tsx`
- **Purpose**: Form controls for feedback inputs
- **Features**:
  - Mutually exclusive thumb buttons
  - Include checkbox
  - Difficulty radio group
  - Comment textarea
  - Full ARIA labels

### Charts
- **File**: `/src/components/Charts.tsx`
- **Purpose**: CSS-only bar charts for admin dashboard
- **Components**: BarChart, StackedBarChart
- **Features**: Horizontal bars with percentage labels, ARIA labels

## Integration

### Journey Files
All 5 journey files have been updated:
- `/src/journeys/blooms/index.tsx`
- `/src/journeys/cefr/index.tsx`
- `/src/journeys/marzano/index.tsx`
- `/src/journeys/nation/index.tsx`
- `/src/journeys/lexical/index.tsx`

Each includes:
```typescript
import { FeedbackButton } from '../../components/FeedbackButton';
import { FeedbackPanel } from '../../components/FeedbackPanel';

const [feedbackOpen, setFeedbackOpen] = useState(false);

// In JSX:
<FeedbackButton onClick={() => setFeedbackOpen(true)} />
<FeedbackPanel
  isOpen={feedbackOpen}
  onClose={() => setFeedbackOpen(false)}
  framework="[framework-name]"
  wordId={word.id}
  stepId={steps[currentStep].id}
  stepLabel={steps[currentStep].label}
/>
```

### Router
- **File**: `/src/router/index.tsx`
- **Route**: `/feedback` → `<FeedbackAdmin />`

## Analytics Events

### Feedback Panel Events
```typescript
// Panel opened
{
  framework: string,
  wordId: string,
  event: 'feedback_open',
  meta: { stepId: string, stepLabel: string }
}

// Panel closed without submitting
{
  framework: string,
  wordId: string,
  event: 'feedback_close',
  meta: { stepId: string }
}

// Feedback submitted
{
  framework: string,
  wordId: string,
  event: 'feedback_submit',
  meta: {
    stepId: string,
    thumb: Thumb,
    include: boolean | null,
    difficulty: Difficulty,
    hasComment: boolean
  }
}
```

### Admin Dashboard Events
```typescript
// Export feedback
{
  framework: 'admin',
  wordId: 'n/a',
  event: 'feedback_export',
  meta: { count: number }
}

// Import feedback
{
  framework: 'admin',
  wordId: 'n/a',
  event: 'feedback_import',
  meta: { count: number, success: boolean }
}

// Reset feedback
{
  framework: 'admin',
  wordId: 'n/a',
  event: 'feedback_reset',
  meta: { count: number }
}
```

## Accessibility

### FeedbackPanel
- **Role**: `role="dialog"`, `aria-modal="true"`
- **Focus Management**: Focus trap keeps tab navigation within panel when open
- **Keyboard Support**: Escape key closes panel
- **Screen Readers**: All form controls have ARIA labels

### FeedbackControls
- **Labels**: All inputs have associated labels or aria-labels
- **Radio Groups**: Proper fieldset and legend for difficulty
- **Buttons**: Clear labels (e.g., "Thumbs up", "Thumbs down")

### Charts
- **ARIA Labels**: Each chart has descriptive aria-label
- **Text Alternatives**: Percentage values displayed as text

## Export/Import Workflow

### For Stakeholders
1. **Individual Session**: Use app, provide feedback via panel
2. **Export**: Visit `/feedback`, click "Export Feedback" to download JSON
3. **Share**: Email JSON file to researcher/coordinator
4. **Aggregate**: Researcher imports all JSON files into single session
5. **Analyze**: Use admin dashboard filters and charts to analyze patterns

### Merge Strategy
- Import merges by FeedbackItem.id (UUID)
- Duplicate IDs are deduplicated (latest wins)
- Allows multiple stakeholders to independently provide feedback
- Researcher can aggregate without data loss

## Future Enhancements (Not Implemented)
- Backend API for persistent storage
- Real-time collaboration
- Advanced analytics (time series, correlation)
- Export to CSV/Excel
- Email notifications
- User authentication (for non-anonymous feedback)

## Files Created

### Data Layer
- `/src/data/feedback.ts` - Data model and helpers
- `/src/lib/storage.ts` - localStorage adapter

### Components
- `/src/components/FeedbackButton.tsx` - Trigger button
- `/src/components/FeedbackPanel.tsx` - Right sidebar modal
- `/src/components/FeedbackControls.tsx` - Form controls
- `/src/components/Charts.tsx` - CSS-only charts

### Pages
- `/src/pages/FeedbackAdmin.tsx` - Admin dashboard

### Documentation
- `/assets/feedback/feedback-layer.md` - This file
