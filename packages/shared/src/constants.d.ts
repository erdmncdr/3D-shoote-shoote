import { WeaponConfig, WeaponType } from './types';
export declare const WEAPON_CONFIGS: Record<WeaponType, WeaponConfig>;
export declare const GAME_CONSTANTS: {
  TICK_RATE: number;
  MAX_PLAYERS_PER_MATCH: number;
  RESPAWN_TIME: number;
  MATCH_TIME_LIMIT: number;
  TEAM_DEATHMATCH_SCORE_LIMIT: number;
  PLAYER_SPEED: number;
  PLAYER_SPRINT_MULTIPLIER: number;
  PLAYER_JUMP_FORCE: number;
  PLAYER_GRAVITY: number;
  PLAYER_HEIGHT: number;
  PLAYER_RADIUS: number;
  MAX_HEALTH: number;
  MAX_ARMOR: number;
};
export declare const XP_CONFIG: {
  KILL: number;
  ASSIST: number;
  HEADSHOT_BONUS: number;
  WIN_BONUS: number;
  MATCH_COMPLETION: number;
  PER_MINUTE_PLAYED: number;
  LEVEL_UP_BASE: number;
  LEVEL_UP_MULTIPLIER: number;
};
export declare const RANKS: {
  name: string;
  minMMR: number;
}[];
//# sourceMappingURL=constants.d.ts.map
