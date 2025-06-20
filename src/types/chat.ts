export interface Message {
  id: string;
  topicId: string;
  content: string;
  role: 'user' | 'assistant';
  sources?: string[];
  createdAt: string;
}

export interface Topic {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface LambdaResponse {
  answer: string;
  sources: string[];
  success: boolean;
  error?: string;
  details?: string;
}