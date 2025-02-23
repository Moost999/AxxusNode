import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// Defina uma interface para a requisição autenticada
interface AuthenticatedRequest extends Request {
  userId: string;
}

export const dashboardController = {
  getStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      console.log('userId: ', userId); // LOG DE DEBUG USERID DASHBOARDCONTROLLER.TS
      
      if (!userId) {
        res.status(401).json({ error: "Não autorizado" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          tokens: true,
          availableMessages: true,
          assistants: {
            select: { id: true }
          },
        }
      });

      if (!user) {
        res.status(404).json({ error: "Usuário não encontrado" });
        return;
      }

      // Contagem de chats ativos
      const activeChatsCount = await prisma.chat.count({
        where: {
          assistant: {
            userId: userId
          }
        }
      });

      res.json({
        totalAssistants: user.assistants.length,
        activeConversations: activeChatsCount,
        tokens: user.tokens,
        availableMessages: user.availableMessages
      });
    } catch (error) {
      console.error("Erro ao obter estatísticas do dashboard:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};