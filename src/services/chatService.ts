// src/services/chatService.ts
const API_ENDPOINT = 'https://l1pn1vi8yj.execute-api.eu-west-1.amazonaws.com/prod/query';

export interface ChatHistory {
  user: string;
  assistant: string;
}

export class ChatService {
  static async sendMessage(
    query: string, 
    history: ChatHistory[] = []
  ): Promise<{
    answer: string;
    sources: string[];
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          action: 'query',
          history,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling chat service:', error);
      return {
        answer: 'Sorry, there was an error processing your request.',
        sources: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}