const httpStatus = require('http-status');
const { Genre } = require('../models');
const ApiError = require('../utils/ApiError');

const createGenre = async (genreBody) => {
  return Genre.create(genreBody);
};

const getGenres = async (filter, options) => {
  return Genre.paginate(filter, options);
};

const getGenreById = async (id) => {
  return Genre.findById(id);
};

const getGenreBySlug = async (slug) => {
  return Genre.findOne({ slug });
};

const updateGenreById = async (id, updatedData) => {
  const genre = await Genre.findById(id);
  if (!genre) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Genre not found');
  }
  return Genre.updateOne({ _id: id }, updatedData, { new: true });
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
  getGenreBySlug,
};
