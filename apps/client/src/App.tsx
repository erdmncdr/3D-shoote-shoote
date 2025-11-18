import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import GameView from './components/GameView';
import Settings from './components/Settings';
import AuthScreen from './components/AuthScreen';

function App() {
  return (
    <Router>
      <div className="h-screen w-screen overflow-hidden bg-gray-900">
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/game" element={<GameView />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
