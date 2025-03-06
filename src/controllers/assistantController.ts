import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Extendendo a interface Request do Express
interface AuthenticatedRequest extends Request {
  userId: string
  user: string
}

class AssistantController {
  public async createAssistant(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId
      if (!userId) {
        res.status(401).json({ error: "Não autorizado" })
        return
      }

      const { name, model, personality, instructions, whatsappNumber } = req.body
      if (!name || !model) {
        res.status(400).json({ error: "Campos obrigatórios faltando" })
        return
      }

      // Validação de tokens - verificar se o usuário tem tokens suficientes
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tokens: true },
      })

      if (!user || user.tokens < 100) {
        res.status(400).json({
          error: "Tokens insuficientes",
          details: "Você precisa de pelo menos 100 tokens para criar um assistente",
        })
        return
      }

      // Validação do tamanho das instruções (300 caracteres ~ 75 tokens)
      if (instructions && instructions.length > 300) {
        res.status(400).json({
          error: "Limite de caracteres excedido",
          details: "As instruções não podem exceder 300 caracteres.",
        })
        return
      }

      // Deduzir 100 tokens do usuário
      await prisma.user.update({
        where: { id: userId },
        data: { tokens: { decrement: 100 } },
      })

      // Add token validation

      const newAssistant = await prisma.assistant.create({
        data: {
          name,
          model,
          personality,
          instructions,
          whatsappNumber,
          userId,
        },
      })

      await prisma.notification.create({
        data: {
          userId: userId,
          type: "Novo Assistente Criado",
          message: `Novo assistente "${newAssistant.name}" criado!`,
        },
      })

      res.status(201).json(newAssistant)
      return
    } catch (error) {
      console.error("Error creating assistant:", error)
      res.status(500).json({
        error: "Erro ao criar assistente",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
      return
    }
  }

  public async getAssistants(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId
      const { page = 1 } = req.query
      if (!userId) {
        res.status(401).json({ error: "Não autorizado" })
        return
      }

      const assistants = await prisma.assistant.findMany({
        where: { userId },
      })
      res.json(assistants)
      return
    } catch (error) {
      console.error("Error getting assistants:", error)
      res.status(500).json({
        error: "Erro ao buscar assistentes",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
      return
    }
  }

  public async getAssistantById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId
      // Alterado para usar params em vez de query
      const assistantId = req.params.id

      if (!assistantId) {
        res.status(400).json({ error: "ID do assistente não fornecido" })
        return
      }

      const assistant = await prisma.assistant.findUnique({
        where: { id: assistantId },
        include: {
          activeChats: true,
          archivedChats: true,
          files: true,
        },
      })

      if (!assistant || assistant.userId !== userId) {
        res.status(404).json({ error: "Assistente não encontrado" })
        return
      }

      res.json(assistant)
      return
    } catch (error) {
      console.error("Error getting assistant:", error)
      res.status(500).json({
        error: "Erro ao buscar assistente",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
      return
    }
  }

  public async updateAssistant(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId
      // Alterado para usar params em vez de query
      const assistantId = req.params.id

      if (!assistantId) {
        res.status(400).json({ error: "ID do assistente não fornecido" })
        return
      }

      const existingAssistant = await prisma.assistant.findUnique({
        where: { id: assistantId },
      })

      if (!existingAssistant || existingAssistant.userId !== userId) {
        res.status(404).json({ error: "Assistente não encontrado" })
        return
      }

      // Add token validation if instructions are being updated
      if (req.body.instructions) {
        // Aumentar o limite para 300 caracteres
        if (req.body.instructions.length > 300) {
          res.status(400).json({
            error: "Limite de caracteres excedido",
            details: "As instruções não podem exceder 300 caracteres.",
          })
          return
        }
      }

      const updatedAssistant = await prisma.assistant.update({
        where: { id: assistantId },
        data: req.body,
      })

      res.json(updatedAssistant)
      return
    } catch (error) {
      console.error("Error updating assistant:", error)
      res.status(500).json({
        error: "Erro ao atualizar assistente",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
      return
    }
  }

  public async deleteAssistant(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId
      // Alterado para usar params em vez de query
      const assistantId = req.params.id

      console.log("Deletando assistente com ID:", assistantId)

      if (!assistantId) {
        res.status(400).json({ error: "ID do assistente não fornecido" })
        return
      }

      const existingAssistant = await prisma.assistant.findUnique({
        where: { id: assistantId },
      })

      if (!existingAssistant) {
        console.log("Assistente não encontrado com ID:", assistantId)
        res.status(404).json({ error: "Assistente não encontrado" })
        return
      }

      if (existingAssistant.userId !== userId) {
        console.log("Usuário não autorizado. ID do usuário:", userId, "ID do proprietário:", existingAssistant.userId)
        res.status(403).json({ error: "Não autorizado a deletar este assistente" })
        return
      }

      // Delete related records
      await prisma.$transaction([
        prisma.chat.deleteMany({
          where: { assistantId },
        }),
        prisma.chat.deleteMany({
          where: { archivedById: assistantId },
        }),
        prisma.file.deleteMany({
          where: { assistantId },
        }),
        prisma.assistant.delete({
          where: { id: assistantId },
        }),
      ])

      console.log("Assistente deletado com sucesso:", assistantId)
      res.json({
        message: "Assistente deletado com sucesso",
        deletedAssistant: existingAssistant,
      })
      return
    } catch (error) {
      console.error("Error deleting assistant:", error)
      res.status(500).json({
        error: "Erro ao deletar assistente",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      })
      return
    }
  }
}

export const assistantController = new AssistantController()

