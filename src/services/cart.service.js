// const httpStatus = require('http-status');
const { Cart } = require('../models');
// const ApiError = require('../utils/ApiError');
const queue = require('../jobs/cart.job');

/**
 * Creates a Promise for a job with the given type and data.
 *
 * @param {string} type - The type of the job
 * @param {any} data - The data associated with the job
 * @return {Promise} A Promise that resolves with the job ID if successful, or rejects with an error
 */
const createJobPromise = (type, data) => {
  return new Promise((resolve, reject) => {
    const job = queue.create(type, data).save((err) => {
      if (err) reject(err);
      else resolve(job.id);
    });
  });
};

const addToCart = (cartBody, userId) => createJobPromise('add-to-cart', { cartBody, userId });

const updateCartById = (cartId, updatedBody) => createJobPromise('update-cart', { cartId, updatedBody });

/**
 * Retrieves carts based on the provided filter.
 *
 * @param {Object} filter - The filter to apply to the carts.
 * @return {Promise<Array>} The carts that match the filter.
 */
const getCarts = async (filter) => {
  return Cart.find(filter);
};

/**
 * Deletes a cart by its ID.
 *
 * @param {string} id - The ID of the cart to be deleted
 * @return {Promise} The deleted cart
 */
const deleteCartById = async (id) => {
  return Cart.findByIdAndDelete(id);
};

module.exports = {
  addToCart,
  getCarts,
  deleteCartById,
  updateCartById,
};