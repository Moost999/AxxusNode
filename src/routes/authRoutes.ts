import express from "express"
import AuthController from "../controllers/authController"
import { authenticate } from "../middleware/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const router = express.Router()

// Rotas públicas - NÃO usar authenticate aqui
router.post("/login", AuthController.login)
router.post("/register", AuthController.register)
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    res.json({ exists: !!user })
  } catch (error) {
    res.status(500).json({ error: "Erro ao verificar email" })
  }
})

// Rotas protegidas - usar authenticate
router.use(authenticate) // Middleware de autenticação APENAS para as rotas abaixo
router.get("/validate", AuthController.validateToken)
router.get("/profile", AuthController.getProfile)
router.put("/profile", AuthController.updateProfile)
router.post("/change-password", AuthController.changePassword)

export default router

