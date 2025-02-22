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
    // Debug: Listar todos os cookies recebidos
    console.log('Cookies recebidos:', req.cookies);
    
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      console.log('Token não encontrado nos headers ou cookies');
      throw new Error("Token não encontrado");
    }

    // Verificar validade do token
    const user = await authService.validateToken(token);
    
    // Adicionar dados extras ao request
    req.user = {
      ...user,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };

    next();
  } catch (error) {
    console.error('Erro detalhado na autenticação:', error);
    
    // Limpeza reforçada do cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      domain: '.axxus.netlify.app'
    });

    res.status(401).json({
      error: "Autenticação falhou",
      debug: error instanceof Error ? error.message : "Erro desconhecido",
      stack: process.env.NODE_ENV === 'development',
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