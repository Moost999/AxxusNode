import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateGeminiResponse(
  messages: any[],
  apiKey: string
): Promise<string> {
  if (!apiKey) throw new Error('Chave da API Gemini não configurada');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const result = await model.generateContent(
    messages.map(msg => msg.content).join('\n')
  );
  return result.response.text();
}