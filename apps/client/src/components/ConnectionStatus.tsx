import { ConnectionState } from '../services/NetworkService';

interface ConnectionStatusProps {
  connectionState: ConnectionState;
  ping: number;
}

function ConnectionStatus({ connectionState, ping }: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return 'bg-green-500';
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return 'bg-yellow-500';
      case ConnectionState.DISCONNECTED:
      case ConnectionState.FAILED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return 'Connected';
      case ConnectionState.CONNECTING:
        return 'Connecting...';
      case ConnectionState.RECONNECTING:
        return 'Reconnecting...';
      case ConnectionState.DISCONNECTED:
        return 'Disconnected';
      case ConnectionState.FAILED:
        return 'Connection Failed';
      default:
        return 'Unknown';
    }
  };

  const getPingColor = () => {
    if (ping < 50) return 'text-green-400';
    if (ping < 100) return 'text-yellow-400';
    if (ping < 200) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-3">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${getStatusColor()} ${connectionState === ConnectionState.RECONNECTING ? 'animate-pulse' : ''}`}
        />
        <span className="text-white text-sm font-medium">{getStatusText()}</span>
      </div>

      {/* Ping */}
      {connectionState === ConnectionState.CONNECTED && (
        <div className="border-l border-gray-600 pl-3">
          <span className={`text-sm font-mono ${getPingColor()}`}>{ping}ms</span>
        </div>
      )}
    </div>
  );
}

export default ConnectionStatus;
