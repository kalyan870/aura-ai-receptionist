# AURA AI Receptionist — REST API Reference

Base URL (Local): `http://localhost:5000/api`  
Base URL (Production): `https://aura-ai-receptionist-black.vercel.app/api`

---

## Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Bootstrap or `admin` | Register user (`email`, `password` min 8 chars, `fullName`, `role`) |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Authenticate and receive Bearer JWT |
| `GET` | `/api/auth/me` | Bearer JWT | Return current authenticated user profile |
| `GET` | `/api/auth/users` | `admin` | List all registered users (excludes `passwordHash`) |

## Public Kiosk & AI (`/api/status`, `/api/chat`, `/api/faqs`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/status` | Public | Health check, active DB mode, and live counts |
| `POST` | `/api/chat` | Public | Send visitor message; returns AI reply, intent, suggestions, and modal triggers |
| `GET` | `/api/faqs` | Public | List office FAQs |
| `POST` / `PATCH` / `DELETE` | `/api/faqs/:id` | `admin` | Manage office FAQ knowledge base |

## Visitors & Badges (`/api/visitors`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/visitors/checkin` | Public Kiosk | Check in visitor, validate photo/host, issue badge code, notify host |
| `GET` | `/api/visitors` | `admin`, `staff`, `security` | List all visitor logs |
| `POST` | `/api/visitors/:id/checkout` | `admin`, `staff`, `security` | Check out active visitor with timestamp & audit log |
| `DELETE` | `/api/visitors/:id` | `admin` | Delete visitor record |

## Appointments (`/api/appointments`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/appointments/book` | Public Kiosk | Book slot (`YYYY-MM-DD`, `timeSlot`, `hostId`); returns `409` on conflict |
| `GET` | `/api/appointments` | `admin`, `staff`, `security` | List all scheduled appointments |
| `POST` | `/api/appointments/:id/cancel` | `admin`, `staff` | Cancel appointment |
| `DELETE` | `/api/appointments/:id` | `admin` | Delete appointment |

## Staff, Notifications & Audit (`/api/staff`, `/api/notifications`, `/api/analytics`, `/api/audit-logs`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/staff` | Public / JWT | Public fields anonymously; full contact details when authenticated |
| `PATCH` | `/api/staff/:id/status` | `admin`, `security`, or own `staff` | Update availability (`Available`, `In Meeting`, `Out of Office`) |
| `POST` / `PATCH` / `DELETE` | `/api/staff/:id` | `admin` | Full staff directory CRUD |
| `GET` | `/api/notifications` | `admin`, `staff`, `security` | List host arrival alerts |
| `POST` | `/api/notifications/:id/respond` | `admin`, `staff` | Send host reply to reception |
| `GET` | `/api/analytics` | `admin`, `security` | Live visitor, appointment, and alert metrics |
| `GET` | `/api/audit-logs` | `admin` | Security & auth event audit trail |
