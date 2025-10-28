# Lexical Depth Journey — Form → Meaning → Use → Associations → Morphology → Nuances (for 3 Words: river, festival, harvest)

### Purpose
Implement a 6‑step flow per word based on the Lexical Depth Framework (Anderson & Nagy, Perfetti, Qian). Each step deepens word knowledge — from recognition to nuanced use. Warm feedback, mock analytics, and accessible UI. No external libraries; local assets only.

### Audio Policy
**English TTS only** (prefer en-IN, fallback en-GB/en-US). Telugu hint = on-screen text only; no Telugu audio.

### Inputs
- `/src/data/words.json` includes English lemma, IPA, examples, morphology; Telugu script + transliteration.
- Global components: AudioButton, ChoiceGrid, WritePad, HintChip, Stepper, FeedbackToast, MiniRubric, Card.
- Analytics logger `log(e)` and session state from master plan.
- TTS helper `speak(text)` using Web Speech API with transcript fallback.

### Routes & Files
- Route: `/journey/lexical/:word` (wrapper `/journey/lexical` lists all words).
- Directory structure: `/src/journeys/lexical/`
  - `config.ts`
  - `index.tsx`
  - `screens/Form.tsx`
  - `screens/Meaning.tsx`
  - `screens/Use.tsx`
  - `screens/Associations.tsx`
  - `screens/Morphology.tsx`
  - `screens/Nuances.tsx`

---

## Step Specs (per word)

### 1. Form (Listening)
- **UI:** Syllable‑tap and letter‑order mini‑puzzle. Play English TTS for the full word.
- **Task:** Arrange letters to form the word; tap syllables as they're spoken.
- **Validation:** Final string matches target lemma.
- **Events:** `step_view`, `tts_speak` (English only), `answer_submit`, `answer_result`.

### 2. Meaning (Reading)
- **UI:** Definition choice card set (1 correct + 2 distractors with close meaning).  
- **Task:** Select correct definition.  
- **Validation:** Must choose correct definition id.  
- **Feedback:** After 2 errors, show “why others are close but wrong.”  
- **Events:** `step_view`, `answer_submit`, `answer_result`.

### 3. Use (Reading)
- **UI:** 3 short sentences labelled as “Formal”, “Informal”, “Subject context”.  
- **Task:** Identify which sentence correctly uses the word for this context.  
- **Validation:** One correct sentence per config.  
- **Events:** `step_view`, `answer_submit`, `answer_result`.

### 4. Associations (Reading)
- **UI:** Word web — 6 nodes (related/unrelated).  
- **Task:** Select 3 related words; at least 2 must match truth set.  
- **Validation:** Compare selections to predefined related set.  
- **Events:** `step_view`, `answer_submit`, `answer_result`.

### 5. Morphology (Reading/Writing)
- **UI:** Prefix/suffix tiles and example sentences.  
- **Task:** Build a correct derived form (e.g., “harvester”) and place it in a sentence.  
- **Validation:** Derived form string check; correct grammatical fit.  
- **Feedback:** Show correct derived word if missed.  
- **Events:** `step_view`, `answer_submit`, `answer_result`.

### 6. Nuances (Reading)
- **UI:** 3 sentences, one with figurative/idiomatic use.  
- **Task:** Decide which uses are acceptable.  
- **Validation:** Accept figurative and literal if semantically valid.  
- **Events:** `step_view`, `answer_submit`, `answer_result`.

---

## Common Rules
- **Attempts:** Max 3 per step; explanation after 2 errors.
- **Skip:** Enabled; logs `step_skip`; counts against mastery.
- **Feedback:** Warm, supportive ("That's close! Let's see why the other fits better.").
- **Mastery at Complete:** ≥80% overall and Morphology passed.
- **Stakeholder Feedback:** FeedbackButton (💬) visible on all journey screens; opens FeedbackPanel for optional step-level feedback.

---

## Accessibility
- Keyboard navigation across all tasks.  
- Visible focus states.  
- Transcripts for audio.  
- Telugu HintChip off by default.

---

## Telemetry
- Log: `step_view`, `answer_submit`, `answer_result`, `tts_speak`, `step_skip`, `complete_word`.  
- Capture timestamps for step timing.  
- Save counts of correct/incorrect per step for `/compare` summary.

---

## `config.ts` Example
```ts
export const steps = [
  { id: "Form", label: "Form", skill: "listening" },
  { id: "Meaning", label: "Meaning", skill: "reading" },
  { id: "Use", label: "Use", skill: "reading" },
  { id: "Associations", label: "Associations", skill: "reading" },
  { id: "Morphology", label: "Morphology", skill: "writing" },
  { id: "Nuances", label: "Nuances", skill: "reading" }
];
```

---

## Deliverables Checklist
- [ ] `/src/journeys/lexical/` folder with 6 screen files + config + index.  
- [ ] Each step implements attempt cap, skip logging, feedback, and mastery logic.  
- [ ] Analytics events recorded for all steps.  
- [ ] Complete screen computes mastery (≥80%) and displays MiniRubric ticks.  
- [ ] Keyboard and transcript accessibility verified.  
