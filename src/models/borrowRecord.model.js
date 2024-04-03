const mongoose = require('mongoose');
const moment = require('moment');
const { toJSON, paginate } = require('./plugins');

const borrowRecordSchema = new mongoose.Schema(
  {
    book_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Book',
    },
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    borrow_date: {
      type: Date,
      default: Date.now(),
    },
    due_date: {
      type: Date,
      default: Date.now(),
    },
    duration: {
      type: String,
      enum: ['1 month', '3 month', '6 month', 'forever'],
    },
    price: {
      type: Number,
      default: 0,
    },
    payBy: {
      type: String,
      enum: ['paypal', 'cash'],
      default: 'cash',
    },
  },
  { timestamps: true }
);

borrowRecordSchema.set('toJSON', { virtuals: true });

borrowRecordSchema.virtual('isExpired').get(function () {
  return this.due_date ? this.due_date < new Date() : null;
});

borrowRecordSchema.plugin(toJSON);
borrowRecordSchema.plugin(paginate);

borrowRecordSchema.pre('save', function (next) {
  if (this.duration === 'forever') {
    this.due_date = null;
    next();
  } else {
    const amountMonth = this.duration.split(' ')[0];
    this.due_date = moment(this.due_date).add(amountMonth, 'months').toDate();
    next();
  }
});

borrowRecordSchema.pre(/^find/, function (next) {
  this.populate('user_id').populate({
    path: 'book_id',
    select: 'title slug',
  });

  next();
});

const BorrowRecord = mongoose.model('Borrow_Record', borrowRecordSchema);

module.exports = BorrowRecord;
