import { Assistant } from '../models/assistant';
import { generateGeminiResponse } from '../providers/geminiProvider';
import { generateGroqResponse } from '../providers/groqProvider';
import { ApiKeyService } from './apiKeyService';
import { LeadService } from './leadService';

interface Conversation {
  history: Array<{ role: string; content: string }>;
  fromNumber: string;
  assistantId: string;
}

export class MessageProcessingService {
  private conversations: Map<string, Conversation> = new Map();

  constructor(
    private assistantService: { getAssistantById: (id: string) => Promise<Assistant> },
    private apiKeyService: ApiKeyService,
    private leadService: LeadService
  ) {}

  private getConversationKey(fromNumber: string, assistantId: string): string {
    return `${fromNumber}-${assistantId}`;
  }

  private async getModelResponse(assistant: Assistant, messages: any[]): Promise<string> {
    const { geminiKey, groqKey } = await this.apiKeyService.getUserApiKeys(assistant.id);

    if (assistant.modelType === 'gemini') {
      if (!geminiKey) throw new Error('Gemini API key not configured');
      return generateGeminiResponse(messages, geminiKey);
    }
    if (!groqKey) throw new Error('Groq API key not configured');
    return generateGroqResponse(messages, groqKey);
  }

  async processMessage(
    fromNumber: string,
    message: string,
    assistantId: string
  ): Promise<string> {
    try {
      if (!fromNumber || !message || !assistantId) {
        throw new Error('Parâmetros inválidos');
      }

      // Salvar o lead
      await this.leadService.addLead(fromNumber, assistantId);

      const assistant = await this.assistantService.getAssistantById(assistantId);
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
      
      const aiResponse = await this.getModelResponse(assistant, conversation.history);
      
      conversation.history.push({ role: 'assistant', content: aiResponse });
      this.conversations.set(conversationKey, conversation);

      return aiResponse;
    } catch (error) {
      console.error('Erro no processamento:', error);
      return 'Erro: Verifique suas chaves de API configuradas';
    }
  }
}