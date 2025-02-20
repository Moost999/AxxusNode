"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppClient = void 0;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
function clearWhatsAppCache() {
    const cachePath = path_1.default.join(process.cwd(), '.wwebjs_auth');
    try {
        require('fs').rmSync(cachePath, { recursive: true, force: true });
        console.log('WhatsApp cache cleared');
    }
    catch (error) {
        console.error('Error clearing WhatsApp cache:', error);
    }
}
clearWhatsAppCache();
const prisma = new client_1.PrismaClient();
class WhatsAppClient {
    constructor(messageHandler) {
        this.clients = new Map();
        this.qrCodes = new Map();
        this.messageHandler = messageHandler;
    }
    initializeClient(assistantId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assistant = yield prisma.assistant.findUnique({
                where: { id: assistantId },
                include: { user: true }
            });
            if (!assistant) {
                throw new Error('Assistant not found');
            }
            return new Promise((resolve, reject) => {
                const client = new whatsapp_web_js_1.Client({
                    authStrategy: new whatsapp_web_js_1.LocalAuth({ clientId: assistantId }),
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
                client.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        if (message.from && message.body) {
                            yield this.messageHandler(message.from, message.body, assistantId);
                        }
                    }
                    catch (error) {
                        console.error('Error processing message:', error);
                    }
                }));
                client.initialize().catch(reject);
            });
        });
    }
    sendMessage(assistantId, to, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.clients.get(assistantId);
            if (!client) {
                throw new Error('WhatsApp client not initialized');
            }
            yield client.sendMessage(to, message);
        });
    }
    getClient(assistantId) {
        return this.clients.get(assistantId);
    }
}
exports.WhatsAppClient = WhatsAppClient;
