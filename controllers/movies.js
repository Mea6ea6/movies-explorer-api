/* eslint-disable max-len */
const { HTTP_STATUS_CREATED } = require('http2').constants;
const Movie = require('../models/movie');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');
const InternalServerError = require('../errors/InternalServerError');
const NotFoundError = require('../errors/NotFoundError');

const getMovies = async (req, res, next) => {
  const userId = req.user._id;
  Movie.find({ owner: userId })
    .then((movies) => {
      if (movies) {
        return res.send(movies);
      }
      return next(new NotFoundError('Фильмы не найдены'));
    })
    .catch((error) => next(new NotFoundError(error.message)));
};

const createMovie = async (req, res, next) => {
  const {
    country, director, duration, year, description, image, trailerLink, thumbnail, movieId, nameRU, nameEN,
  } = req.body;
  Movie.create({
    country, director, duration, year, description, image, trailerLink, thumbnail, owner: req.user._id, movieId, nameRU, nameEN,
  })
    .then((movie) => res.status(HTTP_STATUS_CREATED).send({ movie }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при создании фильма'));
      }
      return next(new NotFoundError(error.message));
    });
};

const deleteMovie = async (req, res, next) => {
  const { movieId } = req.params;
  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        return next(new NotFoundError('Фильм по указанному ID не найдена'));
      }
      if (movie.owner.toString() !== req.user._id.toString()) {
        return next(new ForbiddenError('Недостаточно прав для удаления фильма'));
      }
      return movie.deleteOne()
        .then(() => res.send({ message: `Фильм с ID: ${movie._id} была успешно удалена` }))
        .catch(next);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BadRequestError('Передан не валидный ID фильма'));
      }
      if (error.name === 'NotFoundError') {
        return next(new NotFoundError(error.message));
      }
      if (error.name === 'ForbiddenError') {
        return next(new ForbiddenError(error.message));
      }
      return next(new InternalServerError('Ошибка со стороны сервера'));
    });
};

module.exports = {
  getMovies, createMovie, deleteMovie,
};
