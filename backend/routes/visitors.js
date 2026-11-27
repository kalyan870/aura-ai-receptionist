import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const checkInSchema = z.object({
  name: z.string().min(2, 'Visitor name must be at least 2 characters').max(120),
  company: z.string().max(120).optional().default('Individual Guest'),
  email: z.union([z.string().email().max(255), z.literal('')]).optional().default(''),
  hostId: z.string().min(1, 'Host selection is required').max(64),
  purpose: z.string().max(255).optional().default('General Meeting'),
  photo: z.string()
    .refine(val => val.startsWith('data:image/jpeg;base64,') || val.startsWith('data:image/png;base64,'), {
      message: 'Photo must be a valid JPEG or PNG base64 data URL'
    })
    .refine(val => val.length <= 2_000_000, {
      message: 'Photo exceeds maximum allowed size (2MB)'
    })
    .optional()
    .nullable()
});

export function createVisitorsRouter(db) {
  const router = Router();

  // GET /api/visitors (Protected: admin, security, staff)
  router.get('/', authenticateToken(db), authorizeRoles('admin', 'security', 'staff'), async (req, res) => {
    const visitors = await db.listVisitors();
    res.json(visitors);
  });

  // POST /api/visitors/checkin (Public Kiosk Self Check-In)
  router.post('/checkin', validateBody(checkInSchema), async (req, res) => {
    const { name, company, email, hostId, purpose, photo } = req.body;
    const host = await db.getStaffById(hostId);
    if (!host) {
      return res.status(404).json({ error: 'Selected host employee does not exist.' });
    }

    const randomNum = crypto.randomInt(1000, 9999);
    const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();

    const visitor = await db.createVisitor({
      id: `VIS-${randomNum}-${suffix}`,
      name,
      company: company || 'Individual Guest',
      email: email || '',
      hostId,
      hostName: host.name,
      purpose: purpose || 'General Meeting',
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      status: 'Checked In',
      badgeCode: `AURA-${randomNum}-${suffix}`,
      photo: photo || null
    });

    const notification = await db.createNotification({
      id: `NOTIF-${crypto.randomUUID().slice(0, 8)}`,
      visitorId: visitor.id,
      visitorName: visitor.name,
      hostId,
      hostName: host.name,
      message: `Visitor ${visitor.name} (${visitor.company}) has checked in to meet you regarding "${visitor.purpose}".`,
      timestamp: new Date().toISOString(),
      status: 'Delivered',
      hostReply: null
    });

    res.status(201).json({ success: true, visitor, notification });
  });

  // POST /api/visitors/:id/checkout (Protected: admin, security, staff)
  router.post('/:id/checkout', authenticateToken(db), authorizeRoles('admin', 'security', 'staff'), async (req, res) => {
    const visitor = await db.checkOutVisitor(req.params.id);
    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    await db.createAuditLog({
      id: `AUD-${crypto.randomUUID().slice(0, 8)}`,
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'VISITOR_CHECKOUT',
      resource: `visitors/${visitor.id}`,
      ipAddress: req.ip
    });

    res.json({ success: true, visitor });
  });

  // DELETE /api/visitors/:id (Admin only)
  router.delete('/:id', authenticateToken(db), authorizeRoles('admin'), async (req, res) => {
    const deleted = await db.deleteVisitor(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Visitor not found' });
    }
    res.json({ success: true });
  });

  return router;
}
