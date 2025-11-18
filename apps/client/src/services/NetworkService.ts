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

export class NetworkService {
  private client: Client;
  private room: Room | null = null;
  private onStateUpdateCallback: ((state: GameState) => void) | null = null;
  private _onPlayerJoinedCallback: ((player: PlayerData) => void) | null = null;
  private _onPlayerLeftCallback: ((playerId: string) => void) | null = null;
  private onDamageCallback: ((data: any) => void) | null = null;
  private onPlayerDiedCallback: ((data: any) => void) | null = null;

  constructor(serverUrl: string = 'ws://localhost:3001') {
    this.client = new Client(serverUrl);
  }

  async connect(token: string, username: string): Promise<void> {
    try {
      console.log('Connecting to game server...');

      this.room = await this.client.joinOrCreate('fps_match', {
        token,
        username,
        userId: 'temp-user-id', // TODO: Get from JWT
      });

      console.log('Connected to room:', this.room.id);

      this.setupRoomHandlers();
    } catch (error) {
      console.error('Failed to connect:', error);
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

    // Listen for messages
    this.room.onMessage('damage', (data) => {
      if (this.onDamageCallback) {
        this.onDamageCallback(data);
      }
    });

    this.room.onMessage('player_died', (data) => {
      if (this.onPlayerDiedCallback) {
        this.onPlayerDiedCallback(data);
      }
    });

    this.room.onMessage('player_respawned', (data) => {
      console.log('Player respawned:', data);
    });

    this.room.onMessage('match_end', (data) => {
      console.log('Match ended:', data);
    });
  }

  sendInput(input: InputState) {
    if (this.room) {
      this.room.send('input', input);
    }
  }

  sendShoot(aimDirection: { x: number; y: number; z: number }) {
    if (this.room) {
      this.room.send('shoot', { aimDirection });
    }
  }

  onStateUpdate(callback: (state: GameState) => void) {
    this.onStateUpdateCallback = callback;
  }

  onPlayerJoined(callback: (player: PlayerData) => void) {
    this._onPlayerJoinedCallback = callback;
  }

  onPlayerLeft(callback: (playerId: string) => void) {
    this._onPlayerLeftCallback = callback;
  }

  onDamage(callback: (data: any) => void) {
    this.onDamageCallback = callback;
  }

  onPlayerDied(callback: (data: any) => void) {
    this.onPlayerDiedCallback = callback;
  }

  getSessionId(): string | null {
    return this.room?.sessionId || null;
  }

  disconnect() {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
  }
}
