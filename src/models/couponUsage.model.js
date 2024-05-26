const mongoose = require('mongoose');

const { Schema } = mongoose;

const couponUsageSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  numberOfUses: {
    type: Number,
    default: 0,
  },
});

const CouponUsage = mongoose.model('CouponUsage', couponUsageSchema);

module.exports = CouponUsage;
