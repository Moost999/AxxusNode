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

// Login de usuário
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
       res.status(400).json({ 
        success: false, 
        message: 'Email e senha são obrigatórios' 
      });
      return
    }
    
    const authResponse = await authService.loginUser(email, password);
    
    // Configurar o cookie de autenticação
    res.cookie('token', authResponse.token, cookieOptions);
    
    // Enviar resposta com dados do usuário e token
    res.status(200).json({
      success: true,
      user: authResponse.user,
      token: authResponse.token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(401).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Credenciais inválidas' 
    });
  }
});

// Validação de token
router.get('/validate', async (req, res) => {
  try {
    // Obter token do cookie ou do header Authorization
    const tokenFromCookie = req.cookies.token;
    const tokenFromHeader = req.headers.authorization?.split(" ")[1];
    const token = tokenFromCookie || tokenFromHeader;
    
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