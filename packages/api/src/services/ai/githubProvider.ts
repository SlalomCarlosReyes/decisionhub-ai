/**
 * GitHub Models AI Provider
 * Uses GitHub Models API (Azure OpenAI compatible)
 */

import { AIProvider, AIMessage, AIResponse, AIProviderError } from './types';

export class GitHubModelsProvider implements AIProvider {
  name = 'GitHub Models';
  private apiKey: string;
  private modelId: string;
  private endpoint = 'https://models.inference.ai.azure.com/chat/completions';

  constructor(apiKey: string, modelId: string) {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey || !this.modelId) {
      return false;
    }

    try {
      // Quick test call with minimal tokens
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('[GitHubModelsProvider] Availability check failed:', error);
      return false;
    }
  }

  async chat(
    messages: AIMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<AIResponse> {
    if (!this.apiKey || !this.modelId) {
      throw new AIProviderError(
        'GitHub Models provider not configured',
        this.name
      );
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from model');
      }

      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      throw new AIProviderError(
        `GitHub Models request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }
}
