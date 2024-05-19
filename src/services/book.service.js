const httpStatus = require('http-status');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { Book, Genre, Coupon } = require('../models');
const paypal = require('../config/paypal');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const { createRecord } = require('./borrow_record.service');
const cache = require('../utils/cache');
const { bookJob, affiliateJob, couponJob, cartJob } = require('../jobs');

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
const updateBookById = async (req, bookId, updateBody) => {
  const book = await Book.findById(bookId);

  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }

  if (updateBody.isbn && (await Book.isISBNTaken(updateBody.isbn))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ISBN already exist');
  }

  Object.assign(book, updateBody);
  await cache.setCache(bookId, book);
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
  await cache.delCache(id);
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
const createCheckoutBooks = async (res, booksDetails, userId) => {
  let totalAmount = 0;
  const items = await Promise.all(
    booksDetails.map(async ({ bookId, duration, price, referCode = '', couponCode = '' }) => {
      const book = await Book.findOne({ _id: bookId });
      if (!book) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Sách không tồn tại');
      }

      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode });
        if (coupon) {
          totalAmount += price - (price * coupon.percent) / 100;
        }
      } else {
        totalAmount += price;
      }

      return {
        name: book.title,
        sku: `${bookId}_${duration}_${referCode}_${couponCode}`,
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
      return_url: `http://localhost:3000/v1/books/payment-success?userId=${userId}`,
      cancel_url: 'http://localhost:3002/api/payment?status=cancel',
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

  const createPaymentAsync = (createPaymentJson1) => {
    return new Promise((resolve, reject) => {
      paypal.payment.create(createPaymentJson1, function (error, payment) {
        if (error) {
          logger.error(error);
          reject(error.toString());
        } else {
          // console.log(payment);
          const data = payment.links.find((item) => item.rel === 'approval_url');
          if (data) {
            // console.log(data);
            resolve(data.href);
          } else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject('Không có đường dẫn thanh toán hợp lệ');
          }
        }
      });
    });
  };
  const link = await createPaymentAsync(createPaymentJson);
  return link;
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
        const splitSku = book.sku.split('_');
        if (splitSku[2] !== '') {
          affiliateJob
            .create('create-commission-affiliate', {
              book_id: splitSku[0],
              price: book.price,
              refer_code: splitSku[2],
              duration: splitSku[1],
            })
            .save();
        }
        if (splitSku[3] !== '') {
          couponJob
            .create('add-coupon-usage', {
              code: splitSku[3],
              userId,
            })
            .save();
        }
        cartJob.create('check-cart-to-delete', { book_id: splitSku[0], user_id: userId }).save();
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
    throw new ApiError(httpStatus.NOT_FOUND, 'Sách không tồn tại');
  }
  const originalPdfPath = path.join(__dirname, '../', 'assets', `${book.digital_content}`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const originalPdfBytes = fs.readFileSync(originalPdfPath);
  const pdfDoc = await PDFDocument.load(originalPdfBytes, { ignoreEncryption: true });

  const newPdfDoc = await PDFDocument.create();
  const pageCount = Math.min(4, pdfDoc.getPageCount());

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
    throw new ApiError(httpStatus.NOT_FOUND, 'Sách không tồn tại');
  }
  const originalPdfPath = path.join(__dirname, '../assets', `${book.digital_content}`);

  // Ensure the path exists and is a file
  if (!fs.existsSync(originalPdfPath) || !fs.lstatSync(originalPdfPath).isFile()) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sách không tồn tại');
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const stream = fs.createReadStream(originalPdfPath);

  return stream;
};

/**
 * Asynchronously downloads a book by its ID.
 *
 * @param {string} bookId - The ID of the book to be downloaded.
 * @return {Promise<Buffer>} A promise that resolves to a Buffer containing the book's content.
 * @throws {ApiError} If the book is not found.
 * @throws {ApiError} If there is an error reading the book's content.
 */
const downloadBook = async (bookId) => {
  const book = await getBookById(bookId);
  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sách không tồn tại');
  }

  const originalPdfPath = path.join(__dirname, '../assets', `${book.digital_content}`);
  try {
    const pdfBytes = await fs.readFileSync(originalPdfPath);
    return pdfBytes;
  } catch (error) {
    console.log({ error });
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Không thể tải sách!');
  }
};

/**
 * Retrieves books with the specified genre and paginates the results.
 *
 * @param {string} genre - The genre of the books to retrieve.
 * @param {Object} options - The pagination options.
 * @param {number} options.limit - The maximum number of books per page.
 * @param {number} options.page - The current page number.
 * @return {Promise<Object>} A promise that resolves to the paginated books.
 */
const getBooksWithGenres = async (genre, options) => {
  const genreInfo = await Genre.findOne({ slug: genre });
  return Book.paginate({ genres: { $in: [genreInfo.id] } }, options);
};

/**
 * Retrieves a book by its slug.
 *
 * @param {string} slug - The slug of the book to retrieve.
 * @return {Promise} A Promise that resolves to the book with the provided slug.
 */
const getBookBySlug = async (slug) => {
  return Book.findOne({ slug });
};

const increaseView = async (bookId) => {
  await Book.updateOne({ _id: bookId }, { $inc: { access_times: 1 } });
  await cache.delCache(bookId);
};

module.exports = {
  getBook,
  queryBooks,
  createBook,
  getBookById,
  deleteBookById,
  updateBookById,
  createCheckoutBooks,
  confirmCheckoutBooks,
  getPreviewBook,
  readBook,
  getBooksWithGenres,
  getBookBySlug,
  increaseView,
  downloadBook,
};
