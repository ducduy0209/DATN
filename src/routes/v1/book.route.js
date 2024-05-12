const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { bookValidation } = require('../../validations');
const { bookController } = require('../../controllers');
const borrowRecordRoute = require('./borrow_record.route');
const reviewRoute = require('./review.route');
const { uploadFiles, resizeBookPhoto, saveBookPDF, checkAccessRightBook } = require('../../middlewares/book.middleware');

const router = express.Router();

router.use('/:book_id/reviews', reviewRoute);
router.use('/:book_id/records', auth('admin'), borrowRecordRoute);
router.get('/genres/:genre', validate(bookValidation.getBooksWithGenres), bookController.getBooksWithGenres);
router.get('/preview/:book_id', validate(bookValidation.readBook), bookController.previewBook);
router.get('/read/:book_id', auth(), checkAccessRightBook, validate(bookValidation.readBook), bookController.readBook);
router.get('/search/:slug', validate(bookValidation.getBookBySlug), bookController.getBookBySlug);

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
