import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const bookAppointmentSchema = z.object({
  visitorName: z.string().min(2, 'Visitor name is required').max(120),
  visitorEmail: z.union([z.string().email().max(255), z.literal('')]).optional().default(''),
  visitorCompany: z.string().max(120).optional().default('Guest'),
  hostId: z.string().min(1, 'Host ID is required').max(64),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timeSlot: z.string().min(3).max(32),
  purpose: z.string().max(255).optional().default('Discussion')
});

export function createAppointmentsRouter(db) {
  const router = Router();

  // GET /api/appointments (Protected: admin, staff, security)
  router.get('/', authenticateToken(db), authorizeRoles('admin', 'staff', 'security'), async (req, res) => {
    const list = await db.listAppointments();
    res.json(list);
  });

  // POST /api/appointments/book (Public Kiosk Booking)
  router.post('/book', validateBody(bookAppointmentSchema), async (req, res) => {
    const { visitorName, visitorEmail, visitorCompany, hostId, date, timeSlot, purpose } = req.body;
    const host = await db.getStaffById(hostId);
    if (!host) {
      return res.status(404).json({ error: 'Selected host employee does not exist.' });
    }

    const conflict = await db.findConfirmedAppointmentConflict(hostId, date, timeSlot);
    if (conflict) {
      return res.status(409).json({
        error: 'This time slot is already booked for this host. Please pick another slot.'
      });
    }

    const appointment = await db.createAppointment({
      id: `APT-${crypto.randomInt(1000, 9999)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      visitorName,
      visitorEmail: visitorEmail || '',
      visitorCompany: visitorCompany || 'Guest',
      hostId,
      hostName: host.name,
      date,
      timeSlot,
      purpose: purpose || 'Discussion',
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, appointment });
  });

  // POST /api/appointments/:id/cancel (Protected: admin, staff)
  router.post('/:id/cancel', authenticateToken(db), authorizeRoles('admin', 'staff'), async (req, res) => {
    const appt = await db.updateAppointmentStatus(req.params.id, 'Cancelled');
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ success: true, appointment: appt });
  });

  // DELETE /api/appointments/:id (Admin only)
  router.delete('/:id', authenticateToken(db), authorizeRoles('admin'), async (req, res) => {
    const deleted = await db.deleteAppointment(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ success: true });
  });

  return router;
}
