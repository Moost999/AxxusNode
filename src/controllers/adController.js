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
exports.AdController = void 0;
const adService_1 = require("../services/adService");
const prisma_1 = __importDefault(require("../lib/prisma"));
const adService = new adService_1.AdService();
class AdController {
    static viewAd(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: 'User not authenticated' });
                    return;
                }
                const { timeViewed, adClicked } = req.body;
                // Verificar se o usuário cumpriu os requisitos
                if (!adClicked) {
                    res.status(400).json({
                        success: false,
                        error: 'Você precisa clicar em pelo menos um anúncio'
                    });
                    return;
                }
                if (timeViewed < parseInt(process.env.AD_MIN_VIEW_TIME || '60000') / 1000) {
                    res.status(400).json({
                        success: false,
                        error: 'Você precisa assistir o anúncio por pelo menos 1 minuto'
                    });
                    return;
                }
                const result = yield adService.handleAdView(userId);
                res.json({
                    success: true,
                    message: 'Ad view processed successfully',
                    data: result
                });
            }
            catch (error) {
                console.error('Error in ad view controller:', error);
                res.status(400).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to process ad view'
                });
            }
        });
    }
    static getAdStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: 'User not authenticated' });
                    return;
                }
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId },
                    select: {
                        adViews: true,
                        lastAdView: true
                    }
                });
                if (!user) {
                    res.status(404).json({ error: 'User not found' });
                    return;
                }
                let cooldown = 0;
                if (user.lastAdView && user.adViews >= parseInt(process.env.AD_MAX_VIEWS_PER_PERIOD || '10')) {
                    const lastView = new Date(user.lastAdView);
                    const now = new Date();
                    const diffMinutes = Math.floor((now.getTime() - lastView.getTime()) / (1000 * 60));
                    const adPeriodMinutes = parseInt(process.env.AD_PERIOD_MINUTES || '30');
                    cooldown = Math.max(0, adPeriodMinutes - diffMinutes);
                }
                res.json({
                    success: true,
                    data: {
                        adViews: user.adViews,
                        cooldown,
                        canWatchAd: cooldown === 0 && user.adViews < parseInt(process.env.AD_MAX_VIEWS_PER_PERIOD || '10')
                    }
                });
            }
            catch (error) {
                console.error('Error getting ad status:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get ad status'
                });
            }
        });
    }
}
exports.AdController = AdController;
