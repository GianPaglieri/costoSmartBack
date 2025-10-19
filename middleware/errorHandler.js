module.exports = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Server error';

  const payload = { error: message };
  if (err.code) {
    payload.code = err.code;
  }
  if (err.details) {
    payload.details = err.details;
  }

  res.status(status).json(payload);
};
