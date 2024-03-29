const getMe = (req, res, next) => {
  req.params.userId = req.user._id;
  next();
};

module.exports = {
  getMe,
};
