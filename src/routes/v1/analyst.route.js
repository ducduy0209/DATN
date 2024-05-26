const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { analystValidation } = require('../../validations');
const { analystController } = require('../../controllers');

const router = express.Router();

router.get('/', auth('admin'), validate(analystValidation.getAnalysts), analystController.getAnalysts);
router.get('/top-seller-books', auth('admin'), analystController.getTopSellerBooks);
router.get('/top-bad-books', auth('admin'), analystController.getTopBadBooks);

module.exports = router;
