import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Importe suas rotas
import assistantRoutes from './routes/assistantRoutes';
import userRoutes from './routes/userRoutes';
import whatsappRoutes from './routes/whatsappRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import authRoutes from './routes/authRoutes';
import settingRoutes from './routes/settingRoutes';
import protectRoutes from './routes/protectRoutes';
import notificationRoute from './routes/notificationRoute';
import adRoutes from './routes/adRoutes';

// Middleware de autenticação
import { authenticate } from './middleware/auth';

const app: Application = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// ==================== CORS CONFIGURATION ====================
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://axxusai.vercel.app';

const corsOptions = {
  origin: [FRONTEND_URL],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Cookie"],
  optionsSuccessStatus: 200,
};

// ==================== MIDDLEWARE ORDER ====================
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== SECURITY HEADERS ====================
app.use((req: Request, res: Response, next: NextFunction) => {
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }

  // Tratar requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
     res.status(200).end();
     return
  }

  // Logging em desenvolvimento
  if (!isProduction) {
    console.log(`${req.method} ${req.url}`);
  }

  next();
});

// ==================== PUBLIC ROUTES ====================
app.use('/api/auth', authRoutes);

// Endpoint de saúde
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV,
    message: 'API running on Render' 
  });
});

// ==================== PROTECTED ROUTES ====================
app.use('/api', authenticate);
app.use('/api/assistants', assistantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/protected', protectRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/notifications', notificationRoute);
app.use('/api/ads', adRoutes);

// ==================== 404 HANDLER ====================
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ==================== GLOBAL ERROR HANDLER ====================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global Error:', err.message);
  console.error(err.stack);

  res.status(500).json({
    error: 'Internal Server Error',
    message: isProduction ? 'Something went wrong!' : err.message,
  });
});

// Capturar exceções não tratadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (${isProduction ? 'production' : 'development'} mode)`);
});