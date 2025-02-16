import type { Request, Response, NextFunction } from "express"
import prisma from "../lib/prisma"
import { AuthService } from "../services/authService" // Adicione esta importação

export const dashboardController = {
  getStats: async (req: Request, res: Response) => {
    try {
      // Obtenha o userId do middleware
      const userId = req.userId; // Adicione esta linha
      console.log('userId: ', userId); // LOG DE DEBUG USERID DASHBOARDCONTROLLER.TS
      if (!userId) throw new Error("User ID não encontrado");

      const user = await prisma.user.findUnique({
        where: { id: userId }, // Use userId do contexto
        select: {
          tokens: true,
          availableMessages: true,
          assistants: { select: { id: true } },
          conversations: { select: { id: true } },        }
      });

      res.json({
        totalAssistants: user?.assistants.length || 0,
        activeConversations: user?.conversations.length || 0,
        tokens: user?.tokens || 0,
        availableMessages: user?.availableMessages || 0
      });
    } catch (error) {
      res.status(401).json({ error: "Não autorizado" });
    }
  }
};