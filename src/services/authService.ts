import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const isProduction = process.env.NODE_ENV === 'production';

export class AuthService {
  async registerUser(name: string, email: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Email já registrado');

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        tokens: 100,
        availableMessages: 100,
      },
    });

    return this.generateAuthResponse(user);
  }

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
      console.error('[AuthService] Erro na validação do token:', error);
      throw new Error('Token inválido ou expirado');
    }
  }

  private generateAuthResponse(user: User) {
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return {
      user: (({ password, ...rest }) => rest)(user), // Remove a senha
      token,
      cookieOptions: {
        httpOnly: true,
        secure: isProduction, // Apenas HTTPS em produção
        sameSite: 'lax',
        maxAge: 604800000, // 7 dias
        path: '/',
        domain: isProduction ? '.axxus-front.vercel.app' : undefined // Domínio correto
      }
    };
  }
}