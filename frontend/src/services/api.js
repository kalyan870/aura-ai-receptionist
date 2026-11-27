const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'aura_auth_token';

function getAuthHeaders(extra = {}) {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null;
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function parseJson(res, fallbackMsg) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || fallbackMsg);
    err.status = res.status;
    err.details = data.details;
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  getToken() {
    return typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null;
  },

  setToken(token) {
    if (typeof window !== 'undefined') {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    }
  },

  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await parseJson(res, 'Login failed');
    this.setToken(data.token);
    return data;
  },

  async register({ email, password, fullName, role = 'staff' }) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ email, password, fullName, role })
    });
    const data = await parseJson(res, 'Registration failed');
    if (data.token && !this.getToken()) {
      this.setToken(data.token);
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return parseJson(res, 'Session invalid');
  },

  logout() {
    this.setToken(null);
  },

  // Status
  async getStatus() {
    const res = await fetch(`${BASE_URL}/status`);
    return parseJson(res, 'Failed to fetch status');
  },

  // AI Super Chatbot
  async sendMessage(message, sessionId = null) {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId })
    });
    return parseJson(res, 'AI Chat failed');
  },

  // Support Tickets
  async createTicket(data) {
    const res = await fetch(`${BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return parseJson(res, 'Failed to create support ticket');
  },

  async getTickets() {
    const res = await fetch(`${BASE_URL}/tickets`, {
      headers: getAuthHeaders()
    });
    return parseJson(res, 'Failed to fetch support tickets');
  },

  async updateTicket(id, fields) {
    const res = await fetch(`${BASE_URL}/tickets/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(fields)
    });
    return parseJson(res, 'Failed to update support ticket');
  },

  // Staff
  async getStaff() {
    const res = await fetch(`${BASE_URL}/staff`, {
      headers: getAuthHeaders()
    });
    return parseJson(res, 'Failed to fetch staff directory');
  },

  async updateStaffStatus(id, status) {
    const res = await fetch(`${BASE_URL}/staff/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status })
    });
    return parseJson(res, 'Failed to update staff status');
  },

  // Visitors
  async getVisitors() {
    const res = await fetch(`${BASE_URL}/visitors`, {
      headers: getAuthHeaders()
    });
    return parseJson(res, 'Failed to fetch visitors');
  },

  async checkInVisitor(data) {
    const res = await fetch(`${BASE_URL}/visitors/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return parseJson(res, 'Check-in failed');
  },

  async checkOutVisitor(id) {
    const res = await fetch(`${BASE_URL}/visitors/${id}/checkout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return parseJson(res, 'Check-out failed');
  },

  // Appointments
  async getAppointments() {
    const res = await fetch(`${BASE_URL}/appointments`, {
      headers: getAuthHeaders()
    });
    return parseJson(res, 'Failed to fetch appointments');
  },

  async bookAppointment(data) {
    const res = await fetch(`${BASE_URL}/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return parseJson(res, 'Appointment booking failed');
  },

  async cancelAppointment(id) {
    const res = await fetch(`${BASE_URL}/appointments/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return parseJson(res, 'Failed to cancel appointment');
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: getAuthHeaders()
    });
    return parseJson(res, 'Failed to fetch notifications');
  },

  async respondToNotification(id, reply) {
    const res = await fetch(`${BASE_URL}/notifications/${id}/respond`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ reply })
    });
    return parseJson(res, 'Failed to respond to notification');
  },

  // FAQs
  async getFaqs() {
    const res = await fetch(`${BASE_URL}/faqs`);
    return parseJson(res, 'Failed to fetch FAQs');
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${BASE_URL}/analytics`, {
      headers: getAuthHeaders()
    });
    return parseJson(res, 'Failed to fetch analytics');
  }
};
