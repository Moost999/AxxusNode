import express from "express"
import { dashboardController }from "../controllers/dashboardController"
import { authenticate } from "../middleware/auth" // Certifique-se do caminho correto

const router = express.Router()

router.get("/stats", authenticate, dashboardController.getStats)

export default router
