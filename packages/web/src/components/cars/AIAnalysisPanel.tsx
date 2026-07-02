/**
 * AIAnalysisPanel Component
 * Displays the AI's analysis of the user's query with 5-agent workflow data
 * 
 * Implements FR-1.6.2: Enhanced Analysis Panel with Intent and Evaluation
 * Features:
 * - Intent analysis (query type, confidence, category)
 * - Evaluation summary (vehicles scored, top score, average)
 * - Detected preferences
 * - Decision criteria with weights
 * - Collapsible sections
 * - Spanish labels throughout
 * - Mobile-responsive
 */

import { useState } from 'react';
import { AIAnalysis, AgentTrace, formatCurrency } from '@decisionhub/shared';

interface AIAnalysisPanelProps {
  analysis: AIAnalysis;
  agentTrace?: AgentTrace;
}

export default function AIAnalysisPanel({ analysis, agentTrace }: AIAnalysisPanelProps) {
  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['intent', 'evaluation', 'preferences', 'criteria'])
  );

  // Toggle section expand/collapse
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Extract intent data from agentTrace
  const intentExecution = agentTrace?.executions?.find(
    (e) => e.agentName === 'IntentAgent'
  );
  const intentData = intentExecution?.output as {
    category?: string;
    queryType?: string;
    confidence?: number;
  } | undefined;

  // Extract evaluation data from agentTrace
  const evaluationExecution = agentTrace?.executions?.find(
    (e) => e.agentName === 'EvaluationAgent'
  );
  const evaluationData = evaluationExecution?.output as {
    summary?: {
      totalEvaluated: number;
      meetsThreshold: number;
      averageScore: number;
      highestScore: number;
      lowestScore: number;
    };
  } | undefined;

  // Query type labels in Spanish
  const queryTypeLabels: Record<string, string> = {
    recommendation: 'Recomendación',
    comparison: 'Comparación',
    informational: 'Informativa',
  };

  return (
    <div className="card border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-blue-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        🤖 Análisis AI
      </h2>

      {/* Intent Analysis Section (if available from agentTrace) */}
      {intentData && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('intent')}
            className="w-full flex items-center justify-between text-left mb-3 hover:text-primary-600 transition-colors"
          >
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>🎯</span>
              <span>Análisis de Intención</span>
            </h3>
            <span className="text-2xl text-gray-400">
              {expandedSections.has('intent') ? '−' : '+'}
            </span>
          </button>

          {expandedSections.has('intent') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Query Type */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-600 mb-2">Tipo de Consulta</p>
                <p className="text-lg font-bold text-primary-600">
                  {queryTypeLabels[intentData.queryType || ''] || 'Desconocido'}
                </p>
              </div>

              {/* Confidence Score */}
              {intentData.confidence !== undefined && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Confianza</p>
                  <div className="flex items-end gap-2">
                    <p className="text-lg font-bold text-green-600">
                      {Math.round(intentData.confidence * 100)}%
                    </p>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${intentData.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detected Category */}
              {intentData.category && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Categoría Detectada</p>
                  <p className="text-lg font-bold text-gray-800 capitalize">{intentData.category}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Evaluation Summary Section (if available from agentTrace) */}
      {evaluationData?.summary && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('evaluation')}
            className="w-full flex items-center justify-between text-left mb-3 hover:text-primary-600 transition-colors"
          >
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>📊</span>
              <span>Resumen de Evaluación</span>
            </h3>
            <span className="text-2xl text-gray-400">
              {expandedSections.has('evaluation') ? '−' : '+'}
            </span>
          </button>

          {expandedSections.has('evaluation') && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Evaluated */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-600 mb-2">Vehículos Evaluados</p>
                <p className="text-2xl font-bold text-gray-800">
                  {evaluationData.summary.totalEvaluated}
                </p>
              </div>

              {/* Meets Threshold */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-600 mb-2">Aprobados (≥50)</p>
                <p className="text-2xl font-bold text-green-600">
                  {evaluationData.summary.meetsThreshold}
                </p>
              </div>

              {/* Highest Score */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-600 mb-2">Puntuación Máxima</p>
                <p className="text-2xl font-bold text-primary-600">
                  {Math.round(evaluationData.summary.highestScore)}
                </p>
              </div>

              {/* Average Score */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-600 mb-2">Puntuación Promedio</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(evaluationData.summary.averageScore)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Original Query Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Category */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Categoría</h3>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-lg font-medium capitalize">{analysis.category}</p>
          </div>
        </div>

        {/* Budget */}
        {analysis.budget && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Presupuesto</h3>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-lg font-medium">
                {analysis.budget.max && formatCurrency(analysis.budget.max, analysis.budget.currency)}
              </p>
              <p className="text-xs text-gray-600">{analysis.budget.currency}</p>
            </div>
          </div>
        )}

        {/* Query Summary */}
        <div className="md:col-span-2 lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Consulta Original</h3>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-sm text-gray-700 line-clamp-3">{analysis.originalQuery}</p>
          </div>
        </div>
      </div>

      {/* Detected Preferences */}
      {analysis.detectedPreferences.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Preferencias Detectadas
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.detectedPreferences.map((pref, index) => (
              <div
                key={index}
                className="bg-white rounded-full px-4 py-2 shadow-sm flex items-center gap-2"
              >
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-gray-800 font-medium">{pref.label}</span>
                {pref.confidence && (
                  <span className="text-xs text-gray-500">
                    {Math.round(pref.confidence * 100)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Criteria */}
      {analysis.decisionCriteria.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Criterios de Comparación Generados
          </h3>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="space-y-3">
              {analysis.decisionCriteria.map((criteria, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">
                      {criteria.name}
                    </span>
                    <span className="text-sm font-bold text-primary-600">
                      {Math.round(criteria.weight * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${criteria.weight * 100}%` }}
                    ></div>
                  </div>
                  {criteria.description && (
                    <p className="text-xs text-gray-600 mt-1">{criteria.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
