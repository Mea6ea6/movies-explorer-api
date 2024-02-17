/* eslint-disable max-len */
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

const validateURL = (value) => {
  if (!validator.isURL(value, { require_protocol: true })) {
    throw new Error('Неправильный формат ссылки');
  }
  return value;
};

const loginUserValid = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const createUserValid = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
  }),
});

const updateUserInfoValid = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required().min(2).max(30),
  }),
});

const createMovieValid = celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.string().required(),
    year: Joi.string().required(),
    description: Joi.string().required().min(2).max(30),
    image: Joi.string().required().custom(validateURL),
    trailerLink: Joi.string().required().custom(validateURL),
    thumbnail: Joi.string().required().custom(validateURL),
    movieId: Joi.string().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
});

const checkMovieIdValid = celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().required().hex().length(24)
      .messages({
        'string.length': 'Ошибка валидации ID карточки',
        'string.alphanum': 'Ошибка валидации ID карточки',
        'any.required': 'Поле является обязательным',
      }),
  }),
});

module.exports = {
  loginUserValid, createUserValid, updateUserInfoValid, createMovieValid, checkMovieIdValid,
};
