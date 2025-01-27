const express = require('express');
const axios = require('axios');
const Watchlist = require('../models/watchlistModel'); // Import Watchlist model
const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const getImageBaseUrl = () => {
  return 'https://image.tmdb.org/t/p/original';
};

// Function to get movie details and credits
const getMovieDetailsAndCredits = async (movie_id) => {
  const options = {
    method: 'GET',
    url: `https://api.themoviedb.org/3/movie/${movie_id}?language=en-US&append_to_response=credits`,
    headers: {
      accept: 'application/json',
      Authorization: TMDB_API_KEY
    },
  };

  const response = await axios.request(options);
  return response.data;
};



/**
 * @swagger
 * /addwatchlist:
 *   post:
 *     summary: Add a movie to the watchlist
 *     tags:
 *       - Watchlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               movie_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Movie successfully added to watchlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 watchlist:
 *                   type: object
 *                   properties:
 *                     watchlist_id:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     movie_id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     poster_path:
 *                       type: string
 *       400:
 *         description: Movie already exists in watchlist
 *       500:
 *         description: Failed to add movie to watchlist
 */

// POST endpoint to add movie to the watchlist
router.post('/addwatchlist', async (req, res) => {
  const { user_id, movie_id } = req.body;

  try {
    // Fetch movie details
    const movieData = await getMovieDetailsAndCredits(movie_id);

    // Map necessary fields for the database
    const dataForDatabase = {
      movie_id: movie_id, // ID film
      title: movieData.title, // Judul film
      poster_path: movieData.poster_path
        ? `${getImageBaseUrl()}${movieData.poster_path}` // URL poster
        : null,
    };

    // Check for duplicates in the database
    const existingWatchlist = await Watchlist.getWatchlistByUser(user_id);
    const isDuplicate = existingWatchlist.some(
      (item) => item.movie_id === dataForDatabase.movie_id
    );

    if (isDuplicate) {
      return res.status(400).json({ error: 'Movie already exists in watchlist' });
    }

    // Save to the database
    const newWatchlistId = await Watchlist.addToWatchlist(
      user_id,
      dataForDatabase.movie_id,
      dataForDatabase.title,
      dataForDatabase.poster_path
    );

    res.status(200).json({
      message: 'Movie successfully added to watchlist',
      watchlist: {
        watchlist_id: newWatchlistId,
        user_id,
        movie_id: dataForDatabase.movie_id,
        title: dataForDatabase.title,
        poster_path: dataForDatabase.poster_path,
      },
    });
  } catch (error) {
    console.error('Error adding movie to watchlist:', error.message);
    res.status(500).json({ error: 'Failed to add movie to watchlist' });
  }
});


/**
 * @swagger
 * /watchlist/{user_id}:
 *   get:
 *     summary: Get the watchlist for a user
 *     tags:
 *       - Watchlist
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: A list of movies in the user's watchlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 watchlist:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       movie_id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       poster_path:
 *                         type: string
 *       500:
 *         description: Failed to fetch watchlist
 */

// GET endpoint to get watchlist for a user
router.get('/watchlist/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    // Get watchlist from the Watchlist model
    const watchlist = await Watchlist.getWatchlistByUser(user_id);
    res.status(200).json({ watchlist });
  } catch (error) {
    console.error('Error fetching watchlist:', error.message);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});



/**
 * @swagger
 * /removewatchlist:
 *   delete:
 *     summary: Remove a movie from the watchlist
 *     tags:
 *       - Watchlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               movie_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Movie removed from watchlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 movie_id:
 *                   type: string
 *       404:
 *         description: Movie not found in watchlist
 *       500:
 *         description: Failed to remove movie from watchlist
 */

// DELETE endpoint to remove movie from the watchlist
router.delete('/removewatchlist', async (req, res) => {
  const { user_id, movie_id } = req.body;

  try {
    // Remove movie from watchlist using the Watchlist model
    const result = await Watchlist.removeFromWatchlist(user_id, movie_id);
    if (result) {
      res.status(200).json({ message: 'Movie removed from watchlist', movie_id });
    } else {
      res.status(404).json({ message: 'Movie not found in watchlist' });
    }
  } catch (error) {
    console.error('Error removing movie from watchlist:', error.message);
    res.status(500).json({ error: 'Failed to remove movie from watchlist' });
  }
});

module.exports = router;
