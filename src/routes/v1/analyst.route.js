const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { analystValidation } = require('../../validations');
const { analystController } = require('../../controllers');

const router = express.Router();

router.route('/').get(auth('admin'), validate(analystValidation.getAnalysts), analystController.getAnalysts);

module.exports = router;
