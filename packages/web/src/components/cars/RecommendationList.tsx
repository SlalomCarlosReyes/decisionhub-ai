import { Link } from 'react-router-dom';
import { CarRecommendation, formatCurrency } from '@decisionhub/shared';

interface RecommendationListProps {
  recommendations: CarRecommendation[];
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
  if (recommendations.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">🤔</div>
        <h3 className="text-xl font-bold mb-2">No se encontraron coincidencias</h3>
        <p className="text-gray-600">
          Intenta ajustar tu búsqueda para ver más resultados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {recommendations.map((rec, index) => (
        <div
          key={rec.car.id}
          className="card hover:shadow-xl transition-all duration-300 border-l-4"
          style={{
            borderLeftColor: index === 0 ? '#10B981' : index === 1 ? '#3B82F6' : '#9CA3AF',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0
                    ? 'bg-gradient-to-br from-green-500 to-green-600'
                    : index === 1
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                      : 'bg-gradient-to-br from-gray-500 to-gray-600'
                }`}
              >
                #{index + 1}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {rec.car.make} {rec.car.model}
                </h3>
                <p className="text-lg text-gray-600">{rec.car.year}</p>
              </div>
            </div>

            {/* Score Badge */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg">
                <div>
                  <div className="text-2xl font-bold">{rec.score}</div>
                  <div className="text-xs">/ 100</div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">Puntuación</p>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="inline-block bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg px-6 py-3">
              <p className="text-sm text-gray-600 mb-1">Precio</p>
              <p className="text-3xl font-bold text-primary-600">
                {formatCurrency(rec.car.price, 'COP')}
              </p>
            </div>
          </div>

          {/* AI Recommendation Reasoning */}
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-xl">🤖</span>
              Recomendación AI
            </h4>
            <p className="text-gray-700 leading-relaxed">{rec.reasoning}</p>
          </div>

          {/* Strengths and Drawbacks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Pros */}
            {rec.pros.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  Fortalezas
                </h5>
                <ul className="space-y-2">
                  {rec.pros.map((pro, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-0.5">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons */}
            {rec.cons.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h5 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">!</span>
                  Consideraciones
                </h5>
                <ul className="space-y-2">
                  {rec.cons.map((con, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-orange-600 font-bold mt-0.5">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Combustible</div>
              <div className="font-semibold text-gray-900 capitalize">
                {rec.car.fuelType === 'gasoline' && 'Gasolina'}
                {rec.car.fuelType === 'diesel' && 'Diesel'}
                {rec.car.fuelType === 'electric' && 'Eléctrico'}
                {rec.car.fuelType === 'hybrid' && 'Híbrido'}
                {rec.car.fuelType === 'plugin-hybrid' && 'Híbrido Enchufable'}
              </div>
            </div>

            {rec.car.bodyType && (
              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Tipo</div>
                <div className="font-semibold text-gray-900 capitalize">
                  {rec.car.bodyType === 'suv' && 'SUV'}
                  {rec.car.bodyType === 'sedan' && 'Sedán'}
                  {rec.car.bodyType === 'truck' && 'Camioneta'}
                  {rec.car.bodyType === 'hatchback' && 'Hatchback'}
                  {rec.car.bodyType === 'van' && 'Van'}
                  {rec.car.bodyType === 'coupe' && 'Coupé'}
                </div>
              </div>
            )}

            {rec.car.specifications?.seating && (
              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Pasajeros</div>
                <div className="font-semibold text-gray-900">
                  {rec.car.specifications.seating}
                </div>
              </div>
            )}

            {rec.car.mpg && (
              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Consumo</div>
                <div className="font-semibold text-gray-900">{rec.car.mpg.combined} MPG</div>
              </div>
            )}
          </div>

          {/* Matched Features */}
          {rec.matchedFeatures.length > 0 && (
            <div className="mb-6">
              <h5 className="font-semibold text-gray-900 mb-3">
                Características que cumple
              </h5>
              <div className="flex flex-wrap gap-2">
                {rec.matchedFeatures.slice(0, 8).map((feature, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <span className="text-green-600">✓</span>
                    {feature}
                  </span>
                ))}
                {rec.matchedFeatures.length > 8 && (
                  <span className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    +{rec.matchedFeatures.length - 8} más
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Link
            to={`/cars/${rec.car.id}`}
            className="btn btn-primary w-full text-center text-lg font-semibold"
          >
            Ver Detalles Completos →
          </Link>
        </div>
      ))}
    </div>
  );
}
