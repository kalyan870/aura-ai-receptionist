import React, { useEffect, useRef } from 'react';
import { animate, stagger, createTimeline } from 'animejs';
import {
  Sparkles, Mic, UserCheck, Calendar, ShieldCheck, Bell,
  ShieldAlert, ArrowRight, Lock, Cpu, Radio, ChevronRight
} from 'lucide-react';

export default function CinematicLanding({
  onLaunchKiosk,
  onOpenCheckIn,
  onOpenAppointment,
  onOpenAdmin,
  liveStats
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = rootRef.current;
    if (!ctx) return;

    // Anime.js v4 choreographed entrance timeline
    const tl = createTimeline({
      defaults: { ease: 'outExpo', duration: 900 }
    });

    tl.add('.hero-eyebrow', {
      opacity: [0, 1],
      translateY: [18, 0],
      duration: 650
    })
      .add('.hero-word', {
        opacity: [0, 1],
        translateY: [32, 0],
        filter: ['blur(8px)', 'blur(0px)'],
        delay: stagger(75),
        duration: 850
      }, '-=400')
      .add('.hero-sub', {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 700
      }, '-=550')
      .add('.hero-cta', {
        opacity: [0, 1],
        translateY: [16, 0],
        scale: [0.96, 1],
        delay: stagger(90),
        duration: 650
      }, '-=500')
      .add('.hero-stage', {
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.97, 1],
        duration: 950
      }, '-=500')
      .add('.bento-card', {
        opacity: [0, 1],
        translateY: [28, 0],
        delay: stagger(80),
        duration: 700
      }, '-=600');

    // Continuous ambient floating animation on the holographic orb
    const orbAnim = animate('.ambient-orb', {
      translateY: [-10, 10],
      scale: [0.98, 1.03],
      duration: 3600,
      alternate: true,
      loop: true,
      ease: 'inOutSine'
    });

    // Subtle telemetry pulse ring
    const ringAnim = animate('.telemetry-ring', {
      rotate: 360,
      duration: 24000,
      loop: true,
      ease: 'linear'
    });

    return () => {
      tl.pause();
      orbAnim.pause();
      ringAnim.pause();
    };
  }, []);

  const headlineWords = ['The', 'Autonomous', 'Front', 'Desk', 'Built', 'for', 'Modern', 'Enterprises.'];

  const features = [
    {
      icon: Mic,
      accent: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/25',
      title: 'Hold-to-Speak Voice AI',
      desc: 'Push-to-talk speech recognition with live interim transcripts and natural vocal responses.'
    },
    {
      icon: UserCheck,
      accent: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/25',
      title: 'Express Webcam Check-In',
      desc: 'Capture live visitor photos and print QR-coded security passes in under 15 seconds.'
    },
    {
      icon: Calendar,
      accent: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/25',
      title: 'Conflict-Free Scheduling',
      desc: 'Real-time slot validation prevents double-booking across hosts and meeting rooms.'
    },
    {
      icon: Bell,
      accent: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/25',
      title: '2-Way Host Arrival Alerts',
      desc: 'Instant arrival notifications with quick host replies directly to the reception desk.'
    },
    {
      icon: Lock,
      accent: 'from-sky-500/20 to-indigo-500/10 text-sky-400 border-sky-500/25',
      title: 'Zero-Trust RBAC & Neon DB',
      desc: 'JWT authentication, scrypt password hashing, Zod validation, and Neon PostgreSQL.'
    },
    {
      icon: ShieldAlert,
      accent: 'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/25',
      title: 'Emergency Muster Roll',
      desc: 'One-click evacuation protocols and printable live on-site headcount for safety teams.'
    }
  ];

  return (
    <div ref={rootRef} className="relative min-h-screen bg-[#05080F] text-slate-100 overflow-hidden bg-dot-grid">
      {/* Cinematic Top Spotlight & Radial Glows */}
      <div className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[480px] rounded-full bg-gradient-to-b from-cyan-500/20 via-indigo-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-purple-600/10 blur-3xl" />

      {/* Top Navigation */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-cyan-500/30">
            A
          </div>
          <div>
            <span className="font-black tracking-wider text-white text-base">AURA</span>
            <span className="ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-400">
              v2.5 OS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAdmin}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-800 border border-slate-800 transition"
          >
            Staff &amp; Security Portal
          </button>
          <button
            onClick={onLaunchKiosk}
            className="relative overflow-hidden btn-shimmer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-600/25 transition"
          >
            <span>Launch Kiosk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-16 text-center">
        {/* Eyebrow Pill */}
        <div className="hero-eyebrow opacity-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 mb-7 shadow-xl backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Multimodal AI Receptionist</span>
          <span className="text-slate-600">•</span>
          <span className="text-cyan-400 font-semibold">Voice, Check-In &amp; Security</span>
        </div>

        {/* Staggered Word Reveal Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] max-w-4xl mx-auto">
          {headlineWords.map((word, idx) => (
            <span
              key={idx}
              className={`hero-word opacity-0 inline-block mr-3 ${
                idx === 1 || idx === 2 || idx === 3
                  ? 'bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent'
                  : 'text-white'
              }`}
            >
              {word}
            </span>
          ))}
        </h1>

        <p className="hero-sub opacity-0 mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Greet visitors with real-time voice intelligence, capture webcam security badges,
          dispatch host alerts, and manage appointments from one unified kiosk.
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onLaunchKiosk}
            className="hero-cta opacity-0 relative overflow-hidden btn-shimmer inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-2xl shadow-cyan-500/30 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Enter Live AI Kiosk</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCheckIn}
            className="hero-cta opacity-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 backdrop-blur-md transition"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Express Check-In</span>
          </button>

          <button
            onClick={onOpenAppointment}
            className="hero-cta opacity-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 backdrop-blur-md transition"
          >
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Book Appointment</span>
          </button>
        </div>

        {/* Cinematic Interactive Stage Preview (21st.dev / bklit style) */}
        <div className="hero-stage opacity-0 mt-14 relative max-w-4xl mx-auto">
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-cyan-500/40 via-slate-700/40 to-slate-900/20 shadow-[0_20px_90px_rgba(6,182,212,0.18)]">
            <div className="rounded-3xl bg-[#090E1A]/95 backdrop-blur-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Left: Holographic Core */}
              <div className="relative flex items-center justify-center w-44 h-44 shrink-0">
                <div className="telemetry-ring absolute inset-0 rounded-full border border-dashed border-cyan-500/35" />
                <div className="ambient-orb relative w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 shadow-[0_0_50px_rgba(6,182,212,0.5)] flex items-center justify-center">
                  <Mic className="w-9 h-9 text-white" />
                </div>
              </div>

              {/* Right: Live Telemetry & Quick Preview */}
              <div className="flex-1 text-left space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>LIVE KIOSK TELEMETRY</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {liveStats?.database ? `DB: ${liveStats.database}` : 'SYSTEM READY'}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  &ldquo;Welcome to AURA Tech Headquarters. Hold to speak, check in for your meeting,
                  or ask me about guest Wi-Fi, staff locations, and building amenities.&rdquo;
                </p>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Staff Online</div>
                    <div className="text-xl font-black text-white mt-0.5">{liveStats?.stats?.staffCount ?? 5}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Active Guests</div>
                    <div className="text-xl font-black text-emerald-400 mt-0.5">{liveStats?.stats?.activeVisitors ?? 1}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Bookings</div>
                    <div className="text-xl font-black text-purple-400 mt-0.5">{liveStats?.stats?.appointmentsToday ?? 1}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Feature Grid (shadcn / KokonutUI style) */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Platform Capabilities</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Engineered with zero-trust authentication, real-time speech synthesis, and instant badge issuance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat, idx) => (
            <div
              key={idx}
              onClick={onLaunchKiosk}
              className="bento-card opacity-0 group cursor-pointer p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/40 backdrop-blur-md transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br border flex items-center justify-center mb-4 ${feat.accent}`}>
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                {feat.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AURA AI Receptionist • Enterprise Front-Desk OS</span>
          </div>
          <button
            onClick={onLaunchKiosk}
            className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
          >
            <span>Open Interactive Kiosk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
}
