import React, { useState, useEffect } from 'react';
import CinematicLanding from './components/CinematicLanding';
import KioskView from './components/KioskView';
import CheckInModal from './components/CheckInModal';
import BadgeModal from './components/BadgeModal';
import AppointmentModal from './components/AppointmentModal';
import EmergencyModal from './components/EmergencyModal';
import SupportTicketModal from './components/SupportTicketModal';
import AdminDashboard from './components/AdminDashboard';
import { api } from './services/api';
import { speechService } from './services/speech';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'kiosk' | 'admin'
  const [staffList, setStaffList] = useState([]);
  const [liveStats, setLiveStats] = useState(null);
  
  // Modals state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);
  const [selectedVisitorForBadge, setSelectedVisitorForBadge] = useState(null);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [chatSessionId] = useState(() => `sess-${Math.random().toString(36).slice(2, 10)}`);

  // AI & Voice State
  const [aiState, setAiState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [transcript, setTranscript] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Chat message stream
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'aura',
      text: "Hello and welcome to AURA Tech Headquarters! I am AURA, your intelligent front-desk AI Receptionist. How may I assist you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ["Check in as a visitor", "Schedule an appointment", "Guest Wi-Fi password", "Where is the cafeteria?"]
    }
  ]);

  // Initial staff & live telemetry prefetch
  useEffect(() => {
    api.getStaff()
      .then(setStaffList)
      .catch(err => console.error('Staff load error:', err));
    api.getStatus()
      .then(setLiveStats)
      .catch(() => {});
  }, []);

  // Wire speech service listeners
  useEffect(() => {
    speechService.onListeningChange = (isListening) => {
      if (isListening) {
        setAiState('listening');
      } else {
        setAiState(prev => (prev === 'listening' ? 'idle' : prev));
      }
    };

    speechService.onSpeakingChange = (isSpeaking) => {
      if (isSpeaking) {
        setAiState('speaking');
      } else {
        setAiState('idle');
      }
    };
  }, []);

  // Handle sending a message to AI
  const handleSendMessage = async (text) => {
    if (!text || !text.trim()) return;

    // Add user message to history
    const userMsg = {
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setAiState('thinking');

    try {
      const res = await api.sendMessage(text.trim(), chatSessionId);
      
      const auraMsg = {
        sender: 'aura',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: res.suggestions || []
      };

      setChatHistory(prev => [...prev, auraMsg]);

      // Handle autonomous action triggers from AI Super Chatbot
      if (res.action === 'OPEN_CHECKIN') {
        setIsCheckInOpen(true);
      } else if (res.action === 'OPEN_BOOKING') {
        setIsAppointmentOpen(true);
      } else if (res.action === 'OPEN_EMERGENCY') {
        setIsEmergencyOpen(true);
      } else if (res.action === 'OPEN_TICKET') {
        setIsTicketOpen(true);
      }

      // Voice TTS feedback if enabled
      if (voiceEnabled) {
        setAiState('speaking');
        speechService.speak(res.reply, () => {
          setAiState('speaking');
        }, () => {
          setAiState('idle');
        });
      } else {
        setAiState('idle');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        sender: 'aura',
        text: "I experienced a temporary network latency, but I am here! You can check in directly or ask for office amenities.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ["Check in", "Wi-Fi Info", "Staff Directory"]
      };
      setChatHistory(prev => [...prev, errorMsg]);
      setAiState('idle');
    }
  };

  // Start push-to-talk voice recognition (hold to speak)
  const handleStartListening = () => {
    setTranscript('');
    setAiState('listening');
    speechService.startPushToTalk(
      (interimText) => {
        setTranscript(interimText);
      },
      (error) => {
        console.warn('Speech error:', error);
        setAiState('idle');
      }
    );
  };

  // Stop push-to-talk and send accumulated speech on release
  const handleStopListening = () => {
    speechService.stopPushToTalk((finalTranscript) => {
      if (finalTranscript && finalTranscript.trim()) {
        setTranscript(finalTranscript);
        handleSendMessage(finalTranscript);
      } else {
        setAiState('idle');
      }
    });
  };

  const handleCheckInSuccess = (visitor) => {
    setIsCheckInOpen(false);
    setSelectedVisitorForBadge(visitor);
    setIsBadgeOpen(true);

    // AI voice greeting acknowledgment
    const welcomeText = `Welcome, ${visitor.name}! Your check-in is complete. I have notified your host, ${visitor.hostName}. Please collect your visitor badge.`;
    handleSendMessage(`I have checked in as ${visitor.name}`);
    if (voiceEnabled) {
      speechService.speak(welcomeText);
    }
  };

  const handleReprintBadge = (visitor) => {
    setSelectedVisitorForBadge(visitor);
    setIsBadgeOpen(true);
  };

  return (
    <div className="font-sans antialiased text-slate-100 bg-[#080C14] min-h-screen">
      {currentView === 'landing' ? (
        <CinematicLanding
          liveStats={liveStats}
          onLaunchKiosk={() => setCurrentView('kiosk')}
          onOpenCheckIn={() => {
            setCurrentView('kiosk');
            setIsCheckInOpen(true);
          }}
          onOpenAppointment={() => {
            setCurrentView('kiosk');
            setIsAppointmentOpen(true);
          }}
          onOpenAdmin={() => setCurrentView('admin')}
        />
      ) : currentView === 'kiosk' ? (
        <KioskView
          chatHistory={chatHistory}
          onSendMessage={handleSendMessage}
          aiState={aiState}
          transcript={transcript}
          voiceEnabled={voiceEnabled}
          onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          onOpenCheckIn={() => setIsCheckInOpen(true)}
          onOpenAppointment={() => setIsAppointmentOpen(true)}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onOpenTicket={() => setIsTicketOpen(true)}
          onOpenAdmin={() => setCurrentView('admin')}
          onOpenLanding={() => setCurrentView('landing')}
          staffList={staffList}
        />
      ) : (
        <AdminDashboard
          onReprintBadge={handleReprintBadge}
          onBackToKiosk={() => setCurrentView('kiosk')}
        />
      )}

      {/* MODALS */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onCheckInSuccess={handleCheckInSuccess}
        staffList={staffList}
      />

      <BadgeModal
        visitor={selectedVisitorForBadge}
        onClose={() => setIsBadgeOpen(false)}
      />

      <AppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        staffList={staffList}
      />

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      <SupportTicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        onTicketCreated={(t) => {
          setChatHistory(prev => [...prev, {
            sender: 'aura',
            text: `Support ticket ${t.id} ("${t.subject}") has been logged with ${t.priority} priority.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }}
      />
    </div>
  );
}
