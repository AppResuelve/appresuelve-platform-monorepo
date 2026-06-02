import express from 'express';
import cors from 'cors';
import clientsRouter from './routes/clients.js';
import onboardingRouter from './routes/onboarding.js';
import documentsRouter from './routes/documents.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

app.use('/api/clients', clientsRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Onboarding API running on http://localhost:${PORT}`);
});
