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
    console.log('[WhatsAppClient] Service initialized');
  }

  private async clearSessionData(assistantId: string) {
    const sessionDir = path.join(process.cwd(), '.wwebjs_auth', `session-${assistantId}`);
    console.log(`[WhatsAppClient] Attempting to clear session data for ${assistantId} at ${sessionDir}`);
    
    try {
      if (fs.existsSync(sessionDir)) {
        await fs.promises.rm(sessionDir, { recursive: true, force: true });
        console.log(`[WhatsAppClient] Session data cleared successfully for assistant ${assistantId}`);
      } else {
        console.log(`[WhatsAppClient] No existing session data found for assistant ${assistantId}`);
      }
    } catch (error) {
      console.error(`[WhatsAppClient] Error clearing session data for assistant ${assistantId}:`, error);
    }
  }

  private async destroyClient(assistantId: string) {
    console.log(`[WhatsAppClient] Attempting to destroy client for ${assistantId}`);
    const client = this.clients.get(assistantId);
    if (client) {
      try {
        console.log(`[WhatsAppClient] Destroying existing client for ${assistantId}`);
        await client.destroy();
        this.clients.delete(assistantId);
        this.qrCodes.delete(assistantId);
        await this.clearSessionData(assistantId);
        console.log(`[WhatsAppClient] Client ${assistantId} destroyed successfully`);
      } catch (error) {
        console.error(`[WhatsAppClient] Error destroying client ${assistantId}:`, error);
      }
    } else {
      console.log(`[WhatsAppClient] No existing client found for ${assistantId}`);
    }
  }

  async initializeClient(assistantId: string): Promise<string> {
    console.log(`[WhatsAppClient] Starting initialization for assistant ${assistantId}`);

    if (this.clientInitializationPromises.has(assistantId)) {
      console.log(`[WhatsAppClient] Initialization already in progress for ${assistantId}`);
      const existingQr = this.qrCodes.get(assistantId);
      if (existingQr) {
        console.log(`[WhatsAppClient] Returning existing QR code for ${assistantId}`);
        return existingQr;
      }
    }

    await this.destroyClient(assistantId);

    const initializationPromise = new Promise<string>(async (resolve, reject) => {
      try {
        console.log(`[WhatsAppClient] Fetching assistant data for ${assistantId}`);
        const assistant = await prisma.assistant.findUnique({
          where: { id: assistantId },
          include: { user: true }
        });

        if (!assistant) {
          console.error(`[WhatsAppClient] Assistant ${assistantId} not found`);
          throw new Error('Assistant not found');
        }

        console.log(`[WhatsAppClient] Creating new client for ${assistantId}`);
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
          console.log(`[WhatsAppClient] QR Code received for ${assistantId}`);
          this.qrCodes.set(assistantId, qr);
          if (!qrCodeResolved) {
            qrCodeResolved = true;
            resolve(qr);
          }
        });

        client.on('loading_screen', (percent, message) => {
          console.log(`[WhatsAppClient] Loading: ${percent}% - ${message}`);
        });

        client.on('authenticated', () => {
          console.log(`[WhatsAppClient] Client ${assistantId} authenticated successfully`);
        });

        client.on('auth_failure', async (msg) => {
          console.error(`[WhatsAppClient] Authentication failed for ${assistantId}:`, msg);
          await this.destroyClient(assistantId);
          reject(new Error('Authentication failed'));
        });

        client.on('disconnected', async (reason) => {
          console.log(`[WhatsAppClient] Client ${assistantId} disconnected. Reason:`, reason);
          await this.destroyClient(assistantId);
        });

        client.on('ready', () => {
          console.log(`[WhatsAppClient] Client ${assistantId} is ready and active`);
          this.clients.set(assistantId, client);
          if (!qrCodeResolved) {
            qrCodeResolved = true;
            resolve(this.qrCodes.get(assistantId) || '');
          }
        });

        client.on('message', async (message: Message) => {
          if (message.from && message.body) {
            console.log(`[WhatsAppClient] Message received from ${message.from} for assistant ${assistantId}:`, message.body);
            try {
              await this.messageHandler(message.from, message.body, assistantId);
              console.log(`[WhatsAppClient] Message processed successfully for ${assistantId}`);
            } catch (error) {
              console.error(`[WhatsAppClient] Error processing message for ${assistantId}:`, error);
            }
          }
        });

        console.log(`[WhatsAppClient] Initializing client for ${assistantId}`);
        await client.initialize();
        console.log(`[WhatsAppClient] Client initialization completed for ${assistantId}`);
      } catch (error) {
        console.error(`[WhatsAppClient] Error during initialization for ${assistantId}:`, error);
        await this.destroyClient(assistantId);
        reject(error);
      }
    });

    this.clientInitializationPromises.set(assistantId, initializationPromise.then());
    return initializationPromise;
  }

  async sendMessage(assistantId: string, to: string, message: string): Promise<void> {
    console.log(`[WhatsAppClient] Attempting to send message to ${to} from assistant ${assistantId}`);
    const client = this.clients.get(assistantId);
    if (!client) {
      console.error(`[WhatsAppClient] Client not found for assistant ${assistantId}`);
      throw new Error('WhatsApp client not initialized');
    }
    try {
      await client.sendMessage(to, message);
      console.log(`[WhatsAppClient] Message sent successfully to ${to} from assistant ${assistantId}`);
    } catch (error) {
      console.error(`[WhatsAppClient] Error sending message for client ${assistantId}:`, error);
      throw error;
    }
  }

  getClient(assistantId: string): Client | undefined {
    return this.clients.get(assistantId);
  }
}