import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export class WhatsAppClient {
  private clients: Map<string, Client> = new Map();
  private qrCodes: Map<string, string> = new Map();
  private clientInitializationPromises: Map<string, Promise<void>> = new Map();
  private messageHandler: (from: string, body: string, assistantId: string) => Promise<void>;

  constructor(messageHandler: (from: string, body: string, assistantId: string) => Promise<void>) {
    this.messageHandler = messageHandler;
  }

  private async clearSessionData(assistantId: string) {
    const sessionDir = path.join(process.cwd(), '.wwebjs_auth', `session-${assistantId}`);
    try {
      if (fs.existsSync(sessionDir)) {
        await fs.promises.rm(sessionDir, { recursive: true, force: true });
        console.log(`Session data cleared for assistant ${assistantId}`);
      }
    } catch (error) {
      console.error(`Error clearing session data for assistant ${assistantId}:`, error);
    }
  }

  private async destroyClient(assistantId: string) {
    const client = this.clients.get(assistantId);
    if (client) {
      try {
        await client.destroy();
        this.clients.delete(assistantId);
        this.qrCodes.delete(assistantId);
        await this.clearSessionData(assistantId);
        console.log(`Client ${assistantId} destroyed successfully`);
      } catch (error) {
        console.error(`Error destroying client ${assistantId}:`, error);
      }
    }
  }

  async initializeClient(assistantId: string): Promise<string> {
    // Se já existe uma inicialização em andamento, retorna o QR code existente
    if (this.clientInitializationPromises.has(assistantId)) {
      const existingQr = this.qrCodes.get(assistantId);
      if (existingQr) return existingQr;
    }

    // Se já existe um cliente, destrua-o primeiro
    await this.destroyClient(assistantId);

    const initializationPromise = new Promise<string>(async (resolve, reject) => {
      try {
        const assistant = await prisma.assistant.findUnique({
          where: { id: assistantId },
          include: { user: true }
        });

        if (!assistant) {
          throw new Error('Assistant not found');
        }

        const client = new Client({
          authStrategy: new LocalAuth({ 
            clientId: `session-${assistantId}`,
            dataPath: path.join(process.cwd(), '.wwebjs_auth')
          }),
          puppeteer: { 
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--disable-gpu'
            ]
          }
        });

        let qrCodeResolved = false;

        client.on('qr', (qr) => {
          this.qrCodes.set(assistantId, qr);
          if (!qrCodeResolved) {
            qrCodeResolved = true;
            resolve(qr);
          }
        });

        client.on('authenticated', () => {
          console.log(`Client ${assistantId} authenticated`);
        });

        client.on('auth_failure', async (msg) => {
          console.error(`Auth failure for client ${assistantId}:`, msg);
          await this.destroyClient(assistantId);
          reject(new Error('Authentication failed'));
        });

        client.on('disconnected', async (reason) => {
          console.log(`Client ${assistantId} disconnected:`, reason);
          await this.destroyClient(assistantId);
        });

        client.on('ready', () => {
          console.log(`Client ${assistantId} is ready`);
          this.clients.set(assistantId, client);
          if (!qrCodeResolved) {
            qrCodeResolved = true;
            resolve(this.qrCodes.get(assistantId) || '');
          }
        });

        client.on('message', async (message: Message) => {
          if (message.from && message.body) {
            try {
              await this.messageHandler(message.from, message.body, assistantId);
            } catch (error) {
              console.error('Error processing message:', error);
            }
          }
        });

        await client.initialize();
      } catch (error) {
        console.error(`Error initializing client ${assistantId}:`, error);
        await this.destroyClient(assistantId);
        reject(error);
      }
    });

    this.clientInitializationPromises.set(assistantId, initializationPromise.then());
    return initializationPromise;
  }

  async sendMessage(assistantId: string, to: string, message: string): Promise<void> {
    const client = this.clients.get(assistantId);
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }
    try {
      await client.sendMessage(to, message);
    } catch (error) {
      console.error(`Error sending message for client ${assistantId}:`, error);
      throw error;
    }
  }
}