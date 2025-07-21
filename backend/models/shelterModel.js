const mongoose = require("mongoose");
const locationType = require("./locationType");

// title, location, capacity
const shelterSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    location: {
        type: locationType,
        required: true,
    },  
    capacity: {
        type: Number,
        required: true,
    },
});

// Create geospatial index
shelterSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model("Shelter", shelterSchema);