const express = require('express');
const axios = require('axios');
const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const getImageBaseUrl = () => {
  return 'https://image.tmdb.org/t/p/original';  
};


/**
 * @swagger
 * /search/movie:
 *   get:
 *     summary: Search for movies
 *     tags:
 *       - Search Movies
 *     parameters:
 *       - name: query
 *         in: query
 *         description: The search term for movies
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of movies matching the search term
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *                       release_date:
 *                         type: string
 *       400:
 *         description: Query parameter is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to fetch movie data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */




// Rute untuk search film 
router.get('/search/movie', async (req, res) => {
    const query = req.query.query; // Mengambil query dari parameter URL
  
    if (!query) {
      // Jika query tidak diberikan, kembalikan respons error
      return res.status(400).json({ error: 'Query parameter is required' });
    }
  
    const options = {
      method: 'GET',
      url: `https://api.themoviedb.org/3/search/movie`,
      params: {
        query: query,
      },
      headers: {
        accept: 'application/json',
        Authorization: TMDB_API_KEY
      },
    };

      try {
        const response = await axios.request(options);
        const imageBaseUrl = getImageBaseUrl();
        const moviesWithImages = response.data.results.map(movie => ({
          ...movie,
          posterUrl: movie.poster_path ? imageBaseUrl + movie.poster_path : null,
          backdropUrl: movie.backdrop_path ? imageBaseUrl + movie.backdrop_path : null,
        }));
    
        res.json({ ...response.data, results: moviesWithImages });
      } catch (error) {
        console.error('Error fetching movie data:', error.message);
        res.status(500).json({ error: 'Failed to fetch movie data' });
      }
});

module.exports = router;

