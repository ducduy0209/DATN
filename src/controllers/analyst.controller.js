const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { analystService } = require('../services');

const getAnalysts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['time', 'from', 'to']);
  const analyst = await analystService.getAnalysts(filter);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: analyst,
  });
});

const getTopSellerBooks = catchAsync(async (req, res) => {
  const topSellerBooks = await analystService.getTopSellerBooks();
  res.status(httpStatus.OK).json({
    status: 'success',
    data: topSellerBooks,
  });
});

const getTopBadBooks = catchAsync(async (req, res) => {
  const topBadBooks = await analystService.getTopBadBooks();
  res.status(httpStatus.OK).json({
    status: 'success',
    data: topBadBooks,
  });
});
module.exports = {
  getAnalysts,
  getTopSellerBooks,
  getTopBadBooks,
};
