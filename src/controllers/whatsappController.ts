import { Request, Response } from 'express';
import { WhatsAppClient } from '../services/whatsappService';
import { MessageProcessingService } from '../services/messageProcessingService';
import { AssistantService } from '../services/assistantService';
import { ApiKeyService } from '../services/apiKeyService';
import { LeadService } from '../services/leadService';

export class WhatsAppController {
  private whatsappClient: WhatsAppClient;
  private messageService: MessageProcessingService;
  private leadService: LeadService;

  constructor() {
    this.leadService = new LeadService();
    this.messageService = new MessageProcessingService(
      new AssistantService(),
      new ApiKeyService(),
      this.leadService
    );

    this.whatsappClient = new WhatsAppClient(async (from: string, body: string, assistantId: string) => {
      try {
        console.log('[1] Mensagem recebida de:', from, 'Conteúdo:', body);
        const response = await this.messageService.processMessage(from, body, assistantId);
        console.log('[2] Resposta gerada:', response);
        await this.whatsappClient.sendMessage(assistantId, from, response);
        console.log('[3] Mensagem enviada com sucesso para:', from);
      } catch (error) {
        console.error('[ERRO] Fluxo principal:', error);
      }
    });
  }

  async connectWhatsApp(req: Request, res: Response) {
    try {
      const { assistantId } = req.body;
      console.log('[INÍCIO] Solicitação de conexão para assistant:', assistantId);
      
      if (!assistantId) {
        console.error('[ERRO] assistantId ausente');
         res.status(400).json({ error: "assistantId não informado" });
        return
        }
      
      const qrCode = await this.whatsappClient.initializeClient(assistantId);
      console.log('[QR CODE] Gerado para assistant:', assistantId);
    
      res.json({ success: true, qrCode, message: 'Escaneie o QR code com o WhatsApp' });
    } catch (error) {
      console.error('[ERRO CRÍTICO] connectWhatsApp:', error);
      res.status(500).json({ error: 'Erro na conexão do WhatsApp' });
    }
  }

  async getLeads(req: Request, res: Response) {
    try {
      const { assistantId } = req.params                                    // const assistantId  = "67bccbb3e8a35509dbe0307d" preset com userid fix
      if (!assistantId) {
         res.status(400).json({ error: "assistantId é obrigatório" });
        return
        }
      
      const leads = await this.leadService.getLeads(assistantId);
      res.json({ 
        success: true,
        data: {
          count: leads.length,
          leads: leads.map(lead => ({
            id: lead.id,
            phone: lead.phone,
            createdAt: lead.createdAt
          }))
        }
      });
    } catch (error) {
      console.error('[ERRO] Ao buscar leads:', error);
      res.status(500).json({ 
        error: 'Erro ao buscar leads',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}