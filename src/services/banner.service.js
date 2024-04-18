const httpStatus = require('http-status');
const { Banner } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Creates a new banner in the database.
 *
 * @param {Object} bannerBody - The data for the new banner.
 * @return {Promise<Object>} A promise that resolves to the created banner object.
 */
const createBanner = async (bannerBody) => {
  return Banner.create(bannerBody);
};

/**
 * Retrieves banners based on the provided filter and options.
 *
 * @param {Object} filter - The filter to apply to the banners.
 * @param {Object} options - The options to customize the query.
 * @return {Promise<Array>} A promise that resolves to an array of banners that match the filter.
 */
const getBanners = async (filter, options) => {
  return Banner.paginate(filter, options);
};

/**
 * Retrieves a banner by its ID.
 *
 * @param {string} bannerId - The ID of the banner to retrieve.
 * @return {Promise<Object>} A promise that resolves to the banner object with the given ID.
 */
const getBannerById = async (bannerId) => {
  return Banner.findById(bannerId);
};

/**
 * Updates a banner by its ID with the provided data.
 *
 * @param {string} bannerId - The ID of the banner to update.
 * @param {object} updatedData - The data to update the banner with.
 * @return {Promise<object>} The updated banner object.
 * @throws {ApiError} If the banner with the provided ID is not found.
 */
const updateBannerById = async (bannerId, updatedData) => {
  const banner = await getBannerById(bannerId);
  if (!banner) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
  }

  Object.assign(banner, updatedData);
  await banner.save();
  return banner;
};

/**
 * Deletes a banner by its ID.
 *
 * @param {string} bannerId - The ID of the banner to delete.
 * @return {Promise<void>} A promise that resolves when the banner is deleted.
 */
const deleteBannerById = async (bannerId) => {
  const banner = await getBannerById(bannerId);
  if (!banner) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
  }
  await banner.remove();
};

module.exports = {
  createBanner,
  getBanners,
  getBannerById,
  updateBannerById,
  deleteBannerById,
};
