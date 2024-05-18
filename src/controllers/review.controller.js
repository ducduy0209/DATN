const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { reviewService } = require('../services');
const { bookJob } = require('../jobs');

const createReview = catchAsync(async (req, res) => {
  if (req.access_book.status === 'denied') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Please buy/borrow this book before making a review');
  }
  const review = await reviewService.createReview(req.body, req.user._id);
  bookJob.create('update-rating-book', { review }).save();
  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: review,
  });
});

const getReviews = catchAsync(async (req, res) => {
  const filter = pick(req.params, ['user_id', 'book_id']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const results = await reviewService.getReviews(filter, options);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: results,
  });
});

const getReview = catchAsync(async (req, res) => {
  const review = await reviewService.getReviewById(req.params.reviewId);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: review,
  });
});

const updateReview = catchAsync(async (req, res) => {
  const review = await reviewService.updateReviewById(req.params.reviewId, req.user._id, req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: review,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  await reviewService.deleteReviewById(req.params.reviewId);
  res.status(httpStatus.OK).json({
    status: 'success',
  });
});

module.exports = {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
};
