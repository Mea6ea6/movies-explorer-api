const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AuthorizationError = require('../errors/AuthorizationError');
const BadRequestError = require('../errors/BadRequestError');
const DublicateError = require('../errors/DublicateError');
const InternalServerError = require('../errors/InternalServerError');

const { NODE_ENV, JWT_SECRET } = process.env;

const createUser = async (req, res, next) => {
  const {
    email, name,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hashedPassword) => User.create({
      email, password: hashedPassword, name,
    }))
    .then((user) => res.status(201).send({ user }))
    .catch((error) => {
      if (error.code === 11000) {
        return next(new DublicateError('Пользователь с таким email уже существует.'));
      }
      if (error.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      }
      return next(new InternalServerError('Ошибка со стороны сервера'));
    });
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AuthorizationError('Неправильные почта или пароль'));
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new AuthorizationError('Неправильные почта или пароль'));
    }
    const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
    return res.cookie('jwt', token, {
      httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, secure: true, sameSite: 'None',
    }).send({ message: 'Успешная авторизация' });
  } catch (error) {
    return next(new InternalServerError('Ошибка со стороны сервера'));
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
      if (!user) {
        return next(new AuthorizationError('Пользователь не авторизован'));
      }
      return res.send({ user });
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BadRequestError('Переданы невалидный ID'));
      }
      return next(new InternalServerError('Ошибка со стороны сервера'));
    });
};

const updateUserInfo = (req, res, next) => {
  const userId = req.user._id;
  const { name, email } = req.body;
  User.findByIdAndUpdate(userId, { name, email }, { new: true, runValidators: true })
    .then((user) => res.send({ user }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      }
      return next(new InternalServerError('Ошибка со стороны сервера'));
    });
};

module.exports = {
  createUser, loginUser, logoutUser, getUserInfo, updateUserInfo,
};
