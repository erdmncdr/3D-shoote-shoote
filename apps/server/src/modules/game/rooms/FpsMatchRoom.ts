import { Room, Client } from 'colyseus';
import { FpsMatchState } from '../schema/FpsMatchState.schema';
import { PlayerSchema, Vector3Schema } from '../schema/Player.schema';
import { InputState } from '@shared/types';
import { GAME_CONSTANTS, WEAPON_CONFIGS } from '@shared/constants';
import { WeaponType } from '@shared/types';

interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  shoot: boolean;
  aim: boolean;
  mouseX: number;
  mouseY: number;
  timestamp: number;
}

export class FpsMatchRoom extends Room<FpsMatchState> {
  maxClients = GAME_CONSTANTS.MAX_PLAYERS_PER_MATCH;
  private playerInputs: Map<string, PlayerInput> = new Map();
  private gameLoopInterval: ReturnType<typeof setInterval>;
  private readonly TICK_RATE = GAME_CONSTANTS.TICK_RATE;
  private readonly TICK_INTERVAL = 1000 / this.TICK_RATE;

  onCreate(_options: any) {
    this.setState(new FpsMatchState(this.roomId));

    console.log('FpsMatchRoom created:', this.roomId);

    // Set up message handlers
    this.onMessage('input', (client, message: InputState) => {
      this.playerInputs.set(client.sessionId, {
        forward: message.forward,
        backward: message.backward,
        left: message.left,
        right: message.right,
        jump: message.jump,
        sprint: message.sprint,
        shoot: message.shoot,
        aim: message.aim,
        mouseX: message.mouseX,
        mouseY: message.mouseY,
        timestamp: message.timestamp,
      });
    });

    this.onMessage('shoot', (client, message: { aimDirection: Vector3Schema }) => {
      this.handleShooting(client, message.aimDirection);
    });

    // Start game loop
    this.startGameLoop();
  }

  async onAuth(client: Client, options: any) {
    // Verify JWT token
    try {
      const token = options.token;
      if (!token) {
        throw new Error('No token provided');
      }

      // In a real implementation, verify the JWT token here
      // For now, we'll accept the user data from the token
      return { userId: options.userId, username: options.username };
    } catch (error) {
      console.error('Auth failed:', error);
      return false;
    }
  }

  onJoin(client: Client, options: any) {
    console.log(`Player ${client.sessionId} joined`);

    // Determine team (simple alternating for now)
    const blueCount = Array.from(this.state.players.values()).filter(
      (p) => p.team === 'blue'
    ).length;
    const redCount = Array.from(this.state.players.values()).filter((p) => p.team === 'red').length;
    const team = blueCount <= redCount ? 'blue' : 'red';

    // Create player
    const player = new PlayerSchema(client.sessionId, options.username || 'Player', team);

    // Set spawn position based on team
    const spawnX = team === 'blue' ? -30 : 30;
    const spawnZ = (Math.random() - 0.5) * 20;
    player.position.set(spawnX, 1.6, spawnZ);

    // Add player to state
    this.state.players.set(client.sessionId, player);

    // Initialize input for this player
    this.playerInputs.set(client.sessionId, {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
      shoot: false,
      aim: false,
      mouseX: 0,
      mouseY: 0,
      timestamp: Date.now(),
    });

    console.log(`Player spawned at (${spawnX}, 1.6, ${spawnZ}) on ${team} team`);
  }

  onLeave(client: Client, _consented: boolean) {
    console.log(`Player ${client.sessionId} left`);

    this.state.players.delete(client.sessionId);
    this.playerInputs.delete(client.sessionId);

    // If no players left, dispose room
    if (this.state.players.size === 0) {
      this.disconnect();
    }
  }

  onDispose() {
    console.log('FpsMatchRoom disposed');
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
    }
  }

  private startGameLoop() {
    const deltaTime = this.TICK_INTERVAL / 1000; // Convert to seconds

    this.gameLoopInterval = setInterval(() => {
      this.state.tick++;

      // Update all players
      this.state.players.forEach((player, sessionId) => {
        if (!player.isAlive) return;

        const input = this.playerInputs.get(sessionId);
        if (!input) return;

        this.updatePlayerMovement(player, input, deltaTime);
      });

      // Update match time
      const elapsed = Date.now() - this.state.startTime;
      this.state.timeRemaining = Math.max(0, 600 - Math.floor(elapsed / 1000));

      // Check win condition
      if (this.state.timeRemaining <= 0) {
        this.endMatch();
      }
    }, this.TICK_INTERVAL);
  }

  private updatePlayerMovement(player: PlayerSchema, input: PlayerInput, deltaTime: number) {
    // Calculate movement direction based on input
    let moveX = 0;
    let moveZ = 0;

    if (input.forward) moveZ += 1;
    if (input.backward) moveZ -= 1;
    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;

    // Normalize diagonal movement
    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= length;
      moveZ /= length;
    }

    // Calculate speed
    let speed = GAME_CONSTANTS.PLAYER_SPEED;
    if (input.sprint) {
      speed *= GAME_CONSTANTS.PLAYER_SPRINT_MULTIPLIER;
    }

    // Apply rotation (simplified - just using mouseX for Y rotation)
    const yaw = input.mouseX;

    // Convert local movement to world space
    const worldMoveX = moveX * Math.cos(yaw) - moveZ * Math.sin(yaw);
    const worldMoveZ = moveX * Math.sin(yaw) + moveZ * Math.cos(yaw);

    // Update velocity
    player.velocity.x = worldMoveX * speed;
    player.velocity.z = worldMoveZ * speed;

    // Apply gravity
    player.velocity.y += GAME_CONSTANTS.PLAYER_GRAVITY * deltaTime;

    // Update position
    player.position.x += player.velocity.x * deltaTime;
    player.position.y += player.velocity.y * deltaTime;
    player.position.z += player.velocity.z * deltaTime;

    // Ground collision (simple)
    if (player.position.y <= 1.6) {
      player.position.y = 1.6;
      player.velocity.y = 0;

      // Jump
      if (input.jump) {
        player.velocity.y = GAME_CONSTANTS.PLAYER_JUMP_FORCE;
      }
    }

    // Update rotation
    player.rotation.y = yaw;
    player.rotation.x = input.mouseY;

    // Basic world bounds
    player.position.x = Math.max(-50, Math.min(50, player.position.x));
    player.position.z = Math.max(-50, Math.min(50, player.position.z));
  }

  private handleShooting(client: Client, aimDirection: Vector3Schema) {
    const player = this.state.players.get(client.sessionId);
    if (!player || !player.isAlive) return;

    // Check if player has ammo
    if (player.ammo <= 0) return;

    // Get weapon config
    const weaponConfig = WEAPON_CONFIGS[player.currentWeapon as WeaponType];
    if (!weaponConfig) return;

    // Consume ammo
    player.ammo--;

    // Perform raycast from player position in aim direction
    const hitInfo = this.performRaycast(player.position, aimDirection, weaponConfig.range);

    if (hitInfo.hit && hitInfo.targetPlayer) {
      // Apply damage
      this.applyDamage(hitInfo.targetPlayer, weaponConfig.damage, player, hitInfo.isHeadshot);
    }
  }

  private performRaycast(
    origin: Vector3Schema,
    direction: Vector3Schema,
    maxDistance: number
  ): { hit: boolean; targetPlayer?: PlayerSchema; isHeadshot: boolean } {
    let closestHit: PlayerSchema | undefined;
    let closestDistance = maxDistance;
    let isHeadshot = false;

    // Check all other players
    this.state.players.forEach((player) => {
      if (!player.isAlive) return;
      if (player.position === origin) return; // Don't hit self

      // Simple sphere collision check (in real game, use proper raycast)
      const dx = player.position.x - origin.x;
      const dy = player.position.y - origin.y;
      const dz = player.position.z - origin.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Check if player is in direction of ray (simplified)
      if (distance < closestDistance && distance < maxDistance) {
        closestHit = player;
        closestDistance = distance;

        // Check if headshot (head is at y + 0.6 to y + 0.9 from player position)
        const headY = player.position.y + 0.7;
        const targetY = origin.y + direction.y * distance;
        isHeadshot = Math.abs(targetY - headY) < 0.3;
      }
    });

    return {
      hit: closestHit !== undefined,
      targetPlayer: closestHit,
      isHeadshot,
    };
  }

  private applyDamage(
    target: PlayerSchema,
    baseDamage: number,
    attacker: PlayerSchema,
    isHeadshot: boolean
  ) {
    if (!target.isAlive) return;

    // Calculate actual damage
    let damage = baseDamage;
    const weaponConfig = WEAPON_CONFIGS[attacker.currentWeapon as WeaponType];

    if (isHeadshot && weaponConfig) {
      damage *= weaponConfig.headshotMultiplier;
    }

    // Apply to armor first
    if (target.armor > 0) {
      const armorDamage = Math.min(target.armor, damage / 2);
      target.armor -= armorDamage;
      damage -= armorDamage;
    }

    // Apply remaining to health
    target.health -= damage;

    // Check death
    if (target.health <= 0) {
      this.handlePlayerDeath(target, attacker);
    }

    // Broadcast damage event
    this.broadcast('damage', {
      targetId: target.id,
      attackerId: attacker.id,
      damage,
      isHeadshot,
      newHealth: target.health,
    });
  }

  private handlePlayerDeath(victim: PlayerSchema, killer: PlayerSchema) {
    victim.isAlive = false;
    victim.health = 0;
    victim.deaths++;

    killer.kills++;

    // Update team score
    if (killer.team === 'blue') {
      this.state.blueScore++;
    } else {
      this.state.redScore++;
    }

    // Broadcast death event
    this.broadcast('player_died', {
      victimId: victim.id,
      killerId: killer.id,
      weapon: killer.currentWeapon,
    });

    // Schedule respawn
    setTimeout(() => {
      this.respawnPlayer(victim);
    }, GAME_CONSTANTS.RESPAWN_TIME);
  }

  private respawnPlayer(player: PlayerSchema) {
    player.isAlive = true;
    player.health = GAME_CONSTANTS.MAX_HEALTH;
    player.armor = GAME_CONSTANTS.MAX_ARMOR;

    // Respawn at team spawn
    const spawnX = player.team === 'blue' ? -30 : 30;
    const spawnZ = (Math.random() - 0.5) * 20;
    player.position.set(spawnX, 1.6, spawnZ);
    player.velocity.set(0, 0, 0);

    // Broadcast respawn
    this.broadcast('player_respawned', {
      playerId: player.id,
      position: { x: player.position.x, y: player.position.y, z: player.position.z },
    });
  }

  private endMatch() {
    const winningTeam = this.state.blueScore > this.state.redScore ? 'blue' : 'red';

    this.broadcast('match_end', {
      winningTeam,
      blueScore: this.state.blueScore,
      redScore: this.state.redScore,
    });

    // Dispose room after a delay
    setTimeout(() => {
      this.disconnect();
    }, 10000);
  }
}
