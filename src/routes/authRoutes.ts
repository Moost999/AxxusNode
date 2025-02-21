import express from 'express';
import { AuthService } from '../services/authService';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const authService = new AuthService();
const prisma = new PrismaClient();
const isProduction = process.env.NODE_ENV === 'production';

// Configurações de cookie para maior segurança
const cookieOptions = {
  httpOnly: true,
  secure: isProduction, // true em produção (requer HTTPS)
  sameSite: isProduction ? 'none' as const : 'lax' as const, // 'none' permite cookies em cross-site com HTTPS
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em milissegundos
};

import cors from 'cors';

const allowedOrigins = [
  'https://axxus-front.vercel.app',
  'https://axxus-front-git-main-axxus.vercel.app',
  'http://localhost:3000',
  'http://192.168.0.2:3000', // Adicione o IP do seu frontend
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS bloqueado para origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Permite cookies e credenciais
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'], // Headers permitidos
  optionsSuccessStatus: 200, // Status para requisições OPTIONS
};

router.use(cors(corsOptions));
// Login de usuário
// Exemplo de rota de login no backend
router.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const authResponse = await authService.loginUser(email, password);

    console.log("Resposta do login:", authResponse); // Depuração

    res.cookie("token", authResponse.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.status(200).json({ user: authResponse.user });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(401).json({ error: "Credenciais inválidas" });
  }
});

// Validação de token
// No arquivo authRoutes.ts, modifique o endpoint /validate:

// Validação de token
router.get('/validate', async (req, res) => {
  try {
    // Garantir que os headers CORS estejam presentes em cada resposta
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Obter token do cookie ou do header Authorization
    const tokenFromCookie = req.cookies.token;
    const tokenFromHeader = req.headers.authorization?.split(" ")[1];
    const token = tokenFromCookie || tokenFromHeader;
    
    console.log('Token recebido:', token ? 'presente' : 'ausente');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Cookies:', req.cookies);
    
    if (!token) {
      res.status(401).json({ success: false, message: 'Token não fornecido' });
      return
    }
    
    // Validar o token
    const user = await authService.validateToken(token);
    
    // Omitir a senha do resultado
    const { password, ...userData } = user;
    
    // Responder com os dados do usuário
    res.status(200).json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Erro na validação do token:', error);
    res.status(401).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Token inválido' 
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  // Limpar o cookie de autenticação
  res.clearCookie('token', {
    ...cookieOptions,
    maxAge: 0,
  });
  
  res.status(200).json({ 
    success: true, 
    message: 'Logout realizado com sucesso' 
  });
});

export default router;