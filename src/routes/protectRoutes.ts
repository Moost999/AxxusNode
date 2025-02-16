import express from "express"
import { authenticate } from "../middleware/auth"
import { AdService } from "../services/adService"
import { PrismaClient } from "@prisma/client"

const router = express.Router()
const adService = new AdService()
const prisma = new PrismaClient()

router.post("/watch-ad", authenticate, async (req, res) => {
  try {
    if (!req.userId) throw new Error("User ID not found in request")

    const result = await adService.handleAdView(req.userId)
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message })
  }
})

router.get("/user-stats", authenticate, async (req, res) => {
  try {
    if (!req.userId) throw new Error("User ID not found in request")

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        tokens: true,
        availableMessages: true,
        adViews: true,
        assistants: true,
      },
    })
    res.json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load stats" })
  }
})

export default router

