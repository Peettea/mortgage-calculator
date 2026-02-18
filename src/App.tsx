import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { CalculatorPage } from './pages/CalculatorPage';
import { AboutPage } from './pages/AboutPage';
import './App.css';

/**
 * Root komponenta — nastavuje routing (navigaci mezi stránkami)
 *
 * "/" → CalculatorPage (kalkulačka)
 * "/about" → AboutPage (o aplikaci)
 */
function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <div className="app-container">
          <Navigation />
          <Routes>
            <Route path="/" element={<CalculatorPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
