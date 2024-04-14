const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { cartValidation } = require('../../validations');
const { cartController } = require('../../controllers');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(auth(), validate(cartValidation.createCart), cartController.createCart)
  .get(auth(), validate(cartValidation.getCarts), cartController.getCarts);

router
  .route('/:cartId')
  .patch(auth(), validate(cartValidation.updateCart), cartController.updateCart)
  .delete(auth(), validate(cartValidation.deleteCart), cartController.deleteCart);

module.exports = router;
