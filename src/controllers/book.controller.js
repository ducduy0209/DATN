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
  const book = await bookService.getBook(req.params.bookId);
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

const createCheckoutBooks = (req, res) => {
  const { books } = req.body;
  bookService.createCheckoutBooks(res, books);
};

const confirmCheckoutBooks = catchAsync(async (req, res) => {
  const { paymentId, PayerID } = req.query;
  await bookService.confirmCheckoutBooks(paymentId, PayerID, req.user._id || req.user.id);

  // Todo: Redirect to success page
  res.status(httpStatus.OK).redirect('/');
});

const previewBook = catchAsync(async (req, res) => {
  const pdfBytes = await bookService.getPreviewBook(req.params.book_id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', pdfBytes.length);
  res.end(pdfBytes);
});

const readBook = catchAsync(async (req, res) => {
  const stream = bookService.readBook(req.params.book_id);

  if (req.access_book.status === 'denied') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You have not permission to access this book');
  }

  // Todo: Implement when build UI (have 2 status: view - borrow and download - buy)
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');

  stream.pipe(res);
});

const getBooksWithGenres = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const books = await bookService.getBooksWithGenres(req.params.genre, options);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { books },
  });
});

module.exports = {
  getBooks,
  createBook,
  getBook,
  deleteBook,
  updateBook,
  createCheckoutBooks,
  confirmCheckoutBooks,
  previewBook,
  readBook,
  getBooksWithGenres,
};
