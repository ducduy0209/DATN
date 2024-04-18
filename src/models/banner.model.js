const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const bannerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    due_date: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

bannerSchema.plugin(toJSON);
bannerSchema.plugin(paginate);

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
