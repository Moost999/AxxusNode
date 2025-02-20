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
exports.MessageProcessingService = void 0;
const geminiProvider_1 = require("../providers/geminiProvider");
const groqProvider_1 = require("../providers/groqProvider");
class MessageProcessingService {
    constructor(assistantService) {
        this.assistantService = assistantService;
        this.conversations = new Map();
    }
    getConversationKey(fromNumber, assistantId) {
        return `${fromNumber}-${assistantId}`;
    }
    processMessage(fromNumber, message, assistantId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assistant = yield this.assistantService.getAssistantById(assistantId);
                const conversationKey = this.getConversationKey(fromNumber, assistantId);
                let conversation = this.conversations.get(conversationKey);
                // Inicializar nova conversa com prompt do assistant
                if (!conversation) {
                    conversation = {
                        history: [{ role: 'system', content: assistant.initialPrompt }],
                        fromNumber,
                        assistantId,
                    };
                }
                // Adicionar mensagem do usuário
                conversation.history.push({
                    role: 'user',
                    content: message,
                });
                // Selecionar provider baseado na configuração do assistant
                let aiResponse;
                if (assistant.modelType === 'gemini') {
                    aiResponse = yield (0, geminiProvider_1.generateGeminiResponse)(conversation.history);
                }
                else {
                    aiResponse = yield (0, groqProvider_1.generateGroqResponse)(conversation.history);
                }
                // Adicionar resposta ao histórico
                conversation.history.push({
                    role: 'assistant',
                    content: aiResponse,
                });
                // Atualizar conversa
                this.conversations.set(conversationKey, conversation);
                return aiResponse;
            }
            catch (error) {
                console.error('Error processing message:', error);
                return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
            }
        });
    }
}
exports.MessageProcessingService = MessageProcessingService;
