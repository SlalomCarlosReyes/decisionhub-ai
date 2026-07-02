export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">DecisionHub AI</h3>
            <p className="text-sm">
              Spec-driven AI platform for intelligent car recommendations.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/search" className="hover:text-white transition-colors">
                  Search Cars
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg mb-4">MVP Capstone</h3>
            <p className="text-sm">
              This is a capstone project demonstrating spec-driven development
              with mock AI agents.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {currentYear} DecisionHub AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
