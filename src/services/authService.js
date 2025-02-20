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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
class AuthService {
    registerUser(name, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield prisma.user.findUnique({ where: { email } });
            if (existingUser)
                throw new Error('Email already registered');
            const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
            const user = yield prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    tokens: 100,
                    availableMessages: 100,
                    geminiApiKey: '',
                    groqApiKey: '',
                }
            });
            return this.generateAuthResponse(user);
        });
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({ where: { email } });
            if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
                throw new Error('Invalid credentials');
            }
            return this.generateAuthResponse(user);
        });
    }
    validateToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                const user = yield prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        password: true,
                        tokens: true,
                        availableMessages: true,
                        adViews: true,
                        lastAdView: true,
                        adCooldown: true,
                        geminiApiKey: true,
                        groqApiKey: true,
                        createdAt: true,
                        updatedAt: true
                    }
                });
                if (!user)
                    throw new Error('User not found');
                return user;
            }
            catch (error) {
                throw new Error('Invalid token');
            }
        });
    }
    generateAuthResponse(user) {
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        const { password } = user, userData = __rest(user, ["password"]);
        return { user: userData, token };
    }
}
exports.AuthService = AuthService;
