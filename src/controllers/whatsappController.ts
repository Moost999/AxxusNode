import { Request, Response } from 'express';
import { WhatsAppClient } from '../services/whatsappService';
import { MessageProcessingService } from '../services/messageProcessingService';
import { AssistantService } from '../services/assistantService';

export class WhatsAppController {
  private whatsappClient: WhatsAppClient;
  private messageService: MessageProcessingService;

  constructor() {
    this.messageService = new MessageProcessingService(new AssistantService());
    
    // Criar o cliente do WhatsApp com o handler de mensagens
    this.whatsappClient = new WhatsAppClient(async (from: string, body: string, assistantId: string) => {
      try {
        const response = await this.messageService.processMessage(from, body, assistantId);
        await this.whatsappClient.sendMessage(assistantId, from, response);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
  }

  async connectWhatsApp(req: Request, res: Response) {
    try {
      const assistantId = "073d2be5-8154-4a3b-a6ae-b28c8cf8b414" // Pegar o assistantId do body ao invés de hardcoded
      const qrCode = await this.whatsappClient.initializeClient(assistantId);
    
      res.json({
        success: true,
        qrCode,
        message: 'Escaneie o QR code com o WhatsApp'
      });
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
      res.status(500).json({ error: 'Erro na conexão do WhatsApp' });
    }
  }
}