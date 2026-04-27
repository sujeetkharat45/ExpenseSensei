const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  mobile: { type: String, required: true },
  limit: { type: Number, default: 0 },
  otp: { type: String, default: null },        // ✅ inside schema
  otpExpiry: { type: Date, default: null }      // ✅ inside schema
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);