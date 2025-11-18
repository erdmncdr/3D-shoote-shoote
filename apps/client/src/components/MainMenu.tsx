import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

function MainMenu() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handlePlay = () => {
    if (isAuthenticated || authService.isAuthenticated()) {
      navigate('/game');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-6xl font-bold text-white">FPS GAME</h1>
        <p className="text-xl text-gray-400">Browser-Based Multiplayer Shooter</p>

        <div className="flex flex-col space-y-4 mt-12">
          <button
            onClick={handlePlay}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-xl font-semibold rounded-lg transition-colors min-w-[300px]"
          >
            PLAY
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-xl font-semibold rounded-lg transition-colors min-w-[300px]"
          >
            SETTINGS
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-xl font-semibold rounded-lg transition-colors min-w-[300px]"
          >
            {isAuthenticated ? 'PROFILE' : 'LOGIN / REGISTER'}
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Version 1.0.0 - Alpha</p>
          <p className="text-center mt-2">{isAuthenticated ? '✓ Logged in' : 'Not logged in'}</p>
        </div>
      </div>
    </div>
  );
}

export default MainMenu;
