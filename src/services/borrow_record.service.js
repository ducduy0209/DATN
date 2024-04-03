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

const getRecordById = async (id) => {
  return BorrowRecord.findById(id);
};
module.exports = {
  getAllRecords,
  createRecord,
  getRecordById,
};
