import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express from 'express';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const isProduction = process.env.NODE_ENV === 'production';

export class AuthService {
  async loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Credenciais inválidas');
    }
    return this.generateAuthResponse(user);
  }

  async validateToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { assistants: true }
      });
      if (!user) throw new Error('Usuário não encontrado');
      return user;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  private generateAuthResponse(user: User) {
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    return {
      user: (({ password, ...rest }) => rest)(user),
      token,
      cookieOptions: {
        httpOnly: true,
        secure: true,
        sameSite:"none",
        maxAge: 604800000, // 7 dias
        path: '/',
        domain: ".axxusnode.onrender.com"
      } as express.CookieOptions
    };
  }
}