import express from "express";
import { dashboardController } from "../controllers/dashboardController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Adicione OPTIONS para pré-flight
router.options("/stats", (req, res) => {
  res.header({
    'Access-Control-Allow-Origin': 'https://axxus.netlify.app',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  });
  res.sendStatus(204);
});

router.get("/stats", authenticate, dashboardController.getStats);

export default router;