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

queue.process('click-affiliate', async (job, done) => {
  // eslint-disable-next-line camelcase
  const { refer_code } = job.data;

  try {
    const existingAffiliate = await Affiliate.findOne({ refer_code });

    if (!existingAffiliate) {
      done();
      return;
    }

    existingAffiliate.link_count += 1;
    await existingAffiliate.save();

    logger.info(`Job ${job.id} - click link affiliate completed`);
    done();
  } catch (error) {
    logger.error(`Error processing job: click link affiliate`, error);
    done(error);
  }
});

queue.process('create-commission-affiliate', async (job, done) => {
  const calculateCommission = (purchaseAmount, commissionPercent) => {
    return (purchaseAmount * commissionPercent) / 100;
  };
  // eslint-disable-next-line camelcase
  const { book_id, price, refer_code, duration } = job.data;

  try {
    const existingAffiliate = await Affiliate.findOne({ refer_code });

    if (!existingAffiliate) {
      done();
      return;
    }

    const commissionAmount = calculateCommission(price, existingAffiliate.commission_percent);

    existingAffiliate.purchase_count += 1;
    existingAffiliate.commission_amount += commissionAmount;
    existingAffiliate.commission_history.push({
      book: book_id,
      duration,
      commission_amount: commissionAmount,
    });
    await existingAffiliate.save();

    logger.info(`Job ${job.id} - create commission affiliate completed`);
    done();
  } catch (error) {
    logger.error(`Error processing job: create commission affiliate`, error);
    done(error);
  }
});

module.exports = queue;
