import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Rotas
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
const isProduction = process.env.NODE_ENV === 'production'; // Variável para verificar o ambiente

// ==================== CORS CONFIGURATION ====================
const allowedOrigins = [
  'https://axxus-front.vercel.app',
  'https://axxus-front-git-main-axxus.vercel.app',
  'http://localhost:3000',
  'https://axxus.netlify.app',
  'http://192.168.0.2:3000'
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Log de depuração para verificar origens
    console.log(`[CORS] Origin received: ${origin} | Environment: ${process.env.NODE_ENV}`);

    // Permitir todas origens em desenvolvimento
    if (!isProduction) {
      callback(null, true);
      return;
    }
    // Verificar origens permitidas em produção
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ['Set-cookie'],
  optionsSuccessStatus: 200,
};

// ==================== MIDDLEWARE ORDER ====================
// Ordem crítica dos middlewares
app.use(cors(corsOptions)); // CORS deve ser o primeiro
app.options('*', cors(corsOptions)); // Pré-flight para todas rotas
app.use(cookieParser()); // Deve vir antes do express.json()
app.use(express.json({ limit: '10mb' })); // Para parsear JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Para parsear URL-encoded bodies

// ==================== SECURITY HEADERS ====================
app.use((req: Request, res: Response, next: NextFunction) => {
  // Headers de segurança em produção
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }

  // Logging em desenvolvimento
  if (!isProduction) {
    console.log(`${req.method} ${req.url}`);
    console.log("Headers:", req.headers);
    console.log("Cookies:", req.cookies);
  }

  next(); // Continuar para o próximo middleware
});

// ==================== PUBLIC ROUTES ====================
app.use('/api/auth', authRoutes);

// Endpoint de saúde
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// ==================== PROTECTED ROUTES ====================
app.use('/api', authenticate); // Middleware de autenticação
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
  console.error(err.stack); // Log do erro no console

  res.status(500).json({
    error: 'Internal Server Error',
    message: isProduction ? 'Something went wrong!' : err.message,
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (${isProduction ? 'production' : 'development'} mode)`);
});