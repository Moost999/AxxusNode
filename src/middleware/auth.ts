import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { PrismaClient } from '@prisma/client';

const allowedOrigins = ['https://axxus-front.vercel.app', 'http://192.168.0.2:3000'];
const authService = new AuthService();
const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar tanto o cookie quanto o header Authorization
    const tokenFromCookie = req.cookies.token
    const tokenFromHeader = req.headers.authorization?.split(" ")[1]
    const token = tokenFromCookie || tokenFromHeader

    if (!token) {
      throw new Error("Token não encontrado")
    }

    const user = await authService.validateToken(token)
    req.userId = user.id

    next()
  } catch (error) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    res.status(401).json({
      error: "Autenticação falhou",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}

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
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};