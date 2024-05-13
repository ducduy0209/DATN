// const httpStatus = require('http-status');
const moment = require('moment');
const { Analyst, User } = require('../models');
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

  console.log({ totalRevenue, totalBooks: recordHistory.length, totalUsers: userAnalyst });

  return {
    totalRevenue,
    totalBooks: recordHistory.length,
    totalUsers: userAnalyst,
  };
};

module.exports = {
  getAnalysts,
};
