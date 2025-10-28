# CEFR Ladder Journey — A1→C2 (Child‑friendly) for 3 Words (river, festival, harvest)

### Purpose
Implement a 6‑step flow per word mirroring CEFR levels A1→C2 with warm, child‑friendly feedback and mock analytics. No external libraries or services. Audio via Web Speech API (if available) with transcript fallback. Telugu hints available (script + transliteration), off by default.

### Audio Policy
**English TTS only** (prefer en-IN, fallback en-GB/en-US). Telugu hint = on-screen text only; no Telugu audio.

### Inputs
- `/src/data/words.json` contains: English lemma, IPA, examples, morphology; Telugu script + transliteration.
- Global components available: `AudioButton`, `ChoiceGrid`, `WritePad`, `HintChip`, `Stepper`, `FeedbackToast`, `MiniRubric`, `Card`.
- Analytics logger `log(e)` and session state types from the master plan.
- TTS helper `speak(text)` using `window.speechSynthesis` with feature detection.

### Routes & Files
- Mount the journey under `/journey/cefr/:word` with a wrapper at `/journey/cefr` listing all words.
- Create directory: `/src/journeys/cefr/`
  - `config.ts` — ordered step metadata, mapping to skills and component screens.
  - `index.tsx` — router wrapper/loader to fetch word data and render the stepper sequence.
  - `screens/A1.tsx` — Recognition
  - `screens/A2.tsx` — Reproduction
  - `screens/B1.tsx` — Controlled Use
  - `screens/B2.tsx` — Contextual Use
  - `screens/C1.tsx` — Flexible Use
  - `screens/C2.tsx` — Creative/Abstract

---

## Step Specs (per word)

### A1 — Recognition (Listening)
- **UI:** Large image choice grid (2–4 options) + Play button for English TTS of the word. Telugu HintChip (off by default) reveals నది/nadi, పండుగ/panduga, పంట కోత/panta kōta as applicable (visual only).
- **Task:** Pick the image that matches the spoken English word.
- **Validation:** Exact target image id.
- **Events:** `step_view`, `tts_speak` (English only), `answer_submit`, `answer_result`, `hint_toggle`.

### A2 — Reproduction (Writing)
- **UI:** Copy‑type field with ghost letters for the target word (one line). Show IPA beneath (read‑only). Optional replay of English TTS for the word.
- **Task:** Type the English word correctly.
- **Validation:** Case‑insensitive, trim; allow one extra trailing space.
- **Events:** `step_view`, `answer_submit`, `answer_result`, `tts_speak` (English only, if used).

### B1 — Controlled Use (Reading/Writing)
- **UI:** Short paragraph (2–3 sentences) with a single cloze drop zone; 3‑item word bank includes the target + 2 distractors.
- **Task:** Drag or tap to place the correct word into the blank.
- **Validation:** Must select the target word; distractors logged.
- **Events:** `step_view`, `answer_submit`, `answer_result`.

### B2 — Contextual Use (Reading)
- **UI:** Two concise paragraphs (2–3 sentences each). One properly uses the target word; the other has a contextual misuse. Optional text bubble “Why this?” appears after submission.
- **Task:** Choose the best‑fit paragraph.
- **Validation:** Correct paragraph id.
- **Feedback:** After 2nd error, show explanation: why incorrect context is wrong.
- **Events:** `step_view`, `answer_submit`, `answer_result`.

### C1 — Flexible Use (Writing)
- **UI:** Prompt card asks learner to paraphrase a line using the target word (e.g., “Describe a time your village celebrated a ____.”).
- **Task:** Write a single sentence using the target word accurately.
- **Validation (heuristic):** Must contain target lemma; length ≥ 5 tokens; simple banned‑context list per word avoided (e.g., “river eats food”).
- **Events:** `step_view`, `answer_submit`, `answer_result`.

### C2 — Creative/Abstract (Writing/Listening)
- **UI:** Create a micro‑caption or short title using the target word. Optional English TTS playback of the learner's sentence.
- **Task:** Produce a brief, coherent caption/title that includes the target word.
- **Validation (heuristic):** Contains target lemma; length 3–12 words; not empty after trim.
- **Events:** `step_view`, `answer_submit`, `answer_result`, `tts_speak` (English only, if used).

---

## Common Rules (CEFR Journey)
- **Attempts:** Cap at **3** per step. After **2** errors, show an explanatory hint; after the **3rd**, reveal the correct answer and advance (log as revealed).
- **Skip:** Enable a **Skip** button; log `step_skip`; skip counts against mastery for that step.
- **Feedback tone:** Warm, child‑friendly, specific; never shaming.
- **Mastery at Complete:** Requires **≥80%** step accuracy overall **and** a passing C1 sentence (not skipped).
- **Stakeholder Feedback:** FeedbackButton (💬) visible on all journey screens; opens FeedbackPanel for optional step-level feedback.

---

## Accessibility
- All controls keyboard‑operable (tab/enter/space); visible focus styles.
- Provide transcripts for all audio/TTS prompts.
- Alt text for images; icons include `aria-label`.
- Telugu HintChip toggles script+transliteration; default OFF.

---

## Telemetry
- Log events: `step_view`, `answer_submit`, `answer_result`, `hint_toggle`, `tts_speak`, `step_skip`, `complete_word`.
- Capture timestamps on `step_view` and `answer_submit` to compute time‑on‑step.
- Track wrong‑option ids to enable error‑type breakdown on `/compare`.

---

## `config.ts` Example
```ts
export const steps = [
  { id: "A1", label: "A1 Recognition", skill: "listening" },
  { id: "A2", label: "A2 Reproduction", skill: "writing" },
  { id: "B1", label: "B1 Controlled Use", skill: "reading" },
  { id: "B2", label: "B2 Contextual Use", skill: "reading" },
  { id: "C1", label: "C1 Flexible Use", skill: "writing" },
  { id: "C2", label: "C2 Creative", skill: "writing" }
];
```

---

## Deliverables Checklist
- [ ] `/src/journeys/cefr/` folder with 6 screens + `config.ts` + `index.tsx` compiles without errors.
- [ ] Each step enforces attempts (3), shows explanation after 2 errors, and supports Skip.
- [ ] All required events are logged with timestamps and meta.
- [ ] Complete screen computes mastery (≥80%) and shows MiniRubric ticks for Listening/Reading/Writing.
- [ ] A11y: keyboard‑only walkthrough passes; transcripts present.
