const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const affiliateSchema = new mongoose.Schema(
  {
    user_id: mongoose.SchemaTypes.ObjectId,
    refer_code: {
      type: String,
      required: true,
      unique: true,
    },
    link_count: {
      type: Number,
      default: 0,
    },
    purchase_count: {
      type: Number,
      default: 0,
    },
    commission_amount: {
      type: Number,
      default: 0,
    },
    commission_percent: {
      type: Number,
      default: 25,
    },
  },
  { timestamps: true }
);

affiliateSchema.plugin(toJSON);
affiliateSchema.plugin(paginate);

const Affiliate = mongoose.model('Affiliate', affiliateSchema);

module.exports = Affiliate;
