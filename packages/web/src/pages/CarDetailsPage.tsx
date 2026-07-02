import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Car } from '@decisionhub/shared';
import { getCarById } from '../services/api';

export default function CarDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCar() {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getCarById(id);
        setCar(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load car details');
      } finally {
        setLoading(false);
      }
    }

    loadCar();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-red-50 border border-red-200">
          <p className="text-red-600">{error || 'Car not found'}</p>
          <Link to="/search" className="btn btn-primary mt-4 inline-block">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/search" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
        ← Back to Search
      </Link>

      <div className="card">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Placeholder */}
          <div>
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center text-gray-400">
              <span className="text-6xl">🚗</span>
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {car.year} {car.make} {car.model}
            </h1>
            <p className="text-3xl text-primary-600 font-bold mb-4">
              ${car.price.toLocaleString()}
            </p>

            {car.description && (
              <p className="text-gray-600 mb-6">{car.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-gray-500 text-sm">Fuel Type</span>
                <p className="font-semibold capitalize">{car.fuelType}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Body Type</span>
                <p className="font-semibold capitalize">{car.bodyType || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Drivetrain</span>
                <p className="font-semibold uppercase">{car.drivetrain || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Transmission</span>
                <p className="font-semibold capitalize">{car.transmission || 'N/A'}</p>
              </div>
            </div>

            {car.mpg && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Fuel Economy</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-2xl font-bold">{car.mpg.city}</div>
                    <div className="text-sm text-gray-600">City MPG</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-2xl font-bold">{car.mpg.highway}</div>
                    <div className="text-sm text-gray-600">Highway MPG</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-2xl font-bold">{car.mpg.combined}</div>
                    <div className="text-sm text-gray-600">Combined MPG</div>
                  </div>
                </div>
              </div>
            )}

            {car.specifications && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {car.specifications.horsepower && (
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-gray-600 text-sm">Horsepower</span>
                      <p className="font-semibold">{car.specifications.horsepower} HP</p>
                    </div>
                  )}
                  {car.specifications.seating && (
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-gray-600 text-sm">Seating</span>
                      <p className="font-semibold">{car.specifications.seating} Seats</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-bold mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {car.features.map((feature, index) => (
                  <span
                    key={index}
                    className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
