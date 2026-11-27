-- AURA AI Receptionist — Neon PostgreSQL Database Schema
-- Run this against your Neon database to initialize all tables and indexes.

CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  title VARCHAR(120) NOT NULL,
  department VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(40),
  room VARCHAR(120) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'In Meeting', 'Out of Office')),
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  clerk_id VARCHAR(128) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'security')),
  staff_id VARCHAR(64) REFERENCES staff(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visitors (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  company VARCHAR(120) NOT NULL DEFAULT 'Individual Guest',
  email VARCHAR(255),
  host_id VARCHAR(64) NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
  host_name VARCHAR(120) NOT NULL,
  purpose VARCHAR(255) NOT NULL DEFAULT 'General Meeting',
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  status VARCHAR(32) NOT NULL DEFAULT 'Checked In' CHECK (status IN ('Checked In', 'Checked Out')),
  badge_code VARCHAR(64) UNIQUE NOT NULL,
  photo TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(64) PRIMARY KEY,
  visitor_name VARCHAR(120) NOT NULL,
  visitor_email VARCHAR(255),
  visitor_company VARCHAR(120) NOT NULL DEFAULT 'Guest',
  host_id VARCHAR(64) NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  host_name VARCHAR(120) NOT NULL,
  date DATE NOT NULL,
  time_slot VARCHAR(32) NOT NULL,
  purpose VARCHAR(255) NOT NULL DEFAULT 'Discussion',
  status VARCHAR(32) NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Cancelled', 'Completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent double-booking the same host, date, and time slot when Confirmed
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_unique_slot
  ON appointments (host_id, date, time_slot)
  WHERE status = 'Confirmed';

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  visitor_id VARCHAR(64) REFERENCES visitors(id) ON DELETE CASCADE,
  visitor_name VARCHAR(120) NOT NULL,
  host_id VARCHAR(64) NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  host_name VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Delivered' CHECK (status IN ('Delivered', 'Responded')),
  host_reply TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  replied_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS faqs (
  id VARCHAR(64) PRIMARY KEY,
  keywords TEXT[] NOT NULL,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64),
  user_email VARCHAR(255),
  user_role VARCHAR(32),
  action VARCHAR(64) NOT NULL,
  resource VARCHAR(120) NOT NULL,
  details JSONB,
  ip_address VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors (status);
CREATE INDEX IF NOT EXISTS idx_visitors_checkin ON visitors (check_in_time DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (date);
CREATE INDEX IF NOT EXISTS idx_notifications_host ON notifications (host_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at DESC);

CREATE TABLE IF NOT EXISTS support_tickets (
  id VARCHAR(64) PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(255),
  category VARCHAR(64) NOT NULL DEFAULT 'General Support',
  priority VARCHAR(32) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  assigned_to VARCHAR(120),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets (status);
