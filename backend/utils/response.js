const sendSuccess = (res, data = {}, statusCode = 200) => {
  res.status(statusCode).json(data);
};

const sendMessage = (res, message, statusCode = 200, extra = {}) => {
  res.status(statusCode).json({ message, ...extra });
};

module.exports = {
  sendSuccess,
  sendMessage,
};
