const mongoose = require("mongoose");
const locationType = require("./locationType");

// liveLocation, lastActive
const guestSchema = mongoose.Schema({
    liveLocation: {
        type: locationType,
        required: true,
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
});

// Geospatial index for location queries
guestSchema.index({ 'liveLocation.coordinates': '2dsphere' });

// TTL index to auto-delete inactive guests after 30 days
guestSchema.index({ lastActive: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model("Guest", guestSchema);