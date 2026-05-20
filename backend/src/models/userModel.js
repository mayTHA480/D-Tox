const pool = require('../configs/db');

const UserModel = {
  findByUid: async (uid) => {
    const { rows } = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
    return rows[0] || null;
  },

  upsert: async ({ firebase_uid, display_name, email, photo_url, is_guest = false }) => {
    const { rows } = await pool.query(
      `INSERT INTO users (firebase_uid, display_name, email, photo_url, is_guest, updated_at)
       VALUES ($1,$2,$3,$4,$5,NOW())
       ON CONFLICT (firebase_uid)
       DO UPDATE SET display_name=$2, email=$3, photo_url=$4, updated_at=NOW()
       RETURNING *`,
      [firebase_uid, display_name, email, photo_url, is_guest]
    );
    return rows[0];
  },

  findById: async (id) => {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  },
};

module.exports = UserModel;
