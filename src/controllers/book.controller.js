const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bookService } = require('../services');

const getBooks = catchAsync((req, res) => {});

module.exports = {
  getBooks,
};
