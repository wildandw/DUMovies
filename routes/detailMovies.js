const express = require('express');
const axios = require('axios');
const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;



const genreMapping = {
  "Action": 28,
  "Animation": 16,
  "Comedy": 35,
  "Drama": 18,
  "Horror": 27,
  "Romance": 10749,
  "Science Fiction": 878,
  "Thriller": 53,
};


const getImageBaseUrl = () => {
  return 'https://image.tmdb.org/t/p/original';  
};

// Fungsi untuk mendapatkan detail film
const getMovieDetails = (movie_id) => {
    const options = {
      method: 'GET',
      url: `https://api.themoviedb.org/3/movie/${movie_id}?language=en-US`,
      headers: {
        accept: 'application/json',
        Authorization: TMDB_API_KEY
      }
    };
  
    return axios.request(options);
  };
  
  // Fungsi untuk mendapatkan credits film
  const getMovieCredits = (movie_id) => {
    const options = {
      method: 'GET',
      url: `https://api.themoviedb.org/3/movie/${movie_id}/credits`,
      headers: {
        accept: 'application/json',
        Authorization: TMDB_API_KEY
      }
    };
  
    return axios.request(options);
  };
  
  const mapGenreIdsToNames = (genreIds) => {
    return genreIds.map(id => {
      return Object.keys(genreMapping).find(key => genreMapping[key] === id);
    });
  };

  const limitCredits = (credits, limit = 5) => {
    return {
      cast: credits.cast.slice(0, limit),
      crew: credits.crew.slice(0, limit)
    };
  };

  const getDirector = async (movie_id) => {
    const options = {
      method: 'GET',
      url: `https://api.themoviedb.org/3/movie/${movie_id}/credits?language=en-US`,
      headers: {
        accept: 'application/json',
        Authorization: TMDB_API_KEY
      },
    };
  
    try {
      const response = await axios.request(options);
      const crew = response.data.crew; 

      const director = crew.find((member) => member.job === 'Director');
      if (director) {
        return { name: director.name };
      } else {
        throw new Error('Director not found for this movie');
      }
    } catch (error) {
      console.error('Error fetching director:', error.message);
      throw new Error('Failed to fetch director');
    }
  };
  



// Endpoint GET for movie details
/**
 * @swagger
 * /details/{id}:
 *   get:
 *     summary: Get movie details and credits
 *     tags:
 *       - Detail Movies
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Movie ID to get details for
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie details and credits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 details:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     overview:
 *                       type: string
 *                     posterUrl:
 *                       type: string
 *                     backdropUrl:
 *                       type: string
 *                     genre_names:
 *                       type: array
 *                       items:
 *                         type: string
 *                 credits:
 *                   type: object
 *                   properties:
 *                     cast:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           character:
 *                             type: string
 *                     crew:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           job:
 *                             type: string
 *       500:
 *         description: Failed to fetch movie data
 */

  // Endpoint GET untuk mendapatkan data film
  router.get('/details/:id', async (req, res) => {
    const movie_id = req.params.id;
  
    try {
      const [imageBaseUrl, detailsResponse, creditsResponse, director] = await Promise.all([
        getImageBaseUrl(),
        getMovieDetails(movie_id),
        getMovieCredits(movie_id),
        getDirector(movie_id),
      ]);

      const genreNames = mapGenreIdsToNames(detailsResponse.data.genres.map(genre => genre.id));
      const limitedCredits = limitCredits(creditsResponse.data);
  
      const movieData = {
        director: director.name,
        details: {
          ...detailsResponse.data,
          posterUrl: imageBaseUrl + detailsResponse.data.poster_path, 
          backdropUrl: imageBaseUrl + detailsResponse.data.backdrop_path, 
          genre_names: genreNames,
        },
        credits: limitedCredits
      };
  
      res.status(200).json(movieData);
    } catch (error) {
      console.error('Error fetching movie data:', error.message);
      res.status(500).json({ error: 'Failed to fetch movie data' });
    }
  });
  

module.exports = router;
