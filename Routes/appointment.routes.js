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

    const stylistId = req.stylistID;

    // const appointments = await AppointmentModel.find({
    //   stylistId: "648e95f137b1838d156af177",
    // });

    const appointments = await AppointmentModel.find({
      stylistId,
      status: { $in: ["pending", "cancelled", "rejected"] },
      date: { $regex: `^${currentDate}` },
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
    const totalCount = await AppointmentModel.countDocuments({
      stylistId,
      $or: [{ status: "completed" }, { status: "accepted" }],
    });

    const result1 = await AppointmentModel.aggregate([
      {
        $match: {
          stylistId,
          status: { $in: ["accepted", "completed"] },
        },
      },
      {
        $lookup: {
          from: "Services",
          localField: "serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      {
        $unwind: "$service",
      },
      {
        $group: {
          _id: null,
          totalEarned: { $sum: "$service.pricing" },
        },
      },
    ]);

    const totalEarned = result1.length > 0 ? result1[0].totalEarned : 0;

    const result = await AppointmentModel.aggregate([
      {
        $match: {
          stylistId: mongoose.Types.ObjectId(stylistId),
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$customerId",
        },
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
        },
      },
    ]);

    const totalCustomers = result.length > 0 ? result[0].totalCustomers : 0;
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
