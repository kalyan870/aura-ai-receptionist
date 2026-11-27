# Database Design (`DATABASE.md` — Neon PostgreSQL)

## Tables
1. **`staff`**: Employee directory (`id`, `name`, `title`, `department`, `email`, `phone`, `room`, `status`, `avatar`).
2. **`users`**: Authenticated accounts (`id`, `clerk_id`, `email`, `password_hash`, `full_name`, `role`, `staff_id`, `is_active`).
3. **`visitors`**: Lobby check-ins (`id`, `name`, `company`, `email`, `host_id`, `host_name`, `purpose`, `check_in_time`, `check_out_time`, `status`, `badge_code`, `photo`).
4. **`appointments`**: Scheduled meetings (`id`, `visitor_name`, `visitor_email`, `visitor_company`, `host_id`, `host_name`, `date`, `time_slot`, `purpose`, `status`) with partial unique index `idx_appointments_unique_slot` preventing double-booking.
5. **`notifications`**: Host arrival alerts (`id`, `visitor_id`, `visitor_name`, `host_id`, `host_name`, `message`, `status`, `host_reply`, `timestamp`, `replied_at`).
6. **`faqs`**: Knowledge base articles (`id`, `keywords TEXT[]`, `question`, `answer`).
7. **`support_tickets`**: Customer Super Chatbot tickets (`id`, `customer_name`, `customer_email`, `category`, `priority`, `subject`, `description`, `status`, `assigned_to`, `resolution_notes`, `created_at`, `updated_at`).
8. **`audit_logs`**: Immutable security/auth trail (`id`, `user_id`, `user_email`, `user_role`, `action`, `resource`, `details JSONB`, `ip_address`, `created_at`).
