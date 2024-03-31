const Joi = require('joi');

const getBooks = {
  query: Joi.object().keys({
    search: Joi.string(),
    genre: Joi.string(),
    fromPrice: Joi.number().integer(),
    toPrice: Joi.number().integer(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  getBooks,
};
