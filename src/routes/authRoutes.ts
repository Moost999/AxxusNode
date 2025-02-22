import express from 'express';
import { AuthService } from '../services/authService';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const authService = new AuthService();
const prisma = new PrismaClient();
const isProduction = process.env.NODE_ENV === 'production';

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
    // Headers CORS essenciais
    res.header({
      'Access-Control-Allow-Origin': req.headers.origin,
      'Access-Control-Allow-Credentials': 'true'
    });

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
       res.status(401).json({ 
        success: false, 
        message: 'Token não fornecido' 
      });
      return
    }

    const user = await authService.validateToken(token);
    const { password, ...userData } = user;

    res.status(200).json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Erro na validação:', error);
    res.status(401).json({
      success: false,
      message: 'Sessão expirada ou inválida'
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