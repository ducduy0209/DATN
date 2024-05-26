const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { genreValidation } = require('../../validations');
const { genreController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth('admin'), validate(genreValidation.createGenre), genreController.createGenre)
  .get(genreController.getGenres);

router
  .route('/:genreId')
  // .get(auth(), validate(genreValidation.getGenre), genreController.getGenre)
  .patch(auth('admin'), validate(genreValidation.updateGenre), genreController.updateGenre)
  .delete(auth('admin'), validate(genreValidation.deleteGenre), genreController.deleteGenre);

router.route('/:slug').get(genreController.getGenreBySlug);

module.exports = router;
