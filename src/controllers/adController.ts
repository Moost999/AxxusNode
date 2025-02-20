import { Response, NextFunction } from 'express';
import { Request as ExpressRequest } from 'express';
import { prisma } from '../lib/prisma';

interface AuthenticatedRequest extends ExpressRequest {
  userId?: string;
}

type AuthenticatedRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

class AssistantController {
  public createAssistant: AuthenticatedRequestHandler = async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "Não autorizado" });
        return;
      }

      const { name, model, personality, instructions, whatsappNumber } = req.body;
      if (!name || !model) {
        res.status(400).json({ error: "Campos obrigatórios faltando" });
        return;
      }

      const newAssistant = await prisma.assistant.create({
        data: {
          name,
          model,
          personality,
          instructions,
          whatsappNumber,
          userId,
        },
      });
      // Após criar um assistente:
      await prisma.notification.create({
        data: {
          userId: userId,
          type: "Novo Assistente Criado",
          message: `Novo assistente "${newAssistant.name}" criado!`,
        }
      });

      res.status(201).json(newAssistant);
    } catch (error) {
      console.error("Error creating assistant:", error);
      res.status(500).json({
        error: "Erro ao criar assistente",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  public getAssistants: AuthenticatedRequestHandler = async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "Não autorizado" });
        return;
      }

      const assistants = await prisma.assistant.findMany({
        where: { userId },
      });
      res.json(assistants);
    } catch (error) {
      console.error("Error getting assistants:", error);
      res.status(500).json({
        error: "Erro ao buscar assistentes",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  public getAssistantById: AuthenticatedRequestHandler = async (req, res) => {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const assistant = await prisma.assistant.findUnique({
        where: { id },
        include: { 
          activeChats: true,
          archivedChats: true,
          files: true
        },
      });

      if (!assistant || assistant.userId !== userId) {
        res.status(404).json({ error: "Assistente não encontrado" });
        return;
      }

      res.json(assistant);
    } catch (error) {
      console.error("Error getting assistant:", error);
      res.status(500).json({
        error: "Erro ao buscar assistante",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  public updateAssistant: AuthenticatedRequestHandler = async (req, res) => {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const existingAssistant = await prisma.assistant.findUnique({
        where: { id },
      });

      if (!existingAssistant || existingAssistant.userId !== userId) {
        res.status(404).json({ error: "Assistente não encontrado" });
        return;
      }

      const updatedAssistant = await prisma.assistant.update({
        where: { id },
        data: req.body,
      });

      res.json(updatedAssistant);
    } catch (error) {
      console.error("Error updating assistant:", error);
      res.status(500).json({
        error: "Erro ao atualizar assistente",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  public deleteAssistant: AuthenticatedRequestHandler = async (req, res) => {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const existingAssistant = await prisma.assistant.findUnique({
        where: { id },
      });

      if (!existingAssistant || existingAssistant.userId !== userId) {
        res.status(404).json({ error: "Assistente não encontrado" });
        return;
      }

      // Delete active chats associated with the assistant
      await prisma.chat.deleteMany({
        where: { assistantId: id },
      });

      // Delete archived chats associated with the assistant
      await prisma.chat.deleteMany({
        where: { archivedById: id },
      });

      // Delete files associated with the assistant
      await prisma.file.deleteMany({
        where: { assistantId: id },
      });

      const deletedAssistant = await prisma.assistant.delete({
        where: { id },
      });

      res.json({
        message: "Assistente deletado com sucesso",
        deletedAssistant,
      });
    } catch (error) {
      console.error("Error deleting assistant:", error);
      res.status(500).json({
        error: "Erro ao deletar assistente",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
}

export const assistantController = new AssistantController();