const httpStatus = require('http-status');
const { Book } = require('../models');
const paypal = require('../config/paypal');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const { createRecord } = require('./borrow_record.service');

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

/**
 * Create a checkout book with the given bookId and duration.
 *
 * @param {Object} res - The response object
 * @param {string} bookId - The ID of the book
 * @param {number} duration - The duration of the book rental
 * @return {Promise<void>} A promise that resolves with the checkout process
 */
const createCheckoutBook = async (res, bookId, duration) => {
  const book = await getBookById(bookId);
  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }

  const formatedDuration = duration.split('-').join(' ');
  const { price } = book.prices.find((item) => item.duration === formatedDuration);
  const createPaymentJson = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: `http://localhost:3000/v1/books/payment-success?bookId=${bookId}&duration=${duration}&price=${price.toFixed(
        2
      )}`,
      cancel_url: 'http://localhost:3000/v1/books/payment-cancel',
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: book.title,
              sku: 'ebook',
              price: price.toFixed(2),
              currency: 'USD',
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: 'USD',
          total: price.toFixed(2),
        },
        description: 'Make payment to experience extremely interesting and interesting books. Thank you!',
      },
    ],
  };

  paypal.payment.create(createPaymentJson, function (error, payment) {
    if (error) {
      logger.error(error);
      res.status(500).send({ error: error.toString() });
    } else {
      for (let i = 0; i < payment.links.length; i += 1) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
};

/**
 * Executes a PayPal payment for book checkout.
 *
 * @param {string} paymentId - The ID of the PayPal payment.
 * @param {string} PayerID - The ID of the Payer.
 * @return {Promise<void>} - A promise that resolves when the payment is executed successfully or rejects with an error if there is any.
 */
const confirmCheckoutBook = async (paymentId, PayerID, duration, bookId, price, userId) => {
  const executePaymentJson = {
    payer_id: PayerID,
  };

  paypal.payment.execute(paymentId, executePaymentJson, async function (error, payment) {
    if (error) {
      logger.error(error.response);
      throw error;
    } else if (payment.state === 'approved') {
      await createRecord({
        book_id: bookId,
        user_id: userId,
        price,
        duration,
      });
    }
  });
};

module.exports = {
  queryBooks,
  createBook,
  getBookById,
  deleteBookById,
  updateUserById,
  createCheckoutBook,
  confirmCheckoutBook,
};
