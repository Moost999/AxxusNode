import express, { Router } from "express";
import { WhatsAppController } from "../controllers/whatsappController";

const router: Router = express.Router();
const whatsappController = new WhatsAppController();


router.post("/connect-whatsapp", (req, res) => whatsappController.connectWhatsApp(req, res));

export default router;