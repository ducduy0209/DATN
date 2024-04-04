// const httpStatus = require('http-status');
const { BorrowRecord } = require('../models');
// const ApiError = require('../utils/ApiError');

/**
 * Get all records based on the provided filter and options.
 *
 * @param {Object} filter - The filter object to apply.
 * @param {Object} option - The options object for pagination.
 * @return {Promise} A Promise that resolves to the paginated records.
 */
const getAllRecords = (filter, option) => {
  return BorrowRecord.paginate(filter, option);
};
/**
 * Creates a new record based on the provided record body. If a record with the same user_id, book_id,
 * and a due_date in the future already exists, it updates the duration and returns the updated record.
 * Otherwise, it creates a new record and returns it.
 *
 * @param {Object} recordBody - The data for the new record.
 * @return {Promise<Object>} The created or updated record.
 */
const createRecord = async (recordBody) => {
  const newData = { ...recordBody };
  if (newData.duration.includes('-')) {
    newData.duration = newData.duration.split('-').join(' ');
  }
  const record = await BorrowRecord.findOne({
    user_id: newData.user_id,
    book_id: newData.book_id,
    due_date: { $gt: new Date() },
  });

  if (record) {
    record.duration = newData.duration;
    await record.save();

    return record;
  }

  return BorrowRecord.create(newData);
};

/**
 * Get a record by its ID.
 *
 * @param {string} id - The ID of the record to retrieve.
 * @return {Promise} A Promise that resolves to the record found by ID.
 */
const getRecordById = async (id) => {
  return BorrowRecord.findById(id);
};
module.exports = {
  getAllRecords,
  createRecord,
  getRecordById,
};
