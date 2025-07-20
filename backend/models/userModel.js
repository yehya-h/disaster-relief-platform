const mongoose = require("mongoose");
const locationType = require("./locationType");

// fname, lname, email, password, locations, role, incidentIds, fakeReports
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
    locations: {
        type: [locationType],
        required: true,
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'At least one location is required'
        }
    },
    role: {
        type: Number,
        required: true,
    },
    incidentIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Incident",
        required: false,
    },
    fakeReportsCount: {
        type: Number,
        default: 0,
    }
});

// Create geospatial index
userSchema.index({ 'locations.coordinates': '2dsphere' });

module.exports = mongoose.model("User", userSchema);