const kue = require('kue');
const logger = require('../config/logger');
const { CouponUsage, Coupon } = require('../models');

const queue = kue.createQueue();

async function findOrCreateCouponUsage(userId, code) {
  const existingCouponUsage = await CouponUsage.findOne({ userId, code });
  if (existingCouponUsage) return existingCouponUsage;

  const couponUsage = await CouponUsage.create({ userId, code });
  return couponUsage;
}

async function updateCouponUsage(couponUsage) {
  // eslint-disable-next-line no-param-reassign
  couponUsage.numberOfUses += 1;
  await couponUsage.save();
}

async function updateCoupon(code) {
  const coupon = await Coupon.findOne({ code });
  coupon.remaining_amount -= 1;
  await coupon.save();
}

queue.process('add-coupon-usage', async (job, done) => {
  const { userId, code } = job.data;

  try {
    const couponUsage = await findOrCreateCouponUsage(userId, code);
    await updateCouponUsage(couponUsage);
    await updateCoupon(couponUsage.code);
    logger.info(`Job ${job.id} - add coupon usage completed`);
    done();
  } catch (error) {
    logger.error(`Error processing job: add coupon usage`, error);
    done(error);
  }
});

module.exports = queue;
