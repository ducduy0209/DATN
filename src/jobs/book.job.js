const kue = require('kue');
const logger = require('../config/logger');
const { Book } = require('../models');

const queue = kue.createQueue();

queue.process('increase-access-time-book', async (job, done) => {
  const { bookId } = job.data;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }
    book.access_times += 1;
    await book.save();

    logger.info(`Job ${job.id} - increase access time book completed`);
    done();
  } catch (error) {
    logger.error(`Error processing job: increase access time book`, error);
    done(error);
  }
});

module.exports = queue;
