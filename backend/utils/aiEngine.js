// In-memory multi-turn session store for AI Customer Super Chatbot
const chatSessions = new Map();

export function getSessionHistory(sessionId) {
  if (!sessionId) return [];
  return chatSessions.get(sessionId) || [];
}

/**
 * AI Customer Super Chatbot & Receptionist Intent Engine
 */
export function processAiQuery(userMessage, staffList = [], faqList = [], options = {}) {
  const raw = (userMessage || '').trim();
  const query = raw.toLowerCase();
  const sessionId = options.sessionId || null;

  if (sessionId) {
    const hist = chatSessions.get(sessionId) || [];
    hist.push({ role: 'user', text: raw, ts: Date.now() });
    if (hist.length > 20) hist.shift();
    chatSessions.set(sessionId, hist);
  }

  const recordReply = (result) => {
    if (sessionId) {
      const hist = chatSessions.get(sessionId) || [];
      hist.push({ role: 'assistant', text: result.text, intent: result.intent, ts: Date.now() });
      if (hist.length > 20) hist.shift();
      chatSessions.set(sessionId, hist);
    }
    return { ...result, sessionId };
  };

  if (!query) {
    return recordReply({
      text: 'Hello! I am AURA, your AI Customer Super Chatbot & Receptionist. I can answer product/pricing questions, open a support ticket, check you in, or book a meeting. How can I help?',
      intent: 'GREETING',
      action: null,
      suggestions: ['Create a support ticket', 'Pricing & enterprise plans', 'Check in as a visitor', 'Guest Wi-Fi password']
    });
  }

  // 1. GREETING
  if (/^(hello|hi|hey|good morning|good afternoon|good evening|greetings)/i.test(query)) {
    return recordReply({
      text: 'Welcome to AURA Tech Headquarters! I am AURA, your AI Customer Super Chatbot & Receptionist. Would you like customer support, a new support ticket, visitor check-in, or office info?',
      intent: 'GREETING',
      suggestions: ['Create a support ticket', 'Pricing & enterprise plans', 'Check in as a visitor', 'Schedule appointment']
    });
  }

  // 2. SUPPORT TICKET / ISSUE / BUG / BILLING ESCALATION
  if (/ticket|support|issue|problem|bug|error|broken|billing|refund|complaint|help\s?desk/i.test(query)) {
    return recordReply({
      text: 'I can log a priority support ticket for you right away so our engineering & customer success team can assist you. Opening the Support Ticket form now!',
      intent: 'ACTION_CREATE_TICKET',
      action: 'OPEN_TICKET',
      suggestions: ['Check ticket SLA', 'Talk to a live specialist', 'Browse FAQs']
    });
  }

  // 3. PRICING / PLANS / ENTERPRISE INQUIRY
  if (/pricing|price|cost|plan|enterprise|subscription|demo|trial/i.test(query)) {
    return recordReply({
      text: 'AURA Enterprise plans start at \$149/month per kiosk (unlimited visitors, Neon PostgreSQL cloud sync, Clerk SSO/MFA, and 24/7 priority SLA). Would you like to book a live architecture demo with David Chen or open a sales ticket?',
      intent: 'CUSTOMER_PRICING',
      suggestions: ['Book appointment', 'Create a support ticket', 'Find David Chen']
    });
  }

  // 4. CHECK-IN Intent
  if (/check\s?in|sign\s?in|visitor pass|badge|register|arrived/i.test(query)) {
    return recordReply({
      text: "I can assist you with your express check-in right now! Please enter your details and capture your photo to print your QR visitor badge.",
      intent: 'ACTION_CHECKIN',
      action: 'OPEN_CHECKIN'
    });
  }

  // 5. APPOINTMENT Intent
  if (/appointment|schedule|book|meeting slot|reserve|calendar/i.test(query)) {
    return recordReply({
      text: 'Certainly! You can schedule a conflict-free appointment with any of our department leads. Opening the booking calendar now.',
      intent: 'ACTION_BOOKING',
      action: 'OPEN_BOOKING'
    });
  }

  // 6. STAFF / DIRECTORY SEARCH
  for (const person of staffList) {
    const nameParts = person.name.toLowerCase().split(' ');
    const match = nameParts.some(part => part.length > 2 && query.includes(part));
    if (match || query.includes(person.title.toLowerCase()) || query.includes(person.department.toLowerCase())) {
      const publicStaff = {
        id: person.id,
        name: person.name,
        title: person.title,
        department: person.department,
        room: person.room,
        status: person.status,
        avatar: person.avatar
      };
      return recordReply({
        text: `${person.name} is our ${person.title} in ${person.department} (${person.room}). Current availability: "${person.status}". Would you like to check in to meet them or book a slot?`,
        intent: 'STAFF_INFO',
        staff: publicStaff,
        suggestions: [`Check in to see ${person.name}`, `Book meeting with ${person.name}`]
      });
    }
  }

  // 7. FAQ / OFFICE KNOWLEDGE BASE MATCH
  let bestFaq = null;
  let maxScore = 0;

  for (const faq of faqList) {
    let score = 0;
    for (const kw of faq.keywords || []) {
      if (query.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestFaq = faq;
    }
  }

  if (bestFaq && maxScore >= 2) {
    return recordReply({
      text: bestFaq.answer,
      intent: 'FAQ_ANSWER',
      topic: bestFaq.question
    });
  }

  // 8. EMERGENCY / SECURITY
  if (/emergency|fire|police|evacuate|danger|hazard|ambulance/i.test(query)) {
    return recordReply({
      text: 'EMERGENCY PROTOCOL: North and South exits lead directly to the South Courtyard assembly point. First Aid & AED are beside this kiosk. Security dispatch is on Ext 9911.',
      intent: 'EMERGENCY',
      action: 'OPEN_EMERGENCY'
    });
  }

  // 9. CAPABILITIES
  if (/who are you|what can you do|your name|features|capabilities/i.test(query)) {
    return recordReply({
      text: 'I am AURA, an AI Customer Super Chatbot & Receptionist. I can answer product & pricing questions, create support tickets, check in visitors with QR badges, book appointments, and look up staff availability.',
      intent: 'CAPABILITIES',
      suggestions: ['Create a support ticket', 'Pricing & enterprise plans', 'Express Check-In', 'Guest Wi-Fi password']
    });
  }

  return recordReply({
    text: `I received your message about "${raw}". I can connect you to customer support via a ticket, check you in for a visit, or share pricing and office info!`,
    intent: 'GENERAL_INQUIRY',
    suggestions: ['Create a support ticket', 'Pricing & enterprise plans', 'Express Check-In', 'Wi-Fi Information']
  });
}
