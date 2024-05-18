const kue = require('kue');
const logger = require('../config/logger');
const { Book } = require('../models');
const cache = require('../utils/cache');

const queue = kue.createQueue();

queue.process('increase-access-time-book', async (job, done) => {
  const { bookId } = job.data;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }
    book.access_times += 1;
    await cache.setCache(bookId, book);
    await book.save();

    logger.info(`Job ${job.id} - increase access time book completed`);
    done();
  } catch (error) {
    logger.error(`Error processing job: increase access time book`, error);
    done(error);
  }
});

queue.process('update-rating-book', async (job, done) => {
  const { review } = job.data;

  try {
    const book = await Book.findById(review.book_id);
    if (!book) {
      throw new Error('Book not found');
    }
    if (book.rating_count > 0) {
      book.rating = (book.rating * book.rating_count + review.rating) / (book.rating_count + 1);
    } else {
      book.rating = review.rating;
    }
    book.rating_count += 1;
    await book.save();
    await cache.setCache(review.book_id, book);

    logger.info(`Job ${job.id} - increase access time book completed`);
    done();
  } catch (error) {
    logger.error(`Error processing job: increase access time book`, error);
    done(error);
  }
});

module.exports = queue;
