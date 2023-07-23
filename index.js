const express = require("express");
const cors = require("cors");

require("dotenv").config();

const { connection } = require("./Configs/db");

const userRoutes = require("./Routes/user.routes");
const stylistRouter = require("./Routes/stylist.routes");
const serviceRouter = require("./Routes/service.routes");
const stylistAuth = require("./Middlewares/stylistaAuth");
const apoointmentRouter = require("./Routes/appointment.routes");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/user", userRoutes);
app.use("/stylist", stylistRouter);
app.use("/service", serviceRouter);
app.use("/service", serviceRouter);
app.use("/app", apoointmentRouter);
app.get("/user/check", stylistAuth);
app.get("/", (req, res) => {
  res.send("hello from server");
});
app.get("/stylistauth", stylistAuth, (req, res) => {
  res.json({ message: "login hai" });
});

const Port = process.env.Port || 8000;
console.log(new Date("2023-07-30T00:00:00.000Z"));
app.listen(Port, async (req, res) => {
  try {
    await connection;

    console.log(`DB connected. `);
  } catch (error) {
    console.log(error);
  }

  console.log(`server is running on port ${Port}`);
});
