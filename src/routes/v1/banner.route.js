const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { bannerValidation } = require('../../validations');
const { bannerController } = require('../../controllers');
const { uploadBannerPhoto, resizeBannerPhoto } = require('../../middlewares/banner.middleware');

const router = express.Router();

router
  .route('/')
  .post(
    auth('admin'),
    uploadBannerPhoto,
    resizeBannerPhoto,
    validate(bannerValidation.createBanner),
    bannerController.createBanner
  )
  .get(validate(bannerValidation.getBanners), bannerController.getBanners);

router
  .route('/:bannerId')
  .get(auth('admin'), validate(bannerValidation.getBanner), bannerController.getBanner)
  .patch(
    auth('admin'),
    uploadBannerPhoto,
    resizeBannerPhoto,
    validate(bannerValidation.updateBanner),
    bannerController.updateBanner
  )
  .delete(auth('admin'), validate(bannerValidation.deleteBanner), bannerController.deleteBanner);

module.exports = router;
