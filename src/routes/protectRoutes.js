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
const auth_1 = require("../middleware/auth");
const adService_1 = require("../services/adService");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const adService = new adService_1.AdService();
const prisma = new client_1.PrismaClient();
router.post("/watch-ad", auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userId)
            throw new Error("User ID not found in request");
        const result = yield adService.handleAdView(req.userId);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}));
router.get("/user-stats", auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userId)
            throw new Error("User ID not found in request");
        const user = yield prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                tokens: true,
                availableMessages: true,
                adViews: true,
                assistants: true,
            },
        });
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to load stats" });
    }
}));
exports.default = router;
