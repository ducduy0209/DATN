const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 * @returns {Promise}
 */
const sendEmail = async (to, subject, html) => {
  const msg = { from: config.email.from, to, subject, html };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Quên Mật khẩu';
  const resetPasswordUrl = `http://localhost:3002/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Quên mật khẩu</h2>
      <p>Kính gửi bạn,</p>
      <p>Để lấy lại mật khẩu của bạn, hãy ấn voà nút bên dưới:</p>
      <a href="${resetPasswordUrl}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Lấy lại mật khẩu</a>
      <p>Nếu không phải bạn quên mật khẩu, hãy bỏ qua email này! Xin cảm ơn</p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Xác Nhận Tài Khoản Của Bạn';
  const verificationEmailUrl = `http://localhost:3002/verify-account?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Xác nhận email</h2>
      <p>Kính gửi bạn,</p>
      <p>Để xác nhận tài khoản của bạn hãy ấn vào núi bên dưới:</p>
      <a href="${verificationEmailUrl}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Xác nhận tài khoản</a>
      <p>Nếu không phải bạn tạo tài khoản, hãy bỏ qua email này! Xin cảm ơn</p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
