const httpStatus = require('http-status');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { cartService } = require('../services');

const createCart = catchAsync(async (req, res) => {
  if (!req.body.book_id) req.body.book_id = req.params.book_id;
  await cartService.addToCart(req.body, req.user._id);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    message: 'Successfully added cart',
  });
});

const getCarts = catchAsync(async (req, res) => {
  const userId = req.query.user_id || req.user._id;
  const result = await cartService.getCarts({ user_id: userId });
  res.status(httpStatus.OK).json({
    status: 'success',
    data: result,
  });
});

const updateCart = catchAsync(async (req, res) => {
  await cartService.updateCartById(req.params.cartId, req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
  });
});

const deleteCart = catchAsync(async (req, res) => {
  const userId = req.query.user_id || req.user._id;
  await cartService.deleteCartById(req.params.cartId, userId);
  res.status(httpStatus.OK).json({
    status: 'success',
  });
});

module.exports = {
  createCart,
  getCarts,
  updateCart,
  deleteCart,
};
