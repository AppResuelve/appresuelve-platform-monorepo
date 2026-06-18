import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/database.js';
import routes from './routes/index.js';
import { runBillingCron } from './services/billingCron.js';

const app = express();

const PRODUCTION_ORIGINS = [
  'https://admin.appresuelve.site',
  'https://onboarding.appresuelve.site',
];

const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = isProduction
  ? PRODUCTION_ORIGINS
  : (process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://admin.localhost:5173',
    'http://onboarding.localhost:5173',
  ]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);
app.use(morgan('dev'));
app.use(express.json());

app.use('/api', routes);

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`Onboarding API running on http://localhost:${PORT}`);

    cron.schedule('0 0 * * *', () => {
      console.log('[billing-cron] Running...');
      runBillingCron().catch(console.error);
    });
    console.log('[billing-cron] Scheduled: daily at midnight');
  });
}

const scriptPath = process.argv[1] && path.resolve(process.argv[1]);
const isMainModule = scriptPath === fileURLToPath(import.meta.url);
if (isMainModule) {
  start();
}

export default app;
