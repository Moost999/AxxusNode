// src/models/assistant.ts
export interface Assistant {
    id: string;
    name: string;
    initialPrompt: string;
    modelType: 'gemini' | 'groq';
    whatsAppNumber?: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }