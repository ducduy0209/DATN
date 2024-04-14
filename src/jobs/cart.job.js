const kue = require('kue');
const logger = require('../config/logger');
const { Cart } = require('../models');

const queue = kue.createQueue();

queue.process('add-to-cart', async (job, done) => {
  const { userId, cartBody } = job.data;

  try {
    const existingCart = await Cart.findOne({ user_id: userId, book_id: cartBody.book_id });

    if (existingCart) {
      await existingCart.remove();
    }
    await Cart.create({ ...cartBody, user_id: userId });

    logger.info(`Job ${job.id} - add to cart completed`);
    done();
  } catch (error) {
    logger.error(`Error processing job: add to cart`, error);
    done(error);
  }
});

queue.process('update-cart', async (job, done) => {
  const { cartId, updatedBody } = job.data;
  try {
    const existingCart = await Cart.findOne({ _id: cartId });
    if (existingCart) {
      await Cart.updateOne({ _id: cartId }, { ...updatedBody });
    }
    logger.info(`Job ${job.id} - update cart completed`);
    done();
  } catch (error) {
    logger.error(`Error processing job: update cart`, error);
    done(error);
  }
});

module.exports = queue;
