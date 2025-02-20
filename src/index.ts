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

// Simplified CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.VERCEL_URL_FRONT
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
};

// Apply middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Routes
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
  console.log('CORS configured for:', corsOptions.origin);
});