const express = require('express');
const axios = require('axios');
const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;


const getImageBaseUrl = () => {
    return 'https://image.tmdb.org/t/p/original';  
  };



/**
 * @swagger
 * /movies/upcoming:
 *   get:
 *     summary: Get a list of upcoming movies
 *     tags:
 *       - Upcoming Movies
 *     responses:
 *       200:
 *         description: A list of upcoming movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dates:
 *                   type: object
 *                   properties:
 *                     maximum:
 *                       type: string
 *                     minimum:
 *                       type: string
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
 *                 total_pages:
 *                   type: integer
 *                 total_results:
 *                   type: integer
 *       500:
 *         description: Failed to fetch upcoming movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get('/movies/upcoming', async (req, res) => {
    const options = {
      method: 'GET',
      url: 'https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1',
      headers: {
        accept: 'application/json',
        Authorization: TMDB_API_KEY
      }
    };
  
    try {
      const response = await axios.request(options);
      res.status(200).json(response.data); // Mengirimkan data API ke klien
    } catch (error) {
      console.error('Error fetching upcoming movies:', error.message);
      res.status(500).json({ error: 'Failed to fetch upcoming movies' });
    }
  });

  module.exports = router;