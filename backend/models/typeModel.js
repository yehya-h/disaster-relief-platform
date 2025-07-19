const mongoose = require("mongoose");

// name, safetyTips
const typeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    safetyTips: {
        type: [String],
        required: true,
    }
});

module.exports = mongoose.model("Type", typeSchema);