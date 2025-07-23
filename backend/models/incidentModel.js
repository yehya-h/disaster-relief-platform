const mongoose = require("mongoose");
const locationType = require("./locationType");

// image, description, location, timestamp, reporterIds, typeId, severity, fakeReports, isFake, confirmationFlags
const incidentSchema = mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: locationType,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    reporterIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
    typeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    isFake: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, // Ensure virtuals are included in responses
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

// Indexes
incidentSchema.index({ location: "2dsphere" });

// Example middleware to auto-mark as fake if threshold reached
incidentSchema.post("save", async function (doc) {
  if (
    doc.fakeReportsCount >= 5 &&
    doc.fakeReportsCount > 1.5 * doc.confirmationCount &&
    doc.isFake !== true
  ) {
    doc.isFake = true;
    await doc.save();
  }
});

module.exports = mongoose.model("Incident", incidentSchema);
