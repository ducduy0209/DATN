const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');

const getMe = (req, res, next) => {
  req.params.userId = req.user._id;
  next();
};

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

const uploadUserPhoto = upload.single('image');

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  const fullPath = path.join(__dirname, '../', 'public', 'img', 'users', req.file.filename);
  await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 92 }).toFile(fullPath);

  next();
});

module.exports = {
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
};
