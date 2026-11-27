# API Documentation (`API_DOCUMENTATION.md`)

Base URL: `https://aura-ai-receptionist-black.vercel.app/api` (Local: `http://localhost:5000/api`)

## Authentication (`/api/auth`)
- `POST /api/auth/register` — Bootstrap initial admin or admin-create user (`email`, `password`, `fullName`, `role`).
- `POST /api/auth/login` — Rate-limited login returning Bearer JWT and sanitized user.
- `GET /api/auth/me` — Validates Clerk JWT or local Bearer JWT and returns current user + auth provider (`clerk` or `local-jwt`).
- `GET /api/auth/users` — `admin` only.

## AI Customer Super Chatbot (`/api/chat`)
- `POST /api/chat` — Accepts `{ message, sessionId?, customerName? }`. Maintains session context and returns `{ reply, intent, action, staff, ticketPrompt, suggestions, sessionId }`.

## Support Tickets (`/api/tickets`)
- `POST /api/tickets` — Public Kiosk/Customer ticket creation (`customerName`, `customerEmail`, `category`, `priority`, `subject`, `description`). Returns `201` with ticket ID `TKT-...`.
- `GET /api/tickets` — Protected (`admin`, `staff`, `security`). Lists all support tickets.
- `PATCH /api/tickets/:id` — Protected (`admin`, `staff`). Updates ticket `status` (`open`, `in_progress`, `resolved`) and `resolutionNotes`.
- `DELETE /api/tickets/:id` — Protected (`admin`). Deletes a ticket.

## Visitors, Appointments, Staff, Notifications, FAQs & Admin
- `POST /api/visitors/checkin`, `GET /api/visitors`, `POST /api/visitors/:id/checkout`, `DELETE /api/visitors/:id`
- `POST /api/appointments/book`, `GET /api/appointments`, `POST /api/appointments/:id/cancel`, `DELETE /api/appointments/:id`
- `GET /api/staff`, `POST /api/staff`, `PATCH /api/staff/:id`, `PATCH /api/staff/:id/status`, `DELETE /api/staff/:id`
- `GET /api/notifications`, `POST /api/notifications/:id/respond`
- `GET /api/faqs`, `POST /api/faqs`, `PATCH /api/faqs/:id`, `DELETE /api/faqs/:id`
- `GET /api/analytics`, `GET /api/audit-logs`
