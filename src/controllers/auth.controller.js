const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService } = require('../services');
const { emailJob, affiliateJob } = require('../jobs');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  affiliateJob.create('create-affiliate-table', { user }).save();
  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: { user, tokens },
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { user, tokens },
  });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).json({
    status: 'success',
  });
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { ...tokens },
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  emailJob.create('send-forgot-password', { email: req.body.email }).save();
  res.status(httpStatus.NO_CONTENT).json({
    status: 'success',
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).json({
    status: 'success',
  });
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  emailJob.create('send-verify-email', { user: req.user }).save();
  res.status(httpStatus.NO_CONTENT).json({
    status: 'success',
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).json({
    status: 'success',
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
