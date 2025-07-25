const mongoose = require("mongoose");
const locationType = require("./locationType");

// userId, location
const userLocationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    location: {
        type: locationType,
    }
})

userLocationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("UserLocation", userLocationSchema);