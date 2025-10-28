# Nation Four‑Strands Journey — Input → Language → Output → Fluency (for 3 Words: river, festival, harvest)

### Purpose
Implement a 4‑step flow per word following Paul Nation's Four Strands model for balanced vocabulary acquisition. Supports audio via Web Speech API, warm feedback, and mock analytics. No external libraries.

### Audio Policy
**English TTS only** (prefer en-IN, fallback en-GB/en-US). Telugu hint = on-screen text only; no Telugu audio.

### Inputs
- `/src/data/words.json`: English lemma, IPA, examples, morphology; Telugu script + transliteration.
- Global components: AudioButton, ChoiceGrid, WritePad, HintChip, Stepper, FeedbackToast, MiniRubric, Card.
- Analytics logger `log(e)` and session state from master plan.
- TTS helper `speak(text)` with transcript fallback.

### Routes & Files
- Route: `/journey/nation/:word` (wrapper `/journey/nation` lists all words).
- Directory structure: `/src/journeys/nation/`
  - `config.ts`
  - `index.tsx`
  - `screens/Input.tsx`
  - `screens/Language.tsx`
  - `screens/Output.tsx`
  - `screens/Fluency.tsx`

---

## Step Specs (per word)

### 1. Meaning‑Focused Input (Listening/Reading)
- **UI:** Mini‑story (3–4 sentences) containing the target word; each sentence accessible via English TTS playback. Tap to reveal English definition; Telugu HintChip optional (visual only).
- **Task:** Read/listen to the story and select the sentence that best shows what the word means.
- **Validation:** Correct sentence id.
- **Events:** `step_view`, `tts_speak` (English only), `answer_submit`, `answer_result`, `hint_toggle`.

### 2. Language‑Focused Learning (Reading/Writing)
- **UI:** Spelling and pronunciation focus. Jumbled letters for reordering; display IPA; stress marker toggle.
- **Task:** Reorder letters to form correct word. Tap to hear English syllable stress using `speak()`.
- **Validation:** Reordered word === target lemma (case‑insensitive).
- **Events:** `step_view`, `answer_submit`, `answer_result`, `tts_speak` (English only).

### 3. Meaning‑Focused Output (Writing)
- **UI:** Prompt card encourages sentence generation (e.g., “Use the word ‘river’ to describe something near your village”). Word bank provided.
- **Task:** Type 1–2 sentences using the word correctly.
- **Validation (heuristic):** Contains target word; length ≥ 5 tokens.
- **Feedback:** Warm, specific; encourages retry if missing target or too short.
- **Events:** `step_view`, `answer_submit`, `answer_result`.

### 4. Fluency Development (Listening/Reading)
- **UI:** Re‑reading mini‑story from Step 1 (now faster English TTS rate). Followed by a quick recall question (choose correct word for new sentence). Capture pseudo‑timing.
- **Task:** Select correct word quickly.
- **Validation:** Exact match.
- **Events:** `step_view`, `tts_speak` (English only), `answer_submit`, `answer_result`.

---

## Common Rules
- **Attempts:** Max 3; explanation after 2 errors; reveal answer after 3rd.
- **Skip:** Enabled; logs `step_skip`; reduces mastery.
- **Feedback:** Warm and supportive.
- **Mastery at Complete:** ≥80% total + successful Output sentence (not skipped).
- **Stakeholder Feedback:** FeedbackButton (💬) visible on all journey screens; opens FeedbackPanel for optional step-level feedback.

---

## Accessibility
- Keyboard navigation for all steps; transcripts for audio.  
- Visible focus styles; alt text for any images.  
- Telugu HintChip off by default.

---

## Telemetry
- Log: `step_view`, `answer_submit`, `answer_result`, `tts_speak`, `hint_toggle`, `step_skip`, `complete_word`.  
- Record timestamps for step duration.

---

## `config.ts` Example
```ts
export const steps = [
  { id: "Input", label: "Meaning-Focused Input", skill: "listening" },
  { id: "Language", label: "Language-Focused Learning", skill: "reading" },
  { id: "Output", label: "Meaning-Focused Output", skill: "writing" },
  { id: "Fluency", label: "Fluency Development", skill: "reading" }
];
```

---

## Deliverables Checklist
- [ ] `/src/journeys/nation/` folder with 4 screen files + `config.ts` + `index.tsx`.  
- [ ] Each step follows attempt/skip/feedback logic.  
- [ ] Mock analytics logs all required events.  
- [ ] Complete screen shows mastery (≥80%) and MiniRubric ticks.  
- [ ] A11y verified with keyboard walkthrough and transcript access.  
