const httpStatus = require('http-status');
const moment = require('moment');
const PDFDocument = require('pdfkit');
const path = require('path');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { analystService } = require('../services');

const getAnalysts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['time', 'from', 'to']);
  const analyst = await analystService.getAnalysts(filter);
  res.status(httpStatus.OK).json({
    status: 'success',
    data: analyst,
  });
});

const getTopSellerBooks = catchAsync(async (req, res) => {
  const topSellerBooks = await analystService.getTopSellerBooks();
  res.status(httpStatus.OK).json({
    status: 'success',
    data: topSellerBooks,
  });
});

const getTopBadBooks = catchAsync(async (req, res) => {
  const topBadBooks = await analystService.getTopBadBooks();
  res.status(httpStatus.OK).json({
    status: 'success',
    data: topBadBooks,
  });
});

const exportsAnalysts = catchAsync(async (req, res) => {
  const filter = pick(req.body, ['from', 'to']);
  const statistics = await analystService.exportsAnalysts(filter);
  const { issuer = 'Dang Duc Duy' } = req.body;
  const issueDate = moment().format('DD/MM/YYYY');
  const issueTime = moment().format('DD/MM/YYYY HH:mm');

  const doc = new PDFDocument({ margin: 50 });
  const fileName = `Thong_ke_bao_cao_${issuer}_ngay_${issueDate}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

  doc.pipe(res);
  doc.registerFont('Roboto', path.join(__dirname, '../assets/fonts', 'Roboto-Light.ttf'));
  doc.font('Roboto');

  doc.fontSize(18).text('MERCHIZE BOOK STORE', { align: 'center' });
  doc.fontSize(11).text('https://merchize-book-store.com.vn', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text('BÁO CÁO THỐNG KÊ', { align: 'center', underline: true });
  doc.moveDown(2);

  doc.fontSize(12).text(`Người xuất: ${issuer}`, { continued: true });
  doc.text(`Ngày xuất: ${issueDate}`, { align: 'right' });
  doc.moveDown();
  doc
    .fontSize(12)
    .text(
      `Thời gian thống kê: từ ${moment(filter.from).format('DD/MM/YYYY')} đến ${
        filter.to ? moment(filter.to).format('DD/MM/YYYY') : issueDate
      }`
    );
  doc.moveDown();

  doc
    .fontSize(12)
    .text(
      '--------------------------------------------------------------------------------------------------------------------------------'
    );
  doc.fontSize(12).text(`Tổng số đơn mua/mượn sách: ${statistics.totalBooks}`, { lineGap: 12 });
  doc.fontSize(12).text(`Tổng doanh thu: $${statistics.totalRevenue}`, { lineGap: 12 });
  doc.fontSize(12).text(`Tổng số người dùng mới: ${statistics.totalUsers}`, { lineGap: 12 });
  doc
    .fontSize(12)
    .text(
      '--------------------------------------------------------------------------------------------------------------------------------'
    );
  doc.moveDown();

  doc.fontSize(10).text(`Giờ xuất: ${issueTime}`, { align: 'right' });
  doc.moveDown();

  doc.fontSize(12).text('Người xuất báo cáo', { align: 'right' });
  doc.fontSize(10).text('(Ký cả họ và tên)', { align: 'right' });

  doc.end();
});

module.exports = {
  getAnalysts,
  getTopSellerBooks,
  getTopBadBooks,
  exportsAnalysts,
};
