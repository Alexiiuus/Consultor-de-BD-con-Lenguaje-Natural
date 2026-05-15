export type ChatMessageStatus = 'pending' | 'success' | 'error';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: ChatMessageStatus;
  createdAt: string;
  sql?: string;
  explanation?: string;
  columns?: string[];
  rows?: any[][];
  error?: string;
};
