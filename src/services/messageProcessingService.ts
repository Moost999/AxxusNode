import { generateGeminiResponse } from '../providers/geminiProvider';
import { generateGroqResponse } from '../providers/groqProvider';
import { Assistant } from '../models/assistant';

interface Conversation {
  history: Array<{ role: string; content: string }>;
  fromNumber: string;
  assistantId: string;
  buffer: string; // Buffer para agrupar mensagens do usuário
  timeoutId?: NodeJS.Timeout; // Timeout para aguardar mais mensagens
}

export class MessageProcessingService {
  private conversations: Map<string, Conversation> = new Map();

  constructor(
    private assistantService: { getAssistantById: (id: string) => Promise<Assistant> }
  ) {}

  private getConversationKey(fromNumber: string, assistantId: string): string {
    return `${fromNumber}-${assistantId}`;
  }

  private async getModelResponse(assistant: Assistant, messages: any[]): Promise<string> {
    if (assistant.modelType === 'gemini') {
      return await generateGeminiResponse(messages);
    } else {
      return await generateGroqResponse(messages);
    }
  }

  private async processBufferedMessage(conversationKey: string, conversation: Conversation) {
    if (conversation.buffer) {
      // Adiciona a mensagem bufferizada ao histórico
      conversation.history.push({ role: 'user', content: conversation.buffer });
      console.log('[7] Histórico após mensagem do usuário:', JSON.stringify(conversation.history, null, 2));

      const assistant = await this.assistantService.getAssistantById(conversation.assistantId);
      const aiResponse = await this.getModelResponse(assistant, conversation.history);

      console.log('[8] Resposta da IA:', aiResponse);
      conversation.history.push({ role: 'assistant', content: aiResponse });
      this.conversations.set(conversationKey, conversation);

      // Limpa o buffer após processar
      conversation.buffer = '';
    }
  }

  async processMessage(fromNumber: string, message: string, assistantId: string): Promise<string> {
    try {
      if (!fromNumber || !message || !assistantId) {
        throw new Error('Parâmetros inválidos: fromNumber, message e assistantId são obrigatórios.');
      }

      const conversationKey = this.getConversationKey(fromNumber, assistantId);
      let conversation = this.conversations.get(conversationKey);

      if (!conversation) {
        const assistant = await this.assistantService.getAssistantById(assistantId);
        conversation = {
          history: [{
            role: 'system',
            content: `Personalidade: ${assistant.initialPrompt}\nInstruções: ${assistant.initialPrompt}`
          }],
          fromNumber,
          assistantId,
          buffer: '',
        };
        this.conversations.set(conversationKey, conversation);
      }

      // Adiciona a mensagem ao buffer
      conversation.buffer += message + ' ';

      // Reinicia o timeout se já existir
      if (conversation.timeoutId) {
        clearTimeout(conversation.timeoutId);
      }

      // Aguarda 5 segundos para ver se o usuário envia mais mensagens
      conversation.timeoutId = setTimeout(async () => {
        await this.processBufferedMessage(conversationKey, conversation!);
      }, 5000); // 5 segundos de timeout

      return 'Aguardando mais mensagens...'; // Resposta temporária
    } catch (error) {
      console.error('[ERRO] processMessage:', error);
      return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
    }
  }
}