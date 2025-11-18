function HUD() {
  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none">
        <div className="bg-black/50 p-3 rounded">
          <div className="text-green-400 text-sm font-mono">HP: 100</div>
          <div className="text-blue-400 text-sm font-mono">ARMOR: 100</div>
        </div>

        <div className="bg-black/50 p-3 rounded text-center">
          <div className="text-white text-lg font-bold">TEAM DEATHMATCH</div>
          <div className="text-sm text-gray-300">Blue: 0 | Red: 0</div>
        </div>

        <div className="bg-black/50 p-3 rounded text-right">
          <div className="text-white text-sm font-mono">FPS: 60</div>
          <div className="text-white text-sm font-mono">PING: 45ms</div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative w-8 h-8">
          <div className="absolute top-1/2 left-0 w-3 h-0.5 bg-white/80 -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-3 h-0.5 bg-white/80 -translate-y-1/2"></div>
          <div className="absolute left-1/2 top-0 w-0.5 h-3 bg-white/80 -translate-x-1/2"></div>
          <div className="absolute left-1/2 bottom-0 w-0.5 h-3 bg-white/80 -translate-x-1/2"></div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end pointer-events-none">
        <div className="bg-black/50 p-3 rounded">
          <div className="text-yellow-400 text-2xl font-bold font-mono">30 / 90</div>
          <div className="text-gray-300 text-sm">ASSAULT RIFLE</div>
        </div>

        <div className="bg-black/50 p-2 rounded text-xs text-gray-300">
          <p>WASD - Move | SHIFT - Sprint | SPACE - Jump</p>
          <p>LMB - Shoot | RMB - Aim | R - Reload | ESC - Menu</p>
        </div>
      </div>

      {/* Kill Feed */}
      <div className="absolute top-20 right-4 space-y-1 pointer-events-none">
        {/* Kill feed items will be dynamically added here */}
      </div>
    </>
  );
}

export default HUD;
