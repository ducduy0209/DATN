const kue = require('kue');
// const { tokenService, emailService } = require('../services');
const logger = require('../config/logger');

const queue = kue.createQueue();

queue.process('send-verify-email', async (job, done) => {
  const { tokenService, emailService } = require('../services');
  const { user } = job.data;
  try {
    const token = await tokenService.generateVerifyEmailToken(user);
    await emailService.sendVerificationEmail(user.email, token);
    logger.info(`Job ${job.id} - send verify email completed`);
    done();
  } catch (error) {
    logger.error(`Error processing job: send verify email`, error);
    done(error);
  }
});

queue.process('send-forgot-password', async (job, done) => {
  const { tokenService, emailService } = require('../services');
  const { email } = job.data;
  try {
    const token = await tokenService.generateResetPasswordToken(email);
    await emailService.sendResetPasswordEmail(email, token);
    logger.info(`Job ${job.id} - send verify email completed`);
    done();
  } catch (error) {
    logger.error(`Error processing job: send forgot password`, error);
    done(error);
  }
});

module.exports = queue;
