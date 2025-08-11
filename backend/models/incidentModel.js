const mongoose = require("mongoose");

// lastUpdated, isFake
const incidentSchema = mongoose.Schema(
  {
    // lastUpdated: {
    //   type: Date,
    //   default: Date.now,
    //   index: -1,
    // },
    isFake: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, // Ensure virtuals are included in responses
    timestamps: true,
  }
);

// Virtuals
incidentSchema.virtual("fakeReportsCount", {
  ref: "Report",
  localField: "_id",
  foreignField: "incidentId",
  match: { reportType: "fake" },
  count: true,
});

incidentSchema.virtual("confirmationCount", {
  ref: "Report",
  localField: "_id",
  foreignField: "incidentId",
  match: { reportType: "confirmed" },
  count: true,
});

// Example middleware to auto-mark as fake if threshold reached
incidentSchema.post("save", async function (doc) {
  if (
    doc.fakeReportsCount >= 5 &&
    doc.fakeReportsCount > 1.5 * doc.confirmationCount &&
    doc.isFake !== true
  ) {
    // Use updateOne to avoid triggering middleware
    await this.constructor.updateOne(
      { _id: doc._id }, 
      { isFake: true }
    );
  }
});

module.exports = mongoose.model("Incident", incidentSchema);
