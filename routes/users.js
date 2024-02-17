const userRouter = require('express').Router();
const { getUserInfo, updateUserInfo } = require('../controllers/users');
const {
  updateUserInfoValid,
} = require('../middlewares/validation');

userRouter.get('/me', getUserInfo);
userRouter.patch('/me', updateUserInfoValid, updateUserInfo);

module.exports = userRouter;
