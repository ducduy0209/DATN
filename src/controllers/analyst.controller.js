const httpStatus = require('http-status');
// const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { analystService } = require('../services');

const getAnalysts = catchAsync(async (req, res) => {
  const analyst = await analystService.getAnalysts(req.query.time);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: analyst,
  });
});
module.exports = {
  getAnalysts,
};
