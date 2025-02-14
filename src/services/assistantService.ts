import { PrismaClient } from '@prisma/client';
import { Assistant } from '../models/assistant';

const prisma = new PrismaClient();

export class AssistantService {
  async getAssistantById(id: string): Promise<Assistant> {
    const assistant = await prisma.assistant.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!assistant) {
      throw new Error('Assistant não encontrado');
    }

    return {
      ...assistant,
      modelType: assistant.model as 'gemini' | 'groq', // Converter o campo model para modelType
      initialPrompt: assistant.instructions
    };
  }
}