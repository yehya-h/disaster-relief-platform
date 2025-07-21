const mongoose = require("mongoose");
const locationType = require("./locationType");

// image, description, location, timestamp, reporterIds, typeId, severity, fakeReports, isFake, confirmationFlags
const incidentSchema = mongoose.Schema({
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
        default: Date.now
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
        enum: ['low', 'medium', 'high'],
        required: true,
    },
    fakeReports: [{  // Array of users who reported this as fake
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isFake: {
        type: Boolean,
        default: false
    },
    confirmationFlags: [{  // Array of users who confirmed it's real
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { 
    toJSON: { virtuals: true }  // Ensure virtuals are included in responses
});

// Virtuals
incidentSchema.virtual('fakeReportsCount').get(function() {
    return this.fakeReports.length;
});

incidentSchema.virtual('confirmationCount').get(function() {
    return this.confirmationFlags.length;
});

// Indexes
incidentSchema.index({ 'location.coordinates': '2dsphere' });
incidentSchema.index({ fakeReports: 1 });
incidentSchema.index({ confirmationFlags: 1 });

// Example middleware to auto-mark as fake if threshold reached
incidentSchema.post('save', async function(doc) {
    if (doc.fakeReportsCount >= 5 && doc.fakeReportsCount > (1.5 * doc.confirmationCount) && doc.isFake !== true) {
      doc.isFake = true;
      await doc.save();
    }   
  });

module.exports = mongoose.model("Incident", incidentSchema);