const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const affiliateSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
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
      default: 15,
    },
    email_receiver: String,
    isUpdatedReceiver: {
      type: Boolean,
      default: false,
    },
    commission_history: [
      {
        book: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'Book',
        },
        duration: String,
        commission_amount: Number,
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    payment_history: [
      {
        amount: Number,
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  { timestamps: true }
);

affiliateSchema.plugin(toJSON);
affiliateSchema.plugin(paginate);

affiliateSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'commission_history.book',
    select: 'title slug',
  });

  next();
});

const Affiliate = mongoose.model('Affiliate', affiliateSchema);

module.exports = Affiliate;
