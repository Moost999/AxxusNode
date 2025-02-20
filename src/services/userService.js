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
exports.createUser = createUser;
exports.getUserTokens = getUserTokens;
// src/services/userService.ts
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
function createUser(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new Error("Email already registered");
        }
        const hashedPassword = yield bcrypt_1.default.hash(data.password, 10);
        const user = yield prisma_1.default.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                tokens: 0, // Valor padrão conforme schema
                availableMessages: 100, // Valor padrão
                adViews: 0,
                adCooldown: 24,
                groqApiKey: '',
                geminiApiKey: ''
            }
        });
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            tokens: user.tokens,
            availableMessages: user.availableMessages
        };
    });
}
// Adicione a função faltante
function getUserTokens(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({
            where: { id },
            select: { tokens: true }
        });
        if (!user)
            throw new Error("User not found");
        return user.tokens;
    });
}
