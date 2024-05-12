const kue = require('kue');
const logger = require('../config/logger');
const { Cart } = require('../models');
const cache = require('../utils/cache');

const queue = kue.createQueue();

queue.process('add-to-cart', async (job, done) => {
  const { userId, cartBody } = job.data;

  try {
    const existingCart = await Cart.findOne({ user_id: userId, book_id: cartBody.book_id });

    if (existingCart) {
      await existingCart.remove();
    }
    await Cart.create({ ...cartBody, user_id: userId });
    const carts = await Cart.find({ user_id: userId });
    await cache.setCache(`${userId}-carts`, carts);

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
      Object.assign(existingCart, updatedBody);
      await existingCart.save();
      const carts = await Cart.find({ user_id: existingCart.user_id });
      await cache.setCache(`${existingCart.user_id}-carts`, carts);
    }
    logger.info(`Job ${job.id} - update cart completed`);
    done();
  } catch (error) {
    logger.error(`Error processing job: update cart`, error);
    done(error);
  }
});

queue.process('check-cart-to-delete', async (job, done) => {
  // eslint-disable-next-line camelcase
  const { user_id, book_id } = job.data;
  try {
    const existingCart = await Cart.findOne({ user_id, book_id });
    if (existingCart) {
      await existingCart.remove();
      // eslint-disable-next-line camelcase
      const carts = await Cart.find({ user_id });
      // eslint-disable-next-line camelcase
      await cache.setCache(`${user_id}-carts`, carts);
    }
    logger.info(`Job ${job.id} - check cart to delete completed`);
    done();
  } catch (error) {
    logger.error(`Error processing job: check cart to delete`, error);
    done(error);
  }
});

module.exports = queue;
