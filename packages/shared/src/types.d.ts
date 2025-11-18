export interface PlayerState {
  id: string;
  username: string;
  team: 'blue' | 'red';
  position: Vector3;
  rotation: Vector3;
  velocity: Vector3;
  health: number;
  armor: number;
  isAlive: boolean;
  currentWeapon: WeaponType;
  ammo: number;
  reserveAmmo: number;
}
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}
export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  crouch: boolean;
  shoot: boolean;
  aim: boolean;
  reload: boolean;
  mouseX: number;
  mouseY: number;
  timestamp: number;
}
export declare enum WeaponType {
  ASSAULT_RIFLE = 'assault_rifle',
  SMG = 'smg',
  SHOTGUN = 'shotgun',
  SNIPER = 'sniper',
  PISTOL = 'pistol',
}
export interface WeaponConfig {
  type: WeaponType;
  name: string;
  damage: number;
  headshotMultiplier: number;
  fireRate: number;
  magazineSize: number;
  reserveAmmo: number;
  reloadTime: number;
  spread: number;
  recoil: number;
  range: number;
}
export interface MatchState {
  id: string;
  mode: GameMode;
  map: string;
  startTime: number;
  timeLimit: number;
  blueScore: number;
  redScore: number;
  players: Map<string, PlayerState>;
}
export declare enum GameMode {
  TEAM_DEATHMATCH = 'team_deathmatch',
  FREE_FOR_ALL = 'free_for_all',
  CAPTURE_THE_FLAG = 'capture_the_flag',
  DOMINATION = 'domination',
}
export interface KillFeedEvent {
  killerId: string;
  killerName: string;
  victimId: string;
  victimName: string;
  weapon: WeaponType;
  isHeadshot: boolean;
  timestamp: number;
}
export interface PlayerProfile {
  id: string;
  username: string;
  level: number;
  xp: number;
  rank: string;
  mmr: number;
  stats: PlayerStats;
}
export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
  winRate: number;
}
//# sourceMappingURL=types.d.ts.map
