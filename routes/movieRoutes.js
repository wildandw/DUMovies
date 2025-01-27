const express = require('express');
const axios = require('axios');
const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Fungsi untuk memanggil API berdasarkan genre
const fetchMoviesByGenres = async (genres) => {
  const url = `https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${genres}`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: TMDB_API_KEY
    }
  };

  const response = await axios.get(url, options);
  return response.data;
};

// Pemetaan mood ke genre
const moodMapping = {
  "Sad": [18, 27, 53], // Drama, Horror, Thriller
  "Romantic": [10749, 35], // Romance, Comedy
  "Relaxed": [878, 16], // Science Fiction, Animation
  "Happy": [28, 35, 16] // Action, Comedy, Animation
};

// Pemetaan genre ke ID
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

/**
 * @swagger
 * /movies/recommend:
 *   post:
 *     summary: Get movie recommendations based on mood and genre
 *     tags:
 *       - Movies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mood:
 *                 type: string
 *                 description: The mood for the movie recommendation (e.g., "Sad", "Romantic")
 *               genre1:
 *                 type: string
 *                 description: The first genre for the recommendation (e.g., "Action", "Comedy")
 *               genre2:
 *                 type: string
 *                 description: The second genre for the recommendation (e.g., "Drama", "Horror")
 *     responses:
 *       200:
 *         description: A list of recommended movies
 *         content:
 *           application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mood:
 *                 type: string
 *               selectedGenres:
 *                 type: array
 *                 items:
 *                   type: string
 *               movies:
 *                 type: object
 *                 properties:
 *                   results:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                         genre_names:
 *                           type: array
 *                           items:
 *                             type: string
 *       400:
 *         description: Invalid input, missing mood or genres
 *       500:
 *         description: Error fetching movies
 */
router.post('/recommend', async (req, res) => {
  const { mood, genre1, genre2 } = req.body;

  // Validasi input
  if (!mood || !genre1 || !genre2) {
    return res.status(400).json({ message: 'Mood and two genres are required' });
  }

  // Ambil genre yang sesuai dengan mood (case-insensitive)
  const normalizedMood = mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase();
  const moodGenres = moodMapping[normalizedMood];
  
  if (!moodGenres) {
    return res.status(400).json({ message: 'Invalid mood' });
  }

  // Validasi genre berdasarkan mood
  const genreId1 = genreMapping[genre1];
  const genreId2 = genreMapping[genre2];

  if (!genreId1 || !genreId2) {
    return res.status(400).json({ message: 'Invalid genre name(s)' });
  }

  // Gabungkan genre dari mood dan genre pilihan user
  const combinedGenres = Array.from(new Set([...moodGenres, genreId1, genreId2])).join(',');

  try {
    const movies = await fetchMoviesByGenres(combinedGenres);
    const moviesWithGenreNames = movies.results.map(movie => {
      const genreNames = movie.genre_ids.map(id => {
        return Object.keys(genreMapping).find(key => genreMapping[key] === id);
      });

      return {
        ...movie,
        genre_names: genreNames // Menambahkan nama genre ke setiap movie
      };
    });

    res.json({
      mood,
      selectedGenres: [genre1, genre2],
      allGenres: [...moodGenres, genreId1, genreId2],
      movies: {
        ...movies,
        results: moviesWithGenreNames
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching movies' });
  }
});

module.exports = router;
