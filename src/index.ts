import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import assistantRoutes from './routes/assistantRoutes';
import userRoutes from './routes/userRoutes';
import whatsappRoutes from './routes/whatsappRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import authRoutes from './routes/authRoutes';
import setingRoutes from './routes/settingRoutes';
import protectRoutes from './routes/protectRoutes';
import { authenticate } from './middleware/auth';
import cookieParser from 'cookie-parser';
import notificationRoute from './routes/notificationRoute';
import adRoutes from './routes/adRoutes';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Configuração CORS simplificada
const allowedOrigins = [
  'https://axxus-front.vercel.app',
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Permitir requests sem origin (como mobile apps, postman, etc)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Aplicar middlewares na ordem correta
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', authenticate);
app.use('/api/assistants', assistantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/protected', protectRoutes);
app.use('/api/settings', setingRoutes);
app.use('/api/notifications', notificationRoute);
app.use('/api/ads', adRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});