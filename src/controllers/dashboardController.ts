// src/controllers/dashboardController.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const dashboardController = {
  getStats: async (req: Request, res: Response) => {
    try {
      const [
        totalAssistants,
        activeConversations,
        messagesProcessed,
        totalUsers
      ] = await Promise.all([
        prisma.assistant.count(),
        prisma.conversation.count(),
        prisma.message.count(),
        prisma.user.count()
      ]);

      res.json({
        totalAssistants,
        activeConversations,
        messagesProcessed,
        totalUsers
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        message: 'Error fetching dashboard stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};