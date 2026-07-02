import { useState } from 'react';
import {
  CarRecommendation,
  AIRecommendationResponse,
  IntentAnalysis,
} from '@decisionhub/shared';
import SearchForm from '../components/cars/SearchForm';
import RecommendationList from '../components/cars/RecommendationList';
import AIAnalysisPanel from '../components/cars/AIAnalysisPanel';
import AgentTimeline from '../components/cars/AgentTimeline';
import IntentSummary from '../components/cars/IntentSummary';
import { getNaturalLanguageRecommendations } from '../services/api';

const EXAMPLE_QUERIES = [
  'Necesito un SUV confiable por menos de 200 millones COP',
  'Quiero un carro eléctrico para conducción en la ciudad',
  'Busco un vehículo familiar cómodo y seguro para 5 personas',
  'Recomiéndame un híbrido económico y con buena tecnología',
];

export default function CarSearchPage() {
  const [query, setQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [recommendations, setRecommendations] = useState<CarRecommendation[]>([]);
  const [analysis, setAnalysis] = useState<AIRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Extract IntentAnalysis from AgentTrace
   * Looks for IntentAgent execution output
   */
  const getIntentAnalysis = (): IntentAnalysis | undefined => {
    if (!analysis?.agentTrace?.executions) {
      return undefined;
    }

    const intentExecution = analysis.agentTrace.executions.find(
      (exec) => exec.agentName === 'IntentAgent' && exec.status === 'completed'
    );

    if (intentExecution?.output) {
      // Validate output has required fields for IntentAnalysis
      const output = intentExecution.output;
      if (
        typeof output === 'object' &&
        output !== null &&
        'requirements' in output &&
        'queryType' in output &&
        'confidence' in output &&
        'rawQuery' in output
      ) {
        return output as unknown as IntentAnalysis;
      }
    }

    return undefined;
  };

  const handleNaturalLanguageSearch = async () => {
    if (!query.trim()) {
      setError('Por favor describe lo que buscas');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await getNaturalLanguageRecommendations(query, 'COP');
      setAnalysis(result);
      setRecommendations(result.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar tu solicitud');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleNaturalLanguageSearch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          ¿Qué vehículo necesitas?
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Describe lo que buscas y nuestro AI te recomendará las mejores opciones
        </p>
        <p className="text-sm text-gray-500">
          Inteligencia Artificial que entiende tus necesidades
        </p>
      </div>

      {/* Natural Language Input */}
      <div className="card mb-6">
        <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-3">
          Cuéntanos qué necesitas
        </label>
        <textarea
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ejemplo: Quiero un carro familiar para viajar por Colombia con un presupuesto máximo de 250 millones de pesos. Me importa la seguridad, comodidad, confiabilidad y eficiencia de combustible."
          className="input w-full h-32 resize-none text-lg"
          disabled={loading}
        />

        {/* Example Prompts */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">O prueba estos ejemplos:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleNaturalLanguageSearch}
            disabled={loading || !query.trim()}
            className="btn btn-primary px-8 py-3 text-lg font-semibold"
          >
            {loading ? 'Analizando...' : 'Obtener Recomendación AI'}
          </button>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {showAdvancedFilters ? '− Ocultar' : '+ Mostrar'} Filtros Avanzados
          </button>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {showAdvancedFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Refina tu búsqueda con filtros específicos
            </p>
            <SearchForm
              onSearch={async (_criteria) => {
                // Convert structured search to query if needed
                setRecommendations([]);
              }}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Loading State with Agent Timeline */}
      {loading && analysis && (
        <div className="mb-8">
          <AgentTimeline 
            activities={analysis.agentActivity} 
            agentTrace={analysis.agentTrace}
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-red-50 border border-red-200 mb-8">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Agent Timeline for completed workflows */}
      {analysis && !loading && analysis.agentTrace && (
        <div className="mb-8">
          <AgentTimeline 
            activities={analysis.agentActivity} 
            agentTrace={analysis.agentTrace}
          />
        </div>
      )}

      {/* Intent Summary - Display Intent Agent output */}
      {analysis && !loading && (
        <div className="mb-8">
          <IntentSummary intentAnalysis={getIntentAnalysis()} />
        </div>
      )}

      {/* AI Analysis Section */}
      {analysis && !loading && (
        <div className="mb-8">
          <AIAnalysisPanel analysis={analysis.analysis} />
        </div>
      )}

      {/* Results */}
      {!loading && recommendations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recomendaciones Personalizadas
            </h2>
            <span className="text-sm text-gray-600">
              {recommendations.length} vehículos encontrados
            </span>
          </div>
          <RecommendationList recommendations={recommendations} />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && recommendations.length === 0 && !analysis && (
        <div className="card text-center py-16">
          <div className="text-7xl mb-6">🤖</div>
          <h3 className="text-2xl font-bold mb-3">Asistente AI Listo</h3>
          <p className="text-gray-600 text-lg mb-2">
            Describe lo que buscas en lenguaje natural
          </p>
          <p className="text-gray-500">
            Nuestro AI analizará tus necesidades y te recomendará los mejores vehículos
          </p>
        </div>
      )}
    </div>
  );
}
