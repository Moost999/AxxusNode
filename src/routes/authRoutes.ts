import express from 'express';
import { AuthService } from '../services/authService';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const authService = new AuthService();
const prisma = new PrismaClient();
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = ['http://localhost:3000', 'https://axxus.netlify.app']; // Origens permitidas

// Rota de login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Chamada ao serviço de autenticação
    const { user, token, cookieOptions } = await authService.loginUser(email, password);

    // Configuração de domínio dinâmica
    const domainOptions = isProduction 
      ? { domain: '.axxus.netlify.app' } // Domínio do frontend em produção
      : {};

    // Define o cookie no response
    res.cookie('token', token)

    // Retorna o usuário (sem a senha) e o token
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

// Rota de validação
router.get('/validate', async (req, res) => {
  try {
    // Configuração de CORS dinâmica
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Debug: Log dos cookies recebidos
    console.log('Cookies recebidos na validação:', req.cookies);

    // Extrai o token dos cookies ou do cabeçalho Authorization
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
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

    // Valida o token e busca o usuário
    const user = await authService.validateToken(token);
    
    // Garantir que a senha não seja enviada
    const { password, ...userData } = user;

    // Retorna os dados do usuário
    res.status(200).json({
      success: true,
      user: userData, // Retorna o objeto userData como "user" para consistência
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

// Rota de logout
router.post('/logout', (req, res) => {
  // Limpa o cookie de token
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', // Tipos corretos para sameSite
    path: '/',
    domain: isProduction ? '.axxus.netlify.app' : undefined
  });
  
  // Retorna uma mensagem de sucesso
  res.status(200).json({ 
    success: true, 
    message: 'Sessão encerrada com sucesso' 
  });
});

export default router;