const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const genreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: 'text',
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

genreSchema.plugin(toJSON);

const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;
