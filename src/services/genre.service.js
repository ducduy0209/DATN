const httpStatus = require('http-status');
const { Genre } = require('../models');
const ApiError = require('../utils/ApiError');

const createGenre = async (genreBody) => {
  return Genre.create(genreBody);
};

const getGenres = async () => {
  return Genre.find().sort({ priority: -1 });
};

const getGenreById = async (id) => {
  return Genre.findById(id);
};

const updateGenreById = async (id, updatedData) => {
  const genre = await Genre.findById(id);
  if (!genre) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Genre not found');
  }
  return Genre.updateOnde({ _id: id }, updatedData);
};

const deleteGenreById = async (id) => {
  const genre = await Genre.findById(id);
  if (!genre) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Genre not found');
  }
  await genre.remove();
};

module.exports = {
  createGenre,
  getGenres,
  getGenreById,
  updateGenreById,
  deleteGenreById,
};
