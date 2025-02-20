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
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const node_cron_1 = __importDefault(require("node-cron"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Buscar notificações não lidas
router.get('/', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notifications = yield prisma.notification.findMany({
            where: { userId: req.userId, read: false },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: notifications });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
}));
// Marcar como lida
router.patch('/:id/read', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.notification.update({
            where: { id: req.params.id },
            data: { read: true },
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to mark notification' });
    }
}));
// Deleção automática (executa a cada hora)
node_cron_1.default.schedule('0 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
        const deletedNotifications = yield prisma.notification.deleteMany({
            where: {
                createdAt: { lt: twelveHoursAgo },
            },
        });
        console.log(`Deleted ${deletedNotifications.count} notifications.`);
    }
    catch (error) {
        console.error('Error deleting notifications:', error);
    }
}));
exports.default = router;
