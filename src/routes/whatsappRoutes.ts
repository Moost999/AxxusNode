import express, { Router } from "express";
import { WhatsAppController } from "../controllers/whatsappController";
import { authenticate } from "../middleware/auth";

const router: Router = express.Router();
const whatsappController = new WhatsAppController();


router.post("/connect-whatsapp", async (req, res) => {
    await whatsappController.connectWhatsApp(req, res);
});

export default router;

// Nova rota para buscar todos os leads do usuário
router.get("/leads/all", authenticate, whatsappController.getAllLeads.bind(whatsappController))
router.get("/leads/:assistantId", whatsappController.getLeads.bind(whatsappController))
