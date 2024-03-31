const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const priceSchema = new mongoose.Schema({
  duration: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: 'text',
    },
    slug: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },
    published_date: {
      type: Date,
      default: Date.now(),
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
    },
    genre: {
      type: Array,
      required: [true, 'The genre field is required.'],
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    cover_image: {
      type: String,
      required: true,
    },
    available_copies: {
      type: Number,
      default: 0,
    },
    amount_borrowed: {
      type: Number,
      default: 0,
    },
    access_times: {
      type: Number,
      default: 0,
    },
    total_book_pages: {
      type: Number,
      required: true,
    },
    digital_content: {
      type: String,
      required: true,
    },
    prices: [priceSchema],
  },
  { timestamps: true }
);

bookSchema.plugin(toJSON);
bookSchema.plugin(paginate);

bookSchema.pre('save', (next) => {
  if (this.title) this.slug = this.title.toLowerCase().split(' ').join('-');

  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
