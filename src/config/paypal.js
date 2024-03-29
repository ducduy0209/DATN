// paypalConfig.js
const paypal = require('paypal-rest-sdk');

paypal.configure({
  mode: 'sandbox',
  client_id: 'AR6Up76bzBTOserQVqMFzeKe_O8STiwOaEo4gRAoYMEG1dyHz0w_IVczGnyV9CZ5vz-_VdxsmTquTlQ-',
  client_secret: 'EEwBvzb3tig5E0QhJifYD19MGywHZppkoApGvjrWl-UXnV5vyGS3B2xqqXeeGclgvMOGmMqaH3nDJcIt',
});

module.exports = paypal;
