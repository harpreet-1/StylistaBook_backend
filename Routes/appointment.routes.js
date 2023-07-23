const express = require("express");
const AppointmentModel = require("../Models/Appointment");
const stylistAuth = require("../Middlewares/stylistaAuth");
const apoointmentRouter = express.Router();

// POST /appointments/book----------------
apoointmentRouter.use(stylistAuth);

apoointmentRouter.post("/book/user", async (req, res) => {
  try {
    const { stylistId, serviceId, date, time, notes } = req.body;
    customerId = req.userID;

    const existingAppointment = await AppointmentModel.findOne({
      stylistId: stylistId,
      date: date,
      time: time,
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Appointment slot is already booked",
      });
    }
    const newAppointment = new AppointmentModel({
      customerId,
      stylistId,
      serviceId,
      date,
      time,
      notes,
    });

    const savedAppointment = await newAppointment.save();

    res.status(201).json({
      success: true,
      appointment: savedAppointment,
      message: "appointment booked successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "booking failed" });
    console.log("eroor from boooking appointment----------------------", error);
  }
});
// ---------------------- /today appointments for stylist/-------------------------

apoointmentRouter.get("/today/stylist", async (req, res) => {
  try {
    // Date object
    const date = new Date();

    let currentDay = String(date.getDate()).padStart(2, "0");

    let currentMonth = String(date.getMonth() + 1).padStart(2, "0");

    let currentYear = date.getFullYear();

    // we will display the date as DD-MM-YYYY

    let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;

    console.log("The current date is " + currentDate);

    const { stylistId } = req.stylistId;

    // const appointments = await AppointmentModel.find({
    //   stylistId: "648e95f137b1838d156af177",
    // });
    const appointments = await AppointmentModel.find({
      stylistId,
      status: { $in: ["pending", "cancelled", "rejected"] },
      date: currentDate,
    })
      .sort({
        date: 1,
        time: 1,
      })
      .populate("customerId")
      .populate("serviceId")
      .populate("stylistId");

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// ---------------------- /appointments requests for stylist/-------------------------

apoointmentRouter.get("/requests/stylist", async (req, res) => {
  try {
    const { stylistId } = req.stylistId;

    // const appointments = await AppointmentModel.find({
    //   stylistId: "648e95f137b1838d156af177",
    // });
    const appointments = await AppointmentModel.find({
      stylistId,
      status: { $in: ["pending", "cancelled", "rejected"] },
    })
      .sort({
        date: 1,
        time: 1,
      })
      .populate("customerId")
      .populate("serviceId")
      .populate("stylistId");

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// ---------------------- /all appointments for stylist/-------------------------

apoointmentRouter.get("/stylist", async (req, res) => {
  try {
    const { stylistId } = req.stylistId;

    const appointments = await AppointmentModel.find({
      stylistId,
      status: { $in: ["completed", "accepted", "expired"] },
    })
      .sort({
        date: 1,
        time: 1,
      })
      .populate("customerId")
      .populate("serviceId")
      .populate("stylistId");

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// ---------------------- /update appointments status from stylist/-------------------------

apoointmentRouter.put("/status/:appointmentID", async (req, res) => {
  try {
    const appointmentID = req.params.appointmentID;
    const { status } = req.body;

    // Find the appointment by ID and update the status
    const appointment = await AppointmentModel.findByIdAndUpdate(
      appointmentID,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------- /remove appointments for stylist/-------------------------
apoointmentRouter.delete("/:appointmentID", async (req, res) => {
  try {
    const appointmentID = req.params.appointmentID;

    // Find the appointment by ID and update the status
    const appointment = await AppointmentModel.findByIdAndDelete(appointmentID);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = apoointmentRouter;
