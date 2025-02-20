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
const express_1 = require("express");
const authService_1 = require("../services/authService");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const router = (0, express_1.Router)();
const authService = new authService_1.AuthService();
router.use((0, cookie_parser_1.default)());
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, token } = yield authService.registerUser(req.body.name, req.body.email, req.body.password);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 604800000 // 7 dias
        });
        res.status(201).json({ success: true, user });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Registration failed'
        });
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, token } = yield authService.loginUser(req.body.email, req.body.password);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 604800000
        });
        res.json({ success: true, user });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error instanceof Error ? error.message : 'Login failed'
        });
    }
}));
router.get('/validate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token; // Lê do cookie
        console.log(token);
        if (!token)
            throw new Error('No token');
        const user = yield authService.validateToken(token);
        res.json({ success: true, user });
    }
    catch (error) {
        res.clearCookie('token');
        res.status(401).json({ success: false }); // Resposta explícita
    }
}));
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});
exports.default = router;
