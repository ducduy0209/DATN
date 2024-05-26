const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { borrowRecordValidation } = require('../../validations');
const { borrowRecordController } = require('../../controllers');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(auth(), validate(borrowRecordValidation.getAllRecords), borrowRecordController.getAllRecords)
  .post(auth(), validate(borrowRecordValidation.createRecord), borrowRecordController.createRecord);

router.get('/:id', auth('admin'), validate(borrowRecordValidation.getRecord), borrowRecordController.getRecord);
module.exports = router;
