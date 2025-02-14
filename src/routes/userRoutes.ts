// src/routes/userRoutes.ts
import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();

router.post('/create-user', userController.createUser);
router.get('/:userId/tokens', userController.getUserTokens);

// Add other routes (get, update, delete) here

export default router;