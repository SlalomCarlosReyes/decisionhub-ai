/**
 * AgentTimeline Component
 * Shows the activity of AI agents during processing with support for 5-agent workflow
 * 
 * Implements FR-1.6.2: Real-Time Agent Timeline UI
 * Features:
 * - Displays 5 specialized agents (Intent, Research, Evaluation, Decision, Recommendation)
 * - Real-time status updates (pending → processing → completed/failed)
 * - Expandable details showing execution input/output and metrics
 * - Visual indicators (icons, colors, spinners, animations)
 * - Mobile-responsive design
 * - Spanish labels throughout
 */

import { useState } from 'react';
import { AgentActivity, AgentTrace, AgentExecution } from '@decisionhub/shared';

interface AgentTimelineProps {
  activities?: AgentActivity[];  // Legacy format (backward compatibility)
  agentTrace?: AgentTrace;       // New format (5-agent workflow)
}

/**
 * Agent configuration with Spanish names and descriptions
 */
const AGENT_CONFIG = {
  IntentAgent: {
    displayName: 'Agente de Intención',
    description: 'Analiza tu consulta y extrae preferencias',
    icon: '🎯',
  },
  ResearchAgent: {
    displayName: 'Agente de Investigación',
    description: 'Investiga vehículos y criterios de decisión',
    icon: '🔍',
  },
  EvaluationAgent: {
    displayName: 'Agente de Evaluación',
    description: 'Evalúa y califica cada vehículo',
    icon: '📊',
  },
  LeadDecisionAgent: {
    displayName: 'Agente de Decisión',
    description: 'Determina la mejor recomendación',
    icon: '🎓',
  },
  FinalRecommendationAgent: {
    displayName: 'Agente de Recomendación',
    description: 'Formatea la respuesta final',
    icon: '✨',
  },
};

/**
 * Status label mapping (Spanish)
 */
const STATUS_LABELS = {
  pending: 'Pendiente',
  processing: 'Procesando',
  completed: 'Completado',
  failed: 'Fallido',
  skipped: 'Omitido',
};

export default function AgentTimeline({ activities, agentTrace }: AgentTimelineProps) {
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  // Toggle expand/collapse for an agent
  const toggleExpand = (agentId: string) => {
    setExpandedAgents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  // Use new agentTrace format if available, otherwise fall back to legacy activities
  const agentExecutions: AgentExecution[] = agentTrace?.executions || [];
  const useNewFormat = agentExecutions.length > 0;

  // Legacy format compatibility: Convert activities to execution-like objects
  const legacyExecutions: AgentExecution[] =
    activities?.map((activity, index) => ({
      id: `legacy-${index}`,
      agentName: activity.agentName,
      agentType: activity.agentName,
      startTime: activity.timestamp || new Date().toISOString(),
      status: activity.status,
      input: {},
      output: { description: activity.description },
    })) || [];

  const displayExecutions = useNewFormat ? agentExecutions : legacyExecutions;

  if (displayExecutions.length === 0) {
    return null;
  }

  // Calculate progress
  const completedCount = displayExecutions.filter(
    (e) => e.status === 'completed'
  ).length;
  const totalCount = displayExecutions.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>🤖</span>
        <span>Flujo de Agentes AI</span>
      </h3>

      {/* Agent Executions */}
      <div className="space-y-3">
        {displayExecutions.map((execution) => {
          const agentConfig = AGENT_CONFIG[execution.agentName as keyof typeof AGENT_CONFIG];
          const isExpanded = expandedAgents.has(execution.id);
          const hasDetails = execution.output || execution.error || execution.metadata;

          return (
            <div
              key={execution.id}
              className="bg-white rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
            >
              {/* Agent Header */}
              <div
                className={`flex items-start gap-4 p-4 ${
                  hasDetails ? 'cursor-pointer' : ''
                }`}
                onClick={() => hasDetails && toggleExpand(execution.id)}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                  {execution.status === 'completed' && (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center transition-all duration-300">
                      <span className="text-green-600 text-lg font-bold">✓</span>
                    </div>
                  )}
                  {execution.status === 'processing' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {execution.status === 'pending' && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-lg">○</span>
                    </div>
                  )}
                  {execution.status === 'failed' && (
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-lg font-bold">✕</span>
                    </div>
                  )}
                  {execution.status === 'skipped' && (
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-yellow-600 text-lg font-bold">⊘</span>
                    </div>
                  )}
                </div>

                {/* Agent Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {agentConfig && <span className="text-lg">{agentConfig.icon}</span>}
                    <h4 className="text-sm font-semibold text-gray-900">
                      {agentConfig?.displayName || execution.agentName}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {agentConfig?.description ||
                      (execution.output as { description?: string })?.description ||
                      'Procesando...'}
                  </p>
                  {execution.durationMs !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                      Duración: {execution.durationMs}ms
                    </p>
                  )}
                </div>

                {/* Status Badge and Expand Icon */}
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  {execution.status === 'completed' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {STATUS_LABELS.completed}
                    </span>
                  )}
                  {execution.status === 'processing' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {STATUS_LABELS.processing}...
                    </span>
                  )}
                  {execution.status === 'pending' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {STATUS_LABELS.pending}
                    </span>
                  )}
                  {execution.status === 'failed' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {STATUS_LABELS.failed}
                    </span>
                  )}
                  {execution.status === 'skipped' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {STATUS_LABELS.skipped}
                    </span>
                  )}
                  {hasDetails && (
                    <button
                      className="text-gray-400 hover:text-gray-600 transition-transform duration-200"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      aria-label={isExpanded ? 'Contraer' : 'Expandir'}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && hasDetails && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3 animate-fadeIn">
                  {/* Timing Information */}
                  {execution.startTime && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Inicio:</span>{' '}
                      {new Date(execution.startTime).toLocaleTimeString('es-CO')}
                      {execution.endTime && (
                        <>
                          {' '}
                          | <span className="font-medium">Fin:</span>{' '}
                          {new Date(execution.endTime).toLocaleTimeString('es-CO')}
                        </>
                      )}
                    </div>
                  )}

                  {/* Error Information */}
                  {execution.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-xs font-medium text-red-800 mb-1">Error:</p>
                      <p className="text-xs text-red-700">{execution.error.message}</p>
                    </div>
                  )}

                  {/* Metadata */}
                  {execution.metadata && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs font-medium text-blue-800 mb-2">Métricas:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                        {execution.metadata.aiProvider && (
                          <div>
                            <span className="font-medium">Proveedor AI:</span>{' '}
                            {execution.metadata.aiProvider}
                          </div>
                        )}
                        {execution.metadata.modelId && (
                          <div>
                            <span className="font-medium">Modelo:</span>{' '}
                            {execution.metadata.modelId}
                          </div>
                        )}
                        {execution.metadata.tokensUsed !== undefined && (
                          <div>
                            <span className="font-medium">Tokens:</span>{' '}
                            {execution.metadata.tokensUsed}
                          </div>
                        )}
                        {execution.metadata.confidenceScore !== undefined && (
                          <div>
                            <span className="font-medium">Confianza:</span>{' '}
                            {(execution.metadata.confidenceScore * 100).toFixed(0)}%
                          </div>
                        )}
                        {execution.metadata.itemsProcessed !== undefined && (
                          <div>
                            <span className="font-medium">Items procesados:</span>{' '}
                            {execution.metadata.itemsProcessed}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Output Summary (collapsed by default for brevity) */}
                  {execution.output && !execution.error && (
                    <details className="bg-gray-50 border border-gray-200 rounded p-3">
                      <summary className="text-xs font-medium text-gray-800 cursor-pointer">
                        Ver detalles de salida
                      </summary>
                      <pre className="mt-2 text-xs text-gray-700 overflow-x-auto max-h-40 overflow-y-auto">
                        {JSON.stringify(execution.output, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-600">
            {completedCount} de {totalCount} agentes completados
          </p>
          {agentTrace?.totalDurationMs !== undefined && (
            <p className="text-xs text-gray-600 font-medium">
              Tiempo total: {agentTrace.totalDurationMs}ms
            </p>
          )}
        </div>
      </div>

      {/* Workflow Status */}
      {agentTrace && (
        <div className="mt-4 pt-4 border-t border-purple-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">
              Workflow ID: <span className="font-mono text-gray-800">{agentTrace.workflowId}</span>
            </span>
            {agentTrace.status && (
              <span
                className={`px-2 py-1 rounded-full font-medium ${
                  agentTrace.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : agentTrace.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {agentTrace.status === 'completed' && 'Completado'}
                {agentTrace.status === 'failed' && 'Fallido'}
                {agentTrace.status === 'in-progress' && 'En progreso'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
