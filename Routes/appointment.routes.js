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
    const stylistId = req.stylistID;

    const date = new Date();
    date.setUTCHours(0, 0, 0, 0); // Set the time to midnight (00:00:00) for accurate comparison

    const appointments = await AppointmentModel.find({
      date: { $gte: date },
      date: { $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) },
      status: { $in: ["completed", "accepted", "expired"] },
    })
      .sort({ time: 1 }) // Sort appointments by time in ascending order
      .populate("customerId")
      .populate("serviceId")
      .populate("stylistId")
      .exec();

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// ---------------------- /appointments requests for stylist/-------------------------

apoointmentRouter.get("/requests/stylist", async (req, res) => {
  try {
    const stylistId = req.stylistID;

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
    const stylistId = req.stylistID;
    console.log(
      "----------------------------i am in app/stylist------------------------------------------",
      stylistId
    );

    const appointments = await AppointmentModel.find({
      stylistId: stylistId,
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
      { status }
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

apoointmentRouter.get("/highlights", async (req, res) => {
  try {
    const stylistId = req.stylistID;
    console.log("-------------stylist id---------", stylistId);
    const totalCount = await AppointmentModel.countDocuments({
      stylistId,
      $or: [{ status: "completed" }, { status: "accepted" }],
    });

    const result1 = await AppointmentModel.find({
      stylistId: stylistId,
      status: { $in: ["completed", "accepted"] },
    })
      .sort({
        date: 1,
        time: 1,
      })
      .populate("serviceId", "pricing");
    let totalEarned = 0;
    for (let i = 0; i < result1.length; i++) {
      totalEarned += result1[i].serviceId.pricing;
    }
    const appointments = await AppointmentModel.find({ stylistId });
    const uniqueCustomers = new Set(
      appointments.map((appointment) => appointment.customerId)
    );
    const totalCustomers = uniqueCustomers.size;

    console.log("Total customers for stylist:", totalCustomers);

    const pendingCount = await AppointmentModel.countDocuments({
      status: "pending",
    });

    res.status(200).json({
      appointments: totalCount,
      totalEarned,
      totalCustomers,
      pendingCount,
    });
  } catch (error) {
    console.log(
      "errrorrr from highlights--------------------------------------------------------------------",
      error
    );
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = apoointmentRouter;
