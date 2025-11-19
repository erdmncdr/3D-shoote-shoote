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
  crouch: boolean;
  shoot: boolean;
  aim: boolean;
  mouseX: number;
  mouseY: number;
  timestamp: number;
}

interface PlayerMeta {
  lastShotTime: number;
  shotCount: number;
  lastInputTime: number;
  lastDamageTime: number;
}

const MAP_BOUNDARY = 50;

export class FpsMatchRoom extends Room<FpsMatchState> {
  maxClients = GAME_CONSTANTS.MAX_PLAYERS_PER_MATCH;
  private playerInputs: Map<string, PlayerInput> = new Map();
  private playerMeta: Map<string, PlayerMeta> = new Map();
  private gameLoopInterval: ReturnType<typeof setInterval>;
  private readonly TICK_RATE = GAME_CONSTANTS.TICK_RATE;
  private readonly TICK_INTERVAL = 1000 / this.TICK_RATE;

  onCreate(_options: any) {
    this.setState(new FpsMatchState(this.roomId));

    console.log('FpsMatchRoom created:', this.roomId);

    // Set up message handlers
    this.onMessage('input', (client, message: InputState) => {
      // Validate input
      if (!this.validateInput(message)) {
        console.warn(`Invalid input from ${client.sessionId}`);
        return;
      }

      this.playerInputs.set(client.sessionId, {
        forward: message.forward,
        backward: message.backward,
        left: message.left,
        right: message.right,
        jump: message.jump,
        sprint: message.sprint,
        crouch: message.crouch,
        shoot: message.shoot,
        aim: message.aim,
        mouseX: message.mouseX,
        mouseY: message.mouseY,
        timestamp: message.timestamp,
      });

      // Update last input time for anti-cheat
      const meta = this.playerMeta.get(client.sessionId);
      if (meta) {
        meta.lastInputTime = Date.now();
      }
    });

    this.onMessage('shoot', (client, message: { aimDirection: Vector3Schema }) => {
      // Validate aim direction
      if (!this.validateAimDirection(message.aimDirection)) {
        console.warn(`Invalid aim direction from ${client.sessionId}`);
        return;
      }

      this.handleShooting(client, message.aimDirection);
    });

    this.onMessage('reload', (client) => {
      this.handleReload(client);
    });

    this.onMessage('switch_weapon', (client, message: { weapon: WeaponType }) => {
      this.handleWeaponSwitch(client, message.weapon);
    });

    this.onMessage('ping', (client) => {
      // Respond to ping for latency measurement
      client.send('pong');
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
      crouch: false,
      shoot: false,
      aim: false,
      mouseX: 0,
      mouseY: 0,
      timestamp: Date.now(),
    });

    // Initialize metadata for rate limiting and health regeneration
    this.playerMeta.set(client.sessionId, {
      lastShotTime: 0,
      shotCount: 0,
      lastInputTime: Date.now(),
      lastDamageTime: 0,
    });

    console.log(`Player spawned at (${spawnX}, 1.6, ${spawnZ}) on ${team} team`);
  }

  onLeave(client: Client, _consented: boolean) {
    console.log(`Player ${client.sessionId} left`);

    this.state.players.delete(client.sessionId);
    this.playerInputs.delete(client.sessionId);
    this.playerMeta.delete(client.sessionId);

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

  private validateInput(input: InputState): boolean {
    // Check timestamp is recent (within last 5 seconds)
    const now = Date.now();
    if (Math.abs(now - input.timestamp) > 5000) {
      return false;
    }

    // Validate mouse rotation is within reasonable bounds
    if (Math.abs(input.mouseX) > Math.PI * 4 || Math.abs(input.mouseY) > Math.PI * 4) {
      return false;
    }

    return true;
  }

  private validateAimDirection(direction: Vector3Schema): boolean {
    if (!direction) return false;

    // Check that direction is a unit vector (or close to it)
    const length = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
    return length > 0.5 && length < 2; // Allow some margin for floating point
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
        this.updateHealthRegeneration(player, sessionId, deltaTime);
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
      if (length > 0) {
        moveX /= length;
        moveZ /= length;
      }
    }

    // Calculate speed with modifiers
    let speed = GAME_CONSTANTS.PLAYER_SPEED;

    // Sprint increases speed (can't sprint while aiming or crouching)
    if (input.sprint && !input.aim && !input.crouch) {
      speed *= GAME_CONSTANTS.PLAYER_SPRINT_MULTIPLIER;
    }

    // Aiming decreases speed
    if (input.aim) {
      speed *= 0.6; // 60% speed when aiming
    }

    // Crouching decreases speed
    if (input.crouch) {
      speed *= 0.5; // 50% speed when crouching
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

    // Ground collision with crouch support
    const playerHeight = input.crouch ? 1.0 : 1.6;
    if (player.position.y <= playerHeight) {
      player.position.y = playerHeight;
      player.velocity.y = 0;

      // Jump (can't jump while crouching)
      if (input.jump && !input.crouch) {
        player.velocity.y = GAME_CONSTANTS.PLAYER_JUMP_FORCE;
      }
    }

    // Update rotation
    player.rotation.y = yaw;
    player.rotation.x = input.mouseY;

    // Enforce map boundaries
    player.position.x = Math.max(-MAP_BOUNDARY, Math.min(MAP_BOUNDARY, player.position.x));
    player.position.z = Math.max(-MAP_BOUNDARY, Math.min(MAP_BOUNDARY, player.position.z));
    player.position.y = Math.max(0, Math.min(100, player.position.y)); // Prevent falling through or flying too high
  }

  private updateHealthRegeneration(player: PlayerSchema, sessionId: string, deltaTime: number) {
    // Only regenerate if player is below max health
    if (player.health >= GAME_CONSTANTS.MAX_HEALTH) return;

    const meta = this.playerMeta.get(sessionId);
    if (!meta) return;

    // Constants for health regeneration
    const REGEN_DELAY = 3000; // 3 seconds after last damage
    const REGEN_RATE = 10; // 10 HP per second

    const timeSinceLastDamage = Date.now() - meta.lastDamageTime;

    // Start regenerating after delay
    if (timeSinceLastDamage >= REGEN_DELAY) {
      const regenAmount = REGEN_RATE * deltaTime;
      player.health = Math.min(GAME_CONSTANTS.MAX_HEALTH, player.health + regenAmount);
    }
  }

  private handleShooting(client: Client, aimDirection: Vector3Schema) {
    const player = this.state.players.get(client.sessionId);
    if (!player || !player.isAlive) return;

    // Check if player has ammo
    if (player.ammo <= 0) return;

    // Get weapon config
    const weaponConfig = WEAPON_CONFIGS[player.currentWeapon as WeaponType];
    if (!weaponConfig) return;

    // Fire rate limiting
    const meta = this.playerMeta.get(client.sessionId);
    if (!meta) return;

    const now = Date.now();
    const timeSinceLastShot = now - meta.lastShotTime;
    const minTimeBetweenShots = (60 / weaponConfig.fireRate) * 1000; // Convert RPM to ms

    if (timeSinceLastShot < minTimeBetweenShots) {
      // Too soon to shoot again
      return;
    }

    // Anti-cheat: Check for rapid fire exploits (more than 2x fire rate)
    if (timeSinceLastShot < minTimeBetweenShots / 2) {
      console.warn(`Possible rapid fire exploit from ${client.sessionId}`);
      return;
    }

    meta.lastShotTime = now;
    meta.shotCount++;

    // Consume ammo
    player.ammo--;

    // Perform raycast from player position in aim direction
    const hitInfo = this.performRaycast(player.position, aimDirection, weaponConfig.range);

    if (hitInfo.hit && hitInfo.targetPlayer) {
      // Apply damage
      this.applyDamage(hitInfo.targetPlayer, weaponConfig.damage, player, hitInfo.isHeadshot);
    }
  }

  private handleReload(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (!player || !player.isAlive) return;

    // Get weapon config
    const weaponConfig = WEAPON_CONFIGS[player.currentWeapon as WeaponType];
    if (!weaponConfig) return;

    // Check if already at max ammo
    if (player.ammo >= weaponConfig.magazineSize) return;

    // Check if has reserve ammo
    if (player.reserveAmmo <= 0) return;

    // Calculate ammo to reload
    const ammoNeeded = weaponConfig.magazineSize - player.ammo;
    const ammoToReload = Math.min(ammoNeeded, player.reserveAmmo);

    // Reload
    player.ammo += ammoToReload;
    player.reserveAmmo -= ammoToReload;

    console.log(`Player ${player.username} reloaded ${ammoToReload} rounds`);
  }

  private handleWeaponSwitch(client: Client, weaponType: WeaponType) {
    const player = this.state.players.get(client.sessionId);
    if (!player || !player.isAlive) return;

    // Validate weapon type
    const weaponConfig = WEAPON_CONFIGS[weaponType];
    if (!weaponConfig) {
      console.warn(`Invalid weapon type: ${weaponType}`);
      return;
    }

    // Don't switch if already using this weapon
    if (player.currentWeapon === weaponType) return;

    // Switch weapon
    player.currentWeapon = weaponType;
    player.ammo = weaponConfig.magazineSize;
    player.reserveAmmo = weaponConfig.reserveAmmo;

    console.log(`Player ${player.username} switched to ${weaponConfig.name}`);
  }

  private performRaycast(
    origin: Vector3Schema,
    direction: Vector3Schema,
    maxDistance: number
  ): { hit: boolean; targetPlayer?: PlayerSchema; isHeadshot: boolean } {
    let closestHit: PlayerSchema | undefined;
    let closestDistance = maxDistance;
    let isHeadshot = false;

    // Normalize direction
    const dirLength = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
    if (dirLength === 0) return { hit: false, isHeadshot: false };

    const normDir = {
      x: direction.x / dirLength,
      y: direction.y / dirLength,
      z: direction.z / dirLength,
    };

    // Check all other players
    this.state.players.forEach((player) => {
      if (!player.isAlive) return;
      if (player.position === origin) return; // Don't hit self

      // Calculate vector from origin to player
      const toPlayer = {
        x: player.position.x - origin.x,
        y: player.position.y - origin.y,
        z: player.position.z - origin.z,
      };

      // Project toPlayer onto direction vector
      const dot = toPlayer.x * normDir.x + toPlayer.y * normDir.y + toPlayer.z * normDir.z;

      // If behind the origin, skip
      if (dot < 0) return;

      // If beyond max distance, skip
      if (dot > maxDistance) return;

      // Calculate closest point on ray to player
      const closestPoint = {
        x: origin.x + normDir.x * dot,
        y: origin.y + normDir.y * dot,
        z: origin.z + normDir.z * dot,
      };

      // Calculate distance from player to closest point
      const dx = player.position.x - closestPoint.x;
      const dy = player.position.y - closestPoint.y;
      const dz = player.position.z - closestPoint.z;
      const distanceToRay = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Hit radius (player body radius)
      const hitRadius = 0.5;

      if (distanceToRay < hitRadius && dot < closestDistance) {
        closestHit = player;
        closestDistance = dot;

        // Check if headshot (head is at y + 0.6 to y + 0.9 from player position)
        const headY = player.position.y + 0.7;
        isHeadshot = Math.abs(closestPoint.y - headY) < 0.25;
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

    // Prevent team damage
    if (target.team === attacker.team) return;

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

    // Update last damage time for health regeneration
    const targetMeta = this.playerMeta.get(target.id);
    if (targetMeta) {
      targetMeta.lastDamageTime = Date.now();
    }

    // Check death
    if (target.health <= 0) {
      this.handlePlayerDeath(target, attacker, isHeadshot);
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

  private handlePlayerDeath(victim: PlayerSchema, killer: PlayerSchema, isHeadshot: boolean) {
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

    // Broadcast kill feed event
    this.broadcast('kill_feed', {
      killerId: killer.id,
      killerName: killer.username,
      victimId: victim.id,
      victimName: victim.username,
      weapon: killer.currentWeapon,
      isHeadshot,
      timestamp: Date.now(),
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

    // Reset ammo
    const weaponConfig = WEAPON_CONFIGS[player.currentWeapon as WeaponType];
    if (weaponConfig) {
      player.ammo = weaponConfig.magazineSize;
      player.reserveAmmo = weaponConfig.magazineSize * 3;
    }

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
