import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { Assistant } from '../models/assistant';

import path from 'path';
import { PrismaClient } from '@prisma/client';


function clearWhatsAppCache() {
  const cachePath = path.join(process.cwd(), '.wwebjs_auth');
  try {
    require('fs').rmSync(cachePath, { recursive: true, force: true });
    console.log('WhatsApp cache cleared');
  } catch (error) {
    console.error('Error clearing WhatsApp cache:', error);
  }
}

clearWhatsAppCache();



const prisma = new PrismaClient();

export class WhatsAppClient {
  private clients: Map<string, Client> = new Map();
  private qrCodes: Map<string, string> = new Map();
  private messageHandler: (from: string, body: string, assistantId: string) => Promise<void>;

  constructor(messageHandler: (from: string, body: string, assistantId: string) => Promise<void>) {
    this.messageHandler = messageHandler;
  }

  async initializeClient(assistantId: string): Promise<string> {
    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
      include: { user: true }
    });

    if (!assistant) {
      throw new Error('Assistant not found');
    }

    return new Promise((resolve, reject) => {
      const client = new Client({
        authStrategy: new LocalAuth({ clientId: assistantId }),
        puppeteer: { 
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      });

      client.on('qr', (qr) => {
        this.qrCodes.set(assistantId, qr);
        resolve(qr);
      });

      client.on('authenticated', () => {
        this.qrCodes.delete(assistantId);
        console.log(`Client ${assistantId} authenticated!`);
      });

      client.on('ready', () => {
        console.log(`Client ${assistantId} ready!`);
        this.clients.set(assistantId, client);
      });

      // Adicionar handler para mensagens recebidas
      client.on('message', async (message: Message) => {
        try {
          if (message.from && message.body) {
            await this.messageHandler(message.from, message.body, assistantId);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });

      client.initialize().catch(reject);
    });
  }

  async sendMessage(assistantId: string, to: string, message: string): Promise<void> {
    const client = this.clients.get(assistantId);
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }
    await client.sendMessage(to, message);
  }

  getClient(assistantId: string): Client | undefined {
    return this.clients.get(assistantId);
  }
}
