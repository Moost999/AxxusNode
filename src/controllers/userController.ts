// src/controllers/userController.ts
import type { Request, Response } from "express"
import * as userService from "../services/userService"

export async function createUser(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body // Adicione a extração da senha
    const user = await userService.createUser({ name, email, password }) // Passe a senha
    res.status(201).json(user)
  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create user" })
  }
}

export async function getUserTokens(req: Request, res: Response) {
  try {
    // Use o userId injetado pelo middleware de autenticação
    const userId = req.userId; // Modificado de req.params para req.userId
    
    const tokens = await userService.getUserTokens(userId!);
    res.json({ tokens });
    
  } catch (error) {
    console.error("Erro ao buscar tokens:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Falha na busca de tokens" 
    });
  }
}