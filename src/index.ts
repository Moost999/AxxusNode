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
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', "Accept"],
  optionsSuccessStatus: 200,
  exposedHeaders: ["Set-Cookie"],
};

// 2️⃣ Aplica CORS antes de outros middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilita preflight para todas as rotas

// 3️⃣ Middlewares Essenciais
app.use(express.json()); // Para parsear JSON no corpo das requisições
app.use(cookieParser()); // Para parsear cookies
app.use(express.urlencoded({ extended: true })); // Para parsear URL-encoded bodies

// 4️⃣ Middleware para Forçar JSON Responses
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// 5️⃣ Rotas Públicas (sem autenticação)
app.use('/api/auth', authRoutes);

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
  console.error(err.stack); // Log do erro no console
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong!'
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});