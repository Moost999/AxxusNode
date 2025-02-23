import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      userId: string;
      user: any;
    }
  }
}

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Token não fornecido ou formato inválido');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    req.userId = user.id;
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({
      error: 'Autenticação falhou',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};