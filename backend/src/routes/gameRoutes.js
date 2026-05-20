const router = require('express').Router();
const GameController = require('../controllers/gameController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/create', optionalAuth, GameController.createRoom);
router.post('/join',   optionalAuth, GameController.joinRoom);

module.exports = router;
