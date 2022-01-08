const mongoose = require("mongoose");

//creating the user messages schema
const notificationsSchema = new mongoose.Schema(
  {
    message: { title: String, message: String },
    read: { type: Boolean, default: false },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["success", "alert", "regular", "read"],
      default: "regular",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    read_at: { type: Date, default: Date.now },
    url: { type: String },
  },
  {
    timestamps: true,
  }
);

const Notifications = mongoose.model("Notifications", notificationsSchema);
module.exports = Notifications;
