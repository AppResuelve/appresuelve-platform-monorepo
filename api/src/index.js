import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/database.js';
import routes from './routes/index.js';

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

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
  });
}

const scriptPath = process.argv[1] && path.resolve(process.argv[1]);
const isMainModule = scriptPath === fileURLToPath(import.meta.url);
if (isMainModule) {
  start();
}

export default app;
