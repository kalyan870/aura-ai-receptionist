# System Architecture (`ARCHITECTURE.md`)

## High-Level Architecture

```mermaid
flowchart TB
    User["Visitor / Customer / Staff"] --> Edge["Cloudflare Workers / Netlify / GitHub Pages / Vercel CDN"]
    Edge --> Frontend["React 18 + Vite + Anime.js v4 + Clerk React"]
    Frontend -->|HTTPS + Bearer JWT / Clerk Token| Gateway["Express.js API Gateway (Vercel Services)"]

    subgraph Gateway ["API & Security Gateway"]
        Security["Helmet + CORS + Sliding Rate Limiter"]
        Validation["Zod Schema Validation + XSS Sanitizer"]
        Auth["Hybrid Auth: Clerk JWKS / JWT + RBAC (admin, staff, security)"]
        SuperBot["AI Customer Super Chatbot + Session Memory"]
    end

    Gateway --> Neon["Neon PostgreSQL (@neondatabase/serverless)"]
    Gateway --> Local["Local JSON / In-Memory Adapter (Dev & Test Fallback)"]
```

## Security & Isolation Boundaries
1. **Transport & Headers**: `helmet` enforces `X-Content-Type-Options: nosniff` and `X-Frame-Options`; CORS restricts origins to configured domains and deployed platforms.
2. **Authentication**: Requests to protected admin/staff/security endpoints must present a valid Clerk session JWT or signed application JWT.
3. **Validation**: Every `POST`/`PATCH` body is sanitized and validated by Zod before reaching database adapters.
4. **Persistence**: All Neon SQL queries use positional parameters (`$1, $2, ...`) to prevent SQL injection.
