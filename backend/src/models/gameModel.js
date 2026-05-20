const pool = require('../configs/db');

const GameModel = {
  createSession: async ({ room_code, player_count, created_by }) => {
    const { rows } = await pool.query(
      `INSERT INTO game_sessions (room_code, player_count, created_by) VALUES ($1,$2,$3) RETURNING *`,
      [room_code, player_count, created_by]
    );
    return rows[0];
  },

  findByRoomCode: async (code) => {
    const { rows } = await pool.query('SELECT * FROM game_sessions WHERE room_code = $1', [code]);
    return rows[0] || null;
  },

  updateStatus: async (room_code, status, winner_id = null) => {
    const { rows } = await pool.query(
      `UPDATE game_sessions SET status=$1, winner_id=$2,
       finished_at=CASE WHEN $1='finished' THEN NOW() ELSE NULL END
       WHERE room_code=$3 RETURNING *`,
      [status, winner_id, room_code]
    );
    return rows[0];
  },

  addPlayer: async ({ session_id, user_id, hp, turn_order }) => {
    const { rows } = await pool.query(
      `INSERT INTO game_players (session_id, user_id, hp, turn_order) VALUES ($1,$2,$3,$4) RETURNING *`,
      [session_id, user_id, hp, turn_order]
    );
    return rows[0];
  },

  getPlayers: async (session_id) => {
    const { rows } = await pool.query(
      `SELECT gp.*, u.display_name, u.photo_url FROM game_players gp
       JOIN users u ON u.id = gp.user_id
       WHERE gp.session_id=$1 ORDER BY gp.turn_order`,
      [session_id]
    );
    return rows;
  },

  logMove: async ({ session_id, player_id, card_ids, target, effect }) => {
    await pool.query(
      `INSERT INTO game_moves (session_id, player_id, card_ids, target, effect) VALUES ($1,$2,$3,$4,$5)`,
      [session_id, player_id, card_ids, target, effect]
    );
  },
};

module.exports = GameModel;
