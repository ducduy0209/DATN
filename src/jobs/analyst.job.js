const kue = require('kue');
const logger = require('../config/logger');
const { Analyst } = require('../models');

const queue = kue.createQueue();

queue.process('add-to-analyst', async (job, done) => {
  const { record } = job.data;

  try {
    await Analyst.create({
      book_id: record.book_id,
      user_id: record.user_id,
      price: record.price,
      duration: record.duration,
    });

    logger.info(`Job ${job.id} - add to analyst completed`);
    done();
  } catch (error) {
    logger.error(`Error processing job: add to analyst`, error);
    done(error);
  }
});

module.exports = queue;
