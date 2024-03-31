const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bookService } = require('../services');

const configFilter = (filter) => {
  const { search = '', genre = '', fromPrice = 0, toPrice = 0 } = filter;
  const adjustedFilter = {};
  if (search) {
    adjustedFilter.$text = { $search: search.trim() };
  }
  if (genre) {
    adjustedFilter[genre] = genre;
  }

  if (+fromPrice !== 0 && +toPrice !== 0) {
    adjustedFilter.prices = {
      $elemMatch: {
        duration: '1 month',
        price: { $gt: +fromPrice, $lt: +toPrice },
      },
    };
  }

  return adjustedFilter;
};

const getBooks = catchAsync(async (req, res) => {
  const filterOriginal = pick(req.query, ['search', 'genre', 'fromPrice', 'toPrice']);
  const filter = configFilter(filterOriginal);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await bookService.queryBooks(filter, options);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: { result },
  });
});

module.exports = {
  getBooks,
};
