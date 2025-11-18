import { useEffect, useRef } from 'react';
import GameCanvas from './GameCanvas';
import HUD from './HUD';

function GameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Lock pointer on canvas click
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
      });
    }

    // Handle escape key to exit pointer lock
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.exitPointerLock();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <GameCanvas canvasRef={canvasRef} />
      <HUD />
    </div>
  );
}

export default GameView;
