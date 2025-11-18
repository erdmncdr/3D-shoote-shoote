import { useEffect, useState } from 'react';

interface HitMarkerProps {
  show: boolean;
  isHeadshot?: boolean;
}

function HitMarker({ show, isHeadshot }: HitMarkerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timeout = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <div
        className={`text-6xl font-bold ${isHeadshot ? 'text-red-500' : 'text-white'} animate-ping`}
      >
        ×
      </div>
    </div>
  );
}

export default HitMarker;
