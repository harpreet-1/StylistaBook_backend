const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  customerId: {
    type: String,
    ref: "user",
    required: true,
  },
  stylistId: {
    type: String,
    ref: "Stylist",
    required: true,
  },

  serviceId: {
    type: String,
    ref: "Service",
    required: true,
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: [
      "pending",
      "completed",
      "accepted",
      "cancelled",
      "rejected",
      "expired",
    ],
    default: "pending",
  },
  notes: { type: String },
});

const AppointmentModel = mongoose.model("Appointment", appointmentSchema);

module.exports = AppointmentModel;
