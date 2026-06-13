# Jarurat Care — Patient Support Portal

> A concept-level Mini Healthcare Support Web App built for the **Jarurat Care** Full Stack Developer (AI-Enabled) internship assignment.

**Live demo:** _add your Vercel URL here after deployment_  
**Source code:** _this repository_

---

## 🩺 NGO Use-Case

**Jarurat Care** is a non-profit (fictional, built for this assignment) that connects underserved families in Chhattisgarh, India with free healthcare support — medical aid, financial assistance for treatments, emotional counseling, and community health awareness camps.

The real-world friction this app solves:

1. **People in need don't know where to start.** They have a family member who needs surgery they can't afford, or they need a counselor, but they don't know which NGO does what. This portal is a single front door.
2. **NGOs get a high volume of requests through phone calls** — most of which are repetitive FAQs (Is this free? Where do I apply? What documents do I need?). This burns out volunteers and slows down genuine cases.
3. **Patients in rural areas have low digital literacy.** The form needs to be short, the language clear, and the support channels (phone, chat, form) need to be multiple.

The app addresses all three: a clean support request form for genuine cases, a chatbot to deflect FAQs, and prominent emergency numbers at every step.

---

## 🤖 The AI Idea — CareBot

**CareBot** is a rule-based intent matcher with a chat interface — sitting where most users expect to find help. It's "AI-enabled" in the **automation** sense the brief calls out (not a wrapped LLM), and there's a deliberate reason for that choice:

- **Cost.** An NGO can't afford OpenAI API fees scaling with traffic.
- **Privacy.** Patient queries should never leave the NGO's infrastructure.
- **Reliability.** A keyword matcher can't hallucinate emergency numbers or invent a service the NGO doesn't offer. For healthcare, that matters.
- **Latency.** Works offline-first, instant responses.

### How the matching works

Each FAQ in the knowledge base (`src/App.jsx`, `KNOWLEDGE_BASE` constant) has:

- An **intent** label
- A list of **keywords** that signal that intent
- An **answer**
- Suggested **follow-up questions** (rendered as tappable chips)

When a user sends a message:

1. The message is lowercased.
2. Each intent is scored — for every keyword that appears in the message, add the keyword's length to the score. _Longer keyword matches = more specific = higher confidence._ This means "how do I request help" scores higher on the `request_help` intent than just "help" alone.
3. The highest-scoring intent's answer is returned.
4. If no keywords match (score = 0), a friendly fallback lists what CareBot _can_ help with.

This is straightforward to extend — a future version could plug into a small embedding model (e.g., MiniLM via `transformers.js`) running entirely client-side, keeping the same offline-first, private-by-default architecture.

### CareBot covers 11 intents

`greeting`, `request_help`, `cost`, `services`, `emergency`, `volunteer`, `location`, `response_time`, `documents`, `donate`, `contact` — plus a sensible fallback.

---

## 🛠 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 18 + Vite** | Fast dev server, simple build, what the brief implies |
| Styling | **Tailwind CSS v3** | Utility-first, ships only the CSS we use, very small bundle |
| Icons | **lucide-react** | Clean line icons, tree-shakeable |
| Fonts | **Fraunces** (display) + **Inter** (body) | Serif gives institutional/trustworthy feel; Inter keeps body readable on low-end mobile devices |
| Deployment | **Vercel** | Zero-config for Vite, free tier, instant rollbacks |
| State | Local React state | The form simulates submission; in a real deployment this would POST to a backend API |

**Why no backend?** The brief explicitly says "concept-level" and "we evaluate clarity and effort, not perfection." Adding a backend (Supabase / Firebase) would have been straightforward but would split attention from the actual UX work. The form generates a reference ID and simulates submission — production-equivalent UX, no real persistence.

---

## ✨ Features

### Patient Support Request Form
- 8 fields with real-time validation (name, phone, age, city, support type, urgency, description, optional email)
- 10-digit Indian phone number validation with `+91` prefix
- Urgency selector (Low / Medium / High) — High shows an emergency-numbers callout
- Character counter on description, 500-char limit
- Loading state → success state with a generated reference ID
- Auto-scroll to first error on failed validation

### CareBot Chatbot
- Floating launcher button (collapses cleanly when chat is open)
- 11 intents with weighted keyword matching
- Follow-up question chips after each answer (encourages exploration)
- Typing indicator with staggered dot animation
- Mobile: full-screen sheet. Desktop: corner panel.
- Closing footer note clarifying it's rule-based (no false expectations)

### Design Choices
- **Devanagari signature.** The word ज़रूरत appears in the navbar and as a quiet 280px watermark in the hero — grounding the brand in the actual language of the people it serves, without being decorative.
- **Warm paper palette.** `#FAF7F2` background, deep forest green `#134E3A` primary, marigold `#D97706` accent. Avoids the default "healthcare blue" trap.
- **Serif headlines, sans body.** Fraunces brings institutional gravity; Inter stays readable.
- **No animated counters.** Stats are simply stated — refusing the templated "watch the number tick up" pattern.

### Accessibility
- Keyboard navigable throughout
- Form errors announced with icons and color
- `aria-label`s on icon-only buttons
- Color contrast meets WCAG AA for body text

---

## 🚀 Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (http://localhost:5173)
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build locally
npm run preview
```

You need **Node 18+** and **npm 9+**.

---

## 🌐 Deploy to Vercel

The easiest path:

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects Vite. Click **Deploy**. Done.

The included `vercel.json` handles SPA routing so refreshing on any path doesn't 404.

---

## 📁 Project Structure

```
jarurat-care/
├── public/
│   └── favicon.svg          # Custom SVG favicon
├── src/
│   ├── App.jsx              # Main component — all sections + CareBot
│   ├── main.jsx             # React entry point
│   └── index.css            # Tailwind directives + font imports
├── index.html               # HTML shell with meta tags
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json              # SPA fallback for Vercel
└── README.md
```

`App.jsx` is intentionally one file. At ~700 lines it's still readable, and keeping it together makes the project easier to evaluate at a glance. A real production version would split this into `src/components/` and `src/lib/carebot.js`.

---

## 🧠 What I'd Build Next

If this were a real product, the priorities would be:

1. **Backend.** Supabase for form submissions, with admin dashboard for volunteers to triage requests.
2. **SMS notifications.** Twilio / MSG91 for "request received" and status updates — most users would prefer SMS over email.
3. **Hindi language toggle.** The audience is bilingual; the UI should be too.
4. **Volunteer routing.** Auto-assign requests by district and support type.
5. **Embedding-based bot.** Drop in `transformers.js` with a small MiniLM model for semantic matching — still client-side, still private.

---

## 📝 Submission Details

**Built by:** Shivam Tiwari ([@ImForge](https://github.com/ImForge))  
**For:** Jarurat Care — Full Stack Developer (AI-Enabled) Internship  
**Mentor:** Priyanka Joshi / Misty  
**Submitted:** June 2026

---

_Built with care. The note in the brief said clarity and effort matter. I hope this shows both._
