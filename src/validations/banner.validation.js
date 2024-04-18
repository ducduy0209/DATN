const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createBanner = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string().required(),
    due_date: Joi.string(),
  }),
};

const getBanners = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    name: Joi.string(),
    isActive: Joi.boolean(),
  }),
};

const getBanner = {
  params: Joi.object().keys({
    bannerId: Joi.string().custom(objectId),
  }),
};

const updateBanner = {
  body: Joi.object().keys({
    name: Joi.string(),
    image: Joi.string(),
    isActive: Joi.boolean(),
    due_date: Joi.string(),
  }),
  params: Joi.object().keys({
    bannerId: Joi.string().custom(objectId),
  }),
};

const deleteBanner = {
  params: Joi.object().keys({
    bannerId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createBanner,
  getBanners,
  getBanner,
  updateBanner,
  deleteBanner,
};
