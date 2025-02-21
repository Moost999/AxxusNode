import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

// Verificação de segurança para ambiente de produção
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'fallback_secret_for_development') {
  console.error('AVISO: JWT_SECRET não está configurado corretamente no ambiente de produção!');
}

type AuthResponse = {
  user: Omit<User, 'password'>;
  token: string;
};

export class AuthService {
  async registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Email already registered');

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

  async loginUser(email: string, password: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  async validateToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          tokens: true,
          availableMessages: true,
          adViews: true,
          lastAdView: true,
          adCooldown: true,
          groqApiKey: true,
          geminiApiKey: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      console.error('Token validation error:', error);
      throw new Error('Invalid token');
    }
  }

  private generateAuthResponse(user: User): AuthResponse {
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { password, ...userData } = user;
    console.log('Token gerado para usuário:', user.id);
    return { user: userData, token };
  }
}