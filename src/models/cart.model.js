const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const cartSchema = new mongoose.Schema(
  {
    book_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Book',
    },
    user_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    refer_code: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      enum: ['1 month', '3 month', '6 month', 'forever'],
    },
  },
  { timestamps: true }
);

cartSchema.plugin(toJSON);

cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'book_id',
    select: 'title slug cover_image prices',
  });

  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
