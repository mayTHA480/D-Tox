const admin = require('../configs/firebase');

const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    req.user = await admin.auth().verifyIdToken(header.split('Bearer ')[1]);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) { req.user = null; return next(); }
  try { req.user = await admin.auth().verifyIdToken(header.split('Bearer ')[1]); }
  catch { req.user = null; }
  next();
};

module.exports = { verifyToken, optionalAuth };
