import React from 'react';
import { X, ShieldAlert, PhoneCall, MapPin, HeartPulse, Flame, ArrowUpRight } from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden glass-panel rounded-3xl border border-red-500/50 shadow-2xl bg-gradient-to-b from-red-950/40 via-slate-900/90 to-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-500/30 bg-red-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide uppercase">Emergency & Safety Protocols</h2>
              <p className="text-xs text-red-300">AURA Building Emergency Guidelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
                <MapPin className="w-4 h-4" /> Assembly Point
              </div>
              <p className="text-sm font-semibold text-white">South Courtyard Plaza</p>
              <p className="text-[11px] text-slate-400">Exit through the main atrium doors and proceed across the boulevard.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase">
                <Flame className="w-4 h-4" /> Fire Evacuation Exits
              </div>
              <p className="text-sm font-semibold text-white">Stairwells A & B</p>
              <p className="text-[11px] text-slate-400">Do NOT use elevators during an active alarm. All stairwells are pressurized.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
                <HeartPulse className="w-4 h-4" /> Medical / AED Station
              </div>
              <p className="text-sm font-semibold text-white">Lobby Kiosk Wall (Right Side)</p>
              <p className="text-[11px] text-slate-400">Defibrillator & trauma first aid kit located directly beside this screen.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase">
                <PhoneCall className="w-4 h-4" /> Building Security Dispatch
              </div>
              <p className="text-sm font-semibold text-white">Extension: 9911</p>
              <p className="text-[11px] text-slate-400">Monitored 24/7 by on-site emergency security officers.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <span>In immediate life-threatening emergency, dial <strong>911</strong> immediately.</span>
            <span className="font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">HQ GPS: 37.7749° N, 122.4194° W</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
