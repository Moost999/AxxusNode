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
Object.defineProperty(exports, "__esModule", { value: true });
exports.assistantController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AssistantController {
    constructor() {
        this.createAssistant = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: "Não autorizado" });
                    return;
                }
                const { name, model, personality, instructions, whatsappNumber } = req.body;
                if (!name || !model) {
                    res.status(400).json({ error: "Campos obrigatórios faltando" });
                    return;
                }
                const newAssistant = yield prisma.assistant.create({
                    data: {
                        name,
                        model,
                        personality,
                        instructions,
                        whatsappNumber,
                        userId,
                    },
                });
                // Após criar um assistente:
                yield prisma.notification.create({
                    data: {
                        userId: userId,
                        type: "Novo Assistente Criado",
                        message: `Novo assistente "${newAssistant.name}" criado!`,
                    }
                });
                res.status(201).json(newAssistant);
            }
            catch (error) {
                console.error("Error creating assistant:", error);
                res.status(500).json({
                    error: "Erro ao criar assistente",
                    details: error instanceof Error ? error.message : "Erro desconhecido",
                });
            }
        });
        this.getAssistants = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: "Não autorizado" });
                    return;
                }
                const assistants = yield prisma.assistant.findMany({
                    where: { userId },
                });
                res.json(assistants);
            }
            catch (error) {
                console.error("Error getting assistants:", error);
                res.status(500).json({
                    error: "Erro ao buscar assistentes",
                    details: error instanceof Error ? error.message : "Erro desconhecido",
                });
            }
        });
        this.getAssistantById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const { id } = req.params;
                const assistant = yield prisma.assistant.findUnique({
                    where: { id },
                    include: {
                        activeChats: true,
                        archivedChats: true,
                        files: true
                    },
                });
                if (!assistant || assistant.userId !== userId) {
                    res.status(404).json({ error: "Assistente não encontrado" });
                    return;
                }
                res.json(assistant);
            }
            catch (error) {
                console.error("Error getting assistant:", error);
                res.status(500).json({
                    error: "Erro ao buscar assistante",
                    details: error instanceof Error ? error.message : "Erro desconhecido",
                });
            }
        });
        this.updateAssistant = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const { id } = req.params;
                const existingAssistant = yield prisma.assistant.findUnique({
                    where: { id },
                });
                if (!existingAssistant || existingAssistant.userId !== userId) {
                    res.status(404).json({ error: "Assistente não encontrado" });
                    return;
                }
                const updatedAssistant = yield prisma.assistant.update({
                    where: { id },
                    data: req.body,
                });
                res.json(updatedAssistant);
            }
            catch (error) {
                console.error("Error updating assistant:", error);
                res.status(500).json({
                    error: "Erro ao atualizar assistente",
                    details: error instanceof Error ? error.message : "Erro desconhecido",
                });
            }
        });
        this.deleteAssistant = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const { id } = req.params;
                const existingAssistant = yield prisma.assistant.findUnique({
                    where: { id },
                });
                if (!existingAssistant || existingAssistant.userId !== userId) {
                    res.status(404).json({ error: "Assistente não encontrado" });
                    return;
                }
                // Delete active chats associated with the assistant
                yield prisma.chat.deleteMany({
                    where: { assistantId: id },
                });
                // Delete archived chats associated with the assistant
                yield prisma.chat.deleteMany({
                    where: { archivedById: id },
                });
                // Delete files associated with the assistant
                yield prisma.file.deleteMany({
                    where: { assistantId: id },
                });
                const deletedAssistant = yield prisma.assistant.delete({
                    where: { id },
                });
                res.json({
                    message: "Assistente deletado com sucesso",
                    deletedAssistant,
                });
            }
            catch (error) {
                console.error("Error deleting assistant:", error);
                res.status(500).json({
                    error: "Erro ao deletar assistente",
                    details: error instanceof Error ? error.message : "Erro desconhecido",
                });
            }
        });
    }
}
exports.assistantController = new AssistantController();
