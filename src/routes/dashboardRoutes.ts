// src/routes/dashboardRoutes.ts
import express from 'express';
import { dashboardController } from '../controllers/dashboardController';

const router = express.Router();

router.get('/stats', dashboardController.getStats);

export default router;