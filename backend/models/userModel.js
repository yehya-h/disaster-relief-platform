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
    }
}, { 
    toJSON: { virtuals: true }  // Ensure virtuals are included in responses
});

// Create geospatial index
userSchema.index({ 'liveLocation.coordinates': '2dsphere' });
userSchema.index({ 'locations.coordinates': '2dsphere' });

userSchema.virtual('fakeReportsCount', {
    ref: 'Report',
    localField: '_id',
    foreignField: 'reporterId',
    match: { reportType: 'fake' },
    count: true
});

module.exports = mongoose.model("User", userSchema);

//json format example
// {
    // "fname": "John",
    // "lname": "Doe",
    // "email": "john.doe@example.com",
    // "password": "password",
    // "liveLocation": {
    //     "type": "Point",
    //     "coordinates": [123.456, 78.901]
    // },
    // "locations": [
    //     {
    //         "type": "Point",
    //         "coordinates": [123.456, 78.901]
    //     }
    // ],
    // "role": 0
// }