# Product Requirements Document (PRD) — AURA AI Customer Super Chatbot & Receptionist

## 1. Product Vision
**AURA** is an enterprise **AI Customer Super Chatbot & Front-Desk Receptionist** combining multimodal voice/text customer support, autonomous ticket creation, visitor check-in with webcam QR badges, conflict-free appointment scheduling, and zero-trust staff/security management.

## 2. Target Personas
| Persona | Goals |
| --- | --- |
| **Visitors & Customers** | Get instant answers (FAQs, pricing, services), create support tickets, check in with webcam QR badge, book appointments, and talk via Push-to-Talk voice AI. |
| **Support & Staff Hosts** | Receive real-time visitor arrival alerts, respond to guests, manage support tickets, and update availability status. |
| **Security & Operations Admins** | Monitor live on-site headcount, export emergency muster rolls, review audit logs, and manage staff/FAQs. |

## 3. Core Functional Requirements
1. **AI Customer Super Chatbot (`/api/chat`)**:
   - Multi-turn session context (`sessionId`), intent classification, and rich structured action triggers.
   - Handles customer inquiries (pricing, services, onboarding, troubleshooting), support ticket creation, staff directory lookup, office FAQs, check-in, and appointment booking.
   - Supports optional LLM provider (`OPENAI_API_KEY` / `GEMINI_API_KEY`) with deterministic local fallback.
2. **Support Ticket System (`/api/tickets`)**:
   - Customers/visitors can create support tickets directly via chat or modal (`open`, `in_progress`, `resolved`).
   - Authenticated staff/admins can triage, update status, and resolve tickets.
3. **Authentication & RBAC (Clerk + JWT)**:
   - Supports **Clerk** authentication (`@clerk/clerk-react` + `@clerk/backend` JWT verification) when Clerk keys are configured, seamlessly integrated with built-in JWT + `scrypt` RBAC (`admin`, `staff`, `security`).
4. **Visitor Management & Scheduling**:
   - Express check-in with live webcam photo capture, SVG QR pass generation, host arrival notification, and appointment double-booking prevention.
5. **Cloud & Database**:
   - **Neon PostgreSQL** serverless persistence (`schema.sql`), **Vercel** full-stack hosting, **Cloudflare Workers**, **Netlify**, and **GitHub Pages** edge distribution.
