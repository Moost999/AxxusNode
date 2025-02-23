import express from 'express';
import { login, authenticate } from '../controllers/authController';

const router = express.Router();

// Rota pública
router.post('/login', login);

// Rota protegida (exemplo)
router.get('/perfil', authenticate, (req, res) => {
  res.json({ message: 'Acesso permitido!', userId: req.userId });
});

export default router;