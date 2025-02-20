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

// Lista de origens permitidas (substitua pelo seu domínio de frontend)
const allowedOrigins = [
  'https://axxus-front.vercel.app',
];

// Configuração do CORS
const corsOptions = {
  origin: allowedOrigins,
  credentials: true, // Permite envio de cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Aplicar CORS antes de qualquer rota
app.use(cors(corsOptions));

// Middleware global para garantir que os headers CORS sejam enviados corretamente
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  next();
});

// Middleware para permitir respostas automáticas para OPTIONS
app.options('*', cors(corsOptions));

// Outros Middlewares
app.use(express.json());
app.use(cookieParser());

// Rotas Públicas (sem autenticação)
app.use('/api/auth', authRoutes);

// Middleware de autenticação para rotas protegidas
app.use('/api', authenticate);

// Rotas Protegidas
app.use('/api/assistants', assistantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/protected', protectRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/notifications', notificationRoute);
app.use('/api/ads', adRoutes);

// Middleware de tratamento de erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
