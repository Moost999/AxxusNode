import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class UserService {
  // Método para carregar os dados do usuário (tokens e mensagens)
  async getUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokens: true, availableMessages: true },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    return {
      tokens: user.tokens,
      messages: user.availableMessages,
    };
  }

  // Método para trocar tokens por mensagens
  async convertTokensToMessages(userId: string, tokens: number) {
    if (tokens < 1) {
      throw new Error("Mínimo de 10 tokens para troca");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.tokens < tokens) {
      throw new Error("Tokens insuficientes");
    }

    // Calcula quantas mensagens o usuário ganhará
    const messagesToAdd = Math.floor(tokens / 1);

    // Atualiza os tokens e mensagens do usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        tokens: user.tokens - tokens,
        availableMessages: user.availableMessages + messagesToAdd,
      },
    });

    return {
      tokens: updatedUser.tokens,
      messagesAdded: messagesToAdd,
    };
  }
}

export const userService = new UserService();