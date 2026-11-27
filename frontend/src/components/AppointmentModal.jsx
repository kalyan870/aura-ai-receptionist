import React, { useState } from 'react';
import { X, Calendar, Clock, User, Mail, Building, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const TIME_SLOTS = [
  "09:30 AM", "10:30 AM", "11:30 AM",
  "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM"
];

export default function AppointmentModal({ isOpen, onClose, staffList = [] }) {
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorEmail: '',
    visitorCompany: '',
    hostId: staffList[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: TIME_SLOTS[1],
    purpose: 'Product & Tech Discussion'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedAppt, setConfirmedAppt] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.visitorName.trim()) {
      setError('Please provide your name.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.bookAppointment({
        ...formData,
        visitorName: formData.visitorName.trim(),
        visitorCompany: formData.visitorCompany.trim() || 'Visitor'
      });
      setConfirmedAppt(res.appointment);
    } catch (err) {
      setError(err.message || 'Booking conflict or error. Please choose another time.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setConfirmedAppt(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden glass-panel rounded-2xl border border-slate-700/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Schedule an Appointment</h2>
              <p className="text-xs text-slate-400">Book dedicated meeting time with team leads</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {confirmedAppt ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Appointment Confirmed!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your meeting with <span className="text-cyan-400 font-semibold">{confirmedAppt.hostName}</span> has been scheduled and added to the company calendar.
            </p>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-mono text-cyan-400 font-bold">{confirmedAppt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="text-slate-200 font-medium">{confirmedAppt.date} at {confirmedAppt.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guest Name:</span>
                <span className="text-slate-200 font-medium">{confirmedAppt.visitorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="text-slate-200 font-medium">{confirmedAppt.purpose}</span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-400 font-medium">
              A calendar invite and SMS reminder have been simulated and dispatched.
            </p>

            <button
              onClick={resetAndClose}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              Done / Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-300 border border-red-500/30 rounded-xl bg-red-950/40">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Host / Staff Member <span className="text-purple-400">*</span>
              </label>
              <select
                value={formData.hostId}
                onChange={(e) => setFormData({ ...formData, hostId: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-purple-500 transition"
              >
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} — {staff.title} ({staff.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Appointment Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Time Slot
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-purple-500 transition"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Your Full Name <span className="text-purple-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Jordan Hayes"
                    value={formData.visitorName}
                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Quantum Innovations"
                    value={formData.visitorCompany}
                    onChange={(e) => setFormData({ ...formData, visitorCompany: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="jordan.hayes@example.com"
                  value={formData.visitorEmail}
                  onChange={(e) => setFormData({ ...formData, visitorEmail: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Meeting Purpose / Notes
              </label>
              <input
                type="text"
                placeholder="Brief summary of discussion topics"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Checking Slot...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Confirm Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
