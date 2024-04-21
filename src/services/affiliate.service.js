const httpStatus = require('http-status');
const { Affiliate } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Creates a new affiliate.
 *
 * @param {Object} affiliateBody - The data for the new affiliate.
 * @param {string} affiliateBody.user_id - The ID of the user associated with the affiliate.
 * @param {string} affiliateBody.refer_code - The refer code for the affiliate.
 * @throws {ApiError} Throws an error if the affiliate already exists.
 * @return {Promise<Object>} Returns a promise that resolves to the created affiliate.
 */
const createAffiliate = async (affiliateBody) => {
  const affiliate = await Affiliate.findOne({ user_id: affiliateBody.user_id, refer_code: affiliateBody.refer_code });

  if (affiliate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Affiliate already exists');
  }
  return Affiliate.create(affiliateBody);
};

/**
 * Retrieves affiliates based on the provided filter and options.
 *
 * @param {Object} filter - The filter to apply to the affiliates.
 * @param {Object} options - The options to customize the query.
 * @return {Promise} A promise that resolves to an array of affiliates that match the filter.
 */
const getAffiliates = async (filter, options) => {
  return Affiliate.paginate(filter, options);
};

/**
 * Retrieves an affiliate by their ID.
 *
 * @param {string} affiliateId - The ID of the affiliate to retrieve.
 * @return {Promise<Affiliate>} A Promise that resolves to the affiliate object.
 */
const getAffiliate = async (affiliateId) => {
  return Affiliate.findById(affiliateId);
};

/**
 * Deletes an affiliate by their ID.
 *
 * @param {string} affiliateId - The ID of the affiliate to delete.
 * @return {Promise} A promise that resolves to the deleted affiliate.
 */
const deleteAffiliateById = async (affiliateId) => {
  return Affiliate.findByIdAndDelete(affiliateId);
};

/**
 * Updates an affiliate based on the provided affiliate ID and body.
 *
 * @param {string} affiliateId - The ID of the affiliate to update.
 * @param {Object} affiliateBody - The data to update the affiliate with.
 * @return {Promise<Affiliate>} A promise that resolves to the updated affiliate.
 */
const updateAffiliate = async (affiliateId, affiliateBody) => {
  const affiliate = await Affiliate.findOne({ _id: affiliateId });
  if (affiliate.isUpdatedReceiver) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Affiliate reciever already updated');
  }
  Object.assign(affiliate, affiliateBody, { isUpdatedReceiver: true });
  return affiliate.save();
};

module.exports = {
  createAffiliate,
  getAffiliates,
  getAffiliate,
  deleteAffiliateById,
  updateAffiliate,
};
