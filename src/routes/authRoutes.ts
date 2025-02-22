import express from 'express';
import { AuthService } from '../services/authService';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const authService = new AuthService();
const prisma = new PrismaClient();
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = ['http://localhost:3000', 'https://axxus.netlify.app']; // Add your allowed origins here

// Rota de login corrigida
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Chamada correta ao serviço de autenticação
    const { user, token, cookieOptions } = await authService.loginUser(email, password);

    // Configuração de domínio dinâmica
    const domainOptions = isProduction 
      ? { domain: '.axxus.netlify.app' } // Domínio do frontend
      : {};

    res.cookie('token', token, {
      ...cookieOptions,
      ...domainOptions // Aplica as opções de domínio
    });

    res.status(200).json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        availableMessages: user.availableMessages
      }, 
      token 
    });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(401).json({ 
      error: "Credenciais inválidas",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

// Rota de validação corrigida
router.get('/validate', async (req, res) => {
  try {
    // Configurar headers CORS dinamicamente
    res.header({
      'Access-Control-Allow-Origin': req.headers.origin || allowedOrigins[0],
      'Access-Control-Allow-Credentials': 'true'
    });

    const tokenFromCookie = req.cookies.token;
    const tokenFromHeader = req.headers.authorization?.split(' ')[1];
    // Debug: Log completo dos cookies recebidos
    console.log('Cookies recebidos na validação:', req.cookies);

    const token = tokenFromCookie || tokenFromHeader
    
    if (!token) {
      console.log('Token ausente na validação');
       res.status(401).json({ 
        success: false, 
        message: 'Token não fornecido' 
      });
      return
    }

    // Debug: Verificar conteúdo do token
    console.log('Token recebido:', token.substring(0, 10) + '...');

    const user = await authService.validateToken(token);
    
    // Garantir que a senha não seja enviada
    const { password, ...userData } = user;

    res.status(200).json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Erro detalhado na validação:', error);
    res.status(401).json({
      success: false,
      message: 'Sessão expirada ou inválida',
      debugInfo: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota de logout corrigida
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    domain: isProduction ? '.axxus.netlify.app' : undefined
  });
  
  res.status(200).json({ 
    success: true, 
    message: 'Sessão encerrada com sucesso' 
  });
});

export default router;