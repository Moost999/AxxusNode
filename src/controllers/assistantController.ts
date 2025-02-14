import { Request, Response, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const FIXED_USER_ID = "b6f7d89c-0c5d-4d93-a7db-8f4a0f6b2e9a";

class AssistantController {
  public createAssistant: RequestHandler = async (req, res) => {
    try {
      const { name, model, personality, instructions, whatsappNumber } = req.body;

      const newAssistant = await prisma.assistant.create({
        data: {
          name,
          model,
          personality,
          instructions,
          whatsappNumber,
          userId: FIXED_USER_ID
        }
      });

      res.status(201).json(newAssistant);
    } catch (error) {
      console.error('Error creating assistant:', error);
      res.status(500).json({ error: 'Erro ao criar assistente' });
    }
  }

  public getAssistants: RequestHandler = async (req, res) => {
    try {
      const assistants = await prisma.assistant.findMany({
        where: { 
          userId: "b6f7d89c-0c5d-4d93-a7db-8f4a0f6b2e9a"
        }
      });

       res.json(assistants);
    } catch (error) {
      console.error('Error getting assistants:', error);
       res.status(500).json({ error: 'Erro ao buscar assistentes' });
    }
  }

  public getAssistantById: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;

      const assistant = await prisma.assistant.findUnique({
        where: { id },
        include: {
          conversations: true
        }
      });

      if (!assistant) {
         res.status(404).json({ error: 'Assistente não encontrado' });
      }

       res.json(assistant);
    } catch (error) {
      console.error('Error getting assistant:', error);
       res.status(500).json({ error: 'Erro ao buscar assistente' });
    }
  }

  public updateAssistant: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedAssistant = await prisma.assistant.update({
        where: { id },
        data: updateData
      });

       res.json(updatedAssistant);
    } catch (error) {
      console.error('Error updating assistant:', error);
       res.status(500).json({ error: 'Erro ao atualizar assistente' });
    }
  }

  public deleteAssistant: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.conversation.deleteMany({
        where: { assistantId: id }
      });

      const deletedAssistant = await prisma.assistant.delete({
        where: { id }
      });

       res.json({
        message: 'Assistente deletado com sucesso',
        deletedAssistant
      });
    } catch (error) {
      console.error('Error deleting assistant:', error);
      res.status(500).json({ error: 'Erro ao deletar assistente' });
    }
  }
}

export const assistantController = new AssistantController();