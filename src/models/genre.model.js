const slugify = require('slugify');
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

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
genreSchema.plugin(paginate);

genreSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
  });
  next();
});

const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;
