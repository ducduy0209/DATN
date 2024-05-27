const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const reviewSchema = new mongoose.Schema(
  {
    book_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Book',
    },
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    comment: {
      type: String,
      default: '',
    },
    isAdjusted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

reviewSchema.plugin(toJSON);
reviewSchema.plugin(paginate);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user_id',
    select: 'name image',
  }).populate({
    path: 'book_id',
    select: 'title slug',
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
