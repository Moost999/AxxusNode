import express, { Router } from 'express';
import { assistantController } from '../controllers/assistantController';

import { authenticate } from '../middleware/auth';

const router = Router();

// Rotas para Assistants
router.post('/create-assistant', assistantController.createAssistant);
router.get('/user/:userId', assistantController.getAssistants);
// Altere a rota para usar o userId do token (não da URL)
router.get('/user/me', authenticate, assistantController.getAssistants); // Nova rota router.get('/:id', assistantController.getAssistantById);
router.patch('/:id', assistantController.updateAssistant);
router.delete('/:id', assistantController.deleteAssistant);

export default router;