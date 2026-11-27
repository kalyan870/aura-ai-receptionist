import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Bell, Shield, Lock, LogOut, Printer, Search, RefreshCw, Send, CheckCheck, FileText, AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboard({ onReprintBadge, onBackToKiosk }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('visitors'); // 'visitors' | 'appointments' | 'notifications' | 'staff' | 'muster'
  const [visitors, setVisitors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [staff, setStaff] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [vData, aData, nData, sData, anData] = await Promise.all([
        api.getVisitors(),
        api.getAppointments(),
        api.getNotifications(),
        api.getStaff(),
        api.getAnalytics().catch(() => null)
      ]);
      setVisitors(vData);
      setAppointments(aData);
      setNotifications(nData);
      setStaff(sData);
      setAnalytics(anData);
    } catch (err) {
      if (err.status === 401) {
        api.logout();
        setUser(null);
      }
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setAuthChecked(true);
      return;
    }
    api.getMe()
      .then((res) => {
        setUser(res.user);
        setAuthChecked(true);
        loadData();
      })
      .catch(() => {
        api.logout();
        setAuthChecked(true);
      });
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = authMode === 'login'
        ? await api.login(authForm.email, authForm.password)
        : await api.register({
            email: authForm.email,
            password: authForm.password,
            fullName: authForm.fullName
          });
      setUser(res.user);
      loadData();
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    api.logout();
    setUser(null);
  };

  const handleCheckOut = async (id) => {
    try {
      await api.checkOutVisitor(id);
      loadData();
    } catch (err) {
      alert('Failed to check out visitor: ' + err.message);
    }
  };

  const handleStaffStatusToggle = async (staffMember) => {
    const nextStatus = 
      staffMember.status === 'Available' ? 'In Meeting' :
      staffMember.status === 'In Meeting' ? 'Out of Office' : 'Available';

    try {
      await api.updateStaffStatus(staffMember.id, nextStatus);
      loadData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSendReply = async (notifId) => {
    const text = replyText[notifId];
    if (!text || !text.trim()) return;

    try {
      await api.respondToNotification(notifId, text.trim());
      setReplyText({ ...replyText, [notifId]: '' });
      loadData();
    } catch (err) {
      alert('Failed to send reply');
    }
  };

  const filteredVisitors = visitors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.badgeCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#080C14] flex items-center justify-center text-slate-400 text-sm">
        Verifying security session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080C14] text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md glass-panel rounded-3xl border border-slate-800 p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Staff &amp; Security Portal</h2>
                <p className="text-xs text-slate-400">
                  {authMode === 'login' ? 'Sign in to manage visitors & alerts' : 'Bootstrap initial administrator account'}
                </p>
              </div>
            </div>
            <button
              onClick={onBackToKiosk}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Kiosk
            </button>
          </div>

          {authError && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-300 border border-red-500/30 rounded-xl bg-red-950/40">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="System Administrator"
                  value={authForm.fullName}
                  onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
              <input
                type="email"
                required
                placeholder="admin@aura-tech.corp"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition shadow-lg shadow-cyan-600/25 disabled:opacity-50"
            >
              {authLoading ? 'Authenticating...' : authMode === 'login' ? 'Sign In' : 'Create Initial Admin'}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => { setAuthError(''); setAuthMode(authMode === 'login' ? 'register' : 'login'); }}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              {authMode === 'login' ? 'First time setup? Create initial admin account' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="px-6 py-4 glass-panel border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-cyan-600/30">
            A
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">AURA Administration &amp; Security Portal</h1>
            <p className="text-[11px] text-slate-400">
              Signed in as <span className="text-cyan-400 font-semibold">{user.fullName}</span> ({user.role.toUpperCase()})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSignOut}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Sign Out
          </button>
          <button
            onClick={onBackToKiosk}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-lg shadow-cyan-600/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            Switch to Public Kiosk Mode
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl glass-card border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Visitors Today</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-white">{analytics?.totalVisitorsToday || visitors.length}</span>
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active On-Site Guests</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-emerald-400">
                {visitors.filter(v => v.status === 'Checked In').length}
              </span>
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Appointments Scheduled</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-purple-400">{appointments.length}</span>
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Host Arrival Alerts</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-amber-400">
                {notifications.filter(n => !n.hostReply).length}
              </span>
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'visitors', label: 'Visitor Logs & Badge Center', icon: Users, badge: visitors.filter(v => v.status === 'Checked In').length },
            { id: 'notifications', label: 'Host Notification Center', icon: Bell, badge: notifications.filter(n => !n.hostReply).length },
            { id: 'appointments', label: 'Appointment Calendar', icon: Calendar, badge: appointments.length },
            { id: 'staff', label: 'Staff Directory & Availability', icon: Shield, badge: staff.length },
            { id: 'muster', label: 'Emergency Evacuation Muster Roll', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-600 text-white font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: VISITOR LOGS */}
        {activeTab === 'visitors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by visitor name, company, host, or badge code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <span className="text-xs text-slate-400">
                Showing {filteredVisitors.length} of {visitors.length} visitors
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Visitor Name & Photo</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Host Assigned</th>
                    <th className="px-4 py-3">Check-In Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredVisitors.map(v => (
                    <tr key={v.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-white text-xs">
                          {v.photo ? (
                            <img src={v.photo} alt={v.name} className="w-full h-full object-cover" />
                          ) : (
                            v.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white">{v.name}</div>
                          <div className="font-mono text-[10px] text-cyan-400">{v.badgeCode}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{v.company}</td>
                      <td className="px-4 py-3 font-semibold text-slate-200">{v.hostName}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === 'Checked In'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {v.status === 'Checked In' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                          {v.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => onReprintBadge(v)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                          title="View / Re-print Badge"
                        >
                          Badge
                        </button>
                        {v.status === 'Checked In' && (
                          <button
                            onClick={() => handleCheckOut(v.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition"
                          >
                            Check Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredVisitors.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No visitors match your search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: HOST NOTIFICATION CENTER */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              When a visitor checks in at the reception kiosk, host employees receive instant notifications. Hosts can reply directly with instructions.
            </p>

            <div className="space-y-3">
              {notifications.map(notif => (
                <div key={notif.id} className="p-4 rounded-2xl glass-card border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Host Alert for <span className="text-cyan-400">{notif.hostName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{notif.message}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(notif.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Host Response Section */}
                  {notif.hostReply ? (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs flex items-start gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-300">Host Reply: </span>
                        <span className="text-emerald-100">{notif.hostReply}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <input
                        type="text"
                        placeholder="Type quick reply as host (e.g. 'Coming down now', 'Direct to Room 302')..."
                        value={replyText[notif.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [notif.id]: e.target.value })}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={() => handleSendReply(notif.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
                      >
                        <Send className="w-3 h-3" />
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Reference #</th>
                    <th className="px-4 py-3">Visitor Name</th>
                    <th className="px-4 py-3">Host Meeting With</th>
                    <th className="px-4 py-3">Date & Slot</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {appointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400">{apt.id}</td>
                      <td className="px-4 py-3 font-semibold text-white">{apt.visitorName}</td>
                      <td className="px-4 py-3 text-slate-200">{apt.hostName}</td>
                      <td className="px-4 py-3 text-purple-300 font-semibold">{apt.date} at {apt.timeSlot}</td>
                      <td className="px-4 py-3 text-slate-400">{apt.purpose}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: STAFF AVAILABILITY */}
        {activeTab === 'staff' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Update staff status so the AI Receptionist can accurately inform visitors if an employee is available, in a meeting, or out of office.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map(member => (
                <div key={member.id} className="p-4 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{member.name}</h3>
                      <p className="text-xs text-cyan-400">{member.title}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{member.room}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      member.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      member.status === 'In Meeting' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {member.status}
                    </span>
                    <button
                      onClick={() => handleStaffStatusToggle(member)}
                      className="text-xs text-slate-300 hover:text-white font-semibold underline decoration-slate-600 hover:decoration-cyan-400"
                    >
                      Change Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MUSTER ROLL */}
        {activeTab === 'muster' && (
          <div className="p-6 rounded-2xl glass-card border border-red-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Emergency On-Site Muster Headcount</h3>
                <p className="text-xs text-slate-400">All registered visitors and staff currently logged inside the building</p>
              </div>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition shadow-lg shadow-red-600/30"
              >
                <Printer className="w-4 h-4" />
                Print Muster List
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-2.5">Badge / ID</th>
                    <th className="px-4 py-2.5">Person Name</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Host / Department</th>
                    <th className="px-4 py-2.5">Location / Floor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {visitors.filter(v => v.status === 'Checked In').map(v => (
                    <tr key={v.id} className="bg-slate-900/40">
                      <td className="px-4 py-2 font-mono text-cyan-400">{v.badgeCode}</td>
                      <td className="px-4 py-2 text-white font-bold">{v.name} ({v.company})</td>
                      <td className="px-4 py-2 text-emerald-400 font-semibold">Visitor</td>
                      <td className="px-4 py-2">{v.hostName}</td>
                      <td className="px-4 py-2 text-slate-400">Escorted On-Site</td>
                    </tr>
                  ))}
                  {staff.filter(s => s.status !== 'Out of Office').map(s => (
                    <tr key={s.id} className="bg-slate-900/20">
                      <td className="px-4 py-2 font-mono text-purple-400">{s.id}</td>
                      <td className="px-4 py-2 text-white font-bold">{s.name}</td>
                      <td className="px-4 py-2 text-purple-300 font-semibold">Staff Employee</td>
                      <td className="px-4 py-2">{s.department}</td>
                      <td className="px-4 py-2 text-slate-400">{s.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
