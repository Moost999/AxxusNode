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
exports.generateGroqResponse = generateGroqResponse;
// src/providers/groqProvider.ts
const groq_sdk_1 = require("groq-sdk");
const enviroment_1 = require("../config/enviroment");
const groq = new groq_sdk_1.Groq({ apiKey: enviroment_1.GROQ_API_KEY });
function generateGroqResponse(messages) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const groqResponse = yield groq.chat.completions.create({
            messages,
            model: 'mixtral-8x7b-32768',
            temperature: 0.7,
            max_tokens: 1024,
        });
        return ((_b = (_a = groqResponse.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'No response generated';
    });
}
