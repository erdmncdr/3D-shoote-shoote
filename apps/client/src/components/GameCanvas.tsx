import { useEffect, useRef } from 'react';
import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  AbstractMesh,
} from '@babylonjs/core';
import { NetworkService } from '../services/NetworkService';
import { useGameStore } from '../stores/useGameStore';
import { InputState } from '@shared/types';

interface GameCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  networkService: NetworkService | null;
}

function GameCanvas({ canvasRef, networkService }: GameCanvasProps) {
  const playerMeshesRef = useRef<Map<string, AbstractMesh>>(new Map());
  const inputStateRef = useRef<InputState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    crouch: false,
    shoot: false,
    aim: false,
    reload: false,
    mouseX: 0,
    mouseY: 0,
    timestamp: Date.now(),
  });

  const players = useGameStore((state) => state.players);
  const sessionId = useGameStore((state) => state.sessionId);

  useEffect(() => {
    if (!canvasRef.current || !networkService) return;

    const canvas = canvasRef.current;
    const playerMeshes = playerMeshesRef.current;

    // Create Babylon engine
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    // Create scene
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.5, 0.8, 0.9).toColor4();

    // Create camera (first-person)
    const camera = new FreeCamera('camera', new Vector3(0, 1.6, -10), scene);
    camera.attachControl(canvas, true);
    camera.angularSensibility = 2000;
    camera.minZ = 0.1;

    // Create lighting
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Create ground
    const ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, scene);
    const groundMaterial = new StandardMaterial('groundMat', scene);
    groundMaterial.diffuseColor = new Color3(0.4, 0.4, 0.4);
    ground.material = groundMaterial;

    // Create test map layout
    const createBuilding = (x: number, z: number, width: number, height: number, depth: number) => {
      const building = MeshBuilder.CreateBox('building', { width, height, depth }, scene);
      building.position = new Vector3(x, height / 2, z);
      const material = new StandardMaterial('buildingMat', scene);
      material.diffuseColor = new Color3(0.6, 0.3, 0.1);
      building.material = material;
      return building;
    };

    createBuilding(-20, 0, 10, 8, 10);
    createBuilding(20, 0, 8, 12, 8);
    createBuilding(0, 20, 15, 6, 10);
    createBuilding(0, -20, 12, 10, 8);
    createBuilding(-20, -20, 6, 5, 6);
    createBuilding(20, 20, 7, 15, 7);

    // Create walls for cover
    for (let i = 0; i < 5; i++) {
      const wall = MeshBuilder.CreateBox('wall', { width: 0.5, height: 2, depth: 5 }, scene);
      wall.position = new Vector3(Math.random() * 40 - 20, 1, Math.random() * 40 - 20);
      wall.rotation.y = Math.random() * Math.PI;
      const wallMaterial = new StandardMaterial('wallMat', scene);
      wallMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
      wall.material = wallMaterial;
    }

    // Function to create player mesh
    const createPlayerMesh = (playerId: string, team: string): AbstractMesh => {
      // Body
      const body = MeshBuilder.CreateCylinder(
        `player_${playerId}_body`,
        { height: 1.6, diameter: 0.6 },
        scene
      );

      // Head
      const head = MeshBuilder.CreateSphere(`player_${playerId}_head`, { diameter: 0.4 }, scene);
      head.position.y = 1.0;
      head.parent = body;

      // Material based on team
      const material = new StandardMaterial(`player_${playerId}_mat`, scene);
      material.diffuseColor =
        team === 'blue' ? new Color3(0.2, 0.4, 1.0) : new Color3(1.0, 0.2, 0.2);
      body.material = material;
      head.material = material;

      // Weapon (simple box)
      const weapon = MeshBuilder.CreateBox(
        `player_${playerId}_weapon`,
        { width: 0.1, height: 0.1, depth: 0.5 },
        scene
      );
      weapon.position = new Vector3(0.3, 0.3, 0.3);
      weapon.parent = body;
      const weaponMat = new StandardMaterial(`weapon_${playerId}_mat`, scene);
      weaponMat.diffuseColor = new Color3(0.1, 0.1, 0.1);
      weapon.material = weaponMat;

      return body;
    };

    // Input handling
    const keys: { [key: string]: boolean } = {};
    let mouseMovementX = 0;
    let mouseMovementY = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      updateInputState();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
      updateInputState();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === (canvas as unknown as Element)) {
        mouseMovementX += e.movementX;
        mouseMovementY += e.movementY;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement === (canvas as unknown as Element) && e.button === 0) {
        // Left click - shoot
        const direction = camera.getDirection(Vector3.Forward());
        networkService.sendShoot({
          x: direction.x,
          y: direction.y,
          z: direction.z,
        });

        // Visual feedback
        console.log('🔫 Shot fired!');
      }
    };

    const updateInputState = () => {
      const input = inputStateRef.current;
      input.forward = keys['KeyW'] || false;
      input.backward = keys['KeyS'] || false;
      input.left = keys['KeyA'] || false;
      input.right = keys['KeyD'] || false;
      input.jump = keys['Space'] || false;
      input.sprint = keys['ShiftLeft'] || keys['ShiftRight'] || false;
      input.shoot = keys['Mouse0'] || false;
      input.timestamp = Date.now();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    // Send input to server at 60 FPS
    const inputInterval = setInterval(() => {
      const input = inputStateRef.current;

      // Update mouse rotation
      const sensitivity = 0.002;
      input.mouseX += mouseMovementX * sensitivity;
      input.mouseY = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, input.mouseY - mouseMovementY * sensitivity)
      );

      mouseMovementX = 0;
      mouseMovementY = 0;

      // Update camera rotation from input
      camera.rotation.y = input.mouseX;
      camera.rotation.x = input.mouseY;

      // Send input to server
      networkService.sendInput(input);
    }, 1000 / 60);

    // Render loop
    engine.runRenderLoop(() => {
      // Update player meshes from game state
      const currentPlayers = Array.from(players.entries());

      // Remove meshes for players who left
      for (const [playerId, mesh] of playerMeshesRef.current.entries()) {
        if (!players.has(playerId)) {
          mesh.dispose();
          playerMeshesRef.current.delete(playerId);
        }
      }

      // Update or create meshes for players
      for (const [playerId, playerData] of currentPlayers) {
        // Skip local player
        if (playerId === sessionId) {
          // Update local camera position from server
          camera.position.x = playerData.position.x;
          camera.position.y = playerData.position.y;
          camera.position.z = playerData.position.z;
          continue;
        }

        let mesh = playerMeshesRef.current.get(playerId);

        // Create mesh if doesn't exist
        if (!mesh) {
          mesh = createPlayerMesh(playerId, playerData.team);
          playerMeshesRef.current.set(playerId, mesh);
        }

        // Update mesh position and rotation
        if (playerData.isAlive) {
          mesh.position.x = playerData.position.x;
          mesh.position.y = playerData.position.y;
          mesh.position.z = playerData.position.z;
          mesh.rotation.y = playerData.rotation.y;
          mesh.setEnabled(true);
        } else {
          mesh.setEnabled(false);
        }
      }

      scene.render();
    });

    // Handle resize
    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearInterval(inputInterval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('resize', handleResize);

      // Dispose all player meshes
      for (const mesh of playerMeshes.values()) {
        mesh.dispose();
      }
      playerMeshes.clear();

      scene.dispose();
      engine.dispose();
    };
  }, [canvasRef, networkService, players, sessionId]);

  return <canvas ref={canvasRef} className="w-full h-full outline-none" tabIndex={0} />;
}

export default GameCanvas;
