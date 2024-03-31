const { Book } = require('../models');
// const ApiError = require('../utils/ApiError');

const queryBooks = async (filter, options) => {
  const users = await Book.paginate(filter, options);
  return users;
};

module.exports = {
  queryBooks,
};
