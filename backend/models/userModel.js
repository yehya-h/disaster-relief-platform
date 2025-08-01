const mongoose = require("mongoose");

// fname, lname, email, password, role, incidentIds, fakeReports
const userSchema = mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      trim: true,
    },
    lname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      required: true,
    },
    emailVerified: { 
      type: Boolean, 
      default: false 
    },
    resendCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 3
    },
    lastResendTime: {
      type: Date,
      default: null
    },
    firebaseUid: {
      type: String,
      required: false,
    },
  },
  {
    toJSON: { virtuals: true }, // Ensure virtuals are included in responses
  }
);

userSchema.virtual("fakeReportsCount", {
  ref: "Report",
  localField: "_id",
  foreignField: "reporterId",
  match: { reportType: "fake" },
  count: true,
});

module.exports = mongoose.model("User", userSchema);

//json format example
// {
// "fname": "John",
// "lname": "Doe",
// "email": "john.doe@example.com",
// "password": "password",
// "role": 0
// }
