const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createReview = {
  body: Joi.object().keys({
    book_id: Joi.string().custom(objectId).required(),
    rating: Joi.number().required(),
    comment: Joi.string().required(),
  }),
};

const getReviews = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
  params: Joi.object().keys({
    book_id: Joi.string().custom(objectId),
    user_id: Joi.string().custom(objectId),
  }),
};

const getReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().custom(objectId),
  }),
};

const updateReview = {
  body: Joi.object().keys({
    rating: Joi.number(),
    comment: Joi.string(),
  }),
  params: Joi.object().keys({
    reviewId: Joi.string().custom(objectId),
  }),
};

const deleteReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
};
