import app, { ensureMongoConnected } from '../server.ts';

export default async function handler(req: any, res: any) {
  await ensureMongoConnected();
  return app(req, res);
}
