const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const analystSchema = new mongoose.Schema(
  {
    book_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Book',
    },
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    price: {
      type: Number,
    },
    duration: {
      type: String,
    },
  },
  { timestamps: true }
);

analystSchema.plugin(toJSON);
analystSchema.plugin(paginate);

analystSchema.pre(/^find/, function (next) {
  this.populate('book_id');

  next();
});

const Analyst = mongoose.model('Analyst', analystSchema);

module.exports = Analyst;
