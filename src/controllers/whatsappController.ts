import { Request, Response } from 'express';
import { WhatsAppClient } from '../services/whatsappService';
import { MessageProcessingService } from '../services/messageProcessingService';
import { AssistantService } from '../services/assistantService';

export class WhatsAppController {
  private whatsappClient: WhatsAppClient;
  private messageService: MessageProcessingService;

  constructor() {
    this.messageService = new MessageProcessingService(new AssistantService());
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
      const { assistantId } = req.body;
      
      if (!assistantId) {
        return res.status(400).json({ error: "assistantId não informado" });
      }

      const qrCode = await this.whatsappClient.initializeClient(assistantId);
      
      res.json({
        success: true,
        qrCode,
        message: 'Escaneie o QR code com o WhatsApp'
      });
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
      res.status(500).json({ 
        error: 'Erro na conexão do WhatsApp',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}