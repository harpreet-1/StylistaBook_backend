const mongoose = require("mongoose");

const stylistSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, unique: true },
  image: String,
  salonName: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  isEmailVerified: { type: Boolean, default: false },
});

const StylistModel = mongoose.model("Stylist", stylistSchema);
module.exports = StylistModel;
