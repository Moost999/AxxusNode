import { Request, Response } from 'express'
import { AdService } from '../services/adService'
import { authenticate } from '../middleware/auth'
import prisma from '../lib/prisma'
const adService = new AdService()

export class AdController {
  static async viewAd(req: Request, res: Response) {
    try {
      const userId = req.userId
      if (!userId) {
         res.status(401).json({ error: 'User not authenticated' })
         return
      }

      const { timeViewed, adClicked } = req.body;
      
      // Verificar se o usuário cumpriu os requisitos
      if (!adClicked) {
        res.status(400).json({
          success: false,
          error: 'Você precisa clicar em pelo menos um anúncio'
        });
        return
      }
      
      if (timeViewed < parseInt(process.env.AD_MIN_VIEW_TIME || '60000') / 1000) {
         res.status(400).json({
          success: false, 
          error: 'Você precisa assistir o anúncio por pelo menos 1 minuto'
        });
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
  
        let cooldown = 0;
        if (user.lastAdView && user.adViews >= parseInt(process.env.AD_MAX_VIEWS_PER_PERIOD || '10')) {
          const lastView = new Date(user.lastAdView)
          const now = new Date()
          const diffMinutes = Math.floor((now.getTime() - lastView.getTime()) / (1000 * 60))
          const adPeriodMinutes = parseInt(process.env.AD_PERIOD_MINUTES || '30');
          cooldown = Math.max(0, adPeriodMinutes - diffMinutes)
        }
        
        res.json({
          success: true,
          data: {
            adViews: user.adViews,
            cooldown,
            canWatchAd: cooldown === 0 && user.adViews < parseInt(process.env.AD_MAX_VIEWS_PER_PERIOD || '10')
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