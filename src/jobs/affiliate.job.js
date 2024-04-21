const kue = require('kue');
const logger = require('../config/logger');
const { Affiliate } = require('../models');

const queue = kue.createQueue();

queue.process('create-affiliate-table', async (job, done) => {
  const { user } = job.data;

  try {
    const existingAffiliate = await Affiliate.findOne({ user_id: user.id });

    if (existingAffiliate) {
      done();
      return;
    }

    await Affiliate.create({ user_id: user.id, refer_code: user.my_refer_code });

    logger.info(`Job ${job.id} - create affiliate table completed`);
    done();
  } catch (error) {
    logger.error(`Error processing job: create affiliate table`, error);
    done(error);
  }
});

module.exports = queue;
