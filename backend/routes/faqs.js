import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const faqSchema = z.object({
  keywords: z.array(z.string().min(1).max(40)).min(1),
  question: z.string().min(5).max(255),
  answer: z.string().min(5).max(1000)
});

export function createFaqsRouter(db) {
  const router = Router();

  // GET /api/faqs (Public)
  router.get('/', async (req, res) => {
    const faqs = await db.listFaqs();
    res.json(faqs);
  });

  // POST /api/faqs (Admin only)
  router.post('/', authenticateToken(db), authorizeRoles('admin'), validateBody(faqSchema), async (req, res) => {
    const faq = await db.createFaq({
      id: `faq-${crypto.randomUUID().slice(0, 6)}`,
      ...req.body
    });
    res.status(201).json(faq);
  });

  // PATCH /api/faqs/:id (Admin only)
  router.patch('/:id', authenticateToken(db), authorizeRoles('admin'), validateBody(faqSchema.partial()), async (req, res) => {
    const updated = await db.updateFaq(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'FAQ not found' });
    res.json(updated);
  });

  // DELETE /api/faqs/:id (Admin only)
  router.delete('/:id', authenticateToken(db), authorizeRoles('admin'), async (req, res) => {
    const deleted = await db.deleteFaq(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'FAQ not found' });
    res.json({ success: true });
  });

  return router;
}
