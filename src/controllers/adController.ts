import { Request, Response } from 'express'
import { AdService } from '../services/adService'
import { authenticate } from '../middleware/auth'
import { Prisma, PrismaClient } from '@prisma/client'
const adService = new AdService()

const prisma = new PrismaClient()
export class AdController {
  static async viewAd(req: Request, res: Response) {
    try {
      const userId = req.userId
      if (!userId) {
         res.status(401).json({ error: 'User not authenticated' })
         return
      }

      const result = await adService.handleAdView(userId)

      res.json({
        success: true,
        message: 'Ad view processed successfully',
        data: result
      })

    } catch (error) {
      console.error('Error in ad view controller:', error)
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process ad view'
      })
    }
  }

  static async getAdStatus(req: Request, res: Response) {
    try {
      const userId = req.userId
      if (!userId) {
         res.status(401).json({ error: 'User not authenticated' })
          return
        }
  
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          adViews: true,
          lastAdView: true
        }
      })
  
      if (!user) {
         res.status(404).json({ error: 'User not found' })
          return
        }
  
      // Calcular cooldown
      let cooldown = 0
      if (user.lastAdView) {
        const lastView = new Date(user.lastAdView)
        const now = new Date()
        const diffMinutes = Math.floor((now.getTime() - lastView.getTime()) / (1000 * 60))
        cooldown = Math.max(0, 30 - diffMinutes)
      }
  
      res.json({
        success: true,
        data: {
          adViews: user.adViews,
          cooldown,
          canWatchAd: user.adViews < 10
        }
      })
  
    } catch (error) {
      console.error('Error getting ad status:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get ad status'
      })
    }
  }
}