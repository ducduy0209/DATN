const httpStatus = require('http-status');
const { Review } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Creates a new review if the user has not already reviewed the book.
 *
 * @param {Object} reviewBody - The body of the review containing book_id and other details
 * @param {string} userId - The ID of the user creating the review
 * @return {Promise<Review>} The newly created review
 */
const createReview = async (reviewBody, userId) => {
  const review = await Review.findOne({ user_id: userId, book_id: reviewBody.book_id });
  if (review) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You have already reviewed this book');
  }
  return Review.create({ ...reviewBody, user_id: userId });
};

/**
 * Retrieves reviews based on the provided filter and options.
 *
 * @param {Object} filter - The filter to apply to the reviews.
 * @param {Object} options - The options to customize the query.
 * @return {Array} The reviews that match the filter.
 */
const getReviews = async (filter, options) => {
  return Review.paginate(filter, options);
};

/**
 * Retrieves a review by its ID.
 *
 * @param {string} reviewId - The ID of the review to retrieve.
 * @return {Promise<Review>} The retrieved review.
 */
const getReviewById = async (reviewId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }
  return review;
};

/**
 * Updates a review by its ID.
 *
 * @param {string} reviewId - The ID of the review to update
 * @param {Object} updatedReview - The updated review object
 * @return {Promise<Object>} The updated review
 */
const updateReviewById = async (reviewId, userId, updatedReview) => {
  const review = await Review.findOne({ _id: reviewId, user_id: userId });
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }
  if (review.isAdjusted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Review has already been adjusted');
  }
  Object.assign(review, updatedReview, { isAdjusted: true });
  await review.save();
  return review;
};

/**
 * Deletes a review by its ID.
 *
 * @param {string} reviewId - The ID of the review to be deleted
 * @return {Promise} The deleted review
 */
const deleteReviewById = async (reviewId) => {
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }
  await review.remove();
  return review;
};
module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReviewById,
  deleteReviewById,
};
