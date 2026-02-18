import { Calculator } from './components/Calculator';
import './App.css';

/**
 * Root komponenta aplikace
 *
 * Jednoduchý wrapper pro Calculator komponentu
 */
function App() {
  return (
    <div className="app">
      <Calculator />
    </div>
  );
}

export default App;
