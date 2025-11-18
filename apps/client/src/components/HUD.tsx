import { useGameStore } from '../stores/useGameStore';

function HUD() {
  const blueScore = useGameStore((state) => state.blueScore);
  const redScore = useGameStore((state) => state.redScore);
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const localPlayer = useGameStore((state) => state.getLocalPlayer());

  // Format weapon name for display
  const formatWeaponName = (weapon: string) => {
    return weapon.replace(/_/g, ' ').toUpperCase();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getHealthColor = (health: number) => {
    if (health > 70) return 'text-green-400';
    if (health > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAmmoColor = (ammo: number, magazineSize: number = 30) => {
    const percentage = (ammo / magazineSize) * 100;
    if (percentage > 30) return 'text-yellow-400';
    if (percentage > 0) return 'text-red-400 animate-pulse';
    return 'text-red-600 animate-pulse';
  };

  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none">
        <div className="bg-black/50 p-3 rounded">
          <div className={`text-sm font-mono ${getHealthColor(localPlayer?.health || 100)}`}>
            HP: {localPlayer?.health || 100}
          </div>
          <div className="text-blue-400 text-sm font-mono">ARMOR: {localPlayer?.armor || 100}</div>
          <div className="text-xs text-gray-400 mt-1">
            {localPlayer?.team === 'blue' ? '🔵 BLUE' : '🔴 RED'}
          </div>
        </div>

        <div className="bg-black/50 p-3 rounded text-center min-w-[200px]">
          <div className="text-white text-lg font-bold">TEAM DEATHMATCH</div>
          <div className="text-sm text-gray-300">
            <span className="text-blue-400">{blueScore}</span> |{' '}
            <span className="text-red-400">{redScore}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">{formatTime(timeRemaining)}</div>
        </div>

        <div className="bg-black/50 p-3 rounded text-right">
          <div className="text-white text-sm font-mono">
            K/D: {localPlayer?.kills || 0}/{localPlayer?.deaths || 0}
          </div>
          <div className="text-xs text-gray-400">
            Players: {useGameStore.getState().players.size}
          </div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end pointer-events-none">
        <div className="bg-black/50 p-3 rounded">
          <div className={`text-2xl font-bold font-mono ${getAmmoColor(localPlayer?.ammo || 0)}`}>
            {localPlayer?.ammo || 0} / {localPlayer?.reserveAmmo || 0}
          </div>
          <div className="text-gray-300 text-sm uppercase">
            {formatWeaponName(localPlayer?.currentWeapon || 'assault_rifle')}
          </div>
          <div className="text-gray-500 text-xs mt-1">Press R to Reload | 1-5 Change Weapon</div>
        </div>

        <div className="bg-black/50 p-2 rounded text-xs text-gray-300">
          <p>WASD - Move | SHIFT - Sprint | SPACE - Jump | R - Reload</p>
          <p>LMB - Shoot | ESC - Exit Pointer Lock</p>
        </div>
      </div>

      {/* Player Status */}
      {!localPlayer?.isAlive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="text-white text-4xl font-bold">
            YOU DIED
            <div className="text-sm text-gray-400 mt-2">Respawning...</div>
          </div>
        </div>
      )}
    </>
  );
}

export default HUD;
