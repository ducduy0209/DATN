const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const shortid = require('shortid');
const catchAsync = require('../utils/catchAsync');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image file. Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadBannerPhoto = upload.single('image');

const resizeBannerPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `banner-${shortid.generate()}-${Date.now()}.jpeg`;
  const fullPath = path.join(__dirname, '../', 'public', 'img', 'banners', req.file.filename);
  await sharp(req.file.buffer).resize(399, 105).toFormat('jpeg').jpeg({ quality: 92 }).toFile(fullPath);

  req.body.image = req.file.filename;
  next();
});

module.exports = {
  uploadBannerPhoto,
  resizeBannerPhoto,
};
