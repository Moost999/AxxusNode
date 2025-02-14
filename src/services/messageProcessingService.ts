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

    const aiResponse = assistant.modelType === 'gemini'
      ? await generateGeminiResponse(conversation.history)
      : await generateGroqResponse(conversation.history);

    conversation.history.push({ role: 'assistant', content: aiResponse });
    this.conversations.set(conversationKey, conversation);

    return aiResponse;
  }
}