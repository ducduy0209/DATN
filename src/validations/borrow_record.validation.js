const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getAllRecords = {
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

const createRecord = {
  body: Joi.object().keys({
    book_id: Joi.string().custom(objectId).required(),
    user_id: Joi.string().custom(objectId).required(),
    duration: Joi.string().required(),
    price: Joi.number().required(),
  }),
};

const getRecord = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getAllRecords,
  createRecord,
  getRecord,
};
