# Vocabulary Learning Journeys

A web prototype demonstrating five evidence-based vocabulary learning frameworks for Telugu-speaking Grade 5 students in Telangana. Students learn three English words (river, festival, harvest) through five different pedagogical approaches.

## 🎯 Frameworks

### 1. Bloom's Taxonomy (6 steps)
**Remember → Understand → Apply → Analyze → Evaluate → Create**

Progresses through cognitive levels from basic recall to creative application. Each step builds on the previous one, scaffolding learning from recognition to production.

### 2. CEFR Ladder (6 steps)
**A1 → A2 → B1 → B2 → C1 → C2**

Mirrors CEFR language proficiency levels, starting with basic recognition and advancing to creative, abstract usage in context.

### 3. Marzano Six-Step (6 steps)
**Explain → Restate → Visualize → Engage → Discuss → Play & Review**

Evidence-based vocabulary instruction emphasizing multimodal engagement and peer interaction.

### 4. Nation's Four Strands (4 steps)
**Meaning-Focused Input → Language-Focused Learning → Meaning-Focused Output → Fluency Development**

Balanced approach to vocabulary acquisition, ensuring input, explicit instruction, output, and fluency practice.

### 5. Lexical Depth (6 steps)
**Form → Meaning → Use → Associations → Morphology → Nuances**

Deep word knowledge development from basic form recognition to understanding subtle contextual and figurative uses.

## 🎤 Audio/TTS Policy

- **English TTS only**: All spoken audio uses English (prefer Indian English `en-IN`, fallback to `en-GB`/`en-US`)
- **Telugu is visual-only**: Telugu hints display native script + transliteration on screen; no Telugu audio
- Uses Web Speech API (browser-based, no external services)

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

### Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting & Type-Checking

```bash
npm run lint     # ESLint
npm run format   # Prettier
npm run check    # TypeScript + ESLint
```

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── AudioButton.tsx
│   ├── Card.tsx
│   ├── ChoiceGrid.tsx
│   ├── FeedbackToast.tsx
│   ├── HintChip.tsx
│   ├── MiniRubric.tsx
│   ├── Stepper.tsx
│   └── WritePad.tsx
├── data/
│   └── words.json      # Word data with IPA, Telugu, examples
├── hooks/
│   ├── useAnalytics.ts # Analytics event logging
│   └── useTTS.ts       # Legacy TTS hook (deprecated)
├── lib/
│   └── tts.ts          # English-only TTS utility (NEW)
├── journeys/           # Framework implementations
│   ├── blooms/         # Bloom's Taxonomy (6 steps) ✅ COMPLETE
│   ├── cefr/           # CEFR Ladder (placeholder)
│   ├── lexical/        # Lexical Depth (placeholder)
│   ├── marzano/        # Marzano Six-Step (placeholder)
│   └── nation/         # Nation Four Strands (placeholder)
├── pages/
│   ├── ComparePage.tsx # Framework comparison analytics
│   ├── DebugPage.tsx   # Raw analytics event log
│   └── HomePage.tsx    # Landing page
├── router/
│   └── index.tsx       # React Router configuration
├── styles/
│   └── index.css       # Tailwind CSS + custom styles
└── types/
    └── index.ts        # TypeScript type definitions
```

## 💬 Stakeholder Feedback

This prototype includes an optional feedback system for stakeholders (educators, researchers, designers) to provide input on each learning step. **This is not for learners** - it's for improving the prototype.

### Features

- **Feedback Button (💬)**: Always visible during any journey step
- **Feedback Panel**: Right sidebar with quick feedback controls:
  - Thumbs up/down rating
  - "Include this type of question?" checkbox
  - Difficulty level (easy/medium/difficult)
  - Optional free-text comment
- **Anonymous Tracking**: Uses localStorage with session/user IDs (no personal data)
- **Admin Dashboard** (`/feedback`): View, filter, and analyze all feedback
  - Filter by framework, word, step, rating, difficulty
  - Visual charts and statistics
  - Export/Import JSON for aggregating feedback across multiple sessions
  - Reset data

### How to Use

1. **As a Stakeholder**: Click the 💬 button during any journey step to provide feedback
2. **Export Your Feedback**: Visit `/feedback`, click "Export Feedback" to download JSON
3. **Aggregate Feedback**: Share JSON files with coordinator, who imports all files to analyze patterns
4. **No Backend Required**: All data stays in your browser (localStorage)

See [assets/feedback/feedback-layer.md](assets/feedback/feedback-layer.md) for full specification.

## 📊 Analytics

All user interactions are logged in-memory (ephemeral, resets on refresh). Analytics comply with the contract defined in [assets/master-build-governance/master-build-governance.md](assets/master-build-governance/master-build-governance.md).

### Event Types

- `step_view` - User views a step
- `answer_submit` - User submits an answer
- `answer_result` - Answer validation result (correct/incorrect)
- `hint_toggle` - Telugu hint opened/closed
- `audio_play` - Audio button pressed
- `tts_speak` - English TTS triggered (includes `voiceLang` in meta)
- `step_skip` - User skips a step
- `complete_word` - Word journey completed
- `feedback_open` - Stakeholder opens feedback panel
- `feedback_close` - Stakeholder closes feedback panel without submitting
- `feedback_submit` - Stakeholder submits feedback
- `feedback_export` - Admin exports feedback JSON
- `feedback_import` - Admin imports feedback JSON
- `feedback_reset` - Admin clears all feedback

### Viewing Analytics

- **Compare Page** (`/compare`): Aggregated framework performance metrics
- **Debug Page** (`/debug`): Raw event log with filtering
- **Feedback Admin** (`/feedback`): Stakeholder feedback analysis and management

## ♿ Accessibility

- Full keyboard navigation support
- Visible focus rings
- ARIA labels on all interactive elements
- Audio transcripts always available
- Telugu hints toggle (off by default)

## 🎨 Design Principles

- **Mobile-first**: Responsive design optimized for mobile devices
- **Ethical gamification**: No streaks, timers, or manipulative rewards
- **Warm feedback**: Supportive, competence-oriented messaging
- **Transparent progress**: Clear progress indicators and mastery criteria

## 🚢 Deployment (Vercel)

### Via GitHub

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Node version**: 20.x
4. Deploy

### Via Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts to deploy.

## 📝 Specification Documents

All framework specifications and governance documents are in `/assets`:

- [Master Build Governance](assets/master-build-governance/master-build-governance.md)
- [Bloom's Journey](assets/5%20frameworks/journey-blooms.md)
- [CEFR Journey](assets/5%20frameworks/journey-cefr.md)
- [Marzano Journey](assets/5%20frameworks/journey-marzano.md)
- [Nation Journey](assets/5%20frameworks/journey-nation.md)
- [Lexical Depth Journey](assets/5%20frameworks/journey-lexical-depth.md)
- [Feedback Layer](assets/feedback/feedback-layer.md)

## 🔧 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build tool**: Vite
- **Routing**: React Router 6
- **Styling**: Tailwind CSS
- **Audio**: Web Speech API (browser native)
- **Linting**: ESLint + Prettier

## 📜 License

This is a prototype for educational research purposes.

## 🙏 Acknowledgments

Built with evidence-based vocabulary learning frameworks:
- Bloom's Taxonomy (cognitive hierarchy)
- CEFR (Common European Framework of Reference)
- Marzano's Six-Step Vocabulary Process
- Paul Nation's Four Strands
- Lexical Depth Framework (Anderson & Nagy, Perfetti, Qian)

## 🚧 Status

**Current Implementation:**
- ✅ All 5 framework journeys fully implemented:
  - ✅ Bloom's Taxonomy (6 steps)
  - ✅ CEFR Ladder (6 steps)
  - ✅ Marzano Six-Step (6 steps)
  - ✅ Nation's Four Strands (4 steps)
  - ✅ Lexical Depth (6 steps)
- ✅ Home, Compare, and Debug pages
- ✅ Stakeholder Feedback system with admin dashboard
- ✅ Analytics system with comprehensive event logging
- ✅ English-only TTS with Indian English preference
- ✅ Full accessibility features (keyboard nav, ARIA, focus management)

**Next Steps:**
- Add comprehensive testing
- Conduct user testing with target audience
- Gather stakeholder feedback via feedback system
- Iterate based on feedback and testing results

---

Generated with [Claude Code](https://claude.com/claude-code)
