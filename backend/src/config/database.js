const mongoose = require('mongoose');
const config = require('./index');

async function connectDatabase() {
  await mongoose.connect(config.mongodbUri);
  console.log('MongoDB connected');
}

module.exports = { connectDatabase };
