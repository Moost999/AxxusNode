import express from "express"
import { authenticate } from "../middleware/auth"
import { PrismaClient } from "@prisma/client"

const router = express.Router()
const prisma = new PrismaClient()

router.get("/getSettings", authenticate, async (req, res): Promise<void> => {
  try {
    if (!req.userId) throw new Error("User ID not found in request");

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        geminiApiKey: true,
        groqApiKey: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error loading settings:", error);
    res.status(500).json({ success: false, message: "Failed to load settings" });
  }
});
 
router.put("/putSettings", authenticate, async (req, res) => {
  try {
    if (!req.userId) throw new Error("User ID not found in request");

    const { geminiApiKey, groqApiKey } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        geminiApiKey,
        groqApiKey,
      },
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ success: false, message: "Failed to update settings" });
  }
});

export default router

