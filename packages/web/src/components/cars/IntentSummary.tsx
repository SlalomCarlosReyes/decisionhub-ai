/**
 * IntentSummary Component
 * Displays Intent Agent output for query understanding
 * 
 * Implements TASK-FEAT-AW009
 * Features:
 * - Displays detected category, budget, requirements
 * - Shows query type and confidence score
 * - Spanish labels and COP currency formatting
 * - Collapsible design
 * - Mobile-responsive Tailwind CSS styling
 */

import { useState } from 'react';
import { IntentAnalysis, formatCurrency } from '@decisionhub/shared';

interface IntentSummaryProps {
  intentAnalysis?: IntentAnalysis;
}

/**
 * Query type labels in Spanish
 */
const QUERY_TYPE_LABELS: Record<string, string> = {
  recommendation: 'Recomendación',
  comparison: 'Comparación',
  informational: 'Información',
};

/**
 * Query type icons
 */
const QUERY_TYPE_ICONS: Record<string, string> = {
  recommendation: '✨',
  comparison: '⚖️',
  informational: 'ℹ️',
};

/**
 * Category icons mapping
 */
const CATEGORY_ICONS: Record<string, string> = {
  SUV: '🚙',
  Sedan: '🚗',
  Hatchback: '🚕',
  Pickup: '🛻',
  Van: '🚐',
  Coupe: '🏎️',
  Convertible: '🚘',
  Wagon: '🚐',
  default: '🚗',
};

export default function IntentSummary({ intentAnalysis }: IntentSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Don't render if no intent analysis
  if (!intentAnalysis) {
    return null;
  }

  const { category, budget, requirements, queryType, confidence, rawQuery } = intentAnalysis;

  // Get appropriate icon for category
  const categoryIcon = category ? (CATEGORY_ICONS[category] || CATEGORY_ICONS.default) : CATEGORY_ICONS.default;
  
  // Get query type label and icon
  const queryTypeLabel = QUERY_TYPE_LABELS[queryType] || queryType;
  const queryTypeIcon = QUERY_TYPE_ICONS[queryType] || '🤔';

  // Calculate confidence percentage
  const confidencePercent = Math.round(confidence * 100);

  // Determine confidence color based on level
  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.8) return 'bg-green-600';
    if (conf >= 0.6) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="card border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🎯 Análisis de Intención
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
        >
          {isExpanded ? '− Ocultar' : '+ Mostrar'}
        </button>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <>
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Category */}
            {category && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Categoría</h3>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{categoryIcon}</span>
                    <span className="text-lg font-medium capitalize">{category}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Budget */}
            {budget && (budget.min || budget.max) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Presupuesto</h3>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  {budget.min && budget.max ? (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Rango:</p>
                      <p className="text-base font-medium">
                        {formatCurrency(budget.min, budget.currency)}
                      </p>
                      <p className="text-xs text-gray-600 my-1">hasta</p>
                      <p className="text-base font-medium">
                        {formatCurrency(budget.max, budget.currency)}
                      </p>
                    </div>
                  ) : budget.max ? (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Hasta:</p>
                      <p className="text-lg font-medium">
                        {formatCurrency(budget.max, budget.currency)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Desde:</p>
                      <p className="text-lg font-medium">
                        {formatCurrency(budget.min!, budget.currency)}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{budget.currency}</p>
                </div>
              </div>
            )}

            {/* Query Type */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tipo de Consulta</h3>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{queryTypeIcon}</span>
                  <span className="text-lg font-medium">{queryTypeLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {requirements.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Requisitos Detectados</h3>
              <div className="flex flex-wrap gap-2">
                {requirements.map((req, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-full px-4 py-2 shadow-sm flex items-center gap-2"
                  >
                    <span className="text-blue-600 font-bold">✓</span>
                    <span className="text-gray-800 font-medium capitalize">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confidence Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Confianza del Análisis</h3>
              <span className="text-sm font-bold text-gray-900">{confidencePercent}%</span>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`${getConfidenceColor(confidence)} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${confidencePercent}%` }}
                  role="progressbar"
                  aria-valuenow={confidencePercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {confidence >= 0.8
                  ? 'Alta confianza - Tu consulta fue interpretada correctamente'
                  : confidence >= 0.6
                  ? 'Confianza media - Puede haber ambigüedad en algunos aspectos'
                  : 'Confianza baja - Considera reformular tu consulta'}
              </p>
            </div>
          </div>

          {/* Raw Query Display */}
          {rawQuery && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Consulta Original</h3>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-700 italic">"{rawQuery}"</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
