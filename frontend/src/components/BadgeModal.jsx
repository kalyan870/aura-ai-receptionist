import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, QrCode, Download, Building, Calendar, User } from 'lucide-react';

export default function BadgeModal({ visitor, onClose }) {
  if (!visitor) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(visitor.checkInTime || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = new Date(visitor.checkInTime || Date.now()).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden glass-panel rounded-3xl border border-slate-700/70 shadow-2xl">
        {/* Modal Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Check-In Confirmed & Host Notified
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE BADGE CARD */}
        <div className="p-6">
          <div
            id="printable-badge"
            className="relative overflow-hidden bg-white text-slate-900 rounded-2xl p-6 shadow-2xl border-4 border-slate-900 select-none"
          >
            {/* Badge Top Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-cyan-600 uppercase">OFFICIAL VISITOR PASS</span>
                <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none mt-0.5">AURA TECH HQ</h1>
                <p className="text-[11px] text-slate-500 font-medium">Headquarters • Global Innovation Center</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900 text-cyan-400">
                  GUEST CLEARANCE
                </span>
                <p className="text-[10px] font-mono font-bold text-slate-700 mt-1">{visitor.badgeCode || 'AURA-PASS'}</p>
              </div>
            </div>

            {/* Badge Center Info */}
            <div className="flex items-center gap-4 my-5">
              {/* Photo or Avatar */}
              <div className="w-24 h-24 rounded-xl border-2 border-slate-900 overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                {visitor.photo ? (
                  <img src={visitor.photo} alt={visitor.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-cyan-600 to-slate-800 flex items-center justify-center text-white font-bold text-2xl">
                    {visitor.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Visitor Details */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black text-slate-900 truncate leading-snug">
                  {visitor.name}
                </h2>
                <p className="text-xs font-bold text-cyan-700 uppercase tracking-wide truncate">
                  {visitor.company || 'Private Guest'}
                </p>
                <div className="mt-2 text-[11px] space-y-0.5 text-slate-600">
                  <p><span className="font-semibold text-slate-900">Host:</span> {visitor.hostName}</p>
                  <p><span className="font-semibold text-slate-900">Purpose:</span> {visitor.purpose}</p>
                  <p><span className="font-semibold text-slate-900">Issued:</span> {formattedDate} at {formattedTime}</p>
                </div>
              </div>
            </div>

            {/* Security Verification & QR Code Bar */}
            <div className="flex items-center justify-between pt-3 border-t-2 border-slate-900/30">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                  ESCORTED ACCESS GRANTED
                </div>
                <p className="text-[9px] text-slate-400 font-medium">Please wear this badge visibly at all times.</p>
              </div>

              {/* SVG Mock QR Code */}
              <div className="p-1 rounded bg-slate-100 border border-slate-300">
                <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="#FFFFFF"/>
                  {/* Outer corner squares */}
                  <rect x="10" y="10" width="25" height="25" stroke="#000" strokeWidth="6" fill="none"/>
                  <rect x="16" y="16" width="13" height="13" fill="#000"/>
                  <rect x="65" y="10" width="25" height="25" stroke="#000" strokeWidth="6" fill="none"/>
                  <rect x="71" y="16" width="13" height="13" fill="#000"/>
                  <rect x="10" y="65" width="25" height="25" stroke="#000" strokeWidth="6" fill="none"/>
                  <rect x="16" y="71" width="13" height="13" fill="#000"/>
                  {/* Pattern dots */}
                  <rect x="42" y="15" width="6" height="6" fill="#000"/>
                  <rect x="52" y="25" width="6" height="6" fill="#000"/>
                  <rect x="42" y="42" width="16" height="16" fill="#000"/>
                  <rect x="65" y="45" width="8" height="8" fill="#000"/>
                  <rect x="45" y="70" width="10" height="10" fill="#000"/>
                  <rect x="70" y="70" width="15" height="15" fill="#000"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handlePrint}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30 transition"
            >
              <Printer className="w-4 h-4" />
              Print Visitor Badge
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
            >
              Done / Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
