const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { affiliateValidation } = require('../../validations');
const { affiliateController } = require('../../controllers');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(auth('admin'), validate(affiliateValidation.createAffiliate), affiliateController.createAffiliate)
  .get(auth(), validate(affiliateValidation.getAffiliates), affiliateController.getAffiliates);

router
  .route('/:affiliateId')
  .get(auth('admin'), validate(affiliateValidation.getAffiliate), affiliateController.getAffiliate)
  .patch(auth(), validate(affiliateValidation.updateAffiliate), affiliateController.updateAffiliate)
  .delete(auth('admin'), validate(affiliateValidation.deleteAffiliate), affiliateController.deleteAffiliate);

module.exports = router;
