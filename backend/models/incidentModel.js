const mongoose = require("mongoose");
const locationType = require("./locationType");

// image, description, location, timestamp, userId, type, severity, likes, dislikes
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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
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
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    dislikes: {
        type: Number,
        default: 0,
    }
});

// Create geospatial index
incidentSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model("Incident", incidentSchema);