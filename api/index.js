const mongoose = require('mongoose');

let app = null;

module.exports = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    if (!app) {
      app = require('../server/app');
    }
    app(req, res);
  } catch (err) {
    console.error('[serverless] crash:', err.message, err.stack);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};
