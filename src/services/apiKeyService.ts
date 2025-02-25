import { PrismaClient } from '@prisma/client';

export class ApiKeyService {
  private prisma = new PrismaClient();

  async getUserApiKeys(assistantId: string) {
    const assistant = await this.prisma.assistant.findUnique({
      where: { id: assistantId },
      include: { user: true }
    });

    if (!assistant?.user) throw new Error('User not found');
    
    return {
      geminiKey: assistant.user.geminiApiKey,
      groqKey: assistant.user.groqApiKey
    };
  }
}