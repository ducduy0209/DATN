const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bannerService } = require('../services');

const configFilter = (filter) => {
  const { name = '', isActive = '' } = filter;
  const adjustedFilter = {};
  if (name) {
    adjustedFilter.$text = { $search: name.trim() };
  }
  if (isActive !== '') {
    adjustedFilter.isActive = Boolean(isActive);
  }

  return adjustedFilter;
};

const createBanner = catchAsync(async (req, res) => {
  const banner = await bannerService.createBanner(req.body);
  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: banner,
  });
});

const getBanners = catchAsync(async (req, res) => {
  const originalFilter = pick(req.query, ['name', 'isActive']);
  const filter = configFilter(originalFilter);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'name', 'isActive']);
  const result = await bannerService.getBanners(filter, options);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: result,
  });
});

const getBanner = catchAsync(async (req, res) => {
  const banner = await bannerService.getBannerById(req.params.bannerId);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: banner,
  });
});

const updateBanner = catchAsync(async (req, res) => {
  const banner = await bannerService.updateBannerById(req.params.bannerId, req.body);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: banner,
  });
});

const deleteBanner = catchAsync(async (req, res) => {
  await bannerService.deleteBannerById(req.params.bannerId);
  res.status(httpStatus.OK).json({
    status: 'success',
  });
});

module.exports = {
  createBanner,
  getBanners,
  getBanner,
  updateBanner,
  deleteBanner,
};
