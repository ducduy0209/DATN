const httpStatus = require('http-status');
const { Coupon, CouponUsage } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Creates a new coupon.
 *
 * @param {Object} couponBody - The data for the new coupon.
 * @param {string} couponBody.code - The code of the coupon.
 * @throws {ApiError} If the coupon code already exists.
 * @return {Promise<Coupon>} The newly created coupon.
 */
const createCoupon = async (couponBody) => {
  if (await Coupon.isCouponTaken(couponBody.code)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon already exist');
  }
  return Coupon.create(couponBody);
};

/**
 * Retrieves coupons based on the provided filter and options.
 *
 * @param {Object} filter - The filter to apply to the coupons.
 * @param {Object} options - The options to customize the query.
 * @return {Promise<Array>} A promise that resolves to an array of coupons that match the filter.
 */
const getCoupons = async (filter, options) => {
  return Coupon.paginate(filter, options);
};

/**
 * Retrieves a coupon by its ID.
 *
 * @param {string} couponId - The ID of the coupon to retrieve.
 * @return {Promise<Coupon>} A promise that resolves to the coupon with the given ID, or null if not found.
 */
const getCoupon = async (couponId) => {
  return Coupon.findById(couponId);
};

/**
 * Updates a coupon with the given ID using the provided update body.
 *
 * @param {string} couponId - The ID of the coupon to update.
 * @param {Object} updateBody - The fields to update on the coupon.
 * @return {Promise<Coupon>} A promise that resolves to the updated coupon.
 * @throws {ApiError} If the coupon with the given ID is not found.
 */
const updateCoupon = async (couponId, updateBody) => {
  const coupon = await getCoupon(couponId);
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found');
  }
  Object.assign(coupon, updateBody);
  return coupon.save();
};

/**
 * Deletes a coupon by its ID.
 *
 * @param {string} couponId - The ID of the coupon to delete.
 * @return {Promise<void>} A promise that resolves when the coupon is successfully deleted.
 * @throws {ApiError} If the coupon with the given ID is not found.
 */
const deleteCoupon = async (couponId) => {
  const coupon = await getCoupon(couponId);
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found');
  }
  return coupon.remove();
};

const applyCoupon = async (userId, { price, code }) => {
  const coupon = await Coupon.findOne({ code });
  if (!coupon) throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found');
  if (coupon.expiredAt && coupon.expiredAt < new Date()) throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon is expired');
  if (price < coupon.minimum_value) throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon is below minimum value');
  if (coupon.remaining_amount < 1) throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon is out of stock');
  const usage = await CouponUsage.findOne({ code, userId });
  if (usage && usage.numberOfUses >= coupon.maxPerPerson)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon is already used');
  const priceAfterSale = price - (price * coupon.percent) / 100;
  return { price, priceAfterSale };
};

module.exports = {
  createCoupon,
  getCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
};
