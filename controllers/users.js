const MONGO_DUBLICATE_ERROR_CODE = 11000;
const { HTTP_STATUS_CREATED } = require('http2').constants;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const InternalServerError = require('../errors/InternalServerError');
const NotFoundError = require('../errors/NotFoundError');
const UnauthorizedError = require('../errors/UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

const createUser = async (req, res, next) => {
  const {
    email, name,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hashedPassword) => User.create({
      email, password: hashedPassword, name,
    }))
    .then((user) => res.status(HTTP_STATUS_CREATED).send({ user }))
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else if (
        error.code === MONGO_DUBLICATE_ERROR_CODE || error.name === 'MongoServerError'
      ) {
        next(new ConflictError('При обновлении профиля указан email, который уже существует на сервере'));
      } else if (error.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else if (error.name === 'NotFoundError') {
        next(new NotFoundError(error.message));
      } else {
        next(error);
      }
    });
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    await bcrypt.compare(password, user.password);
    const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
    return res.cookie('jwt', token, {
      httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, secure: true, sameSite: 'None',
    }).send({ message: 'Успешная авторизация' });
  } catch (error) {
    return next(new NotFoundError('Пользователь с переданными данными не найден'));
  }
};

const logoutUser = async (req, res, next) => {
  try {
    return res.clearCookie('jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    }).send({ message: 'Успешный выход' });
  } catch (error) {
    return next(new InternalServerError('Ошибка со стороны сервера'));
  }
};

const getUserInfo = async (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        return res.send({ user });
      }
      return next(new UnauthorizedError('Пользователь не авторизован'));
    })
    .catch(() => next(new InternalServerError('Ошибка со стороны сервера')));
};

const updateUserInfo = (req, res, next) => {
  const userId = req.user._id;
  const { name, email } = req.body;
  User.findByIdAndUpdate(userId, { name, email }, { new: true, runValidators: true })
    .orFail(() => new NotFoundError('Пользователь по указанному _id не найден'))
    .then((user) => res.send({ user }))
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else if (
        error.code === MONGO_DUBLICATE_ERROR_CODE || error.name === 'MongoServerError'
      ) {
        next(new ConflictError('При обновлении профиля указан email, который уже существует на сервере'));
      } else if (error.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else if (error.name === 'NotFoundError') {
        next(new NotFoundError(error.message));
      } else {
        next(error);
      }
    });
};

module.exports = {
  createUser, loginUser, logoutUser, getUserInfo, updateUserInfo,
};
