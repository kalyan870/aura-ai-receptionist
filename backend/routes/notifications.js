import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const respondSchema = z.object({
  reply: z.string().min(1, 'Reply message is required').max(500)
});

export function createNotificationsRouter(db) {
  const router = Router();

  // GET /api/notifications (Protected: admin, staff, security)
  router.get('/', authenticateToken(db), authorizeRoles('admin', 'staff', 'security'), async (req, res) => {
    const list = await db.listNotifications();
    res.json(list);
  });

  // POST /api/notifications/:id/respond (Protected: admin, staff)
  router.post('/:id/respond', authenticateToken(db), authorizeRoles('admin', 'staff'), validateBody(respondSchema), async (req, res) => {
    const notif = await db.respondToNotification(req.params.id, req.body.reply);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true, notification: notif });
  });

  return router;
}
