const AuthService = require('../services/authService');

const AuthController = {
  googleLogin: async (req, res) => {
    try {
      const { uid, name, email, picture } = req.user;
      const user = await AuthService.loginWithGoogle({ uid, name, email, picture });
      res.json({ success: true, user });
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  guestLogin: async (req, res) => {
    try {
      const { displayName } = req.body;
      if (!displayName || displayName.trim().length < 2) return res.status(400).json({ error: 'Name too short' });
      const user = await AuthService.loginAsGuest(displayName.trim());
      res.json({ success: true, user });
    } catch (err) { res.status(500).json({ error: err.message }); }
  },

  getMe: async (req, res) => {
    try {
      const user = await AuthService.getProfile(req.user.uid);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user });
    } catch (err) { res.status(500).json({ error: err.message }); }
  },
};

module.exports = AuthController;
