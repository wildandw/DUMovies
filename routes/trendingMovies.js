const express = require('express');
const axios = require('axios');
const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY;


/**
 * @swagger
 * /trending:
 *   get:
 *     summary: Get trending movies for the week
 *     tags:
 *       - Trending Movies
 *     responses:
 *       200:
 *         description: A list of trending movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       overview:
 *                         type: string
 *                       poster_path:
 *                         type: string
 *                       backdrop_path:
 *                         type: string
 *                       release_date:
 *                         type: string
 *       500:
 *         description: Failed to fetch trending movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get('/trending', async (req, res) => {
    const options = {
      method: 'GET',
      url: 'https://api.themoviedb.org/3/trending/movie/week?language=en-US',
      headers: {
        accept: 'application/json',
        Authorization: TMDB_API_KEY
      }
    };
  
    try {
      const response = await axios.request(options);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching trending movies:', error.message);
      res.status(500).json({ error: 'Failed to fetch trending movies' });
    }
  });

module.exports = router;
