const mongoose = require("mongoose");
const locationType = require("./locationType");

// location, lastActive
const guestSchema = mongoose.Schema({
    location: {
        type: locationType,
        required: true,
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
});

// Geospatial index for location queries
guestSchema.index({ 'location.coordinates': '2dsphere' });

// TTL index to auto-delete inactive guests after 30 days
guestSchema.index({ lastActive: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model("Guest", guestSchema);