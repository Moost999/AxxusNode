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
exports.generateGeminiResponse = generateGeminiResponse;
// src/providers/geminiProvider.ts
const generative_ai_1 = require("@google/generative-ai");
const enviroment_1 = require("../config/enviroment");
const genAI = new generative_ai_1.GoogleGenerativeAI(enviroment_1.GEMINI_API_KEY);
function generateGeminiResponse(messages) {
    return __awaiter(this, void 0, void 0, function* () {
        const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = yield geminiModel.generateContent(messages.map(msg => msg.content).join('\n'));
        return result.response.text();
    });
}
