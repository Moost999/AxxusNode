import express from "express";
import { userController } from "../controllers/userController";
import { authenticate } from "../middleware/auth";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Rotas protegidas (requerem autenticação)
router.use(authenticate);

// Rota para carregar os dados do usuário
router.get("/data", userController.getUserData); // Corrigido: use o método getUserData

// Rota para trocar tokens por mensagens
router.post("/convert-tokens", userController.convertTokensToMessages); // Corrigido: remova o ponto e vírgula extra

// Rota para obter a quantidade de tokens do usuário
router.get("/tokens", userController.getTokens); // Adicionado: rota para obter tokens
router.get("/userProfile", async (req, res) => {
    try {
        const userId = req.userId;
        const user = await prisma.user.findUnique({ where: { id: userId }, 
        select: { id: true, name: true, email: true, createdAt: true, availableMessages: true, geminiApiKey: true, groqApiKey: true } });
        res.json(user);
        
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar usuário" });
    }
}); // Adicionado: rota para obter mensagens
export default router;