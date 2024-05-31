const Joi = require('joi');
// const { objectId } = require('./custom.validation');

const getAnalysts = {
  query: Joi.object().keys({
    time: Joi.string(),
    from: Joi.string(),
    to: Joi.string(),
  }),
};

const exportsAnalysts = {
  body: Joi.object().keys({
    issuer: Joi.string(),
    from: Joi.string(),
    to: Joi.string(),
  }),
};

module.exports = {
  getAnalysts,
  exportsAnalysts,
};
