import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameCanvas from './GameCanvas';
import HUD from './HUD';
import { NetworkService } from '../services/NetworkService';
import { AuthService } from '../services/AuthService';
import { useGameStore } from '../stores/useGameStore';
import { useAuthStore } from '../stores/useAuthStore';

const authService = new AuthService();

function GameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const networkServiceRef = useRef<NetworkService | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const navigate = useNavigate();

  const updateState = useGameStore((state) => state.updateState);
  const setSessionId = useGameStore((state) => state.setSessionId);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      navigate('/auth');
      return;
    }

    // Initialize network service
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    const networkService = new NetworkService(wsUrl);
    networkServiceRef.current = networkService;

    // Connect to game server
    const connectToServer = async () => {
      try {
        const token = authService.getAccessToken();
        const username = user?.username || 'Player';

        if (!token) {
          throw new Error('No access token found');
        }

        await networkService.connect(token, username);

        const sessionId = networkService.getSessionId();
        if (sessionId) {
          setSessionId(sessionId);
        }

        // Listen for state updates
        networkService.onStateUpdate((state) => {
          updateState(state);
        });

        // Listen for damage events
        networkService.onDamage((data) => {
          console.log('Damage received:', data);
        });

        // Listen for death events
        networkService.onPlayerDied((data) => {
          console.log('Player died:', data);
        });

        setIsConnecting(false);
        console.log('✅ Connected to game server');
      } catch (error) {
        console.error('Failed to connect to game server:', error);
        setConnectionError(error instanceof Error ? error.message : 'Failed to connect to server');
        setIsConnecting(false);
      }
    };

    connectToServer();

    // Lock pointer on canvas click
    const canvas = canvasRef.current;
    const handleCanvasClick = () => {
      canvas?.requestPointerLock();
    };

    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick);
    }

    // Handle escape key to exit pointer lock
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.exitPointerLock();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      canvas?.removeEventListener('click', handleCanvasClick);
      networkService.disconnect();
    };
  }, [navigate, user, updateState, setSessionId]);

  if (isConnecting) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-white text-xl">Connecting to game server...</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-900">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-white text-xl mb-4">Connection Failed</p>
          <p className="text-gray-400 mb-6">{connectionError}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <GameCanvas canvasRef={canvasRef} networkService={networkServiceRef.current} />
      <HUD />
    </div>
  );
}

export default GameView;
