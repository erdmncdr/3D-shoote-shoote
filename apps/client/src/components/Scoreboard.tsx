import { useGameStore } from '../stores/useGameStore';

interface ScoreboardProps {
  visible: boolean;
}

function Scoreboard({ visible }: ScoreboardProps) {
  const players = useGameStore((state) => state.players);
  const blueScore = useGameStore((state) => state.blueScore);
  const redScore = useGameStore((state) => state.redScore);
  const sessionId = useGameStore((state) => state.sessionId);

  if (!visible) return null;

  // Separate players by team
  const bluePlayers = Array.from(players.values()).filter((p) => p.team === 'blue');
  const redPlayers = Array.from(players.values()).filter((p) => p.team === 'red');

  // Sort by kills (descending)
  const sortPlayers = (a: any, b: any) => b.kills - a.kills;
  bluePlayers.sort(sortPlayers);
  redPlayers.sort(sortPlayers);

  const renderPlayerRow = (player: any) => {
    const isLocalPlayer = player.id === sessionId;
    const kd =
      player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2);

    return (
      <tr
        key={player.id}
        className={`${isLocalPlayer ? 'bg-yellow-900/30' : ''} hover:bg-gray-700/50 transition-colors`}
      >
        <td className="px-4 py-2 text-left">
          {player.username} {isLocalPlayer && '(You)'}
        </td>
        <td className="px-4 py-2 text-center">{player.kills}</td>
        <td className="px-4 py-2 text-center">{player.deaths}</td>
        <td className="px-4 py-2 text-center text-yellow-400">{kd}</td>
      </tr>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 max-w-5xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SCOREBOARD</h1>
          <div className="flex justify-center gap-8 text-2xl font-bold">
            <div className="text-blue-400">BLUE: {blueScore}</div>
            <div className="text-gray-500">-</div>
            <div className="text-red-400">RED: {redScore}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Blue Team */}
          <div>
            <h2 className="text-xl font-bold text-blue-400 mb-4">BLUE TEAM</h2>
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="px-4 py-2 text-left">Player</th>
                  <th className="px-4 py-2 text-center">K</th>
                  <th className="px-4 py-2 text-center">D</th>
                  <th className="px-4 py-2 text-center">K/D</th>
                </tr>
              </thead>
              <tbody className="text-white">{bluePlayers.map(renderPlayerRow)}</tbody>
            </table>
          </div>

          {/* Red Team */}
          <div>
            <h2 className="text-xl font-bold text-red-400 mb-4">RED TEAM</h2>
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="px-4 py-2 text-left">Player</th>
                  <th className="px-4 py-2 text-center">K</th>
                  <th className="px-4 py-2 text-center">D</th>
                  <th className="px-4 py-2 text-center">K/D</th>
                </tr>
              </thead>
              <tbody className="text-white">{redPlayers.map(renderPlayerRow)}</tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-400">Press TAB to close</div>
      </div>
    </div>
  );
}

export default Scoreboard;
