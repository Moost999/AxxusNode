// src/providers/groqProvider.ts
import { Groq } from 'groq-sdk';
import { GROQ_API_KEY } from '../config/enviroment';

const groq = new Groq({ apiKey: GROQ_API_KEY });

export async function generateGroqResponse(messages: any[]) {
  const groqResponse = await groq.chat.completions.create({
    messages,
    model: 'mixtral-8x7b-32768',
    temperature: 0.7,
    max_tokens: 1024,
  });
  return groqResponse.choices[0]?.message?.content || 'No response generated';
}