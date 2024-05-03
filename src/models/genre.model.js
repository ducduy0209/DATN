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
    slug: {
      type: String,
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

genreSchema.plugin(toJSON);

genreSchema.pre('save', function (next) {
  this.slug = this.title
    .replace(/[^\w\s]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  next();
});

const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;
