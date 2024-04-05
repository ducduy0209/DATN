const httpStatus = require('http-status');
const { BorrowRecord } = require('../models');
const { Book } = require('../models');
const ApiError = require('../utils/ApiError');

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
  const book = await Book.findById(recordBody.book_id);
  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }

  let record = await BorrowRecord.findOne({
    user_id: recordBody.user_id,
    book_id: recordBody.book_id,
    due_date: { $gt: new Date() },
  });

  if (record) {
    record.duration = recordBody.duration;
    await record.save();
  } else {
    record = await BorrowRecord.create(recordBody);
  }

  book.amount_borrowed += 1;
  await book.save();
  return record;
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
