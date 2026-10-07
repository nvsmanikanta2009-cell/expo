# AI-Powered Accessibility & Inclusion Assistant

> **Make digital information easier to access, understand, and use — without removing the user's dignity, independence, or control.**

---

## 🌟 Overview

The **AI-Powered Accessibility & Inclusion Assistant** is an enterprise-grade digital accessibility platform engineered to dismantle barriers for people with disabilities. Leveraging Google Gemini AI models and WCAG 2.1 POUR (Perceivable, Operable, Understandable, Robust) principles, it transforms difficult, dense, or inaccessible digital materials into formats tailored for screen readers, neurodivergent readers, cognitive ease, low vision, and multilingual inclusion.

---

## 🚀 Key Features

### 1. Multi-Modal Transformation Workspace
- **Input Channels**: Direct text paste, Webpage URL scraping & readable extraction, text document uploads, and visual image uploads.
- **Voice Speech-to-Text**: Native Web Speech dictation for users who cannot or prefer not to type.
- **7 Transformation Tasks**:
  1. `simplify` — Plain-language simplification preserving essential facts.
  2. `summarize` — Accessible executive summaries with clear bulleted takeaways.
  3. `explain` — Jargon unpacker with automated glossary definitions.
  4. `screen_reader` — Structured hierarchical headings, linear order, and semantic labels.
  5. `image_description` — Concise HTML `alt` text and detailed descriptive context.
  6. `accessibility_analysis` — WCAG-inspired barrier audit, strengths, and issue severity.
  7. `translate` — Culturally respectful plain-language translation (English, Telugu, Hindi, Spanish, French, German, etc.).

### 2. Evaluated Accessibility Score (0–100)
- AI-estimated accessibility score evaluating clarity, readability, structure, and inclusion.
- Explicitly labeled as an **AI-generated accessibility estimate** (not an official certification).
- Color-coded visual gauges and actionable improvement recommendations.

### 3. Native Text-to-Speech (TTS) Audio Player
- Real-time voice reading controls (Play, Pause, Stop).
- Configurable reading speed (0.8x, 1.0x, 1.2x, 1.5x).
- Visual reading indicator and global stop control in the navbar.

### 4. Accessibility Personalization & Adaptive Profiles
- Preferences stored in the database (`accessibility_profiles` table):
  - Visual assistance
  - Reading assistance
  - Cognitive assistance
  - Hearing assistance
  - Language assistance
  - Screen reader mode
  - Preferred language
- Live Theme & Display Customization:
  - High Contrast Dark Mode
  - Yellow on Black (high-contrast visual impairment mode)
  - Monochrome High Contrast (crisp black & white)
  - Typography scaling (Normal, Large, Extra Large)
  - Dyslexia-friendly font mode (Lexend typography with enhanced letter-spacing and line height)

### 5. Private Transformation History & Strict Data Isolation
- Complete history records with search, filtering, and detailed inspection.
- Enforces strict user ownership: users can only view, query, and delete their own records.
- Cross-user data isolation verified with 100% automated test coverage.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, React Router 6, Lucide Icons, Vite |
| **Backend** | Node.js (v24), Express.js, TypeScript, TSX |
| **Database** | PostgreSQL / Supabase, with automatic resilient embedded storage |
| **AI Integration** | `@google/genai` (Gemini 3.8 Flash & Gemini Flash Lite with multi-model fallback) |
| **Validation** | Zod (strict validation for API inputs, auth, user profiles, and AI outputs) |
| **Security** | bcryptjs (password hashing), SHA-256 session tokens, CORS, Rate Limiting, HTTP-only Cookies |

---

## 📁 Project Structure

```text
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Navbar, Footer, PageContainer, SkipLink
│   │   │   ├── ui/           # Button, Card, Input, Textarea, Select, Modal, Alert, Score, AudioPlayer
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/          # AuthContext, AccessibilityContext
│   │   ├── pages/            # Landing, Login, Signup, Dashboard, Workspace, History, HistoryDetail, Profile, Settings, NotFound
│   │   ├── App.tsx
│   │   ├── index.css         # Accessible styling, contrast themes, dyslexia typography
│   │   └── main.tsx
│   └── index.html
├── server/
│   ├── ai/                   # Gemini AI Service with task prompts & multi-model cascade
│   ├── auth/                 # bcryptjs hashing, cryptographic session tokens
│   ├── db/                   # Database manager (PostgreSQL & resilient fallback storage)
│   ├── routes/               # authRoutes, profileRoutes, transformRoutes, historyRoutes
│   ├── services/             # URL readability fetcher
│   ├── tests/                # Automated integration & end-to-end security test suite
│   └── index.ts              # Express application entry point
├── shared/
│   ├── schemas/              # Zod validation schemas
│   └── types/                # TypeScript shared types & interfaces
├── .env.example
├── package.json
├── tailwind.config.ts
└── vite.config.ts
```

---

## ⚙️ Environment Configuration

Create a `.env` file based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=your_secure_random_session_secret

# Gemini AI API Key (Server-side only)
GEMINI_API_KEY=your_gemini_api_key

# Supabase Credentials (Optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# PostgreSQL Connection String (Optional - falls back to embedded storage if not supplied)
DATABASE_URL=postgresql://user:password@localhost:5432/accessibility
```

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install --ignore-scripts
```

### 2. Build Frontend
```bash
npm run build:client
```

### 3. Run Development Server
```bash
# Starts the server on port 5000
npm run dev:server

# Starts Vite frontend dev server on port 5173
npm run dev:client
```

### 4. Run Production Server
```bash
npm start
```
The server will run on `http://localhost:5000/`.

---

## 🧪 Testing & Verification

Run the automated integration and security test suite:
```bash
# Backend unit & integration test
npx tsx server/tests/run_tests.ts

# Full end-to-end user journey & security isolation test
npx tsx server/tests/e2e_full_flow.ts
```

**Test Coverage Verified:**
- Database initialization & schema migration
- Password hashing & authentication
- Session validation & logout invalidation
- Accessibility Profile persistence
- Multi-model Gemini AI transformation
- Structured Zod output validation
- Cross-user data isolation (404 unauthorized enforcement)
- Accessible HTML, CSS, and JS bundle delivery

---

## ♿ Accessibility Compliance & Principles

- **WCAG 2.4.1 (Bypass Blocks)**: Skip to Main Content link available on every page.
- **WCAG 2.4.7 (Focus Visible)**: Prominent 3px high-contrast focus rings on all interactive controls.
- **WCAG 1.4.3 & 1.4.6 (Contrast)**: Complies with AAA contrast ratios across standard, dark, yellow-on-black, and monochrome themes.
- **WCAG 4.1.3 (Status Messages)**: ARIA live regions (`aria-live="polite"`) announce UI updates, dictation, and speech states dynamically.
- **Semantic HTML**: Pure HTML5 landmark elements (`<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`).
- **Screen Reader Testing**: Optimized with meaningful alt text, explicit button labels, and hidden helper descriptions.
