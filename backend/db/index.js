import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';
import { NeonAdapter } from './neonAdapter.js';
import { LocalAdapter } from './localAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createDatabase(options = {}) {
  const seedPath = path.join(__dirname, '..', 'data', 'initialData.json');
  const seedData = fs.existsSync(seedPath)
    ? JSON.parse(fs.readFileSync(seedPath, 'utf-8'))
    : { staff: [], faqs: [] };

  const dbUrl = options.databaseUrl ?? config.databaseUrl;
  const dbFile = options.dbFile ?? (process.env.VERCEL ? ':memory:' : path.join(__dirname, '..', 'data', 'db.json'));

  const adapter = dbUrl
    ? new NeonAdapter(dbUrl)
    : new LocalAdapter(dbFile);

  await adapter.init(seedData, {
    email: options.seedAdminEmail ?? config.seedAdminEmail,
    password: options.seedAdminPassword ?? config.seedAdminPassword
  });

  return adapter;
}
