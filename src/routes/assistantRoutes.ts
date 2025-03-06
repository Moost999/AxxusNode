import express, { Router } from 'express';
import { assistantController } from '../controllers/assistantController';

import { authenticate } from '../middleware/auth';

const router = Router();

// Rotas para Assistants
// router.get('/user/:userId', assistantController.getAssistants);
// Altere a rota para usar o userId do token (não da URL)
router.post('/create-assistant',authenticate, assistantController.createAssistant);
router.get('/user/me', authenticate, assistantController.getAssistants); // Nova rota router.get('/:id', assistantController.getAssistantById);
router.patch('/up', authenticate, assistantController.updateAssistant);
router.delete('/:id', authenticate, assistantController.deleteAssistant);

export default router;