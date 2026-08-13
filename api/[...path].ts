import app, { ensureMongoConnected } from '../server.js';

export default async function handler(req: any, res: any) {
  try {
    await ensureMongoConnected();
  } catch (err) {
    console.warn('[Vercel Handler] Mongo init warning:', err);
  }

  try {
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Handler] Express handler error:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'SERVERLESS_FUNCTION_ERROR',
        message: err?.message || 'A server error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }
}

