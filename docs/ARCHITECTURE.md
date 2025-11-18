# Architecture Overview

## System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  Babylon.js  │  │   Zustand    │      │
│  │   (Menus)    │  │  (3D Game)   │  │   (State)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                  ┌─────────▼──────────┐                      │
│                  │  Network Client    │                      │
│                  │  (Colyseus Client) │                      │
│                  └─────────┬──────────┘                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                      WebSocket │ HTTP/REST
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                        Server (Node.js)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              NestJS Application                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │    Auth    │  │   Profile  │  │   Match    │    │   │
│  │  │   Module   │  │   Module   │  │   Module   │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │           Colyseus Game Server                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  Room 1  │  │  Room 2  │  │  Room N  │          │   │
│  │  │ (Match)  │  │ (Match)  │  │ (Match)  │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│         ┌───────────────┴───────────────┐                    │
│         │                               │                    │
│   ┌─────▼──────┐                 ┌─────▼──────┐             │
│   │ PostgreSQL │                 │   Redis    │             │
│   │ (Persistent│                 │  (Cache/   │             │
│   │   Data)    │                 │   Queue)   │             │
│   └────────────┘                 └────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

## Client Architecture

### Component Hierarchy

```
App
├── Router
    ├── MainMenu
    │   ├── PlayButton
    │   ├── SettingsButton
    │   └── ProfileButton
    │
    ├── Settings
    │   ├── GraphicsSettings
    │   ├── AudioSettings
    │   ├── ControlsSettings
    │   └── SaveButton
    │
    └── GameView
        ├── GameCanvas (Babylon.js)
        │   ├── Scene
        │   ├── Camera (First-Person)
        │   ├── Lighting
        │   ├── Map Geometry
        │   └── Players/Entities
        │
        └── HUD
            ├── HealthBar
            ├── AmmoCounter
            ├── Crosshair
            ├── KillFeed
            ├── Scoreboard
            └── MiniMap (future)
```

### State Management (Zustand)

**Stores:**

1. **GameStore**: Current match state, players, scores
2. **PlayerStore**: Local player state (health, ammo, position)
3. **UIStore**: UI state (menu open, settings, etc.)
4. **NetworkStore**: Connection state, latency
5. **AuthStore**: User authentication state

### Client-Side Prediction

```
┌──────────────────────────────────────────────────────────┐
│  Client Prediction & Server Reconciliation               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. Player Input → Immediate Local Prediction           │
│     ↓                                                    │
│  2. Send Input to Server (with sequence number)         │
│     ↓                                                    │
│  3. Server Processes → Authoritative State              │
│     ↓                                                    │
│  4. Server Sends State Update                           │
│     ↓                                                    │
│  5. Client Reconciles:                                  │
│     - Compare predicted vs actual                       │
│     - If mismatch: correct position                     │
│     - Replay inputs after correction                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Server Architecture

### NestJS Module Structure

```
AppModule
├── ConfigModule (global)
├── DatabaseModule (Prisma)
├── RedisModule
├── AuthModule
│   ├── AuthController
│   ├── AuthService
│   ├── JwtStrategy
│   └── Guards
├── UserModule
│   ├── UserService
│   └── UserRepository
├── ProfileModule
│   ├── ProfileService
│   └── ProfileRepository
├── MatchModule
│   ├── MatchService
│   └── MatchRepository
├── MatchmakingModule
│   ├── MatchmakingService
│   └── QueueManager
└── GameModule
    ├── ColyseusServer
    ├── FpsMatchRoom
    └── RoomManager
```

### Colyseus Room Lifecycle

```
┌───────────────────────────────────────────────────────┐
│  Room Lifecycle                                       │
├───────────────────────────────────────────────────────┤
│                                                       │
│  1. onCreate()                                        │
│     - Initialize room state                          │
│     - Set game mode, map                             │
│     - Configure room options                         │
│                                                       │
│  2. onAuth(client, options)                          │
│     - Verify JWT token                               │
│     - Load player profile                            │
│     - Return user data or reject                     │
│                                                       │
│  3. onJoin(client, options)                          │
│     - Add player to room state                       │
│     - Assign team                                    │
│     - Set spawn point                                │
│     - Broadcast player joined                        │
│                                                       │
│  4. onMessage(client, type, message)                 │
│     - Handle player input                            │
│     - Process game actions                           │
│     - Update state                                   │
│                                                       │
│  5. Game Loop (setInterval)                          │
│     - Process physics                                │
│     - Update player positions                        │
│     - Check collisions                               │
│     - Detect hits/damage                             │
│     - Broadcast state updates                        │
│                                                       │
│  6. onLeave(client, consented)                       │
│     - Remove player from state                       │
│     - Handle disconnection                           │
│     - Check if room should close                     │
│                                                       │
│  7. onDispose()                                      │
│     - Save match results                             │
│     - Update player stats                            │
│     - Cleanup resources                              │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### Game Server Tick Loop

```typescript
// Pseudo-code for server tick loop
const TICK_RATE = 60; // 60 ticks per second
const TICK_INTERVAL = 1000 / TICK_RATE;

setInterval(() => {
  // 1. Process input queue
  processPlayerInputs();

  // 2. Update physics
  updatePlayerMovement(deltaTime);
  applyGravity();
  resolveCollisions();

  // 3. Process game logic
  checkWeaponFiring();
  processRaycasts();
  applyDamage();
  checkPlayerDeath();
  checkRespawnTimers();

  // 4. Update game state
  updateMatchState();
  checkWinCondition();

  // 5. Broadcast state (every N ticks or on change)
  broadcastStateUpdate();
}, TICK_INTERVAL);
```

## Data Flow

### Authentication Flow

```
┌─────────┐                  ┌──────────┐                ┌──────────┐
│ Client  │                  │  Server  │                │ Database │
└────┬────┘                  └────┬─────┘                └────┬─────┘
     │                            │                           │
     │ POST /auth/register        │                           │
     ├───────────────────────────>│                           │
     │                            │ Hash password             │
     │                            │ Save user                 │
     │                            ├──────────────────────────>│
     │                            │<──────────────────────────┤
     │ { accessToken, refreshToken }                         │
     │<───────────────────────────┤                           │
     │                            │                           │
     │ POST /auth/login           │                           │
     ├───────────────────────────>│                           │
     │                            │ Verify credentials        │
     │                            ├──────────────────────────>│
     │                            │<──────────────────────────┤
     │ { accessToken, refreshToken }                         │
     │<───────────────────────────┤                           │
     │                            │                           │
     │ GET /me (with JWT)         │                           │
     ├───────────────────────────>│                           │
     │                            │ Verify token              │
     │                            │ Get user data             │
     │                            ├──────────────────────────>│
     │                            │<──────────────────────────┤
     │ { user profile }           │                           │
     │<───────────────────────────┤                           │
```

### Matchmaking Flow

```
┌─────────┐       ┌──────────┐       ┌─────────┐       ┌──────────┐
│ Client  │       │  Server  │       │  Redis  │       │ Colyseus │
└────┬────┘       └────┬─────┘       └────┬────┘       └────┬─────┘
     │                 │                   │                  │
     │ Queue for match │                   │                  │
     ├────────────────>│                   │                  │
     │                 │ Add to queue      │                  │
     │                 ├──────────────────>│                  │
     │                 │                   │                  │
     │                 │ Check queue       │                  │
     │                 │ periodically      │                  │
     │                 ├──────────────────>│                  │
     │                 │<──────────────────┤                  │
     │                 │                   │                  │
     │                 │ Found 10 players  │                  │
     │                 │ with similar MMR  │                  │
     │                 │                   │                  │
     │                 │ Create room       │                  │
     │                 ├─────────────────────────────────────>│
     │                 │                   │                  │
     │ Room ID         │                   │                  │
     │<────────────────┤                   │                  │
     │                 │                   │                  │
     │ Connect to room │                   │                  │
     ├──────────────────────────────────────────────────────>│
     │                 │                   │                  │
     │ Match starts    │                   │                  │
     │<───────────────────────────────────────────────────────┤
```

### In-Game Data Flow

```
┌─────────┐                     ┌──────────────┐
│ Player A│                     │    Server    │
└────┬────┘                     └───────┬──────┘
     │                                  │
     │ Input: Move Forward (W)          │
     ├─────────────────────────────────>│
     │ { key: 'W', seq: 123 }           │
     │                                  │ Process input
     │                                  │ Update position
     │                                  │ Check collisions
     │                                  │
     │ State Update                     │
     │<─────────────────────────────────┤
     │ { pos: [x,y,z], seq: 123 }      │
     │                                  │
     │ Reconcile local prediction       │
     │ with server state                │
     │                                  │


┌─────────┐                     ┌──────────────┐
│ Player A│                     │    Server    │
└────┬────┘                     └───────┬──────┘
     │                                  │
     │ Shoot weapon                     │
     ├─────────────────────────────────>│
     │ { action: 'shoot',               │
     │   aim: [x,y,z],                  │
     │   timestamp: t }                 │
     │                                  │ Validate action
     │                                  │ Perform raycast
     │                                  │ Check hit
     │                                  │ Apply damage
     │                                  │
     │ Hit confirmed                    │
     │<─────────────────────────────────┤
     │ { hit: true, damage: 30 }       │
     │                                  │
     │ ┌─────────┐                      │
     │ │ Player B│<─────────────────────┤
     │ └─────────┘   Damage event       │
     │               { damage: 30,      │
     │                 health: 70 }     │
```

## Network Protocol

### Message Types

**Client → Server:**

- `input`: Player input state (WASD, mouse, actions)
- `ready`: Player ready for match start
- `change_weapon`: Switch weapons
- `chat`: Send chat message

**Server → Client:**

- `match_state`: Full game state snapshot
- `player_joined`: New player joined
- `player_left`: Player left/disconnected
- `player_died`: Death event
- `player_respawned`: Respawn event
- `damage`: Damage dealt
- `kill_feed`: Kill event for UI
- `chat`: Chat message
- `match_end`: Match finished

### State Synchronization

**Full State Update (initial join):**

```typescript
{
  matchId: string,
  mode: GameMode,
  map: string,
  timeRemaining: number,
  blueScore: number,
  redScore: number,
  players: {
    [playerId]: PlayerState
  }
}
```

**Delta Updates (during game):**

```typescript
{
  tick: number,
  updates: [
    { playerId, position, rotation, health, ... },
    { playerId, position, rotation, health, ... },
    // Only changed properties
  ]
}
```

## Security Considerations

### Server Authority

- ✅ All game logic on server
- ✅ Client only sends inputs, not positions
- ✅ Server validates all actions
- ✅ Rate limiting on inputs
- ✅ Sanity checks on movement speed

### Anti-Cheat Measures (Planned)

- Movement speed validation
- No-clip detection
- Fire rate validation
- Impossible shot detection
- Statistical anomaly detection

### Authentication

- JWT with short expiration (15 min)
- Refresh tokens for session management
- Secure password hashing (bcrypt)
- Token verification on Colyseus connection

## Database Schema

### User Table

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  profile   PlayerProfile?
  matches   MatchPlayer[]
}
```

### Player Profile Table

```prisma
model PlayerProfile {
  id         String @id @default(uuid())
  userId     String @unique

  nickname   String
  level      Int    @default(1)
  xp         Int    @default(0)
  rank       String @default("Bronze")
  mmr        Int    @default(1000)

  totalGames Int    @default(0)
  wins       Int    @default(0)
  losses     Int    @default(0)
  kills      Int    @default(0)
  deaths     Int    @default(0)
  assists    Int    @default(0)
}
```

### Match Tables

```prisma
model Match {
  id          String    @id @default(uuid())
  map         String
  mode        String
  startTime   DateTime  @default(now())
  endTime     DateTime?
  duration    Int?
  blueScore   Int       @default(0)
  redScore    Int       @default(0)
  winningTeam String?

  players     MatchPlayer[]
}

model MatchPlayer {
  id        String @id @default(uuid())
  matchId   String
  userId    String
  team      String
  kills     Int    @default(0)
  deaths    Int    @default(0)
  assists   Int    @default(0)
  damage    Int    @default(0)
  headshots Int    @default(0)
  xpGained  Int    @default(0)
}
```

## Performance Optimizations

### Client Optimizations

- **Frustum culling**: Only render visible objects
- **LOD (Level of Detail)**: Lower quality for distant objects
- **Occlusion culling**: Don't render objects behind walls
- **Object pooling**: Reuse bullets, effects
- **Lazy loading**: Load assets on demand
- **Compression**: Compress textures and models

### Server Optimizations

- **Spatial partitioning**: Grid-based player queries
- **Interest management**: Only send relevant updates
- **Delta compression**: Only send changed data
- **Connection pooling**: Reuse database connections
- **Redis caching**: Cache frequently accessed data
- **Horizontal scaling**: Multiple server instances

### Network Optimizations

- **Input buffering**: Batch inputs
- **State interpolation**: Smooth movement between updates
- **Priority-based updates**: Critical data first
- **Variable send rate**: Adjust based on action
- **Compression**: Compress large messages

## Scalability

### Horizontal Scaling

```
               Load Balancer
                     │
        ┌────────────┼────────────┐
        │            │            │
   Server 1      Server 2     Server N
        │            │            │
        └────────────┴────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   PostgreSQL                  Redis
  (replicated)               (cluster)
```

### Room Distribution

- Each server instance hosts multiple game rooms
- Players distributed across servers via load balancer
- Room state is independent per server
- Match results persisted to shared database

## Monitoring & Observability

### Metrics to Track

- Active players
- Active matches
- Server tick rate / performance
- Network latency (per player)
- Database query performance
- API response times
- Error rates
- Player reports

### Logging Strategy

- Structured JSON logs
- Separate logs: access, error, game events
- Log levels: debug, info, warn, error
- Centralized log aggregation (future)

---

This architecture is designed to be:

- **Scalable**: Horizontal scaling of game servers
- **Performant**: Optimized client and server
- **Secure**: Server-authoritative with validation
- **Maintainable**: Clean separation of concerns
- **Observable**: Comprehensive logging and metrics
