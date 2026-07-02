import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import CarSearchPage from './pages/CarSearchPage';
import CarDetailsPage from './pages/CarDetailsPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<CarSearchPage />} />
          <Route path="/cars/:id" element={<CarDetailsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
