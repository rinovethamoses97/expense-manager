const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '1.0.0.1']);

const mongoose = require('mongoose');
const app = require('../server/app');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
  }
  return app(req, res);
};
