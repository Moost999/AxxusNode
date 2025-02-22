import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { PrismaClient } from '@prisma/client';

const allowedOrigins = [
  'https://axxus-front.vercel.app', 
  'http://localhost:3000',
  'http://192.168.0.2:3000'
];
const authService = new AuthService();
const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any; // Adicionado o usuário completo no request
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar tanto o cookie quanto o header Authorization
    const tokenFromCookie = req.cookies.token;
    const tokenFromHeader = req.headers.authorization?.split(" ")[1];
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      console.log('Autenticação falhou: Token não encontrado');
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      console.log('Cookies:', req.cookies);
      throw new Error("Token não encontrado");
    }

    // Validar token e obter dados do usuário
    const user = await authService.validateToken(token);
    
    // Armazenar tanto o ID quanto os dados completos do usuário
    req.userId = user.id;
    req.user = user;
    
    console.log(`Usuário autenticado: ${user.id} (${user.email})`);
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error instanceof Error ? error.message : 'Erro desconhecido');
    
    // Limpar o cookie de autenticação
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true em produção, false em desenvolvimento
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Ajuste importante para CORS
      path: "/",
    });

    res.status(401).json({
      error: "Autenticação falhou",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

export const checkMessageQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) throw new Error('User ID not found in request');

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { availableMessages: true },
    });

    if (!user || user.availableMessages <= 0) {
      res.status(402).json({
        success: false,
        message: 'No available messages. Watch ads to get more credits.',
      });
      return;
    }
    next();
  } catch (error) {
    console.error('Erro ao verificar quota de mensagens:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};