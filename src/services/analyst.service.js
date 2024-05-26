// const httpStatus = require('http-status');
const moment = require('moment');
const { Analyst, Book, User } = require('../models');
// const ApiError = require('../utils/ApiError');

const formatQueryTime = (time) => {
  const filter = {};
  const now = moment().toDate();

  if (time === 'today') {
    filter.createdAt = {
      $gte: moment().startOf('day').toDate(),
      $lte: now,
    };
  }

  if (time === 'yesterday') {
    filter.createdAt = {
      $gte: moment().subtract(1, 'days').startOf('day').toDate(),
      $lte: moment().subtract(1, 'days').endOf('day').toDate(),
    };
  }

  if (time === '3-days-ago') {
    filter.createdAt = {
      $gte: moment().subtract(3, 'days').startOf('day').toDate(),
      $lte: now,
    };
  }

  if (time === '7-days-ago') {
    filter.createdAt = {
      $gte: moment().subtract(7, 'days').startOf('day').toDate(),
      $lte: now,
    };
  }

  if (time === '14-days-ago') {
    filter.createdAt = {
      $gte: moment().subtract(14, 'days').startOf('day').toDate(),
      $lte: now,
    };
  }

  if (time === '30-days-ago') {
    filter.createdAt = {
      $gte: moment().subtract(30, 'days').startOf('day').toDate(),
      $lte: now,
    };
  }

  return filter;
};

const getAnalysts = async (time = 'today') => {
  const filter = formatQueryTime(time);
  const [recordHistory, userAnalyst] = await Promise.all([Analyst.find(filter), User.count(filter)]);

  let totalRevenue = 0;
  for (let i = 0; i < recordHistory.length; i += 1) {
    totalRevenue += recordHistory[i].price;
  }

  return {
    totalRevenue,
    totalBooks: recordHistory.length,
    totalUsers: userAnalyst,
  };
};

const getTopSellerBooks = async () => {
  const topSellerBooks = await Analyst.aggregate([
    {
      $group: {
        _id: '$book_id',
        totalRevenue: { $sum: '$price' },
      },
    },
    {
      $sort: { totalRevenue: -1 },
    },
    { $limit: 10 },
  ]);
  const bookIds = topSellerBooks.map((item) => item._id) || [];

  const books = await Book.find({ _id: { $in: bookIds } }).select(
    'title cover_image slug languange amount_borrowed access_times'
  );

  const mappedBooks = topSellerBooks.map((topSeller) => {
    const book = books.find((b) => b._id.toString() === topSeller._id.toString());
    if (book) {
      return {
        _id: topSeller._id,
        totalRevenue: topSeller.totalRevenue,
        title: book.title,
        cover_image: book.cover_image,
        slug: book.slug,
        languange: book.languange,
        amount_borrowed: book.amount_borrowed,
        access_times: book.access_times,
      };
    }
    return topSeller;
  });

  return mappedBooks;
};

const getTopBadBooks = async () => {
  const badBooks = await Book.find()
    .sort({ amount_borrowed: 1, access_times: 1 })
    .limit(10)
    .select('title cover_image slug languange amount_borrowed access_times');

  const bookIds = badBooks.map((book) => book._id);

  const revenueData = await Analyst.aggregate([
    { $match: { book_id: { $in: bookIds } } },
    {
      $group: {
        _id: '$book_id',
        totalRevenue: { $sum: '$price' },
      },
    },
  ]);

  const revenueMap = revenueData.reduce((acc, item) => {
    acc[item._id.toString()] = item.totalRevenue;
    return acc;
  }, {});

  const mappedBooks = badBooks.map((book) => {
    const totalRevenue = revenueMap[book._id.toString()] || 0;
    return {
      _id: book._id,
      title: book.title,
      cover_image: book.cover_image,
      slug: book.slug,
      languange: book.languange,
      amount_borrowed: book.amount_borrowed,
      access_times: book.access_times,
      totalRevenue,
    };
  });

  return mappedBooks;
};

module.exports = {
  getAnalysts,
  getTopSellerBooks,
  getTopBadBooks,
};
