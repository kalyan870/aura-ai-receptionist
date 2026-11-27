import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { authenticateToken, authorizeRoles, optionalAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const createStaffSchema = z.object({
  name: z.string().min(2).max(120),
  title: z.string().min(2).max(120),
  department: z.string().min(2).max(120),
  email: z.string().email().max(255),
  phone: z.string().max(40).optional().default(''),
  room: z.string().min(2).max(120),
  status: z.enum(['Available', 'In Meeting', 'Out of Office']).optional().default('Available'),
  avatar: z.string().url().max(500).optional().nullable()
});

const updateStaffSchema = createStaffSchema.partial();

const statusSchema = z.object({
  status: z.enum(['Available', 'In Meeting', 'Out of Office'])
});

export function createStaffRouter(db) {
  const router = Router();

  // GET /api/staff (Public directory fields; authenticated users also see contact details)
  router.get('/', optionalAuth(db), async (req, res) => {
    const list = await db.listStaff();
    if (req.user) {
      return res.json(list);
    }
    const publicList = list.map(({ id, name, title, department, room, status, avatar }) => ({
      id,
      name,
      title,
      department,
      room,
      status,
      avatar
    }));
    res.json(publicList);
  });

  // POST /api/staff (Admin only)
  router.post('/', authenticateToken(db), authorizeRoles('admin'), validateBody(createStaffSchema), async (req, res) => {
    const member = await db.createStaff({
      id: `st-${crypto.randomUUID().slice(0, 6)}`,
      ...req.body
    });
    await db.createAuditLog({
      id: `AUD-${crypto.randomUUID().slice(0, 8)}`,
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'STAFF_CREATED',
      resource: `staff/${member.id}`,
      ipAddress: req.ip
    });
    res.status(201).json(member);
  });

  // PATCH /api/staff/:id (Admin only)
  router.patch('/:id', authenticateToken(db), authorizeRoles('admin'), validateBody(updateStaffSchema), async (req, res) => {
    const updated = await db.updateStaff(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Staff member not found' });
    res.json(updated);
  });

  // PATCH /api/staff/:id/status (Admin, Security, or Staff updating own status)
  router.patch('/:id/status', authenticateToken(db), authorizeRoles('admin', 'staff', 'security'), validateBody(statusSchema), async (req, res) => {
    if (req.user.role === 'staff' && req.user.staffId && req.user.staffId !== req.params.id) {
      return res.status(403).json({ error: 'Forbidden. Staff can only update their own availability status.' });
    }
    const updated = await db.updateStaff(req.params.id, { status: req.body.status });
    if (!updated) return res.status(404).json({ error: 'Staff member not found' });

    await db.createAuditLog({
      id: `AUD-${crypto.randomUUID().slice(0, 8)}`,
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'STAFF_STATUS_UPDATED',
      resource: `staff/${req.params.id}`,
      details: { status: req.body.status },
      ipAddress: req.ip
    });

    res.json({ success: true, staff: updated });
  });

  // DELETE /api/staff/:id (Admin only)
  router.delete('/:id', authenticateToken(db), authorizeRoles('admin'), async (req, res) => {
    const deleted = await db.deleteStaff(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Staff member not found' });
    res.json({ success: true });
  });

  return router;
}
