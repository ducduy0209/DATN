const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const borrowRecordSchema = new mongoose.Schema(
  {
    book_id: mongoose.SchemaTypes.ObjectId,
    user_id: mongoose.SchemaTypes.ObjectId,
    borrow_date: {
      type: Date,
      default: Date.now(),
    },
    due_date: {
      type: Date,
    },
    isBought: {
      type: Boolean,
      default: false,
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
  if (this.isBought) {
    this.set({ due_date: undefined });
  }

  next();
});

const BorrowRecord = mongoose.model('Borrow_Record', borrowRecordSchema);

module.exports = BorrowRecord;
