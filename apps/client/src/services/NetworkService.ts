import { Client, Room } from 'colyseus.js';
import { InputState } from '@shared/types';

export type PlayerData = {
  id: string;
  username: string;
  team: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  health: number;
  armor: number;
  isAlive: boolean;
  currentWeapon: string;
  ammo: number;
  reserveAmmo: number;
  kills: number;
  deaths: number;
};

export type GameState = {
  players: Map<string, PlayerData>;
  blueScore: number;
  redScore: number;
  timeRemaining: number;
  tick: number;
};

export type KillFeedEvent = {
  killerId: string;
  killerName: string;
  victimId: string;
  victimName: string;
  weapon: string;
  isHeadshot: boolean;
  timestamp: number;
};

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

export class NetworkService {
  private client: Client;
  private room: Room | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;

  // Callbacks
  private onStateUpdateCallback: ((state: GameState) => void) | null = null;
  private onPlayerJoinedCallback: ((player: PlayerData) => void) | null = null;
  private onPlayerLeftCallback: ((playerId: string) => void) | null = null;
  private onDamageCallback: ((data: any) => void) | null = null;
  private onPlayerDiedCallback: ((data: any) => void) | null = null;
  private onPlayerRespawnedCallback: ((data: any) => void) | null = null;
  private onKillFeedCallback: ((event: KillFeedEvent) => void) | null = null;
  private onConnectionStateChangedCallback: ((state: ConnectionState) => void) | null = null;
  private onPingUpdateCallback: ((ping: number) => void) | null = null;

  // Reconnection
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private connectionOptions: any = null;

  // Ping tracking
  private lastPingTime = 0;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(serverUrl: string = import.meta.env.VITE_WS_URL || 'ws://localhost:3001') {
    this.client = new Client(serverUrl);
  }

  async connect(token: string, username: string): Promise<void> {
    try {
      this.setConnectionState(ConnectionState.CONNECTING);
      console.log('🔌 Connecting to game server...');

      // Store connection options for reconnection
      this.connectionOptions = {
        token,
        username,
      };

      this.room = await this.client.joinOrCreate('fps_match', this.connectionOptions);

      console.log('✅ Connected to room:', this.room.id);
      this.reconnectAttempts = 0;
      this.setConnectionState(ConnectionState.CONNECTED);

      this.setupRoomHandlers();
      this.startPingTracking();
    } catch (error) {
      console.error('❌ Failed to connect:', error);
      this.setConnectionState(ConnectionState.FAILED);
      throw error;
    }
  }

  private setupRoomHandlers() {
    if (!this.room) return;

    // Listen for state changes
    this.room.onStateChange((state: any) => {
      if (this.onStateUpdateCallback) {
        const gameState: GameState = {
          players: new Map(),
          blueScore: state.blueScore || 0,
          redScore: state.redScore || 0,
          timeRemaining: state.timeRemaining || 0,
          tick: state.tick || 0,
        };

        // Convert players to map
        if (state.players) {
          state.players.forEach((player: any, sessionId: string) => {
            gameState.players.set(sessionId, {
              id: player.id,
              username: player.username,
              team: player.team,
              position: {
                x: player.position?.x || 0,
                y: player.position?.y || 0,
                z: player.position?.z || 0,
              },
              rotation: {
                x: player.rotation?.x || 0,
                y: player.rotation?.y || 0,
                z: player.rotation?.z || 0,
              },
              health: player.health || 100,
              armor: player.armor || 100,
              isAlive: player.isAlive !== false,
              currentWeapon: player.currentWeapon || 'assault_rifle',
              ammo: player.ammo || 0,
              reserveAmmo: player.reserveAmmo || 0,
              kills: player.kills || 0,
              deaths: player.deaths || 0,
            });
          });
        }

        this.onStateUpdateCallback(gameState);
      }
    });

    // Listen for damage events
    this.room.onMessage('damage', (data) => {
      if (this.onDamageCallback) {
        this.onDamageCallback(data);
      }
    });

    // Listen for death events
    this.room.onMessage('player_died', (data) => {
      if (this.onPlayerDiedCallback) {
        this.onPlayerDiedCallback(data);
      }
    });

    // Listen for kill feed events
    this.room.onMessage('kill_feed', (data: KillFeedEvent) => {
      if (this.onKillFeedCallback) {
        this.onKillFeedCallback(data);
      }
    });

    // Listen for respawn events
    this.room.onMessage('player_respawned', (data) => {
      console.log('🔄 Player respawned:', data);
      if (this.onPlayerRespawnedCallback) {
        this.onPlayerRespawnedCallback(data);
      }
    });

    // Listen for match end
    this.room.onMessage('match_end', (data) => {
      console.log('🏁 Match ended:', data);
    });

    // Listen for ping responses
    this.room.onMessage('pong', () => {
      const ping = Date.now() - this.lastPingTime;
      if (this.onPingUpdateCallback) {
        this.onPingUpdateCallback(ping);
      }
    });

    // Handle disconnection
    this.room.onLeave((code) => {
      console.log('⚠️ Left room with code:', code);
      this.stopPingTracking();

      // Only attempt reconnection if not intentional disconnect
      if (code !== 1000) {
        this.attemptReconnection();
      } else {
        this.setConnectionState(ConnectionState.DISCONNECTED);
      }
    });

    // Handle errors
    this.room.onError((code, message) => {
      console.error('❌ Room error:', code, message);
      this.setConnectionState(ConnectionState.FAILED);
    });
  }

  private async attemptReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.setConnectionState(ConnectionState.FAILED);
      return;
    }

    this.reconnectAttempts++;
    this.setConnectionState(ConnectionState.RECONNECTING);

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 16000);
    console.log(
      `🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`
    );

    this.reconnectTimeout = setTimeout(async () => {
      try {
        if (this.connectionOptions) {
          await this.connect(this.connectionOptions.token, this.connectionOptions.username);
          console.log('✅ Reconnection successful!');
        }
      } catch (error) {
        console.error('❌ Reconnection failed:', error);
        this.attemptReconnection(); // Try again
      }
    }, delay);
  }

  private startPingTracking() {
    this.pingInterval = setInterval(() => {
      if (this.room && this.connectionState === ConnectionState.CONNECTED) {
        this.lastPingTime = Date.now();
        this.room.send('ping');
      }
    }, 2000); // Ping every 2 seconds
  }

  private stopPingTracking() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private setConnectionState(state: ConnectionState) {
    this.connectionState = state;
    if (this.onConnectionStateChangedCallback) {
      this.onConnectionStateChangedCallback(state);
    }
  }

  // Public methods
  sendInput(input: InputState) {
    if (this.room && this.connectionState === ConnectionState.CONNECTED) {
      this.room.send('input', input);
    }
  }

  sendShoot(aimDirection: { x: number; y: number; z: number }) {
    if (this.room && this.connectionState === ConnectionState.CONNECTED) {
      this.room.send('shoot', { aimDirection });
    }
  }

  sendReload() {
    if (this.room && this.connectionState === ConnectionState.CONNECTED) {
      this.room.send('reload');
    }
  }

  sendWeaponSwitch(weapon: string) {
    if (this.room && this.connectionState === ConnectionState.CONNECTED) {
      this.room.send('switch_weapon', { weapon });
    }
  }

  onStateUpdate(callback: (state: GameState) => void) {
    this.onStateUpdateCallback = callback;
  }

  onPlayerJoined(callback: (player: PlayerData) => void) {
    this.onPlayerJoinedCallback = callback;
  }

  onPlayerLeft(callback: (playerId: string) => void) {
    this.onPlayerLeftCallback = callback;
  }

  onDamage(callback: (data: any) => void) {
    this.onDamageCallback = callback;
  }

  onPlayerDied(callback: (data: any) => void) {
    this.onPlayerDiedCallback = callback;
  }

  onPlayerRespawned(callback: (data: any) => void) {
    this.onPlayerRespawnedCallback = callback;
  }

  onKillFeed(callback: (event: KillFeedEvent) => void) {
    this.onKillFeedCallback = callback;
  }

  onConnectionStateChanged(callback: (state: ConnectionState) => void) {
    this.onConnectionStateChangedCallback = callback;
  }

  onPingUpdate(callback: (ping: number) => void) {
    this.onPingUpdateCallback = callback;
  }

  getSessionId(): string | null {
    return this.room?.sessionId || null;
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED;
  }

  disconnect() {
    console.log('👋 Disconnecting from game server...');

    // Clear reconnection timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Stop ping tracking
    this.stopPingTracking();

    // Leave room
    if (this.room) {
      this.room.leave();
      this.room = null;
    }

    this.setConnectionState(ConnectionState.DISCONNECTED);
    this.connectionOptions = null;
    this.reconnectAttempts = 0;
  }
}
