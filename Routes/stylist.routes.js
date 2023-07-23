const express = require("express");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const StylistModel = require("../Models/stylist");
const stylistAuth = require("../Middlewares/stylistaAuth");
// const { BlacklistModel } = require("../Models/Blacklist");

require("dotenv").config();
const stylistRouter = express.Router();

//-------------------------- Register New stylist -----------------------------------

stylistRouter.post("/register", async (req, res) => {
  try {
    let { name, email, phone, password, image, salonName, address, bio } =
      req.body;

    const existingUser = await StylistModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already registered Please Login" });
    }

    const hashedPassword = await bcrypt.hash(password, 5);
    req.body.password = hashedPassword;
    const newUser = new StylistModel({
      name,
      email,
      phone,
      password: hashedPassword,
      image,
      salonName,
      address,
      bio,
      otp: "1234",
      isEmailVerified: true,
    });

    const savedUser = await newUser.save();

    return res.status(201).json({
      message:
        "Stylist registered successfully. Please check your email for the OTP.",

      stylist: {
        id: savedUser._id,
        name,
        email,
        phone,
        image,
        salonName,
        address,
      },
    });
  } catch (error) {
    console.error("Error registering stylist:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

stylistRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const stylist = await StylistModel.findOne({ email });
    if (!stylist) {
      return res.status(404).json({ message: "stylist not found" });
    }

    const isPasswordValid = bcrypt.compare(password, stylist.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { stylistId: stylist._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      stylist: {
        id: stylist._id,
        name: stylist.name,
        email: stylist.email,
        phone: stylist.phone,
        image: stylist.image,
        salonName: stylist.salonName,
        address: stylist.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
    console.log(
      " ---------------------------errorr from stylist login---------------",
      error
    );
  }
});

stylistRouter.use(stylistAuth);

// ------------------------- stylist  profile  --------------------------

stylistRouter.get("/profile", async (req, res) => {
  try {
    const stylistId = req.stylistID;
    const stylist = await StylistModel.findById(stylistId);

    if (!stylist) {
      return res.status(404).json({ message: "stylist not found" });
    }

    let { _id, name, email, phone, image, salonName, address } = stylist;
    return res
      .status(200)
      .json({ _id, name, email, phone, image, salonName, address });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// stylistRouter.post("/logout", async (req, res) => {
//   const { token } = req.body;

//   const newBlacklistedToken = new BlacklistModel({ blacklist: token });
//   await newBlacklistedToken.save();

//   res.json({ message: "Token revoked successfully" });
// });

// -----------------------get all stylists ----------------------------
stylistRouter.get("/allstylist", async (req, res) => {
  try {
    const stylists = await StylistModel.find();

    res.json(stylists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = stylistRouter;
