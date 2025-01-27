const mysql = require('mysql2/promise'); // Pastikan menggunakan mysql2/promise
const db = require('../config/db');

const saveUserPreference = async (user_id, mood, genre1, genre2) => {
  let connection;
  try {
    // Gunakan connection pool dari mysql2/promise
    connection = await db.getConnection();

    // Cek apakah preferensi untuk user sudah ada
    const [existingPreference] = await connection.query(
      'SELECT * FROM user_preferences WHERE user_id = ?', 
      [user_id]
    );

    let result;
    if (existingPreference.length > 0) {
      // Update existing preference
      await connection.query(
        'UPDATE user_preferences SET mood = ?, genre1 = ?, genre2 = ?, updated_at = NOW() WHERE user_id = ?', 
        [mood, genre1, genre2, user_id]
      );
      result = { message: 'Preference updated successfully' };
    } else {
      // Insert new preference
      const [insertResult] = await connection.query(
        'INSERT INTO user_preferences (user_id, mood, genre1, genre2, updated_at) VALUES (?, ?, ?, ?, NOW())', 
        [user_id, mood, genre1, genre2]
      );
      result = { 
        message: 'Preference saved successfully',
        insertId: insertResult.insertId 
      };
    }

    return result;
  } catch (error) {
    console.error('Error in saveUserPreference:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const getUserPreference = async (userId) => {
    let connection;
    try {
      connection = await db.getConnection();
      const [preferences] = await connection.query(
        'SELECT * FROM user_preferences WHERE user_id = ?', 
        [userId]
      );
  
      // Kembalikan null jika tidak ada preferences
      return preferences.length > 0 ? preferences[0] : null;
    } catch (error) {
      console.error('Error in getUserPreference:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
};

module.exports = {
  saveUserPreference,
  getUserPreference
};