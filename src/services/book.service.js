const httpStatus = require('http-status');
const { Book } = require('../models');
// const paypal = require('../../config/paypal');
// const logger = require('../../config/logger');
const ApiError = require('../utils/ApiError');

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryBooks = async (filter, options) => {
  const users = await Book.paginate(filter, options);
  return users;
};

/**
 * Create a book
 * @param {Object} bookBody
 * @returns {Promise<Book>}
 */
const createBook = async (req, bookBody) => {
  if (await Book.isISBNTaken(bookBody.isbn)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ISBN already exist');
  }
  return Book.create(bookBody);
};

/**
 * Get book by id
 * @param {ObjectId} id
 * @returns {Promise<Book>}
 */
const getBookById = async (id) => {
  return Book.findById(id);
};

/**
 * Create a book
 * @param {Object} bookBody
 * @param {Object} updateBody
 * @returns {Promise<Book>}
 */
const updateUserById = async (req, bookId, updateBody) => {
  const book = await Book.findById(bookId);

  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }

  if (updateBody.isbn && (await Book.isISBNTaken(updateBody.isbn))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ISBN already exist');
  }

  Object.assign(book, updateBody);
  await book.save();
  return book;
};

/**
 * Delete book by id
 * @param {ObjectId} id
 * @returns {Promise<Book>}
 */
const deleteBookById = async (id) => {
  const book = await getBookById(id);
  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }
  await book.remove();
  return book;
};

module.exports = {
  queryBooks,
  createBook,
  getBookById,
  deleteBookById,
  updateUserById,
};
