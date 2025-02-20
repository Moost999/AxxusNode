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
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get("/getSettings", auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userId)
            throw new Error("User ID not found in request");
        const user = yield prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                geminiApiKey: true,
                groqApiKey: true,
            },
        });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        console.error("Error loading settings:", error);
        res.status(500).json({ success: false, message: "Failed to load settings" });
    }
}));
router.put("/putSettings", auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userId)
            throw new Error("User ID not found in request");
        const { geminiApiKey, groqApiKey } = req.body;
        const updatedUser = yield prisma.user.update({
            where: { id: req.userId },
            data: {
                geminiApiKey,
                groqApiKey,
            },
        });
        res.json({ success: true, data: updatedUser });
    }
    catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ success: false, message: "Failed to update settings" });
    }
}));
exports.default = router;
