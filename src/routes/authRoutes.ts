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
// Exemplo de rota de login no backend
router.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const {user, token, cookieOptions} = await authService.loginUser(email, password)
    const authResponse = await authService.loginUser(email, password);

    console.log("Resposta do login:", authResponse); // Depuração
    res.cookie(token, cookieOptions, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 604800000, // 7 dias
      domain: isProduction ? '.onrender.com' : '.onrender.com',
      path: '/' // Ajuste conforme seu domínio
    }); 
    res.status(200).json({ user, token, cookieOptions });
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