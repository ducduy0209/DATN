// const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { genreService } = require('../services');

const createGenre = catchAsync(async (req, res) => {
  const genre = await genreService.createGenre(req.body);
  res.status(201).json({
    status: 'success',
    data: genre,
  });
});

const getGenres = catchAsync(async (req, res) => {
  if (!req.query.sortBy) {
    req.query.sortBy = 'priority:desc';
  }
  const filter = pick(req.query, ['name', 'role', 'email']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await genreService.getGenres(filter, options);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getGenre = catchAsync(async (req, res) => {
  const genre = await genreService.getGenreById(req.params.genreId);
  res.status(200).json({
    status: 'success',
    data: genre,
  });
});

const getGenreBySlug = catchAsync(async (req, res) => {
  const genre = await genreService.getGenreBySlug(req.params.slug);
  res.status(200).json({
    status: 'success',
    data: genre,
  });
});

const updateGenre = catchAsync(async (req, res) => {
  const genre = await genreService.updateGenreById(req.params.genreId, req.body);
  res.status(200).json({
    status: 'success',
    data: genre,
  });
});

const deleteGenre = catchAsync(async (req, res) => {
  await genreService.deleteGenreById(req.params.genreId);
  res.status(200).json({
    status: 'success',
  });
});

module.exports = {
  createGenre,
  getGenres,
  getGenre,
  updateGenre,
  deleteGenre,
  getGenreBySlug,
};
