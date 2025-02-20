"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEMINI_API_KEY = exports.GROQ_API_KEY = exports.PORT = void 0;
// src/config/environment.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT || 3000;
exports.GROQ_API_KEY = process.env.GROQ_API_KEY || '';
exports.GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
