const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.log('MongoDB Connected: ' + conn.connection.host);
    return conn;
  } catch (error) {
    logger.error('MongoDB Connection Error: ' + error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
