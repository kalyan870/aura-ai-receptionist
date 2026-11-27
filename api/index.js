import { createDatabase } from '../backend/db/index.js';
import { createApp } from '../backend/app.js';

let appPromise = null;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const db = await createDatabase({
        dbFile: process.env.VERCEL ? ':memory:' : undefined
      });
      return createApp(db);
    })();
  }
  return appPromise;
}

export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}
