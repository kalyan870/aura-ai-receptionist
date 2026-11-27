import fs from 'fs';
import path from 'path';
import { hashPassword } from '../utils/crypto.js';

export class LocalAdapter {
  constructor(dbFilePath) {
    this.dbFile = dbFilePath;
    this.mode = 'local-json';
    this.data = null;
  }

  async init(seedData, seedAdmin) {
    if (this.dbFile !== ':memory:') {
      const dir = path.dirname(this.dbFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.dbFile)) {
        try {
          this.data = JSON.parse(fs.readFileSync(this.dbFile, 'utf-8'));
        } catch {
          this.data = null;
        }
      }
    }

    if (!this.data) {
      const today = new Date().toISOString().split('T')[0];
      this.data = {
        staff: seedData?.staff || [],
        faqs: (seedData?.faqs || []).map((f, idx) => ({ id: f.id || `faq-${idx + 1}`, ...f })),
        users: [],
        visitors: [
          {
            id: 'VIS-8921',
            name: 'Alexander Reed',
            company: 'Apex Global Dynamics',
            email: 'a.reed@apexgd.com',
            hostId: 'st-1',
            hostName: 'Dr. Sarah Mitchell',
            purpose: 'Q4 AI Strategy Review',
            checkInTime: new Date(Date.now() - 45 * 60000).toISOString(),
            checkOutTime: null,
            status: 'Checked In',
            badgeCode: 'AURA-8921-X',
            photo: null
          }
        ],
        appointments: [
          {
            id: 'APT-1001',
            visitorName: 'Jordan Hayes',
            visitorEmail: 'j.hayes@quantumcorp.com',
            visitorCompany: 'Quantum Innovations',
            hostId: 'st-2',
            hostName: 'Marcus Vance',
            date: today,
            timeSlot: '11:30 AM',
            purpose: 'Supply Chain Software Audit',
            status: 'Confirmed',
            createdAt: new Date().toISOString()
          }
        ],
        notifications: [
          {
            id: 'NOTIF-1',
            visitorId: 'VIS-8921',
            visitorName: 'Alexander Reed',
            hostId: 'st-1',
            hostName: 'Dr. Sarah Mitchell',
            message: 'Visitor Alexander Reed (Apex Global Dynamics) has checked in at the Front Desk.',
            timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
            status: 'Delivered',
            hostReply: 'Acknowledged. Directing visitor to 4th Floor Executive Suite 401.'
          }
        ],
        auditLogs: []
      };
    }

    // Ensure arrays exist on older db.json
    this.data.users = this.data.users || [];
    this.data.auditLogs = this.data.auditLogs || [];
    this.data.faqs = (this.data.faqs || []).map((f, idx) => ({ id: f.id || `faq-${idx + 1}`, ...f }));

    // Seed initial admin user if empty and password provided
    if (this.data.users.length === 0 && seedAdmin?.email && seedAdmin?.password) {
      this.data.users.push({
        id: 'usr-admin-1',
        email: seedAdmin.email.toLowerCase(),
        passwordHash: hashPassword(seedAdmin.password),
        fullName: 'System Administrator',
        role: 'admin',
        staffId: null,
        isActive: true,
        createdAt: new Date().toISOString()
      });
    }

    this.save();
  }

  save() {
    if (this.dbFile !== ':memory:') {
      fs.writeFileSync(this.dbFile, JSON.stringify(this.data, null, 2));
    }
  }

  // ---- USERS ----
  async findUserByEmail(email) {
    return this.data.users.find(u => u.email === email.toLowerCase()) || null;
  }

  async findUserById(id) {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async createUser(user) {
    const record = {
      ...user,
      email: user.email.toLowerCase(),
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(record);
    this.save();
    const { passwordHash, ...safe } = record;
    return safe;
  }

  async listUsers() {
    return this.data.users.map(({ passwordHash, ...safe }) => safe);
  }

  // ---- STAFF ----
  async listStaff() {
    return this.data.staff;
  }

  async getStaffById(id) {
    return this.data.staff.find(s => s.id === id) || null;
  }

  async createStaff(member) {
    const record = { status: 'Available', ...member };
    this.data.staff.push(record);
    this.save();
    return record;
  }

  async updateStaff(id, fields) {
    const idx = this.data.staff.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.staff[idx] = { ...this.data.staff[idx], ...fields };
    this.save();
    return this.data.staff[idx];
  }

  async deleteStaff(id) {
    const idx = this.data.staff.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.data.staff.splice(idx, 1);
    this.save();
    return true;
  }

  // ---- VISITORS ----
  async listVisitors() {
    return this.data.visitors;
  }

  async getVisitorById(id) {
    return this.data.visitors.find(v => v.id === id) || null;
  }

  async createVisitor(v) {
    this.data.visitors.unshift(v);
    this.save();
    return v;
  }

  async checkOutVisitor(id) {
    const v = this.data.visitors.find(item => item.id === id);
    if (!v) return null;
    v.status = 'Checked Out';
    v.checkOutTime = new Date().toISOString();
    this.save();
    return v;
  }

  async deleteVisitor(id) {
    const idx = this.data.visitors.findIndex(v => v.id === id);
    if (idx === -1) return false;
    this.data.visitors.splice(idx, 1);
    this.save();
    return true;
  }

  // ---- APPOINTMENTS ----
  async listAppointments() {
    return this.data.appointments;
  }

  async getAppointmentById(id) {
    return this.data.appointments.find(a => a.id === id) || null;
  }

  async findConfirmedAppointmentConflict(hostId, date, timeSlot) {
    return this.data.appointments.find(
      a => a.hostId === hostId && a.date === date && a.timeSlot === timeSlot && a.status === 'Confirmed'
    ) || null;
  }

  async createAppointment(a) {
    this.data.appointments.unshift(a);
    this.save();
    return a;
  }

  async updateAppointmentStatus(id, status) {
    const appt = this.data.appointments.find(a => a.id === id);
    if (!appt) return null;
    appt.status = status;
    this.save();
    return appt;
  }

  async deleteAppointment(id) {
    const idx = this.data.appointments.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.data.appointments.splice(idx, 1);
    this.save();
    return true;
  }

  // ---- NOTIFICATIONS ----
  async listNotifications() {
    return this.data.notifications;
  }

  async createNotification(n) {
    this.data.notifications.unshift(n);
    this.save();
    return n;
  }

  async respondToNotification(id, reply) {
    const notif = this.data.notifications.find(n => n.id === id);
    if (!notif) return null;
    notif.hostReply = reply;
    notif.status = 'Responded';
    notif.repliedAt = new Date().toISOString();
    this.save();
    return notif;
  }

  // ---- FAQS ----
  async listFaqs() {
    return this.data.faqs;
  }

  async createFaq(faq) {
    this.data.faqs.push(faq);
    this.save();
    return faq;
  }

  async updateFaq(id, fields) {
    const idx = this.data.faqs.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.data.faqs[idx] = { ...this.data.faqs[idx], ...fields };
    this.save();
    return this.data.faqs[idx];
  }

  async deleteFaq(id) {
    const idx = this.data.faqs.findIndex(f => f.id === id);
    if (idx === -1) return false;
    this.data.faqs.splice(idx, 1);
    this.save();
    return true;
  }

  // ---- AUDIT LOGS ----
  async createAuditLog(entry) {
    this.data.auditLogs.unshift({ ...entry, createdAt: new Date().toISOString() });
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.length = 500;
    }
    this.save();
  }

  async listAuditLogs(limit = 50) {
    return this.data.auditLogs.slice(0, limit);
  }

  async close() {}
}
