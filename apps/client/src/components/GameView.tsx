import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameCanvas from './GameCanvas';
import HUD from './HUD';
import KillFeed from './KillFeed';
import ConnectionStatus from './ConnectionStatus';
import HitMarker from './HitMarker';
import DamageIndicator from './DamageIndicator';
import Scoreboard from './Scoreboard';
import RespawnTimer from './RespawnTimer';
import { NetworkService, ConnectionState, type KillFeedEvent } from '../services/NetworkService';
import { AuthService } from '../services/AuthService';
import { useGameStore } from '../stores/useGameStore';
import { useAuthStore } from '../stores/useAuthStore';

const authService = new AuthService();

interface DamageEvent {
  direction: number;
  timestamp: number;
  id: string;
}

function GameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const networkServiceRef = useRef<NetworkService | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.CONNECTING
  );
  const [ping, setPing] = useState(0);
  const [killFeedEvents, setKillFeedEvents] = useState<KillFeedEvent[]>([]);
  const [hitMarker, setHitMarker] = useState({ show: false, isHeadshot: false });
  const [damageEvents, setDamageEvents] = useState<DamageEvent[]>([]);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [respawnTime, setRespawnTime] = useState<number | null>(null);
  const navigate = useNavigate();

  const updateState = useGameStore((state) => state.updateState);
  const setSessionId = useGameStore((state) => state.setSessionId);
  const user = useAuthStore((state) => state.user);
  const localPlayer = useGameStore((state) => state.getLocalPlayer());

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
          console.log('💥 Damage received:', data);

          // Add damage indicator
          const direction = Math.atan2(data.direction?.x || 0, data.direction?.z || 0);
          setDamageEvents((prev) => [
            ...prev,
            {
              direction,
              timestamp: Date.now(),
              id: `${Date.now()}-${Math.random()}`,
            },
          ]);

          // Show hit marker if we hit someone
          if (data.isHit) {
            setHitMarker({ show: true, isHeadshot: data.isHeadshot });
            setTimeout(() => setHitMarker({ show: false, isHeadshot: false }), 100);
          }
        });

        // Listen for death events
        networkService.onPlayerDied((data) => {
          console.log('💀 Player died:', data);

          // Set respawn time (5 seconds from now)
          if (data.victimId === sessionId) {
            setRespawnTime(Date.now() + 5000);
          }
        });

        // Listen for respawn events
        networkService.onPlayerRespawned((data: { playerId: string }) => {
          if (data.playerId === sessionId) {
            setRespawnTime(null);
          }
        });

        // Listen for kill feed events
        networkService.onKillFeed((event) => {
          setKillFeedEvents((prev) => [...prev, event]);
        });

        // Listen for connection state changes
        networkService.onConnectionStateChanged((state) => {
          setConnectionState(state);
          if (state === ConnectionState.FAILED) {
            setConnectionError('Connection lost. Please try again.');
          } else if (state === ConnectionState.CONNECTED) {
            setConnectionError(null);
          }
        });

        // Listen for ping updates
        networkService.onPingUpdate((pingValue) => {
          setPing(pingValue);
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
        setShowScoreboard(false);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setShowScoreboard((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
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

  if (connectionError && connectionState === ConnectionState.FAILED) {
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
      <KillFeed events={killFeedEvents} />
      <ConnectionStatus connectionState={connectionState} ping={ping} />
      <HitMarker show={hitMarker.show} isHeadshot={hitMarker.isHeadshot} />
      <DamageIndicator damageEvents={damageEvents} />
      <Scoreboard visible={showScoreboard} />
      {respawnTime && localPlayer && !localPlayer.isAlive && (
        <RespawnTimer respawnTime={respawnTime} />
      )}
    </div>
  );
}

export default GameView;
