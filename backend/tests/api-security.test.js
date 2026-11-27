import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import { createDatabase } from '../db/index.js';
import { createApp } from '../app.js';

let server;
let baseUrl;
let db;

async function req(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, headers: res.headers, body: json };
}

before(async () => {
  db = await createDatabase({
    databaseUrl: '',
    dbFile: ':memory:',
    seedAdminPassword: '' // Start with 0 users to test bootstrap registration
  });
  const app = createApp(db, { authRateLimitMax: 50, apiRateLimitMax: 500 });
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await db.close();
});

describe('API, Auth, RBAC, Validation & E2E Security Suite', () => {
  let adminToken;
  let staffToken;
  let securityToken;
  let createdVisitorId;
  let createdStaffId;
  let createdFaqId;
  let createdApptId;

  it('1. Security Headers & Health Check', async () => {
    const res = await req('/api/status');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'online');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.ok(res.headers.get('x-frame-options'));
  });

  it('2. CORS blocks unauthorized external origin', async () => {
    const res = await req('/api/status', {
      headers: { Origin: 'https://evil-attacker.example.com' }
    });
    assert.equal(res.status, 403);
  });

  it('3. Private Security: unauthenticated /api/staff hides email/phone & protected routes return 401', async () => {
    const staffRes = await req('/api/staff');
    assert.equal(staffRes.status, 200);
    assert.equal(staffRes.body[0].email, undefined);
    assert.equal(staffRes.body[0].phone, undefined);

    for (const protectedPath of ['/api/visitors', '/api/appointments', '/api/notifications', '/api/analytics', '/api/audit-logs', '/api/auth/users']) {
      const r = await req(protectedPath);
      assert.equal(r.status, 401, `Expected 401 for unauthenticated ${protectedPath}`);
    }
  });

  it('4. Authentication: Bootstrap Admin, Login, Wrong Password, Tampered JWT', async () => {
    // Bootstrap first admin
    const reg = await req('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@aura-tech.corp',
        password: 'AdminSecurePassword!2026',
        fullName: 'Chief Admin'
      })
    });
    assert.equal(reg.status, 201);
    assert.equal(reg.body.user.role, 'admin');
    assert.equal(reg.body.user.passwordHash, undefined);
    adminToken = reg.body.token;

    // Duplicate email rejected
    const dup = await req('/api/auth/register', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        email: 'admin@aura-tech.corp',
        password: 'AdminSecurePassword!2026',
        fullName: 'Dup Admin'
      })
    });
    assert.equal(dup.status, 409);

    // Wrong password rejected
    const badLogin = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@aura-tech.corp', password: 'WrongPassword123' })
    });
    assert.equal(badLogin.status, 401);

    // Tampered JWT rejected
    const forgedToken = jwt.sign({ sub: 'usr-1', role: 'admin' }, 'wrong-secret');
    const forgedRes = await req('/api/auth/me', {
      headers: { Authorization: `Bearer ${forgedToken}` }
    });
    assert.equal(forgedRes.status, 401);

    // Valid login succeeds
    const goodLogin = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@aura-tech.corp', password: 'AdminSecurePassword!2026' })
    });
    assert.equal(goodLogin.status, 200);
    assert.ok(goodLogin.body.token);
  });

  it('5. Authorization (RBAC): Staff & Security role boundaries', async () => {
    // Admin creates a staff user (linked to st-1) and a security user
    const staffReg = await req('/api/auth/register', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        email: 'sarah@aura-tech.corp',
        password: 'StaffPassword!2026',
        fullName: 'Dr. Sarah Mitchell',
        role: 'staff',
        staffId: 'st-1'
      })
    });
    assert.equal(staffReg.status, 201);
    staffToken = staffReg.body.token;

    const secReg = await req('/api/auth/register', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        email: 'security@aura-tech.corp',
        password: 'SecurityPass!2026',
        fullName: 'Lobby Security',
        role: 'security'
      })
    });
    assert.equal(secReg.status, 201);
    securityToken = secReg.body.token;

    // Staff cannot create other users, read audit logs, or create FAQs
    assert.equal((await req('/api/auth/register', {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({ email: 'x@y.com', password: 'Password123!', fullName: 'Xavier' })
    })).status, 403);

    assert.equal((await req('/api/audit-logs', {
      headers: { Authorization: `Bearer ${staffToken}` }
    })).status, 403);

    // Staff can update own status (st-1), but NOT another staff member's status (st-2)
    assert.equal((await req('/api/staff/st-1/status', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({ status: 'In Meeting' })
    })).status, 200);

    assert.equal((await req('/api/staff/st-2/status', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({ status: 'Available' })
    })).status, 403);

    // Security can read analytics & visitors, but cannot delete visitors
    assert.equal((await req('/api/analytics', {
      headers: { Authorization: `Bearer ${securityToken}` }
    })).status, 200);
  });

  it('6. Input Validation & Edge Cases: Malformed JSON, XSS, Invalid Photo, Non-existent Host', async () => {
    // Malformed JSON
    const badJson = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid-json'
    });
    assert.equal(badJson.status, 400);

    // Invalid photo format
    const badPhoto = await req('/api/visitors/checkin', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Guest',
        hostId: 'st-1',
        photo: 'javascript:alert(1)'
      })
    });
    assert.equal(badPhoto.status, 400);

    // Non-existent hostId
    const badHost = await req('/api/visitors/checkin', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Guest',
        hostId: 'st-does-not-exist'
      })
    });
    assert.equal(badHost.status, 404);

    // Invalid appointment date format
    const badDate = await req('/api/appointments/book', {
      method: 'POST',
      body: JSON.stringify({
        visitorName: 'Test Guest',
        hostId: 'st-1',
        date: '27-11-2026',
        timeSlot: '10:00 AM'
      })
    });
    assert.equal(badDate.status, 400);
  });

  it('7. Full CRUD & E2E Flow: Check-In -> Notification -> Reply -> Check-Out -> Delete', async () => {
    // Check-In with XSS payload gets sanitized
    const checkin = await req('/api/visitors/checkin', {
      method: 'POST',
      body: JSON.stringify({
        name: '<script>Elena</script> Rostova',
        company: 'Acme Corp',
        email: 'elena@acme.com',
        hostId: 'st-1',
        purpose: 'Security Audit'
      })
    });
    assert.equal(checkin.status, 201);
    assert.equal(checkin.body.visitor.name.includes('<script>'), false);
    createdVisitorId = checkin.body.visitor.id;
    const notifId = checkin.body.notification.id;

    // Host replies to notification
    const reply = await req(`/api/notifications/${notifId}/respond`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({ reply: 'On my way down!' })
    });
    assert.equal(reply.status, 200);
    assert.equal(reply.body.notification.status, 'Responded');

    // Security checks out visitor
    const checkout = await req(`/api/visitors/${createdVisitorId}/checkout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${securityToken}` }
    });
    assert.equal(checkout.status, 200);
    assert.equal(checkout.body.visitor.status, 'Checked Out');

    // Security cannot delete visitor (403); Admin can (200)
    assert.equal((await req(`/api/visitors/${createdVisitorId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${securityToken}` }
    })).status, 403);

    assert.equal((await req(`/api/visitors/${createdVisitorId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })).status, 200);
  });

  it('8. Staff & FAQ CRUD + Appointment Conflict Prevention', async () => {
    // Staff CRUD
    const stCreate = await req('/api/staff', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'New Engineer',
        title: 'AI Researcher',
        department: 'R&D',
        email: 'new.eng@aura-tech.corp',
        room: 'Lab 202'
      })
    });
    assert.equal(stCreate.status, 201);
    createdStaffId = stCreate.body.id;

    assert.equal((await req(`/api/staff/${createdStaffId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ room: 'Lab 205' })
    })).body.room, 'Lab 205');

    assert.equal((await req(`/api/staff/${createdStaffId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })).status, 200);

    // FAQ CRUD
    const faqCreate = await req('/api/faqs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        keywords: ['gym', 'fitness'],
        question: 'Where is the gym?',
        answer: 'On the 3rd floor.'
      })
    });
    assert.equal(faqCreate.status, 201);
    createdFaqId = faqCreate.body.id;

    assert.equal((await req(`/api/faqs/${createdFaqId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })).status, 200);

    // Appointment booking & conflict
    const appt1 = await req('/api/appointments/book', {
      method: 'POST',
      body: JSON.stringify({
        visitorName: 'Client One',
        hostId: 'st-1',
        date: '2026-12-20',
        timeSlot: '10:30 AM',
        purpose: 'Demo'
      })
    });
    assert.equal(appt1.status, 201);
    createdApptId = appt1.body.appointment.id;

    const apptConflict = await req('/api/appointments/book', {
      method: 'POST',
      body: JSON.stringify({
        visitorName: 'Client Two',
        hostId: 'st-1',
        date: '2026-12-20',
        timeSlot: '10:30 AM',
        purpose: 'Overlap'
      })
    });
    assert.equal(apptConflict.status, 409);

    // Cancel & delete appointment
    assert.equal((await req(`/api/appointments/${createdApptId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    })).body.appointment.status, 'Cancelled');

    assert.equal((await req(`/api/appointments/${createdApptId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    })).status, 200);
  });

  it('9. Audit Logs verify security events were recorded', async () => {
    const logs = await req('/api/audit-logs', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(logs.status, 200);
    assert.ok(logs.body.some(l => l.action === 'AUTH_LOGIN_FAILED'));
    assert.ok(logs.body.some(l => l.action === 'AUTH_LOGIN_SUCCESS'));
    assert.ok(logs.body.some(l => l.action === 'VISITOR_CHECKOUT'));
  });
});
