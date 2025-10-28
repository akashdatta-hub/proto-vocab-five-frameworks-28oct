# Bloom's Taxonomy Journey — "Remember → Create" for 3 Words (river, festival, harvest)

### Purpose
Implement a 6-step flow per word reflecting Bloom's hierarchy with warm, child-friendly feedback and mock analytics. No external libraries.

### Audio Policy
**English TTS only** (prefer en-IN, fallback en-GB/en-US). Telugu hint = on-screen text only; no Telugu audio.

### Inputs
- `/src/data/words.json` with IPA, Telugu (script + translit), examples, morphology.
- Global components: AudioButton, ChoiceGrid, WritePad, HintChip, Stepper, FeedbackToast, MiniRubric, Card.
- Analytics logger `log(e)` and session state types from plan.

### Routes & Files
- Mount under `/journey/blooms/:word` with a wrapper at `/journey/blooms` listing all words.
- Create directory: `/src/journeys/blooms/`
  - `config.ts` — step metadata
  - `index.tsx` — router wrapper and loader
  - `screens/Remember.tsx`
  - `screens/Understand.tsx`
  - `screens/Apply.tsx`
  - `screens/Analyze.tsx`
  - `screens/Evaluate.tsx`
  - `screens/Create.tsx`

---

## Step Specs (per word)

### 1. Remember (R/L)
- **UI:** Image + English TTS of the word. Telugu HintChip (off by default) reveals script + translit.
- **Task:** Select the English word label from 3 options.
- **Validation:** exact match.
- **Events:** `step_view`, `tts_speak` (English only), `answer_submit`, `answer_result`, `hint_toggle`.

### 2. Understand (R)
- **UI:** Card with 1 correct kid-friendly definition + 2 close distractors.  
- **Task:** Pick definition.  
- **Events:** same as above.

### 3. Apply (W)
- **UI:** Cloze sentence with on-screen word bank.  
- **Task:** Fill blank; trim+lowercase compare; allow one extra space.

### 4. Analyze (R)
- **UI:** Sort cards into **synonyms/near** vs **not** (2–4 cards).  
- **Task:** Drag-drop or click-to-bucket.

### 5. Evaluate (R)
- **UI:** 3 sentences; choose best-fit usage; after 2nd error show explanation.

### 6. Create (W/L)
- **UI:** WritePad (single sentence); optional English TTS playback of the student's sentence using `speechSynthesis`.
- **Validation:** Contains the target word; shallow context check via 2 allowable collocations list per word.

---

## Common Rules
- **Attempts:** cap 3 → reveal correct answer and proceed (logged).
- **Skip:** enabled; marks step as skipped (reduces mastery).
- **Feedback:** warm, specific; explanations after 2 errors.
- **Mastery at Complete:** ≥80% across steps; must pass Create without skip.
- **Stakeholder Feedback:** FeedbackButton (💬) visible on all journey screens; opens FeedbackPanel for optional step-level feedback.

---

## Accessibility
- All interactive controls keyboard-operable; aria-labels; transcripts for any audio.

---

## Telemetry
- Add `step_skip` for skips. Capture timestamps to compute time per step.

---

## Deliverables Checklist
- [ ] Folder + screens compile  
- [ ] All events logged  
- [ ] Stepper reflects progress  
- [ ] Complete screen calculates mastery and shows MiniRubric ticks  
