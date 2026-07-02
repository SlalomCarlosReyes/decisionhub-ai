import { Car, CarComparison, AgentInput, AgentOutput } from '@decisionhub/shared';
import { BaseAgent } from './base/BaseAgent';
import { getCarById } from '../data/mockData';

interface ComparisonInput extends AgentInput {
  carIds: string[];
}

interface ComparisonOutput extends AgentOutput {
  comparison: CarComparison;
}

/**
 * Car Comparison Agent (MVP - Mock Implementation)
 * Compares multiple cars side-by-side with analysis
 * Future: Replace with real LLM integration
 */
export class CarComparisonAgent extends BaseAgent {
  name = 'CarComparisonAgent';
  description = 'Compares multiple cars and provides analysis';

  async execute(input: ComparisonInput): Promise<ComparisonOutput> {
    this.log(`Comparing ${input.carIds.length} cars...`);

    const { result, executionTime } = await this.measureExecutionTime(() =>
      this.compareCars(input.carIds)
    );

    this.log(`Comparison completed in ${executionTime}ms`);

    return {
      comparison: result,
    };
  }

  private async compareCars(carIds: string[]): Promise<CarComparison> {
    // Load all cars
    const cars: Car[] = [];
    for (const id of carIds) {
      const car = await getCarById(id);
      if (car) {
        cars.push(car);
      }
    }

    if (cars.length < 2) {
      throw new Error('At least 2 valid cars required for comparison');
    }

    // Build comparison table
    const comparison = [
      this.compareAttribute('Make', cars, (car) => car.make),
      this.compareAttribute('Model', cars, (car) => car.model),
      this.compareAttribute('Year', cars, (car) => car.year),
      this.compareAttribute(
        'Price',
        cars,
        (car) => `$${car.price.toLocaleString()}`
      ),
      this.compareAttribute('Fuel Type', cars, (car) => car.fuelType),
      this.compareAttribute('Body Type', cars, (car) => car.bodyType),
      this.compareAttribute('Drivetrain', cars, (car) => car.drivetrain),
      this.compareAttribute('Transmission', cars, (car) => car.transmission),
      this.compareNumericAttribute(
        'MPG (City)',
        cars,
        (car) => car.mpg?.city,
        'higher'
      ),
      this.compareNumericAttribute(
        'MPG (Highway)',
        cars,
        (car) => car.mpg?.highway,
        'higher'
      ),
      this.compareNumericAttribute(
        'MPG (Combined)',
        cars,
        (car) => car.mpg?.combined,
        'higher'
      ),
      this.compareNumericAttribute(
        'Horsepower',
        cars,
        (car) => car.specifications?.horsepower,
        'higher'
      ),
      this.compareNumericAttribute(
        'Seating',
        cars,
        (car) => car.specifications?.seating,
        'higher'
      ),
      this.compareAttribute(
        'Features Count',
        cars,
        (car) => car.features.length
      ),
    ];

    // Generate overall recommendation
    const recommendation = this.generateRecommendation(cars);

    return {
      cars,
      comparison,
      recommendation,
    };
  }

  private compareAttribute(
    attribute: string,
    cars: Car[],
    getValue: (car: Car) => string | number | undefined
  ): {
    attribute: string;
    values: (string | number | undefined)[];
    winner?: number;
  } {
    const values = cars.map(getValue);
    return { attribute, values };
  }

  private compareNumericAttribute(
    attribute: string,
    cars: Car[],
    getValue: (car: Car) => number | undefined,
    preference: 'higher' | 'lower'
  ): {
    attribute: string;
    values: (string | number | undefined)[];
    winner?: number;
  } {
    const values = cars.map(getValue);
    
    // Find winner based on preference
    let winnerIndex: number | undefined;
    let bestValue: number | undefined;

    values.forEach((value, index) => {
      if (value !== undefined) {
        if (bestValue === undefined) {
          bestValue = value;
          winnerIndex = index;
        } else if (preference === 'higher' && value > bestValue) {
          bestValue = value;
          winnerIndex = index;
        } else if (preference === 'lower' && value < bestValue) {
          bestValue = value;
          winnerIndex = index;
        }
      }
    });

    return { attribute, values, winner: winnerIndex };
  }

  private generateRecommendation(cars: Car[]): string {
    // Simple mock logic for overall recommendation
    const scores = cars.map((car, index) => ({
      index,
      score: this.calculateOverallScore(car),
      car,
    }));

    scores.sort((a, b) => b.score - a.score);
    const winner = scores[0];

    const parts: string[] = [];

    parts.push(
      `Based on the comparison, the ${winner.car.year} ${winner.car.make} ${winner.car.model} stands out as the best overall value.`
    );

    // Add specific reasons
    if (winner.car.mpg && winner.car.mpg.combined >= 30) {
      parts.push('It offers excellent fuel efficiency.');
    }

    if (winner.car.price === Math.min(...cars.map((c) => c.price))) {
      parts.push('It is also the most affordable option.');
    }

    const currentYear = new Date().getFullYear();
    if (winner.car.year >= currentYear - 2) {
      parts.push('As a newer model, it comes with the latest features and technology.');
    }

    // Mention other notable options
    if (scores.length > 1) {
      const runnerUp = scores[1];
      parts.push(
        `However, if you prioritize ${this.getKeyStrength(
          runnerUp.car
        )}, the ${runnerUp.car.make} ${runnerUp.car.model} is also worth considering.`
      );
    }

    return parts.join(' ');
  }

  private calculateOverallScore(car: Car): number {
    let score = 0;

    // Newer is better
    const currentYear = new Date().getFullYear();
    const age = currentYear - car.year;
    score += Math.max(0, 20 - age * 2);

    // Better MPG is better
    if (car.mpg) {
      score += car.mpg.combined * 0.5;
    }

    // More features is better
    score += car.features.length * 2;

    // Lower price is better (inverse)
    score += Math.max(0, 100 - car.price / 1000);

    return score;
  }

  private getKeyStrength(car: Car): string {
    // Determine the car's key strength
    if (car.fuelType === 'electric') {
      return 'zero emissions and low operating costs';
    }

    if (car.mpg && car.mpg.combined >= 35) {
      return 'fuel efficiency';
    }

    if (car.specifications?.horsepower && car.specifications.horsepower >= 300) {
      return 'performance and power';
    }

    if (car.bodyType === 'suv' || car.bodyType === 'van') {
      return 'space and versatility';
    }

    if (car.features.length >= 15) {
      return 'features and technology';
    }

    const currentYear = new Date().getFullYear();
    if (car.year >= currentYear - 1) {
      return 'latest technology and warranty coverage';
    }

    return 'overall value';
  }
}
