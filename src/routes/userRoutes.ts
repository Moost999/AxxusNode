import express from "express";
import { userController } from "../controllers/userController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Rotas protegidas (requerem autenticação)
router.use(authenticate);

// Rota para carregar os dados do usuário
router.get("/data", userController.getUserData); // Corrigido: use o método getUserData

// Rota para trocar tokens por mensagens
router.post("/convert-tokens", userController.convertTokensToMessages); // Corrigido: remova o ponto e vírgula extra

// Rota para obter a quantidade de tokens do usuário
router.get("/tokens", userController.getTokens); // Adicionado: rota para obter tokens

export default router;