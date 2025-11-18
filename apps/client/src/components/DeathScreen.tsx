interface DeathScreenProps {
  killerName?: string;
  weapon?: string;
  isHeadshot?: boolean;
}

function DeathScreen({ killerName, weapon, isHeadshot }: DeathScreenProps) {
  const formatWeaponName = (weaponStr: string = '') => {
    return weaponStr.replace(/_/g, ' ').toUpperCase();
  };

  if (!killerName) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
      <div className="text-center">
        {/* Skull icon */}
        <div className="text-8xl mb-4 animate-pulse">☠️</div>

        {/* "You Died" text */}
        <h1 className="text-6xl font-bold text-red-500 mb-6 tracking-wider">YOU DIED</h1>

        {/* Killer info */}
        <div className="bg-black/80 border border-red-900 rounded-lg p-6 max-w-md">
          <p className="text-gray-400 text-sm mb-2">KILLED BY</p>
          <p className="text-white text-3xl font-bold mb-3">{killerName}</p>

          {/* Weapon info */}
          <div className="flex items-center justify-center gap-2 text-gray-300 text-lg">
            <span>WITH</span>
            <span className="text-orange-400 font-semibold">{formatWeaponName(weapon)}</span>
          </div>

          {/* Headshot badge */}
          {isHeadshot && (
            <div className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold uppercase">
              💀 HEADSHOT
            </div>
          )}
        </div>

        {/* Respawn hint */}
        <p className="text-gray-500 text-sm mt-6">Respawning soon...</p>
      </div>
    </div>
  );
}

export default DeathScreen;
