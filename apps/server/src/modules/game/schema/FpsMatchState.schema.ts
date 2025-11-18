import { Schema, type, MapSchema } from '@colyseus/schema';
import { PlayerSchema } from './Player.schema';

export class FpsMatchState extends Schema {
  @type('string') matchId: string;
  @type('string') mode: string = 'team_deathmatch';
  @type('string') map: string = 'arena';

  @type('number') startTime: number;
  @type('number') timeRemaining: number = 600; // 10 minutes

  @type('number') blueScore: number = 0;
  @type('number') redScore: number = 0;

  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();

  @type('number') tick: number = 0;

  constructor(matchId: string) {
    super();
    this.matchId = matchId;
    this.startTime = Date.now();
  }
}
