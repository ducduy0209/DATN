const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().required().valid('user', 'admin'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      isEmailVerified: Joi.boolean(),
      image: Joi.string(),
      isActive: Joi.boolean(),
      role: Joi.string().valid('user', 'admin'),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateMyPassword = {
  body: Joi.object().keys({
    newPassword: Joi.string().required(),
    currentPassword: Joi.string().required(),
  }),
};

const updateMe = {
  body: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    image: Joi.string(),
  }),
};

const likeBook = {
  body: Joi.object().keys({
    book_id: Joi.string().custom(objectId).required(),
  }),
};

const getMyBooks = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMyPassword,
  updateMe,
  likeBook,
  getMyBooks,
};
