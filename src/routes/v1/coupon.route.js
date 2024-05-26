const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { couponValidation } = require('../../validations');
const { couponController } = require('../../controllers');

const router = express.Router();

router.post('/apply', auth(), validate(couponValidation.applyCoupon), couponController.applyCoupon);

router
  .route('/')
  .post(auth('admin'), validate(couponValidation.createCoupon), couponController.createCoupon)
  .get(auth('admin'), validate(couponValidation.getCoupons), couponController.getCoupons);

router
  .route('/:couponId')
  .get(auth('admin'), validate(couponValidation.getCoupon), couponController.getCoupon)
  .patch(auth('admin'), validate(couponValidation.updateCoupon), couponController.updateCoupon)
  .delete(auth('admin'), validate(couponValidation.deleteCoupon), couponController.deleteCoupon);

module.exports = router;
