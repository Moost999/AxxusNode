import { Groq } from 'groq-sdk';

export async function generateGroqResponse(
  messages: any[],
  apiKey: string
): Promise<string> {
  if (!apiKey) throw new Error('Chave da API Groq não configurada');

  const groq = new Groq({ apiKey });
  const response = await groq.chat.completions.create({
    messages,
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    max_tokens: 1024,
  });
  return response.choices[0]?.message?.content || 'Sem resposta gerada';
}