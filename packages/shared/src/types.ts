// Player state
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

// Vector3
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Input state
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

// Weapon types
export enum WeaponType {
  ASSAULT_RIFLE = 'assault_rifle',
  SMG = 'smg',
  SHOTGUN = 'shotgun',
  SNIPER = 'sniper',
  PISTOL = 'pistol',
}

// Weapon config
export interface WeaponConfig {
  type: WeaponType;
  name: string;
  damage: number;
  headshotMultiplier: number;
  fireRate: number; // rounds per minute
  magazineSize: number;
  reserveAmmo: number;
  reloadTime: number; // milliseconds
  spread: number;
  recoil: number;
  range: number;
}

// Match state
export interface MatchState {
  id: string;
  mode: GameMode;
  map: string;
  startTime: number;
  timeLimit: number; // seconds
  blueScore: number;
  redScore: number;
  players: Map<string, PlayerState>;
}

// Game mode
export enum GameMode {
  TEAM_DEATHMATCH = 'team_deathmatch',
  FREE_FOR_ALL = 'free_for_all',
  CAPTURE_THE_FLAG = 'capture_the_flag',
  DOMINATION = 'domination',
}

// Kill feed event
export interface KillFeedEvent {
  killerId: string;
  killerName: string;
  victimId: string;
  victimName: string;
  weapon: WeaponType;
  isHeadshot: boolean;
  timestamp: number;
}

// Player profile
export interface PlayerProfile {
  id: string;
  username: string;
  level: number;
  xp: number;
  rank: string;
  mmr: number;
  stats: PlayerStats;
}

// Player stats
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
