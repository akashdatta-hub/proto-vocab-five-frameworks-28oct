# Master Product Build & Governance — Quality, Efficiency, and Consistency

### Title
Master plan governing all build steps for **proto-vocab-five-frameworks-28oct** prototype. Defines quality standards, build order, accessibility, analytics contracts, and delivery milestones.

---

## 1. Build Order (Phases)

1. **Scaffold & Data**
   - Create routes, Tailwind, words.json, session state, analytics, Web Speech API helper, SVG icons.
   - Create a TTS helper that selects en-IN if present; otherwise generic English. Do not implement Telugu speech.
   - Confirm `/`, `/journey/:framework`, `/compare`, `/debug` routes exist and load successfully.

2. **Bloom’s Journey**
   - Implement 6-step flow as per `journey-blooms.md`.
   - Ensure analytics events and mastery gate work.

3. **Clone Frameworks**
   - Implement CEFR, Marzano, Nation, and Lexical Depth journeys from their respective `.md` specs.
   - Verify per-journey configs load dynamically.

4. **Compare & Debug**
   - Create `/compare` (aggregates, visual breakdowns) and `/debug` (raw event log) pages.
   - Mock analytics visualized via CSS bar charts.

5. **Polish & Accessibility**
   - Add transcripts, focus management, keyboard navigation, warm feedback tone, visible focus rings.

6. **Feedback Layer**
   - Implement stakeholder feedback system with right sidebar panel.
   - Add feedback button to all journey screens.
   - Create admin dashboard at `/feedback` route.
   - Enable export/import for aggregating feedback across sessions.

7. **README & Deploy**
   - Document npm commands, build steps, and Vercel deploy instructions.

---

## 2. Code Quality Gates

- **TypeScript strict mode:** enabled; no implicit `any`.
- **Linting:** ESLint + Prettier; enforce `npm run lint` and `npm run format` before commits.
- **Folder structure:** follows `/src/journeys/<framework>/` convention.
- **Component contracts:** props typed, ARIA roles included, consistent file naming.
- **Testing:** ensure no runtime errors via `npm run dev` smoke test before push.
- **No external calls:** all assets and data local; TTS via browser only.

---

## 3. Analytics Contract

### Event Schema
```ts
{
  ts: number;
  userId: string;
  framework: string;
  wordId: string;
  event: string;
  meta?: Record<string, unknown>;
}
```

### Required Events
- `step_view`
- `answer_submit`
- `answer_result`
- `hint_toggle`
- `audio_play`
- `tts_speak` — events always refer to English TTS; include `meta.voiceLang` when available
- `step_skip`
- `complete_word`
- `feedback_open` — stakeholder opens feedback panel
- `feedback_close` — stakeholder closes feedback panel without submitting
- `feedback_submit` — stakeholder submits feedback (includes thumb, include, difficulty, hasComment)
- `feedback_export` — admin exports feedback JSON
- `feedback_import` — admin imports feedback JSON
- `feedback_reset` — admin clears all feedback

**Timestamping:** record `step_view` and `answer_submit` for each step; difference = time-on-step.

**Data Retention:** ephemeral; reset on refresh. Feedback data persists in localStorage (key: `pvf_feedback_v1`).

---

## 4. Accessibility Governance

- Keyboard navigation verified for all flows.
- Aria labels present on all interactive controls.
- Focus ring visible for all interactive elements.
- Audio transcripts always available.
- Alt text for images and icons.
- **Audio/TTS:** English-only. Prefer en-IN; fall back to en-GB/en-US. Telugu hints are visual-only (no TTS).
- **FeedbackPanel:** Implements focus trap, escape key handling, role="dialog", aria-modal="true".

---

## 5. Ethical Gamification Rules

- No streaks, timers, or variable rewards.
- Visible, transparent progress via progress bar and MiniRubric ticks.
- Feedback: positive, competence-oriented (“Nice try!”, “Great thinking!”).
- Badges: mastery-only, no daily login metrics.

---

## 6. Acceptance Criteria per Framework

| Framework | Steps | Must Implement | Unique Focus |
|------------|--------|----------------|---------------|
| Bloom’s | 6 | Remember→Create | Cognitive hierarchy |
| CEFR | 6 | A1→C2 | Contextual language use |
| Marzano | 6 | Explain→Review | Multimodal engagement |
| Nation | 4 | Input→Fluency | Balanced input/output |
| Lexical Depth | 6 | Form→Nuances | Rich word knowledge |

---

## 7. Testing Plan

### Manual (Prototype Level)
- Each framework for each word completes without console errors.
- Mastery calculation ≥80% accuracy logic validated.
- Skip logs correctly flagged.
- Compare and Debug pages render without data loss.
- Keyboard-only walkthrough works end-to-end.
- Warm feedback messages consistent with spec.

### Automated (optional light tests)
- Add simple `npm run check` script to lint + type-check.
- Snapshot test routes exist.

---

## 8. Deployment (Vercel via GitHub)

- **Repo:** proto-vocab-five-frameworks-28oct
- **Branch:** main
- **Framework:** Vite (React + TS)
- **Build command:** `npm run build`
- **Output dir:** `dist`
- **Node version:** 20.x
- **Env vars:** none

**After deploy:** smoke test routes `/`, `/journey/blooms/river`, `/compare`, `/debug`.

---

## 9. Efficiency & Governance Loop

- **Claude checkpoints:** after each major phase, verify code compiles, analytics events match schema, and A11y criteria met.
- **Commit hygiene:** atomic commits with clear messages (`feat:`, `fix:`, `chore:`).  
- **Review step:** before deployment, run through Compare page to confirm all frameworks log distinct step IDs and events.

---

## 10. Final Verification

- All frameworks implemented and functional.
- Compare page visualizes per-framework differences.
- README documents all commands and explains each journey briefly.
- No third-party or network dependencies present.
- Warm, ethical UX tone verified by user test.
