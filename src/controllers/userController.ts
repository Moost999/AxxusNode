import type { Request, Response } from "express"
import * as userService from "../services/userService"

export async function createUser(req: Request, res: Response) {
  try {
    const { name, email } = req.body
    const user = await userService.createUser({ name, email })
    res.status(201).json(user)
  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({ error: "Failed to create user" })
  }
}

export async function getUserTokens(req: Request, res: Response) {
  try {
    const { userId } = req.params
    const tokens = await userService.getUserTokens(userId)
    res.json({ tokens })
  } catch (error) {
    console.error("Error getting user tokens:", error)
    res.status(500).json({ error: "Failed to get user tokens" })
  }
}

