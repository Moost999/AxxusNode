import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class AdService {
  async handleAdView(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { adViews: true, lastAdView: true }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Verificar limite de 10 anúncios a cada 30 minutos
      if (user.lastAdView) {
        const lastView = new Date(user.lastAdView)
        const now = new Date()
        const diffMinutes = Math.floor((now.getTime() - lastView.getTime()) / (1000 * 60))

        if (diffMinutes < 30 && user.adViews >= 10) {
          throw new Error(`You can only watch 10 ads every 30 minutes. Wait ${30 - diffMinutes} minutes.`)
        }

        // Resetar contagem após 30 minutos
        if (diffMinutes >= 30) {
          await prisma.user.update({
            where: { id: userId },
            data: { adViews: 0 }
          })
        }
      }

      // Gerar recompensas
      const tokenReward = Math.floor(Math.random() * (20 - 15 + 1)) + 15
      const messageReward = 10

      // Atualizar usuário
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          tokens: { increment: tokenReward },
          availableMessages: { increment: messageReward },
          adViews: { increment: 1 },
          lastAdView: new Date(),
        },
        select: {
          tokens: true,
          availableMessages: true,
          adViews: true,
        },
      })

      // Criar notificação
      await prisma.notification.create({
        data: {
          userId: userId,
          type: 'Recompensa por assistir a um anúncio',
          message: `Você ganhou ${tokenReward} tokens e ${messageReward} mensagens por assistir a um anúncio!`,
          metadata: { 
            tokenAmount: tokenReward,
            messageAmount: messageReward
          }
        }
      })

      return {
        tokenReward,
        messageReward,
        newTokenBalance: updatedUser.tokens,
        newMessageBalance: updatedUser.availableMessages,
        totalAdViews: updatedUser.adViews,
      }

    } catch (error) {
      console.error('Error handling ad view:', error)
      throw error
    }
  }
}