const express = require('express');
const axios = require('axios');
const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const getImageBaseUrl = () => {
    return 'https://image.tmdb.org/t/p/original';  
  };


const getSimilarMovies = (movie_id) => {
  const options = {
    method: 'GET',
    url: `https://api.themoviedb.org/3/movie/${movie_id}/similar?page=1`,
    headers: {
      accept: 'application/json',
      Authorization: TMDB_API_KEY 
    }
  };

  return axios.request(options);
};



/**
 * @swagger
 * /similar/{id}:
 *   get:
 *     summary: Get similar movies for a given movie ID
 *     tags:
 *       - Similar Movies
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the movie to fetch similar movies for
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of similar movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 similar:
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
 *                       posterUrl:
 *                         type: string
 *                       backdropUrl:
 *                         type: string
 *                       release_date:
 *                         type: string
 *       500:
 *         description: Failed to fetch similar movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/similar/:id', async (req, res) => {
  const movie_id = req.params.id;

  try {
    const [imageBaseUrl, similarResponse] = await Promise.all([
      getImageBaseUrl(),
      getSimilarMovies(movie_id)
    ]);

    const similarData = similarResponse.data.results.map((movie) => ({
        ...movie,
        posterUrl: imageBaseUrl + movie.poster_path, 
        backdropUrl: imageBaseUrl + movie.backdrop_path,  
      }));
      res.status(200).json({ similar: similarData }); 
  } catch (error) {
    console.error('Error fetching similar movies:', error.message);
    res.status(500).json({ error: 'Failed to fetch similar movies' });
  }
});

module.exports = router;
