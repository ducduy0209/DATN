const express = require('express');
// const paypal = require('../../config/paypal');
// const logger = require('../../config/logger');
// const auth = require('../../middlewares/auth');
// const validate = require('../../middlewares/validate');
// const bookValidation = require('../../validations/book.validation');
// const bookController = require('../../controllers/book.controller');

const router = express.Router();
/*
router.get('/pay', (req, res) => {
  const createPaymentJson = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'http://localhost:3000/v1/users/success',
      cancel_url: 'http://localhost:3000/v1/users/cancel',
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: 'item',
              sku: 'item',
              price: '25',
              currency: 'USD',
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: 'USD',
          total: '25.00',
        },
        description: 'This is the payment description.',
      },
    ],
  };

  paypal.payment.create(createPaymentJson, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i += 1) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

router.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const { paymentId } = req.query;

  const executePaymentJson = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: 'USD',
          total: '25.00',
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, executePaymentJson, function (error, payment) {
    if (error) {
      logger.error(error.response);
      throw error;
    } else {
      logger.log({ payment });
      // Cập nhật số dư cho người dùng ở đây
      res.send('Thanh toán thành công');
    }
  });
});

router.get('/cancel', (req, res) => res.send('Thanh toán bị hủy'));
*/
module.exports = router;
