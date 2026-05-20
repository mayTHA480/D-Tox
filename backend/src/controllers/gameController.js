const GameService = require('../services/gameService');
const UserModel = require('../models/userModel');

const GameController = {
  createRoom: async (req, res) => {
    try {
      const { playerCount = 2, guestUid } = req.body;
      if (playerCount < 2 || playerCount > 4) return res.status(400).json({ error: 'Player count must be 2-4' });
      const uid = req.user?.uid || guestUid;
      const dbUser = await UserModel.findByUid(uid);
      if (!dbUser) return res.status(404).json({ error: 'User not found' });
      const result = await GameService.createRoom({ userId: dbUser.id, playerCount });
      res.json({ success: true, ...result });
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  joinRoom: async (req, res) => {
    try {
      const { roomCode, guestUid } = req.body;
      if (!roomCode) return res.status(400).json({ error: 'Room code required' });
      const uid = req.user?.uid || guestUid;
      const dbUser = await UserModel.findByUid(uid);
      if (!dbUser) return res.status(404).json({ error: 'User not found' });
      const result = await GameService.joinRoom({ roomCode: roomCode.toUpperCase(), userId: dbUser.id });
      res.json({ success: true, ...result });
    } catch (err) { res.status(400).json({ error: err.message }); }
  },
};

module.exports = GameController;
