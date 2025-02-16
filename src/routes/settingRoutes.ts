import express from "express"
import { authenticate } from "../middleware/auth"
import { PrismaClient } from "@prisma/client"

const router = express.Router()
const prisma = new PrismaClient()

router.get("/settings", authenticate, async (req, res) => {
  try {
    if (!req.userId) throw new Error("User ID not found in request")

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { settings: true },
    })
    res.json({ success: true, data: user?.settings })
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load settings" })
  }
})

router.put("/settings", authenticate, async (req, res) => {
  try {
    if (!req.userId) throw new Error("User ID not found in request")

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { settings: req.body },
    })
    res.json({ success: true, data: updatedUser.settings })
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update settings" })
  }
})

export default router

