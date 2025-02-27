import express, { Router } from "express";
import { WhatsAppController } from "../controllers/whatsappController";

const router: Router = express.Router();
const whatsappController = new WhatsAppController();


router.post("/connect-whatsapp", async (req, res) => {
    await whatsappController.connectWhatsApp(req, res);
});

export default router;

router.get('/leads/:67bccbb3e8a35509dbe0307d', whatsappController.getLeads);
