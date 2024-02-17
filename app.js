/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const cors = require('cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const router = require('./routes');

const app = express();

const { loginUser, createUser, logoutUser } = require('./controllers/users');
const {
  loginUserValid, createUserValid,
} = require('./middlewares/validation');

const NotFoundError = require('./errors/NotFoundError');
const handleErrors = require('./middlewares/handleErrors');

app.use(
  cors({
    credentials: true,
    origin: [
      'https://domainmalik.students.nomoredomainswork.ru',
      'http://domainmalik.students.nomoredomainswork.ru',
      'https://api.domainmalik.students.nomoredomainswork.ru',
      'http://api.domainmalik.students.nomoredomainswork.ru',
      'http://localhost:3000',
    ],
  }),
);

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;
mongoose.connect(DB_URL);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', loginUserValid, loginUser);
app.post('/signup', createUserValid, createUser);
app.post('/signout', logoutUser);

app.use(router);
router.use('/', (req, res, next) => next(new NotFoundError('Страница не найдена')));

app.use(errorLogger);

app.use(errors());

app.use(handleErrors);

app.listen(PORT);
