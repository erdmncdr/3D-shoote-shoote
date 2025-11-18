import { InputState, KillFeedEvent, Vector3, WeaponType } from './types';

// Client to Server messages
export enum ClientMessageType {
  INPUT = 'input',
  READY = 'ready',
  CHANGE_WEAPON = 'change_weapon',
  CHAT = 'chat',
}

export interface ClientInputMessage {
  type: ClientMessageType.INPUT;
  data: InputState;
}

export interface ClientReadyMessage {
  type: ClientMessageType.READY;
}

export interface ClientChangeWeaponMessage {
  type: ClientMessageType.CHANGE_WEAPON;
  weapon: WeaponType;
}

export interface ClientChatMessage {
  type: ClientMessageType.CHAT;
  message: string;
  teamOnly: boolean;
}

export type ClientMessage =
  | ClientInputMessage
  | ClientReadyMessage
  | ClientChangeWeaponMessage
  | ClientChatMessage;

// Server to Client messages
export enum ServerMessageType {
  MATCH_STATE = 'match_state',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  PLAYER_DIED = 'player_died',
  PLAYER_RESPAWNED = 'player_respawned',
  DAMAGE = 'damage',
  KILL_FEED = 'kill_feed',
  CHAT = 'chat',
  MATCH_END = 'match_end',
}

export interface ServerMatchStateMessage {
  type: ServerMessageType.MATCH_STATE;
  state: Record<string, unknown>; // Will be the Colyseus state snapshot
}

export interface ServerPlayerJoinedMessage {
  type: ServerMessageType.PLAYER_JOINED;
  playerId: string;
  username: string;
  team: 'blue' | 'red';
}

export interface ServerPlayerLeftMessage {
  type: ServerMessageType.PLAYER_LEFT;
  playerId: string;
}

export interface ServerPlayerDiedMessage {
  type: ServerMessageType.PLAYER_DIED;
  victimId: string;
  killerId: string;
  weapon: WeaponType;
  isHeadshot: boolean;
}

export interface ServerPlayerRespawnedMessage {
  type: ServerMessageType.PLAYER_RESPAWNED;
  playerId: string;
  position: Vector3;
}

export interface ServerDamageMessage {
  type: ServerMessageType.DAMAGE;
  targetId: string;
  damage: number;
  newHealth: number;
}

export interface ServerKillFeedMessage {
  type: ServerMessageType.KILL_FEED;
  event: KillFeedEvent;
}

export interface ServerChatMessage {
  type: ServerMessageType.CHAT;
  playerId: string;
  playerName: string;
  message: string;
  teamOnly: boolean;
}

export interface ServerMatchEndMessage {
  type: ServerMessageType.MATCH_END;
  winningTeam: 'blue' | 'red' | 'draw';
  blueScore: number;
  redScore: number;
  mvpId: string;
}

export type ServerMessage =
  | ServerMatchStateMessage
  | ServerPlayerJoinedMessage
  | ServerPlayerLeftMessage
  | ServerPlayerDiedMessage
  | ServerPlayerRespawnedMessage
  | ServerDamageMessage
  | ServerKillFeedMessage
  | ServerChatMessage
  | ServerMatchEndMessage;
