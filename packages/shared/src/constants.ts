import { WeaponConfig, WeaponType } from './types';

// Weapon configurations
export const WEAPON_CONFIGS: Record<WeaponType, WeaponConfig> = {
  [WeaponType.ASSAULT_RIFLE]: {
    type: WeaponType.ASSAULT_RIFLE,
    name: 'M4A1',
    damage: 30,
    headshotMultiplier: 2.0,
    fireRate: 600,
    magazineSize: 30,
    reserveAmmo: 90,
    reloadTime: 2000,
    spread: 0.05,
    recoil: 0.1,
    range: 100,
  },
  [WeaponType.SMG]: {
    type: WeaponType.SMG,
    name: 'MP5',
    damage: 22,
    headshotMultiplier: 1.8,
    fireRate: 800,
    magazineSize: 30,
    reserveAmmo: 90,
    reloadTime: 1800,
    spread: 0.08,
    recoil: 0.08,
    range: 50,
  },
  [WeaponType.SHOTGUN]: {
    type: WeaponType.SHOTGUN,
    name: 'M870',
    damage: 80,
    headshotMultiplier: 1.5,
    fireRate: 60,
    magazineSize: 8,
    reserveAmmo: 32,
    reloadTime: 3000,
    spread: 0.3,
    recoil: 0.3,
    range: 20,
  },
  [WeaponType.SNIPER]: {
    type: WeaponType.SNIPER,
    name: 'AWP',
    damage: 100,
    headshotMultiplier: 3.0,
    fireRate: 40,
    magazineSize: 5,
    reserveAmmo: 20,
    reloadTime: 2500,
    spread: 0.02,
    recoil: 0.4,
    range: 200,
  },
  [WeaponType.PISTOL]: {
    type: WeaponType.PISTOL,
    name: 'Glock',
    damage: 20,
    headshotMultiplier: 2.0,
    fireRate: 300,
    magazineSize: 17,
    reserveAmmo: 51,
    reloadTime: 1500,
    spread: 0.06,
    recoil: 0.05,
    range: 40,
  },
};

// Game constants
export const GAME_CONSTANTS = {
  TICK_RATE: 60, // Server tick rate
  MAX_PLAYERS_PER_MATCH: 10,
  RESPAWN_TIME: 5000, // milliseconds
  MATCH_TIME_LIMIT: 600, // 10 minutes in seconds
  TEAM_DEATHMATCH_SCORE_LIMIT: 50,

  // Player physics
  PLAYER_SPEED: 5,
  PLAYER_SPRINT_MULTIPLIER: 1.5,
  PLAYER_JUMP_FORCE: 8,
  PLAYER_GRAVITY: -20,
  PLAYER_HEIGHT: 1.8,
  PLAYER_RADIUS: 0.5,

  // Health
  MAX_HEALTH: 100,
  MAX_ARMOR: 100,
};

// XP and progression
export const XP_CONFIG = {
  KILL: 100,
  ASSIST: 50,
  HEADSHOT_BONUS: 25,
  WIN_BONUS: 500,
  MATCH_COMPLETION: 100,
  PER_MINUTE_PLAYED: 10,

  LEVEL_UP_BASE: 1000,
  LEVEL_UP_MULTIPLIER: 1.2,
};

// Ranks
export const RANKS = [
  { name: 'Bronze', minMMR: 0 },
  { name: 'Silver', minMMR: 1200 },
  { name: 'Gold', minMMR: 1500 },
  { name: 'Platinum', minMMR: 1800 },
  { name: 'Diamond', minMMR: 2100 },
  { name: 'Master', minMMR: 2500 },
  { name: 'Grandmaster', minMMR: 3000 },
];
