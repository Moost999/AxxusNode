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

// Middleware de autenticação
import { authenticate } from './middleware/auth';

const app: Application = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// 1️⃣ Configuração CORS Dinâmica
const allowedOrigins = [
  'https://axxus-front.vercel.app',
  'https://axxus-front-git-main-axxus.vercel.app',
  'http://localhost:3000',
  'http://192.168.0.2:3000'
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie', 'Authorization', 'Content-Disposition'],
};

// 2️⃣ Aplica CORS antes de outros middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilita preflight para todas as rotas

// 3️⃣ Middlewares Essenciais
app.use(cookieParser()); // Para parsear cookies - IMPORTANTE: coloque antes do express.json()
app.use(express.json({ limit: '10mb' })); // Para parsear JSON no corpo das requisições
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Para parsear URL-encoded bodies

// 4️⃣ Middleware para adicionar headers de segurança
app.use((req: Request, res: Response, next: NextFunction) => {
  // Configurar headers de resposta padrão
  res.setHeader('Content-Type', 'application/json');
  
  // Headers de segurança adicionais em produção
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
  }
  
  next();
});

// 5️⃣ Rotas Públicas (sem autenticação)
app.use('/api/auth', authRoutes);

// Endpoint para verificar se o servidor está rodando
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// 6️⃣ Middleware de Autenticação (protege as rotas abaixo)
app.use('/api', authenticate);

// 7️⃣ Rotas Protegidas (requerem autenticação)
app.use('/api/assistants', assistantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/protected', protectRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/notifications', notificationRoute);
app.use('/api/ads', adRoutes);

// 8️⃣ Rota 404 (para endpoints não encontrados)
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// 9️⃣ Tratamento de Erros Global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Erro global:', err);
  console.error(err.stack); // Log do erro no console
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: isProduction ? 'Something went wrong!' : (err.message || 'Unknown error')
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
});