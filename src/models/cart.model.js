const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const cartSchema = new mongoose.Schema(
  {
    book_id: mongoose.SchemaTypes.ObjectId,
    user_id: mongoose.SchemaTypes.ObjectId,
  },
  { timestamps: true }
);

cartSchema.plugin(toJSON);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
