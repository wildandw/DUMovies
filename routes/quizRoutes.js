const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/save-quiz', async (req, res) => {
  const { userId, mood, genres } = req.body;
  try {
    await db.query(
      'INSERT INTO recommendations (user_id, mood, genre1, genre2) VALUES (?, ?, ?, ?)',
      [userId, mood, genres[0], genres[1]]
    );
    res.status(200).json({ message: 'Quiz result saved' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving quiz result', error });
  }
});

router.get('/get-quiz-result', async (req, res) => {
  const { userId } = req.query;
  try {
    const [results] = await db.query(
      'SELECT mood, genre1, genre2 FROM recommendations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    res.status(results.length ? 200 : 404).json(results[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving quiz result', error });
  }
});

module.exports = router;