const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAffiliate = {
  body: Joi.object().keys({
    user_id: Joi.string().custom(objectId).required(),
    refer_code: Joi.string().required(),
  }),
};

const getAffiliates = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
  params: Joi.object().keys({
    user_id: Joi.string().custom(objectId),
  }),
};

const getAffiliate = {
  params: Joi.object().keys({
    affiliateId: Joi.string().custom(objectId),
  }),
};

const updateAffiliate = {
  body: Joi.object().keys({
    email_receiver: Joi.string().email(),
  }),
  params: Joi.object().keys({
    affiliateId: Joi.string().custom(objectId),
  }),
};

const deleteAffiliate = {
  params: Joi.object().keys({
    affiliateId: Joi.string().custom(objectId),
  }),
};

const clickAffiliate = {
  params: Joi.object().keys({
    code: Joi.string().required(),
  }),
};

module.exports = {
  createAffiliate,
  getAffiliates,
  getAffiliate,
  updateAffiliate,
  deleteAffiliate,
  clickAffiliate,
};
