// src/providers/geminiProvider.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/enviroment';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function generateGeminiResponse(messages: any[]) {
  const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await geminiModel.generateContent(messages.map(msg => msg.content).join('\n'));
  return result.response.text();
}