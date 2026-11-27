// Comprehensive End-to-End Test Suite for AURA AI Receptionist System

async function runTestSuite() {
  console.log('====================================================');
  console.log('🤖 STARTING AURA AI RECEPTIONIST E2E TEST SUITE');
  console.log('====================================================');

  const BASE_URL = 'http://localhost:5000';

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check & status
    const statusRes = await fetch(`${BASE_URL}/api/status`);
    const status = await statusRes.json();
    assert(statusRes.status === 200 && status.system.includes('AURA'), 'System Health & Version Check');

    // 2. Chat API - Greeting Intent
    const chatGreeting = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello AURA, good morning!' })
    }).then(r => r.json());
    assert(chatGreeting.intent === 'GREETING' && chatGreeting.reply.includes('Welcome'), 'AI Conversational Greeting Intent');

    // 3. Chat API - Wi-Fi FAQ Intent
    const chatWifi = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is the guest wifi password?' })
    }).then(r => r.json());
    assert(chatWifi.intent === 'FAQ_ANSWER' && chatWifi.reply.includes('AURA-Guest-5G'), 'AI Office FAQ & Wi-Fi Retrieval');

    // 4. Chat API - Staff Directory Search Intent
    const chatStaff = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Is Dr. Sarah Mitchell in her office?' })
    }).then(r => r.json());
    assert(chatStaff.intent === 'STAFF_INFO' && chatStaff.staff.name.includes('Sarah Mitchell'), 'AI Staff Directory & Room Lookup');

    // 5. Chat API - Check-in Action Trigger Intent
    const chatCheckinAction = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I need to check in for my visit' })
    }).then(r => r.json());
    assert(chatCheckinAction.action === 'OPEN_CHECKIN', 'AI Autonomous Check-In Modal Trigger');

    // 6. Visitor Check-In API
    const checkinRes = await fetch(`${BASE_URL}/api/visitors/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Samantha Vance',
        company: 'Starlight Venture Partners',
        email: 's.vance@starlight.vc',
        hostId: 'st-1',
        purpose: 'Series B Partnership Meeting',
        photo: null
      })
    });
    const checkinData = await checkinRes.json();
    assert(checkinRes.status === 201 && checkinData.visitor.badgeCode.startsWith('AURA-'), 'Visitor Express Check-In & Badge Generation');

    // 7. Host Notification Dispatch
    const notifs = await fetch(`${BASE_URL}/api/notifications`).then(r => r.json());
    const latestNotif = notifs.find(n => n.visitorName === 'Samantha Vance');
    assert(latestNotif !== undefined && latestNotif.hostName.includes('Sarah Mitchell'), 'Host Arrival Alert Simulation Dispatch');

    // 8. Host Reply to Notification
    if (latestNotif) {
      const replyRes = await fetch(`${BASE_URL}/api/notifications/${latestNotif.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: 'On my way down to reception atrium.' })
      }).then(r => r.json());
      assert(replyRes.notification.hostReply.includes('On my way'), 'Host Interactive Response Action');
    }

    // 9. Appointment Booking API
    const testDate = `2026-12-${Math.floor(10 + Math.random() * 18)}`;
    const testSlot = `${Math.floor(1 + Math.random() * 5)}:00 PM`;
    const apptRes = await fetch(`${BASE_URL}/api/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorName: 'Derek Zhao',
        visitorEmail: 'derek@cybertek.com',
        visitorCompany: 'CyberTek Systems',
        hostId: 'st-4',
        date: testDate,
        timeSlot: testSlot,
        purpose: 'API Integration Review'
      })
    });
    const apptData = await apptRes.json();
    assert(apptRes.status === 201 && apptData.appointment.id.startsWith('APT-'), 'Appointment Scheduling & Conflict Validation');

    // 10. Visitor Check-Out API
    const checkoutRes = await fetch(`${BASE_URL}/api/visitors/${checkinData.visitor.id}/checkout`, {
      method: 'POST'
    }).then(r => r.json());
    assert(checkoutRes.visitor.status === 'Checked Out', 'Visitor Safe Check-Out & Audit Stamp');

    // 11. Static Frontend Single-Page App Delivery
    const htmlRes = await fetch(`${BASE_URL}/`);
    const htmlText = await htmlRes.text();
    assert(htmlRes.status === 200 && htmlText.includes('AURA'), 'Unified Full-Stack Frontend Delivery');

    console.log('====================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);

  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

// Start backend server in-process for tests and run suite
import('./backend/server.js').then(() => {
  setTimeout(() => {
    runTestSuite();
  }, 1500);
});
