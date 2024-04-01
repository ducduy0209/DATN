const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },
    slug: {
      type: String,
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
    prices: [
      {
        duration: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

bookSchema.plugin(toJSON);
bookSchema.plugin(paginate);

bookSchema.statics.isISBNTaken = async function (isbn) {
  const book = await this.findOne({ isbn });
  return !!book;
};

bookSchema.pre('save', function (next) {
  this.slug = this.title
    .replace(/[^\w\s]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
