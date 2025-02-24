import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import cron from 'node-cron';

const router = express.Router();
const prisma = new PrismaClient();

// Buscar notificações não lidas
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.userId; // Correção: Pegando o ID do usuário autenticado
    if (!userId) {
       res.status(401).json({ success: false, message: "Não autorizado" });
      return
      }

    const notifications = await prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Marcar uma notificação específica como lida
router.patch('/me/read', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const notificationId = req.query.id as string; // Correção: pegando o ID via query params

    if (!userId || !notificationId) {
       res.status(400).json({ success: false, message: "ID da notificação é obrigatório" });
      return
      }

    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });

    res.json({ success: true, message: "Notificação marcada como lida" });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Falha ao marcar notificação como lida' });
  }
});

// Marcar todas as notificações do usuário como lidas
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
       res.status(401).json({ success: false, message: "Não autorizado" });
      
      return
      }

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.json({ success: true, message: "Todas as notificações foram marcadas como lidas." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Falha ao marcar notificações como lidas" });
  }
});

// Deleção automática de notificações a cada 12 horas
cron.schedule('0 * * * *', async () => {
  try {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const deletedNotifications = await prisma.notification.deleteMany({
      where: { createdAt: { lt: twelveHoursAgo } },
    });

    console.log(`Deleted ${deletedNotifications.count} notifications.`);
  } catch (error) {
    console.error('Error deleting notifications:', error);
  }
});

export default router;
