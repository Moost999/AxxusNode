import express from 'express'
import { AdController } from '../controllers/adController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// Ver anúncio
router.post('/view', authenticate, AdController.viewAd)

// Obter status de anúncios
router.get('/status', authenticate, AdController.getAdStatus)

export default router