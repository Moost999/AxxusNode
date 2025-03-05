import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"
const JWT_EXPIRATION = "24h"

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body

      // Validação dos campos
      if (!name || !email || !password) {
         res.status(400).json({
          error: "Todos os campos são obrigatórios",
        })
        return
      }

      // Verificar se usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
         res.status(400).json({
          error: "Email já cadastrado",
        })
        return
      }

      console.log("Tentativa de Cadastro:", { email })

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10)

      // Criar novo usuário
      const user = await prisma.user.create({
        data: {
          name,
          email,
          tokens: 100,
          password: hashedPassword,
          availableMessages: 30, // Mensagens iniciais gratuitas
          geminiApiKey: '',
          groqApiKey: ''
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          availableMessages: true,
          geminiApiKey: true,
          groqApiKey: true,
        },
      })

      // Gerar token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION })

      res.status(201).json({
        user,
        token,
      })
    } catch (error) {
      console.error("Erro no registro:", error)
      res.status(500).json({
        error: "Erro ao criar conta",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      // Validação dos campos
      if (!email || !password) {
         res.status(400).json({
          error: "Email e senha são obrigatórios",
        })
        return
      }

      // Log para debug
      console.log("Tentativa de login:", { email })

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
         res.status(401).json({
          error: "Credenciais inválidas",
        })
        return
      }

      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password)

      if (!validPassword) {
         res.status(401).json({
          error: "Credenciais inválidas",
        })
        return
      }

      // Gerar token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION })

      // Remover senha do objeto do usuário
      const { password: _, ...userWithoutPassword } = user

      res.json({
        user: userWithoutPassword,
        token,
      })
    } catch (error) {
      console.error("Erro no login:", error)
      res.status(500).json({
        error: "Erro ao fazer login",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  async validateToken(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          name: true,
          email: true,
          availableMessages: true,
          createdAt: true,
        },
      })

      if (!user) {
         res.status(401).json({
          valid: false,
          error: "Usuário não encontrado",
        })
        return
      }

      res.json({
        valid: true,
        user,
      })
    } catch (error) {
      console.error("Erro na validação do token:", error)
      res.status(401).json({
        valid: false,
        error: "Token inválido",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          availableMessages: true,
        },
      })

      if (!user) {
         res.status(404).json({
          error: "Usuário não encontrado",
        })
        return
      }

      res.json({ user })
    } catch (error) {
      console.error("Erro ao buscar perfil:", error)
      res.status(500).json({
        error: "Erro ao buscar perfil",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const { name, email } = req.body

      // Validação dos campos
      if (!name && !email) {
         res.status(400).json({
          error: "Nenhum dado para atualizar",
        })
        return
      }

      // Se email está sendo atualizado, verificar se já existe
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            NOT: {
              id: req.userId,
            },
          },
        })

        if (existingUser) {
           res.status(400).json({
            error: "Email já está em uso",
          })
          return
        }
      }

      // Atualizar usuário
      const user = await prisma.user.update({
        where: { id: req.userId },
        data: {
          name: name || undefined,
          email: email || undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          availableMessages: true,
        },
      })

      res.json({ user })
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      res.status(500).json({
        error: "Erro ao atualizar perfil",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body

      // Validação dos campos
      if (!currentPassword || !newPassword) {
         res.status(400).json({
          error: "Senha atual e nova senha são obrigatórias",
        })
        return
      }

      // Buscar usuário com senha
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      })

      if (!user) {
         res.status(404).json({
          error: "Usuário não encontrado",
        })
        return
      }

      // Verificar senha atual
      const validPassword = await bcrypt.compare(currentPassword, user.password)

      if (!validPassword) {
         res.status(401).json({
          error: "Senha atual incorreta",
        })
        return
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Atualizar senha
      await prisma.user.update({
        where: { id: req.userId },
        data: { password: hashedPassword },
      })

      res.json({
        message: "Senha alterada com sucesso",
      })
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      res.status(500).json({
        error: "Erro ao alterar senha",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }
}

export default new AuthController()

