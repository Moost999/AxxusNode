import { generateGeminiResponse } from '../providers/geminiProvider';
import { generateGroqResponse } from '../providers/groqProvider';
import { Assistant } from '../models/assistant';

interface Conversation {
  history: Array<{ role: string; content: string }>;
  fromNumber: string;
  assistantId: string;
}

export class MessageProcessingService {
  private conversations: Map<string, Conversation> = new Map();

  constructor(
    private assistantService: { getAssistantById: (id: string) => Promise<Assistant> }
  ) {}

  private getConversationKey(fromNumber: string, assistantId: string): string {
    return `${fromNumber}-${assistantId}`;
  }

  async processMessage(fromNumber: string, message: string, assistantId: string): Promise<string> {
    try {
      console.log('[4] Buscando assistant:', assistantId);
      const assistant = await this.assistantService.getAssistantById(assistantId);
      
      const conversationKey = this.getConversationKey(fromNumber, assistantId);
      console.log('[5] Chave da conversa:', conversationKey);

      let conversation = this.conversations.get(conversationKey) || {
        history: [{
          role: 'system',
          content: `Personalidade: ${assistant.initialPrompt}\nInstruções: ${assistant.initialPrompt}`
        }],
        fromNumber,
        assistantId
      };

      console.log('[6] Histórico atual:', JSON.stringify(conversation.history, null, 2));
      conversation.history.push({ role: 'user', content: message });
      console.log('[7] Histórico após mensagem do usuário:', JSON.stringify(conversation.history, null, 2));

      const aiResponse = assistant.modelType === 'gemini'
        ? await generateGeminiResponse(conversation.history)
        : await generateGroqResponse(conversation.history);

      console.log('[8] Resposta da IA:', aiResponse);
      conversation.history.push({ role: 'assistant', content: aiResponse });
      this.conversations.set(conversationKey, conversation);

      return aiResponse;
    } catch (error) {
      console.error('[ERRO] processMessage:', error);
      return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
    }
  }
}