/* eslint-disable max-len */
const Movie = require('../models/movie');
const BadRequestError = require('../errors/BadRequestError');
const InternalServerError = require('../errors/InternalServerError');
const NotFoundError = require('../errors/NotFoundError');
const UserRightsError = require('../errors/UserRightsError');

const getMovies = async (req, res, next) => {
  Movie.find({})
    .then((movies) => {
      res.status(200).send(movies);
    })
    .catch(() => next(new InternalServerError('Ошибка со стороны сервера')));
};

const createMovie = async (req, res, next) => {
  const {
    country, director, duration, year, description, image, trailerLink, thumbnail, nameRU, nameEN,
  } = req.body;
  Movie.create({
    country, director, duration, year, description, image, trailerLink, thumbnail, owner: req.user._id, nameRU, nameEN,
  })
    .then((movie) => res.status(201).send({ movie }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при создании фильма'));
      }
      return next(new InternalServerError('Ошибка со стороны сервера'));
    });
};

const deleteMovie = async (req, res, next) => {
  const { movieId } = req.params;
  Movie.findById(movieId)
    .then((deletedMovie) => {
      if (!deletedMovie) {
        return next(new NotFoundError('Фильм по указанному ID не найдена'));
      }
      if (deletedMovie.owner.toString() !== req.user._id.toString()) {
        return next(new UserRightsError('Недостаточно прав для удаления фильма'));
      }
      return deletedMovie.deleteOne()
        .then(() => res.send({ message: `Фильм с ID: ${deletedMovie._id} была успешно удалена` }))
        .catch(next);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BadRequestError('Передан не валидный ID фильма'));
      }
      return next(new InternalServerError('Ошибка со стороны сервера'));
    });
};

module.exports = {
  getMovies, createMovie, deleteMovie,
};
