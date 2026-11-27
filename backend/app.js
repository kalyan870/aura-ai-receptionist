import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { config } from './config/env.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import { validateBody } from './middleware/validate.js';
import { processAiQuery } from './utils/aiEngine.js';
import { createAuthRouter } from './routes/auth.js';
import { createStaffRouter } from './routes/staff.js';
import { createVisitorsRouter } from './routes/visitors.js';
import { createAppointmentsRouter } from './routes/appointments.js';
import { createNotificationsRouter } from './routes/notifications.js';
import { createFaqsRouter } from './routes/faqs.js';
import { createAdminRouter } from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chatSchema = z.object({
  message: z.string().max(1000).optional().default('')
});

export function createApp(db, options = {}) {
  const app = express();

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false // Allow inline fonts/canvas for kiosk UI
  }));

  // Strict CORS (allows configured origins + deployed Vercel/Netlify/Cloudflare/GitHub Pages domains)
  app.use(cors({
    origin(origin, callback) {
      if (
        !origin ||
        config.allowedOrigins.includes(origin) ||
        (process.env.VERCEL_URL && origin === `https://${process.env.VERCEL_URL}`) ||
        /^https:\/\/[a-z0-9-]+\.(vercel\.app|netlify\.app|pages\.dev|github\.io)$/i.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }));

  app.use(express.json({ limit: '3mb' }));

  // Global API rate limiter
  app.use('/api', createRateLimiter({
    windowMs: 60_000,
    max: options.apiRateLimitMax ?? 200
  }));

  // Serve static frontend build if present
  const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
  if (fs.existsSync(FRONTEND_DIST)) {
    app.use(express.static(FRONTEND_DIST));
  }

  // Health Check (no secrets or private data)
  app.get('/api/status', async (req, res) => {
    const [staff, visitors, appointments] = await Promise.all([
      db.listStaff(),
      db.listVisitors(),
      db.listAppointments()
    ]);

    res.json({
      status: 'online',
      system: 'AURA AI Receptionist OS',
      version: '2.5.0',
      database: db.mode,
      timestamp: new Date().toISOString(),
      stats: {
        staffCount: staff.length,
        activeVisitors: visitors.filter(v => v.status === 'Checked In').length,
        appointmentsToday: appointments.length
      }
    });
  });

  // Conversational AI endpoint (public kiosk)
  app.post('/api/chat', validateBody(chatSchema), async (req, res) => {
    const [staff, faqs] = await Promise.all([db.listStaff(), db.listFaqs()]);
    const response = processAiQuery(req.body.message, staff, faqs);
    res.json({
      reply: response.text,
      intent: response.intent,
      action: response.action || null,
      staff: response.staff || null,
      suggestions: response.suggestions || []
    });
  });

  // Domain Routers
  app.use('/api/auth', createAuthRouter(db, options));
  app.use('/api/staff', createStaffRouter(db));
  app.use('/api/visitors', createVisitorsRouter(db));
  app.use('/api/appointments', createAppointmentsRouter(db));
  app.use('/api/notifications', createNotificationsRouter(db));
  app.use('/api/faqs', createFaqsRouter(db));
  app.use('/api', createAdminRouter(db));

  // Unknown API routes return 404 JSON
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // Catch-all route to serve SPA frontend
  app.get('*', (req, res) => {
    const indexHtml = path.join(FRONTEND_DIST, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.sendFile(indexHtml);
    } else {
      res.json({ message: 'AURA AI Receptionist Backend API Active.' });
    }
  });

  // Centralized Error Handler (no stack traces leaked in production)
  app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
      return res.status(403).json({ error: 'CORS policy: Origin not allowed.' });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Malformed JSON payload.' });
    }
    console.error('[Server Error]', err.message);
    res.status(err.status || 500).json({
      error: config.isProd ? 'Internal server error' : (err.message || 'Internal server error')
    });
  });

  return app;
}
