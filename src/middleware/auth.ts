import type { Request, Response, NextFunction } from "express"
import { AuthService } from "../services/authService"
import { PrismaClient } from "@prisma/client"

const allowedOrigins = ["https://axxus-front.vercel.app", "http://192.168.0.2:3000"] // Add your frontend URL here
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

// Atualize o middleware de autenticação
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Configurar CORS para a origem específica
    const origin = req.get("origin")
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin)
    }
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")

    // Se for uma requisição OPTIONS, retorna OK
    if (req.method === "OPTIONS") {
      return res.status(200).end()
    }

    const token = req.cookies.token
    if (!token) {
      throw new Error("Token não encontrado")
    }

    const user = await authService.validateToken(token)
    req.userId = user.id

    next()
  } catch (error) {
    // Configurar CORS mesmo em caso de erro
    const origin = req.get("origin")
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin)
    }
    res.setHeader("Access-Control-Allow-Credentials", "true")

    // Limpar o cookie em caso de erro de autenticação
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    res.status(401).json({ error: "Autenticação falhou" })
  }
}

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

