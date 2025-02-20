import express, { Application, Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
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
const PORT: string | number = process.env.PORT || 3001;

// Define as origens permitidas usando suas variáveis de ambiente
const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigin = process.env.NODE_ENV === 'production'
      ? process.env.VERCEL_URL_FRONT // Sua variável original do frontend
      : 'http://localhost:3000';

    // Se não houver origin (como em requisições do Postman ou mobile apps)
    // ou se o origin corresponder ao permitido
    if (!origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
};

// Aplicar middleware CORS
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Middleware para garantir que os headers CORS sejam sempre enviados
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigin = process.env.NODE_ENV === 'production'
    ? process.env.VERCEL_URL_FRONT
    : 'http://localhost:3000';

  if (origin && origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
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