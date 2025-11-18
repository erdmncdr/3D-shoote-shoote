import { useEffect, useState } from 'react';

interface RespawnTimerProps {
  respawnTime: number; // timestamp when respawn will happen
  onRespawn?: () => void;
}

function RespawnTimer({ respawnTime, onRespawn }: RespawnTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((respawnTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0 && onRespawn) {
        onRespawn();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [respawnTime, onRespawn]);

  if (timeLeft <= 0) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="bg-black/80 backdrop-blur-md px-12 py-8 rounded-2xl border-4 border-red-500 animate-pulse-slow">
        <div className="text-center">
          <div className="text-red-500 text-8xl font-bold mb-4">{timeLeft}</div>
          <div className="text-white text-2xl font-semibold">Respawning...</div>
        </div>
      </div>
    </div>
  );
}

export default RespawnTimer;
