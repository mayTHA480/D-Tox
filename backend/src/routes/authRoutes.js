const router = require('express').Router();
const AuthController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/google', verifyToken, AuthController.googleLogin);
router.post('/guest',  AuthController.guestLogin);
router.get('/me',      verifyToken, AuthController.getMe);

module.exports = router;
