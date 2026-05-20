const router = require('express').Router();
const { verifyToken } = require('../middleware/authMiddleware');
const UserModel = require('../models/userModel');

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findByUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
