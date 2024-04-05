const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { bookValidation } = require('../../validations');
const { bookController } = require('../../controllers');
const borrowRecordRoute = require('./borrow_record.route');
const { uploadFiles, resizeBookPhoto, saveBookPDF } = require('../../middlewares/book.middleware');

const router = express.Router();

router.use('/:book_id/records', auth('admin'), borrowRecordRoute);

router.post('/checkout', auth(), validate(bookValidation.createCheckoutBook), bookController.createCheckoutBooks);
router.get('/payment-success', auth(), validate(bookValidation.confirmCheckoutBook), bookController.confirmCheckoutBooks);

// Note: This will be replaced with a real payment gateway
router.get('/payment-cancel', (req, res) => res.send('Thanh toán bị hủy'));

router
  .route('/')
  .post(
    auth('admin'),
    uploadFiles,
    resizeBookPhoto,
    saveBookPDF,
    validate(bookValidation.createBook),
    bookController.createBook
  )
  .get(validate(bookValidation.getBooks), bookController.getBooks);

router
  .route('/:bookId')
  .get(auth(), validate(bookValidation.getBook), bookController.getBook)
  .patch(
    auth('admin'),
    uploadFiles,
    resizeBookPhoto,
    saveBookPDF,
    validate(bookValidation.updateBook),
    bookController.updateBook
  )
  .delete(auth('admin'), validate(bookValidation.deleteBook), bookController.deleteBook);

module.exports = router;
