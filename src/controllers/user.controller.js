const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, tokenService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: { user },
  });
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { result },
  });
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { user },
  });
});

const updateUser = catchAsync(async (req, res) => {
  const data = await userService.updateUserById(req.params.userId, req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { data },
  });
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).json({
    status: 'success',
  });
});

const deleteMe = catchAsync(async (req, res) => {
  await userService.deactivateUserById(req.user._id);
  res.status(httpStatus.NO_CONTENT).json({
    status: 'success',
  });
});

const updateMyPassword = catchAsync(async (req, res) => {
  const user = await userService.updateMyPasswordById(req.user._id, req.body);
  const tokens = await tokenService.generateAuthTokens(user);

  res.status(httpStatus.OK).json({
    status: 'success',
    data: { user, tokens },
  });
});

const likeBook = catchAsync(async (req, res) => {
  const message = await userService.likeBook(req.user._id, req.body.book_id);

  res.status(httpStatus.OK).json({
    status: 'success',
    message,
  });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  deleteMe,
  updateMyPassword,
  likeBook,
};
