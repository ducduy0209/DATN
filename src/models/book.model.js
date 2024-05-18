const slugify = require('slugify');
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { enumDuration } = require('../constants');

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
    genres: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Genre',
      },
    ],
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
          enum: enumDuration,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    languange: {
      type: String,
      default: 'en',
      enum: ['en', 'vi'],
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    // price of duration 1 month to sort
    price: {
      type: Number,
    },
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
  this.slug = slugify(this.title, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
  });
  const oneMonthPrice = this.prices.find((price) => price.duration === '1 month');
  if (oneMonthPrice) {
    this.price = oneMonthPrice.price;
  } else {
    this.price = 0;
  }
  next();
});

bookSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'genres',
    select: 'name priority slug',
  });

  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
