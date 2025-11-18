import { useEffect, useState } from 'react';

interface LowHealthEffectProps {
  health: number;
  maxHealth?: number;
}

function LowHealthEffect({ health, maxHealth = 100 }: LowHealthEffectProps) {
  const [pulse, setPulse] = useState(false);

  // Calculate health percentage
  const healthPercent = (health / maxHealth) * 100;

  // Start pulsing when health is low
  useEffect(() => {
    if (healthPercent <= 30) {
      const interval = setInterval(() => {
        setPulse((prev) => !prev);
      }, 800); // Pulse every 800ms
      return () => clearInterval(interval);
    } else {
      setPulse(false);
      return undefined;
    }
  }, [healthPercent]);

  // Don't show anything if health is above threshold
  if (healthPercent > 30) return null;

  // Calculate opacity based on health
  // At 30% health: 0.1 opacity
  // At 0% health: 0.5 opacity
  const baseOpacity = 0.5 - (healthPercent / 30) * 0.4;
  const pulseOpacity = pulse ? baseOpacity + 0.1 : baseOpacity;

  return (
    <>
      {/* Red vignette overlay */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle, transparent 30%, rgba(220, 38, 38, 0.8) 100%)',
          opacity: pulseOpacity,
        }}
      />

      {/* Red border pulse */}
      <div
        className="fixed inset-0 pointer-events-none border-4 border-red-600 transition-opacity duration-300"
        style={{
          opacity: pulse ? 0.6 : 0.3,
        }}
      />

      {/* Critical health warning text */}
      {healthPercent <= 15 && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div
            className={`text-red-500 text-2xl font-bold uppercase tracking-wider transition-opacity duration-300 ${
              pulse ? 'opacity-100' : 'opacity-40'
            }`}
          >
            Critical Health
          </div>
        </div>
      )}
    </>
  );
}

export default LowHealthEffect;
