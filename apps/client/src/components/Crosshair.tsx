import { useSettings } from '../stores/useSettings';

interface CrosshairProps {
  weaponType?: string;
}

function Crosshair({ weaponType = 'assault_rifle' }: CrosshairProps) {
  const settings = useSettings((state) => state.settings);

  // Don't show crosshair if disabled in settings
  if (!settings.showCrosshair) return null;

  // Different crosshair styles for different weapons
  const getCrosshairStyle = () => {
    switch (weaponType) {
      case 'sniper':
        return 'crosshair-sniper';
      case 'shotgun':
        return 'crosshair-shotgun';
      case 'smg':
      case 'assault_rifle':
      case 'pistol':
      default:
        return 'crosshair-default';
    }
  };

  const crosshairStyle = getCrosshairStyle();

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <div className={`crosshair ${crosshairStyle}`}>
        {/* Default crosshair - cross shape */}
        {crosshairStyle === 'crosshair-default' && (
          <>
            <div className="absolute w-0.5 h-3 bg-white -top-4 left-1/2 -translate-x-1/2 opacity-80" />
            <div className="absolute w-0.5 h-3 bg-white -bottom-4 left-1/2 -translate-x-1/2 opacity-80" />
            <div className="absolute w-3 h-0.5 bg-white -left-4 top-1/2 -translate-y-1/2 opacity-80" />
            <div className="absolute w-3 h-0.5 bg-white -right-4 top-1/2 -translate-y-1/2 opacity-80" />
            <div className="absolute w-1 h-1 bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </>
        )}

        {/* Sniper crosshair - precise dot with lines */}
        {crosshairStyle === 'crosshair-sniper' && (
          <>
            <div className="absolute w-0.5 h-2 bg-green-400 -top-3 left-1/2 -translate-x-1/2 opacity-90" />
            <div className="absolute w-0.5 h-2 bg-green-400 -bottom-3 left-1/2 -translate-x-1/2 opacity-90" />
            <div className="absolute w-2 h-0.5 bg-green-400 -left-3 top-1/2 -translate-y-1/2 opacity-90" />
            <div className="absolute w-2 h-0.5 bg-green-400 -right-3 top-1/2 -translate-y-1/2 opacity-90" />
            <div className="absolute w-1.5 h-1.5 bg-green-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </>
        )}

        {/* Shotgun crosshair - wider spread indicator */}
        {crosshairStyle === 'crosshair-shotgun' && (
          <>
            <div className="absolute w-1 h-3 bg-orange-400 -top-6 left-1/2 -translate-x-1/2 opacity-70" />
            <div className="absolute w-1 h-3 bg-orange-400 -bottom-6 left-1/2 -translate-x-1/2 opacity-70" />
            <div className="absolute w-3 h-1 bg-orange-400 -left-6 top-1/2 -translate-y-1/2 opacity-70" />
            <div className="absolute w-3 h-1 bg-orange-400 -right-6 top-1/2 -translate-y-1/2 opacity-70" />
            {/* Corner indicators for spread */}
            <div className="absolute w-1.5 h-1.5 bg-orange-400 -top-5 -left-5 opacity-50" />
            <div className="absolute w-1.5 h-1.5 bg-orange-400 -top-5 -right-5 opacity-50" />
            <div className="absolute w-1.5 h-1.5 bg-orange-400 -bottom-5 -left-5 opacity-50" />
            <div className="absolute w-1.5 h-1.5 bg-orange-400 -bottom-5 -right-5 opacity-50" />
          </>
        )}
      </div>
    </div>
  );
}

export default Crosshair;
