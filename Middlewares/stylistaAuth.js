const jwt = require("jsonwebtoken");

const StylistModel = require("../Models/stylist");

const { UserInfo } = require("../Models/user.model");
// const { BlacklistModel } = require("../Models/Blacklist");
require("dotenv").config();
const stylistAuth = async (req, res, next) => {
  try {
    const blacklist = req.headers.authorization.split(" ")[1];
    console.log("token from headers", blacklist);
    // const isblacklisted = await BlacklistModel.findOne({ blacklist });
    const isblacklisted = false;
    if (isblacklisted) {
      return res.status(400).json({ message: "Invalid Token" });
    }
    const decoded = jwt.verify(blacklist, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return res.status(400).json({ error: "Invalid Token" });
    }
    let model = StylistModel;
    if (req.path.includes("user")) {
      console.log("path---------------------", req.path);
      model = UserInfo;
    }
    const stylist = await model.findById(decoded.stylistId);

    if (!stylist) {
      return res.status(401).json({ error: "user not found" });
    }

    req.stylistID = stylist._id;
    req.userID = stylist._id;

    console.log("user id------>", req.stylistID);

    next();
  } catch (error) {
    console.log(
      "error from stylist auth--------------------------------------------------------- ",
      error
    );
    return res.status(400).json({ error: "Invalid Token" });
  }
};

module.exports = stylistAuth;

// console.log(process.env.JWT_SECRET_KEY);
