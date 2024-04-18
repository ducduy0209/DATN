const httpStatus = require('http-status');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { Book } = require('../models');
const paypal = require('../config/paypal');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const { createRecord } = require('./borrow_record.service');
const cache = require('../utils/cache');
const { bookJob } = require('../jobs');

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

const createJobPromise = (type, data) => {
  return new Promise((resolve, reject) => {
    const job = bookJob.create(type, data).save((err) => {
      if (err) reject(err);
      else resolve(job.id);
    });
  });
};

/**
 * Get book by id
 * @param {ObjectId} id
 * @returns {Promise<Book>}
 */
const getBookById = async (id) => {
  const cachedBooks = await cache.getCache(id);
  if (!cachedBooks) {
    const book = await Book.findById(id);
    await cache.setCache(id, book);
    return book;
  }
  return cachedBooks;
};

const getBook = async (id) => {
  const book = await getBookById(id);
  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }
  createJobPromise('increase-access-time-book', { bookId: id });

  return book;
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
 * Creates a checkout for a list of books with their corresponding durations.
 *
 * @param {object} res - The response object to send back the result
 * @param {array} booksDetails - An array of objects containing bookId and duration
 * @return {void}
 */
const createCheckoutBooks = async (res, booksDetails) => {
  let totalAmount = 0;
  const items = await Promise.all(
    booksDetails.map(async ({ bookId, duration }) => {
      const book = await getBookById(bookId);
      if (!book) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
      }

      const { price } = book.prices.find((item) => item.duration === duration);
      if (!price) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Price for specified duration not found');
      }

      totalAmount += price;
      return {
        name: book.title,
        sku: `${bookId}-${duration}`,
        price: price.toFixed(2),
        currency: 'USD',
        quantity: 1,
      };
    })
  );

  const createPaymentJson = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'http://localhost:3000/v1/books/payment-success',
      cancel_url: 'http://localhost:3000/v1/books/payment-cancel',
    },
    transactions: [
      {
        item_list: {
          items,
        },
        amount: {
          currency: 'USD',
          total: totalAmount.toFixed(2),
        },
        description: 'Make payment to experience extremely interesting and valuable books. Thank you!',
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
          return;
        }
      }
      res.status(500).send({ error: 'No approval URL found' });
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
const confirmCheckoutBooks = async (paymentId, PayerID, userId) => {
  const executePaymentJson = {
    payer_id: PayerID,
  };

  paypal.payment.execute(paymentId, executePaymentJson, async function (error, payment) {
    if (error) {
      logger.error(error.response);
      throw error;
    } else if (payment.state === 'approved') {
      const promises = payment.transactions[0].item_list.items.map((book) => {
        const splitSku = book.sku.split('-');
        return createRecord({
          book_id: splitSku[0],
          user_id: userId,
          price: book.price,
          duration: splitSku[1],
          payBy: 'paypal',
        });
      });

      await Promise.all(promises);
    }
  });
};

const getPreviewBook = async (bookId) => {
  const book = await getBookById(bookId);
  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }
  const originalPdfPath = path.join(__dirname, '../', 'assets', `${book.digital_content}`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const originalPdfBytes = fs.readFileSync(originalPdfPath);
  const pdfDoc = await PDFDocument.load(originalPdfBytes);

  const newPdfDoc = await PDFDocument.create();
  const pageCount = Math.min(3, pdfDoc.getPageCount());

  for (let i = 0; i < pageCount; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
    newPdfDoc.addPage(copiedPage);
  }

  const pdfBytes = await newPdfDoc.save();
  return pdfBytes;
};

/**
 * Asynchronously reads a book by its ID, and returns a readable stream of the book's content.
 *
 * @param {string} bookId - The ID of the book to be read.
 * @return {ReadableStream} A readable stream of the book's content.
 */
const readBook = async (bookId) => {
  const book = await getBookById(bookId);
  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }
  const originalPdfPath = path.join(__dirname, '../', 'assets', `${book.digital_content}`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const stream = fs.createReadStream(originalPdfPath);

  return stream;
};

module.exports = {
  getBook,
  queryBooks,
  createBook,
  getBookById,
  deleteBookById,
  updateUserById,
  createCheckoutBooks,
  confirmCheckoutBooks,
  getPreviewBook,
  readBook,
};
