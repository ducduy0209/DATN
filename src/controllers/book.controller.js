const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bookService } = require('../services');

const configFilter = ({ search = '', language = '', fromPrice = 0, toPrice = 0, slug = '' }) => {
  const filter = {};

  if (search) {
    filter.$or = [{ title: new RegExp(search, 'i') }, { author: new RegExp(search, 'i') }];
  }

  if (language) {
    filter.language = language;
  }

  if (slug) {
    filter.slug = slug;
  }

  if (fromPrice || toPrice) {
    filter.price = {};

    if (fromPrice) {
      filter.price.$gte = fromPrice;
    }

    if (toPrice) {
      filter.price.$lte = toPrice;
    }
  }

  return filter;
};

const getBooks = catchAsync(async (req, res) => {
  const filterOriginal = pick(req.query, ['search', 'fromPrice', 'toPrice', 'language', 'slug']);
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
  const data = await bookService.updateBookById(req, req.params.bookId, req.body);
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

const createCheckoutBooks = catchAsync(async (req, res) => {
  const { books } = req.body;
  const link = await bookService.createCheckoutBooks(res, books, req.user._id);
  res.status(httpStatus.OK).json({
    status: 'success',
    link,
  });
});

const confirmCheckoutBooks = catchAsync(async (req, res) => {
  const { paymentId, PayerID, userId } = req.query;
  await bookService.confirmCheckoutBooks(paymentId, PayerID, userId);

  // Todo: Redirect to success page
  res.status(httpStatus.OK).redirect('http://localhost:3002/api/payment?status=success');
});

const previewBook = catchAsync(async (req, res) => {
  const pdfBytes = await bookService.getPreviewBook(req.params.book_id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', pdfBytes.length);
  res.end(pdfBytes);
});

const readBook = catchAsync(async (req, res) => {
  const stream = await bookService.readBook(req.params.book_id);

  if (req.access_book.status === 'denied') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You have not permission to access this book');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');

  stream.pipe(res);
});

const downloadBook = catchAsync(async (req, res) => {
  if (req.access_book.status === 'denied' || req.access_book.status === 'view') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không thể tải sách về!');
  }

  const pdfBytes = await bookService.downloadBook(req.params.book_id);
  const book = await bookService.getBookById(req.params.book_id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', pdfBytes.length);
  res.setHeader('Content-Disposition', `attachment; filename=${book.slug}.pdf`);
  res.end(pdfBytes);
});

const getBooksWithGenres = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const books = await bookService.getBooksWithGenres(req.params.genre, options);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { books },
  });
});

const getBookBySlug = catchAsync(async (req, res) => {
  const book = await bookService.getBookBySlug(req.params.slug);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: { book },
  });
});

const increaseView = catchAsync(async (req, res) => {
  await bookService.increaseView(req.params.bookId);
  res.status(httpStatus.OK).json({
    status: 'success',
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
  getBookBySlug,
  increaseView,
  downloadBook,
};
