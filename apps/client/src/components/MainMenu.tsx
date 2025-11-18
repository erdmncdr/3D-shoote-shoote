import { useNavigate } from 'react-router-dom';

function MainMenu() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-6xl font-bold text-white">FPS GAME</h1>
        <p className="text-xl text-gray-400">Browser-Based Multiplayer Shooter</p>

        <div className="flex flex-col space-y-4 mt-12">
          <button
            onClick={() => navigate('/game')}
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
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-xl font-semibold rounded-lg transition-colors min-w-[300px]"
            disabled
          >
            PROFILE
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Version 1.0.0 - Alpha</p>
        </div>
      </div>
    </div>
  );
}

export default MainMenu;
