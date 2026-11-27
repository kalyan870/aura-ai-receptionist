import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, UserCheck, RefreshCw, AlertCircle, Building2, User, Mail, FileText } from 'lucide-react';
import { api } from '../services/api';

export default function CheckInModal({ isOpen, onClose, onCheckInSuccess, staffList = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    hostId: staffList[0]?.id || '',
    purpose: 'Executive Meeting'
  });

  const [cameraActive, setCameraActive] = useState(false);
  const [photoData, setPhotoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (staffList.length > 0 && !formData.hostId) {
      setFormData(prev => ({ ...prev, hostId: staffList[0].id }));
    }
  }, [staffList]);

  // Handle webcam start
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Webcam access error:', err);
      setError('Unable to access camera. You can proceed with a standard digital avatar.');
      setCameraActive(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture snapshot
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 300, 300);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoData(dataUrl);
    stopCamera();
  };

  // Clean up camera on close
  const handleClose = () => {
    stopCamera();
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.checkInVisitor({
        name: formData.name.trim(),
        company: formData.company.trim() || 'Independent Visitor',
        email: formData.email.trim(),
        hostId: formData.hostId,
        purpose: formData.purpose,
        photo: photoData
      });

      stopCamera();
      onCheckInSuccess(res.visitor);
    } catch (err) {
      setError(err.message || 'Check-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden glass-panel rounded-2xl border border-slate-700/60 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Visitor Express Check-In</h2>
              <p className="text-xs text-slate-400">Issue your security clearance and digital badge</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-300 border border-red-500/30 rounded-xl bg-red-950/40">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo Snapshot Capture Section */}
          <div className="flex items-center gap-4 p-3.5 border border-slate-800 rounded-xl bg-slate-900/40">
            <div className="relative w-20 h-20 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shrink-0 flex items-center justify-center">
              {photoData ? (
                <img src={photoData} alt="Visitor" className="w-full h-full object-cover" />
              ) : cameraActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate-500" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-200">Security Photo for Badge</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Required for building badge security verification</p>

              <div className="flex items-center gap-2 mt-2">
                {!cameraActive && !photoData && (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Take Photo
                  </button>
                )}

                {cameraActive && (
                  <button
                    type="button"
                    onClick={takeSnapshot}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm animate-pulse"
                  >
                    Capture
                  </button>
                )}

                {photoData && (
                  <button
                    type="button"
                    onClick={() => { setPhotoData(null); startCamera(); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retake
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexander Reed"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Organization / Company
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Apex Global Dynamics"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
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
                  placeholder="a.reed@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Host / Employee Meeting With <span className="text-cyan-400">*</span>
              </label>
              <select
                value={formData.hostId}
                onChange={(e) => setFormData({ ...formData, hostId: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-cyan-500 transition"
              >
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} — {staff.department} ({staff.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Purpose of Visit
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. Q4 Executive Review / Interview / Delivery"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-600/30 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Processing Check-In...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  Complete Check-In & Issue Badge
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
