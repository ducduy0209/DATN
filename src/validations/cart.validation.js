const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCart = {
  body: Joi.object().keys({
    book_id: Joi.string().custom(objectId).required(),
    duration: Joi.string().required(),
    price: Joi.number().required(),
    refer_code: Joi.string(),
  }),
  params: Joi.object().keys({
    book_id: Joi.string().custom(objectId),
  }),
};

const getCarts = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
  params: Joi.object().keys({
    user_id: Joi.string().custom(objectId),
  }),
};

const updateCart = {
  body: Joi.object().keys({
    duration: Joi.string(),
    price: Joi.number(),
    refer_code: Joi.string(),
  }),
  params: Joi.object().keys({
    cartId: Joi.string().custom(objectId).required(),
  }),
};

const deleteCart = {
  params: Joi.object().keys({
    cartId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createCart,
  getCarts,
  updateCart,
  deleteCart,
};
