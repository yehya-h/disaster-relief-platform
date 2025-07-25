const mongoose = require("mongoose");
const locationType = require("./locationType");

// userId, location, deviceId, timestamp

const liveLocationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    location: {
        type: locationType,
    },
    deviceId: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
})

liveLocationSchema.index({ location: "2dsphere" });
// delete after 60 minutes
// liveLocationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model("LiveLocation", liveLocationSchema);