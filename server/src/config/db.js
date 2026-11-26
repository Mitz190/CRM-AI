const mongoose = require('mongoose');
const { mongoUri } = require('./env');

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;