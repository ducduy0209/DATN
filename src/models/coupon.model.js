const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    percent: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    minimum_value: {
      type: Number,
      required: true,
    },
    remaining_amount: {
      type: Number,
      default() {
        return this.quantity;
      },
    },
    isPublic: {
      type: Boolean,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    maxPerPerson: {
      type: Number,
      default: 1,
    },
    expiredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

couponSchema.plugin(toJSON);
couponSchema.plugin(paginate);

couponSchema.statics.isCouponTaken = async function (code) {
  const user = await this.findOne({ code });
  return !!user;
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
