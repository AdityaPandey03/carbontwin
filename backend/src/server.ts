import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db';
import routes from './routes';
import { seedIfEmpty } from './scripts/seedHelper';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.set('trust proxy', 1); // Render / Vercel sit behind proxies
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Basic anti-abuse: 300 req/min per IP, except /health
app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }),
);

app.get('/health', (_req, res) =>
  res.json({ ok: true, service: 'carbon-twin-backend', ts: new Date().toISOString() }),
);

app.use('/api', routes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message ?? 'internal error' });
});

const start = async () => {
  const uri = await connectDB();
  console.log(`✅ MongoDB connected: ${uri}`);
  await seedIfEmpty();
  app.listen(PORT, () => {
    console.log(`🚀 Carbon Twin API listening on http://localhost:${PORT}`);
  });
};

start().catch((e) => {
  console.error('Fatal startup error:', e);
  process.exit(1);
});
