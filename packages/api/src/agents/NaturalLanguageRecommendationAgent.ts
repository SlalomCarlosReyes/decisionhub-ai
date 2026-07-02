/**
 * Natural Language Recommendation Agent
 * 
 * Orchestrates 5-agent workflow for transparent decision-making:
 * Intent → Research → Evaluation → Lead Decision → Final Recommendation
 * 
 * Feature: FR-1.6 - Agentic Decision Workflow
 * Task: TASK-FEAT-AW007
 */

import { BaseAgent } from './base/BaseAgent';
import {
  NaturalLanguageRequest,
  AIRecommendationResponse,
  AgentActivity,
  AIAnalysis,
  IntentAnalysis,
  DecisionCriteria,
  CarSearchCriteria,
} from '@decisionhub/shared';
import { IntentAgent, IntentAgentInput } from './IntentAgent';
import { ResearchAgent } from './ResearchAgent';
import { EvaluationAgent, EvaluationInput } from './EvaluationAgent';
import { LeadDecisionAgent } from './LeadDecisionAgent';
import { FinalRecommendationAgent, FinalRecommendationInput } from './FinalRecommendationAgent';
import { AgentTraceCollector } from '../services/agentTrace/AgentTrace';
import { AIProviderFactory } from '../services/ai';
import * as carService from '../services/carService';

export class NaturalLanguageRecommendationAgent extends BaseAgent {
  name = 'NaturalLanguageRecommendationAgent';
  description = 'Orchestrates 5-agent workflow with comprehensive tracing';

  private intentAgent: IntentAgent;
  private researchAgent: ResearchAgent;
  private evaluationAgent: EvaluationAgent;
  private decisionAgent: LeadDecisionAgent;
  private finalRecommendationAgent: FinalRecommendationAgent;
  private agentActivity: AgentActivity[] = [];

  constructor() {
    super();
    this.intentAgent = new IntentAgent();
    this.researchAgent = new ResearchAgent();
    this.evaluationAgent = new EvaluationAgent();
    this.decisionAgent = new LeadDecisionAgent();
    this.finalRecommendationAgent = new FinalRecommendationAgent();
  }

  async execute(input: NaturalLanguageRequest): Promise<AIRecommendationResponse> {
    const startTime = Date.now();
    const isRealAI = AIProviderFactory.isRealAI();
    const aiProvider = isRealAI ? 'github' : 'mock';

    // Initialize AgentTrace
    const trace = new AgentTraceCollector(aiProvider);
    this.log(`Starting 5-agent workflow for query: "${input.query}"`);

    try {
      // ========================================
      // AGENT 1: INTENT AGENT
      // ========================================
      this.trackActivity({
        agentName: 'Intent Agent',
        status: 'processing',
        description: 'Analizando intención del usuario',
      });

      const intentExecId = trace.startAgent('IntentAgent', 'intent', {
        query: input.query,
        currency: input.currency || 'COP',
      });

      let intentAnalysis: IntentAnalysis;
      try {
        intentAnalysis = await this.intentAgent.execute({
          query: input.query,
          currency: input.currency,
        });

        // Record full IntentAnalysis to trace for UI display
        trace.endAgent(intentExecId, {
          ...intentAnalysis,
          budget: intentAnalysis.budget ? { ...intentAnalysis.budget } : undefined,
        }, { 
          confidenceScore: intentAnalysis.confidence 
        });

        this.log(`Intent: category=${intentAnalysis.category}, confidence=${intentAnalysis.confidence.toFixed(2)}`);
        
        this.trackActivity({
          agentName: 'Intent Agent',
          status: 'completed',
          description: 'Intención identificada',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        trace.logError(intentExecId, error as Error);
        this.logError('Intent Agent failed', error as Error);
        throw error;
      }

      // ========================================
      // AGENT 2: RESEARCH AGENT
      // ========================================
      this.trackActivity({
        agentName: 'Research Agent',
        status: 'processing',
        description: isRealAI ? 'Analizando preferencias con AI' : 'Detectando preferencias',
      });

      const researchExecId = trace.startAgent('ResearchAgent', 'research', {
        query: input.query,
        intent: intentAnalysis,
      });

      let criteria: DecisionCriteria[];
      let searchCriteria: CarSearchCriteria;
      try {
        const researchResult = await this.researchAgent.execute(input);
        
        criteria = researchResult.criteria.length > 0 
          ? researchResult.criteria 
          : this.getDefaultCriteria();
        
        searchCriteria = this.buildSearchCriteria(intentAnalysis, researchResult);

        trace.endAgent(researchExecId, {
          preferencesCount: researchResult.preferences.length,
          criteriaCount: criteria.length,
          insights: researchResult.insights,
        }, { aiProvider, itemsProcessed: researchResult.preferences.length });

        this.log(`Research: ${criteria.length} criteria, ${researchResult.preferences.length} preferences`);
        
        this.trackActivity({
          agentName: 'Research Agent',
          status: 'completed',
          description: 'Preferencias detectadas',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        trace.logError(researchExecId, error as Error);
        this.logError('Research Agent failed, using defaults', error as Error);
        
        // Fallback to default criteria
        criteria = this.getDefaultCriteria();
        searchCriteria = this.buildSearchCriteriaFromIntent(intentAnalysis);
        
        trace.endAgent(researchExecId, {
          fallback: true,
          criteriaCount: criteria.length,
        });

        this.trackActivity({
          agentName: 'Research Agent',
          status: 'completed',
          description: 'Usando criterios por defecto',
          timestamp: new Date().toISOString(),
        });
      }

      // ========================================
      // AGENT 3: EVALUATION AGENT
      // ========================================
      this.trackActivity({
        agentName: 'Evaluation Agent',
        status: 'processing',
        description: 'Evaluando vehículos',
      });

      const evaluationExecId = trace.startAgent('EvaluationAgent', 'evaluation', {
        criteriaCount: criteria.length,
        searchCriteria,
      });

      let evaluationResults;
      try {
        // Load all vehicles
        const allVehicles = await carService.getAllCars();
        
        // Execute evaluation
        const evaluationOutput = await this.evaluationAgent.execute({
          vehicles: allVehicles,
          criteria,
          searchCriteria,
        });
        
        evaluationResults = evaluationOutput.evaluationResults;

        trace.endAgent(evaluationExecId, {
          totalEvaluated: evaluationOutput.summary.totalEvaluated,
          meetsThreshold: evaluationOutput.summary.meetsThreshold,
          averageScore: evaluationOutput.summary.averageScore,
        }, { itemsProcessed: evaluationOutput.summary.totalEvaluated });

        this.log(`Evaluation: ${evaluationResults.length} vehicles scored and ranked`);
        
        this.trackActivity({
          agentName: 'Evaluation Agent',
          status: 'completed',
          description: `${evaluationResults.length} vehículos evaluados`,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        trace.logError(evaluationExecId, error as Error);
        this.logError('Evaluation Agent failed', error as Error);
        throw error;
      }

      // ========================================
      // AGENT 4: LEAD DECISION AGENT
      // ========================================
      let decisionExplanation: string | undefined;
      
      if (evaluationResults.length > 0) {
        this.trackActivity({
          agentName: 'Lead Decision Agent',
          status: 'processing',
          description: 'Generando explicación',
        });

        const decisionExecId = trace.startAgent('LeadDecisionAgent', 'decision', {
          topVehiclesCount: Math.min(3, evaluationResults.length),
        });

        try {
          const topVehicles = evaluationResults.slice(0, 3);
          const decisionResult = await this.decisionAgent.execute({
            query: input.query,
            topRecommendations: topVehicles.map(result => ({
              car: result.vehicle,
              score: result.finalScore,
              reasoning: '',
              matchedFeatures: [],
              pros: [],
              cons: [],
            })),
          });
          
          decisionExplanation = decisionResult.strategy;

          trace.endAgent(decisionExecId, {
            hasExplanation: true,
            explanationLength: decisionExplanation?.length || 0,
          }, { aiProvider });

          this.log('Decision: Explanation generated');
          
          this.trackActivity({
            agentName: 'Lead Decision Agent',
            status: 'completed',
            description: 'Explicación generada',
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          trace.logError(decisionExecId, error as Error);
          this.logError('Decision Agent failed, continuing without explanation', error as Error);
          
          this.trackActivity({
            agentName: 'Lead Decision Agent',
            status: 'completed',
            description: 'Continuando sin explicación',
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        trace.skipAgent('LeadDecisionAgent', 'decision', 'No vehicles to explain');
      }

      // ========================================
      // AGENT 5: FINAL RECOMMENDATION AGENT
      // ========================================
      this.trackActivity({
        agentName: 'Final Recommendation Agent',
        status: 'processing',
        description: 'Formateando recomendaciones',
      });

      const finalRecommendationExecId = trace.startAgent('FinalRecommendationAgent', 'recommendation', {
        evaluationResultsCount: evaluationResults.length,
        hasDecisionExplanation: !!decisionExplanation,
      });

      let recommendations;
      try {
        const finalOutput = await this.finalRecommendationAgent.execute({
          evaluationResults,
          decisionExplanation,
          currency: input.currency || 'COP',
        });
        
        recommendations = finalOutput.recommendations;

        trace.endAgent(finalRecommendationExecId, {
          recommendationsCount: recommendations.length,
          averageScore: finalOutput.summary.averageScore,
        });

        this.log(`Final: ${recommendations.length} recommendations formatted`);
        
        this.trackActivity({
          agentName: 'Final Recommendation Agent',
          status: 'completed',
          description: 'Recomendaciones finalizadas',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        trace.logError(finalRecommendationExecId, error as Error);
        this.logError('Final Recommendation Agent failed', error as Error);
        throw error;
      }

      // Finalize trace
      trace.finalize('completed');
      const processingTimeMs = Date.now() - startTime;

      this.log(`Workflow complete in ${processingTimeMs}ms`);

      // Build analysis object for backward compatibility
      const analysis: AIAnalysis = {
        category: intentAnalysis.category || 'vehicle',
        budget: intentAnalysis.budget,
        detectedPreferences: [],
        decisionCriteria: criteria,
        searchCriteria,
        originalQuery: input.query,
      };

      return {
        analysis,
        recommendations,
        agentActivity: this.agentActivity,
        processingTimeMs,
        agentTrace: trace.toJSON(),
      };
    } catch (error) {
      trace.finalize('failed');
      this.logError('5-agent workflow failed', error as Error);
      throw error;
    }
  }

  /**
   * Track agent activity for timeline visualization
   */
  private trackActivity(activity: AgentActivity): void {
    this.agentActivity.push({
      ...activity,
      timestamp: activity.timestamp || new Date().toISOString(),
    });
  }

  /**
   * Get default decision criteria when research fails
   */
  private getDefaultCriteria(): DecisionCriteria[] {
    return [
      { name: 'Precio', weight: 0.25, description: 'Ajuste al presupuesto' },
      { name: 'Seguridad', weight: 0.20, description: 'Características de seguridad' },
      { name: 'Eficiencia', weight: 0.15, description: 'Consumo de combustible' },
      { name: 'Confiabilidad', weight: 0.15, description: 'Reputación de marca' },
      { name: 'Características', weight: 0.25, description: 'Features y comodidades' },
    ];
  }

  /**
   * Build search criteria from intent and research results
   */
  private buildSearchCriteria(intent: IntentAnalysis, researchResult: any): CarSearchCriteria {
    const criteria: CarSearchCriteria = {};

    // Add budget if available
    if (intent.budget) {
      criteria.minPrice = intent.budget.min;
      criteria.maxPrice = intent.budget.max;
    }

    // Add category/body type if available
    if (intent.category) {
      const bodyTypeMap: Record<string, any> = {
        suv: 'suv',
        sedan: 'sedan',
        truck: 'truck',
        hatchback: 'hatchback',
        van: 'van',
        coupe: 'coupe',
      };
      const bodyType = bodyTypeMap[intent.category.toLowerCase()];
      if (bodyType) {
        criteria.bodyTypes = [bodyType];
      }
    }

    // Add any detected features from requirements
    if (intent.requirements.length > 0) {
      criteria.preferredFeatures = intent.requirements;
    }

    return criteria;
  }

  /**
   * Build search criteria from intent only (fallback)
   */
  private buildSearchCriteriaFromIntent(intent: IntentAnalysis): CarSearchCriteria {
    const criteria: CarSearchCriteria = {};

    if (intent.budget) {
      criteria.minPrice = intent.budget.min;
      criteria.maxPrice = intent.budget.max;
    }

    if (intent.category) {
      const bodyTypeMap: Record<string, any> = {
        suv: 'suv',
        sedan: 'sedan',
        truck: 'truck',
        hatchback: 'hatchback',
        van: 'van',
        coupe: 'coupe',
      };
      const bodyType = bodyTypeMap[intent.category.toLowerCase()];
      if (bodyType) {
        criteria.bodyTypes = [bodyType];
      }
    }

    if (intent.requirements.length > 0) {
      criteria.preferredFeatures = intent.requirements;
    }

    return criteria;
  }
}
