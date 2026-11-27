import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

export function createAdminRouter(db) {
  const router = Router();

  // GET /api/analytics (Protected: admin, security)
  router.get('/analytics', authenticateToken(db), authorizeRoles('admin', 'security'), async (req, res) => {
    const [visitors, appointments, notifications] = await Promise.all([
      db.listVisitors(),
      db.listAppointments(),
      db.listNotifications()
    ]);

    res.json({
      totalVisitorsToday: visitors.length,
      activeVisitors: visitors.filter(v => v.status === 'Checked In').length,
      checkedOutVisitors: visitors.filter(v => v.status === 'Checked Out').length,
      totalAppointments: appointments.length,
      pendingNotifications: notifications.filter(n => !n.hostReply).length,
      systemUptime: '99.98%',
      peakHour: '10:00 AM - 11:30 AM',
      databaseMode: db.mode
    });
  });

  // GET /api/audit-logs (Protected: admin only)
  router.get('/audit-logs', authenticateToken(db), authorizeRoles('admin'), async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const logs = await db.listAuditLogs(limit);
    res.json(logs);
  });

  return router;
}
