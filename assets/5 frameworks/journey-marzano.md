# Marzano Six‑Step Journey — Explain → Play & Review (for 3 Words: river, festival, harvest)

### Purpose
Implement a 6‑step flow per word based on Marzano's evidence‑based vocabulary process. Warm, supportive feedback, multimodal interactions, mock analytics. No external libraries; audio via Web Speech API where applicable.

### Audio Policy
**English TTS only** (prefer en-IN, fallback en-GB/en-US). Telugu hint = on-screen text only; no Telugu audio.

### Inputs
- `/src/data/words.json` with English lemma, IPA, examples, morphology; Telugu script + transliteration.
- Global components: AudioButton, ChoiceGrid, WritePad, HintChip, Stepper, FeedbackToast, MiniRubric, Card.
- Analytics logger `log(e)` and session state from master plan.
- TTS helper `speak(text)` with transcript fallback.

### Routes & Files
- Route: `/journey/marzano/:word` with a wrapper `/journey/marzano` listing all words.
- Directory structure: `/src/journeys/marzano/`
  - `config.ts`
  - `index.tsx`
  - `screens/Explain.tsx`
  - `screens/Restate.tsx`
  - `screens/Visualize.tsx`
  - `screens/Engage.tsx`
  - `screens/Discuss.tsx`
  - `screens/Review.tsx`

---

## Step Specs (per word)

### 1. Explain (Reading/Listening)
- **UI:** Teacher‑voice card plays English TTS definition; Telugu HintChip toggles script + transliteration (visual only).
- **Task:** Listen/read definition; continue to next step.
- **Events:** `step_view`, `tts_speak` (English only), `step_complete` (auto on Next).

### 2. Restate (Writing)
- **UI:** Guided input (“It means…” stem).  
- **Task:** Learner rephrases the definition in own words.  
- **Validation (heuristic):** Must contain 1–2 key semantic tokens from target definition.  
- **Feedback:** Warm suggestions if too short or missing key words.  
- **Events:** `step_view`, `answer_submit`, `answer_result`.

### 3. Visualize (Reading)
- **UI:** Drag small inline SVG icons (e.g., water, boat, tree, people, grain) to create a “scene”.  
- **Task:** Must place 2 required icons (logged).  
- **Validation:** Both required icons placed.  
- **Events:** `step_view`, `answer_submit`, `answer_result`.

### 4. Engage (Reading/Listening)
- **UI:** 3 short examples (2 correct uses, 1 incorrect). Plays English TTS when tapped.
- **Task:** Identify which one is incorrect.
- **Validation:** Must pick the incorrect one.
- **Events:** `step_view`, `tts_speak` (English only), `answer_submit`, `answer_result`.

### 5. Discuss (Reading)
- **UI:** Two peer explanation cards (“Student A”, “Student B”).  
- **Task:** Choose which explanation is clearer or more accurate.  
- **Validation:** Pre‑flag correct answer id in config.  
- **Feedback:** After 2nd error, show rationale.  
- **Events:** `step_view`, `answer_submit`, `answer_result`.

### 6. Play & Review (Reading/Writing)
- **UI:** 3 quick flashcards (definition, cloze, context). Each logs result separately.  
- **Task:** Answer all three; system tallies total correct.  
- **Events:** `step_view`, `answer_submit`, `answer_result`, `step_complete`.

---

## Common Rules
- **Attempts:** 3 max; show explanation after 2 errors; auto‑advance after 3rd (with correct answer reveal).
- **Skip:** Enabled; logs `step_skip`; reduces mastery for step.
- **Feedback:** Warm, supportive ("Nice try! Let's fix it together.").
- **Mastery at Complete:** ≥80% steps correct and ≥2/3 review flashcards correct.
- **Stakeholder Feedback:** FeedbackButton (💬) visible on all journey screens; opens FeedbackPanel for optional step-level feedback.

---

## Accessibility
- All actions keyboard‑operable; aria‑labels and transcripts for any TTS.  
- Alt text for icons; focus outlines visible.

---

## Telemetry
- Log: `step_view`, `answer_submit`, `answer_result`, `tts_speak`, `step_skip`, `complete_word`.  
- Capture time‑on‑step via timestamps.

---

## `config.ts` Example
```ts
export const steps = [
  { id: "Explain", label: "Explain", skill: "reading" },
  { id: "Restate", label: "Restate", skill: "writing" },
  { id: "Visualize", label: "Visualize", skill: "reading" },
  { id: "Engage", label: "Engage", skill: "reading" },
  { id: "Discuss", label: "Discuss", skill: "reading" },
  { id: "Review", label: "Play & Review", skill: "writing" }
];
```

---

## Deliverables Checklist
- [ ] Folder `/src/journeys/marzano/` created with 6 screen files + config + index.  
- [ ] Each step enforces 3‑attempt rule; explanations appear after 2 errors.  
- [ ] Skip logs work; mastery computed ≥80%.  
- [ ] All analytics events recorded.  
- [ ] A11y verified (keyboard + transcript).  
- [ ] Review step totals displayed at Complete screen with MiniRubric ticks.  
