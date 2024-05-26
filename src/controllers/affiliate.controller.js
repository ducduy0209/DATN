const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { affiliateService } = require('../services');

const createAffiliate = catchAsync(async (req, res) => {
  const affiliate = await affiliateService.createAffiliate(req.body);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: affiliate,
  });
});

const getAffiliates = catchAsync(async (req, res) => {
  if (req.user.role !== 'admin' && !req.params.user_id) {
    req.params.user_id = req.user._id;
  }
  const filter = pick(req.params, ['user_id']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const results = await affiliateService.getAffiliates(filter, options);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: results,
  });
});

const getAffiliate = catchAsync(async (req, res) => {
  const affiliate = await affiliateService.getAffiliate(req.params.affiliateId);
  if (!affiliate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Affiliate not found');
  }
  res.status(httpStatus.OK).json({
    status: 'success',
    data: affiliate,
  });
});

const updateAffiliate = catchAsync(async (req, res) => {
  const affiliate = await affiliateService.updateAffiliate(req.params.affiliateId);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: affiliate,
  });
});

const deleteAffiliate = catchAsync(async (req, res) => {
  await affiliateService.deleteAffiliateById(req.params.affiliateId);
  res.status(httpStatus.OK).json({
    status: 'success',
  });
});

const clickAffiliate = (req, res) => {
  affiliateService.clickAffiliate(req.params.code);
  res.status(httpStatus.OK).json({
    status: 'success',
  });
};

module.exports = {
  createAffiliate,
  getAffiliates,
  getAffiliate,
  updateAffiliate,
  deleteAffiliate,
  clickAffiliate,
};
