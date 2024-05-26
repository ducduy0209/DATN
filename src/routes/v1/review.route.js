const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { reviewValidation } = require('../../validations');
const { reviewController } = require('../../controllers');
const { checkAccessRightBook } = require('../../middlewares/book.middleware');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(auth(), checkAccessRightBook, validate(reviewValidation.createReview), reviewController.createReview)
  .get(auth(), validate(reviewValidation.getReviews), reviewController.getReviews);

router
  .route('/:reviewId')
  .get(auth(), validate(reviewValidation.getReview), reviewController.getReview)
  .patch(auth(), validate(reviewValidation.updateReview), reviewController.updateReview)
  .delete(auth('admin'), validate(reviewValidation.deleteReview), reviewController.deleteReview);

module.exports = router;
