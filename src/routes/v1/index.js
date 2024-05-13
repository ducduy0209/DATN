const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const bookRoute = require('./book.route');
const reviewRoute = require('./review.route');
const cartRoute = require('./cart.route');
const analystRoute = require('./analyst.route');
const genreRoute = require('./genre.route');
const bannerRoute = require('./banner.route');
const couponRoute = require('./coupon.route');
const affiliateRoute = require('./affiliate.route');
const docsRoute = require('./docs.route');
const borrowRecordRoute = require('./borrow_record.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/books',
    route: bookRoute,
  },
  {
    path: '/borrow-records',
    route: borrowRecordRoute,
  },
  {
    path: '/carts',
    route: cartRoute,
  },
  {
    path: '/reviews',
    route: reviewRoute,
  },
  {
    path: '/genres',
    route: genreRoute,
  },
  {
    path: '/banners',
    route: bannerRoute,
  },
  {
    path: '/affiliates',
    route: affiliateRoute,
  },
  {
    path: '/coupons',
    route: couponRoute,
  },
  {
    path: '/analysts',
    route: analystRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
