const httpStatus = require('http-status');
const pick = require('../utils/pick');
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
  const filter = pick(req.query, ['user_id']);
  const result = await cartService.getCarts(filter);
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
  await cartService.deleteCartById(req.params.cartId);
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
