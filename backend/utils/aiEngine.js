/**
 * AI Receptionist Conversational Intent & Knowledge Engine
 */
export function processAiQuery(userMessage, staffList = [], faqList = []) {
  const query = (userMessage || '').toLowerCase().trim();

  if (!query) {
    return {
      text: 'Hello! I am AURA, your AI Receptionist. How may I assist you today? You can check in, book an appointment, or ask any question about our office.',
      intent: 'GREETING',
      action: null,
      suggestions: ['Check in as a visitor', 'Schedule appointment', 'Guest Wi-Fi password']
    };
  }

  // 1. GREETING Intent
  if (/^(hello|hi|hey|good morning|good afternoon|good evening|greetings)/i.test(query)) {
    return {
      text: 'Welcome to AURA Tech Headquarters! I am AURA, your intelligent front-desk assistant. Are you checking in for a meeting, looking for a team member, or need office information?',
      intent: 'GREETING',
      suggestions: ['Check in as a visitor', 'Find an employee', 'Schedule appointment', 'Where is the cafeteria?']
    };
  }

  // 2. CHECK-IN Intent
  if (/check\s?in|sign\s?in|visitor pass|badge|register|arrived/i.test(query)) {
    return {
      text: "I can assist you with your express check-in right now! Please tap the 'Check In' button on screen to enter your details and print your digital badge.",
      intent: 'ACTION_CHECKIN',
      action: 'OPEN_CHECKIN'
    };
  }

  // 3. APPOINTMENT Intent
  if (/appointment|schedule|book|meeting slot|reserve|calendar/i.test(query)) {
    return {
      text: 'Certainly! You can schedule an appointment with any of our department leads or reserve a conference room. Would you like me to open the booking calendar?',
      intent: 'ACTION_BOOKING',
      action: 'OPEN_BOOKING'
    };
  }

  // 4. STAFF / DIRECTORY SEARCH
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
      return {
        text: `${person.name} is our ${person.title} in the ${person.department} department. Their office is located at ${person.room}. Their current status is: "${person.status}". Would you like me to notify them of your arrival or book a meeting?`,
        intent: 'STAFF_INFO',
        staff: publicStaff,
        suggestions: [`Check in to see ${person.name}`, `Book meeting with ${person.name}`]
      };
    }
  }

  // 5. FAQ / OFFICE KNOWLEDGE BASE MATCH
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
    return {
      text: bestFaq.answer,
      intent: 'FAQ_ANSWER',
      topic: bestFaq.question
    };
  }

  // 6. EMERGENCY / SECURITY
  if (/emergency|fire|police|evacuate|danger|hazard|ambulance/i.test(query)) {
    return {
      text: 'EMERGENCY PROTOCOL: Building emergency alarms can be activated at all stairwells. North and South exits lead directly to the South Courtyard assembly point. First Aid and AED are right beside this kiosk. Security is on standby at Ext 9911.',
      intent: 'EMERGENCY',
      action: 'OPEN_EMERGENCY'
    };
  }

  // 7. WHO ARE YOU / CAPABILITIES
  if (/who are you|what can you do|your name|features|help/i.test(query)) {
    return {
      text: 'I am AURA, an autonomous AI Receptionist. I can instantly check you in, print your digital visitor badge, notify your host employee, schedule new appointments, answer questions about Wi-Fi, restrooms, and directions, or summon building security.',
      intent: 'CAPABILITIES',
      suggestions: ['Check in for visit', 'Guest Wi-Fi password', 'Find team member', 'Office directions']
    };
  }

  return {
    text: `I understand you are asking about "${userMessage}". While I connect you with our directory, you can easily check in, schedule an appointment, or ask about our amenities like Wi-Fi and parking!`,
    intent: 'GENERAL_INQUIRY',
    suggestions: ['Express Check-In', 'Wi-Fi Information', 'Browse Staff Directory', 'Parking Validation']
  };
}
