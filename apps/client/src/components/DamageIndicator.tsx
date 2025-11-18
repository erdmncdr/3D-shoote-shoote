import { useEffect, useState } from 'react';

interface DamageEvent {
  direction: number; // angle in radians
  timestamp: number;
  id: string;
}

interface DamageIndicatorProps {
  damageEvents: DamageEvent[];
}

function DamageIndicator({ damageEvents }: DamageIndicatorProps) {
  const [activeEvents, setActiveEvents] = useState<DamageEvent[]>([]);

  useEffect(() => {
    // Keep only recent events (last 1 second)
    const now = Date.now();
    const filtered = damageEvents.filter((event) => now - event.timestamp < 1000);
    setActiveEvents(filtered);
  }, [damageEvents]);

  if (activeEvents.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none">
      {activeEvents.map((event) => {
        // Convert direction to rotation (0 = top, clockwise)
        const rotation = (event.direction * 180) / Math.PI;

        return (
          <div
            key={event.id}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-200px)`,
            }}
          >
            <div className="text-red-500 text-6xl animate-pulse">↑</div>
          </div>
        );
      })}
    </div>
  );
}

export default DamageIndicator;
