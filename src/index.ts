import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import assistantRoutes from './routes/assistantRoutes';
import userRoutes from './routes/userRoutes';
import whatsappRoutes from './routes/whatsappRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import authRoutes from './routes/authRoutes';
import settingRoutes from './routes/settingRoutes';
import protectRoutes from './routes/protectRoutes';
import notificationRoute from './routes/notificationRoute';
import adRoutes from './routes/adRoutes';

import { authenticate } from './middleware/auth';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Atualize a configuração CORS
const allowedOrigins = [
  'https://axxus-front.vercel.app',
  'https://axxus-front-git-main-axxus.vercel.app',];

const corsOptions = {
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 204
};

// Middleware CORS deve vir primeiro
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilitar preflight para todas as rotas

// Middleware manual para headers
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.header('Vary', 'Origin');
  
  next();
});

// 3️⃣ **Habilitar JSON e Cookies**
app.use(express.json());
app.use(cookieParser());

// 4️⃣ **Rotas Públicas SEM Autenticação**
app.use('/api/auth', authRoutes);

// 5️⃣ **Middleware de autenticação para proteger as próximas rotas**
app.use('/api', authenticate);

// 6️⃣ **Rotas Protegidas**
app.use('/api/assistants', assistantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/protected', protectRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/notifications', notificationRoute);
app.use('/api/ads', adRoutes);

// 7️⃣ **Middleware Global de Erros (Deixa no final)**
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});