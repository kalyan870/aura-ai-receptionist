import { config } from './config/env.js';
import { createDatabase } from './db/index.js';
import { createApp } from './app.js';

async function startServer() {
  const db = await createDatabase();
  const app = createApp(db);

  app.listen(config.port, () => {
    console.log(`[AURA AI Receptionist] Backend server running on http://localhost:${config.port} (DB: ${db.mode})`);
  });
}

startServer().catch((err) => {
  console.error('[AURA AI Receptionist] Failed to start server:', err.message);
  process.exit(1);
});
