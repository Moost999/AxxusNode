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
exports.checkMessageQuota = exports.authenticate = void 0;
const authService_1 = require("../services/authService");
const client_1 = require("@prisma/client");
const authService = new authService_1.AuthService();
const prisma = new client_1.PrismaClient();
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Leia o token dos cookies
        const token = req.cookies.token;
        if (!token)
            throw new Error('Token não encontrado');
        const user = yield authService.validateToken(token);
        req.userId = user.id; // Injeta userId na requisição
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Token inválido" });
    }
});
exports.authenticate = authenticate;
const checkMessageQuota = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userId)
            throw new Error("User ID not found in request");
        const user = yield prisma.user.findUnique({
            where: { id: req.userId },
            select: { availableMessages: true },
        });
        if (!user || user.availableMessages <= 0) {
            return res.status(402).json({
                success: false,
                message: "No available messages. Watch ads to get more credits.",
            });
        }
        next();
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.checkMessageQuota = checkMessageQuota;
