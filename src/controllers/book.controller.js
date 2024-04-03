const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bookService } = require('../services');

const configFilter = (filter) => {
  const { search = '', genre = '', fromPrice = 0, toPrice = 0 } = filter;
  const adjustedFilter = {};
  if (search) {
    adjustedFilter.$text = { $search: search.trim() };
  }
  if (genre) {
    adjustedFilter.genre = genre;
  }

  if (+fromPrice !== 0 || +toPrice !== 0) {
    adjustedFilter.prices = {
      $elemMatch: {
        duration: '1 month',
        price: { $gte: +fromPrice, $lte: +toPrice },
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
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { result },
  });
});

const createBook = catchAsync(async (req, res) => {
  const book = await bookService.createBook(req, req.body);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: { book },
  });
});

const getBook = catchAsync(async (req, res) => {
  const book = await bookService.getBookById(req.params.bookId);
  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { book },
  });
});

const updateBook = catchAsync(async (req, res) => {
  const data = await bookService.updateUserById(req, req.params.bookId, req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { data },
  });
});

const deleteBook = catchAsync(async (req, res) => {
  await bookService.deleteBookById(req.params.bookId);
  res.status(httpStatus.NO_CONTENT).json({
    status: 'success',
  });
});

const createCheckoutBook = (req, res) => {
  bookService.createCheckoutBook(res, req.params.bookId, req.query.duration);
};

const confirmCheckoutBook = catchAsync(async (req, res) => {
  const { paymentId, PayerID, duration, bookId, price } = req.query;
  await bookService.confirmCheckoutBook(paymentId, PayerID, duration, bookId, price, '65feb58c3cb1eaa1eed971af');

  // Todo: Redirect to success page
  res.status(httpStatus.OK).redirect('/');
});

module.exports = {
  getBooks,
  createBook,
  getBook,
  deleteBook,
  updateBook,
  createCheckoutBook,
  confirmCheckoutBook,
};
