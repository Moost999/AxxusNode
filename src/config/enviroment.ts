// src/config/environment.ts
import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''