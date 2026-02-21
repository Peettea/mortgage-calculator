import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { CalculatorPage } from './pages/CalculatorPage';
import { AboutPage } from './pages/AboutPage';
import { HistoryPage } from './pages/HistoryPage';
import { ComparePage } from './pages/ComparePage';
import './App.css';

/**
 * Root komponenta — nastavuje routing (navigaci mezi stránkami)
 */
function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <div className="app-container">
          <Navigation />
          <Routes>
            <Route path="/" element={<CalculatorPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
