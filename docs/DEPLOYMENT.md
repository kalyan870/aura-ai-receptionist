# Deployment Guide — AURA AI Receptionist

## Live Deployments

| Platform | URL | Role |
|---|---|---|
| **Vercel** | https://aura-ai-receptionist-black.vercel.app | Full-stack Frontend + Express API (`vercel.json` Services) |
| **Netlify** | https://aura-ai-receptionist-kalyan.netlify.app | Static Frontend connected to Vercel API |
| **Cloudflare Workers** | https://aura-ai-receptionist.saragadamkalyan068-fdc.workers.dev | Static Frontend connected to Vercel API |
| **GitHub Pages** | https://kalyan870.github.io/aura-ai-receptionist/ | Static Frontend (`gh-pages` branch) connected to Vercel API |
| **Local Server** | http://localhost:5000 | Unified Node.js + Vite production bundle |

## Connecting Neon PostgreSQL

1. Create a Neon project at [console.neon.tech](https://console.neon.tech).
2. Copy the PostgreSQL connection string (`postgresql://...?sslmode=require`).
3. Set `DATABASE_URL` and `JWT_SECRET` (minimum 32 characters) in:
   - Local: `backend/.env`
   - Vercel: Project Settings → Environment Variables (`vercel env add DATABASE_URL production`)
4. On startup, `backend/db/neonAdapter.js` automatically runs `backend/db/schema.sql` and seeds initial staff and FAQs.
