const db = require('../config/db'); // Koneksi ke database

const Watchlist = {
  async addToWatchlist(user_id, movie_id, title, poster_path) {
    try {
      // Generate watchlist_id langsung dari user_id
      const watchlistId = `WL${user_id.slice(3)}`; // Ambil angka dari user_id
      console.log('Generated watchlist_id:', watchlistId);

      // Simpan data ke database
      const result = await db.query(
        'INSERT INTO watchlist (watchlist_id, user_id, movie_id, title, poster_path) VALUES (?, ?, ?, ?, ?)',
        [watchlistId, user_id, movie_id, title, poster_path]
      );

      return watchlistId;
    } catch (error) {
      console.error('Error adding to watchlist:', error.message);
      throw error;
    }
  },





  async getWatchlistByUser(user_id) {
    try {
      const [results] = await db.query(
        'SELECT watchlist_id, movie_id, title, poster_path FROM watchlist WHERE user_id = ?',
        [user_id]
      );
      return results; // Kembalikan hasil langsung
    } catch (error) {
      console.error('Error fetching watchlist:', error.message);
      throw error;
    }
  },

  async removeFromWatchlist(user_id, movie_id) {
    try {
      const [result] = await db.query(
        'DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?',
        [user_id, movie_id]
      );
      return result.affectedRows > 0; // Mengembalikan true jika berhasil dihapus
    } catch (error) {
      console.error('Error removing from watchlist:', error.message);
      throw error;
    }
  },
};

module.exports = Watchlist;
