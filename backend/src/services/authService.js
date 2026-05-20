const UserModel = require('../models/userModel');
const { v4: uuidv4 } = require('uuid');

const AuthService = {
  loginWithGoogle: async ({ uid, name, email, picture }) => {
    return UserModel.upsert({ firebase_uid: uid, display_name: name || 'Player', email, photo_url: picture || null, is_guest: false });
  },

  loginAsGuest: async (displayName) => {
    return UserModel.upsert({ firebase_uid: 'guest_' + uuidv4(), display_name: displayName, email: null, photo_url: null, is_guest: true });
  },

  getProfile: async (uid) => UserModel.findByUid(uid),
};

module.exports = AuthService;
