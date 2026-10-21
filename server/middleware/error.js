exports.notFound = (req, res) => res.status(404).json({ message: 'Route not found' });
exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500, message = err.message;
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  if (err.code === 11000) { status = 409; message = 'Already exists'; }
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 && process.env.NODE_ENV === 'production' ? 'Server error' : message });
};
exports.wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.httpError = (status, message) => Object.assign(new Error(message), { status });
