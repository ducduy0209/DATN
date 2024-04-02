const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const bookValidation = require('../../validations/book.validation');
const bookController = require('../../controllers/book.controller');
const { uploadFiles, resizeBookPhoto, saveBookPDF } = require('../../middlewares/book.middleware');

const router = express.Router();

router.get('/pay/:bookId', auth(), validate(bookValidation.createCheckoutBook), bookController.createCheckoutBook);
router.get('/payment-success', auth(), validate(bookValidation.confirmCheckoutBook), bookController.confirmCheckoutBook);

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
