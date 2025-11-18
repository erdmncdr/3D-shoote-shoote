import { useEffect, useState } from 'react';
import type { KillFeedEvent } from '../services/NetworkService';

interface KillFeedProps {
  events: KillFeedEvent[];
}

function KillFeed({ events }: KillFeedProps) {
  const [displayEvents, setDisplayEvents] = useState<KillFeedEvent[]>([]);

  useEffect(() => {
    // Keep only recent events (last 5, shown for 5 seconds each)
    const now = Date.now();
    const filtered = events.filter((event) => now - event.timestamp < 5000).slice(-5);
    setDisplayEvents(filtered);
  }, [events]);

  if (displayEvents.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 space-y-2 pointer-events-none">
      {displayEvents.map((event) => (
        <div
          key={`${event.killerId}-${event.victimId}-${event.timestamp}`}
          className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 animate-slide-in-right"
        >
          <span className="text-red-400">{event.killerName}</span>
          <span className="text-gray-400">{event.isHeadshot ? '💀' : '☠️'}</span>
          <span className="text-blue-300">{event.victimName}</span>
          {event.isHeadshot && <span className="text-yellow-400 text-xs ml-1">[HEADSHOT]</span>}
        </div>
      ))}
    </div>
  );
}

export default KillFeed;
