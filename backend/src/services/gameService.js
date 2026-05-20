const GameModel = require('../models/gameModel');

// HP rules: 2 players = 20 HP, 3-4 players = 10 HP
const getStartingHP = (playerCount) => playerCount <= 2 ? 20 : 10;

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const GameService = {
  createRoom: async ({ userId, playerCount }) => {
    const room_code = generateRoomCode();
    const session = await GameModel.createSession({ room_code, player_count: playerCount, created_by: userId });
    const hp = getStartingHP(playerCount);
    await GameModel.addPlayer({ session_id: session.id, user_id: userId, hp, turn_order: 1 });
    return { session, room_code, hp };
  },

  joinRoom: async ({ roomCode, userId }) => {
    const session = await GameModel.findByRoomCode(roomCode);
    if (!session) throw new Error('Room not found');
    if (session.status !== 'waiting') throw new Error('Game already started');
    const players = await GameModel.getPlayers(session.id);
    if (players.length >= session.player_count) throw new Error('Room is full');
    if (players.find(p => p.user_id === userId)) throw new Error('Already in this room');
    const hp = getStartingHP(session.player_count);
    await GameModel.addPlayer({ session_id: session.id, user_id: userId, hp, turn_order: players.length + 1 });
    const updated = await GameModel.getPlayers(session.id);
    return { session, players: updated, isFull: updated.length >= session.player_count, hp };
  },

  getStartingHP,
};

module.exports = GameService;
