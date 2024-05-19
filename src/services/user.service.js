const httpStatus = require('http-status');
const { User, Book, BorrowRecord } = require('../models');
const ApiError = require('../utils/ApiError');
const cache = require('../utils/cache');
const { getTransactionRecord } = require('./borrow_record.service');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const cachedUsers = await cache.getCache(id);
  if (!cachedUsers) {
    const user = await User.findById(id);
    await cache.setCache(id, user);
    return user;
  }

  return cachedUsers;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Người dùng không tồn tại');
  }

  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email đã được sử dụng');
  }

  const filteredBody = filterObj(updateBody, 'name', 'email', 'isEmailVerified', 'image');
  Object.assign(user, filteredBody);
  await user.save();
  await cache.setCache(userId, user);
  return user;
};

const updateUserPasswordById = async (userId, password) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Người dùng không tồn tại');
  }
  user.password = password;
  await cache.setCache(userId, user);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await cache.delCache(userId);
  await user.remove();
  return user;
};

/**
 * Deactive user by id
 * @param {String} userId
 * @returns {Promise<User>}
 */
const deactivateUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.isActive = false;
  await user.save();
  return user;
};

/**
 * Create a user
 * @param {Object} userBody
 * @param {String} userId
 * @returns {Promise<User>}
 */
const updateMyPasswordById = async (userId, updateBody) => {
  const { currentPassword, newPassword } = updateBody;
  const user = await User.findById(userId);

  if (!user || !(await user.isPasswordMatch(currentPassword))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Mật khẩu hiện tại không chính xác');
  }

  user.password = newPassword;
  await user.save();
  return user;
};

const likeBook = async (userId, bookId) => {
  const count = await User.count({
    _id: userId,
    favorite_books: { $elemMatch: { $eq: bookId } },
  });

  if (count > 0) {
    await User.updateOne(
      { _id: userId },
      {
        $pull: { favorite_books: bookId },
      }
    );
    return 'Đã xoá sách khỏi danh sách yêu thích';
  }
  await User.updateOne(
    { _id: userId },
    {
      $push: { favorite_books: bookId },
    }
  );
  return 'Đã thêm sách vào danh sách yêu thích';
};

/**
 * Retrieves books for a specific user based on the user ID and options provided.
 *
 * @param {string} userId - The ID of the user to retrieve books for.
 * @param {Object} options - Additional options for pagination and querying.
 * @return {Promise} A Promise that resolves to the paginated books for the user.
 */
const getMyBooks = async (userId, options) => {
  const records = await BorrowRecord.find({ user_id: userId, $or: [{ due_date: null }, { due_date: { $gt: new Date() } }] });
  const bookIds = records.map((record) => record.book_id);

  const books = await Book.paginate({ _id: { $in: bookIds } }, options);
  books.results = await Promise.all(
    books.results.map(async (book) => {
      const transaction = await getTransactionRecord(book._id, userId);
      const accessStatus = transaction ? `${transaction.due_date ? 'view' : 'download'}` : 'denied';
      return { ...book.toObject(), access_status: accessStatus };
    })
  );
  return books;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  deactivateUserById,
  updateMyPasswordById,
  updateUserPasswordById,
  likeBook,
  getMyBooks,
};
