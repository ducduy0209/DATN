const multer = require('multer');
const path = require('path');
const shortid = require('shortid');
const fs = require('fs');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Not a valid file type. Please upload only images or PDF files.'), false);
    }
  },
});

const uploadFiles = upload.fields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'digital_content', maxCount: 1 },
]);

const resizeBookPhoto = catchAsync(async (req, res, next) => {
  if (req.files.cover_image) {
    const file = req.files.cover_image[0];
    file.filename = `book-${shortid.generate()}-${Date.now()}.jpeg`;

    const fullPath = path.join(__dirname, '../', 'public', 'img', 'books', file.filename);
    await sharp(file.buffer).resize(286, 406).toFormat('jpeg').jpeg({ quality: 92 }).toFile(fullPath);
    req.body.cover_image = file.filename;
  }

  next();
});

const saveBookPDF = catchAsync(async (req, res, next) => {
  if (req.files.digital_content) {
    const file = req.files.digital_content[0];
    file.filename = `user-${req.user.id}-${Date.now()}.pdf`;

    const fullPath = path.join(__dirname, '../', 'public', 'docs', file.filename);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(fullPath, file.buffer);
    req.body.digital_content = file.filename;
  }

  next();
});

module.exports = {
  uploadFiles,
  resizeBookPhoto,
  saveBookPDF,
};
