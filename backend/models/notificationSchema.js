const mongoose = require("mongoose");

// userId, incidentId, notificationType
const notificationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    incidentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Incident",
        required: true,
        index: true
    },
    notificationType: {
        type: String,
        enum: ['nearby_incident', 'fake_report_update', 'incident_resolved'],
        required: true
    }
});

module.exports = mongoose.model("Notification", notificationSchema);