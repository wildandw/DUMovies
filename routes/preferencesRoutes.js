const express = require('express');
const router = express.Router();
const { saveUserPreference, getUserPreference } = require('../models/preferenceModel');

router.post('/preferences', async (req, res) => {
  const { user_id, mood, genre1, genre2 } = req.body;
  
  // Logging input untuk debugging
  console.log('Received preferences:', { user_id, mood, genre1, genre2 });

  try {
    const result = await saveUserPreference(user_id, mood, genre1, genre2);
    
    // Pastikan selalu mengirim respons JSON
    res.status(200).json({ 
      message: 'Preferences saved successfully',
      data: result 
    });
  } catch (error) {
    console.error('Preferences save error:', error);
    
    // Pastikan mengirim respons JSON bahkan saat error
    res.status(500).json({ 
      message: 'Failed to save preferences', 
      error: error.message 
    });
  }
});

router.get('/preferences/:userId', async (req, res) => {
  try {
    const preferences = await getUserPreference(req.params.userId);
    
    if (preferences) {
      // Jika preferences ada, kembalikan data
      res.status(200).json(preferences);
    } else {
      // Jika tidak ada preferences, kembalikan null dengan status 200
      res.status(200).json(null);
    }
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ message: 'Failed to get preferences', error: error.message });
  }
});

module.exports = router;