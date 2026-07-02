import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Find Your Perfect Car with AI
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          DecisionHub AI uses intelligent agents to analyze your preferences and
          recommend the best cars for your needs.
        </p>
        <Link to="/search" className="btn btn-primary text-lg px-8 py-3 inline-block">
          Start Your Search
        </Link>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="card text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
          <p className="text-gray-600">
            Mock AI agents analyze your criteria and provide intelligent
            recommendations
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">Detailed Comparisons</h3>
          <p className="text-gray-600">
            Compare multiple cars side-by-side with comprehensive analysis
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-bold mb-2">Spec-Driven</h3>
          <p className="text-gray-600">
            Built with spec-driven development for maintainable, scalable code
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="card max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h4 className="font-bold mb-2">Tell Us Your Needs</h4>
            <p className="text-sm text-gray-600">
              Enter your budget, preferences, and requirements
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h4 className="font-bold mb-2">AI Analysis</h4>
            <p className="text-sm text-gray-600">
              Our agents analyze available cars against your criteria
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h4 className="font-bold mb-2">Get Recommendations</h4>
            <p className="text-sm text-gray-600">
              Receive ranked suggestions with detailed reasoning
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              4
            </div>
            <h4 className="font-bold mb-2">Compare & Decide</h4>
            <p className="text-sm text-gray-600">
              Compare options and make an informed decision
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-16">
        <h2 className="text-3xl font-bold mb-4">Ready to Find Your Car?</h2>
        <p className="text-gray-600 mb-6">
          Start your search now and let our AI agents help you decide.
        </p>
        <Link to="/search" className="btn btn-primary text-lg px-8 py-3 inline-block">
          Search Cars Now
        </Link>
      </div>
    </div>
  );
}
