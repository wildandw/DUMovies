const express = require('express');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();
const cors = require('cors');
const swaggerSetup = require('./swagger');

// Enable CORS
app.use(cors());

swaggerSetup(app);

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const detailRoutes = require('./routes/detailMovies');
const trendingRoutes = require('./routes/trendingMovies');
const watchlistRoutes = require('./routes/watchlistRoutes');
const searchRoutes = require('./routes/searchMovies');
const similarRoutes = require('./routes/similarMovies');
const upcomingRoutes = require('./routes/upcomingMovies');
// Tambahkan route preferences
const preferencesRoutes = require('./routes/preferencesRoutes');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

// Port where the server will run
const PORT = 5000;

// app routes
app.use(authRoutes);
app.use('/movies/', movieRoutes);
app.use('/movies/', detailRoutes);
app.use('/movies/', trendingRoutes);
app.use('/watchlist', watchlistRoutes);
app.use(searchRoutes);
app.use(upcomingRoutes);
app.use('/movies/', similarRoutes);
// Tambahkan preferences routes
app.use('/api', preferencesRoutes); // atau bisa juga app.use(preferencesRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});