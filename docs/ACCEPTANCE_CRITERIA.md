# Acceptance Criteria (`ACCEPTANCE_CRITERIA.md`)

1. **AI Customer Super Chatbot**:
   - Multi-turn `sessionId` tracking persists conversation context across messages.
   - Recognizes customer support, pricing/plans, ticket creation, check-in, appointment booking, staff lookup, FAQ, and emergency intents.
   - Customers can create support tickets via UI or chat trigger (`POST /api/tickets` returns `201` with `TKT-...`).
2. **Authentication & RBAC (Clerk + JWT)**:
   - When `CLERK_SECRET_KEY` is configured, `authenticateToken` verifies Clerk JWTs using `@clerk/backend` and maps roles (`admin`, `staff`, `security`).
   - When Clerk keys are absent, built-in JWT + `scrypt` authentication enforces the exact same RBAC rules with zero configuration.
   - Protected routes return `401` when unauthenticated and `403` when role is insufficient.
3. **Database (Neon PostgreSQL + Local Adapter)**:
   - `schema.sql` includes `support_tickets` and `clerk_id` column on `users`.
   - All Neon queries use parameterized placeholders (`$1, $2, ...`).
4. **Input Validation & Security**:
   - Zod rejects invalid payloads with `400` and field-level details.
   - `<script>` and control characters are stripped from text inputs.
   - `passwordHash` is never returned in any API response.
5. **Testing & Deployment**:
   - 100% of unit, auth, RBAC, validation, super-chatbot, ticket CRUD, and E2E tests pass (`npm test`).
   - Frontend builds cleanly and deploys to Vercel, Netlify, Cloudflare Workers, and GitHub Pages.
