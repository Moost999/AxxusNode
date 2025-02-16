import type { Request, Response, NextFunction } from "express"
import { AuthService } from "../services/authService"
import { PrismaClient } from "@prisma/client"

const authService = new AuthService()
const prisma = new PrismaClient()

// Extend the Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Leia o token dos cookies
    const token = req.cookies.token;
    if (!token) throw new Error('Token não encontrado');

    const user = await authService.validateToken(token);
    req.userId = user.id; // Injeta userId na requisição
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};

export const checkMessageQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) throw new Error("User ID not found in request")


    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { availableMessages: true },
    })

    if (!user || user.availableMessages <= 0) {
      return res.status(402).json({
        success: false,
        message: "No available messages. Watch ads to get more credits.",
      })
    }
    next()
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

