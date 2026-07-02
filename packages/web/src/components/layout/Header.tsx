import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🚗</span>
            <span className="text-xl font-bold text-gray-900">
              DecisionHub AI
            </span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/search"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Search Cars
            </Link>
            <Link
              to="/search"
              className="btn btn-primary"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
