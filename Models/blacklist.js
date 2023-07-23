const mongoose = require("mongoose");
const BlacklistSchema = mongoose.Schema(
  {
    blacklist: {
      type: String,
    },
  },
  { versionKey: false }
);

const BlacklistModel = mongoose.model("blacklist", BlacklistSchema);

module.exports = {
  BlacklistModel,
};
