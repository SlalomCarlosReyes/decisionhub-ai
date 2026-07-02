import { useState } from 'react';
import { CarSearchCriteria } from '@decisionhub/shared';

interface SearchFormProps {
  onSearch: (criteria: CarSearchCriteria) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [criteria, setCriteria] = useState<CarSearchCriteria>({
    maxPrice: 50000,
    fuelTypes: [],
    bodyTypes: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(criteria);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="text-2xl font-bold mb-6">Search Criteria</h2>

      {/* Budget */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Budget: ${criteria.maxPrice?.toLocaleString() || '0'}
        </label>
        <input
          type="range"
          min="10000"
          max="100000"
          step="5000"
          value={criteria.maxPrice || 50000}
          onChange={(e) =>
            setCriteria({ ...criteria, maxPrice: parseInt(e.target.value) })
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>$10k</span>
          <span>$100k</span>
        </div>
      </div>

      {/* Fuel Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fuel Type
        </label>
        <div className="space-y-2">
          {['gasoline', 'diesel', 'electric', 'hybrid', 'plugin-hybrid'].map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={criteria.fuelTypes?.includes(type as any) || false}
                onChange={(e) => {
                  const fuelTypes = criteria.fuelTypes || [];
                  if (e.target.checked) {
                    setCriteria({
                      ...criteria,
                      fuelTypes: [...fuelTypes, type as any],
                    });
                  } else {
                    setCriteria({
                      ...criteria,
                      fuelTypes: fuelTypes.filter((t) => t !== type),
                    });
                  }
                }}
                className="mr-2"
              />
              <span className="capitalize">{type.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Body Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Body Type
        </label>
        <div className="space-y-2">
          {['sedan', 'suv', 'truck', 'coupe', 'hatchback', 'van'].map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={criteria.bodyTypes?.includes(type as any) || false}
                onChange={(e) => {
                  const bodyTypes = criteria.bodyTypes || [];
                  if (e.target.checked) {
                    setCriteria({
                      ...criteria,
                      bodyTypes: [...bodyTypes, type as any],
                    });
                  } else {
                    setCriteria({
                      ...criteria,
                      bodyTypes: bodyTypes.filter((t) => t !== type),
                    });
                  }
                }}
                className="mr-2"
              />
              <span className="capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Year Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Year
        </label>
        <input
          type="number"
          min="2015"
          max={new Date().getFullYear()}
          value={criteria.minYear || 2020}
          onChange={(e) =>
            setCriteria({ ...criteria, minYear: parseInt(e.target.value) })
          }
          className="input"
        />
      </div>

      {/* MPG */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum MPG (Combined)
        </label>
        <input
          type="number"
          min="0"
          max="150"
          value={criteria.minMpg || ''}
          placeholder="Optional"
          onChange={(e) =>
            setCriteria({
              ...criteria,
              minMpg: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          className="input"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? 'Searching...' : 'Get Recommendations'}
      </button>
    </form>
  );
}
