import { PrismaClient } from '@prisma/client';
import { Assistant } from '../models/assistant';

const prisma = new PrismaClient();

export class AssistantService {
  async getAssistantById(id: string): Promise<Assistant> {
    const assistantData = await prisma.assistant.findUnique({
      where: { id },
      include: { user: true }
    });
    
    if (!assistantData) {
      throw new Error('Assistant não encontrado');
    }
    
    const assistant: Assistant = {
      id: assistantData.id,
      name: assistantData.name,
      initialPrompt: assistantData.instructions,
      personality: assistantData.personality,
      modelType: assistantData.model as 'gemini' | 'groq',
      whatsAppNumber: assistantData.whatsappNumber || undefined,
      userId: assistantData.userId,
      createdAt: assistantData.createdAt,
      updatedAt: assistantData.updatedAt
    };
    
    return assistant;
  }
}