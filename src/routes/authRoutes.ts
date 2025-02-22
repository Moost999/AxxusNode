import express from 'express';
import { AuthService } from '../services/authService';

const router = express.Router();
const authService = new AuthService();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token, cookieOptions } = await authService.loginUser(email, password);

    res.cookie('token', token);
    res.status(200).json({ user, token });
  } catch (error) {
    console.error('[Login] Erro:', error);
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

router.get('/validate', async (req, res) => {
  try {
    console.log('Cookies recebidos:', req.cookies); // Debug cookies
    console.log('Authorization header:', req.headers.authorization); // Debug header

    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.error('Token não encontrado');
       res.status(401).json({ success: false, message: 'Token não fornecido' });
      return
      }

    const user = await authService.validateToken(token);
    const { password, ...userData } = user;

    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error('[Validate] Erro:', error);
    res.clearCookie('token');
    res.status(401).json({ success: false, message: 'Sessão expirada' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  res.status(200).json({ success: true, message: 'Logout realizado' });
});

export default router;