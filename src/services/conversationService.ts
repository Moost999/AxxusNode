// src/services/messageProcessingService.ts
import { Request } from 'express';
import { generateGeminiResponse } from '../providers/geminiProvider';
import { generateGroqResponse } from '../providers/groqProvider';
import { Assistant } from '../models/assistant'; // Supondo que você tenha um modelo de Assistant

interface Conversation {
  history: Array<{ role: string; content: string }>;
  fromNumber: string;
  assistantId: string;
}

export class MessageProcessingService {
  private conversations: Map<string, Conversation> = new Map();

  constructor(
    private assistantService: {
      getAssistantById: (id: string) => Promise<Assistant>;
    }
  ) {}

  private getConversationKey(fromNumber: string, assistantId: string): string {
    return `${fromNumber}-${assistantId}`;
  }

  async processMessage(
    fromNumber: string,
    message: string,
    assistantId: string
  ): Promise<string> {
    try {
      const assistant = await this.assistantService.getAssistantById(assistantId);
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
      let aiResponse: string;
      if (assistant.modelType === 'gemini') {
        const geminiApiKey = 'your-gemini-api-key-here'; // Replace with the actual API key
        aiResponse = await generateGeminiResponse(conversation.history, geminiApiKey);
      } else {
        const groqApiKey = 'your-groq-api-key-here'; // Replace with the actual API key
        aiResponse = await generateGroqResponse(conversation.history, groqApiKey);
      }

      // Adicionar resposta ao histórico
      conversation.history.push({
        role: 'assistant',
        content: aiResponse,
      });

      // Atualizar conversa
      this.conversations.set(conversationKey, conversation);

      return aiResponse;
    } catch (error) {
      console.error('Error processing message:', error);
      return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
    }
  }
}