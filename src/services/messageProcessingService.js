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
            const assistant = yield this.assistantService.getAssistantById(assistantId);
            const conversationKey = this.getConversationKey(fromNumber, assistantId);
            let conversation = this.conversations.get(conversationKey) || {
                history: [{
                        role: 'system',
                        content: `Personalidade: ${assistant.initialPrompt}\nInstruções: ${assistant.initialPrompt}`
                    }],
                fromNumber,
                assistantId
            };
            conversation.history.push({ role: 'user', content: message });
            const aiResponse = assistant.modelType === 'gemini'
                ? yield (0, geminiProvider_1.generateGeminiResponse)(conversation.history)
                : yield (0, groqProvider_1.generateGroqResponse)(conversation.history);
            conversation.history.push({ role: 'assistant', content: aiResponse });
            this.conversations.set(conversationKey, conversation);
            return aiResponse;
        });
    }
}
exports.MessageProcessingService = MessageProcessingService;
