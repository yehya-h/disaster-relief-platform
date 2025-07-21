const mongoose = require("mongoose");
const locationType = require("./locationType");

// fname, lname, email, password, liveLocation, locations, role, incidentIds, fakeReports
const userSchema = mongoose.Schema({
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
    liveLocation: {
        type: locationType,
        required: true,
    },
    locations: {
        type: [locationType],
        required: false,
    },
    role: {
        type: Number,
        required: true,
    },
    fakeReportsCount: {
        type: Number,
        default: 0,
    }
});

// Create geospatial index
userSchema.index({ 'liveLocation.coordinates': '2dsphere' });
userSchema.index({ 'locations.coordinates': '2dsphere' });

module.exports = mongoose.model("User", userSchema);