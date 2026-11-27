import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from '@neondatabase/serverless';
import { hashPassword } from '../utils/crypto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class NeonAdapter {
  constructor(connectionString) {
    this.pool = new Pool({ connectionString });
    this.mode = 'neon-postgres';
  }

  async init(seedData, seedAdmin) {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await this.pool.query(schemaSql);

    // Seed staff if empty
    const { rows: staffCount } = await this.pool.query('SELECT COUNT(*)::int AS count FROM staff');
    if (staffCount[0].count === 0 && seedData?.staff) {
      for (const s of seedData.staff) {
        await this.pool.query(
          `INSERT INTO staff (id, name, title, department, email, phone, room, status, avatar)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
          [s.id, s.name, s.title, s.department, s.email, s.phone, s.room, s.status, s.avatar]
        );
      }
    }

    // Seed FAQs if empty
    const { rows: faqCount } = await this.pool.query('SELECT COUNT(*)::int AS count FROM faqs');
    if (faqCount[0].count === 0 && seedData?.faqs) {
      for (let i = 0; i < seedData.faqs.length; i++) {
        const f = seedData.faqs[i];
        await this.pool.query(
          `INSERT INTO faqs (id, keywords, question, answer)
           VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
          [`faq-${i + 1}`, f.keywords, f.question, f.answer]
        );
      }
    }

    // Seed initial admin user if users table is empty and seedAdminPassword is provided
    const { rows: userCount } = await this.pool.query('SELECT COUNT(*)::int AS count FROM users');
    if (userCount[0].count === 0 && seedAdmin?.email && seedAdmin?.password) {
      await this.pool.query(
        `INSERT INTO users (id, email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
        ['usr-admin-1', seedAdmin.email.toLowerCase(), hashPassword(seedAdmin.password), 'System Administrator', 'admin']
      );
    }
  }

  // ---- USERS ----
  async findUserByEmail(email) {
    const { rows } = await this.pool.query(
      `SELECT id, email, password_hash AS "passwordHash", full_name AS "fullName", role, staff_id AS "staffId", is_active AS "isActive", created_at AS "createdAt"
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    return rows[0] || null;
  }

  async findUserById(id) {
    const { rows } = await this.pool.query(
      `SELECT id, email, full_name AS "fullName", role, staff_id AS "staffId", is_active AS "isActive", created_at AS "createdAt"
       FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async createUser(user) {
    const { rows } = await this.pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, role, staff_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name AS "fullName", role, staff_id AS "staffId", is_active AS "isActive", created_at AS "createdAt"`,
      [user.id, user.email.toLowerCase(), user.passwordHash, user.fullName, user.role, user.staffId || null]
    );
    return rows[0];
  }

  async listUsers() {
    const { rows } = await this.pool.query(
      `SELECT id, email, full_name AS "fullName", role, staff_id AS "staffId", is_active AS "isActive", created_at AS "createdAt"
       FROM users ORDER BY created_at DESC`
    );
    return rows;
  }

  // ---- STAFF ----
  async listStaff() {
    const { rows } = await this.pool.query('SELECT * FROM staff ORDER BY id ASC');
    return rows;
  }

  async getStaffById(id) {
    const { rows } = await this.pool.query('SELECT * FROM staff WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async createStaff(member) {
    const { rows } = await this.pool.query(
      `INSERT INTO staff (id, name, title, department, email, phone, room, status, avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [member.id, member.name, member.title, member.department, member.email, member.phone || '', member.room, member.status || 'Available', member.avatar || null]
    );
    return rows[0];
  }

  async updateStaff(id, fields) {
    const allowed = ['name', 'title', 'department', 'email', 'phone', 'room', 'status', 'avatar'];
    const updates = [];
    const values = [];
    let idx = 1;
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        values.push(fields[key]);
      }
    }
    if (updates.length === 0) return this.getStaffById(id);
    updates.push(`updated_at = NOW()`);
    values.push(id);
    const { rows } = await this.pool.query(
      `UPDATE staff SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0] || null;
  }

  async deleteStaff(id) {
    const { rowCount } = await this.pool.query('DELETE FROM staff WHERE id = $1', [id]);
    return rowCount > 0;
  }

  // ---- VISITORS ----
  async listVisitors() {
    const { rows } = await this.pool.query(
      `SELECT id, name, company, email, host_id AS "hostId", host_name AS "hostName", purpose,
              check_in_time AS "checkInTime", check_out_time AS "checkOutTime", status, badge_code AS "badgeCode", photo
       FROM visitors ORDER BY check_in_time DESC`
    );
    return rows;
  }

  async getVisitorById(id) {
    const { rows } = await this.pool.query(
      `SELECT id, name, company, email, host_id AS "hostId", host_name AS "hostName", purpose,
              check_in_time AS "checkInTime", check_out_time AS "checkOutTime", status, badge_code AS "badgeCode", photo
       FROM visitors WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async createVisitor(v) {
    const { rows } = await this.pool.query(
      `INSERT INTO visitors (id, name, company, email, host_id, host_name, purpose, check_in_time, status, badge_code, photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, name, company, email, host_id AS "hostId", host_name AS "hostName", purpose,
                 check_in_time AS "checkInTime", check_out_time AS "checkOutTime", status, badge_code AS "badgeCode", photo`,
      [v.id, v.name, v.company, v.email, v.hostId, v.hostName, v.purpose, v.checkInTime, v.status, v.badgeCode, v.photo]
    );
    return rows[0];
  }

  async checkOutVisitor(id) {
    const { rows } = await this.pool.query(
      `UPDATE visitors SET status = 'Checked Out', check_out_time = NOW()
       WHERE id = $1
       RETURNING id, name, company, email, host_id AS "hostId", host_name AS "hostName", purpose,
                 check_in_time AS "checkInTime", check_out_time AS "checkOutTime", status, badge_code AS "badgeCode", photo`,
      [id]
    );
    return rows[0] || null;
  }

  async deleteVisitor(id) {
    const { rowCount } = await this.pool.query('DELETE FROM visitors WHERE id = $1', [id]);
    return rowCount > 0;
  }

  // ---- APPOINTMENTS ----
  async listAppointments() {
    const { rows } = await this.pool.query(
      `SELECT id, visitor_name AS "visitorName", visitor_email AS "visitorEmail", visitor_company AS "visitorCompany",
              host_id AS "hostId", host_name AS "hostName", to_char(date, 'YYYY-MM-DD') AS date,
              time_slot AS "timeSlot", purpose, status, created_at AS "createdAt"
       FROM appointments ORDER BY created_at DESC`
    );
    return rows;
  }

  async getAppointmentById(id) {
    const { rows } = await this.pool.query(
      `SELECT id, visitor_name AS "visitorName", visitor_email AS "visitorEmail", visitor_company AS "visitorCompany",
              host_id AS "hostId", host_name AS "hostName", to_char(date, 'YYYY-MM-DD') AS date,
              time_slot AS "timeSlot", purpose, status, created_at AS "createdAt"
       FROM appointments WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findConfirmedAppointmentConflict(hostId, date, timeSlot) {
    const { rows } = await this.pool.query(
      `SELECT id FROM appointments WHERE host_id = $1 AND date = $2 AND time_slot = $3 AND status = 'Confirmed'`,
      [hostId, date, timeSlot]
    );
    return rows[0] || null;
  }

  async createAppointment(a) {
    const { rows } = await this.pool.query(
      `INSERT INTO appointments (id, visitor_name, visitor_email, visitor_company, host_id, host_name, date, time_slot, purpose, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, visitor_name AS "visitorName", visitor_email AS "visitorEmail", visitor_company AS "visitorCompany",
                 host_id AS "hostId", host_name AS "hostName", to_char(date, 'YYYY-MM-DD') AS date,
                 time_slot AS "timeSlot", purpose, status, created_at AS "createdAt"`,
      [a.id, a.visitorName, a.visitorEmail, a.visitorCompany, a.hostId, a.hostName, a.date, a.timeSlot, a.purpose, a.status]
    );
    return rows[0];
  }

  async updateAppointmentStatus(id, status) {
    const { rows } = await this.pool.query(
      `UPDATE appointments SET status = $1 WHERE id = $2
       RETURNING id, visitor_name AS "visitorName", visitor_email AS "visitorEmail", visitor_company AS "visitorCompany",
                 host_id AS "hostId", host_name AS "hostName", to_char(date, 'YYYY-MM-DD') AS date,
                 time_slot AS "timeSlot", purpose, status, created_at AS "createdAt"`,
      [status, id]
    );
    return rows[0] || null;
  }

  async deleteAppointment(id) {
    const { rowCount } = await this.pool.query('DELETE FROM appointments WHERE id = $1', [id]);
    return rowCount > 0;
  }

  // ---- NOTIFICATIONS ----
  async listNotifications() {
    const { rows } = await this.pool.query(
      `SELECT id, visitor_id AS "visitorId", visitor_name AS "visitorName", host_id AS "hostId",
              host_name AS "hostName", message, status, host_reply AS "hostReply", timestamp, replied_at AS "repliedAt"
       FROM notifications ORDER BY timestamp DESC`
    );
    return rows;
  }

  async createNotification(n) {
    const { rows } = await this.pool.query(
      `INSERT INTO notifications (id, visitor_id, visitor_name, host_id, host_name, message, status, host_reply, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, visitor_id AS "visitorId", visitor_name AS "visitorName", host_id AS "hostId",
                 host_name AS "hostName", message, status, host_reply AS "hostReply", timestamp, replied_at AS "repliedAt"`,
      [n.id, n.visitorId, n.visitorName, n.hostId, n.hostName, n.message, n.status, n.hostReply, n.timestamp]
    );
    return rows[0];
  }

  async respondToNotification(id, reply) {
    const { rows } = await this.pool.query(
      `UPDATE notifications SET host_reply = $1, status = 'Responded', replied_at = NOW()
       WHERE id = $2
       RETURNING id, visitor_id AS "visitorId", visitor_name AS "visitorName", host_id AS "hostId",
                 host_name AS "hostName", message, status, host_reply AS "hostReply", timestamp, replied_at AS "repliedAt"`,
      [reply, id]
    );
    return rows[0] || null;
  }

  // ---- FAQS ----
  async listFaqs() {
    const { rows } = await this.pool.query('SELECT id, keywords, question, answer FROM faqs ORDER BY id ASC');
    return rows;
  }

  async createFaq(faq) {
    const { rows } = await this.pool.query(
      `INSERT INTO faqs (id, keywords, question, answer) VALUES ($1, $2, $3, $4) RETURNING id, keywords, question, answer`,
      [faq.id, faq.keywords, faq.question, faq.answer]
    );
    return rows[0];
  }

  async updateFaq(id, fields) {
    const updates = [];
    const values = [];
    let idx = 1;
    for (const key of ['keywords', 'question', 'answer']) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        values.push(fields[key]);
      }
    }
    if (updates.length === 0) return null;
    updates.push(`updated_at = NOW()`);
    values.push(id);
    const { rows } = await this.pool.query(
      `UPDATE faqs SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, keywords, question, answer`,
      values
    );
    return rows[0] || null;
  }

  async deleteFaq(id) {
    const { rowCount } = await this.pool.query('DELETE FROM faqs WHERE id = $1', [id]);
    return rowCount > 0;
  }

  // ---- AUDIT LOGS ----
  async createAuditLog(entry) {
    await this.pool.query(
      `INSERT INTO audit_logs (id, user_id, user_email, user_role, action, resource, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [entry.id, entry.userId || null, entry.userEmail || null, entry.userRole || null, entry.action, entry.resource, JSON.stringify(entry.details || {}), entry.ipAddress || null]
    );
  }

  async listAuditLogs(limit = 50) {
    const { rows } = await this.pool.query(
      `SELECT id, user_id AS "userId", user_email AS "userEmail", user_role AS "userRole", action, resource, details, ip_address AS "ipAddress", created_at AS "createdAt"
       FROM audit_logs ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return rows;
  }

  // ---- SUPPORT TICKETS ----
  async listTickets() {
    const { rows } = await this.pool.query(
      `SELECT id, customer_name AS "customerName", customer_email AS "customerEmail", category, priority,
              subject, description, status, assigned_to AS "assignedTo", resolution_notes AS "resolutionNotes",
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM support_tickets ORDER BY created_at DESC`
    );
    return rows;
  }

  async createTicket(t) {
    const { rows } = await this.pool.query(
      `INSERT INTO support_tickets (id, customer_name, customer_email, category, priority, subject, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, customer_name AS "customerName", customer_email AS "customerEmail", category, priority,
                 subject, description, status, assigned_to AS "assignedTo", resolution_notes AS "resolutionNotes",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [t.id, t.customerName, t.customerEmail, t.category, t.priority, t.subject, t.description, t.status || 'open']
    );
    return rows[0];
  }

  async updateTicket(id, fields) {
    const map = { status: 'status', assignedTo: 'assigned_to', resolutionNotes: 'resolution_notes' };
    const updates = [];
    const values = [];
    let idx = 1;
    for (const [jsKey, col] of Object.entries(map)) {
      if (fields[jsKey] !== undefined) {
        updates.push(`${col} = $${idx++}`);
        values.push(fields[jsKey]);
      }
    }
    if (updates.length === 0) return null;
    updates.push(`updated_at = NOW()`);
    values.push(id);
    const { rows } = await this.pool.query(
      `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING id, customer_name AS "customerName", customer_email AS "customerEmail", category, priority,
                 subject, description, status, assigned_to AS "assignedTo", resolution_notes AS "resolutionNotes",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );
    return rows[0] || null;
  }

  async deleteTicket(id) {
    const { rowCount } = await this.pool.query('DELETE FROM support_tickets WHERE id = $1', [id]);
    return rowCount > 0;
  }

  async close() {
    await this.pool.end();
  }
}
