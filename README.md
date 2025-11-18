# FPS Game - Production-Grade Browser-Based Multiplayer Shooter

A modern, full-stack, browser-based FPS game built with TypeScript, React, Babylon.js, NestJS, and Colyseus.

## 🎮 Project Overview

This is a production-grade multiplayer first-person shooter that runs entirely in the browser, featuring:

- **Real-time multiplayer** with authoritative server architecture
- **3D graphics** powered by Babylon.js (WebGL 2 / WebGPU)
- **Modern gameplay mechanics**: sprinting, ADS, recoil patterns, headshots
- **Game modes**: Team Deathmatch, Free-for-All (more planned)
- **Player progression**: XP, levels, ranks, stats tracking
- **Matchmaking system** with MMR-based balancing
- **Persistent data** with PostgreSQL
- **Scalable architecture** using NestJS and Colyseus

## 🏗️ Architecture

### Monorepo Structure

```
fps-game/
├── apps/
│   ├── client/          # Vite + React + TypeScript + Babylon.js
│   └── server/          # NestJS + Colyseus + Prisma
├── packages/
│   └── shared/          # Shared types, constants, and message protocols
├── .github/
│   └── workflows/       # CI/CD pipelines
├── config/              # Shared configurations
├── docker-compose.yml   # PostgreSQL + Redis services
└── pnpm-workspace.yaml  # Monorepo workspace config
```

## 🛠️ Technology Stack

### Client

- **Framework**: React 18
- **Build Tool**: Vite 5
- **3D Engine**: Babylon.js 6
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router
- **Networking**: Colyseus Client SDK

### Server

- **Runtime**: Node.js 20+
- **Framework**: NestJS
- **Game Server**: Colyseus
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache/Queue**: Redis
- **Authentication**: JWT

### DevOps

- **Package Manager**: pnpm
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier, Husky

## 📋 Prerequisites

- **Node.js**: >= 20.0.0
- **pnpm**: >= 8.0.0
- **Docker**: >= 20.0.0 (for PostgreSQL and Redis)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Database Services

```bash
docker-compose up -d
```

This starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

### 3. Set Up Environment Variables

```bash
# Copy example env file
cp apps/server/.env.example apps/server/.env

# Edit the .env file with your configuration
```

### 4. Run Database Migrations

```bash
cd apps/server
pnpm prisma migrate dev
pnpm prisma generate
```

### 5. Start Development Servers

**Option A: Start all services in parallel**

```bash
pnpm dev
```

**Option B: Start services individually**

Terminal 1 - Start the game server:

```bash
cd apps/server
pnpm dev
```

Terminal 2 - Start the client:

```bash
cd apps/client
pnpm dev
```

### 6. Access the Application

- **Client**: http://localhost:3000
- **Server API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🎮 Testing Multiplayer (Phase 2)

To test the multiplayer functionality:

1. **Register an account** on the auth screen
2. **Click Play** to enter the game
3. **Click on the canvas** to activate pointer lock
4. **Move around** using WASD, Shift to sprint, Space to jump
5. **Shoot** by clicking left mouse button
6. **Open another browser tab** (or incognito window) to register a second player
7. **Both players** should see each other as colored cylinders (blue or red team)
8. **Shoot the other player** to test the damage system
9. **Check the HUD** for team scores, K/D ratio, and player count

### What's Working:

- ✅ User registration and login
- ✅ Real-time player position synchronization
- ✅ Team assignment (auto-balanced Blue vs Red)
- ✅ Shooting with raycast hit detection
- ✅ Damage system with armor
- ✅ Headshot detection (2x damage)
- ✅ Death and respawn (5 second delay)
- ✅ Team score tracking
- ✅ Match timer (10 minutes)
- ✅ HUD with real-time stats

### Known Limitations:

- No client-side prediction yet (movement may feel slightly delayed)
- Basic player meshes (cylinders, no animations)
- Single map only
- No weapon switching yet
- No sound effects
- Basic collision detection

## 📦 Available Scripts

### Root Level

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps
pnpm test         # Run tests in all apps
pnpm lint         # Lint all apps
pnpm format       # Format code with Prettier
pnpm typecheck    # Type-check all apps
pnpm clean        # Clean all build artifacts
```

### Client (apps/client)

```bash
pnpm dev          # Start Vite dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Lint client code
pnpm typecheck    # Type-check client
```

### Server (apps/server)

```bash
pnpm dev          # Start NestJS in watch mode
pnpm build        # Build server
pnpm start        # Start production server
pnpm lint         # Lint server code
pnpm test         # Run server tests
```

### Shared Package (packages/shared)

```bash
pnpm build        # Build shared types
pnpm dev          # Watch mode for development
```

## 🎯 Current Features (Phase 2 Complete)

### Client

- ✅ Main menu with navigation
- ✅ Authentication screen (login/register)
- ✅ Settings screen (mouse sensitivity, FOV, graphics quality)
- ✅ Babylon.js 3D scene with:
  - First-person camera with server-synchronized position
  - WASD movement controls (networked)
  - Sprint (Shift)
  - Jump (Space)
  - Mouse look with pointer lock
  - Collision detection
  - Test map with buildings and obstacles
  - Multiplayer player rendering (team-colored meshes)
- ✅ HUD system:
  - Health and armor display (real-time)
  - Ammo counter (synchronized)
  - Team scores (Blue vs Red)
  - K/D ratio
  - Player count
  - Match timer
  - Crosshair
  - "YOU DIED" overlay
  - Control hints
- ✅ Shooting mechanics:
  - Mouse click to shoot
  - Raycast hit detection
  - Visual feedback
- ✅ Network integration:
  - Colyseus client connection
  - Real-time state synchronization
  - Input buffering at 60 FPS
  - Authentication token handling

### Server

- ✅ NestJS application structure
- ✅ Health check endpoint
- ✅ Auth module with:
  - JWT authentication (access + refresh tokens)
  - User registration with validation
  - Login with bcrypt password hashing
  - Token refresh endpoint
  - Protected routes with guards
- ✅ Game module with:
  - Colyseus integration
  - FPS Match Room (authoritative server)
  - 60 TPS game loop
  - Server-side physics (movement, gravity, collision)
  - Team assignment (auto-balancing Blue/Red)
  - Combat system (raycast shooting, damage, headshots)
  - Death and respawn mechanics
  - Match state management
  - Player lifecycle handling
- ✅ Prisma schema with:
  - User accounts
  - Player profiles (nickname, level, XP, rank)
  - Match tracking
  - Player stats

### Shared

- ✅ TypeScript types for:
  - Player state
  - Input state
  - Weapon configurations
  - Match state
  - Game modes
- ✅ Network message protocols (client ↔ server)
- ✅ Game constants (tick rate, player physics, etc.)
- ✅ Weapon configurations (5 weapon types)
- ✅ XP and progression system definitions
- ✅ Rank system

### Infrastructure

- ✅ Monorepo workspace with pnpm
- ✅ TypeScript configuration (project references)
- ✅ ESLint + Prettier
- ✅ Husky + lint-staged (pre-commit hooks)
- ✅ GitHub Actions CI pipeline
- ✅ Docker Compose (PostgreSQL + Redis)

## 📚 Project Structure Details

### Client Structure

```
apps/client/
├── src/
│   ├── components/      # React components
│   │   ├── MainMenu.tsx
│   │   ├── Settings.tsx
│   │   ├── GameView.tsx
│   │   ├── GameCanvas.tsx  # Babylon.js integration
│   │   └── HUD.tsx
│   ├── game/            # Game logic (future)
│   ├── services/        # API and network services (future)
│   ├── stores/          # Zustand stores (future)
│   ├── styles/          # CSS and Tailwind
│   ├── App.tsx
│   └── main.tsx
├── public/              # Static assets
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

### Server Structure

```
apps/server/
├── src/
│   ├── modules/
│   │   ├── auth/        # Authentication
│   │   ├── game/        # Colyseus game rooms
│   │   └── health/      # Health checks
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma    # Database schema
├── nest-cli.json
└── package.json
```

### Shared Package Structure

```
packages/shared/
├── src/
│   ├── types.ts         # TypeScript interfaces
│   ├── constants.ts     # Game constants
│   ├── messages.ts      # Network message types
│   └── index.ts
└── package.json
```

## 🔄 Development Workflow

### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Code is automatically linted on commit via Husky

3. **Test your changes**

   ```bash
   pnpm typecheck    # Type checking
   pnpm lint         # Linting
   pnpm test         # Tests
   pnpm build        # Ensure everything builds
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

### Code Quality

- **Pre-commit hooks** automatically:
  - Run ESLint and auto-fix issues
  - Format code with Prettier
  - Prevent commits with TypeScript errors

- **CI Pipeline** runs on every push:
  - Install dependencies
  - Lint all code
  - Type-check all packages
  - Run tests
  - Build all applications

## 🎮 Game Controls

### In-Game

- **WASD**: Move
- **Mouse**: Look around
- **Shift**: Sprint
- **Space**: Jump
- **LMB**: Shoot (planned)
- **RMB**: Aim down sights (planned)
- **R**: Reload (planned)
- **ESC**: Exit pointer lock / Menu

### Menu

- **Mouse**: Navigate UI
- **Click**: Select options

## 🐳 Docker Services

### PostgreSQL

- **Port**: 5432
- **Database**: fps_game
- **User**: fps_user
- **Password**: fps_password (change in production!)

### Redis

- **Port**: 6379
- Used for: session storage, matchmaking queues, caching

### Managing Services

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

## 📊 Database Management

### Prisma Commands

```bash
# Generate Prisma Client
pnpm prisma generate

# Create a migration
pnpm prisma migrate dev --name migration_name

# Apply migrations
pnpm prisma migrate deploy

# Open Prisma Studio (GUI)
pnpm prisma studio

# Reset database (WARNING: destroys data)
pnpm prisma migrate reset
```

## 🚧 Roadmap

### Phase 2: Minimal Vertical Slice ✅ COMPLETE

- ✅ Implement JWT authentication flow
- ✅ Integrate Colyseus game rooms
- ✅ Player spawning and movement sync
- ✅ Basic shooting mechanics
- ✅ Damage and health system
- ✅ Multiplayer rendering and synchronization
- 🧪 2-player multiplayer testing (requires local setup)

### Phase 3: Core Gameplay

- [ ] Complete weapon system (5 weapon types)
- [ ] Recoil patterns and spray control
- [ ] Headshot detection and damage multipliers
- [ ] Death, respawn, and spawn protection
- [ ] Team assignment and team UI
- [ ] Kill feed system
- [ ] Multiple maps

### Phase 4: Game Modes

- [ ] Team Deathmatch (complete implementation)
- [ ] Free-for-all mode
- [ ] Capture the Flag
- [ ] Domination

### Phase 5: Progression & Meta

- [ ] XP and leveling system
- [ ] Player stats tracking
- [ ] MMR-based matchmaking
- [ ] Ranking system
- [ ] Leaderboards

### Phase 6: Social Features

- [ ] Friends system
- [ ] Party/squad creation
- [ ] Text chat (lobby and in-game)
- [ ] Player reporting
- [ ] Admin tools

### Phase 7: Polish & Optimization

- [ ] Weapon skins and cosmetics
- [ ] Sound effects and music
- [ ] Advanced graphics settings
- [ ] Performance optimization
- [ ] Anti-cheat measures
- [ ] Tutorial/training mode

### Phase 8: Deployment

- [ ] Production build optimization
- [ ] Server deployment (Docker + Kubernetes)
- [ ] CDN setup for client assets
- [ ] Monitoring and logging
- [ ] Backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

[Add your license here]

## 🙏 Acknowledgments

- Built with [Babylon.js](https://www.babylonjs.com/)
- Multiplayer powered by [Colyseus](https://colyseus.io/)
- Backend framework: [NestJS](https://nestjs.com/)
- UI framework: [React](https://react.dev/)

---

**Status**: Phase 2 Complete ✅ | Multiplayer FPS Working! | Ready for Phase 3 Development

For questions or issues, please open an issue on GitHub.
