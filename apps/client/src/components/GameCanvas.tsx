import { useEffect } from 'react';
import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
} from '@babylonjs/core';

interface GameCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

function GameCanvas({ canvasRef }: GameCanvasProps) {
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Create Babylon engine
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    // Create scene
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0.5, 0.8, 0.9).toColor4();

    // Create camera
    const camera = new FreeCamera('camera', new Vector3(0, 1.6, -10), scene);
    camera.attachControl(canvas, true);
    camera.speed = 0.2;
    camera.angularSensibility = 2000;
    camera.keysUp.push(87); // W
    camera.keysDown.push(83); // S
    camera.keysLeft.push(65); // A
    camera.keysRight.push(68); // D

    // Create lighting
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Create ground
    const ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, scene);
    const groundMaterial = new StandardMaterial('groundMat', scene);
    groundMaterial.diffuseColor = new Color3(0.4, 0.4, 0.4);
    ground.material = groundMaterial;
    ground.checkCollisions = true;

    // Create some test buildings/obstacles
    const createBuilding = (x: number, z: number, width: number, height: number, depth: number) => {
      const building = MeshBuilder.CreateBox('building', { width, height, depth }, scene);
      building.position = new Vector3(x, height / 2, z);
      const material = new StandardMaterial('buildingMat', scene);
      material.diffuseColor = new Color3(0.6, 0.3, 0.1);
      building.material = material;
      building.checkCollisions = true;
      return building;
    };

    // Create test map layout
    createBuilding(-20, 0, 10, 8, 10);
    createBuilding(20, 0, 8, 12, 8);
    createBuilding(0, 20, 15, 6, 10);
    createBuilding(0, -20, 12, 10, 8);
    createBuilding(-20, -20, 6, 5, 6);
    createBuilding(20, 20, 7, 15, 7);

    // Create some walls for cover
    for (let i = 0; i < 5; i++) {
      const wall = MeshBuilder.CreateBox('wall', { width: 0.5, height: 2, depth: 5 }, scene);
      wall.position = new Vector3(Math.random() * 40 - 20, 1, Math.random() * 40 - 20);
      wall.rotation.y = Math.random() * Math.PI;
      const wallMaterial = new StandardMaterial('wallMat', scene);
      wallMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
      wall.material = wallMaterial;
      wall.checkCollisions = true;
    }

    // Enable collisions
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new Vector3(0.5, 0.9, 0.5);
    scene.gravity = new Vector3(0, -0.15, 0);
    scene.collisionsEnabled = true;

    // Input handling for sprint and jump
    const keys: { [key: string]: boolean } = {};

    window.addEventListener('keydown', (e) => {
      keys[e.code] = true;

      // Sprint with Shift
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        camera.speed = 0.4;
      }

      // Jump with Space
      if (e.code === 'Space' && camera.position.y <= 1.7) {
        camera.position.y += 0.5;
      }
    });

    window.addEventListener('keyup', (e) => {
      keys[e.code] = false;

      // Reset sprint
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        camera.speed = 0.2;
      }
    });

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle resize
    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', () => {});
      window.removeEventListener('keyup', () => {});
      scene.dispose();
      engine.dispose();
    };
  }, [canvasRef]);

  return <canvas ref={canvasRef} className="w-full h-full outline-none" tabIndex={0} />;
}

export default GameCanvas;
