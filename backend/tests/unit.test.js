import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, sanitizeUser } from '../utils/crypto.js';
import { sanitizeString, sanitizePayload } from '../middleware/validate.js';
import { processAiQuery, getSessionHistory } from '../utils/aiEngine.js';

describe('Fast Unit Tests — Crypto & Secret Safety', () => {
  it('hashes passwords with unique random salts and verifies accurately', () => {
    const h1 = hashPassword('StrongPass!2026');
    const h2 = hashPassword('StrongPass!2026');

    assert.ok(h1.startsWith('scrypt$'));
    assert.notEqual(h1, h2, 'Identical passwords must produce different salted hashes');
    assert.equal(verifyPassword('StrongPass!2026', h1), true);
    assert.equal(verifyPassword('WrongPass!2026', h1), false);
    assert.equal(verifyPassword('StrongPass!2026', 'malformed-hash'), false);
  });

  it('rejects weak passwords shorter than 8 characters', () => {
    assert.throws(() => hashPassword('short'), /at least 8 characters/);
  });

  it('strips passwordHash and password_hash via sanitizeUser', () => {
    const cleaned = sanitizeUser({
      id: 'u1',
      email: 'a@b.com',
      passwordHash: 'secret',
      password_hash: 'secret2',
      role: 'admin'
    });
    assert.equal('passwordHash' in cleaned, false);
    assert.equal('password_hash' in cleaned, false);
    assert.equal(cleaned.email, 'a@b.com');
  });
});

describe('Fast Unit Tests — Input Sanitization', () => {
  it('removes XSS angle brackets and control characters', () => {
    const dirty = '  <script>alert("xss")</script>Hello\u0000World  ';
    const clean = sanitizeString(dirty);
    assert.equal(clean.includes('<'), false);
    assert.equal(clean.includes('>'), false);
    assert.equal(clean.includes('\u0000'), false);
    assert.equal(clean, 'scriptalert("xss")/scriptHelloWorld');
  });

  it('sanitizes nested payloads while preserving photo & password fields', () => {
    const payload = {
      name: '<b>Alice</b>',
      password: '<Pass123!>',
      photo: 'data:image/png;base64,AAA='
    };
    const result = sanitizePayload(payload);
    assert.equal(result.name, 'bAlice/b');
    assert.equal(result.password, '<Pass123!>');
    assert.equal(result.photo, 'data:image/png;base64,AAA=');
  });
});

describe('Fast Unit Tests — AI Dialogue Engine', () => {
  const mockStaff = [
    { id: 'st-1', name: 'Dr. Sarah Mitchell', title: 'CTO', department: 'Engineering', room: 'Suite 401', status: 'Available', avatar: '' }
  ];
  const mockFaqs = [
    { id: 'faq-1', keywords: ['wifi', 'password'], question: 'Wi-Fi?', answer: 'Network AURA-Guest-5G' }
  ];

  it('classifies greetings, check-in, booking, staff lookup, FAQ, emergency, pricing, and support tickets', () => {
    assert.equal(processAiQuery('Hello!', mockStaff, mockFaqs).intent, 'GREETING');
    assert.equal(processAiQuery('I want to check in', mockStaff, mockFaqs).action, 'OPEN_CHECKIN');
    assert.equal(processAiQuery('Schedule an appointment', mockStaff, mockFaqs).action, 'OPEN_BOOKING');
    assert.equal(processAiQuery('Where is Sarah Mitchell?', mockStaff, mockFaqs).staff.id, 'st-1');
    assert.equal(processAiQuery('What is the wifi password?', mockStaff, mockFaqs).intent, 'FAQ_ANSWER');
    assert.equal(processAiQuery('Fire emergency!', mockStaff, mockFaqs).action, 'OPEN_EMERGENCY');
    assert.equal(processAiQuery('What is your enterprise pricing?', mockStaff, mockFaqs).intent, 'CUSTOMER_PRICING');
    assert.equal(processAiQuery('I need to open a support ticket for a bug', mockStaff, mockFaqs).action, 'OPEN_TICKET');
  });

  it('maintains multi-turn session history for Super Chatbot', () => {
    const sid = 'unit-sess-1';
    processAiQuery('Hello', mockStaff, mockFaqs, { sessionId: sid });
    processAiQuery('What is the pricing?', mockStaff, mockFaqs, { sessionId: sid });
    const history = getSessionHistory(sid);
    assert.equal(history.length, 4);
    assert.equal(history[0].role, 'user');
    assert.equal(history[3].intent, 'CUSTOMER_PRICING');
  });
});
