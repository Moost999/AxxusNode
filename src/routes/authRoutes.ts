  import { Router } from 'express';
  import { AuthService } from '../services/authService';
  import cookieParser from 'cookie-parser';

  const router = Router();
  const authService = new AuthService();

  router.use(cookieParser());

  router.post('/register', async (req, res) => {
    try {
      const { user, token } = await authService.registerUser(
        req.body.name,
        req.body.email,
        req.body.password
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 604800000 // 7 dias
      });

      res.status(201).json({ success: true, user });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { user, token } = await authService.loginUser(
        req.body.email,
        req.body.password
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 604800000
      });

      res.json({ success: true, user });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      });
    }
  });

  router.get('/validate', async (req, res) => {
    try {
      const token = req.cookies.token; // Lê do cookie
      console.log(token);
      if (!token) throw new Error('No token');
      
      const user = await authService.validateToken(token);
      res.json({ success: true, user });
    } catch (error) {
      res.clearCookie('token');
      res.status(401).json({ success: false }); // Resposta explícita
    }
  });
  router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  export default router;