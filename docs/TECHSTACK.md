# Technology Stack (`TECHSTACK.md`)

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend UI** | React 18, Vite 6, Tailwind CSS, Lucide Icons | Responsive Kiosk, Super Chatbot, and Admin Portal |
| **Motion & Visuals** | Anime.js v4, HTML5 Canvas | Choreographed landing entrance & voice-reactive holographic avatar |
| **Voice & Media** | Web Speech API, `MediaDevices.getUserMedia` | Hold-to-Speak voice recognition, TTS synthesis, webcam capture |
| **Authentication** | Clerk (`@clerk/clerk-react`, `@clerk/backend`) + JWT (`jsonwebtoken`) + `scrypt` | Enterprise SSO/MFA via Clerk with zero-config JWT RBAC fallback |
| **Backend API** | Node.js, Express.js, Helmet, Zod | REST API, schema validation, XSS sanitization, rate limiting |
| **Database** | Neon PostgreSQL (`@neondatabase/serverless`) + Local JSON Adapter | Serverless Postgres persistence with parameterized queries |
| **Edge & Hosting** | Vercel Services, Cloudflare Workers, Netlify, GitHub Pages | Multi-cloud frontend & serverless backend deployment |
| **Testing & CI** | Node.js built-in test runner (`node --test`), GitHub Actions | Fast unit, auth, RBAC, security, and E2E API verification |
