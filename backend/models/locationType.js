const mongoose = require('mongoose');

const locationType = new mongoose.Schema({
    type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
        required: true
    },
    name: {
        type: String,
        trim: true
    },
    coordinates: {
        type: [Number],  // [longitude, latitude]
        required: true,
        validate: {
            validator: function (v) {
                return v.length === 2 &&
                    v[0] >= -180 && v[0] <= 180 &&
                    v[1] >= -90 && v[1] <= 90;
            },
            message: props => `${props.value} is not valid [longitude, latitude]`
        }
    }
}, { _id: false }); // Disable automatic _id for subdocuments

module.exports = locationType;