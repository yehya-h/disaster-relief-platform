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

//json format example with different safety tips
// {
//     "name": "Fire",
//     "safetyTips": ["Stay calm", "Call 911", "Get out of the building", "Stay in a safe place"]
// }
