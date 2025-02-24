import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import cron from 'node-cron';

const router = express.Router();
const prisma = new PrismaClient();

// Buscar notificações não lidas
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId, read: false },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Marcar como lida
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark notification' });
  }
});


// Deleção automática (executa a cada hora)
cron.schedule('0 * * * *', async () => {
  try {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: twelveHoursAgo },
      },
    });

    console.log(`Deleted ${deletedNotifications.count} notifications.`);
  } catch (error) {
    console.error('Error deleting notifications:', error);
  }
});

router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, read: false },
      data: { read: true },
    });

    res.json({ success: true, message: "Todas as notificações foram marcadas como lidas." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Falha ao marcar notificações como lidas" });
  }
});


export default router;
