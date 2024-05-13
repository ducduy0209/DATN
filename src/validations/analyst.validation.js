const Joi = require('joi');
// const { objectId } = require('./custom.validation');

const getAnalysts = {
  query: Joi.object().keys({
    time: Joi.string().required(),
  }),
};

module.exports = {
  getAnalysts,
};
