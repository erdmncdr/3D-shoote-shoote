import { Server } from 'colyseus';
import { FpsMatchRoom } from './rooms/FpsMatchRoom';

export class GameServer {
  private gameServer: Server;

  constructor(httpServer: any) {
    this.gameServer = new Server({
      server: httpServer,
    });

    // Register game rooms
    this.gameServer.define('fps_match', FpsMatchRoom);

    console.log('🎮 Colyseus Game Server initialized');
  }

  public getServer(): Server {
    return this.gameServer;
  }

  public async gracefulShutdown(): Promise<void> {
    console.log('🎮 Shutting down Colyseus Game Server...');
    await this.gameServer.gracefullyShutdown();
  }
}
