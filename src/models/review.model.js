const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const reviewSchema = new mongoose.Schema(
  {
    book_id: mongoose.SchemaTypes.ObjectId,
    user_id: mongoose.SchemaTypes.ObjectId,
    rating: {
      type: Number,
      default: 4.5,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

reviewSchema.plugin(toJSON);
reviewSchema.plugin(paginate);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
