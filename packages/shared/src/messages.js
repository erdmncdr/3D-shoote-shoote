'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ServerMessageType = exports.ClientMessageType = void 0;
var ClientMessageType;
(function (ClientMessageType) {
  ClientMessageType['INPUT'] = 'input';
  ClientMessageType['READY'] = 'ready';
  ClientMessageType['CHANGE_WEAPON'] = 'change_weapon';
  ClientMessageType['CHAT'] = 'chat';
})(ClientMessageType || (exports.ClientMessageType = ClientMessageType = {}));
var ServerMessageType;
(function (ServerMessageType) {
  ServerMessageType['MATCH_STATE'] = 'match_state';
  ServerMessageType['PLAYER_JOINED'] = 'player_joined';
  ServerMessageType['PLAYER_LEFT'] = 'player_left';
  ServerMessageType['PLAYER_DIED'] = 'player_died';
  ServerMessageType['PLAYER_RESPAWNED'] = 'player_respawned';
  ServerMessageType['DAMAGE'] = 'damage';
  ServerMessageType['KILL_FEED'] = 'kill_feed';
  ServerMessageType['CHAT'] = 'chat';
  ServerMessageType['MATCH_END'] = 'match_end';
})(ServerMessageType || (exports.ServerMessageType = ServerMessageType = {}));
//# sourceMappingURL=messages.js.map
