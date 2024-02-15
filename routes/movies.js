const movieRouter = require('express').Router();
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');
const {
  createMovieValid, checkMovieIdValid,
} = require('../middlewares/validation');

movieRouter.get('/', getMovies);
movieRouter.post('/', createMovieValid, createMovie);
movieRouter.delete('/:movieId', checkMovieIdValid, deleteMovie);

module.exports = movieRouter;
