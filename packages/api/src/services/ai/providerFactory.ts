/**
 * AI Provider Factory
 * Creates and manages AI provider instances
 */

import { AIProvider, AIProviderConfig } from './types';
import { GitHubModelsProvider } from './githubProvider';
import { MockAIProvider } from './mockProvider';

export class AIProviderFactory {
  private static instance: AIProvider | null = null;
  private static config: AIProviderConfig | null = null;

  /**
   * Initialize the AI provider based on environment configuration
   */
  static async initialize(): Promise<AIProvider> {
    const provider = process.env.AI_PROVIDER || 'mock';
    const apiKey = process.env.GITHUB_TOKEN;
    const modelId = process.env.MODEL_ID || 'gpt-4o'; // Default fallback

    this.config = {
      provider: provider as 'github' | 'mock',
      apiKey,
      modelId,
      maxTokens: 2000,
      temperature: 0.7,
    };

    console.log(`[AIProviderFactory] Initializing provider: ${provider}`);

    // Try GitHub Models if configured
    if (provider === 'github' && apiKey && modelId) {
      try {
        const githubProvider = new GitHubModelsProvider(apiKey, modelId);
        const isAvailable = await githubProvider.isAvailable();

        if (isAvailable) {
          console.log(`[AIProviderFactory] GitHub Models provider initialized with model: ${modelId}`);
          this.instance = githubProvider;
          return githubProvider;
        } else {
          console.warn('[AIProviderFactory] GitHub Models provider not available, falling back to mock');
        }
      } catch (error) {
        console.error('[AIProviderFactory] Failed to initialize GitHub Models:', error);
      }
    }

    // Fallback to mock provider
    console.log('[AIProviderFactory] Using Mock AI provider');
    const mockProvider = new MockAIProvider();
    this.instance = mockProvider;
    return mockProvider;
  }

  /**
   * Get the current provider instance
   */
  static getProvider(): AIProvider {
    if (!this.instance) {
      throw new Error('AI Provider not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  /**
   * Get provider configuration
   */
  static getConfig(): AIProviderConfig | null {
    return this.config;
  }

  /**
   * Check if real AI (not mock) is available
   */
  static isRealAI(): boolean {
    return this.instance !== null && this.instance.name !== 'Mock AI';
  }

  /**
   * Reset the provider (useful for testing)
   */
  static reset(): void {
    this.instance = null;
    this.config = null;
  }
}
