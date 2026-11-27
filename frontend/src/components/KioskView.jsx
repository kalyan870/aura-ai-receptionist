import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Send, Sparkles, UserCheck, 
  Calendar, Users, HelpCircle, ShieldAlert, Settings, Clock, Home 
} from 'lucide-react';
import AvatarVisualizer from './AvatarVisualizer';

export default function KioskView({
  chatHistory = [],
  onSendMessage,
  aiState = 'idle',
  transcript = '',
  voiceEnabled = true,
  onToggleVoice,
  onStartListening,
  onStopListening,
  onOpenCheckIn,
  onOpenAppointment,
  onOpenEmergency,
  onOpenAdmin,
  onOpenLanding,
  staffList = []
}) {
  const [inputText, setInputText] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const chatEndRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#080C14] text-slate-100">
      {/* Background Decorative Ambient Radial Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER */}
      <header className="relative z-20 px-8 py-5 border-b border-slate-800/80 glass-panel flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-cyan-500/25">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-wider">AURA</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Front-Desk AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Headquarters Kiosk Terminal #01 • Online</p>
          </div>
        </div>

        {/* Live Clock & Top Controls */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-white font-mono">{formattedTime}</span>
            <span className="text-[11px] text-slate-400">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
            {onOpenLanding && (
              <button
                onClick={onOpenLanding}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Back to Cinematic Overview"
              >
                <Home className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onToggleVoice}
              className={`p-2 rounded-xl transition ${
                voiceEnabled ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={voiceEnabled ? 'Voice Responses Enabled' : 'Voice Responses Muted'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenEmergency}
              className="p-2 rounded-xl text-red-400 hover:bg-red-950/40 transition"
              title="Emergency & Evacuation Procedures"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Admin & Security Portal"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* CENTER INTERACTIVE SECTION */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: Animated Avatar & Voice Controls */}
        <div className="lg:col-span-5 flex flex-col justify-between glass-panel rounded-3xl p-6 border border-slate-800/80 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Receptionist Presence
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live & Listening
            </span>
          </div>

          {/* Holographic Avatar Component */}
          <div className="my-auto py-2">
            <AvatarVisualizer
              state={aiState}
              transcript={transcript}
              onHoldStart={onStartListening}
              onHoldEnd={onStopListening}
            />
          </div>

          {/* Voice Mic Hold-to-Speak Trigger Button */}
          <div className="pt-4 border-t border-slate-800/60 flex flex-col items-center gap-3">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onStartListening();
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                onStopListening();
              }}
              onPointerLeave={() => {
                if (aiState === 'listening') onStopListening();
              }}
              onPointerCancel={() => {
                if (aiState === 'listening') onStopListening();
              }}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl select-none touch-none ${
                aiState === 'listening'
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 scale-[0.98] animate-pulse'
                  : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-600/30'
              }`}
            >
              {aiState === 'listening' ? (
                <>
                  <Mic className="w-5 h-5 animate-bounce-subtle" />
                  <span>Listening... Release to Send</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Hold to Speak with AURA</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-500 text-center">
              Press and hold while speaking, then release to receive AURA&apos;s response
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Dialogue Feed & Interactive Chat */}
        <div className="lg:col-span-7 flex flex-col justify-between glass-panel rounded-3xl p-6 border border-slate-800/80 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              Reception Interaction Feed
            </span>
            <span className="text-[11px] text-slate-500">Touch or voice conversation</span>
          </div>

          {/* Chat Message Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-2 max-h-[380px] min-h-[280px]">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Suggestion action pills if AI returned any */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/70">
                      {msg.suggestions.map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => onSendMessage(suggestion)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {msg.sender === 'user' ? 'You' : 'AURA'} • {msg.time}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Text Input Form (Fallback & Quick Type) */}
          <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-800/60">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask AURA a question or tap a quick action below..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-900/90 border border-slate-750 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="absolute right-2 p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-30 disabled:hover:bg-cyan-600 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* BOTTOM QUICK ACTIONS DOCK */}
      <footer className="relative z-20 px-8 py-5 border-t border-slate-800/80 glass-panel">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-medium">
            <span className="text-white font-bold">Quick Touch Actions:</span> Instant self-service front desk services
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCheckIn}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/25"
            >
              <UserCheck className="w-4 h-4" />
              Express Visitor Check-In
            </button>

            <button
              onClick={onOpenAppointment}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-purple-600/80 hover:bg-purple-600 text-white transition shadow-lg shadow-purple-600/20"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </button>

            <button
              onClick={() => onSendMessage("Where can I find Wi-Fi and parking validation?")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              Wi-Fi & FAQs
            </button>

            <button
              onClick={() => onSendMessage("Show me the executive staff directory")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Users className="w-4 h-4 text-purple-400" />
              Staff Directory
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
