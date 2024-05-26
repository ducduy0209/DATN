const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createGenre = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    priority: Joi.number(),
  }),
};

const updateGenre = {
  body: Joi.object().keys({
    name: Joi.string(),
    priority: Joi.number(),
  }),
  params: Joi.object().keys({
    genreId: Joi.string().custom(objectId).required(),
  }),
};

const deleteGenre = {
  params: Joi.object().keys({
    genreId: Joi.string().custom(objectId).required(),
  }),
};

const getGenre = {
  params: Joi.object().keys({
    genreId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createGenre,
  updateGenre,
  deleteGenre,
  getGenre,
};
