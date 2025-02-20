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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppController = void 0;
const whatsappService_1 = require("../services/whatsappService");
const messageProcessingService_1 = require("../services/messageProcessingService");
const assistantService_1 = require("../services/assistantService");
class WhatsAppController {
    constructor() {
        this.messageService = new messageProcessingService_1.MessageProcessingService(new assistantService_1.AssistantService());
        // Criar o cliente do WhatsApp com o handler de mensagens
        this.whatsappClient = new whatsappService_1.WhatsAppClient((from, body, assistantId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.messageService.processMessage(from, body, assistantId);
                yield this.whatsappClient.sendMessage(assistantId, from, response);
            }
            catch (error) {
                console.error('Error processing message:', error);
            }
        }));
    }
    connectWhatsApp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { assistantId } = req.body; // Pegar o assistantId do body ao invés de hardcoded
                if (!assistantId) {
                    return res.status(400).json({ error: "assistantId não informado" });
                }
                const qrCode = yield this.whatsappClient.initializeClient(assistantId);
                res.json({
                    success: true,
                    qrCode,
                    message: 'Escaneie o QR code com o WhatsApp'
                });
            }
            catch (error) {
                console.error('Error connecting WhatsApp:', error);
                res.status(500).json({ error: 'Erro na conexão do WhatsApp' });
            }
        });
    }
}
exports.WhatsAppController = WhatsAppController;
