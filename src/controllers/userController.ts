import { Request, Response } from "express";
import { userService } from "../services/userService";

class UserController {
  // Método para carregar os dados do usuário
  async getUserData(req: Request, res: Response) {
    try {
      const userId = req.userId; // Obtém o userId do middleware de autenticação
      const userData = await userService.getUserData(userId);
      res.json(userData);
    } catch (error) {
      res.status(500).json({
        error: "Erro ao carregar dados do usuário",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }


  // Método para trocar tokens por mensagens
  async convertTokensToMessages(req: Request, res: Response) {
    try {
      const userId = req.userId; // Obtém o userId do middleware de autenticação
      const { tokens } = req.body;

      const result = await userService.convertTokensToMessages(userId, tokens);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: "Erro ao trocar tokens por mensagens",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // Método para obter a quantidade de tokens do usuário
  async getTokens(req: Request, res: Response) {
    try {
      const userId = req.userId; // Obtém o userId do middleware de autenticação
      const user = await userService.getUserData(userId);
      res.json({ tokens: user.tokens });
    } catch (error) {
      res.status(500).json({
        error: "Erro ao obter tokens do usuário",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
}

export const userController = new UserController();