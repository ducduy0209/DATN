const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCoupon = {
  body: Joi.object().keys({
    code: Joi.string().required().trim(),
    percent: Joi.number().required(),
    description: Joi.string().required().trim(),
    quantity: Joi.number().required(),
    minimum_value: Joi.number().required(),
    isPublic: Joi.boolean(),
    isActive: Joi.boolean(),
    maxPerPerson: Joi.number(),
    expiredAt: Joi.string().allow(null).empty([null, '', 'null']),
  }),
};

const getCoupons = {
  query: Joi.object().keys({
    isActive: Joi.boolean(),
    code: Joi.string().trim(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCoupon = {
  params: Joi.object().keys({
    couponId: Joi.string().custom(objectId),
  }),
};

const updateCoupon = {
  body: Joi.object().keys({
    code: Joi.string().trim(),
    percent: Joi.number(),
    description: Joi.string().trim(),
    quantity: Joi.number(),
    minimum_value: Joi.number(),
    isPublic: Joi.boolean(),
    isActive: Joi.boolean(),
    maxPerPerson: Joi.number(),
    expiredAt: Joi.string().allow(null).empty([null, '', 'null']),
  }),
  params: Joi.object().keys({
    couponId: Joi.string().custom(objectId),
  }),
};

const deleteCoupon = {
  params: Joi.object().keys({
    couponId: Joi.string().custom(objectId),
  }),
};

const applyCoupon = {
  body: Joi.object().keys({
    code: Joi.string().required().trim(),
    price: Joi.number().required(),
  }),
};

module.exports = {
  createCoupon,
  getCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
};
