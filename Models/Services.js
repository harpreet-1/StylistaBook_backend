const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  duration: { type: Number },
  pricing: { type: Number },
  stylistId: {
    type: String,
    ref: "Stylist",
    required: true,
  },
  image: String,
  category: String,
});

const ServiceModel = mongoose.model("Service", serviceSchema);

module.exports = ServiceModel;
