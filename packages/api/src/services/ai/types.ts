/**
 * AI Provider Abstraction
 * Supports multiple AI providers with graceful fallback to mock mode
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProviderConfig {
  provider: 'github' | 'mock';
  apiKey?: string;
  modelId?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  chat(messages: AIMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<AIResponse>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}
