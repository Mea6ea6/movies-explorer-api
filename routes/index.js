const router = require('express').Router();
const userRouter = require('./users');
const movieRouter = require('./movies');
const auth = require('../middlewares/auth');

router.use('/users', auth, userRouter);
router.use('/movies', auth, movieRouter);

module.exports = router;
