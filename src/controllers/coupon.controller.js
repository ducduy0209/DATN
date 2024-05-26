const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { couponService } = require('../services');

const createCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: coupon,
  });
});

const getCoupons = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['isActive', 'code']);
  if (filter.code) {
    filter.code = new RegExp(filter.code, 'i');
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const results = await couponService.getCoupons(filter, options);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: results,
  });
});

const getCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.getCoupon(req.params.couponId);
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found');
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    data: coupon,
  });
});

const updateCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.updateCoupon(req.params.couponId, req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: coupon,
  });
});

const deleteCoupon = catchAsync(async (req, res) => {
  await couponService.deleteCoupon(req.params.couponId);
  res.status(httpStatus.OK).json({
    status: 'success',
  });
});

const applyCoupon = catchAsync(async (req, res) => {
  const result = await couponService.applyCoupon(req.user._id, req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: result,
  });
});

module.exports = {
  createCoupon,
  getCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
};
