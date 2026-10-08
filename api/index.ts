import { app, initDb } from '../server/app.js';

export default async function handler(req: any, res: any) {
  try {
    await initDb();
    return app(req, res);
  } catch (err: any) {
    console.error('Vercel API error:', err);
    res.status(500).json({ error: 'Internal server error in API handler' });
  }
}
