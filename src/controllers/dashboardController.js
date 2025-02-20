"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.dashboardController = {
    getStats: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.userId;
            console.log('userId: ', userId); // LOG DE DEBUG USERID DASHBOARDCONTROLLER.TS
            if (!userId) {
                res.status(401).json({ error: "Não autorizado" });
                return;
            }
            const user = yield prisma_1.default.user.findUnique({
                where: { id: userId },
                select: {
                    tokens: true,
                    availableMessages: true,
                    assistants: {
                        select: { id: true }
                    },
                }
            });
            if (!user) {
                res.status(404).json({ error: "Usuário não encontrado" });
                return;
            }
            // Contagem de chats ativos
            const activeChatsCount = yield prisma_1.default.chat.count({
                where: {
                    assistant: {
                        userId: userId
                    }
                }
            });
            res.json({
                totalAssistants: user.assistants.length,
                activeConversations: activeChatsCount,
                tokens: user.tokens,
                availableMessages: user.availableMessages
            });
        }
        catch (error) {
            console.error("Erro ao obter estatísticas do dashboard:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    })
};
